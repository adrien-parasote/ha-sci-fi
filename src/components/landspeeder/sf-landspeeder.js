import {LitElement, html, nothing} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import {pad} from '../../helpers/utils/utils.js';
import top_speeder from './data/top.js';
import style from './style.js';

class SciFiLandspeeder extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  static get properties() {
    return {
      vehicle: {type: Object},
    };
  }

  constructor() {
    super();
    this.vehicle = this.vehicle ? this.vehicle : null;
  }

  render() {
    if (!this.vehicle) nothing;
    return html`
      <div class="content">
        ${this.__displaySpeeder()} ${this.__displayTop()}
        ${this.__displayMiddle()}
        <div class="bottom">${this.__displayBottom()}</div>
      </div>
    `;
  }

  __displayTop() {
    return html`<div class="top">
      <div class="component">
        <sci-fi-icon icon="mdi:map-marker"></sci-fi-icon>
        <div class="location">
          <div>${this.vehicle.location}</div>
          <sci-fi-button
            icon="mdi:open-in-new"
            @button-click=${this._openLocation}
          ></sci-fi-button>
        </div>
        ${this.__displayOpenMap()}
      </div>
      <div class="component">
        <sci-fi-icon icon="mdi:counter"></sci-fi-icon>
        <div>${this.vehicle.mileage}</div>
      </div>
    </div>`;
  }

  __displayOpenMap() {
    if (!this.vehicle.location_last_activity) return nothing;
    return html` <div class="sub-info">
      ${this.__displayDate(this.vehicle.location_last_activity)}
    </div>`;
  }

  __displayDate(d) {
    return [
      [pad(d.getDate()), pad(d.getMonth()), d.getFullYear()].join('/'),
      [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':'),
    ].join(' ');
  }

  _openLocation(e) {
    // OPEN DEVICE DEFAULT MAP TO FIND YOUR VEHICLE
    if (
      /* if we're on iOS, open in Apple Maps */
      navigator.platform.indexOf('iPhone') != -1 ||
      navigator.platform.indexOf('iPad') != -1 ||
      navigator.platform.indexOf('iPod') != -1
    ) {
      window.open(
        'maps://maps.google.com/maps?daddr=' +
          this.vehicle.location_gps.latitude +
          ',' +
          this.vehicle.location_gps.longitude +
          '&amp;ll='
      );
    } else {
      /* else use Google */
      window.open(
        'https://maps.google.com/maps?daddr=' +
          this.vehicle.location_gps.latitude +
          ',' +
          this.vehicle.location_gps.longitude +
          '&amp;ll='
      );
    }
  }

  __displayMiddle() {
    /*
      rear_left_door_status: 'binary_sensor.captur_ii_porte_arriere_gauche',
      rear_right_door_status: 'binary_sensor.captur_ii_porte_arriere_droite',
      driver_door_status: 'binary_sensor.captur_ii_porte_conducteur',
      passenger_door_status: 'binary_sensor.captur_ii_porte_passager',

      charging: 'binary_sensor.captur_ii_en_charge',
      plugged_in: 'binary_sensor.captur_ii_prise',
      hatch_status: 'binary_sensor.captur_ii_trappe',

      charge_state: 'sensor.captur_ii_etat_de_charge',
      plug_state: 'sensor.captur_ii_etat_du_branchement',
      charging_remaining_time: 'sensor.captur_ii_temps_de_charge_restant',

      battery_autonomy: 'sensor.captur_ii_autonomie_de_la_batterie',
      battery_level: 'sensor.captur_ii_batterie',
      battery_last_activity:
        'sensor.captur_ii_derniere_activite_de_la_batterie',

*/

    return html`
      <div class="middle">${this.__displayLock()}${this.__displayFuel()}</div>
    `;
  }

  __displayLock() {
    return html`
      <div class="lock">
        <div class="${this.vehicle.lock_status ? 'green' : 'orange'}">
          <div class="circle"></div>
          <div class="h-path"></div>
          <sci-fi-icon
            icon="${this.vehicle.lock_status
              ? 'mdi:lock-check-outline'
              : 'mdi:lock-open-alert-outline'}"
          ></sci-fi-icon>
        </div>
      </div>
    `;
  }

  __displayFuel() {
    return html`
      <div class="fuel">
        <div>
          <div class="components">
            <div class="component">
              <sci-fi-icon icon="mdi:gas-station"></sci-fi-icon>
              <div>${this.vehicle.fuel_autonomy}</div>
            </div>
            <div class="component">
              <sci-fi-icon icon="mdi:fuel"></sci-fi-icon>
              <div>${this.vehicle.fuel_quantity}</div>
            </div>
          </div>
          <div class="h-path"></div>
          <div class="circle"></div>
        </div>
      </div>
    `;
  }

  __displayBottom() {
    return html`ACTIONS`;
  }

  __displaySpeeder() {
    return html`<div class="image">${top_speeder}</div>`;
  }
}

defineCustomElement('sci-fi-landspeeder', SciFiLandspeeder);
