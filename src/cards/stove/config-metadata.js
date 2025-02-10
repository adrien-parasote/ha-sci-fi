export default {
  entity: {
    mandatory: true,
    type: 'string',
    default: '',
  },
  unit: {
    mandatory: false,
    type: 'string',
    default: '°C',
  },
  sensors: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      sensor_actual_power: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_combustion_chamber_temperature: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_inside_temperature: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_pellet_quantity: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_power: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_status: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_fan_speed: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_pressure: {
        mandatory: false,
        type: 'string',
        default: null,
      },
      sensor_time_to_service: {
        mandatory: false,
        type: 'string',
        default: null,
      },
    },
  },
  storage_counter: {
    mandatory: false,
    type: 'string',
    default: null,
  },
  pellet_quantity_threshold: {
    mandatory: false,
    type: 'number',
    default: 0.1,
    range: {
      min: 0,
      max: 1,
    },
  },
  storage_counter_threshold: {
    mandatory: false,
    type: 'number',
    default: 0.1,
    range: {
      min: 0,
      max: 1,
    },
  },
};
