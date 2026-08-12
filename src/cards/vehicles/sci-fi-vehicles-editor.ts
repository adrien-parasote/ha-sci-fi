/**
 * <sci-fi-vehicles-editor> — Graphical editor for the sci-fi-vehicles card.
 *
 * Each vehicle is an accordion with a full sensor form.
 * Vehicle list comes from hass.devices filtered by manufacturer 'Renault'.
 *
 * Spec 10 § sci-fi-vehicles-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiVehiclesConfig,
  SciFiVehicleEntry,
} from './config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-accordion.js';
import { vehiclesLabels } from './labels.js';

/**
 * Text fields of a vehicle entry, in render order:
 * [config key, input kind, label key, icon].
 */
const VEHICLE_FIELDS: ReadonlyArray<readonly [keyof SciFiVehicleEntry, string, string, string]> = [
  ['name',                    'vehicle-name',   'input-name',                    'mdi:cursor-text'],
  ['location',                'vehicle-sensor', 'input-location',                'mdi:map-marker'],
  ['location_last_activity',  'vehicle-sensor', 'input-location-last-activity',  'mdi:clock-outline'],
  ['mileage',                 'vehicle-sensor', 'input-mileage',                 'mdi:counter'],
  ['lock_status',             'vehicle-sensor', 'input-lock-status',             'mdi:lock-outline'],
  ['fuel_autonomy',           'vehicle-sensor', 'input-fuel-autonomy',           'mdi:gas-station'],
  ['fuel_quantity',           'vehicle-sensor', 'input-fuel-quantity',           'mdi:fuel'],
  ['battery_autonomy',        'vehicle-sensor', 'input-battery-autonomy',        'mdi:ev-station'],
  ['battery_level',           'vehicle-sensor', 'input-battery-level',           'mdi:battery-medium'],
  ['charging',                'vehicle-sensor', 'input-charging-state',          'mdi:ev-plug-type2'],
  ['plug_state',              'vehicle-sensor', 'input-plug-state',              'mdi:power-plug-outline'],
  ['charging_remaining_time', 'vehicle-sensor', 'input-remainting-charging-time','mdi:clock-fast'],
];

@customElement('sci-fi-vehicles-editor')
export class SciFiVehiclesEditor extends SciFiBaseEditor {
  protected override get cardLabels(): Record<string, string> {
    return vehiclesLabels();
  }

  @state() private _vehiclesList: EditorHassEntity[] = [];

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass?.devices || this._vehiclesList.length > 0) return;
    this._vehiclesList = Object.values(hass.devices)
      .filter(d => d.manufacturer === 'Renault')
      .map(d => ({
        entity_id: d.id,
        attributes: {
          friendly_name: d.name ?? d.id,
          icon: 'sf:landspeeder',
        },
      }));
  }

  private _updateVehicle(
    index: number,
    field: string,
    value: string
  ): void {
    const newConfig = this._getNewConfig<SciFiVehiclesConfig>();
    const vehicles = [...(newConfig.vehicles ?? [])].map(v => ({ ...v }));
    vehicles[index] = { ...vehicles[index], [field]: value } as unknown as SciFiVehicleEntry;
    (newConfig as unknown as Record<string, unknown>)['vehicles'] = vehicles;
    this._dispatchChange(newConfig);
  }

  private _addVehicle(): void {
    const newConfig = this._getNewConfig<SciFiVehiclesConfig>();
    const vehicles = [...(newConfig.vehicles ?? [])].map(v => ({ ...v }));
    vehicles.push({ id: '', name: '' });
    (newConfig as unknown as Record<string, unknown>)['vehicles'] = vehicles;
    this._dispatchChange(newConfig);
  }

  private _removeVehicle(e: CustomEvent<InputUpdateDetail>): void {
    const index = parseInt(e.detail.id, 10);
    if (isNaN(index)) return;
    const newConfig = this._getNewConfig<SciFiVehiclesConfig>();
    const vehicles = [...(newConfig.vehicles ?? [])].map(v => ({ ...v }));
    vehicles.splice(index, 1);
    (newConfig as unknown as Record<string, unknown>)['vehicles'] = vehicles;
    this._dispatchChange(newConfig);
  }

  private _renderVehicle(vehicle: SciFiVehicleEntry, index: number): TemplateResult {
    const title = vehicle.name || vehicle.id || `Vehicle ${index + 1}`;
    return html`
      <sf-editor-accordion
        title="${title}"
        element-id="${index}"
        icon="sf:landspeeder"
        ?deletable="${true}"
        @input-update="${this._removeVehicle}"
      >
        <sf-editor-dropdown-entity
          element-id="id"
          kind="vehicle-id"
          label="${this.getLabel('section-title-vehicle')}"
          icon="mdi:selection-ellipse-arrow-inside"
          .value="${vehicle.id ?? ''}"
          .items="${this._vehiclesList}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'id', e.detail.value)}"
        ></sf-editor-dropdown-entity>
        ${VEHICLE_FIELDS.map(([field, kind, labelKey, icon]) => html`
          <sf-editor-input
            element-id="${field}"
            kind="${kind}"
            label="${this.getLabel(labelKey)}"
            icon="${icon}"
            .value="${vehicle[field] ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, field, e.detail.value)}"
          ></sf-editor-input>
        `)}
      </sf-editor-accordion>
    `;
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiVehiclesConfig;
    const vehicles = config.vehicles ?? [];
    return html`
      <div class="card">
        <div class="container">
          <section>
            <h1>${this.getSectionTitle('section-title-vehicle')}</h1>
            ${vehicles.map((v, i) => this._renderVehicle(v, i))}
            <button class="add-btn" @click="${this._addVehicle}">
              + ${this.getLabel('action-add-vehicle')}
            </button>
          </section>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-vehicles-editor': SciFiVehiclesEditor;
  }
}
