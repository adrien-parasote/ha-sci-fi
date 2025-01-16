import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';

export class SciFiWeatherEditor extends SciFiBaseEditor {
  _weather_entities;

  set hass(hass) {
    this._hass = hass;
    // Setup entities for display
    if (!this._weather_entities_id)
      this._weather_entities = Object.keys(hass.states)
        .filter((x) => x.split('.')[0] == 'weather')
        .map((key) => {
          return hass.states[key];
        });
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderSectionEntities()} ${this.__renderSectionDisplay()}
          ${this.__renderSectionAlert()}
        </div>
      </div>
    `;
  }

  __renderSectionEntities() {
    return html`
      <section>
        <h1><span>${getIcon('mdi:theme-light-dark')}</span>Weather entity</h1>
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
      <h1><span>${getIcon('mdi:cog-outline')}</span>Technical</h1>
      <sci-fi-slider
        label="Daily forecast number(required)"
        icon="mdi:counter"
        element-id="weather_daily_forecast_limit"
        kind="weather_daily_forecast_limit"
        value="${this._config.weather_daily_forecast_limit}"
        min="1"
        max="15"
        @input-update=${this.__update}
      ></sci-fi-slider>
      <sci-fi-slider
        label="Hourly forecast number(required)"
        icon="mdi:counter"
        element-id="weather_hourly_forecast_limit"
        kind="weather_hourly_forecast_limit"
        value="${this._config.weather_hourly_forecast_limit}"
        min="1"
        max="72"
        @input-update=${this.__update}
      ></sci-fi-slider>
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
    if (e.detail.kind == 'alert') {
      if (!newConfig.alert) newConfig.alert = {};
      newConfig.alert[e.detail.id] = e.detail.value;
    } else {
      newConfig[e.detail.id] = e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }
}
