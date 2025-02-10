export default {
  weather_entity: {
    mandatory: true,
    type: 'string',
    default: '',
  },
  weather_daily_forecast_limit: {
    mandatory: true,
    type: 'number',
    default: 10,
    range: {
      min: 0,
      max: 15,
    },
  },
  chart_first_kind_to_render: {
    mandatory: false,
    type: 'string',
    default: 'temperature',
  },
  alert: {
    mandatory: false,
    type: 'object',
    default: {},
    data: {
      entity_id: {
        mandatory: true,
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
};
