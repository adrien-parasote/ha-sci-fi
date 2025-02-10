import {html} from 'lit';

import {SEASON_ICONS} from './sensor_const.js';

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
