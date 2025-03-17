import {html, nothing} from 'lit';

import {Person} from '../../helpers/entities/person.js';
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
  _temperature_items;
  _user;

  static get properties() {
    return {
      _config: {type: Object},
      _vehicles: {type: Array},
      _active_vehicle_id: {type: Number},
      _selected_temp_id: {type: Number},
    };
  }

  setConfig(config) {
    super.setConfig(config);
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._config) return; // Can't assume setConfig is called before hass is set
    if (!this._selected_temp_id) this._selected_temp_id = 2; // First temperature selection = 18°C
    if (!this._vehicles) {
      // Build first rendering vehicles
      this._active_vehicle_id = 0;
      this._vehicles = this._config.vehicles.map(
        (config) => new Vehicle(hass, config)
      );
    } else {
      // update
      const update = this._vehicles.map((vehicle) => vehicle.update(hass));
    }
    if (!this._user) this._user = new Person(hass); // Only once
    if (!this._temperature_items)
      this._temperature_items = Array.from(Array(10).keys()).map((e, idx) => {
        return {
          id: idx,
          text: [idx + 16, hass.config.unit_system.temperature].join(' '),
          value: idx + 16,
        };
      });
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">
        ${this.__displayHeader()} ${this.__displayLandspeeder()}
        ${this.__displayActions()}
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader() {
    const multiple_vehicle = this._vehicles.length > 1;
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

  __displayLandspeeder() {
    return html`<sci-fi-landspeeder
      .vehicle=${this._vehicles[this._active_vehicle_id]}
      .user=${this._user}
    ></sci-fi-landspeeder>`;
  }

  __displayActions() {
    return html`<div class="actions">
      <div class="ac">
        <sci-fi-wheel
          in-line
          .items=${this._temperature_items}
          selected-id="${this._selected_temp_id}"
          text="Temperature"
          @wheel-change="${this.__selectTemperature}"
        ></sci-fi-wheel>
        <sci-fi-button-card
          icon="mdi:play"
          title="Air-cond"
          text="Start"
          @button-click="${this.__startAc}"
        ></sci-fi-button-card>
        <sci-fi-button-card
          icon="mdi:stop"
          title="Air-cond"
          text="Stop"
          @button-click="${this.__stoptAc}"
        ></sci-fi-button-card>
      </div>
    </div> `;
  }

  __selectTemperature(e) {
    this._selected_temp_id = e.detail.id;
  }

  __startAc(e) {
    e.preventDefault();
    e.stopPropagation();
    this._vehicles[this._active_vehicle_id]
      .startAc(
        this._hass,
        this._temperature_items[this._selected_temp_id].value
      )
      .then(
        () => this.__toast(false),
        (e) => this.__toast(true, e)
      );
  }
  __stoptAc(e) {
    e.preventDefault();
    e.stopPropagation();
    this._vehicles[this._active_vehicle_id].stopAc(this._hass).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
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
