export default {
  header_message: {
    mandatory: false,
    type: 'string',
    default: '',
  },
  weather: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      activate: {
        mandatory: false,
        type: 'boolean',
        default: false,
      },
      weather_entity: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      link: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      weather_alert_entity: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      state_green: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      state_yellow: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      state_orange: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      state_red: {
        mandatory: false,
        type: 'string',
        default: null,
      },
    },
  },
  tiles: {
    mandatory: false,
    type: 'array',
    default: [],
    data_type: 'object',
    data: {
      standalone: {
        mandatory: false,
        type: 'boolean',
        default: false,
      },
      entity: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      entity_kind: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      entities_to_exclude: {
        mandatory: false,
        type: 'array',
        default: [],
        data_type: 'string',
      },
      active_icon: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      inactive_icon: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      name: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      state_on: {
        mandatory: false,
        type: 'array',
        default: [],
        data_type: 'string',
      },
      state_error: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      link: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      visibility: {
        mandatory: false,
        type: 'array',
        default: [],
        data_type: 'string',
      },
    },
  },
};
