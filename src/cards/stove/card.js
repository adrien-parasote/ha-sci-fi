import {LitElement, html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/components/circle_progress_bar.js';
import '../../helpers/components/stack_bar.js';
import '../../helpers/components/stove.js';
import common_style from '../../helpers/common_style.js';
import {ClimateEntity, StoveEntity} from '../../helpers/entities/climate.js';
import {Area} from '../../helpers/entities/house.js';
import {STOVE_SENSORS} from '../../helpers/entities/sensor_const.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiStoveEditor} from './editor.js';
import style from './style.js';

export class SciFiStove extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _stove: {type: Object},
      _area: {type: Object},
    };
  }

  __validateConfig(config) {
    if (!config.entity)
      throw new Error(
        'You need to define your stove entity (ex: climate.<my_stove>)'
      );
    if (!config.entity.startsWith('climate.'))
      throw new Error(config.entity + 'is not a climate entity.');

    if (!config.pellet_quantity_threshold)
      config.pellet_quantity_threshold = 0.5;
    if (!config.storage_counter_threshold)
      config.storage_counter_threshold = 0.1;

    if (!config.sensors) config.sensors = {};
    STOVE_SENSORS.forEach((sensor) => {
      if (!config.sensors[sensor]) {
        config.sensors[sensor] = null;
      } else {
        if (!this._hass.entities[config.sensors[sensor]])
          throw new Error(
            'Sensor ' + config.sensors[sensor] + ' cannot be found.'
          );
      }
    });

    if (config.storage_counter && !this._hass.entities[config.storage_counter])
      throw new Error(config.storage_counter + ' cannot be found.');
    if (!config.storage_counter) config.storage_counter = null;
    if (!config.unit) config.unit = '°C';
    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  getCardSize() {
    return 4;
  }

  getLayoutOptions() {
    return {
      grid_rows: 4,
      grid_columns: 4,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
    // Get stove entity
    const stove_entity = new StoveEntity(
      hass.states[this._config.entity],
      hass.devices[hass.entities[this._config.entity].device_id]
    );
    // Add external sensors if defined
    stove_entity.addSensors(this._config.sensors, hass);
    if (this._config.storage_counter)
      stove_entity.addStockCounter(this._config.storage_counter, hass);

    if (
      !this._stove ||
      !isEqual(stove_entity.renderAsEntity(), this._stove.renderAsEntity())
    )
      this._stove = stove_entity;

    // Build area
    const area_other_climate_entities = Object.values(hass.entities)
      .filter(
        (e) =>
          e.entity_id.startsWith('climate.') &&
          e.entity_id != this._config.entity &&
          hass.devices[e.device_id].area_id == this._stove.area_id
      )
      .map(
        (e) =>
          new ClimateEntity(hass.states[e.entity_id], hass.devices[e.device_id])
      );
    const area = new Area(this._stove.area_id, hass);
    area.addEntities([this._stove].concat(area_other_climate_entities));
    if (!this._area || !isEqual(area, this._area)) this._area = area;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`<div class="container">
      ${this.__displayStove()} ${this.__displayBottom()}
    </div>`;
  }

  __displayBottom() {
    return html`
      <div class="bottom">
        <div class="info">
          <div>${this._area.name} -</div>
          ${getIcon('mdi:thermometer')}
          <div>${this._area.getTemperature()}${this._config.unit}</div>
        </div>
      </div>
    `;
  }

  __displayStove() {
    return html` <div class="content">
      <sci-fi-stove-image state=${this._stove.state}></sci-fi-stove-image>
      <div class="info">
        <div class="e bottom-path">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
            <div class="d-path"></div>
          </div>
          <div class="quantities">
            ${this.__displayPelletQuantity()} ${this.__displayPelletStock()}
          </div>
        </div>
        <div class="m">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
          </div>
          <div class="temperatures">
            ${this.__displayTemperature(
              'External stove',
              this._stove.current_temperature,
              this._config.unit
            )}
            ${this.__displayTemperature(
              'Internal stove',
              this._stove.combustion_chamber_temperature.value,
              this._config.unit
            )}
          </div>
        </div>
        <div class="e top-path">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
            <div class="d-path"></div>
          </div>
          <div class="powers">
            ${this.__displayPower(
              'Render',
              this._stove.actual_power.value,
              this._stove.actual_power.unit_of_measurement
            )}
            ${this.__displayPower(
              'Consume',
              this._stove.power.value,
              this._stove.power.unit_of_measurement
            )}
          </div>
        </div>
      </div>
    </div>`;
  }

  __noQuantity(text) {
    return html`
      <div class="nothing">
        <div>N/A</div>
        <div>${text}</div>
      </div>
    `;
  }

  __displayPelletQuantity() {
    const sensor_pellet_quantity = this._stove.sensor_pellet_quantity;
    if (!sensor_pellet_quantity) return this.__noQuantity('Fuel quantity');
    return html`
      <sci-fi-circle-progress-bar
        text="Fuel quantity"
        val=${sensor_pellet_quantity.value}
        threshold=${this._config.pellet_quantity_threshold}
      ></sci-fi-circle-progress-bar>
    `;
  }

  __displayPelletStock() {
    const storage = this._stove.storage;
    if (!storage) return this.__noQuantity('Stock');
    return html`
      <sci-fi-stack-bar
        text="Stock"
        val=${storage.value}
        minimum=${storage.minimum}
        maximum=${storage.maximum}
        threshold=${this._config.storage_counter_threshold}
      ></sci-fi-stack-bar>
    `;
  }

  __noTemperature(text) {
    return html`<div class="temperature off">
      <div class="no-temp">
        ${getIcon('mdi:thermometer')} ${getIcon('mdi:help')}
      </div>
      <div class="label">${text}:</div>
      <div>N/A</div>
    </div>`;
  }

  __displayTemperature(text, temperature, unit) {
    if (!temperature) return this.__noTemperature(text);
    let icon = 'mdi:thermometer-off';
    let state = 'off';
    if (temperature) {
      if (temperature >= 25) {
        icon = 'mdi:thermometer-high';
        state = 'high';
      } else if (temperature >= 16) {
        icon = 'mdi:thermometer';
        state = 'medium';
      } else {
        icon = 'mdi:thermometer-low';
        state = 'low';
      }
    }
    return html`
      <div class="temperature ${state}">
        ${getIcon(icon)}
        <div class="label">${text}:</div>
        <div>${temperature}${unit}</div>
      </div>
    `;
  }

  __displayPower(text, power, unit) {
    if (power == null) return this.__displayPower(text, 'N/A', '');
    return html`
      <div class="power">
        ${getIcon('mdi:lightning-bolt')}
        <div class="label">${text}</div>
        <div class="${power == 'N/A' ? 'nothing' : ''}">${power} ${unit}</div>
      </div>
    `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return {
      entity: null,
      unit: '°C',
      sensors: {},
      storage_counter: null,
      storage_counter_threshold: 0.1,
      pellet_quantity_threshold: 0.5,
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiStove);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiStoveEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi Stove card',
  description: 'Render sci-fi Stove card.',
});
