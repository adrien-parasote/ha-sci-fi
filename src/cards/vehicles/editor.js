import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import configMetadata from './config-metadata.js';
import {MANUFACTURED} from './const.js';

export class SciFiVehiclesEditor extends SciFiBaseEditor {
  _vehiclesList;

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return;
    if (!this._vehiclesList)
      this._vehiclesList = Object.values(hass.devices)
        .filter((d) => d.manufacturer == MANUFACTURED)
        .map((e) => {
          return {
            attributes: {
              friendly_name: e.name_by_user,
              icon: 'sci:landspeeder',
            },
            entity_id: e.id,
          };
        });
  }

  render() {
    if (!this._hass || !this._config || !this._vehiclesList) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderVehicles()}
          <sci-fi-button
            has-border
            icon="mdi:plus"
            @button-click=${this.__addElement}
          ></sci-fi-button>
        </div>
      </div>
    `;
  }

  __renderVehicles() {
    if (this._config.vehicles.length == 0) return nothing;
    return html`
      ${this._config.vehicles.map(
        (vehicle, id) =>
          html`<sci-fi-accordion-card
            element-id=${id}
            title="${this.__getTitle(id)}"
            icon="sci:landspeeder"
            ?deletable=${this._config.vehicles.length > 1}
            @accordion-delete=${this.__update}
            ?open=${id == 0}
          >
            ${this.__renderVehicle(id, vehicle)}
          </sci-fi-accordion-card>`
      )}
    `;
  }

  __getTitle(id) {
    if (this._config.vehicles[id].name) return this._config.vehicles[id].name;
    return 'Vehicle ' + (id + 1);
  }

  __renderVehicle(id, vehicle) {
    return html`
      <section>
        <h1>
          <span
            ><sci-fi-icon
              icon="mdi:selection-ellipse-arrow-inside"
            ></sci-fi-icon></span
          >Vehicle
        </h1>
        <sci-fi-dropdown-entity-input
          label="Selection (required)"
          element-id="${id}"
          icon="sci:landspeeder"
          kind="id_name"
          value="${vehicle.name}"
          .items="${this._vehiclesList}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>
      <section>
        <h1>
          <span
            ><sci-fi-icon icon="mdi:cog-transfer-outline"></sci-fi-icon></span
          >Sensors (optionnal)
        </h1>
        <sci-fi-input
          icon="mdi:map-marker"
          label="Location (optionnal)"
          value=${vehicle.location}
          element-id="${id}"
          kind="location"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:clock-outline"
          label="Location last activity (optionnal)"
          value=${vehicle.location_last_activity}
          element-id="${id}"
          kind="location_last_activity"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:counter"
          label="Mileage (optionnal)"
          value=${vehicle.mileage}
          element-id="${id}"
          kind="mileage"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:lock-outline"
          label="Lock status (optionnal)"
          value=${vehicle.lock_status}
          element-id="${id}"
          kind="lock_status"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:gas-station"
          label="Fuel autonomy (optionnal)"
          value=${vehicle.fuel_autonomy}
          element-id="${id}"
          kind="fuel_autonomy"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:fuel"
          label="Fuel quantity (optionnal)"
          value=${vehicle.fuel_quantity}
          element-id="${id}"
          kind="fuel_quantity"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:ev-station"
          label="Battery autonomy (optionnal)"
          value=${vehicle.battery_autonomy}
          element-id="${id}"
          kind="battery_autonomy"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:battery-medium"
          label="Battery level (optionnal)"
          value=${vehicle.battery_level}
          element-id="${id}"
          kind="battery_level"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:battery-charging-medium"
          label="Charging (optionnal)"
          value=${vehicle.charging}
          element-id="${id}"
          kind="charging"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:connection"
          label="Plug state (optionnal)"
          value=${vehicle.plug_state}
          element-id="${id}"
          kind="plug_state"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:lock-outline"
          label="Remaining charging time (optionnal)"
          value=${vehicle.charging_remaining_time}
          element-id="${id}"
          kind="charging_remaining_time"
          @input-update=${this.__update}
        ></sci-fi-input>
      </section>
    `;
  }

  __addElement(e) {
    let newConfig = this.__getNewConfig();
    const empty_vehicle = {};
    Object.keys(configMetadata.vehicles.data).forEach(
      (el) => (empty_vehicle[el] = '')
    );
    newConfig.vehicles.push(empty_vehicle);
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    const elemmentId = e.detail.id;
    const kind = e.detail.kind;
    const value = e.detail.value;
    if (e.type == 'accordion-delete') {
      newConfig.vehicles.splice(elemmentId, 1);
    } else {
      if (kind == 'id_name') {
        if (value == '') {
          newConfig.vehicles[elemmentId].id = value;
          newConfig.vehicles[elemmentId].name = value;
        } else {
          newConfig.vehicles[elemmentId].id = value;
          newConfig.vehicles[elemmentId].name = this._vehiclesList.filter(
            (el) => el.entity_id == value
          )[0].attributes.friendly_name;
        }
      } else {
        newConfig.vehicles[elemmentId][kind] = value;
      }
    }
    this.__dispatchChange(e, newConfig);
  }
}
