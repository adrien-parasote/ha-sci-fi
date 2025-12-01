export default {
  entity: 'vacuum.dobby',
  sensors: {
    current_clean_area: 'sensor.s7_surface_de_nettoyage',
    current_clean_duration: 'sensor.s7_duree_de_nettoyage',
    camera: 'image.s7_map_0',
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
        segments: [16],
      },
      {
        name: 'Entry',
        icon: 'mdi:door',
        segments: [18],
      },
      {
        name: 'Corridor',
        icon: 'mdi:shoe-formal',
        segments: [17],
      },
      {
        name: 'Living room',
        icon: 'mdi:door',
        segments: [19],
      },
      {
        name: 'Parent bedroom',
        icon: 'mdi:bed-double-outline',
        segments: [20],
      },
    ],
  },
};
