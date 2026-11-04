/**
 * <sf-icon> — Sci-fi icon component
 *
 * Renders icons from:
 * 1. the module-local icon sets — static paths (sf-icons.ts) and animated
 *    templates (sf-weather-icons.ts) — for sci: / sf: names
 * 2. string paths found in window.customIcons[prefix] (never a foreign template)
 * 3. HA native MDI registry (via icon-cache.ts) — for mdi: icons
 *
 * Light DOM on purpose (createRenderRoot, declared exception to AP#3 in Spec 04).
 * <sci-icon> is a subclass: tag plus the iconClass / logPrefix hooks only.
 *
 * Anti-patterns avoided (CRITICAL-01):
 * - Never fetches from unpkg/jsdelivr CDN
 * - Always falls back gracefully (mdi:help-circle placeholder)
 */

import { LitElement, html, svg, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { resolveIcon, getSyncCache, ICON_NOT_FOUND, type HassIconConnection } from './icon-cache.js';
import CUSTOM_ICONS from './data/sf-icons.js';
import WEATHER_ICONS from './data/sf-weather-icons.js';
import { ownValue } from './icon-names.js';
import { scopeSvgIds } from './svg-id-scope.js';

let instanceCount = 0;

/** Global augmentation for window.customIcons */
declare global {
  interface Window {
    // Values are icon-name -> path strings; sf-iconset.ts also hangs non-enumerable helper functions on .sci.
    customIcons?: Record<string, Record<string, unknown>>;
  }
}

/**
 * Seeds the static icon paths into window.customIcons.sf / .sci (idempotent).
 * Animated weather templates are NOT put there: the page-global object is
 * writable by anyone, so nothing in it is ever rendered as a template.
 */
function ensureCustomIcons(): void {
  if (typeof window === 'undefined') return;
  window.customIcons = window.customIcons || {};
  for (const prefix of ['sf', 'sci']) {
    // Filled in place: sf-iconset.ts hangs non-enumerable helpers (getIcon, getIconList)
    // on this very object, and replacing it would drop them whatever the import order.
    const map = (window.customIcons[prefix] ??= {});
    if (ownValue(map, 'stove') === undefined) Object.assign(map, CUSTOM_ICONS);
  }
}

ensureCustomIcons();

/**
 * Built-in names first (sci: / sf: only), each by OWN key: a static path, then
 * a weather template. Then a string path under window.customIcons[prefix], by
 * own key. Any other foreign value is ignored.
 */
function lookupCustomIcon(prefix: string, name: string): string | TemplateResult | undefined {
  if (prefix === 'sci' || prefix === 'sf') {
    const builtIn = ownValue<string | TemplateResult>(CUSTOM_ICONS, name) ?? ownValue<TemplateResult>(WEATHER_ICONS, name);
    if (builtIn) return builtIn;
  }
  // The prefix is looked up by own key too: `constructor:name` must not reach Object.name.
  const foreignMap = window.customIcons ? ownValue<unknown>(window.customIcons, prefix) : undefined;
  if (!foreignMap || typeof foreignMap !== 'object') return undefined;
  const foreign = ownValue<unknown>(foreignMap as Record<string, unknown>, name);
  return typeof foreign === 'string' && foreign ? foreign : undefined;
}

// Fallback path for mdi:help-circle when icon resolution fails
const FALLBACK_MDI_PATH =
  'M11.5,2C6.81,2 3,5.81 3,10.5S6.81,19 11.5,19H12V22C16.86,18.92 21,15.44 21,10.5C21,5.81 17.19,2 11.5,2M12.5,16.5H10.5V14.5H12.5V16.5M12.5,13H10.5C10.5,9.75 13.5,10 13.5,8C13.5,6.9 12.6,6 11.5,6C10.4,6 9.5,6.9 9.5,8H7.5C7.5,5.79 9.29,4 11.5,4C13.71,4 15.5,5.79 15.5,8C15.5,10.5 12.5,10.75 12.5,13Z';

const isTestEnv = (): boolean => {
  return typeof window === 'undefined' ||
    '__vitest_environment__' in window ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');
};

const isLiveHA = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isWorkbench = window.location.pathname.includes('workbench');
  return !isWorkbench && !isTestEnv();
};

@customElement('sf-icon')
export class SfIcon extends LitElement {
  /** CSS class of the rendered svg; the loading modifier is `<iconClass>--loading`. */
  protected get iconClass(): string {
    return 'sf-icon';
  }

  /** Prefix of every console message of this element. */
  protected get logPrefix(): string {
    return '[sf-icon]';
  }

