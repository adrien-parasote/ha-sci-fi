export default {
  vehicles: {
    mandatory: false,
    type: 'array',
    default: [],
    data_type: 'object',
    data: {
      name: {
        mandatory: true,
        type: 'string',
      },
      charging: {
        mandatory: false,
        type: 'string',
      },
      lock_status: {
        mandatory: false,
        type: 'string',
      },
      location: {
        mandatory: false,
        type: 'string',
      },
      battery_autonomy: {
        mandatory: false,
        type: 'string',
      },
      fuel_autonomy: {
        mandatory: false,
        type: 'string',
      },
      battery_level: {
        mandatory: false,
        type: 'string',
      },
      location_last_activity: {
        mandatory: false,
        type: 'string',
      },
      charge_state: {
        mandatory: false,
        type: 'string',
      },
      plug_state: {
        mandatory: false,
        type: 'string',
      },
      mileage: {
        mandatory: false,
        type: 'string',
      },
      fuel_quantity: {
        mandatory: false,
        type: 'string',
      },
      charging_remaining_time: {
        mandatory: false,
        type: 'string',
      },
    },
  },
};
