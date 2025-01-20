export default {
  unit: '°C',
  entities_to_exclude: ['climate.clou'],
  state_icons: {
    auto: 'sci:radiator-auto',
    off: 'sci:radiator-off',
    heat: 'sci:radiator-heat',
  },
  state_colors: {
    auto: '#69d4fb',
    off: '#6c757d',
    heat: '#ff7f50',
  },
  mode_icons: {
    none: 'mdi:circle-off-outline',
    frost_protection: 'mdi:snowflake',
    eco: 'mdi:leaf',
    comfort: 'mdi:sun-thermometer-outline',
    'comfort-1': 'mdi:sun-thermometer-outline',
    'comfort-2': 'mdi:sun-thermometer-outline',
    auto: 'mdi:thermostat-box-auto',
    boost: 'mdi:fire',
  },
  mode_colors: {
    none: '#6c757d',
    frost_protection: '#acd5f3',
    eco: '#4fe38b',
    comfort: '#fdda0d',
    'comfort-1': '#ffea00',
    'comfort-2': '#ffff8f',
    auto: '#69d4fb',
    boost: '#ff7f50',
  },
};
