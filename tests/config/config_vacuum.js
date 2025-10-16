export default {
  entity: 'vacuum.dobby',
  sensors: {
    current_clean_area: 'sensor.dobby_current_clean_area',
    current_clean_duration: 'sensor.dobby_current_clean_duration',
    last_clean_area: 'sensor.dobby_last_clean_area',
    last_clean_duration: 'sensor.dobby_last_clean_duration',
    camera: 'camera.dobby_live_map',
  },
  start: true,
  pause: false,
  stop: true,
  return_to_base: true,
  set_fan_speed: true,
  shortcuts: {
    service: 'xiaomi_miio.vacuum_clean_segment',
    description: [
      {
        name: 'Kitchen',
        icon: 'mdi:silverware-fork-knife',
        segments: [2],
      },
      {
        name: 'Entry',
        icon: 'mdi:door',
        segments: [1],
      },
      {
        name: 'Daily',
        icon: 'mdi:broom',
        segments: [1, 2],
      },
    ],
  },
};
