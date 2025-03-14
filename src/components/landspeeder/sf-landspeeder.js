import {LitElement, html, nothing} from 'lit';

import {
  VEHICLE_CHARGE_STATES_CHARGE_ENDED,
  VEHICLE_CHARGE_STATES_CHARGE_ERROR,
  VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS,
  VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED,
  VEHICLE_CHARGE_STATES_NOT_IN_CHARGE,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE,
  VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE,
  VEHICLE_PLUG_STATES_ERROR,
  VEHICLE_PLUG_STATES_PLUGGED,
  VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE,
  VEHICLE_PLUG_STATES_UNKNOWN,
  VEHICLE_PLUG_STATES_UNPLUGGED,
} from '../../helpers/entities/vehicle/vehicle_const.js';
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
        ${this.__displayLocationLastActivity()}
      </div>
      <div class="component">
        <sci-fi-icon icon="mdi:counter"></sci-fi-icon>
        <div>${this.vehicle.mileage}</div>
      </div>
    </div>`;
  }

  __displayLocationLastActivity() {
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
    if (this.vehicle.location_gps.latitude == null) return;

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
          this.vehicle.location_gps.longitude
      );
    } else {
      /* else use Google */
      window.open(
        'https://maps.google.com/maps?daddr=' +
          this.vehicle.location_gps.latitude +
          ',' +
          this.vehicle.location_gps.longitude
      );
    }
  }

  __displayMiddle() {
    return html`
      <div class="middle">
        ${this.__displayLock()} ${this.__displayFuel()}
        ${this.__displayBattery()} ${this.__displayCharging()}
      </div>
    `;
  }

  __displayLock() {
    return html`
      <div class="lock">
        <div class="${this.vehicle.lock_status ? 'green' : 'orange'}">
          <sci-fi-icon
            icon="${this.vehicle.lock_status
              ? 'mdi:lock-check-outline'
              : 'mdi:lock-open-alert-outline'}"
          ></sci-fi-icon>
          <div class="h-path"></div>
          <div class="circle"></div>
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

  __displayBattery() {
    if (!this.vehicle.battery_autonomy || !this.vehicle.battery_level)
      return nothing;
    const battery_level =
      Math.round(this.vehicle.raw_battery_level / 10, 0) * 10;
    return html`
      <div class="battery ${this.__getBatteryLevelColor(battery_level)}">
        <div>
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="components">
            <div class="component">
              <sci-fi-icon icon="mdi:ev-station"></sci-fi-icon>
              <div>${this.vehicle.battery_autonomy}</div>
            </div>
            <div class="component">
              <sci-fi-icon
                icon="${this.__getBatteryLevelIcon(battery_level)}"
              ></sci-fi-icon>
              <div>${this.vehicle.battery_level}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  __getBatteryLevelColor(battery_level) {
    let res = 'green';
    if (battery_level <= 50) res = 'orange';
    if (battery_level <= 20) res = 'red';
    return res;
  }

  __getBatteryLevelIcon(battery_level) {
    if (!this.vehicle.charging) {
      return battery_level == 100
        ? 'mdi:battery'
        : battery_level == 0
          ? 'mdi:battery-outline'
          : 'mdi:battery-' + battery_level;
    } else {
      return battery_level <= 10
        ? 'mdi:battery-charging-10'
        : 'mdi:battery-charging-' + battery_level;
    }
  }

  __displayCharging() {
    if (this.vehicle.charging == null || !this.vehicle.charge_state)
      return nothing;
    return html`
      <div class="charging ${this.__getChargingState()}">
        <div>
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="components">
            <div class="component">
              <sci-fi-icon icon="${this.__getChargeStateIcon()}"></sci-fi-icon>
              <div>${this.vehicle.charge_state}</div>
            </div>
            <div class="component">
              <sci-fi-icon icon="${this.__getPlugStateIcon()}"></sci-fi-icon>
              <div>${this.vehicle.plug_state}</div>
            </div>
            ${this.__displayRemainingChargingTime()}
          </div>
        </div>
      </div>
    `;
  }

  __getChargingState() {
    if (
      this.vehicle.raw_charge_state == VEHICLE_CHARGE_STATES_CHARGE_ERROR ||
      this.vehicle.raw_plug_state == VEHICLE_PLUG_STATES_ERROR
    )
      return 'error';
    return this.vehicle.charging ? 'on' : 'off';
  }

  __displayRemainingChargingTime() {
    if (!this.vehicle.charging) return nothing;
    return html`<div class="component">
      <sci-fi-icon icon="mdi:update"></sci-fi-icon>
      <div>${this.vehicle.charging_remaining_time}</div>
    </div> `;
  }

  __getChargeStateIcon() {
    const states = {};
    states[VEHICLE_CHARGE_STATES_NOT_IN_CHARGE] = 'mdi:battery-off';
    states[VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE] = 'mdi:battery-clock';
    states[VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE] = 'mdi:battery-clock';
    states[VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS] =
      'mdi:battery-charging-medium';
    states[VEHICLE_CHARGE_STATES_CHARGE_ENDED] = 'mdi:battery-check';
    states[VEHICLE_CHARGE_STATES_CHARGE_ERROR] = 'mdi:battery-alert-variant';
    states[VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED] = 'mdi:battery-unknown';
    states[VEHICLE_CHARGE_STATES_UNAVAILABLE] = 'mdi:battery-unknown';
    return states[this.vehicle.raw_charge_state];
  }

  __getPlugStateIcon() {
    const states = {};
    states[VEHICLE_PLUG_STATES_UNPLUGGED] = 'sci:landspeeder-plugged';
    states[VEHICLE_PLUG_STATES_PLUGGED] = 'sci:landspeeder-plugged-off';
    states[VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE] =
      'sci:landspeeder-plugged-clock';
    states[VEHICLE_PLUG_STATES_ERROR] = 'sci:landspeeder-error-plug';
    states[VEHICLE_PLUG_STATES_UNKNOWN] = 'sci:landspeeder-unknown-plug';
    return states[this.vehicle.raw_plug_state];
  }

  __displaySpeeder() {
    return html`<div class="image">${top_speeder}</div>`;
  }
}

defineCustomElement('sci-fi-landspeeder', SciFiLandspeeder);
