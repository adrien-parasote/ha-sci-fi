/**
 * SciFiBaseCard — Abstract base class for all 8 sci-fi Lovelace cards.
 *
 * Subclass contract:
 * - MUST implement `renderCard()` — used instead of overriding `render()`
 * - MUST call `super.willUpdate(changedProperties)` first if overriding `willUpdate()` (MEDIUM-02)
 * - MUST implement `static getConfigElement()` and `static getStubConfig()`
 * - MUST call `this.validateConfig(config)` inside `setConfig()` before storing
 */

import { LitElement, html, nothing, type TemplateResult, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../types/ha.js';
import type { SciFiBaseConfig } from '../types/config.js';

export abstract class SciFiBaseCard extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistantExt;

  @state()
  protected config!: SciFiBaseConfig;

  @state()
  protected _renderError: string | null = null;

  // ─── Lit lifecycle ──────────────────────────────────────────────────────────

  /**
   * MEDIUM-02 fix: willUpdate is the sync point for locale.
   * Any subclass that overrides this MUST call super.willUpdate(changedProperties) first.
   */
  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    // Locale sync hook — will be wired to @lit/localize in Step 6
    if (changedProperties.has('hass') && this.hass) {
      this._onHassLocaleChanged(this.hass.locale.language);
    }
  }

  /** Called when the HA locale changes. Override to trigger locale sync. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _onHassLocaleChanged(_language: string): void {
    // Default: no-op. Wired to syncHALocale in Step 6.
  }

  // ─── Sealed render — subclasses MUST implement renderCard() ────────────────

  override render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;
    try {
      return this.renderCard();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${this.tagName}] Render error:`, err);
      this._renderError = message;
      return this._renderErrorCard(message);
    }
  }

  /** Subclasses implement this instead of render(). */
  protected abstract renderCard(): TemplateResult;

  // ─── Error display ──────────────────────────────────────────────────────────

  private _renderErrorCard(message: string): TemplateResult {
    return html`
      <ha-card>
        <div class="sf-error-card">
          <span class="sf-error-icon">⚠️</span>
          <span class="sf-error-message">${message}</span>
        </div>
      </ha-card>
    `;
  }

  // ─── Config ─────────────────────────────────────────────────────────────────

  setConfig(config: SciFiBaseConfig): void {
    if (!config || typeof config !== 'object') {
      throw new Error(`[${this.constructor.name}] setConfig: config must be an object`);
    }
    this.validateConfig(config);
    this.config = Object.freeze({ ...config });
  }

  /**
   * Override in subclass to add card-specific validation.
   * Call super.validateConfig(config) to run base checks.
   */
  protected validateConfig(config: SciFiBaseConfig): void {
    if (!config.type || typeof config.type !== 'string') {
      throw new Error(`[${this.constructor.name}] Config must include a valid 'type' string`);
    }
  }

  // ─── Card size (Lovelace) ───────────────────────────────────────────────────

  getCardSize(): number {
    return 3;
  }
}
