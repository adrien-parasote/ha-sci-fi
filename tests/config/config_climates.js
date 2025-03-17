export default {
  entities_to_exclude: ['climate.clou'],
  header: {
    display: true,
    icon_winter_state: 'mdi:thermometer-chevron-up',
    message_winter_state: 'Winter is coming',
    icon_summer_state: 'mdi:thermometer-chevron-down',
    message_summer_state: 'Summer time',
  },
  state_icons: {
    auto: 'sci:radiator-auto',
    off: 'sci:radiator-off',
    heat: 'sci:radiator-heat',
  },
  state_colors: {
    auto: '#669cd2',
    off: '#6c757d',
    heat: '#ff7f50',
  },
  mode_icons: {
    frost_protection: 'mdi:snowflake',
    eco: 'mdi:leaf',
    comfort: 'mdi:sun-thermometer-outline',
    'comfort-1': 'mdi:sun-thermometer-outline',
    'comfort-2': 'mdi:sun-thermometer-outline',
    boost: 'mdi:fire',
  },
  mode_colors: {
    frost_protection: '#acd5f3',
    eco: '#4fe38b',
    comfort: '#fdda0d',
    'comfort-1': '#ffea00',
    'comfort-2': '#ffff8f',
    boost: '#ff7f50',
  },
};
