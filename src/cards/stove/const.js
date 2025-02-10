import {
  STOVE_SENSOR_STATUS_COMBUSTION,
  STOVE_SENSOR_STATUS_COOLING,
  STOVE_SENSOR_STATUS_ECO,
  STOVE_SENSOR_STATUS_IGNITION,
  STOVE_SENSOR_STATUS_OFF,
  STOVE_SENSOR_STATUS_PRE_COMBUSTION,
  STOVE_SENSOR_STATUS_PRE_HEATING,
} from '../../helpers/entities/sensor_const.js';

export const PACKAGE = 'sci-fi-stove';
export const NAME = 'Sci-fi Stove card';
export const DESCRIPTION = 'Render sci-fi Stove management card.';

export const HVAC_MODES_ICONS = {
  off: 'mdi:power',
  heat: 'mdi:fire',
  cool: 'mdi:snowflake',
};
export const PRESET_MODES_ICONS = {
  none: 'mdi:circle-medium',
  eco: 'mdi:leaf',
};

export let STATUS_ICONS_COLORS = {};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_OFF] = {
  icon: 'sci:stove-off',
  color: 'off',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_PRE_HEATING] = {
  icon: 'sci:stove-heat',
  color: 'amber',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_IGNITION] = {
  icon: 'sci:stove-heat',
  color: 'amber',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_PRE_COMBUSTION] = {
  icon: 'sci:stove-heat',
  color: 'red',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_COMBUSTION] = {
  icon: 'sci:stove-heat',
  color: 'red',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_ECO] = {
  icon: 'sci:stove-eco',
  color: 'green',
};
STATUS_ICONS_COLORS[STOVE_SENSOR_STATUS_COOLING] = {
  icon: 'sci:stove-cool',
  color: 'blue',
};
