export const STATE_HOME = 'home';

export const STATE_LIGHT_ON = 'on';
export const STATE_LIGHT_OFF = 'off';
export const STATE_CLIMATE_HEAT = 'heat';
export const STATE_CLIMATE_OFF = 'off';
export const STATE_CLIMATE_AUTO = 'auto';

export const ENTITY_KIND_LIGHT = 'light';
export const ENTITY_KIND_CLIMATE = 'climate';

export const HASS_LIGHT_SERVICE = 'light';
export const HASS_LIGHT_SERVICE_ACTION_TURN_ON = 'turn_on';
export const HASS_LIGHT_SERVICE_ACTION_TURN_OFF = 'turn_off';

export const HASS_CLIMATE_SERVICE = 'climate';
export const HASS_CLIMATE_SERVICE_SET_PRESET_MODE = 'set_preset_mode';
export const HASS_CLIMATE_SERVICE_SET_HVAC_MODE = 'set_hvac_mode';

export const WEATHER_STATE_FR = {
  clear: 'Ciel dégagé',
  'clear-night': 'Nuit claire',
  cloudy: 'Nuageux',
  exceptional: 'Exceptionnel',
  fog: 'Brouillard',
  hail: 'Risque de grèle',
  lightning: 'Orages',
  'lightning-rainy': 'Pluie orageuse',
  partlycloudy: 'Eclaircies',
  pouring: 'Pluie forte',
  rainy: 'Pluie',
  snowy: 'Neige',
  'snowy-rainy': 'Pluie verglaçante',
  sunny: 'Ensoleillé',
  windy: 'Venteux',
  'windy-variant': 'Venteux variable',
};
export const EXTRA_SENSORS = {
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

export const WEEK_DAYS = [
  {
    long: 'Dimanche',
    short: 'Dim.',
  },
  {
    long: 'Lundi',
    short: 'Lun.',
  },
  {
    long: 'Mardi',
    short: 'Mar.',
  },
  {
    long: 'Mercredi',
    short: 'Mer.',
  },
  {
    long: 'Jeudi',
    short: 'Jeu.',
  },
  {
    long: 'Vendredi',
    short: 'Ven.',
  },
  {
    long: 'Samedi',
    short: 'Sam.',
  },
];
