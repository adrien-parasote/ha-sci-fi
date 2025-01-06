import {EXTRA_SENSORS} from '../../helpers/entities/const';
import {NOW, WEATHER_STATES, getStrDatetime, nameToId} from './utils';

function addHours(date, h) {
  let d = new Date(date);
  d.setTime(d.getTime() + h * 60 * 60 * 1000);
  return d;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function hourForecast(date) {
  return {
    datetime: getStrDatetime(date),
    condition:
      WEATHER_STATES[Math.floor(Math.random() * WEATHER_STATES.length)],
    wind_bearing: getRandomInt(70, 90),
    temperature: getRandomFloat(-10, 40),
    wind_speed: getRandomFloat(0, 100),
    precipitation: getRandomFloat(0, 5),
    humidity: getRandomInt(70, 90),
  };
}

function dayForecast(date) {
  return {
    datetime: getStrDatetime(date),
    condition:
      WEATHER_STATES[Math.floor(Math.random() * WEATHER_STATES.length)],
    temperature: getRandomFloat(-10, 40),
    templow: getRandomFloat(0, 5),
    precipitation: getRandomFloat(0, 5),
    humidity: getRandomInt(70, 90),
  };
}

export function buildForecast(hourly = true) {
  let forcast = [];
  let date = new Date(NOW);
  if (!hourly) date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const rows = hourly ? 72 : 15;
  for (let i = 0; i < rows; i++) {
    date = addHours(date, hourly ? 1 : 24);
    forcast.push(hourly ? hourForecast(date) : dayForecast(date));
  }
  return forcast;
}

class SensorState {
  constructor(state, attributes) {
    this.state = state;
    this.attributes = attributes;
  }
}

export function getWeatherSensors(city) {
  const city_id = nameToId('sensor', city);
  const attrs = {
    cloud_cover: {
      state: 30,
      attrs: {
        unit_of_measurement: '%',
      },
    },
    daily_precipitation: {
      state: 6.5,
      attrs: {
        unit_of_measurement: 'mm',
      },
    },
    freeze_chance: {
      state: 0,
      attrs: {
        unit_of_measurement: '%',
      },
    },
    humidity: {
      state: 60,
      attrs: {
        unit_of_measurement: '%',
      },
    },
    rain_chance: {
      state: 30,
      attrs: {
        unit_of_measurement: '%',
      },
    },
    snow_chance: {
      state: 0,
      attrs: {
        unit_of_measurement: '%',
      },
    },
  };
  let res = {};
  Object.keys(EXTRA_SENSORS).map((sensor_name) => {
    res[[city_id, sensor_name].join('_')] = new SensorState(
      attrs[sensor_name].state,
      attrs[sensor_name].attrs
    );
  });
  return res;
}
