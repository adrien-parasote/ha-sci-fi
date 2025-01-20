import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';

class SciFiRadiator extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          width: 200px;
          height: 130px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
          color: var(--primary-light-color);
          border: var(--border-width) solid
            var(--secondary-light-light-alpha-color);
          border-radius: var(--border-radius);

          --border-color: darkgray;
          --background-color: lightgrey;

          --mode-color: var(--radiator-mode-color, #6c757d);
          --state-color: var(--radiator-state-color, #6c757d);
        }
        .title {
          text-align: center;
        }
        .content {
          display: flex;
          flex-direction: row;
          flex: 1;
        }
        .content .left {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .content .left .v-pipe {
          content: '';
          width: 4px;
          flex: 1;
          border-left: var(--border-width) solid var(--border-color);
          border-right: var(--border-width) solid var(--border-color);
          background: var(--background-color);
        }
        .content .left .mode {
          display: flex;
          flex-direction: column;
          border: var(--border-width) solid var(--secondary-light-alpha-color);
          border-radius: 5px;
          align-items: center;
        }
        .content .left .mode svg {
          align-self: center;
          height: var(--icon-size-normal);
          width: var(--icon-size-normal);
          padding: 5px;
          fill: var(--mode-color);
        }
        .content .left .mode .target-temp {
          display: flex;
          font-size: var(--font-size-small);
          color: var(--mode-color);
          border-top: var(--border-width) solid var(--border-color);
          padding: 2px;
        }
        .content .left .mode .target-temp .unit {
          font-size: var(--font-size-xxsmall);
        }
        .content .left .corner {
          height: 30px;
          width: 100%;
          background: var(--background-color);
          border: 2px solid var(--border-color);
          aspect-ratio: 1;
          clip-path: polygon(
            40% 0,
            60% 0,
            60% 50%,
            70% 60%,
            100% 60%,
            100% 88%,
            55% 88%,
            40% 73%
          );
        }
        .content .right {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex: 1;
        }
        .content .right .bottom {
          display: flex;
          flex-direction: row;
          height: 44px;
          align-items: end;
        }
        .content .right .bottom .h-pipe {
          content: '';
          height: 4px;
          flex: 1;
          border-top: var(--border-width) solid var(--border-color);
          border-bottom: var(--border-width) solid var(--border-color);
          background: var(--background-color);
          margin-bottom: 5px;
        }
        .content .right .bottom .state {
          border: var(--border-width) solid var(--border-color);
          border-radius: 5px;
          padding: 5px;
          height: 30px;
          width: 30px;
        }
        .content .right .bottom .state svg {
          height: 100%;
          width: 100%;
          fill: var(--state-color);
        }
        .content .right .top {
          display: flex;
          flex: 1;
          justify-content: center;
          color: var(--primary-light-color);
          text-shadow: 0px 0px 5px var(--primary-light-color);
        }
        .content .right .top .temperature-label {
          display: flex;
          flex-direction: row;
          font-size: 40px;
          justify-content: center;
        }
        .content .right .top .temperature-label .radical {
          align-self: center;
        }
        .content .right .top .temperature-label .decimal {
          display: flex;
          flex-direction: column;
          font-size: 15px;
          justify-content: center;
        }
      `,
    ];
  }

  static get properties() {
    return {
      name: {type: String},
      mode: {type: String},
      modeIcon: {type: String, attribute: 'mode-icon'},
      targetTemperature: {type: Number, attribute: 'target-temperature'},
      currentTemperature: {type: Number, attribute: 'current-temperature'},
      stateIcon: {type: String, attribute: 'state-icon'},
      unit: {type: String},
    };
  }

  constructor() {
    super();
    this.name = this.name ? this.name : null;
    this.mode = this.mode ? this.mode : null;
    this.modeIcon = this.modeIcon ? this.modeIcon : null;
    this.targetTemperature = this.targetTemperature
      ? this.targetTemperature
      : 0;
    this.currentTemperature = this.currentTemperature
      ? this.currentTemperature
      : 0;
    this.stateIcon = this.stateIcon ? this.stateIcon : null;
    this.unit = this.unit ? this.unit : '°C';
  }

  render() {
    return html`
      <div class="title">${this.name}</div>
      <div class="content">
        <div class="left">
          <div class="mode">
            ${getIcon(this.modeIcon)}
            <div class="target-temp">
              ${this.targetTemperature}<span class="unit">${this.unit}</span>
            </div>
          </div>
          <div class="v-pipe"></div>
          <div class="corner"></div>
        </div>
        <div class="right">
          <div class="top">${this.__getTemperatureLabel()}</div>
          <div class="bottom">
            <div class="h-pipe" style="flex: 2;"></div>
            <div class="state">${getIcon(this.stateIcon)}</div>
            <div class="h-pipe"></div>
          </div>
        </div>
      </div>
    `;
  }

  __getTemperatureLabel() {
    return html`
      <div class="temperature-label">
        <div class="radical">
          ${this.currentTemperature.toFixed(1).split('.')[0]}
        </div>
        <div class="decimal">
          <div>${this.unit}</div>
          <div>.${this.currentTemperature.toFixed(1).split('.')[1]}</div>
        </div>
      </div>
    `;
  }
}

window.customElements.get('sci-fi-radiator') ||
  window.customElements.define('sci-fi-radiator', SciFiRadiator);
