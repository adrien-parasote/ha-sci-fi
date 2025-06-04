export default {
  devices: {
    mandatory: true,
    type: 'array',
    default: [],
    data_type: 'object',
    data: {
      device_id: {
        mandatory: true,
        type: 'string',
        default: null,
      },
      entity_id: {
        mandatory: true,
        type: 'string',
        default: null,
      },
      active_icon: {
        mandatory: false,
        type: 'string',
        default: 'mdi:power-socket-fr',
      },
      inactive_icon: {
        mandatory: false,
        type: 'string',
        default: 'sci:power-socket-fr-off',
      },
      name: {
        mandatory: false,
        type: 'string',
        default: '',
      },

      sensors: {
        type: 'object',
        default: [],
        data_type: 'object',
        data: {
          '*eid*': {
            mandatory: true,
            type: 'object',
            default: {},
            data: {
              name: {
                mandatory: false,
                type: 'string',
                default: '',
              },
              show: {
                mandatory: false,
                type: 'boolean',
                default: false,
              },
              power: {
                mandatory: false,
                type: 'boolean',
                default: false,
              },
            },
          },
        },
      },
    },
  },
};
