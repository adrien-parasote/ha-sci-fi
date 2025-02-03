import {html, nothing} from 'lit';

import common_style from '../../helpers/common_style.js';
import {SciFiBaseEditor} from '../../helpers/components/base_editor.js';
import editor_common_style from '../../helpers/editor_common_style.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';

export class SciFiStoveEditor extends SciFiBaseEditor {
  static get styles() {
    return [common_style, editor_common_style];
  }

  _climates = [];

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  set hass(hass) {
    this._hass = hass;
    // Filter climates entity
    this._climates = Object.values(hass.states).filter((e) =>
      e.entity_id.startsWith('climate')
    );
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderGeneral()} ${this.__renderSensors()}
          ${this.__renderStorage()}
        </div>
      </div>
    `;
  }

  __renderGeneral() {
    return html`
      <section>
        <h1>
          <span>${getIcon('mdi:tune-vertical-variant')}</span>
          General
        </h1>
        <sci-fi-dropdown-entity-input
          icon="sci:stove"
          label="Stove entity (required)"
          element-id="entity"
          kind="entity"
          value="${this._config.entity}"
          items="${JSON.stringify(this._climates)}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
        <sci-fi-input
          label="Unit (optionnal)"
          value=${this._config.unit}
          element-id="unit"
          kind="unit"
          @input-update=${this.__update}
        ></sci-fi-input>
      </section>
    `;
  }

  __renderStorage() {
    return html` <sci-fi-accordion-card
      title="Storage (optionnal)"
      icon="mdi:store-settings-outline"
    >
      <sci-fi-input
        icon="mdi:database"
        label="Storage counter (optionnal)"
        value=${this._config.storage_counter}
        element-id="storage_counter"
        kind="storage_counter"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-slider
        label="Threshold % (optionnal)"
        icon="mdi:counter"
        element-id="storage_counter_threshold"
        kind="storage_counter_threshold"
        value="${this._config.storage_counter_threshold}"
        min="0"
        max="1"
        step="0.1"
        @input-update=${this.__update}
      ></sci-fi-slider>
    </sci-fi-accordion-card>`;
  }

  __renderSensors() {
    return html` <sci-fi-accordion-card
      title="Sensors (optionnal)"
      icon="mdi:cog-transfer-outline"
    >
      <sci-fi-input
        icon="mdi:thermometer"
        label="Stove combustion chamber (optionnal)"
        value=${this._config.sensors.sensor_combustion_chamber_temperature}
        element-id="sensors"
        kind="sensor_combustion_chamber_temperature"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:home-thermometer-outline"
        label="Room temperature (optionnal)"
        value=${this._config.sensors.sensor_inside_temperature}
        element-id="sensors"
        kind="sensor_inside_temperature"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:gauge"
        label="Stove pressure (optionnal)"
        value=${this._config.sensors.sensor_pressure}
        element-id="sensors"
        kind="sensor_pressure"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:speedometer"
        label="Stove fans speed (optionnal)"
        value=${this._config.sensors.sensor_fan_speed}
        element-id="sensors"
        kind="sensor_fan_speed"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:lightning-bolt"
        label="Stove power rendered (optionnal)"
        value=${this._config.sensors.clou_actual_power}
        element-id="sensors"
        kind="clou_actual_power"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:lightning-bolt"
        label="Stove power consumed (optionnal)"
        value=${this._config.sensors.sensor_power}
        element-id="sensors"
        kind="sensor_power"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:state-machine"
        label="Stove status(optionnal)"
        value=${this._config.sensors.sensor_status}
        element-id="sensors"
        kind="sensor_status"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:battery-unknown"
        label="Stove pellet quantity (optionnal)"
        value=${this._config.sensors.sensor_pellet_quantity}
        element-id="sensors"
        kind="sensor_pellet_quantity"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-slider
        label="Pellet quantity threshold % (optionnal)"
        icon="mdi:counter"
        element-id="pellet_quantity_threshold"
        kind="pellet_quantity_threshold"
        value="${this._config.pellet_quantity_threshold}"
        min="0"
        max="1"
        step="0.1"
        @input-update=${this.__update}
      ></sci-fi-slider>
    </sci-fi-accordion-card>`;
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    if (e.detail.kind == e.detail.id) {
      newConfig[e.detail.id] = e.detail.value;
    } else {
      newConfig[e.detail.id][e.detail.kind] = e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }
}
