import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import '../../helpers/form/form.js';

export class SciFiClimatesEditor extends SciFiBaseEditor {
  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">CLIMATES EDITOR CONTENT HERE</div>
      </div>
    `;
  }
}
