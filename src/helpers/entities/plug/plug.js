import {Device} from '../device';
import {Sensor} from '../sensor/sensor';
import { HASS_PLUG_SERVICE, HASS_PLUG_SERVICE_ACTION_TURN_OFF, HASS_PLUG_SERVICE_ACTION_TURN_ON, PLUG_STATE_ON } from './plug_const';

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
    this._hass = hass;
    this.device = new Device(hass, device_id);
    this._active_icon = active_icon;
    this._inactive_icon = inactive_icon;
    this.entity_id = entity_id;
    this.state = hass.states[entity_id].state;
    this.name = name;
    this.power_sensor =
      power_sensor && hass.states[power_sensor]
        ? new Sensor(power_sensor, hass)
        : null;
  }

  get power_unit_of_measurement() {
    return this.power_sensor ? this.power_sensor.unit_of_measurement : '';
  }

  get active() {
    return this.state == PLUG_STATE_ON;
  }

  get icon() {
    return this.active ? this._active_icon : this._inactive_icon;
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

  async getPowerHistory() {
    return this._hass.callApi(
      'GET',
      'history/period/' +
        this.__getNow() +
        '?minimal_response=true&no_attributes=true&significant_changes_only=false&filter_entity_id=' +
        this.power_sensor.id
    );
  }

  __getNow() {
    const d = new Date();
    return (
      [
        d.getFullYear(),
        ('0' + (d.getMonth() + 1)).slice(-2),
        ('0' + (d.getDate() - 1)).slice(-2),
      ].join('-') +
      'T' +
      [
        ('0' + d.getHours()).slice(-2),
        ('0' + d.getMinutes()).slice(-2),
        ('0' + d.getSeconds()).slice(-2),
      ].join(':') +
      '+00:00'
    );
  }

  callService() {
    return this._hass.callService(
      HASS_PLUG_SERVICE,
      this.active
        ? HASS_PLUG_SERVICE_ACTION_TURN_OFF
        : HASS_PLUG_SERVICE_ACTION_TURN_ON,
      {
        entity_id: [this.entity_id],
      }
    );
  }
}
