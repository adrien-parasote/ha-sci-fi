/**
 * <sf-icon> — Sci-fi icon component
 *
 * Renders icons from:
 * 1. window.customIcons['sf'] — for custom sf: prefixed icons
 * 2. HA native MDI registry (via icon-cache.ts) — for mdi: icons
 *
 * Anti-patterns avoided (CRITICAL-01):
 * - Never fetches from unpkg/jsdelivr CDN
 * - Always falls back gracefully (mdi:help-circle placeholder)
 */

import { LitElement, html, svg, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { resolveIcon, ICON_NOT_FOUND, type HassIconConnection } from './icon-cache.js';

/** Global augmentation for window.customIcons */
declare global {
  interface Window {
    customIcons?: Record<string, Record<string, string>>;
  }
}

// Fallback path for mdi:help-circle when icon resolution fails
const FALLBACK_MDI_PATH =
  'M11.5,2C6.81,2 3,5.81 3,10.5S6.81,19 11.5,19H12V22C16.86,18.92 21,15.44 21,10.5C21,5.81 17.19,2 11.5,2M12.5,16.5H10.5V14.5H12.5V16.5M12.5,13H10.5C10.5,9.75 13.5,10 13.5,8C13.5,6.9 12.6,6 11.5,6C10.4,6 9.5,6.9 9.5,8H7.5C7.5,5.79 9.29,4 11.5,4C13.71,4 15.5,5.79 15.5,8C15.5,10.5 12.5,10.75 12.5,13Z';

@customElement('sf-icon')
export class SfIcon extends LitElement {
  /** Icon string in format "prefix:name" e.g. "mdi:home" or "sf:radiator" */
  @property({ type: String })
  icon = '';

  @property({ attribute: false })
  connection?: HassIconConnection;

  @state()
  private _pathData: string | null = null;

  @state()
  private _loading = false;

  override willUpdate(changed: Map<string, unknown>): void {
    if ((changed.has('icon') || changed.has('connection')) && this.icon) {
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

    // 1. Check window.customIcons for custom namespaces (e.g. sf:)
    const customPath = window.customIcons?.[prefix]?.[name];
    if (customPath) {
      this._pathData = customPath;
      return;
    }

    // 2. For MDI icons, use HA native registry (no CDN — CRITICAL-01)
    if (prefix === 'mdi') {
      if (!this.connection) {
        console.warn('[sf-icon] No hass connection provided for MDI icon fetch');
        this._pathData = FALLBACK_MDI_PATH;
        return;
      }
      this._loading = true;
      const result = await resolveIcon(this.connection, `mdi:${name}`, name);
      this._loading = false;

      if (result === ICON_NOT_FOUND) {
        console.warn(`[sf-icon] Icon 'mdi:${name}' not found in HA registry`);
        this._pathData = FALLBACK_MDI_PATH; // mdi:help-circle fallback
      } else {
        this._pathData = result;
      }
      return;
    }

    // 3. Unknown prefix — use fallback
    console.warn(`[sf-icon] Unknown icon namespace '${prefix}'`);
    this._pathData = FALLBACK_MDI_PATH;
  }

  override render(): TemplateResult | typeof nothing {
    if (this._loading) {
      return html`<svg viewBox="0 0 24 24" class="sf-icon sf-icon--loading"></svg>`;
    }
    if (!this._pathData) return nothing;

    return html`
      <svg viewBox="0 0 24 24" class="sf-icon" aria-hidden="true">
        ${svg`<path d="${this._pathData}" />`}
      </svg>
    `;
  }

  protected override createRenderRoot(): HTMLElement {
    return this as unknown as HTMLElement;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-icon': SfIcon;
  }
}
