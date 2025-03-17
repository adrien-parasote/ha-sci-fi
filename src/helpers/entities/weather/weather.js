import {html} from 'lit';

import {isSameDay} from '../../utils/utils.js';
import {WeatherSensor} from '../sensor/sensor.js';
import {WEATHER_EXTRA_SENSORS} from '../sensor/sensor_const.js';
import {WEATHER_STATE_FR} from './weather_const.js';

export class SunEntity {
  constructor(hass, sun_entity_id) {
    this.entity_id = sun_entity_id;
    this.state = hass.states[sun_entity_id].state;
    this.next_dawn = new Date(hass.states[sun_entity_id].attributes.next_dawn);
    this.next_dusk = new Date(hass.states[sun_entity_id].attributes.next_dusk);
    this.next_midnight = new Date(
      hass.states[sun_entity_id].attributes.next_midnight
    );
    this.next_noon = new Date(hass.states[sun_entity_id].attributes.next_noon);
    this.next_rising = new Date(
      hass.states[sun_entity_id].attributes.next_rising
    );
    this.next_setting = new Date(
      hass.states[sun_entity_id].attributes.next_setting
    );
    this.elevation = hass.states[sun_entity_id].attributes.elevation;
    this.azimuth = hass.states[sun_entity_id].attributes.azimuth;
    this.rising = hass.states[sun_entity_id].attributes.rising;
  }

  isDay() {
    return ['sunny-day', 'sunset', 'sunrise'].includes(this.dayPhaseIcon());
  }

  dayPhaseIcon() {
    const date = new Date();
    let state = null;
    if (
      !isSameDay(date, this.next_noon) ||
      (isSameDay(date, this.next_noon) && date >= this.next_noon)
    ) {
      // Afternoon
      if (!isSameDay(date, this.next_dusk)) {
        state = 'moonrise';
      } else if (!isSameDay(date, this.next_setting)) {
        state = 'sunset';
      } else {
        state = 'sunny-day';
      }
    } else {
      // Morning
      if (!isSameDay(date, this.next_rising)) {
        state = 'sunny-day';
      } else if (!isSameDay(date, this.next_dawn)) {
        state = 'sunrise';
      } else {
        state = 'moonset';
      }
    }
    return state;
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
  }

  getUnit(kind) {
    return this[[kind, 'unit'].join('_')];
  }

  __buildExtraSensors(hass) {
    const city = ['sensor', this.entity_id.split('.')[1]].join('.');
    let sensors = {};
    Object.keys(WEATHER_EXTRA_SENSORS).map((sensorkey) => {
      sensors[sensorkey] = new WeatherSensor(
        [city, sensorkey].join('_'),
        hass,
        sensorkey
      );
    });
    return sensors;
  }

  getWeatherIcon(day = true) {
    return html`<sci-fi-weather-icon
      icon="${[this.state, day ? 'day' : 'night'].join('-')}"
    ></sci-fi-weather-icon>`;
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

export class DailyForecast {
  constructor(data, temperature_unit) {
    this.condition = data.condition;
    this.datetime = new Date(data.datetime);
    this.temperature = data.temperature;
    this.templow = data.templow;
    this.precipitation = data.precipitation;
    this.humidity = data.humidity;
    this.temperature_unit = temperature_unit;
  }

  get date() {
    return new Date(
      this.datetime.getFullYear(),
      this.datetime.getMonth(),
      this.datetime.getDate(),
      0,
      0,
      0,
      0
    );
  }

  getWeatherIcon(day = true) {
    return html`<sci-fi-weather-icon
      icon="${[this.condition, day ? 'day' : 'night'].join('-')}"
    ></sci-fi-weather-icon>`;
  }

  render(user, day = true) {
    return html`
      <div class="label">${this.__getDay(user)}</div>
      <div class="state">${this.getWeatherIcon(day)}</div>
      <div class="temp">${this.templow}${this.temperature_unit}</div>
      <div class="temp hight">${this.temperature}${this.temperature_unit}</div>
    `;
  }

  __getDay(user) {
    const options = {
      weekday: 'short',
    };
    return new Intl.DateTimeFormat(user.date_format, options).format(
      this.datetime
    );
  }
}

export class HourlyForecast {
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

  getKindValue(kind) {
    let res = null;
    switch (kind) {
      case 'temperature':
        res = this.temperature;
        break;
      case 'precipitation':
        res = this.precipitation;
        break;
      case 'wind_speed':
        res = this.wind_speed;
        break;
      default:
        res = 0;
        break;
    }
    return res;
  }

  getIconName(sun) {
    let state = 'day';
    const today = new Date();
    // Forecast if for today
    if (isSameDay(today, this.datetime)) {
      if (this.datetime >= sun.next_dusk || this.datetime <= sun.next_dawn)
        state = 'night';
    } else {
      // Forecast if for tomorrow
      // First reset dusk & dawn as of today
      const dusk = new Date(sun.next_dusk);
      dusk.setDate(today.getDate());
      dusk.setMonth(today.getMonth());
      dusk.setFullYear(today.getFullYear());
      const dawn = new Date(sun.next_dawn);
      dawn.setDate(today.getDate());
      dawn.setMonth(today.getMonth());
      dawn.setFullYear(today.getFullYear());
      // Reset forecast hour
      const hour = new Date(this.datetime);
      hour.setDate(today.getDate());
      hour.setMonth(today.getMonth());
      hour.setFullYear(today.getFullYear());

      if (hour <= dawn || hour >= dusk) state = 'night';
    }
    return [this.condition, state].join('-');
  }

  __getSunDate(hour) {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  getHours(user) {
    const options = {
      hour: '2-digit',
    };
    return new Intl.DateTimeFormat(user.date_format, options).format(
      this.datetime
    );
  }

  isPartOfDay(date) {
    return (
      this.datetime.getFullYear() == date.getFullYear() &&
      this.datetime.getMonth() == date.getMonth() &&
      this.datetime.getDate() == date.getDate()
    );
  }
}
