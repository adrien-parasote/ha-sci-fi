/**
 * SciFiBaseCard — Abstract base class for every sci-fi Lovelace card.
 * (Said "all 8" until 2026-11-01; there are 11, and a count in a comment
 *  goes stale the next time one is added.)
 *
 * Subclass contract:
 * - MUST implement `renderCard()` — used instead of overriding `render()`
 * - MUST call `super.willUpdate(changedProperties)` first if overriding `willUpdate()` (MEDIUM-02)
 * - MUST implement `static getConfigElement()` and `static getStubConfig()`
 * - MUST call `this.validateConfig(config)` inside `setConfig()` before storing
 */

import { msg, str, updateWhenLocaleChanges } from '@lit/localize';
import { LitElement, html, nothing, type TemplateResult, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../types/ha.js';
import type { SciFiBaseConfig } from '../types/config.js';
import { getLocale, setLocale } from '../locales/localization.js';

// Control (C0, DEL, C1) and bidi characters never reach the screen: an entity id
// comes from user YAML and is displayed verbatim in the banner.
// eslint-disable-next-line no-control-regex
const HIDDEN_CHARS = /[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const MAX_SHOWN_IDS = 3;
const MAX_ID_CODE_POINTS = 64;

function displayId(id: string): string {
  const points = Array.from(id.replace(HIDDEN_CHARS, ''));
  return points.length > MAX_ID_CODE_POINTS ? `${points.slice(0, MAX_ID_CODE_POINTS).join('')}…` : points.join('');
}

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
    // Banner state (FR-1): subclasses' getRelevantEntities() read this.config unguarded.
    if (!this.config) return true;

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
    // HA sets `hass` after `setConfig`: no hass is a normal first-render state.
    if (!this.hass) return nothing;
    if (!this.config) return this._renderErrorCard(msg('Card setup required: configuration is missing.'));
    try {
      const configured = this._configuredIds();
      if (configured.length > 0 && this.getMissingEntities().length === configured.length) {
        return this._renderErrorCard(msg(str`Entity not found: ${this._missingIdsLabel()}`));
      }
      return this.renderCard();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${this.tagName}] Render error:`, err);
      this._renderError = message;
      return this._renderErrorCard(message);
    }
  }

  /**
   * Opt-in: the entity ids the user CONFIGURED (never derived or infrastructure
   * ids). When all of them are absent from `hass.states`, the card shows the
   * "Entity not found" banner instead of `renderCard()`. Default `[]` = no banner.
   * The result must be a subset of `getRelevantEntities()` so `shouldUpdate()`
   * repaints when one of them appears.
   */
  protected getConfiguredEntities(): string[] {
    return [];
  }

  /** Configured ids (non-empty strings, deduplicated) absent from `hass.states`, in configured order. */
  protected getMissingEntities(): string[] {
    const states: unknown = this.hass?.states;
    if (states === null || typeof states !== 'object') return [];
    return this._configuredIds().filter(
      id => !Object.prototype.hasOwnProperty.call(states, id) || (states as Record<string, unknown>)[id] === undefined
    );
  }

  private _configuredIds(): string[] {
    const raw: unknown = this.getConfiguredEntities();
    if (!Array.isArray(raw)) return [];
    return Array.from(new Set(raw.filter((id): id is string => typeof id === 'string' && id !== '')));
  }

  /** `a, b, c` then `, … (+N)` for the missing ids beyond the third. */
  private _missingIdsLabel(): string {
    const missing = this.getMissingEntities();
    const shown = missing.slice(0, MAX_SHOWN_IDS).map(displayId).join(', ');
    const more = missing.length - MAX_SHOWN_IDS;
    return more > 0 ? `${shown}, … (+${more})` : shown;
  }

  /** Subclasses implement this instead of render(). */
  protected abstract renderCard(): TemplateResult;

  // ─── Error display ──────────────────────────────────────────────────────────

  private _renderErrorCard(message: string): TemplateResult {
    return html`
      <ha-card>
        <div class="sf-error-card" role="status">
          <span class="sf-error-icon" aria-hidden="true">⚠️</span>
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
