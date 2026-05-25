/**
 * <sci-fi-stove> — v2.0.0
 * Full reconstruction: layout matching the JS main branch original.
 * - Header: centered friendly_name
 * - Content: stove SVG image (left) + info panel (right)
 *   - TOP zone:  pellet circle-progress + storage stack-bar
 *   - MIDDLE zone: status list (time-to-service, state, temps, pressure)
 *   - BOTTOM zone: power row (rendered, consumed, fan)
 * - Bottom: interactive controls (mode, temperature wheel, preset)
 *
 * ADR-005: preserves entity (not entity_id), all sensors, storage_counter, thresholds.
 * CSS selectors required by tests: .sensor-tile, .sensor-tile.warn,
 *   .bar-fill.pellet, .bar-fill.storage, .stove-status
 */
import { html, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { stoveStyles } from './styles.js';
import type { SciFiStoveConfig } from '../../types/config.js';

import '../../components/sf-stove-image.js';
import '../../components/sf-circle-progress-bar.js';
import '../../components/sf-stack-bar.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/sf-wheel.js';
import '../../components/buttons/sf-button-card-select.js';

const TAG = 'sci-fi-stove';

// ── Status display helpers (ported from main/src/cards/stove/const.js) ────────
const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  off:            { icon: 'sci:stove-off',  color: 'off' },
  pre_heating:    { icon: 'sci:stove-heat', color: 'amber' },
  ignition:       { icon: 'sci:stove-heat', color: 'amber' },
  pre_combustion: { icon: 'sci:stove-heat', color: 'red' },
  combustion:     { icon: 'sci:stove-heat', color: 'red' },
  eco:            { icon: 'sci:stove-eco',  color: 'green' },
  cooling:        { icon: 'sci:stove-cool', color: 'blue' },
};

const STATUS_LABELS: Record<string, string> = {
  off:            'off',
  pre_heating:    'pre-heating',
  ignition:       'ignition',
  combustion:     'combustion',
  pre_combustion: 'pre-combustion',
  eco:            'eco',
  cooling:        'cooling',
  unknown:        'unknown',
};

const HVAC_ICONS: Record<string, string> = {
  off:  'mdi:power',
  heat: 'mdi:fire',
  cool: 'mdi:snowflake',
};

const PRESET_ICONS: Record<string, string> = {
  none: 'mdi:circle-medium',
  eco:  'mdi:leaf',
};

