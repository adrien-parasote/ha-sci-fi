/**
 * SciFiBaseEditor — Abstract base class for all 8 card editors.
 * Manages config updates and dispatches 'config-changed' for Lovelace.
 *
 * Spec 10 additions:
 *  - _getNewConfig<T>()   — deep-clone of current config (immutable updates)
 *  - _dispatchChange()    — dispatch 'config-changed' + sync local state
 *  - getLabel(key)        — i18n label dictionary (80+ keys)
 */

import { msg, updateWhenLocaleChanges } from '@lit/localize';
import { LitElement, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../types/ha.js';
import type { SciFiBaseConfig } from '../types/config.js';
import { getLocale, setLocale } from '../locales/localization.js';
import '../components/sf-icon/sf-icon.js';


/**
 * Labels shared by two or more card editors, plus a few reached only through
 * dynamically built keys. Everything card-specific lives in
 * src/cards/<card>/labels.ts (ADR-017).
 *
 * A function, not a const: msg() must re-resolve on every lookup so labels
 * follow a locale change.
 */
export function sharedEditorLabels(): Record<string, string> {
  return {
    'section-title-header': msg('Header'),
    'section-title-settings': msg('Settings'),
    'section-title-vehicle': msg('Vehicle'),
    'section-title-weather': msg('Weather'),
    'section-title-technical': msg('Technical'),
    'section-title-appearance': msg('Appearance'),
    'section-title-entity': msg('Entity'),
    'section-title-storage': msg('Storage'),
    'section-title-energy': msg('Energy'),
    'section-title-other': msg('Others'),
    'section-title-monitoring': msg('Monitoring'),
    'section-title-device': msg('Device'),
    'section-title-custom-actions': msg('Custom actions'),
    'text-optional': msg('(optional)'),
    'text-required': msg('(required)'),
    'text-child-lock': msg('Child lock?'),
    'text-power-outage-memory': msg('Power outage memory'),
    'text-other-sensor': msg('Others sensors'),
    'edit-section-title': msg('Edit'),
    'input-entities-to-exclude': msg('Entities to exclude'),
    'input-icon': msg('Icon'),
    'input-weather-alert-entity-id': msg('Weather alert entity id'),
    'input-message-text': msg('Message'),
    'input-weather-entity': msg('Weather entity'),
    'input-name': msg('Name'),
    'input-active-icon': msg('Active icon'),
    'input-inactive-icon': msg('Inactive icon'),
    'input-entity-id': msg('Entity id'),
    'input-alert-green': msg('Green state'),
    'input-alert-yellow': msg('Yellow state'),
    'input-alert-orange': msg('Orange state'),
    'input-alert-red': msg('Red state'),
    'input-device': msg('Device'),
    'action-call-children': msg('Call children'),
    'input-input-button-entity': msg('input_button entity'),
    'input-button-text': msg('Button text (opt.)'),
  };
}

/** Section-title icons shared by two or more card editors. Static, no i18n. */
const SHARED_SECTION_ICONS: Record<string, string> = {
    'section-title-header':              'mdi:page-layout-header',
    'section-title-settings':            'mdi:tune-vertical-variant',
    'section-title-vehicle':             'mdi:selection-ellipse-arrow-inside',
    'section-title-weather':             'mdi:theme-light-dark',
    'section-title-technical':           'mdi:cog-outline',
    'section-title-appearance':          'mdi:palette-outline',
    'section-title-entity':              'mdi:selection-ellipse-arrow-inside',
    'section-title-storage':             'mdi:archive-outline',
    'section-title-energy':              'mdi:flash-outline',
    'section-title-other':               'mdi:dots-horizontal-circle-outline',
    'section-title-monitoring':          'mdi:monitor-eye',
    'section-title-device':              'mdi:devices',
    'section-title-custom-actions':      'mdi:gesture-tap-button',
};

export abstract class SciFiBaseEditor extends LitElement {
  private _hassInternal?: HomeAssistantExt;

  get hass(): HomeAssistantExt | undefined {
    return this._hassInternal;
  }

  @property({ attribute: false })
  set hass(hass: HomeAssistantExt | undefined) {
    this._hassInternal = hass;
    const lang = hass?.locale?.language;
    if (typeof lang === 'string') {
      const cleanLang = (lang.split('-')[0] ?? '').toLowerCase();
      const targetLocale = cleanLang === 'fr' ? 'fr' : 'en';
      if (targetLocale !== getLocale()) {
        void (async () => {
          try {
            await setLocale(targetLocale);
            this.requestUpdate();
          } catch (e) {
            console.error(`[BaseEditor] Error loading locale ${targetLocale}: ${(e as Error).message}`);
          }
        })();
      }
    }
  }

  @property({ attribute: false })
  config!: SciFiBaseConfig;

  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  // ─── Config input ───────────────────────────────────────────────────────────

  setConfig(config: SciFiBaseConfig): void {
    this.config = config;
  }

  // ─── Immutable config helpers (Spec 10) ─────────────────────────────────────

  /**
   * Deep-clones the current config to ensure immutable updates.
   * Returns Mutable<T> so callers can freely assign cloned (non-readonly) fields.
   * Falls back to an empty object if config is not yet set.
   */
  protected _getNewConfig<T extends SciFiBaseConfig>(): { -readonly [K in keyof T]: T[K] } {
    return this.config
      ? (JSON.parse(JSON.stringify(this.config)) as { -readonly [K in keyof T]: T[K] })
      : ({} as { -readonly [K in keyof T]: T[K] });
  }


  /**
   * Updates local config reference synchronously (prevents stale state/race
   * conditions) then dispatches 'config-changed' to Lovelace.
   *
   * @param newConfig — the complete new config object (NOT a partial patch)
   */
  protected _dispatchChange(newConfig: SciFiBaseConfig): void {
    this.config = newConfig; // CRITICAL: sync local ref before Lovelace updates
    this.dispatchEvent(
      new CustomEvent<{ config: SciFiBaseConfig }>('config-changed', {
        bubbles: true,
        composed: true,
        detail: { config: newConfig },
      })
    );
  }

  /**
   * @deprecated Use _dispatchChange(completeNewConfig) instead.
   * Kept for backward compatibility during migration.
   */
  protected _dispatchConfigChanged(patch: Partial<SciFiBaseConfig>): void {
    const newConfig: SciFiBaseConfig = { ...this.config, ...patch };
    this._dispatchChange(newConfig);
  }

  // ─── Label lookup (Spec 10 — i18n; ADR-017 — per-card dictionaries) ─────────

  /**
   * Labels owned by this editor's card. Subclasses override with their own
   * dictionary from src/cards/<card>/labels.ts. A card key shadows a shared one.
   */
  protected get cardLabels(): Record<string, string> {
    return {};
  }

  /** Section-title icons owned by this editor's card. Same contract as cardLabels. */
  protected get cardSectionIcons(): Record<string, string> {
    return {};
  }

  /**
   * Returns a localized label string for the given key.
   * Returns '' for unknown keys to prevent crashes.
   */
  getLabel(key: string): string {
    const labels: Record<string, string> = { ...sharedEditorLabels(), ...this.cardLabels };
    return (key in labels ? labels[key] : '') ?? '';
  }

  /**
   * Section icon + label for use inside <h1>. Falls back to a neutral icon for
   * a key neither the kernel nor the card declares.
   */
  getSectionTitle(key: string): TemplateResult {
    const icons: Record<string, string> = { ...SHARED_SECTION_ICONS, ...this.cardSectionIcons };
    const icon = icons[key] ?? 'mdi:circle-small';
    return html`
      <sf-icon icon="${icon}" style="--icon-width:16px;--icon-height:16px;"></sf-icon>
      <span>${this.getLabel(key)}</span>
    `;
  }


  // ─── Sealed render ──────────────────────────────────────────────────────────

  override render(): TemplateResult {
    if (!this.config) return html`<div>No config</div>`;
    return this.renderEditor();
  }

  /** Subclasses implement this to render the editor UI. */
  protected abstract renderEditor(): TemplateResult;
}
