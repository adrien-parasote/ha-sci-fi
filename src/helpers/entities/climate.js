import {LitElement, html, nothing} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';
import {
  ENTITY_KIND_CLIMATE,
  HASS_CLIMATE_HVAC_MODE_OFF,
  HASS_CLIMATE_PRESET_MODE_AUTO,
  HASS_CLIMATE_PRESET_MODE_BOOST,
  HASS_CLIMATE_PRESET_MODE_COMFORT,
  HASS_CLIMATE_PRESET_MODE_COMFORT_1,
  HASS_CLIMATE_PRESET_MODE_COMFORT_2,
  HASS_CLIMATE_PRESET_MODE_ECO,
  HASS_CLIMATE_PRESET_MODE_EXTERNAL,
  HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
  HASS_CLIMATE_PRESET_MODE_NONE,
  HASS_CLIMATE_PRESET_MODE_PROG,
  HASS_CLIMATE_SERVICE,
  HASS_CLIMATE_SERVICE_SET_HVAC_MODE,
  HASS_CLIMATE_SERVICE_SET_PRESET_MODE,
  RADIATOR_BACKGROUND_PATH,
  RADIATOR_BORDER_PATH,
  RADIATOR_GRADIENT_PATH,
  RADIATOR_SVG_VIEWBOX_HEIGHT,
  RADIATOR_SVG_VIEWBOX_WIDTH,
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_COOL,
  STATE_CLIMATE_HEAT,
  STATE_CLIMATE_OFF,
} from './climate_const.js';
import style from './climate_style.js';

export class ClimateEntity {
  static kind = ENTITY_KIND_CLIMATE;

  constructor(entity, device) {
    this.entity_id = entity.entity_id ? entity.entity_id : null;
    this.state = entity.state ? entity.state : STATE_CLIMATE_OFF;

    this.hvac_modes = entity.attributes.hvac_modes
      ? entity.attributes.hvac_modes
      : null;
    this.max_temp = entity.attributes.max_temp
      ? entity.attributes.max_temp
      : 35;
    this.min_temp = entity.attributes.min_temp ? entity.attributes.min_temp : 7;
    this.preset_mode = entity.attributes.preset_mode
      ? entity.attributes.preset_mode
      : null;
    this.preset_modes = entity.attributes.preset_modes
      ? entity.attributes.preset_modes
      : [];
    this.current_temperature = entity.attributes.current_temperature
      ? entity.attributes.current_temperature
      : null;
    this.temperature = entity.attributes.temperature
      ? entity.attributes.temperature
      : null;
    this.friendly_name = entity.attributes.friendly_name
      ? entity.attributes.friendly_name
      : null;
    this.icon = entity.attributes.icon ? entity.attributes.icon : null;

    this.manufacturer = device.manufacturer ? device.manufacturer : null;
    this.model = device.model ? device.model : null;
    this.device_id = device.id ? device.id : null;

    // Floor & area links
    this.floor_id = null;
    this.area_id = device.area_id ? device.area_id : null;
  }

  get kind() {
    return ClimateEntity.kind;
  }

  get active() {
    return (
      STATE_CLIMATE_HEAT == this.state ||
      (STATE_CLIMATE_AUTO == this.state &&
        this.preset_mode != HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION)
    );
  }

  renderAsEntity() {
    return {
      entity_id: this.entity_id,
      attributes: {
        hvac_mode: this.hvac_mode,
        max_temp: this.max_temp,
        min_temp: this.min_temp,
        preset_mode: this.preset_mode,
        preset_modes: this.preset_modes,
        current_temperature: this.current_temperature,
        temperature_unit: this.temperature_unit,
        temperature: this.temperature,
        friendly_name: this.friendly_name,
        icon: this.icon,
        hvac_modes: this.hvac_modes,
      },
      state: this.state,
    };
  }

  setPresetMode(hass, preset_mode) {
    return hass.callService(
      HASS_CLIMATE_SERVICE,
      HASS_CLIMATE_SERVICE_SET_PRESET_MODE,
      {
        entity_id: [this.entity_id],
        preset_mode: preset_mode,
      }
    );
  }

  setHvacMode(hass, hvac_mode) {
    return hass.callService(
      HASS_CLIMATE_SERVICE,
      HASS_CLIMATE_SERVICE_SET_HVAC_MODE,
      {
        entity_id: [this.entity_id],
        hvac_mode: hvac_mode,
      }
    );
  }
}

export class StoveEntity extends ClimateEntity {
  get active() {
    return [STATE_CLIMATE_HEAT, STATE_CLIMATE_COOL].includes(this.state);
  }
}