@customElement(TAG)
export class SciFiStoveCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, stoveStyles];

  declare config: SciFiStoveConfig;

  protected override renderCard(): TemplateResult {
    const stoveState = this.hass.states[this.config.entity];
    if (!stoveState) {
      return html`<ha-card><div class="container">Entité poêle non trouvée : ${this.config.entity}</div></ha-card>`;
    }

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(stoveState.attributes.friendly_name ?? 'Poêle')}
          ${this._renderContent(stoveState)}
          ${this._renderBottom(stoveState)}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── HEADER ────────────────────────────────────────────────────────────────

  private _renderHeader(name: string): TemplateResult {
    return html`<div class="header">${name}</div>`;
  }

  // ── CONTENT ───────────────────────────────────────────────────────────────

  private _renderContent(stoveState: any): TemplateResult {
    const s = this.config.sensors ?? {};
    return html`
      <div class="content">
        <sf-stove-image state=${stoveState.state}></sf-stove-image>
        <div class="info">
          ${this._renderTopZone(s)}
          ${this._renderMiddleZone(stoveState, s)}
          ${this._renderPowerZone(s)}
        </div>
      </div>
    `;
  }

  /** TOP zone: pellet circle gauge + storage stack bar */
  private _renderTopZone(s: any): TemplateResult {
    return html`
      <div class="e bottom-path">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="d-path"></div>
        </div>
        <div class="quantities">
          ${this._renderPelletQuantity(s)}
          ${this._renderPelletStock()}
        </div>
      </div>
    `;
  }

  private _renderPelletQuantity(s: any): TemplateResult | typeof nothing {
    if (!s.sensor_pellet_quantity) return nothing;
    const pelletState = this.hass.states[s.sensor_pellet_quantity];
    if (!pelletState) return nothing;
    const val = parseFloat(pelletState.state);
    if (isNaN(val)) return nothing;
    const threshold = this.config.pellet_quantity_threshold ?? 0.1;
    return html`
      <sf-circle-progress-bar
        text="${msg('Fuel quantity')}"
        .val=${Math.round(val)}
        .threshold=${threshold}
      ></sf-circle-progress-bar>
    `;
  }

  private _renderPelletStock(): TemplateResult | typeof nothing {
    if (!this.config.storage_counter) return nothing;
    const st = this.hass.states[this.config.storage_counter];
    if (!st) return nothing;
    const val = parseInt(st.state, 10);
    const max = (st.attributes['maximum'] as number | undefined) ?? 100;
    const threshold = this.config.storage_counter_threshold ?? 0.1;
    return html`
      <sf-stack-bar
        text="${msg('Stock')}"
        .val=${val}
        .max=${max}
        .threshold=${threshold}
      ></sf-stack-bar>
    `;
  }

  /** MIDDLE zone: status list with border-left line */
  private _renderMiddleZone(stoveState: any, s: any): TemplateResult {
    const tempUnit = this.hass.config?.unit_system?.temperature ?? '°C';
    const pressureUnit = this.hass.config?.unit_system?.pressure ?? 'Pa';
    const status = s.sensor_status ? this.hass.states[s.sensor_status]?.state : undefined;
    const insideTemp = s.sensor_inside_temperature ? this.hass.states[s.sensor_inside_temperature]?.state : undefined;
    const combustionTemp = s.sensor_combustion_chamber_temperature ? this.hass.states[s.sensor_combustion_chamber_temperature]?.state : undefined;
    const pressure = s.sensor_pressure ? this.hass.states[s.sensor_pressure]?.state : undefined;
    const timeToService = s.sensor_time_to_service ? this.hass.states[s.sensor_time_to_service]?.state : undefined;
    const timeUnit: string = s.sensor_time_to_service
      ? String(this.hass.states[s.sensor_time_to_service]?.attributes?.unit_of_measurement ?? 'h')
      : 'h';

    return html`
      <div class="m">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
        </div>
        <div class="temperatures">
          ${this._renderTimeToService(timeToService, timeUnit)}
          ${this._renderStatus(msg('Status'), status)}
          ${this._renderTemperature(msg('External'), insideTemp ? parseFloat(insideTemp) : undefined, tempUnit)}
          ${this._renderTemperature(msg('Internal'), combustionTemp ? parseFloat(combustionTemp) : undefined, tempUnit)}
          ${this._renderPressure(msg('Pressure'), pressure, pressureUnit)}
        </div>
      </div>
    `;
  }

  private _renderTimeToService(hours: string | undefined, unit: string): TemplateResult | typeof nothing {
    if (!hours) return nothing;
    const h = parseInt(hours, 10);
    const state = h <= 240 ? 'high' : h <= 480 ? 'medium' : null;
    return html`
      <div class="temperature ${state ?? ''}">
        <sf-icon icon="mdi:timeline-clock-outline" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${msg('Time to Service')}:</div>
        <div>${h}${unit}</div>
      </div>
    `;
  }

  private _renderStatus(text: string, status: string | undefined): TemplateResult {
    const resolved = status ?? 'N/A';
    const meta = STATUS_ICONS[resolved] ?? { icon: 'sci:stove-unknow', color: 'off' };
    const label = STATUS_LABELS[resolved] ?? resolved.replace('_', ' ');
    return html`
      <div class="status ${meta.color}">
        <sf-icon icon="${meta.icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div class="stove-status">${label}</div>
      </div>
    `;
  }

  private _renderTemperature(text: string, temp: number | undefined, unit: string): TemplateResult {
    if (temp === undefined || temp === null) {
      return html`
        <div class="temperature off">
          <div class="no-temp">
            <sf-icon icon="mdi:thermometer" .connection="${this.hass.connection}"></sf-icon>
            <sf-icon icon="mdi:help" .connection="${this.hass.connection}"></sf-icon>
          </div>
          <div class="label">${text}:</div>
          <div>N/A</div>
        </div>
      `;
    }
    let icon = 'mdi:thermometer-off';
    let state = 'off';
    if (temp >= 25) { icon = 'mdi:thermometer-high'; state = 'high'; }
    else if (temp >= 16) { icon = 'mdi:thermometer'; state = 'medium'; }
    else { icon = 'mdi:thermometer-low'; state = 'low'; }
    return html`
      <div class="temperature ${state}">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div>${temp}${unit}</div>
      </div>
    `;
  }

  private _renderPressure(text: string, pressure: string | undefined, unit: string): TemplateResult | typeof nothing {
    if (!pressure) return nothing;
    return html`
      <div class="temperature ${pressure === '0' ? 'off' : ''}">
        <sf-icon icon="mdi:gauge" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}:</div>
        <div>${pressure}${unit}</div>
      </div>
    `;
  }

  /** BOTTOM of content: power row */
  private _renderPowerZone(s: any): TemplateResult {
    const actualPower = s.sensor_actual_power ? this.hass.states[s.sensor_actual_power] : undefined;
    const power = s.sensor_power ? this.hass.states[s.sensor_power] : undefined;
    const fanSpeed = s.sensor_fan_speed ? this.hass.states[s.sensor_fan_speed] : undefined;

    return html`
      <div class="e top-path">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="d-path"></div>
        </div>
        <div class="powers">
          ${this._renderPower(msg('Render'), actualPower?.state, actualPower?.attributes?.unit_of_measurement as string | undefined)}
          ${this._renderPower(msg('Consume'), power?.state, power?.attributes?.unit_of_measurement as string | undefined)}
          ${this._renderFan(msg('Fan speed'), fanSpeed?.state, fanSpeed?.attributes?.unit_of_measurement as string | undefined)}
        </div>
      </div>
    `;
  }

  private _renderPower(text: string, value: string | undefined, unit: string | undefined): TemplateResult {
    const display = value ?? 'N/A';
    return html`
      <div class="power">
        <sf-icon icon="mdi:lightning-bolt" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}</div>
        <div class="${display === 'N/A' ? 'nothing' : ''}">${display} ${unit ?? ''}</div>
      </div>
    `;
  }

  private _renderFan(text: string, value: string | undefined, unit: string | undefined): TemplateResult | typeof nothing {
    if (value === undefined || value === null) return nothing;
    return html`
      <div class="power">
        <sf-icon icon="mdi:speedometer" .connection="${this.hass.connection}"></sf-icon>
        <div class="label">${text}</div>
        <div>${value} ${unit ?? ''}</div>
      </div>
    `;
  }

  // ── BOTTOM INTERACTIVE ────────────────────────────────────────────────────

  private _renderBottom(stoveState: any): TemplateResult {
    const hvacModes: string[] = stoveState.attributes.hvac_modes ?? [];
    const presetModes: string[] = stoveState.attributes.preset_modes ?? [];
    const currentPreset: string = stoveState.attributes.preset_mode ?? 'none';
    const targetTemp: number = stoveState.attributes.temperature ?? stoveState.attributes.current_temperature ?? 20;
    const minTemp: number = stoveState.attributes.min_temp ?? 15;
    const maxTemp: number = stoveState.attributes.max_temp ?? 30;

    const hvacItems = hvacModes.map(m => ({
      id: m, text: m, icon: HVAC_ICONS[m] ?? 'mdi:information-off-outline',
    }));

    const presetItems = presetModes.map(p => ({
      id: p, text: p, icon: PRESET_ICONS[p] ?? 'mdi:circle-medium',
    }));

    // Build temperature wheel items (min..max step 1)
    const tempItems = Array.from({ length: maxTemp - minTemp + 1 }, (_, i) => ({
      id: String(minTemp + i),
      text: `${minTemp + i}°C`,
    }));

    return html`
      <div class="bottom">
        <sf-button-card-select
          icon="${HVAC_ICONS[stoveState.state] ?? 'mdi:information-off-outline'}"
          title="${msg('Mode')}"
          text="${this._getHvacLabel(stoveState.state)}"
          .items="${hvacItems}"
          position="bottom"
          @button-select="${(e: CustomEvent) => this._onHvacSelect(e, stoveState.attributes.entity_id ?? this.config.entity)}"
        ></sf-button-card-select>

        <sf-wheel
          .items="${tempItems}"
          .selectedId="${String(Math.round(targetTemp))}"
          text="${msg('Temperature')}"
          @wheel-change="${(e: CustomEvent) => this._onTempChange(e, stoveState.attributes.entity_id ?? this.config.entity)}"
        ></sf-wheel>

        <sf-button-card-select
          icon="${PRESET_ICONS[currentPreset] ?? 'mdi:circle-medium'}"
          title="${msg('Preset')}"
          text="${this._getPresetLabel(currentPreset)}"
          .items="${presetItems}"
          position="bottom"
          @button-select="${(e: CustomEvent) => this._onPresetSelect(e, stoveState.attributes.entity_id ?? this.config.entity)}"
        ></sf-button-card-select>
      </div>
    `;
  }

  private _getHvacLabel(state: string): string {
    const labels: Record<string, string> = { off: msg('Off'), heat: msg('Heat'), cool: msg('Cool'), auto: msg('Auto') };
    return labels[state] ?? state;
  }

  private _getPresetLabel(preset: string): string {
    const labels: Record<string, string> = { none: msg('None'), eco: msg('Eco') };
    return labels[preset] ?? preset;
  }

  private _onHvacSelect(e: CustomEvent, entityId: string): void {
    const mode: string = e.detail.id;
    void this.hass
      .callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode })
      .then(() => { this._showToast(false, 'Mode HVAC modifié'); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _onTempChange(e: CustomEvent, entityId: string): void {
    const temp = parseFloat(e.detail.id);
    if (!isNaN(temp)) {
      void this.hass
        .callService('climate', 'set_temperature', { entity_id: entityId, temperature: temp })
        .then(() => { this._showToast(false, 'Température modifiée'); })
        .catch((err: Error) => { this._showToast(true, err.message); });
    }
  }

  private _onPresetSelect(e: CustomEvent, entityId: string): void {
    const preset: string = e.detail.id;
    void this.hass
      .callService('climate', 'set_preset_mode', { entity_id: entityId, preset_mode: preset })
      .then(() => { this._showToast(false, 'Preset modifié'); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _showToast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  // ── Card registration ─────────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiStoveConfig {
    return { type: `custom:${TAG}`, entity: 'climate.poele' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiStoveCard;
  }
}
