import {LitElement, html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/stove.js';
import common_style from '../../helpers/common_style.js';
import {ClimateEntity, StoveEntity} from '../../helpers/entities/climate.js';
import {Area} from '../../helpers/entities/house.js';
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

    const stove_id = 'climate.clou'; // TODO FROM CONF

    // Get stove entity
    const stove_entity = new StoveEntity(
      hass.states[stove_id],
      hass.devices[hass.entities[stove_id].device_id]
    );
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
          e.entity_id != stove_id &&
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
      <sci-fi-stove-image state=${this._stove.state}></sci-fi-stove-image>
    </div>`;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return {};
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
