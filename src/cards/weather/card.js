import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {WEEK_DAYS} from '../../helpers/entities/const.js';
import {SunEntity, WeatherEntity} from '../../helpers/entities/weather.js';
import {getWeatherIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
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
      _activeDay: {type: Number},
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
      config.weather_hourly_forecast_limit = 24; // max 72
    if (config.weather_hourly_forecast_limit > 72)
      throw new Error('Hourly forecast is limite to 72h max');
    if (!config.weather_daily_forecast_limit)
      config.weather_daily_forecast_limit = 15; // max 15
    if (config.weather_daily_forecast_limit > 15)
      throw new Error('Daily forecast is limite to 15 days max');

    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    this._activeDay = 0;
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
    /*
     TODO gestion des alertes (vert jaune orange rouge) 
     TODO rajouter couleur alert dans hexa tiles

  Vent violent: Jaune => windsock
  Inondation: Vert => tide-high (fill)
  Orages: Vert => thunderstorms-rain
  Pluie-inondation: Vert => raindrops
  Neige-verglas: Vert => snowflake
  Grand-froid: Vert => thermometer-colder
  Vagues-submersion: Vert => tide-high (fill)
*/
    return html`
      <div class="container">
        <div class="header">${this.__renderHeader()}</div>
        <div class="days-forecast">${this.__renderDays()}</div>
      </div>
    `;
  }

  __renderHeader() {
    return html`
      <div class="weather-icon">
        ${this._weather.getWeatherIcon(this._sun.isDay())}
      </div>
      <div class="weather-today">
        <div class="weather-clock">
          <div class="state">
            ${this._weather.weatherName}, ${this._weather.temperatureUnit}
          </div>
          <div class="hour">${this.__getHour()}</div>
          <div class="date">${this.__getDate()}</div>
        </div>
        <div class="h-separator">
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="circle"></div>
        </div>
        <div class="card-corner today-summary">
          ${this.__renderTodaySummary()}
        </div>
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
      [WEEK_DAYS[this._date.getDay()].short, ','].join(''),
      [
        this._date.getDate().toLocaleString('fr-FR', options),
        (this._date.getMonth() + 1).toLocaleString('fr-FR', options),
        this._date.getFullYear().toLocaleString('fr-FR', options),
      ].join('.'),
    ].join(' ');
  }

  __renderDays() {
    return html` <div class="content">
      ${this._weather.daily_forecast
        .slice(0, this._config.weather_daily_forecast_limit)
        .map((daily_forecast) => {
          return html`${daily_forecast.render(true)}`;
        })}
    </div>`;
  }

  __renderTodaySummary() {
    const sensors = [
      this._weather.daily_precipitation,
      this._weather.rain_chance,
      this._weather.freeze_chance,
      this._weather.snow_chance,
    ].map((sensor) => {
      return this.__renderTodaySensor(sensor.name, sensor.icon, sensor.value);
    });
    return html`${sensors}`;
  }

  __renderTodaySensor(name, icon, value) {
    return html`<div class="sensor">
      <div class="state">${getWeatherIcon(icon)}</div>
      <div class="label">${value}</div>
    </div>`;
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
      weather_daily_forecast_limit: 10,
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
