import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {House} from '../../helpers/entities/house.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiRadiatorEditor} from './editor.js';
import style from './style.js';

export class SciFiRadiator extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
    };
  }

  __validateConfig(config) {
    if (!config.unit) config.unit = '°C';
    if (!config.default_icon_on)
      config.default_icon_on = 'mdi:lightbulb-on-outline';
    if (!config.default_icon_off)
      config.default_icon_off = 'mdi:lightbulb-outline';
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

    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="container">
        ${this.__renderGlobalTemperature()}
        <div>GLOBAL CONTROLE ?</div>
        <div class="radiator-content">RADIATOR CONTROLE</div>
        ${this.__renderRadiatorList()}
      </div>
    `;
  }

  __renderGlobalTemperature() {
    const houseTemp = this._house.temperature;
    const active = houseTemp.global ? 'on' : 'off';
    return html`
      <div class="global">
        <sci-fi-hexa-tile active-tile state="${active}">
          <div class="item-icon ${active}">
            ${getIcon('mdi:home-thermometer-outline')}
          </div>
          <div class="temp-text">${houseTemp.global}${this._config.unit}</div>
        </sci-fi-hexa-tile>
        <div class="h-separator">
          <div class="circle ${active}"></div>
          <div class="h-path ${active};"></div>
          <div class="circle ${active}"></div>
        </div>
        <div class="card-corner off">
          ${this.__renderGlobalFloortemperature(houseTemp.floors)}
        </div>
      </div>
    `;
  }

  __renderGlobalFloortemperature(floors) {
    if (floors.length == 0) return html`Nothing to display`;
    return html`${floors.map((floor) => {
      return html`
        <div>
          <div class="floor-temperature">
            <div class="item-icon">${getIcon(floor.icon)}</div>
            <div class="floor-name">${floor.name}</div>
            <div class="floor-temp">
              ${floor.temperature}${this._config.unit}
            </div>
          </div>
        </div>
      `;
    })}`;
  }

  __renderRadiatorList() {
    const radiators = this._house.radiators.filter(
      (radiator) =>
        !this._config.entities_to_exclude.includes(radiator.entity_id)
    );
    return html`
      <div class="radiators">
        ${radiators.map((radiator) => {
          return this.__renderRadiatorButton(radiator);
        })}
      </div>
    `;
  }

  __renderRadiatorButton(radiator) {
    console.log(radiator);
    return html``;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      unit: '°C',
      entities_to_exclude: [],
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
