import {LitElement, css, html, nothing} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import {pad} from '../../helpers/utils/utils.js';
import top_speeder from './data/top.js';

class SciFiLandspeeder extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          height: 100%;
          --speeder-width: 250px;
          --speeder-height: 493px;

          --extern-height: calc((100% - var(--speeder-height)) / 2);

          font-size: var(--font-size-small);
        }
        .content {
          display: flex;
          flex-direction: column;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .image {
          width: var(--speeder-width);
          height: var(--speeder-height);
          position: absolute;
          top: var(--extern-height);
          left: calc((100% - var(--speeder-width)) / 2);
        }
        sci-fi-icon {
          --icon-color: var(--secondary-light-alpha-color);
        }
        .top,
        .middle,
        .bottom {
          display: flex;
          flex-direction: row;

          border: 1px solid red;
        }
        .top,
        .bottom {
          height: calc(var(--extern-height) - 20px);
          padding: 10px;
        }
        .component {
          display: flex;
          flex-direction: column;
          flex: 1;
          color: var(--primary-light-color);
          text-align: center;
        }

        .component .sub-info {
          color: var(--secondary-bg-color);
          font-size: var(--font-size-xsmall);
        }
        .component .location {
          display: flex;
          column-gap: 5px;
          justify-content: center;
          flex-direction: row;
          text-transform: capitalize;
        }
        .component .location sci-fi-button {
          --primary-icon-color: var(--primary-light-color);
          --btn-size: var(--icon-size-xsmall);
        }
        .middle {
          flex: 1;
        }
      `,
    ];
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
        ${this.__displaySpeeder()}
        <div class="top">${this.__displayTop()}</div>
        <div class="middle">${this.__displayMiddle()}</div>
        <div class="bottom">${this.__displayBottom()}</div>
      </div>
    `;
  }

  __displayTop() {
    return html` <div class="component">
        <sci-fi-icon icon="mdi:map-marker"></sci-fi-icon>
        <div class="location">
          <div>${this.vehicle.location}</div>
          <sci-fi-button
            icon="mdi:open-in-new"
            @button-click=${this._openLocation}
          ></sci-fi-button>
        </div>
        <div class="sub-info">${this.__displayDate(this.vehicle.location_last_activity)}</div>
      </div>
      <div class="component">
        <sci-fi-icon icon="mdi:counter"></sci-fi-icon>
        <div>${this.vehicle.mileage}</div>
      </div>`;
  }

  __displayDate(d) {
    return [
      [pad(d.getDate()), pad(d.getMonth()), d.getFullYear()].join('/'),
      [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':'),
    ].join(' ');
  }

  _openLocation(e) {
    // TODO OPEN DEVICE DEFAULT MAP TO FIND YOUR VEHICLE
    console.log(this.vehicle.location_gps);
  }

  __displayBottom() {
    return html`ACTIONS`;
  }

  __displayMiddle() {
    /*
rear_left_door_status: 'binary_sensor.captur_ii_porte_arriere_gauche',
      rear_right_door_status: 'binary_sensor.captur_ii_porte_arriere_droite',
      driver_door_status: 'binary_sensor.captur_ii_porte_conducteur',
      passenger_door_status: 'binary_sensor.captur_ii_porte_passager',
      lock_status: 'binary_sensor.captur_ii_serrure',

      charging: 'binary_sensor.captur_ii_en_charge',
      plugged_in: 'binary_sensor.captur_ii_prise',
      hatch_status: 'binary_sensor.captur_ii_trappe',


      battery_autonomy: 'sensor.captur_ii_autonomie_de_la_batterie',
      battery_level: 'sensor.captur_ii_batterie',
      battery_last_activity:
        'sensor.captur_ii_derniere_activite_de_la_batterie',

      charge_state: 'sensor.captur_ii_etat_de_charge',
      plug_state: 'sensor.captur_ii_etat_du_branchement',
      charging_remaining_time: 'sensor.captur_ii_temps_de_charge_restant',

      fuel_autonomy: 'sensor.captur_ii_autonomie_en_carburant',
      fuel_quantity: 'sensor.captur_ii_quantite_de_carburant',  
*/

    return html``;
  }

  __displaySpeeder() {
    return html`<div class="image">${top_speeder}</div>`;
  }
}

defineCustomElement('sci-fi-landspeeder', SciFiLandspeeder);
