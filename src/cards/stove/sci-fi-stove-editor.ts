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
import type { SciFiStoveConfig, SciFiStoveSensors } from './config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-slider.js';
import { stoveLabels, stoveSectionIcons } from './labels.js';

/** Sensor entity fields of the Config section: [config key, label key, icon]. */
const STOVE_SENSOR_FIELDS: ReadonlyArray<readonly [keyof SciFiStoveSensors, string, string]> = [
  ['sensor_actual_power',                    'input-stove-power-consume',      'mdi:lightning-bolt'],
  ['sensor_combustion_chamber_temperature',  'input-stove-combustion-chamber', 'mdi:thermometer'],
  ['sensor_inside_temperature',              'input-room-temperature',         'mdi:home-thermometer-outline'],
  ['sensor_pressure',                        'input-stove-pressure',           'mdi:gauge'],
  ['sensor_fan_speed',                       'input-stove-fan-speed',          'mdi:speedometer'],
  ['sensor_power',                           'input-stove-power-rendered',     'mdi:lightning-bolt'],
  ['sensor_status',                          'input-stove-status',             'mdi:database'],
  ['sensor_time_to_service',                 'input-stove-time-to-service',    'mdi:counter'],
  ['sensor_pellet_quantity',                 'input-pellet-quantity',          'mdi:database'],
];

@customElement('sci-fi-stove-editor')
export class SciFiStoveEditor extends SciFiBaseEditor {
  protected override get cardLabels(): Record<string, string> {
    return stoveLabels();
  }

  protected override get cardSectionIcons(): Record<string, string> {
    return stoveSectionIcons();
  }


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
    return html`
      <div class="card" @input-update="${this._update}">
        <div class="container">
          ${this._renderConfigSection(config)}
          ${this._renderTechnicalSection(config)}
        </div>
      </div>
    `;
  }

  /** 1. Config — sensor entity IDs */
  private _renderConfigSection(config: SciFiStoveConfig): TemplateResult {
    const sensors = config.sensors ?? {};
    return html`
      <section>
        <h1>${this.getSectionTitle('section-title-config')}</h1>
        ${this._renderInput('entity', 'entity', 'input-stove-status', 'mdi:store-settings-outline', config.entity ?? '')}
        ${STOVE_SENSOR_FIELDS.map(([id, labelKey, icon]) =>
          this._renderInput(id, 'sensor', labelKey, icon, sensors[id] ?? ''))}
        ${this._renderInput('storage_counter', 'storage', 'input-storage-counter', 'mdi:database', config.storage_counter ?? '')}
      </section>
    `;
  }

  /** 2. Technical — thresholds */
  private _renderTechnicalSection(config: SciFiStoveConfig): TemplateResult {
    return html`
      <section>
        <h1>${this.getSectionTitle('section-title-technical')}</h1>
        ${this._renderThreshold('pellet_quantity_threshold', 'input-pellet-quantity-threshold', config.pellet_quantity_threshold)}
        ${this._renderThreshold('storage_counter_threshold', 'input-threshold', config.storage_counter_threshold)}
      </section>
    `;
  }

  private _renderInput(elementId: string, kind: string, labelKey: string, icon: string, value: string): TemplateResult {
    return html`
      <sf-editor-input
        element-id="${elementId}"
        kind="${kind}"
        label="${this.getLabel(labelKey)}"
        icon="${icon}"
        .value="${value}"
      ></sf-editor-input>
    `;
  }

  private _renderThreshold(elementId: string, labelKey: string, value: number | undefined): TemplateResult {
    return html`
      <sf-editor-slider
        element-id="${elementId}"
        kind="technical"
        label="${this.getLabel(labelKey)}"
        icon="mdi:counter"
        min="0"
        max="1"
        step="0.1"
        .value="${String(value ?? 0.2)}"
      ></sf-editor-slider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-stove-editor': SciFiStoveEditor;
  }
}
