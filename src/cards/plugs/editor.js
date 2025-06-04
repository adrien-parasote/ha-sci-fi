import {msg} from '@lit/localize';
import {html, nothing} from 'lit';
import object from 'lodash-es/object.js';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import style from './style_editor.js';

export class SciFiPlugsEditor extends SciFiBaseEditor {
  _devices; // Privates
  _edit = false;
  _device_entities = [];

  static get styles() {
    return super.styles.concat([style]);
  }

  static get properties() {
    return {
      _config: {type: Object},
      _current_device_id: {type: Number},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._devices)
      this._devices = Object.values(this._hass.devices)
        .filter((v) => v.entry_type != 'service')
        .map((v) => {
          return {
            id: v.id,
            manufacturer: v.manufacturer,
            model: v.model,
            name: v.name,
            name_by_user: v.name_by_user ? v.name_by_user : '',
            serial_number: v.serial_number,
          };
        });
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderDevicesSelection()}
        </div>
        <div class="editor ${this._edit}">${this.__renderDevicesEdition()}</div>
      </div>

      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __renderDevicesSelection() {
    return html`
      <section>
        <h1>
          <span
            ><sci-fi-icon icon="mdi:tune-vertical-variant"></sci-fi-icon
          ></span>
          ${this.getLabel('section-title-plug')}
        </h1>
        ${this._config.devices.map((device, id) =>
          this.__displayDeviceRow(device, id)
        )}
        <sci-fi-button
          has-border
          icon="mdi:plus"
          @button-click=${this.__addElement}
        ></sci-fi-button>
      </section>
    `;
  }

  __displayDeviceRow(device, id) {
    return html`
      <div class="entity-row">
        <sci-fi-input
          label="${this.getLabel('input-device')}"
          icon="${device.active_icon}"
          value="${device.name}"
          disabled
        ></sci-fi-input>
        <sci-fi-button
          icon="mdi:delete-outline"
          @button-click="${(e) => this.__deleteDevice(e, id)}"
        >
        </sci-fi-button>
        <sci-fi-button
          icon="sci:edit"
          @button-click="${(e) => this.__editDevice(id)}"
        >
        </sci-fi-button>
      </div>
    `;
  }

  __deleteDevice(e, id) {
    let newConfig = this.__getNewConfig();
    newConfig.devices.splice(id, 1);
    this.__dispatchChange(e, newConfig);
  }

  __addElement() {
    this._edit = !this._edit;
    this._config.devices.push(this.__createEmptyDeviceConfig());
    this._current_device_id = this._config.devices.length - 1;
    this._setup_device_entities();
  }

  __createEmptyDeviceConfig() {
    return {
      device_id: null,
      entity_id: null,
      active_icon: 'mdi:power-plug-outline',
      inactive_icon: 'mdi:power-plug-off-outline',
      name: null,
      sensors: {},
    };
  }

  _setup_device_entities(device_id) {
    this._device_entities =
      device_id == null
        ? []
        : Object.values(this._hass.entities)
            .filter((e) => e.device_id == device_id)
            .map((e) => {
              return {
                category: e.entity_category,
                entity_id: e.entity_id,
                attributes: {
                  friendly_name: e.name,
                  icon: e.icon,
                },
              };
            });
  }

  __renderDevicesEdition() {
    if (this._current_device_id == null) return nothing;
    const device = this._config.devices[this._current_device_id];
    this._setup_device_entities(device.device_id);

    return html`
      <div class="head">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${(e) => this.__editDevice(null)}
        ></sci-fi-button>
        <span>${device.name ? device.name : ''}</span>
      </div>
      ${this.__renderGeneral(device)} ${this.__renderAppearance(device)}
      ${this.__renderSensors(device)}
    `;
  }

  __editDevice(id = null) {
    this._edit = !this._edit;
    this._current_device_id = id;
    this._setup_device_entities(
      id ? this._config.devices[this._current_device_id].device_id : id
    );
  }

  __renderGeneral(device) {
    return html`
      <section>
        <h1>
          <span><sci-fi-icon icon="mdi:page-layout-header"></sci-fi-icon></span>
          ${this.getLabel('section-title-device')}
          ${this.getLabel('text-required')}
        </h1>

        <sci-fi-dropdown-device-input
          icon="mdi:devices"
          label="${this.getLabel('input-device')} ${this.getLabel(
            'text-required'
          )}"
          id="${parseInt(this._current_device_id)}"
          value="${device.name}"
          .items="${this._devices}"
          @input-update=${this.__deviceSelection}
        ></sci-fi-dropdown-device-input>
      </section>
    `;
  }

