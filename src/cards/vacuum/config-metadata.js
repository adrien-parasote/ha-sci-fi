export default {
  entity: {
    mandatory: true,
    type: 'string',
    default: '',
  },
  start: {
    mandatory: false,
    type: 'Boolean',
    default: true,
  },
  pause: {
    mandatory: false,
    type: 'Boolean',
    default: true,
  },
  stop: {
    mandatory: false,
    type: 'Boolean',
    default: true,
  },
  return_to_base: {
    mandatory: false,
    type: 'Boolean',
    default: true,
  },
  set_fan_speed: {
    mandatory: false,
    type: 'Boolean',
    default: true,
  },
  sensors: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      camera: {
        mandatory: false,
        type: 'string',
        default: '',
      },
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
        mandatory: false,
        type: 'string',
        default: null,
      },
      description: {
        mandatory: false,
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
