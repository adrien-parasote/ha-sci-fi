import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {SunEntity, WeatherEntity} from '../../helpers/entities/weather.js';
import {DAYS_OF_WEEK, PACKAGE} from './const.js';
import {SciFiWeatherEditor} from './editor.js';
import style from './style.js';

export class SciFiWeather extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _sun: {type: Object},
      _weather: {type: Object},
      _date: {type: Object},
    };
  }

  constructor() {
    super();
    // Clock
    this._date = new Date();
    // Auto update date
    setInterval(() => {
      this._date = new Date();
    }, 1000);
  }

  __validateConfig(config) {
    if (!config.sun_entity) throw new Error('You need to define a sun entity');
    if (!config.weather_entity)
      throw new Error('You need to define a weather entity');
    if (!config.weather_hourly_forecast_limit)
      config.weather_hourly_forecast_limit = 24;

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
    return 1;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    const sun = new SunEntity(hass, this._config.sun_entity);
    if (!this._sun || !isEqual(sun, this._sun)) this._sun = sun;

    const weather = new WeatherEntity(hass, this._config.weather_entity);
    if (!this._weather || !isEqual(weather, this._weather)) {
      this._weather = weather;
      // Get new forcast in case of global weather change
      this._weather.getForecasts(hass);
    }
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="container">
        <div class="header">${this.__renderHeader()}</div>
        <div class="hours-forcast">${this.__renderHoursForcast()}</div>
        <div class="days-forcast">${this.__renderDaysForcast()}</div>
      </div>
    `;
  }

  __renderHeader() {
    return html`
      <div class="weather-icon">
        ${this._weather.getWeatherIcon(this._sun.isDay())}
      </div>
      <div class="weather-clock">
        <div class="state">
          ${this._weather.weather}, ${this._weather.renderTemperature()}
        </div>
        <div class="hour">${this.__getHour()}</div>
        <div class="date">${this.__getDate()}</div>
      </div>
    `;
  }

  __getHour() {
    const options = {
      minimumIntegerDigits: 2,
      useGrouping: false,
    };
    return [
      this._date.getHours().toLocaleString('fr-FR', options),
      this._date.getMinutes().toLocaleString('fr-FR', options),
    ].join(':');
  }

  __getDate() {
    const options = {
      minimumIntegerDigits: 2,
      useGrouping: false,
    };
    return [
      [DAYS_OF_WEEK[this._date.getDay()], ','].join(''),
      [
        this._date.getDate().toLocaleString('fr-FR', options),
        (this._date.getMonth() + 1).toLocaleString('fr-FR', options),
        this._date.getFullYear().toLocaleString('fr-FR', options),
      ].join('.'),
    ].join(' ');
  }

  __renderHoursForcast() {
    return html` <div class="content">
      ${this._weather.hourly_forecast
        .slice(0, this._config.weather_hourly_forecast_limit)
        .map((hourly_forecast) => {
          let display = [];
          if (this.__pushSun(hourly_forecast.datetime, this._sun.next_rising))
            display.push(this._sun.renderSunrise());
          if (this.__pushSun(hourly_forecast.datetime, this._sun.next_setting))
            display.push(this._sun.renderSunset());
          display.push(hourly_forecast.render(this._sun.isDay()));
          return html`${display}`;
        })}
    </div>`;
  }

  __pushSun(hour, sun) {
    let nextHour = new Date(hour);
    nextHour.setTime(nextHour.getTime() + 60 * 60 * 1000);
    return sun >= hour && sun < nextHour;
  }

  __renderDaysForcast() {
    return html`Days forcast`;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      sun_entity: 'sun.sun',
      weather_entity: null,
      weather_hourly_forecast_limit: 24,
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiWeather);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiWeatherEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi weather card',
  description: 'Render sci-fi weather card.',
});