  /** Icon string in format "prefix:name" e.g. "mdi:home" or "sf:radiator" */
  @property({ type: String })
  icon = '';

  @property({ attribute: false })
  connection?: HassIconConnection;

  @state()
  private _pathData: string | TemplateResult | null = null;

  @state()
  private _loading = false;

  /** Suffix of this instance's SVG ids — two animated icons in one light DOM never share one. */
  private readonly _idSuffix = `-sfi${++instanceCount}`;

  protected override updated(): void {
    if (typeof this._pathData === 'object' && this._pathData !== null) scopeSvgIds(this, this._idSuffix);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if ((changed.has('icon') || changed.has('connection')) && this.icon) {
      const [prefix, ...nameParts] = this.icon.split(':');
      const name = nameParts.join(':');
      const isHaIconRegistered = typeof customElements !== 'undefined' && customElements.get('ha-icon') !== undefined;
      const shouldRenderNative = prefix === 'mdi' && (isLiveHA() || isHaIconRegistered);

      if (shouldRenderNative) {
        // Skip async resolution, we'll render <ha-icon> natively
        this._pathData = null;
        return;
      }

      // Fast-path: synchronous lookup for custom icons (sci:/sf:) — avoids blank-flash
      ensureCustomIcons();
      const syncIcon = prefix ? lookupCustomIcon(prefix, name) : undefined;
      if (syncIcon) {
        this._pathData = syncIcon;
        return;
      }

      void this._resolveIcon();
    }
  }

  private async _resolveIcon(): Promise<void> {
    if (!this.icon) return;

    const [prefix, ...nameParts] = this.icon.split(':');
    const name = nameParts.join(':');

    if (!prefix || !name) {
      this._pathData = FALLBACK_MDI_PATH;
      return;
    }

    // 1. Custom namespaces (sci:/sf:/foreign string paths)
    ensureCustomIcons();
    const customPath = lookupCustomIcon(prefix, name);
    if (customPath) {
      this._pathData = customPath;
      return;
    }

    // 2. For MDI icons, use HA native registry (no CDN — CRITICAL-01)
    if (prefix === 'mdi') {
      const iconKey = `mdi:${name}`;
      const syncHit = getSyncCache(iconKey);
      if (syncHit !== undefined) {
        this._pathData = syncHit;
        return;
      }

      if (!this.connection) {
        console.warn(`${this.logPrefix} No hass connection provided for MDI icon fetch`);
        this._pathData = FALLBACK_MDI_PATH;
        return;
      }
      this._loading = true;
      const result = await resolveIcon(this.connection, iconKey, name);
      this._loading = false;

      if (result === ICON_NOT_FOUND) {
        console.warn(`${this.logPrefix} Icon '${iconKey}' not found in HA registry`);
        this._pathData = FALLBACK_MDI_PATH; // mdi:help-circle fallback
      } else {
        this._pathData = result;
      }
      return;
    }

    // 3. Unknown prefix — use fallback
    console.warn(`${this.logPrefix} Unknown icon namespace '${prefix}'`);
    this._pathData = FALLBACK_MDI_PATH;
  }

  override render(): TemplateResult | typeof nothing {
    const [prefix] = this.icon ? this.icon.split(':') : [''];
    const isHaIconRegistered = typeof customElements !== 'undefined' && customElements.get('ha-icon') !== undefined;
    const shouldRenderNative = prefix === 'mdi' && (isLiveHA() || isHaIconRegistered);

    if (shouldRenderNative) {
      return html`
        <ha-icon
          .icon="${this.icon}"
          style="
            --mdc-icon-size: var(--icon-width, 24px);
            width: var(--icon-width, 24px);
            height: var(--icon-height, 24px);
            color: var(--icon-color, currentColor);
            display: inline-block;
          "
        ></ha-icon>
      `;
    }

    if (this._loading) {
      return html`<svg viewBox="0 0 24 24" class="${this.iconClass} ${this.iconClass}--loading"></svg>`;
    }
    if (!this._pathData) return nothing;

    if (typeof this._pathData === 'object') {
      return this._pathData;
    }

    return html`
      <svg
        viewBox="0 0 24 24"
        class="${this.iconClass}"
        aria-hidden="true"
        style="width:var(--icon-width,24px);height:var(--icon-height,24px);fill:var(--icon-color,currentColor);display:block;"
      >
        ${svg`<path d="${this._pathData}" />`}
      </svg>
    `;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-icon': SfIcon;
  }
}