class SciFiRadiator extends LitElement {
  static get styles() {
    return [common_style, style];
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
    const t_min = -1; // => avg_temp
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
          t_min -
          3 // compensation
      );
    }
    return [l_temp - 2, t_temp - 2]; // -2 for border
  }

  __displayHexagon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${RADIATOR_SVG_VIEWBOX_WIDTH} ${RADIATOR_SVG_VIEWBOX_HEIGHT}"
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
          d="${RADIATOR_GRADIENT_PATH}"
          style='fill: url("#gradient");'
          transform="matrix(1, 0, 0, 1, 0, -4.440892098500626e-16)"
        />
        <path
          class="border"
          d="${RADIATOR_BORDER_PATH}"
          transform="matrix(1, 0, 0, 1, 0, -4.440892098500626e-16)"
        />
        <path
          class="background"
          d="${RADIATOR_BACKGROUND_PATH}"
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
    const modes_temp = {};
    modes_temp[HASS_CLIMATE_PRESET_MODE_NONE] = null;
    modes_temp[HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION] =
      this.climateEntity.attributes.min_temp;
    modes_temp[HASS_CLIMATE_PRESET_MODE_ECO] =
      this.climateEntity.attributes.temperature - 3;
    modes_temp[HASS_CLIMATE_PRESET_MODE_COMFORT] =
      this.climateEntity.attributes.temperature;
    modes_temp[HASS_CLIMATE_PRESET_MODE_COMFORT_1] =
      this.climateEntity.attributes.temperature - 1;
    modes_temp[HASS_CLIMATE_PRESET_MODE_COMFORT_2] =
      this.climateEntity.attributes.temperature - 2;
    modes_temp[HASS_CLIMATE_PRESET_MODE_AUTO] =
      this.climateEntity.attributes.temperature;
    modes_temp[HASS_CLIMATE_PRESET_MODE_BOOST] =
      this.climateEntity.attributes.max_temp;
    modes_temp[HASS_CLIMATE_PRESET_MODE_EXTERNAL] =
      this.climateEntity.attributes.temperature;
    modes_temp[HASS_CLIMATE_PRESET_MODE_PROG] =
      this.climateEntity.attributes.temperature;
    return modes_temp[this.climateEntity.attributes.preset_mode];
  }

  __getCurrentTemperature() {
    if (!this.climateEntity.attributes.current_temperature) return nothing;
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
    return html`
      <div class="spacer hide spacer-preset-mode">
        <div class="vertical"></div>
        <div class="horizontal"></div>
        <div class="circle"></div>
      </div>
      <div
        class="button"
        style="--mode-color:${this.styles.mode.colors[
          this.climateEntity.attributes.preset_mode
        ]}"
        @click="${(e) => this.__showHideDropdown('preset-mode')}"
      >
        ${getIcon(
          this.styles.mode.icons[this.climateEntity.attributes.preset_mode]
        )}
      </div>
      <div class="spacer-middle"></div>
      <div
        class="button"
        style="--mode-color:${this.styles.state.colors[
          this.climateEntity.state
        ]}"
        @click="${(e) => this.__showHideDropdown('hvac')}"
      >
        ${getIcon(this.styles.state.icons[this.climateEntity.state])}
      </div>
      <div class="spacer hide spacer-hvac">
        <div class="circle"></div>
        <div class="horizontal"></div>
        <div class="vertical"></div>
      </div>

      ${this.__displayHvacOptions()} ${this.__displayPresetOptions()}
    `;
  }

  __displayHvacOptions() {
    return html`
      <div class="hvac-options hide">
        ${this.climateEntity.attributes.hvac_modes
          .filter((m) => !this.excludeHvac.includes(m))
          .map(
            (hvac_mode) => html`
              <div
                style="--option-color:${this.styles.state.colors[hvac_mode]}"
                @click="${(e) => this.__selectHvacMode(e, hvac_mode)}"
              >
                ${getIcon(this.styles.state.icons[hvac_mode])} ${hvac_mode}
              </div>
            `
          )}
      </div>
    `;
  }

  __displayPresetOptions() {
    return html`
      <div class="preset-mode-options hide">
        ${this.climateEntity.attributes.preset_modes
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
          .map(
            (preset_mode) => html`
              <div
                style="--option-color:${this.styles.mode.colors[preset_mode]}"
                @click="${(e) => this.__selectPresetMode(e, preset_mode)}"
              >
                ${getIcon(this.styles.mode.icons[preset_mode])}
                ${preset_mode.replace('_', ' ')}
              </div>
            `
          )}
      </div>
    `;
  }

  __showHideDropdown(kind) {
    this.shadowRoot.querySelector('.spacer-' + kind).classList.toggle('hide');
    this.shadowRoot
      .querySelector('.' + kind + '-options')
      .classList.toggle('hide');
  }

  __selectHvacMode(e, hvac_mode) {
    e.preventDefault();
    e.stopPropagation();
    if (hvac_mode != this.climateEntity.state) {
      this.dispatchEvent(
        new CustomEvent('change-hvac-mode', {
          bubbles: true,
          composed: true,
          detail: {
            id: this.climateEntity.entity_id,
            mode: hvac_mode,
          },
        })
      );
    }
    this.__showHideDropdown('hvac');
  }

  __selectPresetMode(e, preset_mode) {
    e.preventDefault();
    e.stopPropagation();
    if (preset_mode != this.climateEntity.attributes.preset_mode) {
      this.dispatchEvent(
        new CustomEvent('change-preset-mode', {
          bubbles: true,
          composed: true,
          detail: {
            id: this.climateEntity.entity_id,
            mode: preset_mode,
          },
        })
      );
    }
    this.__showHideDropdown('preset-mode');
  }
}

window.customElements.get('sci-fi-radiator') ||
  window.customElements.define('sci-fi-radiator', SciFiRadiator);
