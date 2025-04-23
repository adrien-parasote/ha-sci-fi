import {html, nothing} from 'lit';

import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiPlugs extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _plugs: {type: Array},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    console.log(this._config)
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">TODO</div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __toast(error, e) {
    const msg = error ? e.message : 'done';
    this.shadowRoot.querySelector('sci-fi-toast').addMessage(msg, error);
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
