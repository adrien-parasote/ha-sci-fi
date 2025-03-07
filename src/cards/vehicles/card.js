import {html, nothing} from 'lit';

import {Vehicle} from '../../helpers/entities/vehicle/vehicle.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiVehicles extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _vehicles: {type: Array},
    };
  }

  setConfig(config) {
    super.setConfig(config);
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._config) return; // Can't assume setConfig is called before hass is set

    if (!this._vehicles) {
      // Build first rendering vehicles
      this._vehicles = this._config.vehicles.map(
        (config) => new Vehicle(hass, config)
      );
    }
    console.log(this._vehicles);
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    // Setup first time attribute

    return html` <div class="container">TODO Vehicles</div> `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
