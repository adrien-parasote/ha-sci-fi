import {html} from 'lit';

import {getWeatherIcon} from '../icons/icons.js';
import {WEATHER_STATE_FR} from './const.js';

export class SunEntity {
  constructor(hass, sun_entity_id) {
    this.entity_id = sun_entity_id;
    this.state = hass.states[sun_entity_id].state;
    this.next_dawn = hass.states[sun_entity_id].attributes.next_dawn;
    this.next_dusk = hass.states[sun_entity_id].attributes.next_dusk;
    this.next_midnight = hass.states[sun_entity_id].attributes.next_midnight;
    this.next_noon = hass.states[sun_entity_id].attributes.next_noon;
    this.next_rising = hass.states[sun_entity_id].attributes.next_rising;
    this.next_setting = hass.states[sun_entity_id].attributes.next_setting;
    this.elevation = hass.states[sun_entity_id].attributes.elevation;
    this.azimuth = hass.states[sun_entity_id].attributes.azimuth;
    this.rising = hass.states[sun_entity_id].attributes.rising;
  }

  isDay() {
    return this.state == 'above_horizon';
  }
}

export class WeatherEntity {
  constructor(hass, weather_entity_id) {
    this.entity_id = weather_entity_id;
    this.state = hass.states[weather_entity_id].state;
    this.temperature = hass.states[weather_entity_id].attributes.temperature;
    this.temperature_unit =
      hass.states[weather_entity_id].attributes.temperature_unit;
    this.humidity = hass.states[weather_entity_id].attributes.humidity;
    this.pressure = hass.states[weather_entity_id].attributes.pressure;
    this.pressure_unit =
      hass.states[weather_entity_id].attributes.pressure_unit;
    this.wind_bearing = hass.states[weather_entity_id].attributes.wind_bearing;
    this.wind_speed = hass.states[weather_entity_id].attributes.wind_speed;
    this.wind_speed_unit =
      hass.states[weather_entity_id].attributes.wind_speed_unit;
    this.visibility_unit =
      hass.states[weather_entity_id].attributes.visibility_unit;
    this.precipitation_unit =
      hass.states[weather_entity_id].attributes.precipitation_unit;
    this.friendly_name =
      hass.states[weather_entity_id].attributes.friendly_name;
    // Setup later
    this.hourly_forecast = [];
    this.daily_forecast = [];
  }

  getWeatherIcon(day = true) {
    return getWeatherIcon(this.state, day);
  }

  getForecasts(hass) {
    this.daily_forecast = hass
      .callService('weather', 'get_forecasts', {
        target: {entity_id: this.entity_id},
        data: {type: 'daily'},
      })
      [this.entity_id].forecast.map((value) => new DailyForecast(value));
    this.hourly_forecast = hass
      .callService('weather', 'get_forecasts', {
        target: {entity_id: this.entity_id},
        data: {type: 'hourly'},
      })
      [this.entity_id].forecast.map((value) => new HourlyForecast(value));
  }

  renderTemperature() {
    return [this.temperature, this.temperature_unit].join('');
  }

  get weather() {
    return WEATHER_STATE_FR[this.state];
  }
}

class DailyForecast {
  constructor(data) {
    this.condition = data.condition;
    this.datetime = data.datetime;
    this.temperature = data.temperature;
    this.templow = data.templow;
    this.precipitation = data.precipitation;
    this.humidity = data.humidity;
  }
}

class HourlyForecast {
  constructor(data) {
    this.condition = data.condition;
    this.datetime = data.datetime;
    this.humidity = data.humidity;
    this.precipitation = data.precipitation;
    this.temperature = data.temperature;
    this.wind_bearing = data.wind_bearing;
    this.wind_speed = data.wind_speed;
  }

  getWeatherIcon(day = true) {
    return getWeatherIcon(this.condition, day);
  }

  render(day = true) {
    return html`
      <div class="hourly-weather">
        <div class="hour">${this.hour} h</div>
        <div class="state">${this.getWeatherIcon(day)}</div>
        <div class="temp">${this.temperature}</div>
      </div>
    `;
  }

  get hour() {
    return new Date(this.datetime).getHours();
  }
}
