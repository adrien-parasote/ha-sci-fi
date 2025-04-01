import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';

export class SciFiPlugsEditor extends SciFiBaseEditor {
  _climates; // Privates

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  set hass(hass) {
    super.hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ">TODO</div>
      </div>
    `;
  }
}
