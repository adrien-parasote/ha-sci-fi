import {LitElement, css, html, nothing} from 'lit';

import '../../helpers/components/button.js';
import '../../helpers/components/wheel.js';
import common_style from '../common_style.js';
import {
  HASS_CLIMATE_HVAC_MODE_OFF,
  HASS_CLIMATE_PRESET_MODE_AUTO,
  HASS_CLIMATE_PRESET_MODE_COMFORT,
  HASS_CLIMATE_PRESET_MODE_ECO,
  HASS_CLIMATE_PRESET_MODE_EXTERNAL,
  HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
  HASS_CLIMATE_PRESET_MODE_NONE,
  HASS_CLIMATE_PRESET_MODE_PROG,
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_OFF,
} from '../entities/climate_const.js';

class SciFiRadiator extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          flex-direction: row;
          border: var(--border-width) solid var(--secondary-bg-color);
          border-radius: var(--border-radius);
          border-top-left-radius: unset;
          border-bottom-left-radius: unset;
          height: 240px;
          width: 336px;
        }
        .img {
          display: flex;
          height: 100%;
          align-items: end;
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: row;
        }
        .content .right {
          padding: 25px 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .content .right sci-fi-button-select-card {
          --title-color: var(--secondary-bg-color);
          --btn-padding: 5px 5px 5px 10px;
        }
        .content .left {
          flex: 1;
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
        }
        .content .left .select-temperature {
          margin-top: 25px;
          position: relative;
        }
        .content .left .select-temperature .display {
          position: absolute;
          display: flex;
          flex-direction: row;
          left: -14px;
          top: 14px;
          align-items: center;
        }
        .content .left .select-temperature .display .h-path,
        .content .left .temperature .temperature-label .display .h-path {
          border-color: var(--secondary-bg-color);
          width: 5px;
        }
        .content .left .select-temperature .display .circle {
          background-color: unset;
        }
        .content .left .select-temperature sci-fi-wheel {
          --item-font-size: var(--font-size-small);
          --item-color: var(--primary-light-color);
          --text-font-color: var(--secondary-bg-color);
          --padding: 5px;
        }
        .content .left .temperature {
          display: flex;
          flex: 1;
          width: 100%;
          align-items: center;
        }
        .content .left .temperature .temperature-label {
          display: flex;
          position: relative;
          flex-direction: row;
          font-size: 40px;
          justify-content: center;
          color: var(--primary-light-color);
          text-shadow: 0px 0px 5px var(--primary-light-color);
          width: 100%;
          height: fit-content;
          border-bottom: calc(2 * var(--border-width)) solid
            var(--secondary-bg-color);
          margin-right: 10px;
        }
        .content .left .temperature .temperature-label .radical {
          align-self: center;
        }
        .content .left .temperature .temperature-label .decimal {
          display: flex;
          flex-direction: column;
          font-size: 15px;
          justify-content: center;
        }
        .content .left .temperature .temperature-label .display {
          position: absolute;
          display: flex;
          flex-direction: row;
          left: -45px;
          bottom: -5px;
          align-items: center;
        }
        .content .left .temperature .temperature-label .display .h-path {
          width: 35px;
        }
      `,
    ];
  }

  static get properties() {
    return {
      climateEntity: {type: Object, attribute: 'climate-entity'},
      styles: {type: Object},
      unit: {type: String},
      excludedModes: {type: Array, attribute: 'excluded-modes'},
      excludeHvac: {type: Array, attribute: 'excluded-hvac'},
    };
  }

  constructor() {
    super();
    this.climateEntity = this.climateEntity ? this.climateEntity : {};
    this.unit = this.unit ? this.unit : null;
    this.styles = this.styles ? this.styles : {};
    this.excludedModes = this.excludedModes
      ? this.excludedModes
      : [
          HASS_CLIMATE_PRESET_MODE_NONE,
          HASS_CLIMATE_PRESET_MODE_EXTERNAL,
          HASS_CLIMATE_PRESET_MODE_PROG,
          HASS_CLIMATE_PRESET_MODE_AUTO,
        ];
    this.excludeHvac = this.excludeHvac
      ? this.excludeHvac
      : [HASS_CLIMATE_HVAC_MODE_OFF];
  }

  render() {
    if (!this.climateEntity) nothing;
    return html`
      <div class="img">${this.__displayImage()}</div>
      <div class="content">
        <div class="left">${this.__displayleft()}</div>
        <div class="right">${this.__displayRight()}</div>
      </div>
    `;
  }

  __displayImage() {
    return html`<?xml version="1.0" encoding="utf-8"?>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 210"
        width="100px"
        height="210px"
      >
        <defs>
          <linearGradient
            x1="113.519"
            y1="127.222"
            x2="113.519"
            y2="327.222"
            id="gl"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-0.001038, -1, 0.069085, -0.000071, -8.829216, 113.537067)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="143.519"
            y1="127.222"
            x2="143.519"
            y2="327.222"
            id="gr"
            gradientTransform="matrix(-0.005887, 0.999983, -0.075024, -0.000442, 45.392197, -143.43744)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            x1="113.519"
            y1="127.222"
            x2="113.519"
            y2="327.222"
            id="gl1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-0.005477, -0.999985, 0.075758, -0.000415, 30.825578, 113.579361)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="143.519"
            y1="127.222"
            x2="143.519"
            y2="327.222"
            id="gr1"
            gradientTransform="matrix(0.008704, 0.999962, -0.056213, 0.000489, 77.202131, -143.618407)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="110"
            y1="188"
            x2="117"
            y2="188"
            id="steel"
            gradientTransform="matrix(1, 0, 0, 1, -30, -0.000001)"
          >
            <stop offset="0" style="stop-color: #99a3a3" />
            <stop offset="0.344" style="stop-color: #a8b0b2" />
            <stop offset="1" style="stop-color: #99a3a3" />
          </linearGradient>
        </defs>
        <g
          transform="matrix(1, 0, 0, 1, -1.1191048088221578e-13, -6.039613253960852e-14)"
        >
          <path
            d="M 0 0 L 71.149 0 C 73.276 0 75 1.724 75 3.851 L 75 196.149 C 75 198.276 73.276 200 71.149 200 L 0 200 Z"
            style="fill:#181818"
          />
          <rect
            width="15"
            height="200"
            style='fill: url("#gl"); opacity: 0.6;'
          />
          <rect
            x="20"
            width="15"
            height="200"
            style='fill: url("#gr"); opacity: 0.6;'
          />
          <rect
            width="15"
            height="200"
            style='fill: url("#gl1"); opacity: 0.6;'
            x="40"
          />
          <rect
            x="60"
            width="15"
            height="200"
            style='fill: url("#gr1"); opacity: 0.6;'
            rx="3.798"
            ry="3.798"
          />
        </g>
        <g>
          <path
            d="M 85.085 195.569 L 86 199 L 86 210 L 81 210 L 81 199 L 81.567 196.524 L 80 196 L 75 196 L 75 191 L 80 191 L 81.26 191.133 L 84.473 191.925 L 85.085 195.569 Z"
            style="fill: #cd9d70"
          />
          <rect
            x="80"
            y="188"
            width="7"
            height="11"
            style='fill: url("#steel");'
            rx="0.751"
            ry="0.751"
          />
          <rect x="75" width="5" height="5" style="fill:#cd9d70;" y="10" />
          <rect
            x="80"
            y="5"
            width="20"
            height="15"
            style="fill: #e5e3d9; stroke: #eaecec; stroke-width: 0.5px;"
            rx="1.007"
            ry="1.007"
          />
        </g>
      </svg>`;
  }

  __displayleft() {
    return html`
      <div class="select-temperature">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
        </div>
        <sci-fi-wheel
          .items=${this.__getTemperatureItems()}
          selected-id="${this.climateEntity.attributes.temperature -
          this.climateEntity.attributes.min_temp}"
          @wheel-change="${this.__select}"
          ?disable=${[STATE_CLIMATE_AUTO, STATE_CLIMATE_OFF].includes(
            this.climateEntity.state
          )}
          in-line
        ></sci-fi-wheel>
      </div>
      ${this.__getCurrentTemperature()}
    `;
  }

  __getCurrentTemperature() {
    if (!this.climateEntity.attributes.current_temperature) return nothing;
    return html` <div class="temperature">
      <div class="temperature-label">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
        </div>
        <div class="radical">
          ${this.climateEntity.attributes.current_temperature
            .toFixed(1)
            .split('.')[0]}
        </div>
        <div class="decimal">
          <div>${this.unit}</div>
          <div>
            .${this.climateEntity.attributes.current_temperature
              .toFixed(1)
              .split('.')[1]}
          </div>
        </div>
      </div>
    </div>`;
  }

  __displayRight() {
    const preset_color =
      this.styles.mode.colors[this.climateEntity.attributes.preset_mode];
    const hvac_color = this.styles.state.colors[this.climateEntity.state];
    return html`
      <sci-fi-button-select-card
        position="left down"
        icon=${this.styles.mode.icons[
          this.climateEntity.attributes.preset_mode
        ]}
        title="preset"
        text=${this.climateEntity.attributes.preset_mode}
        items=${JSON.stringify(this.__getPresetOptions())}
        @button-select="${this.__select}"
        style="--primary-icon-color:${preset_color};--label-text-color: ${preset_color};"
      ></sci-fi-button-select-card>
      <div style="flex:1"></div>
      <sci-fi-button-select-card
        position="left"
        icon=${this.styles.state.icons[this.climateEntity.state]}
        title="mode"
        text=${this.climateEntity.state}
        items=${JSON.stringify(this.__getHvacOptions())}
        @button-select="${this.__select}"
        style="--primary-icon-color:${hvac_color};--label-text-color: ${hvac_color};"
      ></sci-fi-button-select-card>
    `;
  }

  __getPresetOptions() {
    return this.climateEntity.attributes.preset_modes
      .filter((m) => {
        if (this.climateEntity.state == STATE_CLIMATE_AUTO) {
          if (
            this.climateEntity.attributes.preset_mode !=
            HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION
          )
            return m == HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION;
          return [
            HASS_CLIMATE_PRESET_MODE_ECO,
            HASS_CLIMATE_PRESET_MODE_COMFORT,
          ].includes(m);
        }
        return (
          !this.excludedModes.includes(m) &&
          m != this.climateEntity.attributes.preset_mode
        );
      })
      .map((mode) => {
        return {
          value: mode,
          action: 'preset',
          color: this.styles.mode.colors[mode],
          icon: this.styles.mode.icons[mode]
            ? this.styles.mode.icons[mode]
            : 'mdi:information-off-outline',
          text: mode.replace('_', ' '),
        };
      });
  }

  __getHvacOptions() {
    return this.climateEntity.attributes.hvac_modes
      .filter((m) => !this.excludeHvac.includes(m))
      .map((hvac_mode) => {
        return {
          value: hvac_mode,
          action: 'mode',
          color: this.styles.state.colors[hvac_mode],
          icon: this.styles.state.icons[hvac_mode]
            ? this.styles.state.icons[hvac_mode]
            : 'mdi:information-off-outline',
          text: hvac_mode.replace('_', ' '),
        };
      });
  }

  __getTemperatureItems() {
    // Build item
    return Array.from(
      Array(
        this.climateEntity.attributes.max_temp -
          this.climateEntity.attributes.min_temp +
          1
      ).keys()
    ).map((e, idx) => {
      return {
        id: idx,
        action: 'temperature',
        text: [idx + this.climateEntity.attributes.min_temp, this.unit].join(
          ''
        ),
        value: idx + this.climateEntity.attributes.min_temp,
      };
    });
  }

  __select(e) {
    e.preventDefault();
    e.stopPropagation();
    let event;

    if (
      e.detail.action == 'mode' &&
      e.detail.value != this.climateEntity.state
    ) {
      event = new CustomEvent('change-hvac-mode', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          mode: e.detail.value,
        },
      });
    }

    if (
      e.detail.action == 'preset' &&
      e.detail.value != this.climateEntity.attributes.preset_mode
    ) {
      event = new CustomEvent('change-preset-mode', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          mode: e.detail.value,
        },
      });
    }

    if (e.detail.action == 'temperature') {
      event = new CustomEvent('change-temperature', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          temperature: e.detail.value,
        },
      });
    }

    if (event) this.dispatchEvent(event);
  }
}

window.customElements.get('sci-fi-radiator') ||
  window.customElements.define('sci-fi-radiator', SciFiRadiator);
