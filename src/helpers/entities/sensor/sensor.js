import {html} from 'lit';

import {SEASON_ICONS, WEATHER_EXTRA_SENSORS} from './sensor_const.js';

export class Sensor {
  constructor(id, hass) {
    this.id = id;
    this.state = hass.states[id].state;
    this.attributes = hass.states[id].attributes;
  }

  get friendly_name() {
    return this.attributes.friendly_name;
  }

  get unit_of_measurement() {
    return this.attributes.unit_of_measurement;
  }

  get value() {
    if (this.unit_of_measurement) return parseFloat(this.state);
    return this.state;
  }
}

export class Season extends Sensor {
  get state_icon() {
    return html`<sci-fi-icon
      icon=${SEASON_ICONS[this.state].icon}
    ></sci-fi-icon>`;
  }

  get color() {
    return SEASON_ICONS[this.state].color;
  }
}

export class WeatherSensor extends Sensor {
  constructor(id, hass, key) {
    super(id, hass);
    this.key = key;
    this.icon = WEATHER_EXTRA_SENSORS[key].icon;
    this.name = WEATHER_EXTRA_SENSORS[key].name;
  }

  get value() {
    return [this.state, this.unit_of_measurement].join(' ');
  }
}

export class TrackerSensor extends Sensor {
  get value() {
    if (this.unit_of_measurement)
      return [this.state, this.unit_of_measurement].join(' ');
    return this.state;
  }

  get gps() {
    return {
      latitude: parseFloat(this.attributes.latitude),
      longitude: parseFloat(this.attributes.longitude),
    };
  }
}

export class ZoneSensor extends Sensor {
  has_user(user_id) {
    return this.attributes.persons.includes(user_id);
  }

  get icon() {
    return this.attributes.icon;
  }
}
