import {html, nothing} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import editor_common_style from '../../helpers/styles/editor_common_style.js';
import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';

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
    super.hass = hass;
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
          <span
            ><sci-fi-icon
              icon="mdi:selection-ellipse-arrow-inside"
            ></sci-fi-icon></span
          >${this.getLabel('section-title-entity')}
        </h1>
        <sci-fi-dropdown-entity-input
          icon="sci:stove"
          label="${this.getLabel('input-entity-id')} ${this.getLabel(
            'text-required'
          )}"
          element-id="entity"
          kind="entity"
          value="${this._config.entity}"
          .items="${this._climates}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>
    `;
  }

  __renderStorage() {
    return html` <sci-fi-accordion-card
      title="${this.getLabel('section-title-storage')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:store-settings-outline"
    >
      <sci-fi-input
        icon="mdi:database"
        label="${this.getLabel('input-storage-counter')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.storage_counter}
        element-id="storage_counter"
        kind="storage_counter"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-slider
        label="${this.getLabel('input-threshold')} % ${this.getLabel(
          'text-optionnal'
        )}"
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
      title="${this.getLabel('section-title-sensor')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:cog-transfer-outline"
    >
      <sci-fi-input
        icon="mdi:thermometer"
        label="${this.getLabel(
          'input-stove-combustion-chamber'
        )} ${this.getLabel('text-optionnal')}"
        value=${this._config.sensors.sensor_combustion_chamber_temperature}
        element-id="sensors"
        kind="sensor_combustion_chamber_temperature"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:home-thermometer-outline"
        label="${this.getLabel('input-room-temperature')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_inside_temperature}
        element-id="sensors"
        kind="sensor_inside_temperature"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:gauge"
        label="${this.getLabel('input-stove-pressure')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_pressure}
        element-id="sensors"
        kind="sensor_pressure"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:speedometer"
        label="${this.getLabel('input-stove-fan-speed')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_fan_speed}
        element-id="sensors"
        kind="sensor_fan_speed"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:lightning-bolt"
        label="${this.getLabel('input-stove-power-rendered')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.clou_actual_power}
        element-id="sensors"
        kind="sensor_actual_power"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        icon="mdi:lightning-bolt"
        label="${this.getLabel('input-stove-power-consume')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_power}
        element-id="sensors"
        kind="sensor_power"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:state-machine"
        label="${this.getLabel('input-stove-status')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_status}
        element-id="sensors"
        kind="sensor_status"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:timeline-clock-outline"
        label="${this.getLabel('input-stove-time-to-service')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_time_to_service}
        element-id="sensors"
        kind="sensor_time_to_service"
        @input-update=${this.__update}
      ></sci-fi-input>

      <sci-fi-input
        icon="mdi:battery-unknown"
        label="${this.getLabel('input-pellet-quantity')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.sensors.sensor_pellet_quantity}
        element-id="sensors"
        kind="sensor_pellet_quantity"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-slider
        label="${this.getLabel(
          'input-pellet-quantity-threshold'
        )} % ${this.getLabel('text-optionnal')}"
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
