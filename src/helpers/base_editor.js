import {LitElement} from 'lit';

import common_style from './common_style.js';
import editor_common_style from './editor_common_style.js';
import './components/accordion.js';
import './components/button.js';
import './components/input.js';

export class SciFiBaseEditor extends LitElement {
  static get styles() {
    return [common_style, editor_common_style];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  _hass; // private

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = config;
  }

  __getNewConfig() {
    return JSON.parse(JSON.stringify(this._config));
  }

  __dispatchChange(e, newConfig) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {config: newConfig},
        bubbles: true,
        composed: true,
      })
    );
  }
}
