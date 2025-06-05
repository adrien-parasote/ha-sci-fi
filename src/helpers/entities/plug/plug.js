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
    sensors
  ) {
    this._hass = hass;
    this.device = new Device(hass, device_id);
    this._active_icon = active_icon;
    this._inactive_icon = inactive_icon;
    this.entity_id = entity_id;
    this.state = hass.states[entity_id].state;
    this.name = name;
    this.__buildSensors(sensors);
  }

  __buildSensors(config) {
    this.sensors = [];
    this.power = null;
    if (!config) return;

    config.forEach((sensor_conf) => {
      if (this._hass.states[sensor_conf.id]) {
        let sensor = null;
        switch (sensor_conf.id.split('.')[0]) {
          case 'select':
            sensor = new SelectSensor(sensor_conf.id, this._hass);
            break;
          case 'lock':
            sensor = new LockSensor(sensor_conf.id, this._hass);
            break;
          default:
            sensor = new Sensor(sensor_conf.id, this._hass);
            break;
        }
        // Update name
        sensor.friendly_name = sensor_conf.name;
        if (sensor_conf.power) {
          this.power = sensor;
        } else {
          this.sensors.push(sensor);
        }
      }
    });
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
        this.power.id
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
}
