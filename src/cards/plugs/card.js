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
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    const reg = new RegExp('.*nous_paillette_charlotte.*');
    //get device => console.log(Object.keys(this._hass.devices).filter(k => this._config.devices.includes(k)).map(k => this._hass.devices[k]))

    const res = {};
    Object.values(this._hass.entities)
      .filter(
        (e) =>
          this._config.devices.includes(e.device_id) &&
          e.hidden_by == null &&
          e.disabled_by == null
      )
      .forEach((e) => {
        if (!(e.device_id in res)) res[e.device_id] = [];
        res[e.device_id].push(e.entity_id);
      });
    console.log(res);
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
