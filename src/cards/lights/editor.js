import {LitElement, html} from 'lit';

import common_style from '../../helpers/common_style.js';
import editor_common_style from '../../helpers/editor_common_style.js';
import '../../helpers/form/form.js';

export class SciFiLightsEditor extends LitElement {
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

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
      <div class="container">
        coucou
      </div>
      </div>
    `;
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
