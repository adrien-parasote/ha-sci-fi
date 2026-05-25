/**
 * <sci-fi-stove> — v1.0.0
 * Pellet stove monitoring: state, combustion temp, pellet level, power, fan speed, etc.
 * ADR-005: uses entity (not entity_id) + all sensors + storage_counter + thresholds preserved.
 */

import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { stoveStyles } from './styles.js';
import type { SciFiStoveConfig, SciFiStoveSensors } from '../../types/config.js';

const TAG = 'sci-fi-stove';

interface SensorTile {
  label: string;
  value: string | undefined;
  unit?: string;
  icon?: string;
}

@customElement(TAG)
export class SciFiStoveCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, stoveStyles];

  declare config: SciFiStoveConfig;

  protected override renderCard(): TemplateResult {
    // ADR-005: field is entity (not entity_id)
    const stoveState = this.hass.states[this.config.entity];
    if (!stoveState) {
      return html`<ha-card><div class="container">Entité poêle non trouvée : ${this.config.entity}</div></ha-card>`;
    }

    const isOn = stoveState.state !== 'off' && stoveState.state !== 'unavailable';
    const sensors: SciFiStoveSensors = this.config.sensors ?? {};

    const tiles = this._buildSensorTiles(sensors);

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="header">
          <div class="header-icon">
            <sf-icon
              .icon="${isOn ? 'sci:stove-heat' : 'sci:stove-off'}"
              .connection="${this.hass.connection}"
            ></sf-icon>
          </div>
          <div class="header-info">
            <div class="stove-name">${stoveState.attributes.friendly_name ?? 'Poêle'}</div>
            <div class="stove-status ${isOn ? 'sf-state-on' : 'sf-state-off'}">${stoveState.state}</div>
          </div>
        </div>

        <div class="container">
          <div class="sensors-grid">
            ${tiles.map(t => t.value !== null && t.value !== undefined ? this._renderSensorTile(t) : '')}
            ${this._renderPelletBar(sensors)}
            ${this._renderStorageCounter()}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _buildSensorTiles(s: SciFiStoveSensors): SensorTile[] {
    const get = (key: string | undefined) => key ? this.hass.states[key]?.state : undefined;
    const deg = (key: string | undefined) => {
      const v = get(key);
      return v !== null && v !== undefined ? `${v}°` : undefined;
    };
    return [
      { label: 'Puissance',     value: get(s.sensor_actual_power),                   unit: 'W',  icon: 'mdi:lightning-bolt' },
      { label: 'Chambre comb.', value: deg(s.sensor_combustion_chamber_temperature),            icon: 'mdi:thermometer-high' },
      { label: 'Temp. int.',    value: deg(s.sensor_inside_temperature),                        icon: 'mdi:home-thermometer' },
      { label: 'Conso. poêle', value: get(s.sensor_power),                           unit: 'W',  icon: 'mdi:meter-electric' },
      { label: 'Vitesse vent.', value: get(s.sensor_fan_speed),                                 icon: 'mdi:fan' },
      { label: 'Pression',      value: get(s.sensor_pressure),                       unit: 'Pa', icon: 'mdi:gauge' },
      { label: 'Prochain SAV',  value: get(s.sensor_time_to_service),                unit: 'h',  icon: 'mdi:wrench-clock' },
    ];
  }

  private _renderSensorTile(tile: SensorTile): TemplateResult {
    return html`
      <div class="sensor-tile">
        <div class="sensor-value">${tile.value}${tile.unit ? ` ${tile.unit}` : ''}</div>
        <div class="sensor-label">${tile.label}</div>
      </div>
    `;
  }

  /** ADR-005: sensor_pellet_quantity + pellet_quantity_threshold preserved. */
  private _renderPelletBar(s: SciFiStoveSensors): TemplateResult {
    if (!s.sensor_pellet_quantity) return html``;
    const pelletState = this.hass.states[s.sensor_pellet_quantity];
    if (!pelletState) return html``;

    const pct = parseFloat(pelletState.state);
    if (isNaN(pct)) return html``;

    const threshold = this.config.pellet_quantity_threshold;
    const isWarn = threshold !== null && threshold !== undefined && pct / 100 < threshold;

    return html`
      <div class="sensor-tile ${isWarn ? 'warn' : ''}">
        <div class="sensor-value">${pct}%</div>
        <div class="sensor-label">Granulés</div>
        <div class="bar-bg">
          <div class="bar-fill pellet" style="width: ${Math.max(0, Math.min(100, pct))}%"></div>
        </div>
      </div>
    `;
  }

  /** ADR-005: storage_counter + storage_counter_threshold preserved. */
  private _renderStorageCounter(): TemplateResult {
    if (!this.config.storage_counter) return html``;
    const counterState = this.hass.states[this.config.storage_counter];
    if (!counterState) return html``;

    const current = parseInt(counterState.state, 10);
    const max = counterState.attributes['maximum'] as number | undefined;
    const pct = max && max > 0 ? Math.round((current / max) * 100) : null;

    const threshold = this.config.storage_counter_threshold;
    const isWarn = threshold !== null && threshold !== undefined && pct !== null && pct !== undefined && pct / 100 < threshold;

    return html`
      <div class="sensor-tile ${isWarn ? 'warn' : ''}">
        <div class="sensor-value">${current}${max !== null && max !== undefined ? ` / ${max}` : ''}</div>
        <div class="sensor-label">Stock sacs</div>
        ${pct !== null && pct !== undefined ? html`
          <div class="bar-bg">
            <div class="bar-fill storage" style="width: ${Math.max(0, Math.min(100, pct))}%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiStoveConfig {
    // ADR-005: entity (not entity_id)
    return { type: `custom:${TAG}`, entity: 'climate.poele' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiStoveCard;
  }
}
