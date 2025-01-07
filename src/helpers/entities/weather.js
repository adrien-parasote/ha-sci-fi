import {html} from 'lit';

import {getWeatherIcon} from '../icons/icons.js';
import {EXTRA_SENSORS, WEATHER_STATE_FR, WEEK_DAYS} from './const.js';

export class SunEntity {
  constructor(hass, sun_entity_id) {
    this.entity_id = sun_entity_id;
    this.state = hass.states[sun_entity_id].state;
    this.next_dawn = hass.states[sun_entity_id].attributes.next_dawn;
    this.next_dusk = hass.states[sun_entity_id].attributes.next_dusk;
    this.next_midnight = hass.states[sun_entity_id].attributes.next_midnight;
    this.next_noon = hass.states[sun_entity_id].attributes.next_noon;
    this.next_rising = new Date(
      hass.states[sun_entity_id].attributes.next_rising
    ); // prochain levé
    this.next_setting = new Date(
      hass.states[sun_entity_id].attributes.next_setting
    ); // prochain couché
    this.elevation = hass.states[sun_entity_id].attributes.elevation;
    this.azimuth = hass.states[sun_entity_id].attributes.azimuth;
    this.rising = hass.states[sun_entity_id].attributes.rising;
  }

  isDay() {
    return this.state == 'above_horizon';
  }

  renderSunrise() {
    return html`
      <div class="sun">
        <div class="label">
          ${this.next_rising.getHours()}:${this.next_rising.getMinutes()}
        </div>
        <div class="state">${getWeatherIcon('sunrise')}</div>
        <div class="label">Lever</div>
      </div>
    `;
  }
  renderSunset() {
    return html`
      <div class="sun">
        <div class="label">
          ${this.next_setting.getHours()}:${this.next_setting.getMinutes()}
        </div>
        <div class="state">${getWeatherIcon('sunset')}</div>
        <div class="label">Coucher</div>
      </div>
    `;
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
    // Extract additionnal sensors
    this.sensors = this.__buildExtraSensors(hass);
    // Setup later
    this.hourly_forecast = [];
    this.daily_forecast = [];
  }

  __buildExtraSensors(hass) {
    const city = ['sensor', this.entity_id.split('.')[1]].join('.');
    let sensors = {};
    Object.keys(EXTRA_SENSORS).map((sensorkey) => {
      const entity = hass.states[[city, sensorkey].join('_')];
      sensors[sensorkey] = new ExtraSensor(
        sensorkey,
        entity.state,
        entity.attributes.unit_of_measurement
      );
    });
    return sensors;
  }

  getWeatherIcon(day = true) {
    return getWeatherIcon([this.state, day ? 'day' : 'night'].join('-'));
  }

  getForecasts(hass) {
    this.daily_forecast = hass
      .callService('weather', 'get_forecasts', {
        target: {entity_id: this.entity_id},
        data: {type: 'daily'},
      })
      [this.entity_id].forecast.map(
        (value) => new DailyForecast(value, this.temperature_unit)
      );
    this.hourly_forecast = hass
      .callService('weather', 'get_forecasts', {
        target: {entity_id: this.entity_id},
        data: {type: 'hourly'},
      })
      [this.entity_id].forecast.map(
        (value) => new HourlyForecast(value, this.temperature_unit)
      );
  }

  get temperatureUnit() {
    return [this.temperature, this.temperature_unit].join('');
  }

  get weatherName() {
    return WEATHER_STATE_FR[this.state];
  }

  get daily_precipitation() {
    return this.__getSensor('daily_precipitation');
  }

  get freeze_chance() {
    return this.__getSensor('freeze_chance');
  }

  get rain_chance() {
    return this.__getSensor('rain_chance');
  }

  get snow_chance() {
    return this.__getSensor('snow_chance');
  }

  get cloud_cover() {
    return this.__getSensor('cloud_cover');
  }

  __getSensor(name) {
    return this.sensors[name];
  }
}

class ExtraSensor {
  constructor(key, state, unit_of_measurement) {
    this.key = key;
    this.state = state;
    this.unit_of_measurement = unit_of_measurement;
    this.icon = EXTRA_SENSORS[key].icon;
    this.name = EXTRA_SENSORS[key].name;
  }

  get value() {
    return [this.state, this.unit_of_measurement].join(' ');
  }
}

class DailyForecast {
  constructor(data, temperature_unit) {
    this.condition = data.condition;
    this.datetime = new Date(data.datetime);
    this.temperature = data.temperature;
    this.templow = data.templow;
    this.precipitation = data.precipitation;
    this.humidity = data.humidity;
    this.temperature_unit = temperature_unit;
  }

  getWeatherIcon(day = true) {
    return getWeatherIcon([this.condition, day ? 'day' : 'night'].join('-'));
  }

  render(day = true) {
    return html`
      <div class="weather">
        <div class="label">${this.__getDay()}</div>
        <div class="state">${this.getWeatherIcon(day)}</div>
        <div class="temp">${this.templow}${this.temperature_unit}</div>
        <div class="temp hight">
          ${this.temperature}${this.temperature_unit}
        </div>
      </div>
    `;
  }

  __getDay() {
    return WEEK_DAYS[this.datetime.getDay()].short;
  }
}

class HourlyForecast {
  constructor(data, temperature_unit) {
    this.condition = data.condition;
    this.datetime = new Date(data.datetime);
    this.humidity = data.humidity;
    this.precipitation = data.precipitation;
    this.temperature = data.temperature;
    this.wind_bearing = data.wind_bearing;
    this.wind_speed = data.wind_speed;
    this.temperature_unit = temperature_unit;
  }

  get day_hours() {
    return [this.__getDay(), this.hours].join(' ');
  }

  get hours() {
    return [this.datetime.getHours(), 'h'].join(' ');
  }

  __getDay() {
    return WEEK_DAYS[this.datetime.getDay()].short;
  }
}
