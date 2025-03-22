export const VEHICLE_SENSOR_CHARGING = 'charging';
export const VEHICLE_SENSOR_LOCK_STATUS = 'lock_status';
export const VEHICLE_SENSOR_BATTERY_AUTONOMY = 'battery_autonomy';
export const VEHICLE_SENSOR_FUEL_AUTONOMY = 'fuel_autonomy';
export const VEHICLE_SENSOR_BATTERY_LEVEL = 'battery_level';
export const VEHICLE_SENSOR_LOCATION = 'location';
export const VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY = 'location_last_activity';
export const VEHICLE_SENSOR_BATTERY_AVAILABLE_ENERGY =
  'battery_available_energy';
export const VEHICLE_SENSOR_CHARGE_STATE = 'charge_state';
export const VEHICLE_SENSOR_PLUG_STATE = 'plug_state';
export const VEHICLE_SENSOR_MILEAGE = 'mileage';
export const VEHICLE_SENSOR_FUEL_QUANTITY = 'fuel_quantity';
export const VEHICLE_SENSOR_BATTERY_TEMPERATURE = 'battery_temperature';
export const VEHICLE_SENSOR_CHARGING_REMAINING_TIME = 'charging_remaining_time';

export const VEHICLE_SENSORS = [
  VEHICLE_SENSOR_CHARGING,
  VEHICLE_SENSOR_LOCK_STATUS,
  VEHICLE_SENSOR_BATTERY_AUTONOMY,
  VEHICLE_SENSOR_FUEL_AUTONOMY,
  VEHICLE_SENSOR_BATTERY_LEVEL,
  VEHICLE_SENSOR_LOCATION,
  VEHICLE_SENSOR_LOCATION_LAST_ACTIVITY,
  VEHICLE_SENSOR_BATTERY_AVAILABLE_ENERGY,
  VEHICLE_SENSOR_CHARGE_STATE,
  VEHICLE_SENSOR_PLUG_STATE,
  VEHICLE_SENSOR_MILEAGE,
  VEHICLE_SENSOR_FUEL_QUANTITY,
  VEHICLE_SENSOR_BATTERY_TEMPERATURE,
  VEHICLE_SENSOR_CHARGING_REMAINING_TIME,
];

export const VEHICLE_SENSOR_ON_STATE = 'on';
export const VEHICLE_SENSOR_OPEN_STATE = 'open';
export const VEHICLE_SENSOR_UNAVAILABLE_STATE = 'unavailable';

export const VEHICLE_CHARGE_STATES_NOT_IN_CHARGE = 'not_in_charge';
export const VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE =
  'waiting_for_a_planned_charge';
export const VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE =
  'waiting_for_current_charge';
export const VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS = 'charge_in_progress';
export const VEHICLE_CHARGE_STATES_CHARGE_ENDED = 'charge_ended';
export const VEHICLE_CHARGE_STATES_CHARGE_ERROR = 'charge_error';
export const VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED = 'energy_flap_opened';
export const VEHICLE_CHARGE_STATES_UNAVAILABLE = 'unavailable';

export const VEHICLE_PLUG_STATES_UNPLUGGED = 'unplugged';
export const VEHICLE_PLUG_STATES_PLUGGED = 'plugged';
export const VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE =
  'plugged_waiting_for_charge';
export const VEHICLE_PLUG_STATES_ERROR = 'plug_error';
export const VEHICLE_PLUG_STATES_UNKNOWN = 'plug_unknown';

export const HASS_RENAULT_SERVICE = 'renault';
export const HASS_RENAULT_SERVICE_ACTION_START_AC = 'ac_start';
export const HASS_RENAULT_SERVICE_ACTION_STOP_AC = 'ac_cancel';
