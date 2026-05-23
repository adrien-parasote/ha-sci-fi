/**
 * <sci-fi-climates> — v2
 * Shows all climate entities grouped by area, with temperature display.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiClimatesConfig } from '../../types/config.js';
import { getClimateEntitiesExcluding, isClimateActive } from '../../selectors/climate.js';

const TAG = 'sci-fi-climates';

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
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius);
        padding: var(--sf-spacing-md);
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        transition: border-color var(--sf-transition-fast);
      }
      .climate-tile[data-active="true"] {
        border-color: var(--sf-primary);
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
      }
    `,
  ];

  declare config: SciFiClimatesConfig;

  protected override renderCard(): TemplateResult {
    const excluded = this.config.excluded_entity_ids ?? [];
    const climates = getClimateEntitiesExcluding(this.hass, excluded);

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

    const iconKey = this.hass.states['sensor.season']?.state === 'winter'
      ? (h?.icon_winter_state ?? 'mdi:snowflake')
      : (h?.icon_summer_state ?? 'mdi:white-balance-sunny');

    return html`
      <div class="sf-header">
        <sf-icon .icon="${iconKey}" .connection="${this.hass.connection}"></sf-icon>
        ${this.config.header_message ?? ''}
      </div>
    `;
  }

  private _renderClimateTile(
    entry: import('../../types/ha.js').HassEntityEntry
  ): TemplateResult {
    const state = this.hass.states[entry.entity_id];
    const active = isClimateActive(this.hass, entry.entity_id);
    const name = state?.attributes.friendly_name ?? entry.entity_id;
    const currentTemp = state?.attributes['current_temperature'] as number | undefined;
    const targetTemp = state?.attributes['temperature'] as number | undefined;

    return html`
      <div
        class="climate-tile"
        data-active="${active}"
        role="button"
        tabindex="0"
        aria-label="${name}: ${state?.state ?? 'inconnu'}"
        @click="${() => this._callToggle(entry.entity_id, state?.state ?? 'off')}"
      >
        <div class="climate-name">${name}</div>
        <div class="climate-temp">${currentTemp != null ? `${currentTemp}°` : '--'}</div>
        <div class="climate-state ${active ? 'sf-state-on' : 'sf-state-off'}">
          ${state?.state ?? 'inconnu'}
          ${targetTemp != null ? ` → ${targetTemp}°` : ''}
        </div>
      </div>
    `;
  }

  private _callToggle(entityId: string, currentState: string): void {
    const service = currentState === 'off' ? 'set_hvac_mode' : 'set_hvac_mode';
    const hvac_mode = currentState === 'off' ? 'heat' : 'off';
    this.hass.callService('climate', service, { entity_id: entityId, hvac_mode });
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
