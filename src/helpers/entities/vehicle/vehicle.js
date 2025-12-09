import {isEqual} from 'lodash-es';

import {Sensor, TimestampSensor, TrackerSensor} from '../sensor/sensor';
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_PLUG_STATES_UNKNOWN,
  VEHICLE_SENSORS,
  VEHICLE_SENSOR_BATTERY_AUTONOMY,
  VEHICLE_SENSOR_BATTERY_LEVEL,
  VEHICLE_SENSOR_CHARGE_STATE,
  VEHICLE_SENSOR_CHARGING,
  VEHICLE_SENSOR_CHARGING_REMAINING_TIME,
  VEHICLE_SENSOR_FUEL_AUTONOMY,
  VEHICLE_SENSOR_FUEL_QUANTITY,
  VEHICLE_SENSOR_LOCATION,
  VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY,
  VEHICLE_SENSOR_LOCK_STATUS,
  VEHICLE_SENSOR_MILEAGE,
  VEHICLE_SENSOR_ON_STATE,
  VEHICLE_SENSOR_PLUG_STATE,
  VEHICLE_SENSOR_UNAVAILABLE_STATE,
} from './vehicle_const';

export class Vehicle {
  constructor(hass, config) {
    this.id = config.id;
    this.name = config.name;
    this._config = config;
    this.sensors = this.__buildSensors(hass);
  }

  __buildSensors(hass) {
    const sensors = {};
    VEHICLE_SENSORS.forEach((sensor_name) => {
      if (!this._config[sensor_name]) {
        sensors[sensor_name] = null;
      } else {
        var cls = hass.states[this._config[sensor_name]].attributes.device_class
          ? hass.states[this._config[sensor_name]].attributes.device_class
          : this._config[sensor_name].split('.')[0];
        switch (cls) {
          case 'device_tracker':
            sensors[sensor_name] = new TrackerSensor(
              this._config[sensor_name],
              hass
            );
            break;
          case 'timestamp':
            sensors[sensor_name] = new TimestampSensor(
              this._config[sensor_name],
              hass
            );
            break;
          default:
            sensors[sensor_name] = new Sensor(this._config[sensor_name], hass);
            break;
        }
      }
    });
    return sensors;
  }

  update(hass) {
    const new_sensors = this.__buildSensors(hass);
    if (isEqual(new_sensors, this.sensors)) return false;
    this.sensors = new_sensors;
    return true;
  }

  get charging() {
    return !this.sensors[VEHICLE_SENSOR_CHARGING]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_ON_STATE].includes(
          this.sensors[VEHICLE_SENSOR_CHARGING].state
        );
  }

  get lock_status() {
    return !this.sensors[VEHICLE_SENSOR_LOCK_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_ON_STATE].includes(
          this.sensors[VEHICLE_SENSOR_LOCK_STATUS].state
        );
  }

  get location() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION]
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : this.sensors[VEHICLE_SENSOR_LOCATION].value;
  }

  get location_gps() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION]
      ? null
      : this.sensors[VEHICLE_SENSOR_LOCATION].gps;
  }

  get_location_last_activity(date_format) {
    return this.sensors[VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY].get_date(
      date_format
    );
  }

  hasMileage() {
    return !this.sensors[VEHICLE_SENSOR_MILEAGE] ? false : true;
  }

  get raw_mileage() {
    return !this.sensors[VEHICLE_SENSOR_MILEAGE]
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : this.sensors[VEHICLE_SENSOR_MILEAGE].value;
  }

  get mileage_unit() {
    return !this.sensors[VEHICLE_SENSOR_MILEAGE]
      ? ''
      : this.sensors[VEHICLE_SENSOR_MILEAGE].unit_of_measurement;
  }

  get charge_state() {
    return !this.sensors[VEHICLE_SENSOR_CHARGE_STATE]
      ? VEHICLE_CHARGE_STATES_UNAVAILABLE
      : this.sensors[VEHICLE_SENSOR_CHARGE_STATE].value;
  }

  get plug_state() {
    return !this.sensors[VEHICLE_SENSOR_PLUG_STATE]
      ? VEHICLE_PLUG_STATES_UNKNOWN
      : this.sensors[VEHICLE_SENSOR_PLUG_STATE].value;
  }

  get battery_autonomy() {
    return !this.sensors[VEHICLE_SENSOR_BATTERY_AUTONOMY]
      ? null
      : [
          this.sensors[VEHICLE_SENSOR_BATTERY_AUTONOMY].value,
          this.sensors[VEHICLE_SENSOR_BATTERY_AUTONOMY].unit_of_measurement,
        ].join(' ');
  }

  get fuel_autonomy() {
    return !this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY] ||
      this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY].is_unavailable()
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : [
          this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY].value,
          this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY].unit_of_measurement,
        ].join(' ');
  }

  get battery_level() {
    return !this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL] ||
      this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL].is_unavailable()
      ? null
      : [
          this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL].value,
          this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL].unit_of_measurement,
        ].join(' ');
  }

  get raw_battery_level() {
    return !this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL]
      ? null
      : this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL].value;
  }

  get fuel_quantity() {
    return !this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY] ||
      this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY].is_unavailable()
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : [
          this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY].value,
          this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY].unit_of_measurement,
        ].join(' ');
  }

  get charging_remaining_time() {
    return !this.sensors[VEHICLE_SENSOR_CHARGING_REMAINING_TIME] ||
      this.sensors[VEHICLE_SENSOR_CHARGING_REMAINING_TIME].is_unavailable()
      ? null
      : [
          this.sensors[VEHICLE_SENSOR_CHARGING_REMAINING_TIME].value,
          this.sensors[VEHICLE_SENSOR_CHARGING_REMAINING_TIME]
            .unit_of_measurement,
        ].join(' ');
  }

  startAc(hass, temperature) {
    return hass.callService(
      HASS_RENAULT_SERVICE,
      HASS_RENAULT_SERVICE_ACTION_START_AC,
      {
        vehicle: this.id,
        temperature: temperature,
      }
    );
  }

  stopAc(hass) {
    return hass.callService(
      HASS_RENAULT_SERVICE,
      HASS_RENAULT_SERVICE_ACTION_STOP_AC,
      {
        vehicle: this.id,
      }
    );
  }
}
