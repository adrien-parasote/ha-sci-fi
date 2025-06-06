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

export const WEATHER_EXTRA_SENSORS = {
  cloud_cover: {
    icon: 'cloudy',
    name: 'Nuage',
  },
  daily_precipitation: {
    icon: 'raindrop-measure',
    name: 'Précipitation',
  },
  freeze_chance: {
    icon: 'freeze',
    name: 'Gel',
  },
  humidity: {
    icon: 'humidity',
    name: 'Humidité',
  },
  rain_chance: {
    icon: 'rain',
    name: 'Pluie',
  },
  snow_chance: {
    icon: 'snow',
    name: 'Neige',
  },
};

export const LOCK_SENSOR_STATE_UNLOCK = 'unlocked';
export const LOCK_SENSOR_STATE_LOCK = 'locked';
export const HASS_LOCK_SERVICE = 'lock';
export const HASS_LOCK_SERVICE_ACTION_TURN_OFF = 'unlock';
export const HASS_LOCK_SERVICE_ACTION_TURN_ON = 'lock';
export const HASS_SELECT_SERVICE = 'select';
export const HASS_SELECT_SERVICE_OPTION = 'select_option';
