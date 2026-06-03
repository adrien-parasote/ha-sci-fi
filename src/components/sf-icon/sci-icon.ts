/**
 * <sci-icon> — Public-facing sci-fi icon component
 *
 * Mirrors <sf-icon> exactly but registered under the "sci-icon" tag name.
 * This allows any Home Assistant component or custom dashboard card to use
 * sci-fi icons without depending on the internal sf-icon element:
 *
 *   <sci-icon icon="sci:stove"></sci-icon>
 *   <sci-icon icon="mdi:home"></sci-icon>
 *
 * Sizing and coloring via CSS custom properties:
 *   --icon-width  (default: 24px)
 *   --icon-height (default: 24px)
 *   --icon-color  (default: currentColor)
 *
 * This component was available before v1.0.0 and is restored here as a
 * first-class public export. It is identical in behaviour to <sf-icon>
 * since both are backed by the same SfIcon class.
 */

import { LitElement, html, svg, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { resolveIcon, getSyncCache, ICON_NOT_FOUND, type HassIconConnection } from './icon-cache.js';
import CUSTOM_ICONS from './data/sf-icons.js';
import WEATHER_ICONS from './data/sf-weather-icons.js';

// Ensure our icon data is registered at import time (idempotent)
if (typeof window !== 'undefined') {
  window.customIcons = window.customIcons || {};
  window.customIcons.sf = { ...window.customIcons.sf, ...CUSTOM_ICONS, ...WEATHER_ICONS };
  window.customIcons.sci = { ...window.customIcons.sci, ...CUSTOM_ICONS, ...WEATHER_ICONS };
}

// Fallback path for mdi:help-circle when icon resolution fails
const FALLBACK_MDI_PATH =
  'M11.5,2C6.81,2 3,5.81 3,10.5S6.81,19 11.5,19H12V22C16.86,18.92 21,15.44 21,10.5C21,5.81 17.19,2 11.5,2M12.5,16.5H10.5V14.5H12.5V16.5M12.5,13H10.5C10.5,9.75 13.5,10 13.5,8C13.5,6.9 12.6,6 11.5,6C10.4,6 9.5,6.9 9.5,8H7.5C7.5,5.79 9.29,4 11.5,4C13.71,4 15.5,5.79 15.5,8C15.5,10.5 12.5,10.75 12.5,13Z';

const isTestEnv = (): boolean =>
  typeof window === 'undefined' ||
  '__vitest_environment__' in window ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');

const isLiveHA = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isWorkbench = window.location.pathname.includes('workbench');
  return !isWorkbench && !isTestEnv();
};

@customElement('sci-icon')
export class SciIcon extends LitElement {
  /** Icon string in format "prefix:name" e.g. "mdi:home" or "sci:radiator" */
  @property({ type: String })
  icon = '';

  @property({ attribute: false })
  connection?: HassIconConnection;

  @state()
  private _pathData: string | TemplateResult | null = null;

  @state()
  private _loading = false;

  override willUpdate(changed: Map<string, unknown>): void {
    if ((changed.has('icon') || changed.has('connection')) && this.icon) {
      const [prefix, ...nameParts] = this.icon.split(':');
      const name = nameParts.join(':');
      const isHaIconRegistered =
        typeof customElements !== 'undefined' && customElements.get('ha-icon') !== undefined;
      const shouldRenderNative = prefix === 'mdi' && (isLiveHA() || isHaIconRegistered);

      if (shouldRenderNative) {
        this._pathData = null;
        return;
      }

      // Fast-path: synchronous lookup for custom icons (sci:/sf:) — avoids blank-flash
      this._ensureCustomIcons();
      if (prefix) {
        const iconMap = (window.customIcons as Record<string, Record<string, unknown>> | undefined)?.[prefix];
        const syncPath = iconMap?.[name];
        if (syncPath && typeof syncPath === 'string') {
          this._pathData = syncPath;
          return;
        }
        if (syncPath && typeof syncPath === 'object') {
          this._pathData = syncPath as TemplateResult;
          return;
        }
      }

      void this._resolveIcon();
    }
  }

  private _ensureCustomIcons(): void {
    if (typeof window === 'undefined') return;
    window.customIcons = window.customIcons || {};
    if (!window.customIcons.sf || !(window.customIcons.sf as Record<string, unknown>)['stove']) {
      window.customIcons.sf = {
        ...(window.customIcons.sf as object | undefined),
        ...CUSTOM_ICONS,
        ...(WEATHER_ICONS as unknown as object),
      };
    }
    if (!window.customIcons.sci || !(window.customIcons.sci as Record<string, unknown>)['stove']) {
      window.customIcons.sci = {
        ...(window.customIcons.sci as object | undefined),
        ...CUSTOM_ICONS,
        ...(WEATHER_ICONS as unknown as object),
      };
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

    this._ensureCustomIcons();

    // 1. Check window.customIcons for custom namespaces (sci:/sf:)
    const customPath = window.customIcons?.[prefix]?.[name];
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
        console.warn('[sci-icon] No hass connection provided for MDI icon fetch');
        this._pathData = FALLBACK_MDI_PATH;
        return;
      }
      this._loading = true;
      const result = await resolveIcon(this.connection, iconKey, name);
      this._loading = false;

      if (result === ICON_NOT_FOUND) {
        console.warn(`[sci-icon] Icon '${iconKey}' not found in HA registry`);
        this._pathData = FALLBACK_MDI_PATH;
      } else {
        this._pathData = result;
      }
      return;
    }

    // 3. Unknown prefix — use fallback
    console.warn(`[sci-icon] Unknown icon namespace '${prefix}'`);
    this._pathData = FALLBACK_MDI_PATH;
  }

  override render(): TemplateResult | typeof nothing {
    const [prefix] = this.icon ? this.icon.split(':') : [''];
    const isHaIconRegistered =
      typeof customElements !== 'undefined' && customElements.get('ha-icon') !== undefined;
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
      return html`<svg viewBox="0 0 24 24" class="sci-icon sci-icon--loading"></svg>`;
    }
    if (!this._pathData) return nothing;

    if (typeof this._pathData === 'object') {
      return this._pathData;
    }

    return html`
      <svg
        viewBox="0 0 24 24"
        class="sci-icon"
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
    'sci-icon': SciIcon;
  }
}
