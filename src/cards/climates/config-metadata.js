export default {
  entities_to_exclude: {
    mandatory: false,
    type: 'array',
    default: [],
    data_type: 'string',
  },
  header: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      display: {
        mandatory: false,
        type: 'boolean',
        default: false,
      },
      icon_winter_state: {
        mandatory: false,
        type: 'string',
        default: 'mdi:thermometer-chevron-up',
      },
      message_winter_state: {
        mandatory: false,
        type: 'string',
        default: 'Winter is coming',
      },
      icon_summer_state: {
        mandatory: false,
        type: 'string',
        default: 'mdi:thermometer-chevron-down',
      },
      message_summer_state: {
        mandatory: false,
        type: 'string',
        default: 'Summer time',
      },
    },
  },
  state_icons: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      auto: {
        mandatory: false,
        type: 'string',
        default: 'sci:radiator-auto',
      },
      off: {
        mandatory: false,
        type: 'string',
        default: 'sci:radiator-off',
      },
      heat: {
        mandatory: false,
        type: 'string',
        default: 'sci:radiator-heat',
      },
    },
  },
  state_colors: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      auto: {
        mandatory: false,
        type: 'string',
        default: '#669cd2',
      },
      off: {
        mandatory: false,
        type: 'string',
        default: '#6c757d',
      },
      heat: {
        mandatory: false,
        type: 'string',
        default: '#ff7f50',
      },
    },
  },
  mode_icons: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      frost_protection: {
        mandatory: false,
        type: 'string',
        default: 'mdi:snowflake',
      },
      eco: {
        mandatory: false,
        type: 'string',
        default: 'mdi:leaf',
      },
      comfort: {
        mandatory: false,
        type: 'string',
        default: 'mdi:sun-thermometer-outline',
      },
      'comfort-1': {
        mandatory: false,
        type: 'string',
        default: 'mdi:sun-thermometer-outline',
      },
      'comfort-2': {
        mandatory: false,
        type: 'string',
        default: 'mdi:sun-thermometer-outline',
      },
      boost: {
        mandatory: false,
        type: 'string',
        default: 'mdi:fire',
      },
    },
  },
  mode_colors: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      frost_protection: {
        mandatory: false,
        type: 'string',
        default: '#acd5f3',
      },
      eco: {
        mandatory: false,
        type: 'string',
        default: '#4fe38b',
      },
      comfort: {
        mandatory: false,
        type: 'string',
        default: '#fdda0d',
      },
      'comfort-1': {
        mandatory: false,
        type: 'string',
        default: '#ffea00',
      },
      'comfort-2': {
        mandatory: false,
        type: 'string',
        default: '#ffff8f',
      },
      boost: {
        mandatory: false,
        type: 'string',
        default: '#ff7f50',
      },
    },
  },
};
