/**
 * <sci-fi-stove-editor> — Graphical editor for the sci-fi-stove card.
 *
 * Sections:
 *   1. Config     — all sensor entity inputs
 *   2. Technical  — threshold sliders
 *
 * Spec 10 § sci-fi-stove-editor
 */

import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type { SciFiStoveConfig } from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-slider.js';

@customElement('sci-fi-stove-editor')
export class SciFiStoveEditor extends SciFiBaseEditor {

  static override styles = [sciFiEditorCommonStyles];

  private _update(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiStoveConfig>();
    const { id, kind, value } = e.detail;

    if (kind === 'sensor') {
      newConfig.sensors = { ...(newConfig.sensors ?? {}), [id]: value };
    } else if (kind === 'technical') {
      (newConfig as unknown as Record<string, unknown>)[id] = parseFloat(value);
    } else {
      (newConfig as unknown as Record<string, unknown>)[id] = value;
    }

    this._dispatchChange(newConfig);
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiStoveConfig;
    const sensors = config.sensors ?? {};
    return html`
      <div class="card" @input-update="${this._update}">
        <div class="container">

          <!-- 1. Config — sensor entity IDs -->
          <section>
            <h1>${this.getSectionTitle('section-title-config')}</h1>
            <sf-editor-input
              element-id="entity"
              kind="entity"
              label="${this.getLabel('input-stove-status')}"
              icon="mdi:store-settings-outline"
              .value="${config.entity ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_actual_power"
              kind="sensor"
              label="${this.getLabel('input-stove-power-consume')}"
              icon="mdi:lightning-bolt"
              .value="${sensors.sensor_actual_power ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_combustion_chamber_temperature"
              kind="sensor"
              label="${this.getLabel('input-stove-combustion-chamber')}"
              icon="mdi:thermometer"
              .value="${sensors.sensor_combustion_chamber_temperature ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_inside_temperature"
              kind="sensor"
              label="${this.getLabel('input-room-temperature')}"
              icon="mdi:home-thermometer-outline"
              .value="${sensors.sensor_inside_temperature ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_pressure"
              kind="sensor"
              label="${this.getLabel('input-stove-pressure')}"
              icon="mdi:gauge"
              .value="${sensors.sensor_pressure ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_fan_speed"
              kind="sensor"
              label="${this.getLabel('input-stove-fan-speed')}"
              icon="mdi:speedometer"
              .value="${sensors.sensor_fan_speed ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_power"
              kind="sensor"
              label="${this.getLabel('input-stove-power-rendered')}"
              icon="mdi:lightning-bolt"
              .value="${sensors.sensor_power ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_status"
              kind="sensor"
              label="${this.getLabel('input-stove-status')}"
              icon="mdi:database"
              .value="${sensors.sensor_status ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_time_to_service"
              kind="sensor"
              label="${this.getLabel('input-stove-time-to-service')}"
              icon="mdi:counter"
              .value="${sensors.sensor_time_to_service ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="sensor_pellet_quantity"
              kind="sensor"
              label="${this.getLabel('input-pellet-quantity')}"
              icon="mdi:database"
              .value="${sensors.sensor_pellet_quantity ?? ''}"
            ></sf-editor-input>
            <sf-editor-input
              element-id="storage_counter"
              kind="storage"
              label="${this.getLabel('input-storage-counter')}"
              icon="mdi:database"
              .value="${config.storage_counter ?? ''}"
            ></sf-editor-input>
          </section>

          <!-- 2. Technical — thresholds -->
          <section>
            <h1>${this.getSectionTitle('section-title-technical')}</h1>
            <sf-editor-slider
              element-id="pellet_quantity_threshold"
              kind="technical"
              label="${this.getLabel('input-pellet-quantity-threshold')}"
              icon="mdi:counter"
              min="0"
              max="1"
              step="0.1"
              .value="${String(config.pellet_quantity_threshold ?? 0.2)}"
            ></sf-editor-slider>
            <sf-editor-slider
              element-id="storage_counter_threshold"
              kind="technical"
              label="${this.getLabel('input-threshold')}"
              icon="mdi:counter"
              min="0"
              max="1"
              step="0.1"
              .value="${String(config.storage_counter_threshold ?? 0.2)}"
            ></sf-editor-slider>
          </section>

        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-stove-editor': SciFiStoveEditor;
  }
}
