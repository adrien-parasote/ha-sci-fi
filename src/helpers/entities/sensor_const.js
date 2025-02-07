export const STOVE_SENSOR_ACTUAL_POWER = 'sensor_actual_power';
export const STOVE_SENSOR_COMBUSTION_CHAMBER_TEMP =
  'sensor_combustion_chamber_temperature';
export const STOVE_SENSOR_PELLET_QTY = 'sensor_pellet_quantity';
export const STOVE_SENSOR_POWER = 'sensor_power';
export const STOVE_SENSOR_INSIDE_TEMP = 'sensor_inside_temperature';
export const STOVE_SENSOR_STATUS = 'sensor_status';
export const STOVE_SENSOR_FAN_SPEED = 'sensor_fan_speed';
export const STOVE_SENSOR_PRESSURE = 'sensor_pressure';
export const STOVE_SENSOR_TIME_TO_SERVICE = 'sensor_time_to_service';

export const STOVE_SENSORS = [
  STOVE_SENSOR_ACTUAL_POWER,
  STOVE_SENSOR_COMBUSTION_CHAMBER_TEMP,
  STOVE_SENSOR_PELLET_QTY,
  STOVE_SENSOR_POWER,
  STOVE_SENSOR_INSIDE_TEMP,
  STOVE_SENSOR_STATUS,
  STOVE_SENSOR_FAN_SPEED,
  STOVE_SENSOR_PRESSURE,
  STOVE_SENSOR_TIME_TO_SERVICE,
];

export const STOVE_SENSOR_STATUS_OFF = 'off';
export const STOVE_SENSOR_STATUS_PRE_HEATING = 'pre_heating';
export const STOVE_SENSOR_STATUS_IGNITION = 'ignition';
export const STOVE_SENSOR_STATUS_COMBUSTION = 'combustion';
export const STOVE_SENSOR_STATUS_PRE_COMBUSTION = 'pre_combustion';
export const STOVE_SENSOR_STATUS_ECO = 'eco';
export const STOVE_SENSOR_STATUS_COOLING = 'cooling';
export const STOVE_SENSOR_STATUS_UNKNOWN = 'unknown';

export const SEASON_SPRING = 'spring';
export const SEASON_SUMMER = 'summer';
export const SEASON_AUTUMN = 'autumn';
export const SEASON_WINTER = 'winter';

export const SEASON_ICONS = {};
SEASON_ICONS[SEASON_SPRING] = {icon: 'sci:spring', color: 'green'};
SEASON_ICONS[SEASON_SUMMER] = {icon: 'sci:summer', color: 'yellow'};
SEASON_ICONS[SEASON_AUTUMN] = {icon: 'sci:autumn', color: 'orange'};
SEASON_ICONS[SEASON_WINTER] = {icon: 'sci:winter', color: 'blue'};
