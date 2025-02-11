import {LitElement, html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import common_style from '../../helpers/common_style.js';
import '../../helpers/components/button.js';
import '../../helpers/components/circle_progress_bar.js';
import '../../helpers/components/stack_bar.js';
import '../../helpers/components/stove.js';
import '../../helpers/components/toast.js';
import '../../helpers/components/wheel.js';
import {StoveEntity} from '../../helpers/entities/climate.js';
import {STATE_CLIMATE_OFF} from '../../helpers/entities/climate_const.js';
import {STOVE_SENSORS} from '../../helpers/entities/sensor_const.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {
  HVAC_MODES_ICONS,
  PACKAGE,
  PRESET_MODES_ICONS,
  STATUS_ICONS_COLORS,
} from './const.js';
import {SciFiStoveEditor} from './editor.js';
import style from './style.js';

export class SciFiStove extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _stove: {type: Object},
      _area: {type: Object},
    };
  }

  __validateConfig(config) {
    if (!config.entity)
      throw new Error(
        'You need to define your stove entity (ex: climate.<my_stove>)'
      );
    if (!config.entity.startsWith('climate.'))
      throw new Error(config.entity + 'is not a climate entity.');

    if (!config.pellet_quantity_threshold)
      config.pellet_quantity_threshold = 0.5;
    if (!config.storage_counter_threshold)
      config.storage_counter_threshold = 0.1;

    if (!config.sensors) config.sensors = {};
    STOVE_SENSORS.forEach((sensor) => {
      if (!config.sensors[sensor]) {
        config.sensors[sensor] = null;
      }
    });
    if (!config.storage_counter) config.storage_counter = null;
    if (!config.unit) config.unit = '°C';
    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  getCardSize() {
    return 4;
  }

  getLayoutOptions() {
    return {
      grid_rows: 4,
      grid_columns: 4,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
    // Get stove entity
    const stove_entity = new StoveEntity(
      hass.states[this._config.entity],
      hass.devices[hass.entities[this._config.entity].device_id]
    );
    // Add external sensors if defined
    stove_entity.addSensors(this._config.sensors, hass);
    if (this._config.storage_counter)
      stove_entity.addStockCounter(this._config.storage_counter, hass);

    if (
      !this._stove ||
      !isEqual(stove_entity.renderAsEntity(), this._stove.renderAsEntity())
    )
      this._stove = stove_entity;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">
        ${this.__displayHeader()} ${this.__displayStove()}
        ${this.__displayBottom()}
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader() {
    return html` <div class="header">${this._stove.friendly_name}</div> `;
  }

  __displayBottom() {
    // Build item
    const items = Array.from(
      Array(this._stove.max_temp - this._stove.min_temp + 1).keys()
    ).map((e, idx) => {
      return {
        id: idx,
        text: [idx + this._stove.min_temp, this._config.unit].join(''),
        value: idx + this._stove.min_temp,
      };
    });
    // Get current temp & associate with item id
    const selected_item_id = this._stove.temperature - this._stove.min_temp;
    return html`
      <div class="bottom">
        ${this.__displayHvacButton()}
        <sci-fi-wheel
          .items=${items}
          selected-id="${selected_item_id}"
          text="Temperature"
          @wheel-change="${this.__select}"
          ?disable=${[STATE_CLIMATE_OFF].includes(this._stove.state)}
        ></sci-fi-wheel>
        ${this.__displayPresetButton()}
      </div>
    `;
  }

  __displayPresetButton() {
    const preset_items = this._stove.preset_modes.map((mode) => {
      return {
        action: 'preset',
        value: mode,
        icon: PRESET_MODES_ICONS[mode]
          ? PRESET_MODES_ICONS[mode]
          : 'mdi:information-off-outline',
        text: mode,
      };
    });
    return html`
      <sci-fi-button-select-card
        icon=${PRESET_MODES_ICONS[this._stove.preset_mode]
          ? PRESET_MODES_ICONS[this._stove.preset_mode]
          : 'mdi:information-off-outline'}
        title="preset"
        text=${this._stove.preset_mode}
        items=${JSON.stringify(preset_items)}
        @button-select="${this.__select}"
      ></sci-fi-button-select-card>
    `;
  }

  __displayHvacButton() {
    const hvac_items = this._stove.hvac_modes.map((mode) => {
      return {
        action: 'hvac',
        value: mode,
        icon: HVAC_MODES_ICONS[mode]
          ? HVAC_MODES_ICONS[mode]
          : 'mdi:information-off-outline',
        text: mode,
      };
    });
    return html`
      <sci-fi-button-select-card
        icon=${HVAC_MODES_ICONS[this._stove.state]
          ? HVAC_MODES_ICONS[this._stove.state]
          : 'mdi:information-off-outline'}
        title="mode"
        text=${this._stove.state}
        items=${JSON.stringify(hvac_items)}
        @button-select="${this.__select}"
      ></sci-fi-button-select-card>
    `;
  }

  __displayStove() {
    return html` <div class="content">
      <sci-fi-stove-image state=${this._stove.state}></sci-fi-stove-image>
      <div class="info">
        <div class="e bottom-path">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
            <div class="d-path"></div>
          </div>
          <div class="quantities">
            ${this.__displayPelletQuantity()} ${this.__displayPelletStock()}
          </div>
        </div>
        <div class="m">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
          </div>
          <div class="temperatures">
            ${this.__displayTimeToService()}
            ${this.__displayStatus('Status', this._stove.status)}
            ${this.__displayTemperature(
              'External',
              this._stove.current_temperature,
              this._config.unit
            )}
            ${this.__displayTemperature(
              'Internal',
              this._stove.combustion_chamber_temperature.value,
              this._config.unit
            )}
            ${this.__displayPressure('Pressure', this._stove.pressure.value)}
          </div>
        </div>
        <div class="e top-path">
          <div class="display">
            <div class="circle"></div>
            <div class="h-path"></div>
            <div class="d-path"></div>
          </div>
          <div class="powers">
            ${this.__displayPower(
              'Render',
              this._stove.actual_power.value,
              this._stove.actual_power.unit_of_measurement
            )}
            ${this.__displayPower(
              'Consume',
              this._stove.power.value,
              this._stove.power.unit_of_measurement
            )}
            ${this.__displayFan(
              'Fan speed',
              this._stove.fan_speed.value,
              this._stove.fan_speed.unit_of_measurement
            )}
          </div>
        </div>
      </div>
    </div>`;
  }

  __displayTimeToService() {
    if (!this._stove.time_to_service) return nothing;

    const hours = this._stove.time_to_service.state;
    let state = null;
    if (hours <= 240) state = 'high';
    if (hours <= 480) state = 'medium';
    return html`
      <div class="temperature ${state}">
        ${getIcon('mdi:timeline-clock-outline')}
        <div class="label">Time to Service:</div>
        <div>${hours}${this._stove.time_to_service.unit_of_measurement}</div>
      </div>
    `;
  }

  __noQuantity(text) {
    return html`
      <div class="nothing">
        <div>N/A</div>
        <div>${text}</div>
      </div>
    `;
  }

  __displayPelletQuantity() {
    const sensor_pellet_quantity = this._stove.pellet_quantity;
    if (!sensor_pellet_quantity.value)
      return this.__noQuantity('Fuel quantity');
    return html`
      <sci-fi-circle-progress-bar
        text="Fuel quantity"
        val=${sensor_pellet_quantity.value}
        threshold=${this._config.pellet_quantity_threshold}
      ></sci-fi-circle-progress-bar>
    `;
  }

  __displayPelletStock() {
    const storage = this._stove.storage;
    if (!storage) return this.__noQuantity('Stock');
    return html`
      <sci-fi-stack-bar
        text="Stock"
        val=${storage.value}
        minimum=${storage.minimum}
        maximum=${storage.maximum}
        threshold=${this._config.storage_counter_threshold}
      ></sci-fi-stack-bar>
    `;
  }

  __displayStatus(text, status) {
    if (!status) return this.__displayStatus(text, 'N/A');
    return html`
      <div
        class="status ${STATUS_ICONS_COLORS[status]
          ? STATUS_ICONS_COLORS[status].color
          : 'off'}"
      >
        ${getIcon(
          STATUS_ICONS_COLORS[status]
            ? STATUS_ICONS_COLORS[status].icon
            : 'sci:stove-unknow'
        )}
        <div class="label">${text}:</div>
        <div>${status.replace('_', ' ')}</div>
      </div>
    `;
  }

  __noTemperature(text) {
    return html`<div class="temperature off">
      <div class="no-temp">
        ${getIcon('mdi:thermometer')} ${getIcon('mdi:help')}
      </div>
      <div class="label">${text}:</div>
      <div>N/A</div>
    </div>`;
  }

  __displayPressure(text, pressure) {
    if (!pressure) return nothing;
    return html`
      <div class="temperature ${pressure == '0' ? 'off' : ''}">
        ${getIcon('mdi:gauge')}
        <div class="label">${text}:</div>
        <div>${pressure}</div>
      </div>
    `;
  }

  __displayTemperature(text, temperature, unit) {
    if (!temperature) return this.__noTemperature(text);
    let icon = 'mdi:thermometer-off';
    let state = 'off';
    if (temperature) {
      if (temperature >= 25) {
        icon = 'mdi:thermometer-high';
        state = 'high';
      } else if (temperature >= 16) {
        icon = 'mdi:thermometer';
        state = 'medium';
      } else {
        icon = 'mdi:thermometer-low';
        state = 'low';
      }
    }
    return html`
      <div class="temperature ${state}">
        ${getIcon(icon)}
        <div class="label">${text}:</div>
        <div>${temperature}${unit}</div>
      </div>
    `;
  }

  __displayPower(text, power, unit) {
    if (power == null) return this.__displayPower(text, 'N/A', '');
    return html`
      <div class="power">
        ${getIcon('mdi:lightning-bolt')}
        <div class="label">${text}</div>
        <div class="${power == 'N/A' ? 'nothing' : ''}">${power} ${unit}</div>
      </div>
    `;
  }

  __displayFan(text, fan, unit) {
    if (fan == null) return nothing;
    return html`
      <div class="power">
        ${getIcon('mdi:speedometer')}
        <div class="label">${text}</div>
        <div>${fan} ${unit}</div>
      </div>
    `;
  }

  __select(e) {
    if (
      e.detail.action == 'preset' &&
      e.detail.value != this._stove.preset_mode
    )
      this._stove.setPresetMode(this._hass, e.detail.value).then(
        () => this.__toast(false),
        (e) => this.__toast(true, e)
      );
    if (e.detail.action == 'hvac' && e.detail.value != this._stove.preset_mode)
      this._stove.setHvacMode(this._hass, e.detail.value).then(
        () => this.__toast(false),
        (e) => this.__toast(true, e)
      );

    if (e.type == 'wheel-change')
      this._stove.setTemperature(this._hass, e.detail.value).then(
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
    return {
      entity: null,
      unit: '°C',
      sensors: {},
      storage_counter: null,
      storage_counter_threshold: 0.1,
      pellet_quantity_threshold: 0.1,
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiStove);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiStoveEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi Stove card',
  description: 'Render sci-fi Stove card.',
});
