import {html, nothing} from 'lit';

import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiVacuum extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _temperature_items;
  _user;

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
    return html`
      <div class="container">TODO</div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
