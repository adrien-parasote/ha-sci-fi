export class Counter {
  constructor(id, hass) {
    this.id = id;
    this.state = hass.states[id].state;
    this.attributes = hass.states[id].attributes;
  }

  get step() {
    return parseFloat(this.attributes.step);
  }

  get minimum() {
    return parseFloat(this.attributes.minimum);
  }

  get maximum() {
    return parseFloat(this.attributes.maximum);
  }

  get icon() {
    return this.attributes.icon;
  }

  get value() {
    return parseFloat(this.state);
  }

  get friendly_name() {
    return this.attributes.friendly_name;
  }
}
