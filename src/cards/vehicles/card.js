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
      _active_vehicle_id: {type: Number},
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
      this._active_vehicle_id = 0;
      this._vehicles = this._config.vehicles.map(
        (config) => new Vehicle(hass, config)
      );
    } else {
      // update
      console.log('update vehicle');
      const update = this._vehicles.map((vehicle) => vehicle.update(hass));
      console.log(update);
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html` <div class="container">${this.__displayHeader()}</div> `;
  }

  __displayHeader() {
    const multiple_vehicle = this._vehicles.length > 1;
    console.log(multiple_vehicle);
    return html`
      <div class="header">
        <div class="${multiple_vehicle ? 'show' : 'hide'}">
          <sci-fi-button
            icon="mdi:chevron-left"
            @button-click=${this._nextCar}
          ></sci-fi-button>
        </div>
        <div class="title">${this._vehicles[this._active_vehicle_id].name}</div>
        <div class="${multiple_vehicle ? 'show' : 'hide'}">
          <sci-fi-button
            icon="mdi:chevron-right"
            @button-click=${this._nextCar}
          ></sci-fi-button>
        </div>
      </div>
    `;
  }

  _nextCar(e) {
    if (e.detail.element.icon == 'mdi:chevron-left') {
      this._active_vehicle_id == 0
        ? (this._active_vehicle_id = this._vehicles.length - 1)
        : (this._active_vehicle_id -= 1);
    } else {
      this._active_vehicle_id == this._vehicles.length - 1
        ? (this._active_vehicle_id = 0)
        : (this._active_vehicle_id += 1);
    }
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
