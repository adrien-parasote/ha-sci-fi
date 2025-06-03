import {Device} from '../device';
import {LockSensor, SelectSensor, Sensor} from '../sensor/sensor';
import {
  HASS_PLUG_SERVICE,
  HASS_PLUG_SERVICE_ACTION_TURN_OFF,
  HASS_PLUG_SERVICE_ACTION_TURN_ON,
  PLUG_STATE_ON,
} from './plug_const';

export class Plug {
  constructor(
    hass,
    device_id,
    entity_id,
    name,
    active_icon,
    inactive_icon,
    power_sensor,
    child_lock_sensor,
    power_outage_memory_select,
    other_sensors
  ) {
    this._hass = hass;
    this.device = new Device(hass, device_id);
    this._active_icon = active_icon;
    this._inactive_icon = inactive_icon;
    this.entity_id = entity_id;
    this.state = hass.states[entity_id].state;
    this.name = name;
    this.child_lock_sensor =
      child_lock_sensor && hass.states[child_lock_sensor]
        ? new LockSensor(child_lock_sensor, hass)
        : null;
    this.power_sensor =
      power_sensor && hass.states[power_sensor]
        ? new Sensor(power_sensor, hass)
        : null;
    this.power_outage_memory_sensor =
      power_outage_memory_select && hass.states[power_outage_memory_select]
        ? new SelectSensor(power_outage_memory_select, hass)
        : null;

    this.other_sensors = this.__buildOtherSensors(other_sensors);
  }

  __buildOtherSensors(other_sensors) {
    if (!other_sensors) return [];
    const sensors = [];
    other_sensors.forEach((name) => {
      if (hass.states[name]) sensors.push(new Sensor(name, hass));
    });
    return sensors;
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
        this.__getYesterday() +
        '?minimal_response=true&no_attributes=true&significant_changes_only=false&filter_entity_id=' +
        this.power_sensor.id
    );
  }

  __getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return (
      [
        d.getFullYear(),
        ('0' + (d.getMonth() + 1)).slice(-2),
        ('0' + d.getDate()).slice(-2),
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

  turnOnOffChildLock() {
    if (!this.child_lock_sensor) return;
    return this.child_lock_sensor.callService(this._hass);
  }

  updatePowerOutageMemoryState(newState) {
    if (!this.power_outage_memory_sensor) return;
    return this.power_outage_memory_sensor.callService(this._hass, newState);
  }
}
