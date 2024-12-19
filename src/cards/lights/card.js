import {LitElement, html} from 'lit';

import common_style from '../../helpers/common_style.js';
import {PACKAGE} from './const.js';
import {SciFiLightsEditor} from './editor.js';
import style from './style.js';

export class SciFiLights extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _floors: {type: Object},
      _rooms: {type: Object},
    };
  }

  constructor() {
    super();
  }

  setConfig(config) {
    this._config = config;
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
    return html`
      <div class="container">
        <div>Header</div>
        <div></div>
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
  window.customElements.define(PACKAGE, SciFiLights);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiLightsEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi lights card',
  description: 'Render sci-fi lights management.',
});
