import {html, nothing} from 'lit';

import common_style from '../../helpers/common_style.js';
import {SciFiBaseEditor} from '../../helpers/components/base_editor.js';
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
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          TODO
        Object.values(hass.entities).filter((e) => e.device_id == "<device id>");


        </div>
      </div>
    `;
  }
}
