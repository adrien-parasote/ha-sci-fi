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

  // ─── Label dictionary (Spec 10 — i18n via @lit/localize) ───────────────────

  /**
   * Returns a localized label string for the given key.
   * Returns '' for unknown keys to prevent crashes.
   */
  getLabel(key: string): string {
    const labels: Record<string, string> = {
      'section-title-header': msg('Header'),
      'section-title-settings': msg('Settings'),
      'section-title-vehicle': msg('Vehicle'),
      'section-title-state': msg('State'),
      'section-title-mode': msg('Mode'),
      'section-title-weather': msg('Weather'),
      'section-title-chart': msg('Chart'),
      'section-title-alert': msg('Alert'),
      'section-title-tile': msg('Tile'),
      'section-title-technical': msg('Technical'),
      'section-title-home-selection': msg('Display selection'),
      'section-title-appearance': msg('Appearance'),
      'section-title-entity': msg('Entity'),
      'section-title-entity-light-custom': msg('Light entities customization'),
      'section-title-sensor': msg('Sensors'),
      'section-title-storage': msg('Storage'),
      'section-title-plug': msg('Plugs'),
      'section-title-energy': msg('Energy'),
      'section-title-other': msg('Others'),
      'section-title-monitoring': msg('Monitoring'),
      'section-title-config': msg('Configuration'),
      'section-title-device': msg('Device'),
      'section-title-visibility': msg('Visibility'),
      'section-title-default-actions': msg('Default actions display'),
      'section-title-custom-actions': msg('Custom actions'),
      'section-title-shortcuts': msg('Shortcuts'),
      'section-title-segments': msg('Segments'),
      'section-title-tv': msg('TV Remote'),
      'section-title-device-settings': msg('Device settings'),
      'section-title-media-sources': msg('Media sources'),
      'input-media-player-entity': msg('Media Player entity'),
      'input-quadrant-name': msg('Quadrant name'),
      'input-remote-entity': msg('Remote entity'),
      'input-media-sources': msg('Quick-Select sources (Press Enter to add)'),
      'text-optional': msg('(optional)'),
      'text-required': msg('(required)'),
      'text-switch-climate-global-turn-on_off': msg('Display global turn on/off button ?'),
      'text-switch-hexa-add-weather-tile': msg('Add weather tile ?'),
      'text-switch-hexa-standalone': msg('Standalone entity?'),
      'text-switch-action-start': msg('Start?'),
      'text-switch-action-pause': msg('Pause?'),
      'text-switch-action-stop': msg('Stop?'),
      'text-switch-action-return-to-base': msg('Return to base?'),
      'text-switch-action-set-fan-speed': msg('Set fan speed?'),
      'text-child-lock': msg('Child lock?'),
      'text-power-outage-memory': msg('Power outage memory'),
      'text-other-sensor': msg('Others sensors'),
      'edit-section-title': msg('Edit'),
      'input-message-header-section-winter': msg('Winter period message'),
      'input-icon-header-section-winter': msg('Winter period icon'),
      'input-message-header-section-summer': msg('Summer period message'),
      'input-icon-header-section-summer': msg('Summer period icon'),
      'input-entities-to-exclude': msg('Entities to exclude'),
      'input-icon': msg('Icon'),
      'input-weather-alert-entity-id': msg('Weather alert entity id'),
      'input-icon-auto': msg('Icon auto'),
      'input-icon-off': msg('Icon off'),
      'input-icon-heat': msg('Icon heat'),
      'input-icon-frost_protection': msg('Icon frost protection'),
      'input-icon-eco': msg('Icon eco'),
      'input-icon-comfort': msg('Icon comfort'),
      'input-icon-comfort-1': msg('Icon comfort-1'),
      'input-icon-comfort-2': msg('Icon comfort-2'),
      'input-icon-boost': msg('Icon boost'),
      'input-color-auto': msg('Auto icon color'),
      'input-color-off': msg('Off icon color'),
      'input-color-heat': msg('Heat icon color'),
      'input-color-frost_protection': msg('Frost protection icon color'),
      'input-color-eco': msg('Eco icon color'),
      'input-color-comfort': msg('Comfort icon color'),
      'input-color-comfort-1': msg('Comfort-1 icon color'),
      'input-color-comfort-2': msg('Comfort-2 icon color'),
      'input-color-boost': msg('Boost icon color'),
      'input-message-text': msg('Message'),
      'input-weather-entity': msg('Weather entity'),
      'input-link': msg('Link'),
      'input-name': msg('Name'),
      'input-active-icon': msg('Active icon'),
      'input-inactive-icon': msg('Inactive icon'),
      'input-states-on': msg('States on'),
      'input-state-error': msg('Error state'),
      'input-entity-id': msg('Entity id'),
      'input-entity-kind': msg('Entity kind'),
      'input-floor-id': msg('First floor to render'),
      'input-area-id': msg('First area to render'),
      'input-location': msg('Location'),
      'input-location-last-activity': msg('Location last activity'),
      'input-mileage': msg('Mileage'),
      'input-lock-status': msg('Lock status'),
      'input-fuel-autonomy': msg('Fuel autonomy'),
      'input-fuel-quantity': msg('Fuel quantity'),
      'input-battery-autonomy': msg('Battery autonomy'),
      'input-battery-level': msg('Battery level'),
      'input-charging-state': msg('Charging'),
      'input-plug-state': msg('Plug state'),
      'input-remainting-charging-time': msg('Remaining charging time'),
      'input-storage-counter': msg('Storage counter'),
      'input-threshold': msg('Threshold'),
      'input-stove-combustion-chamber': msg('Stove combustion chamber'),
      'input-room-temperature': msg('Room temperature'),
      'input-stove-pressure': msg('Stove pressure'),
      'input-stove-fan-speed': msg('Stove fans speed'),
      'input-stove-power-rendered': msg('Stove power rendered'),
      'input-stove-power-consume': msg('Stove power consumed'),
      'input-stove-status': msg('Stove status'),
      'input-stove-time-to-service': msg('Stove time to service'),
      'input-pellet-quantity': msg('Stove pellet quantity'),
      'input-pellet-quantity-threshold': msg('Pellet quantity threshold'),
      'input-daily-forecast-number': msg('Forecast number of days'),
      'input-chart-first-focus-data': msg('First data targeted on the chart'),
      'input-alert-green': msg('Green state'),
      'input-alert-yellow': msg('Yellow state'),
      'input-alert-orange': msg('Orange state'),
      'input-alert-red': msg('Red state'),
      'input-device': msg('Device'),
      'input-energy': msg('Energy'),
      'input-power': msg('Power'),
      'input-map': msg('Map'),
      'input-service': msg('Service to call'),
      'input-segment': msg('Segment'),
      'input-current-clean-area': msg('Current clean area'),
      'input-current-clean-duration': msg('Current clean duration'),
      'input-last-clean-area': msg('Last clean area'),
      'input-last-clean-duration': msg('Last clean duration'),
      'input-battery': msg('Battery'),
      'input-mop-intensite': msg('Mop intensite'),
      'input-command': msg('Command'),
      // ── Action labels ─────────────────────────────────────────────────────
      'action-add-tile': msg('Add tile'),
      'action-add-custom-entity': msg('Add custom entity'),
      'action-add-vehicle': msg('Add vehicle'),
      'action-add-device': msg('Add device'),
      'action-add-segment': msg('Add segment'),
      'action-add-shortcut': msg('Add shortcut'),
      'action-delete-shortcut': msg('Delete shortcut'),
      'action-edit-shortcut': msg('Edit shortcut'),
      // ── Entity labels ─────────────────────────────────────────────────────
      'input-switch-entity': msg('Switch entity'),
      'input-vacuum-entity': msg('Vacuum entity'),
      // ── Status text ───────────────────────────────────────────────────────
      'text-no-vacuum': msg('No vacuum configured.'),
    };
    return (key in labels ? (labels)[key] : '') ?? '';
  }

  /**
   * Section icon map — matches the legacy sci-fi-icon usage per section title.
   * Returns a TemplateResult with sf-icon + label for use inside <h1>.
   */
  getSectionTitle(key: string): TemplateResult {
    const SECTION_ICONS: Record<string, string> = {
      'section-title-header':              'mdi:page-layout-header',
      'section-title-settings':            'mdi:tune-vertical-variant',
      'section-title-vehicle':             'mdi:selection-ellipse-arrow-inside',
      'section-title-state':               'mdi:state-machine',
      'section-title-mode':                'mdi:state-machine',
      'section-title-weather':             'mdi:theme-light-dark',
      'section-title-chart':               'mdi:chart-bell-curve',
      'section-title-alert':               'mdi:alert',
      'section-title-tile':                'mdi:hexagon-slice-6',
      'section-title-technical':           'mdi:cog-outline',
      'section-title-home-selection':      'mdi:home-search-outline',
      'section-title-appearance':          'mdi:palette-outline',
      'section-title-entity':              'mdi:selection-ellipse-arrow-inside',
      'section-title-entity-light-custom': 'mdi:selection-ellipse-arrow-inside',
      'section-title-sensor':              'mdi:sine-wave',
      'section-title-storage':             'mdi:archive-outline',
      'section-title-plug':                'mdi:tune-vertical-variant',
      'section-title-energy':              'mdi:flash-outline',
      'section-title-other':               'mdi:dots-horizontal-circle-outline',
      'section-title-monitoring':          'mdi:monitor-eye',
      'section-title-config':              'mdi:selection-ellipse-arrow-inside',
      'section-title-device':              'mdi:devices',
      'section-title-visibility':          'mdi:eye-outline',
      'section-title-default-actions':     'mdi:gesture-tap',
      'section-title-custom-actions':      'mdi:gesture-tap-button',
      'section-title-shortcuts':           'mdi:lightning-bolt-outline',
      'section-title-segments':            'mdi:floor-plan',
      'section-title-tv':                  'mdi:television',
    };
    const icon = SECTION_ICONS[key] ?? 'mdi:circle-small';
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
