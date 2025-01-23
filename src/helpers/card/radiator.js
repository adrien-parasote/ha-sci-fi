import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';

const SVG_VIEWBOX_WIDTH = 50;
const SVG_VIEWBOX_HEIGHT = 55.75;
const GRADIENT_PATH =
  'M 25 0 L 50 14.364 L 50 42.28 L 48.442 42.28 L 48.496 42.249 L 48.496 15.251 L 25 1.75 L 1.503 15.25 L 1.503 42.25 L 1.555 42.28 L 0 42.28 L 0 14.363 Z';
const BORDER_PATH =
  'M 25 1.75 L 48.496 15.251 L 48.496 42.249 L 25 55.75 L 1.503 42.25 L 1.503 15.25 L 25 1.75 Z';
const BACKGROUND_PATH =
  'M 25 2.895 L 47.5 15.824 L 47.5 41.676 L 25 54.605 L 2.5 41.677 L 2.5 15.823 L 25 2.895 Z';

class SciFiRadiator extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --stop-color-0: #aed6f1;
          --stop-color-0-25: #f9e79f;
          --stop-color-0-5: #fad7a0;
          --stop-color-0-75: #edbb99;
          --stop-color-1: #c0392b;
          display: flex;
          flex-direction: column;
          border: var(--border-width) solid var(--secondary-bg-color);
          border-radius: var(--border-radius);
          padding: 10px;
          row-gap: 10px;
          height: 240px;
          width: 332px;
        }
        .hexagon-container {
          position: relative;
          display: flex;
          flex: 1;
          width: 100%;
          align-items: center;
          justify-content: center;
        }
        .hexagon-container svg {
          width: 180px;
          height: 180px;
        }
        .hexagon-container svg .border {
          fill: var(--secondary-bg-color);
        }
        .hexagon-container svg .background {
          fill: var(--primary-bg-color);
        }
        .hexagon-container .pointer {
          position: absolute;
          content: '';
          width: 15px;
          height: 15px;
          background-color: var(--pointer-color);
          border: 2px solid white;
          top: var(--pointer-top);
          left: var(--pointer-left);
          border-radius: 50%;
        }
        .hexagon-container .info {
          position: absolute;
        }
        .hexagon-container .info .state svg {
          width: var(--icon-size-subtitle);
          height: var(---icon-size-subtitle);
          fill: var(--state-color);
        }
        .hexagon-container .info .temperature-label {
          display: flex;
          flex-direction: row;
          font-size: 40px;
          justify-content: center;
          margin: 10px;
          color: var(--primary-light-color);
        }
        .hexagon-container .info .temperature-label .radical {
          align-self: center;
        }
        .hexagon-container .info .temperature-label .decimal {
          display: flex;
          flex-direction: column;
          font-size: 15px;
          justify-content: center;
        }
        .hexagon-container .info .target-temperature {
          text-align: center;
          font-size: var(--font-size-xsmall);
          color: var(--secondary-light-color);
        }
        .hexagon-container .info .target-temperature .label {
          text-transform: capitalize;
        }
        .controls {
          display: flex;
          flex-direction: row;
          column-gap: 10px;
        }
        .controls .preset-mode-button {
          border: var(--border-width) solid var(--secondary-bg-color);
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
        }
        .controls .preset-mode-button.selected {
          border-color: var(--primary-light-color);
          background: var(--secondary-light-light-alpha-color);
        }
        .controls .preset-mode-button svg {
          width: var(--icon-size-normal);
          height: var(---icon-size-normal);
          fill: var(--mode-color);
          opacity: 0.5;
        }
        .controls .preset-mode-button.selected svg {
          opacity: 1;
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
    };
  }

  constructor() {
    super();
    this.climateEntity = this.climateEntity ? this.climateEntity : {};
    this.unit = this.unit ? this.unit : null;
    this.styles = this.styles ? this.styles : {};
    this.excludedModes = this.excludedModes
      ? this.excludedModes
      : ['none', 'external', 'prog', 'auto'];
  }

  render() {
    if (!this.climateEntity) return html``;
    return html`
      <div class="hexagon-container">
        ${this.__displayHexagonContent()} ${this.__displayPointer()}
        ${this.__displayHexagon()}
      </div>
      <div class="controls">${this.__displayControls()}</div>
    `;
  }

  __displayPointer() {
    var position = this.__getPointerPosition();
    return html`<div
      class="pointer"
      style="--pointer-color:var(${this.__getCurrentTemperatureColor()});
             --pointer-left:${position[0]}px;
             --pointer-top:${position[1]}px;"
    ></div>`;
  }

  __getPointerPosition() {
    const temp = this.climateEntity.attributes.current_temperature;

    const l_min = 68; // x = 7 => this.climateEntity.attributes.min_temp
    const l_max = 241; // => this.climateEntity.attributes.max_temp
    const dx = l_max - l_min; // => this.climateEntity.attributes.max_temp - this.climateEntity.attributes.min_temp
    const l_temp = Math.round(
      (dx * (temp - this.climateEntity.attributes.min_temp)) /
        (this.climateEntity.attributes.max_temp -
          this.climateEntity.attributes.min_temp) +
        l_min
    );
    const avg_temp =
      (this.climateEntity.attributes.max_temp +
        this.climateEntity.attributes.min_temp) /
      2;
    const t_min = -4; // => avg_temp
    const t_max = 44; // => this.climateEntity.attributes.max_temp || this.climateEntity.attributes.min_temp
    const dy = t_max - t_min; // => this.climateEntity.attributes.max_temp || this.climateEntity.attributes.min_temp - avg_temp
    let t_temp = null;
    if (temp < avg_temp) {
      t_temp = Math.round(
        (dy * (temp - avg_temp)) /
          (this.climateEntity.attributes.min_temp - avg_temp) +
          t_min
      );
    } else {
      t_temp = Math.round(
        (dy * (temp - avg_temp)) /
          (this.climateEntity.attributes.max_temp - avg_temp) +
          t_min
      );
    }
    return [l_temp - 2, t_temp - 2]; // -2 for border
  }

  __displayHexagon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="50"
            y2="50"
            id="gradient"
            gradientTransform="matrix(0.415813, -0.742372, 0.566876, 0.743768, 0.347302, 0.027379)"
          >
            <stop offset="0" style="stop-color: var(--stop-color-0);" />
            <stop offset="0.25" style="stop-color: var(--stop-color-0-25);" />
            <stop offset="0.5" style="stop-color: var( --stop-color-0-5);" />
            <stop offset="0.75" style="stop-color: var(--stop-color-0-75);" />
            <stop offset="1" style="stop-color: var(--stop-color-1);" />
          </linearGradient>
        </defs>
        <path
          d="${GRADIENT_PATH}"
          style='fill: url("#gradient");'
          transform="matrix(1, 0, 0, 1, 0, -4.440892098500626e-16)"
        />
        <path
          class="border"
          d="${BORDER_PATH}"
          transform="matrix(1, 0, 0, 1, 0, -4.440892098500626e-16)"
        />
        <path
          class="background"
          d="${BACKGROUND_PATH}"
          transform="matrix(1, 0, 0, 1, 0, -4.440892098500626e-16)"
        />
      </svg>
    `;
  }

  __displayHexagonContent() {
    return html`
      <div class="info">
        ${this.__getState()} ${this.__getCurrentTemperature()}
        <div class="target-temperature">
          <div class="label">
            ${this.climateEntity.attributes.preset_mode.replace('_', ' ')}
          </div>
          <div class="value">${this.__getTargetTemperature()}${this.unit}</div>
        </div>
      </div>
    `;
  }

  __getTargetTemperature() {
    const modes_temp = {
      none: null,
      frost_protection: this.climateEntity.attributes.min_temp,
      eco: this.climateEntity.attributes.temperature - 3.5,
      comfort: this.climateEntity.attributes.temperature,
      'comfort-1': this.climateEntity.attributes.temperature - 1,
      'comfort-2': this.climateEntity.attributes.temperature - 2,
      auto: this.climateEntity.attributes.temperature,
      boost: this.climateEntity.attributes.max_temp,
      external: this.climateEntity.attributes.temperature,
      prog: this.climateEntity.attributes.temperature,
    };
    return modes_temp[this.climateEntity.attributes.preset_mode];
  }

  __getCurrentTemperature() {
    return html` <div
      class="temperature-label"
      style="color:var(${this.__getCurrentTemperatureColor()})"
    >
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
    </div>`;
  }

  __getCurrentTemperatureColor() {
    const colors = {
      0: '--stop-color-0',
      0.25: '--stop-color-0-25',
      0.5: '--stop-color-0-5',
      0.75: '--stop-color-0-75',
      1: '--stop-color-1',
    };
    return colors[
      Math.round(
        (this.climateEntity.attributes.current_temperature /
          this.climateEntity.attributes.max_temp) *
          4
      ) / 4
    ];
  }

  __getState() {
    const icon = this.styles.state.icons[this.climateEntity.state];
    const color = this.styles.state.colors[this.climateEntity.state];
    return html`
      <div class="state" style="--state-color:${color}">${getIcon(icon)}</div>
    `;
  }

  __displayControls() {
    return this.climateEntity.attributes.preset_modes
      .filter((m) => !this.excludedModes.includes(m))
      .map((preset_mode) => {
        return html`
          <div
            class="preset-mode-button ${preset_mode ==
            this.climateEntity.attributes.preset_mode
              ? 'selected'
              : ''}"
            style="--mode-color:${this.styles.mode.colors[preset_mode]}"
            @click="${(e) => this.__selectMode(e, preset_mode)}"
          >
            ${getIcon(this.styles.mode.icons[preset_mode])}
          </div>
        `;
      });
  }

  __selectMode(e, preset_mode) {
    e.preventDefault();
    e.stopPropagation();
    if (preset_mode != this.climateEntity.attributes.preset_mode) {
      this.dispatchEvent(
        new CustomEvent('change-mode', {
          bubbles: true,
          composed: true,
          detail: {
            id: this.climateEntity.entity_id,
            mode: preset_mode,
          },
        })
      );
    }
  }
}

window.customElements.get('sci-fi-radiator') ||
  window.customElements.define('sci-fi-radiator', SciFiRadiator);
