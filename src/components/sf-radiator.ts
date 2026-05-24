import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';
import './sf-wheel.js';
import './buttons/sf-button-card-select.js';

const STATE_CLIMATE_HEAT = 'heat';
const STATE_CLIMATE_COOL = 'cool';
const STATE_CLIMATE_OFF = 'off';
const STATE_CLIMATE_AUTO = 'auto';

const HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION = 'frost_protection';
const HASS_CLIMATE_PRESET_MODE_FROST = 'frost';
const HASS_CLIMATE_PRESET_MODE_ECO = 'eco';
const HASS_CLIMATE_PRESET_MODE_COMFORT = 'comfort';
const HASS_CLIMATE_PRESET_MODE_COMFORT_1 = 'comfort_1';
const HASS_CLIMATE_PRESET_MODE_COMFORT_2 = 'comfort_2';
const HASS_CLIMATE_PRESET_MODE_BOOST = 'boost';
const HASS_CLIMATE_PRESET_MODE_NONE = 'none';
const HASS_CLIMATE_PRESET_MODE_EXTERNAL = 'external';
const HASS_CLIMATE_PRESET_MODE_PROG = 'prog';
const HASS_CLIMATE_PRESET_MODE_AUTO = 'auto';

@customElement('sf-radiator')
export class SciFiRadiator extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      :host {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 368px;
        position: relative;
      }
      .name {
        position: absolute;
        top: 25px;
        left: 0;
        color: rgba(255, 255, 255, 0.4);
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
        overflow: visible;
      }
      .content .right {
        padding: 25px 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 10px;
        max-width: 120px;
        overflow: visible;
      }
      .content .right sf-button-card-select {
        --title-color: rgba(255, 255, 255, 0.4);
        --btn-padding: 5px 5px 5px 10px;
      }
      .content .left {
        flex: 1;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 57px;
      }
      .content .left .select-temperature {
        margin-top: 5px;
        padding-left: 10px;
        position: relative;
      }
      .content .left .select-temperature .display {
        position: absolute;
        display: flex;
        flex-direction: row;
        right: calc(100% - 10px);
        top: 50%;
        transform: translateY(-50%);
        align-items: center;
      }
      .content .left .select-temperature .display .h-path,
      .content .left .temperature .temperature-label .display .h-path {
        border-top: 1px solid var(--sf-primary);
        width: 20px;
      }
      .content .left .select-temperature .display .circle {
        background-color: var(--sf-primary);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: none;
      }
      .content .left .select-temperature sf-wheel {
        --item-font-size: var(--sf-text-sm, 12px);
        --wheel-item-color: var(--sf-primary);
        --text-font-color: rgba(255, 255, 255, 0.6);
        --sf-disabled-icon-color: rgba(255, 255, 255, 0.4);
        --padding: 5px;
        --border: 1px solid var(--sf-primary);
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
        color: var(--sf-primary);
        text-shadow: 0px 0px 5px var(--sf-primary);
        width: 100%;
        height: fit-content;
        padding-bottom: 4px;
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
      /* The display is positioned at bottom-left and includes boule + full-width line */
      .content .left .temperature .temperature-label .display {
        position: absolute;
        display: flex;
        flex-direction: row;
        align-items: center;
        left: -45px;
        bottom: -1px;
        right: 0;
      }
      .content .left .temperature .temperature-label .display .h-path {
        flex: 1;
      }
    `,
  ];

  @property({ type: Object })
  climateEntity: any = {};

  @property({ type: Object })
  cardStyles: any = {
    mode: { colors: {}, icons: {} },
    state: { colors: {}, icons: {} },
  };

  @property({ type: String })
  unit = '°C';

  @property({ type: Array, attribute: 'excluded-modes' })
  excludedModes = [
    HASS_CLIMATE_PRESET_MODE_NONE,
    HASS_CLIMATE_PRESET_MODE_EXTERNAL,
    HASS_CLIMATE_PRESET_MODE_PROG,
    HASS_CLIMATE_PRESET_MODE_AUTO,
  ];

  @property({ type: Array, attribute: 'excluded-hvac' })
  excludeHvac = [STATE_CLIMATE_OFF];

  protected override render(): TemplateResult | typeof nothing {
    if (!this.climateEntity || !this.climateEntity.attributes) return nothing;
    return html`
      <div class="name">${this.climateEntity.attributes.friendly_name || 'Radiator'}</div>
      <div class="img">${this.__displayImage()}</div>
      <div class="content">
        <div class="left">${this.__displayleft()}</div>
        <div class="right">${this.__displayRight()}</div>
      </div>
    `;
  }

  private __displayImage(): TemplateResult {
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

  private __displayleft(): TemplateResult {
    const temp = this.climateEntity.attributes.temperature || 0;
    const minTemp = this.climateEntity.attributes.min_temp || 0;
    return html`
      <div class="select-temperature">
        <div class="display">
          <div class="circle"></div>
          <div class="h-path"></div>
        </div>
        <sf-wheel
          .items=${this.__getTemperatureItems()}
          selected-id="${String(temp - minTemp)}"
          @wheel-change="${this.__select}"
          ?disabled=${[STATE_CLIMATE_AUTO, STATE_CLIMATE_OFF].includes(
            this.climateEntity.state
          )}
          in-line
        ></sf-wheel>
      </div>
      ${this.__getCurrentTemperature()}
    `;
  }

  private __getCurrentTemperature(): TemplateResult | typeof nothing {
    if (!this.climateEntity.attributes.current_temperature) return nothing;
    const currTemp = this.climateEntity.attributes.current_temperature.toFixed(1);
    const parts = currTemp.split('.');
    
    return html` <div class="temperature">
      <div class="temperature-label">
        <div class="display">
          <div class="circle" style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--sf-primary); border: none;"></div>
          <div class="h-path"></div>
        </div>
        <div class="radical">
          ${parts[0]}
        </div>
        <div class="decimal">
          <div>${this.unit}</div>
          <div>
            .${parts[1]}
          </div>
        </div>
      </div>
    </div>`;
  }

  private __getLabel(key: string): string {
    const labels: Record<string, string> = {
      [STATE_CLIMATE_HEAT]: 'heat',
      [STATE_CLIMATE_COOL]: 'cool',
      [STATE_CLIMATE_OFF]: 'off',
      [STATE_CLIMATE_AUTO]: 'auto',
      [HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION]: 'frost protection',
      [HASS_CLIMATE_PRESET_MODE_FROST]: 'frost protection',
      [HASS_CLIMATE_PRESET_MODE_ECO]: 'eco',
      [HASS_CLIMATE_PRESET_MODE_COMFORT]: 'comfort',
      [HASS_CLIMATE_PRESET_MODE_COMFORT_1]: 'comfort-1',
      [HASS_CLIMATE_PRESET_MODE_COMFORT_2]: 'comfort-2',
      [HASS_CLIMATE_PRESET_MODE_BOOST]: 'boost',
      [HASS_CLIMATE_PRESET_MODE_NONE]: 'none',
      [HASS_CLIMATE_PRESET_MODE_EXTERNAL]: 'external',
      [HASS_CLIMATE_PRESET_MODE_PROG]: 'prog'
    };
    return labels[key] || key;
  }

  private __displayRight(): TemplateResult {
    const presetMode = this.climateEntity.attributes.preset_mode;
    const hvacMode = this.climateEntity.state;
    const preset_color = (this.cardStyles?.mode?.colors?.[presetMode] || 'var(--sf-primary)') + ';';
    const hvac_color = (this.cardStyles?.state?.colors?.[hvacMode] || 'var(--sf-primary)') + ';';
    const preset_icon = this.cardStyles?.mode?.icons?.[presetMode] || 'mdi:information-off-outline';
    const hvac_icon = this.cardStyles?.state?.icons?.[hvacMode] || 'mdi:information-off-outline';
    
    return html`
      <sf-button-card-select
        position="top"
        .icon=${preset_icon}
        title="preset"
        text="${this.__getLabel(presetMode)}"
        .items=${this.__getPresetOptions()}
        @button-select="${this.__select}"
        style="--sf-primary-icon-color:${preset_color} --label-color: ${preset_color}"
      ></sf-button-card-select>
      <sf-button-card-select
        position="top"
        .icon=${hvac_icon}
        title="mode"
        text="${this.__getLabel(hvacMode)}"
        .items=${this.__getHvacOptions()}
        @button-select="${this.__select}"
        style="--sf-primary-icon-color:${hvac_color} --label-color: ${hvac_color}"
      ></sf-button-card-select>
    `;
  }

  private __getPresetOptions(): any[] {
    const presetModes = this.climateEntity.attributes.preset_modes || [];
    return presetModes
      .filter((m: string) => {
        if (this.climateEntity.state === STATE_CLIMATE_AUTO) {
          if (
            ![
              HASS_CLIMATE_PRESET_MODE_FROST,
              HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
            ].includes(this.climateEntity.attributes.preset_mode)
          ) {
            return m === HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION;
          }
          return [
            HASS_CLIMATE_PRESET_MODE_ECO,
            HASS_CLIMATE_PRESET_MODE_COMFORT,
          ].includes(m);
        }
        return (
          !this.excludedModes.includes(m) &&
          m !== this.climateEntity.attributes.preset_mode
        );
      })
      .map((mode: string) => {
        let icon = 'mdi:information-off-outline';
        if (this.cardStyles?.mode?.icons?.[mode]) {
          icon = this.cardStyles.mode.icons[mode];
        }
        if (
          mode === HASS_CLIMATE_PRESET_MODE_FROST &&
          this.cardStyles?.mode?.icons?.[HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION]
        ) {
          icon = this.cardStyles.mode.icons[HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION];
        }
        return {
          id: mode,
          action: 'preset',
          color: this.cardStyles?.mode?.colors?.[mode] || 'var(--sf-primary)',
          icon: icon,
          text: this.__getLabel(mode),
        };
      });
  }

  private __getHvacOptions(): any[] {
    const hvacModes = this.climateEntity.attributes.hvac_modes || [];
    return hvacModes
      .filter((m: string) => !this.excludeHvac.includes(m))
      .map((hvac_mode: string) => {
        return {
          id: hvac_mode,
          action: 'mode',
          color: this.cardStyles?.state?.colors?.[hvac_mode] || 'var(--sf-primary)',
          icon: this.cardStyles?.state?.icons?.[hvac_mode] || 'mdi:information-off-outline',
          text: this.__getLabel(hvac_mode),
        };
      });
  }

  private __getTemperatureItems(): any[] {
    const maxTemp = this.climateEntity.attributes.max_temp || 30;
    const minTemp = this.climateEntity.attributes.min_temp || 7;
    const length = maxTemp - minTemp + 1;
    
    return Array.from({ length }).map((_, idx) => {
      const val = idx + minTemp;
      return {
        id: String(idx),
        action: 'temperature',
        text: `${val}${this.unit}`,
        value: val,
      };
    });
  }

  private __select(e: CustomEvent): void {
    e.preventDefault();
    e.stopPropagation();
    let event;

    if (
      e.detail.action === 'mode' &&
      e.detail.id !== this.climateEntity.state
    ) {
      event = new CustomEvent('change-hvac-mode', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          mode: e.detail.id,
        },
      });
    }

    if (
      e.detail.action === 'preset' &&
      e.detail.id !== this.climateEntity.attributes.preset_mode
    ) {
      event = new CustomEvent('change-preset-mode', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          mode: e.detail.id,
        },
      });
    }

    if (e.detail.action === 'temperature') {
      event = new CustomEvent('change-temperature', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.climateEntity.entity_id,
          temperature: e.detail.value,
        },
      });
    }

    if (event) {
      this.dispatchEvent(event);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-radiator': SciFiRadiator;
  }
}
