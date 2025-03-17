import {isEqual} from 'lodash-es';

import {Sensor, TrackerSensor} from '../sensor/sensor';
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
  VEHICLE_CHARGE_STATES,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_PLUG_STATES,
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
  VEHICLE_SENSOR_OPEN_STATE,
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
        sensors[sensor_name] =
          this._config[sensor_name].split('.')[0] == 'device_tracker'
            ? new TrackerSensor(this._config[sensor_name], hass)
            : new Sensor(this._config[sensor_name], hass);
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
    return this.sensors[VEHICLE_SENSOR_CHARGING]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_OPEN_STATE].includes(
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
      : this.sensors[VEHICLE_SENSOR_LOCATION].value.split('_').join(' ');
  }

  get location_gps() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION]
      ? null
      : this.sensors[VEHICLE_SENSOR_LOCATION].gps;
  }

  get location_last_activity() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY]
      ? null
      : new Date(this.sensors[VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY].value);
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
    if (!this.sensors[VEHICLE_SENSOR_CHARGE_STATE])
      return VEHICLE_CHARGE_STATES[VEHICLE_CHARGE_STATES_UNAVAILABLE];
    return VEHICLE_CHARGE_STATES[
      this.sensors[VEHICLE_SENSOR_CHARGE_STATE].value
    ];
  }

  get raw_charge_state() {
    return !this.sensors[VEHICLE_SENSOR_CHARGE_STATE]
      ? VEHICLE_CHARGE_STATES_UNAVAILABLE
      : this.sensors[VEHICLE_SENSOR_CHARGE_STATE].value;
  }

  get plug_state() {
    if (!this.sensors[VEHICLE_SENSOR_PLUG_STATE])
      return VEHICLE_PLUG_STATES[VEHICLE_PLUG_STATES_UNKNOWN];
    return VEHICLE_PLUG_STATES[this.sensors[VEHICLE_SENSOR_PLUG_STATE].value];
  }

  get raw_plug_state() {
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
    return !this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY]
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : [
          this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY].value,
          this.sensors[VEHICLE_SENSOR_FUEL_AUTONOMY].unit_of_measurement,
        ].join(' ');
  }

  get battery_level() {
    return !this.sensors[VEHICLE_SENSOR_BATTERY_LEVEL]
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
    return !this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY]
      ? VEHICLE_SENSOR_UNAVAILABLE_STATE
      : [
          this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY].value,
          this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY].unit_of_measurement,
        ].join(' ');
  }

  get charging_remaining_time() {
    return !this.sensors[VEHICLE_SENSOR_CHARGING_REMAINING_TIME]
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
