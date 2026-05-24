/**
 * SciFiBaseEditor — Abstract base class for all 8 card editors.
 * Manages config updates and dispatches 'config-changed' for Lovelace.
 */

import { updateWhenLocaleChanges } from '@lit/localize';
import { LitElement, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../types/ha.js';
import type { SciFiBaseConfig } from '../types/config.js';
import { getLocale, setLocale } from '../locales/localization.js';

export abstract class SciFiBaseEditor extends LitElement {
  private _hassInternal?: HomeAssistantExt;

  get hass(): HomeAssistantExt | undefined {
    return this._hassInternal;
  }

  @property({ attribute: false })
  set hass(hass: HomeAssistantExt | undefined) {
    this._hassInternal = hass;
    if (hass?.locale?.language && hass.locale.language !== getLocale()) {
      void (async () => {
        try {
          await setLocale(hass.locale.language);
        } catch (e) {
          console.error(`Error loading locale ${hass.locale.language}: ${(e as Error).message}`);
        }
      })();
    }
  }

  @property({ attribute: false })
  protected config!: SciFiBaseConfig;

  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  // ─── Config input ───────────────────────────────────────────────────────────

  setConfig(config: SciFiBaseConfig): void {
    this.config = config;
  }

  // ─── Event dispatch ─────────────────────────────────────────────────────────

  /**
   * Merges the patch into the current config and dispatches 'config-changed'.
   * Lovelace listens for this event to update the card config live.
   */
  protected _dispatchConfigChanged(patch: Partial<SciFiBaseConfig>): void {
    const newConfig: SciFiBaseConfig = { ...this.config, ...patch };
    const event = new CustomEvent<{ config: SciFiBaseConfig }>('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: newConfig },
    });
    this.dispatchEvent(event);
    this.config = newConfig;
  }

  // ─── Sealed render ──────────────────────────────────────────────────────────

  override render(): TemplateResult {
    if (!this.config) return html`<div>No config</div>`;
    return this.renderEditor();
  }

  /** Subclasses implement this to render the editor UI. */
  protected abstract renderEditor(): TemplateResult;
}
