import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';

export class SciFiVehiclesEditor extends SciFiBaseEditor {
  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Object.values(window.hass.devices).filter((d) => d.manufacturer == "Renault").map((e) => { return {name: e.name_by_user, id:e.id}})
  }

  setConfig(config) {
    this._config = config;
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html` <div class="card card-corner">TODO</div> `;
  }
}
