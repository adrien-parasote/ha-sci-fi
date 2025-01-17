import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {ENTITY_KIND_RADIATOR} from '../../helpers/entities/const.js';
import {House} from '../../helpers/entities/house.js';
import {SunEntity} from '../../helpers/entities/weather.js';
import {getIcon, getWeatherIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiRadiatorEditor} from './editor.js';
import style from './style.js';

export class SciFiRadiator extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private
  _sun;

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  __validateConfig(config) {
    if (!config.unit) config.unit = '°C';
    if (!config.icon_auto) config.icon_auto = 'sci:radiator-auto';
    if (!config.icon_off) config.icon_off = 'sci:radiator-off';
    if (!config.icon_heat) config.icon_heat = 'sci:radiator-heat';
    if (!config.entities_to_exclude) config.entities_to_exclude = [];
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

    if (!this._sun && hass.states['sun.sun'])
      this._sun = new SunEntity(hass, 'sun.sun');
    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return html``;

    // Setup first time attribute
    if (!this._active_floor_id)
      this._active_floor_id =
        this._house.getDefaultFloor(ENTITY_KIND_RADIATOR).id;
    if (!this._active_area_id)
      this._active_area_id = this._house.getDefaultArea(
        this._active_floor_id,
        ENTITY_KIND_RADIATOR
      ).id;

    return html`
      <div class="container">
        <div class="header">${this.__displayHeader()}</div>
        <div class="floors">${this.__displayFloors()}</div>
        <div class="floor-content">${this.__displayFloorInfo()}</div>
        <div class="areas">${this.__displayAreas()}</div>
        <div class="area-radiators">${this.__displayAreaRadiators()}</div>
      </div>
    `;
  }

  __displayHeader() {
    return html`
      <div class="info">
        ${getIcon('mdi:home-thermometer-outline')}
        <div class="text">
          ${this._house.getTemperature(this._config.entities_to_exclude)}${this
            ._config.unit}
        </div>
      </div>
      <div class="weather">
        ${this._sun ? getWeatherIcon(this._sun.dayPhaseIcon()) : ''}
      </div>
    `;
  }

  __displayFloors() {
    return this._house
      .getFloorsOrderedByLevel()
      .filter((floor) => floor.hasEntityKind(ENTITY_KIND_RADIATOR))
      .map((floor) => {
        const active = floor.getTemperature(this._config.entities_to_exclude)
          ? 'on'
          : 'off';
        return html` <sci-fi-hexa-tile
          active-tile
          state="${this._active_floor_id == floor.id ? 'on' : 'off'}"
          class="${this._active_floor_id == floor.id ? 'selected' : ''}"
          @click="${(e) => this.__onFloorSelect(e, floor)}"
        >
          <div class="item-icon ${active}">${getIcon(floor.icon)}</div>
        </sci-fi-hexa-tile>`;
      });
  }

  __displayFloorInfo() {
    const floor = this._house.getFloor(this._active_floor_id);
    const temperature = floor.getTemperature(this._config.entities_to_exclude);
    const icon = temperature ? 'mdi:thermometer' : 'mdi:thermometer-off';
    const label = temperature ? temperature + this._config.unit : 'Off';
    return html`
      <div class="title ${!temperature ? 'off' : 'on'}">
        ${floor.name} (level : ${floor.level})
      </div>
      <div class="temperature ${!temperature ? 'off' : 'on'}">
        ${getIcon(icon)}
        <div>${label}</div>
      </div>
    `;
  }

  __onFloorSelect(e, floor) {
    e.preventDefault();
    e.stopPropagation();
    // Update selected floor
    this._active_floor_id = floor.id;
    // Select first area to render
    this._active_area_id = floor.getFirstArea(ENTITY_KIND_RADIATOR).id;
  }

  __displayAreas() {
    const floor = this._house.getFloor(this._active_floor_id);
    return floor
      .getAreas()
      .filter((area) => area.hasEntityKind(ENTITY_KIND_RADIATOR))
      .map((area, idx) => {
        const state = area.getTemperature(this._config.entities_to_exclude)
          ? 'on'
          : 'off';
        return html`
          <sci-fi-hexa-tile
            active-tile
            state="${state}"
            class="${this._active_area_id == area.id ? 'selected' : ''}"
            @click="${(e) => this.__selectedArea(e, area)}"
          >
            <div class="item-icon ${state}">${getIcon(area.icon)}</div>
          </sci-fi-hexa-tile>
        `;
      });
  }

  __selectedArea(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this._active_area_id = area.id;
  }

  __displayAreaRadiators() {
    const area = this._house.getArea(
      this._active_floor_id,
      this._active_area_id
    );
    const temperature = area.getTemperature(this._config.entities_to_exclude);
    const icon = temperature ? 'mdi:thermometer' : 'mdi:thermometer-off';
    const label = temperature ? temperature + this._config.unit : 'Off';
    return html`
      <div class="title ${temperature ? 'on' : 'off'}">
        ${area.name}
        <div class="temperature ${!temperature ? 'off' : 'on'}">
          ${getIcon(icon)}
          <div>${label}</div>
        </div>
      </div>
      <div class="radiators">
        ${area
          .getEntitiesByKind(ENTITY_KIND_RADIATOR)
          .filter(
            (radiator) =>
              !this._config.entities_to_exclude.includes(radiator.entity_id)
          )
          .map((radiator) => {
            return this.__displayRadiator(radiator);
          })}
      </div>
    `;
  }

  __displayRadiator(radiator) {
    return html`
      <div class="radiator">
        <div>${radiator.friendly_name}</div>
        <div>${radiator.icon}</div>
        <div>${radiator.state}</div>
        <div>${JSON.stringify(radiator.hvac_modes)}</div>
        <div>${radiator.preset_mode}</div>
        <div>${JSON.stringify(radiator.preset_modes)}</div>
        <div>${radiator.current_temperature}</div>
        <div>${radiator.max_temp}</div>
        <div>${radiator.min_temp}</div>
      </div>
    `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      unit: '°C',
      entities_to_exclude: [],
      icon_auto: 'sci:radiator-auto',
      icon_off: 'sci:radiator-off',
      icon_heat: 'sci:radiator-heat',
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiRadiator);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiRadiatorEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi Radiator card',
  description: 'Render sci-fi Radiator card.',
});
