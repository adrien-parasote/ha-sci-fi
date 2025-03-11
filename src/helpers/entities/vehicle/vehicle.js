import {isEqual} from 'lodash-es';

import {Sensor, TrackerSensor} from '../sensor/sensor';
import {
  VEHICLE_CHARGE_STATES,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_PLUG_STATES,
  VEHICLE_PLUG_STATES_UNKNOWN,
  VEHICLE_SENSORS,
  VEHICLE_SENSOR_BATTERY_AUTONOMY,
  VEHICLE_SENSOR_BATTERY_LAST_ACTIVITY,
  VEHICLE_SENSOR_BATTERY_LEVEL,
  VEHICLE_SENSOR_CHARGE_STATE,
  VEHICLE_SENSOR_CHARGING,
  VEHICLE_SENSOR_CHARGING_REMAINING_TIME,
  VEHICLE_SENSOR_DRIVER_DOOR_STATUS,
  VEHICLE_SENSOR_FUEL_AUTONOMY,
  VEHICLE_SENSOR_FUEL_QUANTITY,
  VEHICLE_SENSOR_HATCH_STATUS,
  VEHICLE_SENSOR_LOCATION,
  VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY,
  VEHICLE_SENSOR_LOCK_STATUS,
  VEHICLE_SENSOR_MILEAGE,
  VEHICLE_SENSOR_ON_STATE,
  VEHICLE_SENSOR_OPEN_STATE,
  VEHICLE_SENSOR_PASSENGER_DOOR_STATUS,
  VEHICLE_SENSOR_PLUGGED_IN,
  VEHICLE_SENSOR_PLUG_STATE,
  VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS,
  VEHICLE_SENSOR_UNAVAILABLE_STATE,
} from './vehicle_const';

export class Vehicle {
  constructor(hass, config) {
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

  get rear_left_door() {
    return !this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_OPEN_STATE].includes(
          this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS].state
        );
  }

  get rear_right_door() {
    return !this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_OPEN_STATE].includes(
          this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS].state
        );
  }

  get driver_door_status() {
    return !this.sensors[VEHICLE_SENSOR_DRIVER_DOOR_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_OPEN_STATE].includes(
          this.sensors[VEHICLE_SENSOR_DRIVER_DOOR_STATUS].state
        );
  }

  get passenger_door_status() {
    return !this.sensors[VEHICLE_SENSOR_PASSENGER_DOOR_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_OPEN_STATE].includes(
          this.sensors[VEHICLE_SENSOR_PASSENGER_DOOR_STATUS].state
        );
  }

  get plugged_in() {
    return !this.sensors[VEHICLE_SENSOR_PLUGGED_IN]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_ON_STATE].includes(
          this.sensors[VEHICLE_SENSOR_PLUGGED_IN].state
        );
  }

  get lock_status() {
    return !this.sensors[VEHICLE_SENSOR_LOCK_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_ON_STATE].includes(
          this.sensors[VEHICLE_SENSOR_LOCK_STATUS].state
        );
  }

  get hatch_status() {
    return !this.sensors[VEHICLE_SENSOR_HATCH_STATUS]
      ? false
      : [VEHICLE_SENSOR_UNAVAILABLE_STATE, VEHICLE_SENSOR_ON_STATE].includes(
          this.sensors[VEHICLE_SENSOR_HATCH_STATUS].state
        );
  }

  get location() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION]
      ? 'Undefined'
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

  get mileage() {
    return !this.sensors[VEHICLE_SENSOR_MILEAGE]
      ? null
      : [
          this.sensors[VEHICLE_SENSOR_MILEAGE].value,
          this.sensors[VEHICLE_SENSOR_MILEAGE].unit_of_measurement,
        ].join(' ');
  }

  get charge_state() {
    if (!this.sensors[VEHICLE_SENSOR_CHARGE_STATE])
      return VEHICLE_CHARGE_STATES[VEHICLE_CHARGE_STATES_UNAVAILABLE];
    return VEHICLE_CHARGE_STATES[
      this.sensors[VEHICLE_SENSOR_CHARGE_STATE].value
    ];
  }

  get plug_state() {
    if (!this.sensors[VEHICLE_SENSOR_PLUG_STATE])
      return VEHICLE_PLUG_STATES[VEHICLE_PLUG_STATES_UNKNOWN];
    return VEHICLE_PLUG_STATES[this.sensors[VEHICLE_SENSOR_PLUG_STATE].value];
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
      ? null
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

  get fuel_quantity() {
    return !this.sensors[VEHICLE_SENSOR_FUEL_QUANTITY]
      ? null
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

  get battery_last_activity() {
    return !this.sensors[VEHICLE_SENSOR_BATTERY_LAST_ACTIVITY]
      ? null
      : new Date(this.sensors[VEHICLE_SENSOR_BATTERY_LAST_ACTIVITY].value);
  }
}
