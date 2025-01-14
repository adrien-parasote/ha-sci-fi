import {LitElement, html} from 'lit';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {
  PACKAGE,
} from './const.js';
import {SciFiClimateEditor} from './editor.js';
import style from './style.js';

export class SciFiClimate extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
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
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="container">
        CLIMATE CONTENT HERE
      </div>
    `;
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
  window.customElements.define(PACKAGE, SciFiClimate);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiClimateEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi climate card',
  description: 'Render sci-fi climate card.',
});
