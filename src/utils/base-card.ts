/**
 * SciFiBaseCard — Abstract base class for all 8 sci-fi Lovelace cards.
 *
 * Subclass contract:
 * - MUST implement `renderCard()` — used instead of overriding `render()`
 * - MUST call `super.willUpdate(changedProperties)` first if overriding `willUpdate()` (MEDIUM-02)
 * - MUST implement `static getConfigElement()` and `static getStubConfig()`
 * - MUST call `this.validateConfig(config)` inside `setConfig()` before storing
 */

import { updateWhenLocaleChanges } from '@lit/localize';
import { LitElement, html, nothing, type TemplateResult, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../types/ha.js';
import type { SciFiBaseConfig } from '../types/config.js';
import { getLocale, setLocale } from '../locales/localization.js';

export interface LovelaceCard extends HTMLElement {
  hass?: any;
  setConfig(config: any): void;
  getCardSize?(): number;
}

export abstract class SciFiBaseCard extends LitElement implements LovelaceCard {
  private _hass!: HomeAssistantExt;

  get hass(): HomeAssistantExt {
    return this._hass;
  }

  @property({ attribute: false })
  set hass(hass: HomeAssistantExt) {
    this._hass = hass;
    const lang = hass?.locale?.language;
    if (typeof lang === 'string') {
      const cleanLang = (lang.split('-')[0] ?? '').toLowerCase();
      const targetLocale = cleanLang === 'fr' ? 'fr' : 'en';
      if (targetLocale !== getLocale()) {
        void (async () => {
          try {
            await setLocale(targetLocale);
          } catch (e) {
            console.error(`Error loading locale ${targetLocale}: ${(e as Error).message}`);
          }
        })();
      }
    }
  }

  @state()
  protected config!: SciFiBaseConfig;

  @state()
  protected _renderError: string | null = null;

  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  // ─── Lit lifecycle ──────────────────────────────────────────────────────────

  override shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.size > 1 || (changedProps.size === 1 && !changedProps.has('hass'))) {
      return true;
    }

    if (changedProps.has('hass')) {
      const oldHass = changedProps.get('hass') as HomeAssistantExt | undefined;
      if (oldHass && this.hass) {
        if (oldHass.locale?.language !== this.hass.locale?.language) {
          return true;
        }

        const relevantEntities = this.getRelevantEntities();
        if (!relevantEntities || relevantEntities.length === 0) {
          return true;
        }

        return relevantEntities.some(
          entity => oldHass.states[entity] !== this.hass.states[entity]
        );
      }
    }

    return true;
  }

  /**
   * Subclasses should override this to return the list of entity IDs they track.
   * If it returns an empty array, the card re-renders on EVERY HA state change.
   */
  protected getRelevantEntities(): string[] {
    return [];
  }

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
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
