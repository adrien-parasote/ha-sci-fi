import {html, nothing} from 'lit';

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
    `;
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
      ${this.__renderMonitoring(device)}
    `;
  }

  __renderGeneral(device) {
    const switch_entities = this._device_entities.filter(
      (e) => e.entity_id.split('.')[0] == 'switch'
    );
    return html`
      <sci-fi-accordion-card
        title="${this.getLabel('section-title-entity')} ${this.getLabel(
          'text-required'
        )}"
        icon="mdi:selection-ellipse-arrow-inside"
        open
      >
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
        <sci-fi-dropdown-entity-input
          icon="mdi:power-plug-outline"
          label="${this.getLabel('input-entity-id')} ${this.getLabel(
            'text-required'
          )}"
          element-id="entity_id"
          .items="${switch_entities}"
          value="${device.entity_id}"
          ?disabled=${device.device_id == null}
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </sci-fi-accordion-card>
    `;
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
      newConfig.devices[this._current_device_id].entity_id =
        switch_entities[0].entity_id;
    }
    this.__dispatchChange(e, newConfig);
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

  __renderMonitoring(device) {
    const sensors = [];
    const lock = [];
    const select = [];
    this._device_entities.forEach((e) => {
      switch (e.entity_id.split('.')[0]) {
        case 'sensor':
          sensors.push(e);
          break;
        case 'lock':
          lock.push(e);
          break;
        case 'select':
          select.push(e);
          break;
        default:
          break;
      }
    });

    return html` <sci-fi-accordion-card
      title="${this.getLabel('section-title-monitoring')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:chart-scatter-plot-hexbin"
    >
      <section>
        <h1>
          <span
            ><sci-fi-icon icon="mdi:home-lightning-bolt-outline"></sci-fi-icon
          ></span>
          ${this.getLabel('section-title-energy')}
        </h1>
        <sci-fi-dropdown-entity-input
          icon="mdi:flash"
          label="${this.getLabel('input-power')} ${this.getLabel(
            'text-optionnal'
          )}"
          element-id="power_sensor"
          .items="${sensors}"
          value="${device.power_sensor}"
          ?disabled=${device.device_id == null}
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>

      <section class="configuration">
        <h1>
          <span><sci-fi-icon icon="mdi:cog-outline"></sci-fi-icon></span>
          ${this.getLabel('section-title-config')}
        </h1>
        <sci-fi-dropdown-entity-input
          icon="mdi:lock-open-variant"
          label="${this.getLabel('text-child-lock')} ${this.getLabel(
            'text-optionnal'
          )}"
          element-id="child_lock_sensor"
          .items="${lock}"
          value="${device.child_lock_sensor}"
          ?disabled=${device.device_id == null}
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
        <sci-fi-dropdown-entity-input
          icon="mdi:power-settings"
          label="${this.getLabel('text-power-outage-memory')}? ${this.getLabel(
            'text-optionnal'
          )}"
          element-id="power_outage_memory_select"
          .items="${select}"
          value="${device.power_outage_memory_select}"
          ?disabled=${device.device_id == null}
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>

      <section>
        <h1>
          <span><sci-fi-icon icon="mdi:state-machine"></sci-fi-icon></span>
          <span class="section-title"
            >${this.getLabel('section-title-other')}</span
          >
          <sci-fi-button
            has-border
            icon="mdi:plus"
            ?disabled="${device.device_id == null}"
            @button-click=${this.__addOtherSensors}
          ></sci-fi-button>
        </h1>
        <div class="additional-sensors">
          ${this.__renderOtherSensors(device)}
        </div>
      </section>
    </sci-fi-accordion-card>`;
  }

  __renderOtherSensors(device) {
    if (device.device_id == null) return nothing;
    return device.others.map((sensor, idx) => {
      return html`
        <div class="sensor-row">
          <sci-fi-dropdown-entity-input
            label="${this.getLabel('text-other-sensor')}? ${this.getLabel(
              'text-optionnal'
            )}"
            element-id="others"
            value=${sensor}
            kind=${idx}
            .items="${this._device_entities}"
            @input-update=${this.__update}
          ></sci-fi-dropdown-entity-input>
          <sci-fi-button
            icon="mdi:delete-outline"
            @button-click="${(e) => this.__removeOtherSensors(e, idx)}"
          >
          </sci-fi-button>
        </div>
      `;
    });
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

  __editDevice(id = null) {
    this._edit = !this._edit;
    this._current_device_id = id;
    this._setup_device_entities(
      id ? this._config.devices[this._current_device_id].device_id : id
    );
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
      power_sensor: null,
      child_lock_sensor: null,
      others: [],
    };
  }

  __addOtherSensors(e) {
    let newConfig = this.__getNewConfig();
    newConfig.devices[this._current_device_id]['others'].push('');
    this.__dispatchChange(e, newConfig);
  }

  __removeOtherSensors(e, idx) {
    let newConfig = this.__getNewConfig();
    newConfig.devices[this._current_device_id]['others'].splice(idx, 1);
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
}
