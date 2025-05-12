export default {
  devices: [
    {
      device_id: '4d644238c5ebefb7f11878e790fd9317',
      entity_id: 'switch.nous_lave_linge',
      active_icon: 'mdi:washing-machine',
      inactive_icon: 'mdi:washing-machine-off',
      name: 'Washing machine',
      power_sensor: 'sensor.nous_lave_linge_power',
      child_lock_sensor: 'lock.nous_lave_linge_child_lock',
      power_outage_memory_select: 'select.nous_lave_linge_power_outage_memory',
      others: {},
    },
    {
      device_id: 'a041422639f495ca70ed05e3a74ff183',
      entity_id: 'switch.mureva_evlink',
      name: 'EV plug',
      power_sensor: 'sensor.mureva_evlink_power_corrected',
      others: {},
    },
    {
      device_id: 'f5d95ce6628b0ce1de0e1f97bda58ce7',
      entity_id: 'switch.nous_seche_linge',
      name: 'Dry machine',
      power_sensor: 'sensor.nous_seche_linge_power',
      others: {},
    },
  ],
};
