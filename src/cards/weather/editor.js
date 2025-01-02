import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';

export class SciFiWeatherEditor extends SciFiBaseEditor {
  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">TODO</div>
      </div>
    `;
  }
}
