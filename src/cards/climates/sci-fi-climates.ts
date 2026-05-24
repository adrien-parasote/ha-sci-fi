/**
 * <sci-fi-climates> — v1.0.0
 * Shows all climate entities grouped, with temperature display.
 * Supports custom state_icons, state_colors, mode_icons, mode_colors (ADR-005).
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type {
  SciFiClimatesConfig,
  SciFiStateIconsConfig,
  SciFiStateColorsConfig,
} from '../../types/config.js';
import { getClimateEntitiesExcluding, isClimateActive } from '../../selectors/climate.js';

const TAG = 'sci-fi-climates';

const DEFAULT_STATE_ICONS: Required<SciFiStateIconsConfig> = {
  auto: 'sci:radiator-auto',
  off: 'sci:radiator-off',
  heat: 'sci:radiator-heat',
};

const DEFAULT_STATE_COLORS: Required<SciFiStateColorsConfig> = {
  auto: '#669cd2',
  off: '#6c757d',
  heat: '#ff7f50',
};

@customElement(TAG)
export class SciFiClimatesCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .climate-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--sf-spacing-sm);
      }
      .climate-tile {
        background: var(--sf-bg-secondary);
        border: 2px solid var(--sf-border);
        border-radius: var(--sf-radius);
        padding: var(--sf-spacing-md);
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        transition: border-color var(--sf-transition-fast);
      }
      .climate-tile[data-active="true"] {
        background: var(--sf-primary-dim);
      }
      .climate-name {
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .climate-temp {
        font-size: var(--sf-font-size-xl);
        font-weight: 700;
        color: var(--sf-primary);
      }
      .climate-state {
        font-size: var(--sf-font-size-sm);
        text-transform: capitalize;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .climate-mode {
        font-size: var(--sf-font-size-xs, 0.7rem);
        color: var(--sf-text-disabled);
      }

      /* ── Responsive ───────────────────────────────────────── */
      @container sf-card (max-width: 1023px) {
        .climate-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
      }
      @container sf-card (max-width: 599px) {
        .climate-grid { grid-template-columns: repeat(2, 1fr); }
        .container { padding: var(--sf-spacing-sm); }
      }
    `,
  ];

  declare config: SciFiClimatesConfig;

  protected override renderCard(): TemplateResult {
    // ADR-005: field is entities_to_exclude (not excluded_entity_ids)
    const excluded = this.config.entities_to_exclude ?? [];
    const climates = getClimateEntitiesExcluding(this.hass, excluded);

    if (climates.length === 0) {
      return html`<ha-card><div class="container">Aucun radiateur configuré</div></ha-card>`;
    }

    return html`
      <ha-card>
        ${this._renderHeader()}
        <div class="container">
          <div class="climate-grid">
            ${repeat(
              climates,
              c => c.entity_id,
              c => this._renderClimateTile(c)
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderHeader(): TemplateResult {
    const h = this.config.header;
    if (!h?.display && !this.config.header_message) return html``;

    const isWinter = this.hass.states['sensor.season']?.state === 'winter';
    const iconKey = isWinter
      ? (h?.icon_winter_state ?? 'mdi:thermometer-chevron-up')
      : (h?.icon_summer_state ?? 'mdi:thermometer-chevron-down');

    // ADR-005: message_winter_state and message_summer_state now supported
    const message = this.config.header_message
      ?? (isWinter ? (h?.message_winter_state ?? 'Winter is coming') : (h?.message_summer_state ?? 'Summer time'));

    return html`
      <div class="sf-header">
        <sf-icon .icon="${iconKey}" .connection="${this.hass.connection}"></sf-icon>
        ${message}
      </div>
    `;
  }

  private _renderClimateTile(
    entry: import('../../types/ha.js').HassEntityEntry
  ): TemplateResult {
    const state = this.hass.states[entry.entity_id];
    const active = isClimateActive(this.hass, entry.entity_id);
    const hvacMode = state?.state ?? 'off';
    const presetMode = state?.attributes['preset_mode'] as string | undefined;
    const name = state?.attributes.friendly_name ?? entry.entity_id;
    const currentTemp = state?.attributes['current_temperature'] as number | undefined;
    const targetTemp = state?.attributes['temperature'] as number | undefined;

    // ADR-005: state_icons and state_colors from config (with defaults)
    const stateIcons = { ...DEFAULT_STATE_ICONS, ...(this.config.state_icons ?? {}) };
    const stateColors = { ...DEFAULT_STATE_COLORS, ...(this.config.state_colors ?? {}) };

    // ADR-005: mode_icons and mode_colors from config (no default — user-defined)
    const modeIcons = this.config.mode_icons ?? {};
    const modeColors = this.config.mode_colors ?? {};

    // Determine icon and color: prefer preset mode lookup, fall back to hvac mode
    const iconKey = (presetMode && (modeIcons as Record<string, string>)[presetMode])
      ? (modeIcons as Record<string, string>)[presetMode]!
      : (stateIcons as Record<string, string>)[hvacMode] ?? stateIcons.off;

    const color = (presetMode && (modeColors as Record<string, string>)[presetMode])
      ? (modeColors as Record<string, string>)[presetMode]!
      : (stateColors as Record<string, string>)[hvacMode] ?? stateColors.off;

    return html`
      <div
        class="climate-tile"
        data-active="${active}"
        style="border-color: ${color}"
        role="button"
        tabindex="0"
        aria-label="${name}: ${hvacMode}"
        @click="${() => this._callToggle(entry.entity_id, hvacMode)}"
      >
        <div class="climate-name">${name}</div>
        <div class="climate-temp">${currentTemp !== null && currentTemp !== undefined ? `${currentTemp}°` : '--'}</div>
        <div class="climate-state" style="color: ${color}">
          <sf-icon .icon="${iconKey}" .connection="${this.hass.connection}"></sf-icon>
          ${hvacMode}
          ${targetTemp !== null && targetTemp !== undefined ? ` → ${targetTemp}°` : ''}
        </div>
        ${presetMode ? html`<div class="climate-mode">${presetMode}</div>` : ''}
      </div>
    `;
  }

  private _callToggle(entityId: string, currentState: string): void {
    const hvac_mode = currentState === 'off' ? 'heat' : 'off';
    void this.hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode });
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiClimatesConfig {
    return {
      type: `custom:${TAG}`,
      header: { display: true },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiClimatesCard;
  }
}
