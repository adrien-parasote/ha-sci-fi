import {msg} from '@lit/localize';
import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {StoveEntity} from '../../helpers/entities/climate/climate.js';
import {
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
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_COOL,
  STATE_CLIMATE_HEAT,
  STATE_CLIMATE_OFF,
} from '../../helpers/entities/climate/climate_const.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {
  HVAC_MODES_ICONS,
  PACKAGE,
  PRESET_MODES_ICONS,
  STATUS_ICONS_COLORS,
} from './const.js';
import style from './style.js';

export class SciFiStove extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;

  _configMetadata = configMetadata;
  _temp_unit;
  _pressure_unit;

  static get properties() {
    return {
      _config: {type: Object},
      _stove: {type: Object},
      _area: {type: Object},
    };
  }

  set hass(hass) {
    super.hass = hass;
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

    if (!this._temp_unit) this._temp_unit = hass.config.unit_system.temperature; // Gather HA temperature unit only once
    if (!this._pressure_unit)
      this._pressure_unit = hass.config.unit_system.pressure; // Gather HA pressure unit only once
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
        text: [idx + this._stove.min_temp, this._temp_unit].join(''),
        value: idx + this._stove.min_temp,
      };
    });
    // Get current temp & associate with item id
    const selected_item_id =
      Math.round(this._stove.current_temperature) - this._stove.min_temp;
    return html`
      <div class="bottom">
        ${this.__displayHvacButton()}
        <sci-fi-wheel
          .items=${items}
          selected-id="${selected_item_id}"
          text="${msg('Temperature')}"
          @wheel-change="${this.__select}"
          ?disable=${[STATE_CLIMATE_OFF].includes(this._stove.state)}
        ></sci-fi-wheel>
        ${this.__displayPresetButton()}
      </div>
    `;
  }

  __getClimateLabel(key) {
    const labels = {};
    labels[STATE_CLIMATE_HEAT] = msg('heat');
    labels[STATE_CLIMATE_COOL] = msg('cool');
    labels[STATE_CLIMATE_OFF] = msg('off');
    labels[STATE_CLIMATE_AUTO] = msg('auto');
    labels[HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION] = msg('frost protection');
    labels[HASS_CLIMATE_PRESET_MODE_ECO] = msg('eco');
    labels[HASS_CLIMATE_PRESET_MODE_COMFORT] = msg('comfort');
    labels[HASS_CLIMATE_PRESET_MODE_COMFORT_1] = msg('comfort-1');
    labels[HASS_CLIMATE_PRESET_MODE_COMFORT_2] = msg('comfort-2');
    labels[HASS_CLIMATE_PRESET_MODE_BOOST] = msg('boost');
    labels[HASS_CLIMATE_PRESET_MODE_NONE] = msg('none');
    labels[HASS_CLIMATE_PRESET_MODE_EXTERNAL] = msg('external');
    labels[HASS_CLIMATE_PRESET_MODE_PROG] = msg('prog');
    labels[HASS_CLIMATE_PRESET_MODE_AUTO] = msg('auto');
    return key in labels ? labels[key] : key;
  }

  __displayPresetButton() {
    const preset_items = this._stove.preset_modes.map((mode) => {
      return {
        action: 'preset',
        value: mode,
        icon: PRESET_MODES_ICONS[mode]
          ? PRESET_MODES_ICONS[mode]
          : 'mdi:information-off-outline',
        text: this.__getClimateLabel(mode),
      };
    });
    return html`
      <sci-fi-button-select-card
        icon=${PRESET_MODES_ICONS[this._stove.preset_mode]
          ? PRESET_MODES_ICONS[this._stove.preset_mode]
          : 'mdi:information-off-outline'}
        title="${msg('preset')}"
        text=${this.__getClimateLabel(this._stove.preset_mode)}
        .items=${preset_items}
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
        text: this.__getClimateLabel(mode),
      };
    });
    return html`
      <sci-fi-button-select-card
        icon=${HVAC_MODES_ICONS[this._stove.state]
          ? HVAC_MODES_ICONS[this._stove.state]
          : 'mdi:information-off-outline'}
        title="${msg('mode')}"
        text=${this.__getClimateLabel(this._stove.state)}
        .items=${hvac_items}
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
            ${this.__displayStatus(msg('Status'), msg(this._stove.status))}
            ${this.__displayTemperature(
              msg('External'),
              this._stove.current_temperature,
              this._temp_unit
            )}
            ${this.__displayTemperature(
              msg('Internal'),
              this._stove.combustion_chamber_temperature.value,
              this._temp_unit
            )}
            ${this.__displayPressure(
              msg('Pressure'),
              this._stove.pressure.value,
              this._pressure_unit
            )}
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
              msg('Render'),
              this._stove.actual_power.value,
              this._stove.actual_power.unit_of_measurement
            )}
            ${this.__displayPower(
              msg('Consume'),
              this._stove.power.value,
              this._stove.power.unit_of_measurement
            )}
            ${this.__displayFan(
              msg('Fan speed'),
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
        <sci-fi-icon icon="mdi:timeline-clock-outline"></sci-fi-icon>
        <div class="label">${msg('Time to Service')}:</div>
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
      return this.__noQuantity(msg('Fuel quantity'));
    return html`
      <sci-fi-circle-progress-bar
        text="${msg('Fuel quantity')}"
        val=${sensor_pellet_quantity.value}
        threshold=${this._config.pellet_quantity_threshold}
      ></sci-fi-circle-progress-bar>
    `;
  }

  __displayPelletStock() {
    const storage = this._stove.storage;
    if (!storage) return this.__noQuantity(msg('Stock'));
    return html`
      <sci-fi-stack-bar
        text="${msg('Stock')}"
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
        <sci-fi-icon
          icon=${STATUS_ICONS_COLORS[status]
            ? STATUS_ICONS_COLORS[status].icon
            : 'sci:stove-unknow'}
        ></sci-fi-icon>

        <div class="label">${text}:</div>
        <div>${status.replace('_', ' ')}</div>
      </div>
    `;
  }

  __noTemperature(text) {
    return html`<div class="temperature off">
      <div class="no-temp">
        <sci-fi-icon icon="mdi:thermometer"></sci-fi-icon>
        <sci-fi-icon icon="mdi:help"></sci-fi-icon>
      </div>
      <div class="label">${text}:</div>
      <div>N/A</div>
    </div>`;
  }

  __displayPressure(text, pressure, unit) {
    if (!pressure) return nothing;
    return html`
      <div class="temperature ${pressure == '0' ? 'off' : ''}">
        <sci-fi-icon icon="mdi:gauge"></sci-fi-icon>
        <div class="label">${text}:</div>
        <div>${pressure}${unit}</div>
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
        <sci-fi-icon icon=${icon}></sci-fi-icon>
        <div class="label">${text}:</div>
        <div>${temperature}${unit}</div>
      </div>
    `;
  }

  __displayPower(text, power, unit) {
    if (power == null) return this.__displayPower(text, 'N/A', '');
    return html`
      <div class="power">
        <sci-fi-icon icon="mdi:lightning-bolt"></sci-fi-icon>
        <div class="label">${text}</div>
        <div class="${power == 'N/A' ? 'nothing' : ''}">${power} ${unit}</div>
      </div>
    `;
  }

  __displayFan(text, fan, unit) {
    if (fan == null) return nothing;
    return html`
      <div class="power">
        <sci-fi-icon icon="mdi:speedometer"></sci-fi-icon>
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
    return buildStubConfig(configMetadata);
  }
}
