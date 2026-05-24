/**
 * <sci-fi-plugs-editor> — Graphical editor for the sci-fi-plugs card.
 *
 * Each plug device is an sf-editor-accordion with:
 *   - Switch entity dropdown
 *   - Custom name input
 *   - Active/inactive icon pickers
 *   - Power sensor entity dropdown
 *   - Energy sensor entity dropdown
 *
 * Spec 10 § sci-fi-plugs-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiPlugsConfig,
  SciFiPlugDevice,
  SciFiPlugSensorEntry,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-accordion.js';

@customElement('sci-fi-plugs-editor')
export class SciFiPlugsEditor extends SciFiBaseEditor {
  @state() private _switchEntities: EditorHassEntity[] = [];
  @state() private _sensorEntities: EditorHassEntity[] = [];

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._switchEntities.length > 0) return;
    const states = Object.values(hass.states);
    this._switchEntities = states
      .filter(e => e.entity_id.startsWith('switch.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'] as string | undefined,
          icon: (e.attributes['icon'] as string | undefined) ?? 'mdi:power-plug',
        },
      }));
    this._sensorEntities = states
      .filter(e => e.entity_id.startsWith('sensor.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'] as string | undefined,
          icon: (e.attributes['icon'] as string | undefined) ?? 'mdi:flash',
        },
      }));
  }

  private _addDevice(): void {
    const newConfig = this._getNewConfig<SciFiPlugsConfig>();
    const devices = ([...(newConfig.devices ?? [])].map(d => ({ ...d })) as unknown as SciFiPlugDevice[]);
    devices.push({ device_id: '', entity_id: '' } as typeof devices[0]);
    (newConfig as unknown as Record<string, unknown>)['devices'] = devices;
    this._dispatchChange(newConfig);
  }

  private _removeDevice(e: CustomEvent<InputUpdateDetail>): void {
    const index = parseInt(e.detail.id, 10);
    if (isNaN(index)) return;
    const newConfig = this._getNewConfig<SciFiPlugsConfig>();
    const devices = ([...(newConfig.devices ?? [])].map(d => ({ ...d })) as unknown as SciFiPlugDevice[]);
    devices.splice(index, 1);
    (newConfig as unknown as Record<string, unknown>)['devices'] = devices;
    this._dispatchChange(newConfig);
  }

  private _updateDeviceField(index: number, field: string, value: string): void {
    const newConfig = this._getNewConfig<SciFiPlugsConfig>();
    const devices = ([...(newConfig.devices ?? [])].map(d => ({ ...d })) as unknown as SciFiPlugDevice[]);
    devices[index] = { ...devices[index], [field]: value } as unknown as SciFiPlugDevice;
    (newConfig as unknown as Record<string, unknown>)['devices'] = devices;
    this._dispatchChange(newConfig);
  }

  private _updateSensor(index: number, isPower: boolean, entityId: string): void {
    const newConfig = this._getNewConfig<SciFiPlugsConfig>();
    const devices = ([...(newConfig.devices ?? [])].map(d => ({ ...d })) as unknown as SciFiPlugDevice[]);
    const device = { ...devices[index] };
    // Build new sensors record: remove existing power/energy entry, add new one
    const existingSensors = { ...(device.sensors ?? {}) };
    // Remove existing entry with same role
    for (const [key, entry] of Object.entries(existingSensors)) {
      if ((entry as SciFiPlugSensorEntry).power === isPower) {
        delete existingSensors[key];
      }
    }
    if (entityId) {
      existingSensors[entityId] = {
        show: true,
        name: isPower ? 'Power' : 'Energy',
        power: isPower,
      };
    }
    device.sensors = Object.keys(existingSensors).length > 0 ? existingSensors : undefined;
    devices[index] = device as unknown as SciFiPlugDevice;
    (newConfig as unknown as Record<string, unknown>)['devices'] = devices;
    this._dispatchChange(newConfig);
  }

  private _getPowerSensorEntityId(device: SciFiPlugDevice): string {
    if (!device.sensors) return '';
    for (const [key, entry] of Object.entries(device.sensors)) {
      if ((entry as SciFiPlugSensorEntry).power === true) return key;
    }
    return '';
  }

  private _getEnergySensorEntityId(device: SciFiPlugDevice): string {
    if (!device.sensors) return '';
    for (const [key, entry] of Object.entries(device.sensors)) {
      if ((entry as SciFiPlugSensorEntry).power !== true) return key;
    }
    return '';
  }

  private _renderDevice(device: SciFiPlugDevice, index: number): TemplateResult {
    const title = device.name || device.entity_id || `Device ${index + 1}`;
    return html`
      <sf-editor-accordion
        title="${title}"
        element-id="${index}"
        icon="mdi:power-plug"
        ?deletable="${true}"
        @input-update="${this._removeDevice}"
      >
        <sf-editor-dropdown-entity
          element-id="entity_id"
          kind="plug-switch"
          label="${msg('Switch entity')}"
          icon="mdi:devices"
          .value="${device.entity_id ?? ''}"
          .items="${this._switchEntities}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateDeviceField(index, 'entity_id', e.detail.value)}"
        ></sf-editor-dropdown-entity>
        <sf-editor-input
          element-id="name"
          kind="plug-name"
          label="${this.getLabel('input-name')}"
          icon="mdi:cursor-text"
          .value="${device.name ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateDeviceField(index, 'name', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-dropdown-icon
          element-id="active_icon"
          kind="plug-icon"
          label="${this.getLabel('input-active-icon')}"
          .value="${device.active_icon ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateDeviceField(index, 'active_icon', e.detail.value)}"
        ></sf-editor-dropdown-icon>
        <sf-editor-dropdown-icon
          element-id="inactive_icon"
          kind="plug-icon"
          label="${this.getLabel('input-inactive-icon')}"
          .value="${device.inactive_icon ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateDeviceField(index, 'inactive_icon', e.detail.value)}"
        ></sf-editor-dropdown-icon>
        <sf-editor-dropdown-entity
          element-id="power_sensor"
          kind="plug-power-sensor"
          label="${this.getLabel('input-power')}"
          icon="mdi:flash"
          .value="${this._getPowerSensorEntityId(device)}"
          .items="${this._sensorEntities}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateSensor(index, true, e.detail.value)}"
        ></sf-editor-dropdown-entity>
        <sf-editor-dropdown-entity
          element-id="energy_sensor"
          kind="plug-energy-sensor"
          label="${this.getLabel('input-energy')}"
          icon="mdi:lightning-bolt"
          .value="${this._getEnergySensorEntityId(device)}"
          .items="${this._sensorEntities}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateSensor(index, false, e.detail.value)}"
        ></sf-editor-dropdown-entity>
      </sf-editor-accordion>
    `;
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiPlugsConfig;
    const devices = config.devices ?? [];
    return html`
      <div class="card">
        <div class="container">
          <section>
            <h1>${this.getSectionTitle('section-title-plug')}</h1>
            ${devices.map((d, i) => this._renderDevice(d, i))}
            <button class="add-btn" @click="${this._addDevice}">
              + ${msg('Add device')}
            </button>
          </section>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-plugs-editor': SciFiPlugsEditor;
  }
}
