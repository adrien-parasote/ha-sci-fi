export default {
  header_message: {
    mandatory: false,
    type: 'string',
    default: 'Lights',
  },
  default_icon_on: {
    mandatory: false,
    type: 'string',
    default: 'mdi:lightbulb-on-outline',
  },
  default_icon_off: {
    mandatory: false,
    type: 'string',
    default: 'mdi:lightbulb-outline',
  },
  first_floor_to_render: {
    mandatory: false,
    type: 'string',
    default: null,
  },
  first_area_to_render: {
    mandatory: false,
    type: 'string',
    default: null,
  },
  custom_entities: {
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
          icon_on: {
            mandatory: false,
            type: 'string',
            default: 'mdi:lightbulb-on-outline',
          },
          icon_off: {
            mandatory: false,
            type: 'string',
            default: 'mdi:lightbulb-outline',
          },
        },
      },
    },
  },
};
