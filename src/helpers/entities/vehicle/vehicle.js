import {Sensor} from '../sensor/sensor';
import {
  VEHICLE_CHARGE_STATES,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_DOOR_CLOSE,
  VEHICLE_DOOR_OPEN,
  VEHICLE_LOCKED,
  VEHICLE_OPEN,
  VEHICLE_PLUG_STATES,
  VEHICLE_PLUG_STATES_UNKNOWN,
  VEHICLE_SENSORS,
  VEHICLE_SENSOR_BATTERY_AUTONOMY,
  VEHICLE_SENSOR_BATTERY_AVAILABLE_ENERGY,
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
  VEHICLE_SENSOR_PASSENGER_DOOR_STATUS,
  VEHICLE_SENSOR_PLUGGED_IN,
  VEHICLE_SENSOR_PLUG_STATE,
  VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS,
} from './vehicle_const';

export class Vehicle {
  constructor(hass, config) {
    this.name = config.name;
    this.sensors = this.__buildSensors(hass, config);
  }

  __buildSensors(hass, config) {
    const sensors = {};
    VEHICLE_SENSORS.forEach((sensor_name) => {
      sensors[sensor_name] = config[sensor_name]
        ? new Sensor(config[sensor_name], hass)
        : null;
    });
    return sensors;
  }

  get charging() {
    return this.sensors[VEHICLE_SENSOR_CHARGING]
      ? this.sensors[VEHICLE_SENSOR_CHARGING] == 'on'
      : false;
  }

  get rear_left_door() {
    return !this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS]
      ? VEHICLE_DOOR_CLOSE
      : this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS] == 'on'
        ? VEHICLE_DOOR_OPEN
        : VEHICLE_DOOR_CLOSE;
  }

  get rear_right_door() {
    return !this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS]
      ? VEHICLE_DOOR_CLOSE
      : this.sensors[VEHICLE_SENSOR_REAR_RIGHT_DOOR_STATUS] == 'on'
        ? VEHICLE_DOOR_OPEN
        : VEHICLE_DOOR_CLOSE;
  }

  get driver_door_status() {
    return !this.sensors[VEHICLE_SENSOR_DRIVER_DOOR_STATUS]
      ? VEHICLE_DOOR_CLOSE
      : this.sensors[VEHICLE_SENSOR_DRIVER_DOOR_STATUS] == 'on'
        ? VEHICLE_DOOR_OPEN
        : VEHICLE_DOOR_CLOSE;
  }

  get passenger_door_status() {
    return !this.sensors[VEHICLE_SENSOR_PASSENGER_DOOR_STATUS]
      ? VEHICLE_DOOR_CLOSE
      : this.sensors[VEHICLE_SENSOR_PASSENGER_DOOR_STATUS] == 'on'
        ? VEHICLE_DOOR_OPEN
        : VEHICLE_DOOR_CLOSE;
  }

  get plugged_in() {
    return this.sensors[VEHICLE_SENSOR_PLUGGED_IN]
      ? this.sensors[VEHICLE_SENSOR_PLUGGED_IN] == 'on'
      : false;
  }

  get lock_status() {
    return !this.sensors[VEHICLE_SENSOR_LOCK_STATUS]
      ? VEHICLE_LOCKED
      : this.sensors[VEHICLE_SENSOR_LOCK_STATUS] == 'on'
        ? VEHICLE_OPEN
        : VEHICLE_LOCKED;
  }

  get hatch_status() {
    return !this.sensors[VEHICLE_SENSOR_HATCH_STATUS]
      ? VEHICLE_DOOR_CLOSE
      : this.sensors[VEHICLE_SENSOR_HATCH_STATUS] == 'on'
        ? VEHICLE_DOOR_OPEN
        : VEHICLE_DOOR_CLOSE;
  }

  get location() {
    return !this.sensors[VEHICLE_SENSOR_LOCATION]
      ? null
      : this.sensors[VEHICLE_SENSOR_LOCATION].value;
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
