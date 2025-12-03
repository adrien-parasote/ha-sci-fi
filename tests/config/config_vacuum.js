export default {
  vacuums: [
    {
      entity: 'vacuum.dobby',
      sensors: {
        battery: 'sensor.s7_batterie',
        mop_intensite: 'select.s7_intensite_de_frottement',
        current_clean_area: 'sensor.s7_surface_de_nettoyage',
        current_clean_duration: 'sensor.s7_duree_de_nettoyage',
        map: 'image.s7_map_0',
      },
      start: true,
      pause: false,
      stop: true,
      return_to_base: true,
      set_fan_speed: true,
      shortcuts: {
        service: 'vacuum.send_command',
        command: 'app_segment_clean',
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
    },
  ],
};
