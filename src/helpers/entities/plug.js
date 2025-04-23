import {Device} from './device';
import {Sensor} from './sensor/sensor';

const PLUG_STATE_ON = 'on';

export class Plug {
  constructor(
    hass,
    device_id,
    entity_id,
    name,
    active_icon,
    inactive_icon,
    power_sensor,
    other_sensors
  ) {
    this.device = new Device(hass, device_id);
    this._active_icon = active_icon;
    this._inactive_icon = inactive_icon;
    this.entity_id = entity_id;
    this.state = hass.states[entity_id].state;
    this.name = name;
    this.power_sensor = power_sensor && hass.states[power_sensor]
        ? new Sensor(power_sensor, hass)
        : null;
  }

  get icon() {
    return this.state == PLUG_STATE_ON
      ? this._active_icon
      : this._inactive_icon;
  }

  get area() {
    return this.device.area;
  }

  get manufacturer() {
    return this.device.manufacturer;
  }
  get model() {
    return this.device.model;
  }
}
