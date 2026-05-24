/**
 * <sci-fi-plugs> — v1.0.0
 * Plug/switch devices with power monitoring display.
 * ADR-005: sensors = Record<entityId, SciFiPlugSensorEntry> (not {power: string, energy: string}).
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiPlugsConfig, SciFiPlugDevice } from '../../types/config.js';

const TAG = 'sci-fi-plugs';

@customElement(TAG)
export class SciFiPlugsCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .plugs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--sf-spacing-sm);
      }
      .plug-tile {
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius);
        padding: var(--sf-spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--sf-spacing-xs);
        transition: border-color var(--sf-transition-fast);
      }
      .plug-tile[data-on="true"] {
        border-color: var(--sf-accent-on);
      }
      .plug-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sf-spacing-xs);
      }
      .plug-name {
        font-size: var(--sf-font-size-base);
        font-weight: 600;
        color: var(--sf-text-primary);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .plug-power {
        font-size: var(--sf-font-size-xl);
        font-weight: 700;
        color: var(--sf-primary);
      }
      .sensors-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sensor-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
      }
      .sensor-row.power-sensor { color: var(--sf-primary); font-weight: 600; }
      .plug-btn {
        width: 100%;
        padding: var(--sf-spacing-xs);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        background: var(--sf-bg);
        color: var(--sf-text-primary);
        font-size: var(--sf-font-size-sm);
        cursor: pointer;
        transition: all var(--sf-transition-fast);
        margin-top: var(--sf-spacing-xs);
      }
      .plug-btn:hover {
        background: var(--sf-primary-dim);
        border-color: var(--sf-primary);
      }

      /* ── Responsive ───────────────────────────────────────── */
      @container sf-card (max-width: 1023px) {
        .plugs-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      }
      @container sf-card (max-width: 599px) {
        .plugs-grid { grid-template-columns: 1fr; }
        .container { padding: var(--sf-spacing-sm); }
      }
    `,
  ];

  declare config: SciFiPlugsConfig;

  protected override renderCard(): TemplateResult {
    const devices = this.config.devices ?? [];
    return html`
      <ha-card>
        ${this.config.header_message
          ? html`<div class="sf-header">${this.config.header_message}</div>`
          : ''}
        <div class="container">
          <div class="plugs-grid">
            ${repeat(devices, d => d.device_id, d => this._renderPlug(d))}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderPlug(device: SciFiPlugDevice): TemplateResult {
    const switchState = this.hass.states[device.entity_id];
    const isOn = switchState?.state === 'on';

    const name = device.name
      ?? switchState?.attributes.friendly_name
      ?? device.entity_id;

    const icon = isOn
      ? (device.active_icon ?? 'mdi:power-plug')
      : (device.inactive_icon ?? 'mdi:power-plug-off');

    // ADR-005: sensors = Record<entityId, SciFiPlugSensorEntry>
    // Each key is the sensor entity_id; entry.power === true marks the "main" power sensor
    const sensorEntries = Object.entries(device.sensors ?? {});
    const visibleSensors = sensorEntries.filter(([, e]) => e.show !== false);
    const powerSensor = sensorEntries.find(([, e]) => e.power === true);
    const powerValue = powerSensor
      ? this.hass.states[powerSensor[0]]?.state
      : undefined;

    return html`
      <div class="plug-tile" data-on="${isOn}">
        <div class="plug-header">
          <span class="plug-name ${isOn ? 'sf-state-on' : 'sf-state-off'}">${name}</span>
          <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        </div>

        ${powerValue !== null && powerValue !== undefined ? html`<div class="plug-power">${powerValue} W</div>` : ''}

        ${visibleSensors.length > 0 ? html`
          <div class="sensors-list">
            ${visibleSensors.map(([entityId, entry]) => {
              const sensorState = this.hass.states[entityId];
              const val = sensorState?.state;
              const unit = sensorState?.attributes['unit_of_measurement'] as string | undefined;
              const label = entry.name ?? sensorState?.attributes.friendly_name ?? entityId;
              return val !== null && val !== undefined ? html`
                <div class="sensor-row ${entry.power ? 'power-sensor' : ''}">
                  <span>${label}</span>
                  <span>${val}${unit ? ` ${unit}` : ''}</span>
                </div>
              ` : '';
            })}
          </div>
        ` : ''}

        <button
          class="plug-btn"
          @click="${() => this._toggle(device.entity_id, isOn)}"
          aria-label="${isOn ? 'Éteindre' : 'Allumer'} ${name}"
        >${isOn ? 'Éteindre' : 'Allumer'}</button>
      </div>
    `;
  }

  private _toggle(entityId: string, currentlyOn: boolean): void {
    void this.hass.callService('switch', currentlyOn ? 'turn_off' : 'turn_on', {
      entity_id: entityId,
    });
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiPlugsConfig {
    return { type: `custom:${TAG}`, devices: [] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiPlugsCard;
  }
}
