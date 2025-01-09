import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';

export class SciFiWeatherEditor extends SciFiBaseEditor {
  _sun_entity;
  _weather_entities;

  set hass(hass) {
    this._hass = hass;
    // Setup entities for display
    if (!this._sun_entity_id) this._sun_entity = [hass.states['sun.sun']];
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
        </div>
      </div>
    `;
  }

  __renderSectionEntities() {
    /*
    sensor_weather_alert: null,
    */
    return html`
      <section>
        <h1><span>${getIcon('mdi:theme-light-dark')}</span>Weather entities</h1>
        <sci-fi-dropdown-entity-input
          label="Sun entity (required)"
          icon="mdi:white-balance-sunny"
          element-id="sun_entity"
          kind="sun_entity"
          value="${this._config.sun_entity}"
          items="${JSON.stringify(this._sun_entity)}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
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

  __update(e) {
    let newConfig = this.__getNewConfig();
    newConfig[e.detail.id] = e.detail.value;
    this.__dispatchChange(e, newConfig);
  }
}
