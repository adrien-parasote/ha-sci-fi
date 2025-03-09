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
        mandatory: true,
        type: 'string',
      },
      rear_right_door_status: {
        mandatory: false,
        type: 'string',
        default: '',
      },
      rear_left_door_status: {
        mandatory: true,
        type: 'string',
      },
      driver_door_status: {
        mandatory: true,
        type: 'string',
      },
      passenger_door_status: {
        mandatory: true,
        type: 'string',
      },
      plugged_in: {
        mandatory: true,
        type: 'string',
      },
      lock_status: {
        mandatory: true,
        type: 'string',
      },
      hatch_status: {
        mandatory: true,
        type: 'string',
      },
      location: {
        mandatory: true,
        type: 'string',
      },
      battery_autonomy: {
        mandatory: true,
        type: 'string',
      },
      fuel_autonomy: {
        mandatory: true,
        type: 'string',
      },
      battery_level: {
        mandatory: true,
        type: 'string',
      },
      battery_last_activity: {
        mandatory: true,
        type: 'string',
      },
      location_last_activity: {
        mandatory: true,
        type: 'string',
      },
      charge_state: {
        mandatory: true,
        type: 'string',
      },
      plug_state: {
        mandatory: true,
        type: 'string',
      },
      mileage: {
        mandatory: true,
        type: 'string',
      },
      fuel_quantity: {
        mandatory: true,
        type: 'string',
      },
      charging_remaining_time: {
        mandatory: true,
        type: 'string',
      },
    },
  },
};
