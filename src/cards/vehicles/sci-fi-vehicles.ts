/**
 * <sci-fi-vehicles> — v1.0.0
 * Vehicle monitoring: charging state, battery, autonomy, location, fuel.
 * ADR-005: battery_autonomy + fuel_autonomy (not range), added 7 missing fields.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiVehiclesConfig, SciFiVehicleEntry } from '../../types/config.js';

const TAG = 'sci-fi-vehicles';

interface StatEntry {
  label: string;
  value: string | null | undefined;
  unit?: string;
  className?: string;
}

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

  private _getState(entityId: string | undefined): string | null {
    if (!entityId) return null;
    return this.hass.states[entityId]?.state ?? null;
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

    // ADR-005: battery_autonomy + fuel_autonomy (was range in v1.0.0-wip)
    const batteryAutonomy = this._getState(v.battery_autonomy);
    const fuelAutonomy = this._getState(v.fuel_autonomy);

    // ADR-005: newly added fields
    const chargeState = this._getState(v.charge_state);
    const plugState = this._getState(v.plug_state);
    const fuelQuantity = this._getState(v.fuel_quantity);
    const mileage = this._getState(v.mileage);
    const location = this._getState(v.location);
    const locationLastActivity = this._getState(v.location_last_activity);
    const chargingTime = this._getState(v.charging_remaining_time);

    const batteryLevel = battery !== null && battery !== undefined
      ? (battery >= 60 ? 'high' : battery >= 30 ? 'mid' : 'low')
      : 'mid';

    const stats: StatEntry[] = [
      { label: 'Batterie', value: battery !== null && battery !== undefined ? `${battery}` : null, unit: '%' },
      { label: 'Autonomie élec.', value: batteryAutonomy, unit: 'km' },
      { label: 'Autonomie carb.', value: fuelAutonomy, unit: 'km' },
      { label: 'Carburant', value: fuelQuantity, unit: 'L' },
      { label: 'Charge', value: chargeState },
      { label: 'Prise', value: plugState },
      { label: 'Temps charge', value: chargingTime, unit: 'min' },
      { label: 'Kilométrage', value: mileage, unit: 'km' },
      { label: 'Localisation', value: location },
      { label: 'Dernière activité', value: locationLastActivity },
      {
        label: 'Verrouillage',
        value: isLocked !== null ? (isLocked ? '🔒 Verrouillé' : '🔓 Déverrouillé') : null,
        className: isLocked ? 'sf-state-on' : 'sf-state-off',
      },
    ].filter(s => s.value !== null && s.value !== undefined && s.value !== '');

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
          ${stats.map(s => html`
            <div class="stat-item">
              <span class="stat-label">${s.label}</span>
              <span class="stat-value ${s.className ?? ''}">${s.value}${s.unit === '%' || s.unit === '°' ? s.unit : s.unit ? ` ${s.unit}` : ''}</span>
            </div>
          `)}
        </div>

        ${battery !== null && battery !== undefined ? html`
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
