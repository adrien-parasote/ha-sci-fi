/**
 * <sci-fi-stove> — v2
 * Pellet stove monitoring: state, combustion temp, pellet level, power.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiStoveConfig } from '../../types/config.js';

const TAG = 'sci-fi-stove';

@customElement(TAG)
export class SciFiStoveCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .stove-main {
        display: flex;
        align-items: center;
        gap: var(--sf-spacing-md);
        margin-bottom: var(--sf-spacing-md);
      }
      .stove-status {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .stove-status.sf-state-on { color: #ff6b35; }
      .sensors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--sf-spacing-sm);
      }
      .sensor-tile {
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        padding: var(--sf-spacing-sm);
        text-align: center;
      }
      .sensor-value {
        font-size: var(--sf-font-size-xl);
        font-weight: 700;
        color: var(--sf-primary);
      }
      .sensor-label {
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
      }
      .pellet-bar-bg {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        height: 8px;
        overflow: hidden;
        margin-top: 4px;
      }
      .pellet-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff6b35, #ffd60a);
        border-radius: 4px;
        transition: width var(--sf-transition-base);
      }
    `,
  ];

  declare config: SciFiStoveConfig;

  protected override renderCard(): TemplateResult {
    const stoveState = this.hass.states[this.config.entity_id];
    if (!stoveState) {
      return html`<ha-card><div class="container">Entité poêle non trouvée : ${this.config.entity_id}</div></ha-card>`;
    }

    const isOn = stoveState.state !== 'off' && stoveState.state !== 'unavailable';
    const sensors = this.config.sensors ?? {};

    const powerState = sensors.sensor_actual_power
      ? this.hass.states[sensors.sensor_actual_power]
      : undefined;
    const tempState = sensors.sensor_combustion_chamber_temperature
      ? this.hass.states[sensors.sensor_combustion_chamber_temperature]
      : undefined;
    const pelletState = sensors.sensor_pellet_quantity
      ? this.hass.states[sensors.sensor_pellet_quantity]
      : undefined;

    const pelletPct = pelletState ? parseFloat(pelletState.state) : null;

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          <div class="stove-main">
            <sf-icon
              .icon="${isOn ? 'mdi:fire' : 'mdi:fire-off'}"
              .connection="${this.hass.connection}"
            ></sf-icon>
            <div>
              <div class="stove-status ${isOn ? 'sf-state-on' : 'sf-state-off'}">
                ${stoveState.attributes.friendly_name ?? 'Poêle'}
              </div>
              <div class="sf-state-${isOn ? 'on' : 'off'}">${stoveState.state}</div>
            </div>
          </div>

          <div class="sensors-grid">
            ${powerState ? html`
              <div class="sensor-tile">
                <div class="sensor-value">${powerState.state} W</div>
                <div class="sensor-label">Puissance</div>
              </div>
            ` : ''}

            ${tempState ? html`
              <div class="sensor-tile">
                <div class="sensor-value">${tempState.state}°</div>
                <div class="sensor-label">Chambre combustion</div>
              </div>
            ` : ''}

            ${pelletPct !== null ? html`
              <div class="sensor-tile">
                <div class="sensor-value">${pelletPct}%</div>
                <div class="sensor-label">Granulés</div>
                <div class="pellet-bar-bg">
                  <div class="pellet-bar-fill" style="width: ${Math.max(0, Math.min(100, pelletPct))}%"></div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </ha-card>
    `;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiStoveConfig {
    return { type: `custom:${TAG}`, entity_id: 'climate.poele' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiStoveCard;
  }
}
