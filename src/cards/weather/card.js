import {LitElement, html} from 'lit';

import common_style from '../../helpers/common_style.js';
import {PACKAGE} from './const.js';
import {SciFiWeatherEditor} from './editor.js';
import style from './style.js';

export class SciFiWeather extends LitElement {
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
    return 1;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`WEATHER`;
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
  window.customElements.define(PACKAGE, SciFiWeather);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiWeatherEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi weather card',
  description: 'Render sci-fi weather card.',
});
