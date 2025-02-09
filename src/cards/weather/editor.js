import {html, nothing} from 'lit';

import '../../components/accordion.js';
import '../../components/button.js';
import '../../components/input.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';

export class SciFiWeatherEditor extends SciFiBaseEditor {
  _weather_entities;

  _chart_data_kind = {
    Temperature: 'temperature',
    Precipitation: 'precipitation',
    'Wind Speed': 'wind_speed',
  };

  set hass(hass) {
    this._hass = hass;
    // Setup entities for display
    if (!this._weather_entities_id)
      this._weather_entities = Object.keys(hass.states)
        .filter((x) => x.split('.')[0] == 'weather')
        .map((key) => hass.states[key]);
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderSectionEntities()} ${this.__renderSectionDisplay()}
          ${this.__renderSectionChart()} ${this.__renderSectionAlert()}
        </div>
      </div>
    `;
  }

  __renderSectionEntities() {
    return html`
      <section>
        <h1>
          <span>${getIcon('mdi:theme-light-dark')}</span>Weather entity
          (required)
        </h1>
        <sci-fi-dropdown-entity-input
          label="City weather entity (required)"
          icon="mdi:city"
          element-id="weather_entity"
          kind="weather_entity"
          value="${this._config.weather_entity}"
          items="${JSON.stringify(this._weather_entities)}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>
    `;
  }

  __renderSectionDisplay() {
    return html` <section>
      <h1><span>${getIcon('mdi:cog-outline')}</span>Technical (optionnal)</h1>
      <sci-fi-slider
        label="Daily forecast number (optionnal)"
        icon="mdi:counter"
        element-id="weather_daily_forecast_limit"
        kind="weather_daily_forecast_limit"
        value="${this._config.weather_daily_forecast_limit}"
        min="1"
        max="15"
        @input-update=${this.__update}
      ></sci-fi-slider>
    </section>`;
  }

  __renderSectionChart() {
    return html` <section>
      <h1><span>${getIcon('mdi:chart-bell-curve')}</span>Chart (optionnal)</h1>
      <sci-fi-dropdown-input
        label="Chart first focused data (required)"
        value=${this._config.chart_first_kind_to_render}
        element-id="chart_first_kind_to_render"
        kind="chart"
        items="${JSON.stringify(Object.keys(this._chart_data_kind))}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-input>
    </section>`;
  }

  __renderSectionAlert() {
    const entity_id =
      this._config.alert && this._config.alert.entity_id
        ? this._config.alert.entity_id
        : '';
    const state_green =
      this._config.alert && this._config.alert.state_green
        ? this._config.alert.state_green
        : '';
    const state_yellow =
      this._config.alert && this._config.alert.state_yellow
        ? this._config.alert.state_yellow
        : '';
    const state_orange =
      this._config.alert && this._config.alert.state_orange
        ? this._config.alert.state_orange
        : '';
    const state_red =
      this._config.alert && this._config.alert.state_red
        ? this._config.alert.state_red
        : '';
    return html` <section>
      <h1><span>${getIcon('mdi:alert')}</span>Alert (optionnal)</h1>
      <sci-fi-input
        label="Entity id"
        value=${entity_id}
        element-id="entity_id"
        kind="alert"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        label="Green state"
        value=${state_green}
        element-id="state_green"
        kind="alert"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        label="Yellow state"
        value=${state_yellow}
        element-id="state_yellow"
        kind="alert"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        label="Orange state"
        value=${state_orange}
        element-id="state_orange"
        kind="alert"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-input
        label="Red state"
        value=${state_red}
        element-id="state_red"
        kind="alert"
        @input-update=${this.__update}
      ></sci-fi-input>
    </section>`;
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    switch (e.detail.kind) {
      case 'alert':
        if (!newConfig.alert) newConfig.alert = {};
        newConfig.alert[e.detail.id] = e.detail.value;
        break;
      case 'chart':
        if (!newConfig.chart_first_kind_to_render)
          newConfig.chart_first_kind_to_render = null;
        newConfig.chart_first_kind_to_render =
          this._chart_data_kind[e.detail.value];
        break;
      default:
        newConfig[e.detail.id] = e.detail.value;
        break;
    }
    this.__dispatchChange(e, newConfig);
  }
}
