/**
 * <sci-fi-vehicles> — v2
 * Electric vehicle monitoring: charging state, battery, range, location.
 * Decoupled from House monolith (ADR-004).
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiVehiclesConfig, SciFiVehicleEntry } from '../../types/config.js';

const TAG = 'sci-fi-vehicles';

@customElement(TAG)
export class SciFiVehiclesCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .vehicles-list {
        display: flex;
        flex-direction: column;
        gap: var(--sf-spacing-md);
      }
      .vehicle-card {
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius);
        padding: var(--sf-spacing-md);
      }
      .vehicle-card[data-charging="true"] {
        border-color: #00ff9d;
      }
      .vehicle-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sf-spacing-sm);
      }
      .vehicle-name {
        font-size: var(--sf-font-size-lg);
        font-weight: 700;
        color: var(--sf-text-primary);
      }
      .vehicle-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sf-spacing-xs) var(--sf-spacing-md);
        font-size: var(--sf-font-size-sm);
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .stat-label { color: var(--sf-text-secondary); }
      .stat-value { color: var(--sf-text-primary); font-weight: 600; }
      .battery-bar-bg {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        height: 6px;
        margin-top: var(--sf-spacing-sm);
        overflow: hidden;
      }
      .battery-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width var(--sf-transition-base);
      }
      .battery-bar-fill[data-level="high"] { background: #00ff9d; }
      .battery-bar-fill[data-level="mid"] { background: #ffd60a; }
      .battery-bar-fill[data-level="low"] { background: #ff4d6d; }
    `,
  ];

  declare config: SciFiVehiclesConfig;

  @state() private _activeIndex = 0;

  protected override renderCard(): TemplateResult {
    const vehicles = this.config.vehicles;
    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          <div class="vehicles-list">
            ${repeat(vehicles, v => v.id, v => this._renderVehicle(v))}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderVehicle(v: SciFiVehicleEntry): TemplateResult {
    const isCharging = v.charging
      ? this.hass.states[v.charging]?.state === 'on'
      : false;
    const isLocked = v.lock_status
      ? this.hass.states[v.lock_status]?.state === 'locked'
      : null;
    const battery = v.battery_level
      ? parseFloat(this.hass.states[v.battery_level]?.state ?? '0')
      : null;
    const range = v.range
      ? this.hass.states[v.range]?.state
      : null;
    const mileage = v.mileage
      ? this.hass.states[v.mileage]?.state
      : null;
    const location = v.location
      ? this.hass.states[v.location]?.state
      : null;

    const batteryLevel = battery != null
      ? (battery >= 60 ? 'high' : battery >= 30 ? 'mid' : 'low')
      : 'mid';

    return html`
      <div class="vehicle-card" data-charging="${isCharging}">
        <div class="vehicle-header">
          <span class="vehicle-name">${v.name}</span>
          <sf-icon
            .icon="${isCharging ? 'mdi:ev-station' : 'mdi:car-electric'}"
            .connection="${this.hass.connection}"
          ></sf-icon>
        </div>

        <div class="vehicle-stats">
          ${battery != null ? html`
            <div class="stat-item">
              <span class="stat-label">Batterie</span>
              <span class="stat-value">${battery}%</span>
            </div>
          ` : ''}
          ${range != null ? html`
            <div class="stat-item">
              <span class="stat-label">Autonomie</span>
              <span class="stat-value">${range} km</span>
            </div>
          ` : ''}
          ${mileage != null ? html`
            <div class="stat-item">
              <span class="stat-label">Kilométrage</span>
              <span class="stat-value">${mileage} km</span>
            </div>
          ` : ''}
          ${location != null ? html`
            <div class="stat-item">
              <span class="stat-label">Localisation</span>
              <span class="stat-value">${location}</span>
            </div>
          ` : ''}
          ${isLocked !== null ? html`
            <div class="stat-item">
              <span class="stat-label">Verrouillage</span>
              <span class="stat-value ${isLocked ? 'sf-state-on' : 'sf-state-off'}">
                ${isLocked ? '🔒 Verrouillé' : '🔓 Déverrouillé'}
              </span>
            </div>
          ` : ''}
        </div>

        ${battery != null ? html`
          <div class="battery-bar-bg">
            <div
              class="battery-bar-fill"
              data-level="${batteryLevel}"
              style="width: ${Math.max(0, Math.min(100, battery))}%"
            ></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiVehiclesConfig {
    return { type: `custom:${TAG}`, vehicles: [{ id: 'v1', name: 'Mon véhicule' }] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiVehiclesCard;
  }
}
