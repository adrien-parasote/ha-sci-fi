export default {
  entity: {
    mandatory: true,
    type: 'string',
    default: '',
  },
  start: {
    mandatory: true,
    type: 'Boolean',
    default: true,
  },
  pause: {
    mandatory: true,
    type: 'Boolean',
    default: true,
  },
  stop: {
    mandatory: true,
    type: 'Boolean',
    default: true,
  },
  return_to_base: {
    mandatory: true,
    type: 'Boolean',
    default: true,
  },
  set_fan_speed: {
    mandatory: true,
    type: 'Boolean',
    default: true,
  },
  sensors: {
    mandatory: true,
    type: 'object',
    default: {},
    data: {
      current_clean_area: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      current_clean_duration: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      last_clean_area: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      last_clean_duration: {
        mandatory: false,
        type: 'string',
        default: null,
      },
    },
  },
  shortcuts: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      service: {
        mandatory: true,
        type: 'string',
        default: null,
      },
      description: {
        mandatory: true,
        type: 'array',
        default: [],
        data_type: 'object',
        data: {
          icon: {
            mandatory: false,
            type: 'string',
            default: 'mdi:broom',
          },
          name: {
            mandatory: true,
            type: 'string',
            default: '',
          },
          segments: {
            mandatory: true,
            type: 'array',
            default: [],
            data_type: 'number',
          },
        },
      },
    },
  },
};
