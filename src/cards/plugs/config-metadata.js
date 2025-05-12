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
      power_sensor: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      child_lock_sensor: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      power_outage_memory_select: {
        mandatory: false,
        type: 'string',
        default: '',
      },
    },
  },
};
