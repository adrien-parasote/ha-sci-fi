import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import common_style from '../../helpers/common_style.js';
import {SunEntity, WeatherEntity} from '../../helpers/entities/weather.js';
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
    };
  }
  __validateConfig(config) {
    if (!config.sun_entity) throw new Error('You need to define a sun entity');
    if (!config.weather_entity)
      throw new Error('You need to define a weather entity');
    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }

    /*
    promise.then(
      result => alert(result), // shows "done!" after 1 second
      error => alert(error) // doesn't run
    );*/
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
        <div class="hours_forcast">${this.__renderHoursForcast()}</div>
        <div class="days_forcast">${this.__renderDaysForcast()}</div>
      </div>
    `;
  }

  __renderHeader() {
    return html`header`;
  }

  __renderHoursForcast() {
    return html`Hours forcast`;
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
