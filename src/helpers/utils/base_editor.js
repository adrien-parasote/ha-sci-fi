import {updateWhenLocaleChanges} from '@lit/localize';
import {LitElement} from 'lit';

import {getLocale, setLocale} from './../../locales/localization.js';
import common_style from './../styles/common_style.js';
import editor_common_style from './../styles/editor_common_style.js';

export class SciFiBaseEditor extends LitElement {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  static get styles() {
    return [common_style, editor_common_style];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  _hass; // private

  get hass() {
    return this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    if (hass.language != getLocale()) {
      (async () => {
        try {
          await setLocale(hass.language);
        } catch (e) {
          console.error(`Error loading locale ${hass.language}: ${e.message}`);
        }
      })();
    }
  }

  setConfig(config) {
    this._config = config;
  }

  __getNewConfig() {
    return JSON.parse(JSON.stringify(this._config));
  }

  __dispatchChange(e, newConfig) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {config: newConfig},
        bubbles: true,
        composed: true,
      })
    );
  }
}
