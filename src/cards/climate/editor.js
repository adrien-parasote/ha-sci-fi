import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import '../../helpers/form/form.js';

export class SciFiClimateEditor extends SciFiBaseEditor {
  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">CLIMATE EDITOR CONTENT HERE</div>
      </div>
    `;
  }
}
