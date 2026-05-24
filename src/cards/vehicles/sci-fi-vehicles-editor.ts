/**
 * <sci-fi-vehicles-editor> — Graphical editor for the sci-fi-vehicles card.
 *
 * Each vehicle is an accordion with a full sensor form.
 * Vehicle list comes from hass.devices filtered by manufacturer 'Renault'.
 *
 * Spec 10 § sci-fi-vehicles-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiVehiclesConfig,
  SciFiVehicleEntry,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-accordion.js';

@customElement('sci-fi-vehicles-editor')
export class SciFiVehiclesEditor extends SciFiBaseEditor {
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
    vehicles.push({ id: '', name: '' } as typeof vehicles[0]);
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
        <sf-editor-input
          element-id="name"
          kind="vehicle-name"
          label="${this.getLabel('input-name')}"
          icon="mdi:cursor-text"
          .value="${vehicle.name ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'name', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="location"
          kind="vehicle-sensor"
          label="${this.getLabel('input-location')}"
          icon="mdi:map-marker"
          .value="${vehicle.location ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'location', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="location_last_activity"
          kind="vehicle-sensor"
          label="${this.getLabel('input-location-last-activity')}"
          icon="mdi:clock-outline"
          .value="${vehicle.location_last_activity ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'location_last_activity', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="mileage"
          kind="vehicle-sensor"
          label="${this.getLabel('input-mileage')}"
          icon="mdi:counter"
          .value="${vehicle.mileage ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'mileage', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="lock_status"
          kind="vehicle-sensor"
          label="${this.getLabel('input-lock-status')}"
          icon="mdi:lock-outline"
          .value="${vehicle.lock_status ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'lock_status', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="fuel_autonomy"
          kind="vehicle-sensor"
          label="${this.getLabel('input-fuel-autonomy')}"
          icon="mdi:gas-station"
          .value="${vehicle.fuel_autonomy ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'fuel_autonomy', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="fuel_quantity"
          kind="vehicle-sensor"
          label="${this.getLabel('input-fuel-quantity')}"
          icon="mdi:fuel"
          .value="${vehicle.fuel_quantity ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'fuel_quantity', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="battery_autonomy"
          kind="vehicle-sensor"
          label="${this.getLabel('input-battery-autonomy')}"
          icon="mdi:ev-station"
          .value="${vehicle.battery_autonomy ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'battery_autonomy', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="battery_level"
          kind="vehicle-sensor"
          label="${this.getLabel('input-battery-level')}"
          icon="mdi:battery-medium"
          .value="${vehicle.battery_level ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'battery_level', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="charging"
          kind="vehicle-sensor"
          label="${this.getLabel('input-charging-state')}"
          icon="mdi:ev-plug-type2"
          .value="${vehicle.charging ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'charging', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="plug_state"
          kind="vehicle-sensor"
          label="${this.getLabel('input-plug-state')}"
          icon="mdi:power-plug-outline"
          .value="${vehicle.plug_state ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'plug_state', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-input
          element-id="charging_remaining_time"
          kind="vehicle-sensor"
          label="${this.getLabel('input-remainting-charging-time')}"
          icon="mdi:clock-fast"
          .value="${vehicle.charging_remaining_time ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVehicle(index, 'charging_remaining_time', e.detail.value)}"
        ></sf-editor-input>
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