  __deviceSelection(e) {
    const device = e.detail.value;
    this._setup_device_entities(device.id);
    let newConfig = this.__getNewConfig();
    newConfig.devices[this._current_device_id].device_id = device.id;
    newConfig.devices[this._current_device_id].name = device.name_by_user
      ? device.name_by_user
      : device.name;
    // Select first switch found
    const switch_entities = this._device_entities.filter(
      (e) => e.entity_id.split('.')[0] == 'switch'
    );
    if (switch_entities.length > 0) {
      const entity_id = switch_entities[0].entity_id;
      newConfig.devices[this._current_device_id].entity_id = entity_id;
      const sensors = {};
      this._device_entities
        .filter((e) => e.entity_id != entity_id)
        .forEach((e) => {
          // Select only entity with states
          const entity = this._hass.states[e.entity_id];
          if (entity) {
            sensors[e.entity_id] = {
              show: false,
              name: entity.attributes.friendly_name,
              icon: entity.attributes.icon,
              power: false,
            };
          }
        });
      newConfig.devices[this._current_device_id].sensors = sensors;
      this.__dispatchChange(e, newConfig);
    } else {
      this.__toast(newConfig.devices[this._current_device_id].name);
    }
  }

  __renderAppearance(device) {
    const active_icon = device.active_icon ? device.active_icon : null;
    const inactive_icon = device.inactive_icon ? device.inactive_icon : null;
    return html` <sci-fi-accordion-card
      title="${this.getLabel('section-title-appearance')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:palette-outline"
    >
      <sci-fi-input
        label="${this.getLabel('input-name')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="name"
        icon="mdi:cursor-text"
        value=${device.name}
        @input-update=${this.__update}
        ?disabled=${device.device_id == null}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-active-icon')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="active_icon"
        icon=${active_icon}
        value=${active_icon}
        @input-update=${this.__update}
        ?disabled=${device.device_id == null}
      ></sci-fi-dropdown-icon-input>

      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-inactive-icon')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="inactive_icon"
        icon=${inactive_icon}
        value=${inactive_icon}
        @input-update=${this.__update}
        ?disabled=${device.device_id == null}
      ></sci-fi-dropdown-icon-input>
    </sci-fi-accordion-card>`;
  }

  __renderSensors(device) {
    return html` <sci-fi-accordion-card
      title="${this.getLabel('section-title-sensor')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:cog-transfer-outline"
    >
      <div class="sensors">
        ${Object.keys(device.sensors).map((sensor_id) => {
          const sensor = device.sensors[sensor_id];
          return html`
            <div class="sensor">
              <sci-fi-input
                label="${sensor_id}"
                element-id="${sensor_id}"
                kind="name"
                icon="${sensor.icon}"
                value=${sensor.name}
                @input-update=${this.__updateSensor}
                ?disabled=${device.device_id == null}
              ></sci-fi-input>
              <sci-fi-button
                icon="${sensor.power ? 'mdi:flash' : 'mdi:flash-outline'}"
                @button-click="${(e) =>
                  this.__updatePowerVisibility(e, sensor_id, 'power')}"
                class="${sensor.power ? 'on' : 'off'}"
              ></sci-fi-button>
              <sci-fi-button
                icon="${sensor.show
                  ? 'mdi:eye-outline'
                  : 'mdi:eye-off-outline'}"
                @button-click="${(e) =>
                  this.__updatePowerVisibility(e, sensor_id, 'show')}"
                class="${sensor.show ? 'on' : 'off'}"
              ></sci-fi-button>
            </div>
          `;
        })}
      </div>
    </sci-fi-accordion-card>`;
  }

  __updatePowerVisibility(e, sensor_id, kind) {
    let newConfig = this.__getNewConfig();
    if (
      kind == 'power' &&
      !newConfig.devices[this._current_device_id].sensors[sensor_id][kind]
    ) {
      object
        .keys(newConfig.devices[this._current_device_id].sensors)
        .map(
          (sensor_id) =>
            (newConfig.devices[this._current_device_id].sensors[sensor_id][
              kind
            ] = false)
        );
      newConfig.devices[this._current_device_id].sensors[sensor_id]['show'] =
        false;
    }
    if (
      kind == 'show' &&
      newConfig.devices[this._current_device_id].sensors[sensor_id]['power']
    ) {
      newConfig.devices[this._current_device_id].sensors[sensor_id]['power'] =
        false;
    }
    newConfig.devices[this._current_device_id].sensors[sensor_id][kind] =
      !newConfig.devices[this._current_device_id].sensors[sensor_id][kind];
    this.__dispatchChange(e, newConfig);
  }

  __updateSensor(e) {
    const data = e.detail;
    let newConfig = this.__getNewConfig();
    newConfig.devices[this._current_device_id].sensors[data.id][data.kind] =
      data.value;
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    const data = e.detail;
    let newConfig = this.__getNewConfig();
    if (data.kind == null) {
      newConfig.devices[this._current_device_id][data.id] = data.value;
    } else {
      newConfig.devices[this._current_device_id][data.id][data.kind] =
        data.value;
    }
    this.__dispatchChange(e, newConfig);
  }

  __toast(device) {
    const txt =
      msg('Cannot found switch entity in device: ') +
      device +
      msg('. Please select a plug device.');
    this.shadowRoot.querySelector('sci-fi-toast').addMessage(txt, true);
  }
}
