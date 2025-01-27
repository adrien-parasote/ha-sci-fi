import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import common_style from '../../helpers/common_style.js';
import editor_common_style from '../../helpers/editor_common_style.js';
import '../../helpers/form/form.js';

export class SciFiStoveEditor extends SciFiBaseEditor {
  static get styles() {
    return [common_style, editor_common_style];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">TODO</div>
      </div>
    `;
  }
}
