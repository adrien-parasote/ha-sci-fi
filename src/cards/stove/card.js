import {LitElement, html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/stove.js';
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
        <div class="e">
          <div>Pellet quantity : ${this._stove.sensor_pellet_quantity}</div>
          <div>
            Pellet stock : ${this._stove.storage.value} (min
            :${this._stove.storage.minimum} / max
            ${this._stove.storage.maximum})
          </div>
        </div>
        <div class="m">
          <div>
            Current temp :
            ${this._stove.current_temperature}${this._config.unit}
          </div>
          <div>
            Combustion chamber temperature :
            ${this._stove.combustion_chamber_temperature}
          </div>
        </div>
        <div class="e">
          <div>Actual power : ${this._stove.actual_power}</div>
          <div>Power : ${this._stove.power}</div>
        </div>
      </div>
    </div>`;
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
