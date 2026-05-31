export default {
  id: 'vacuum',
  label: '🤖 Vacuum',
  tag: 'sci-fi-vacuum',
  config: {
    type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.dobby', sensors: { battery: 'sensor.s7_batterie', mop_intensite: 'select.s7_intensite_de_frottement', current_clean_area: 'sensor.s7_surface_de_nettoyage', current_clean_duration: 'sensor.s7_duree_de_nettoyage', map: 'image.s7_map_0' }, start: true, pause: true, stop: true, return_to_base: true, shortcuts: { service: 'vacuum.send_command', command: 'app_segment_clean', description: [{ name: 'Bureau', icon: 'mdi:desk-lamp', segments: [16] }, { name: 'Charlotte', icon: 'mdi:teddy-bear', segments: [18] }, { name: 'Mezzanine', icon: 'mdi:stairs', segments: [17] }, { name: 'Léonard', icon: 'mdi:toy-brick-outline', segments: [19] }, { name: 'SdB', icon: 'mdi:bathtub-outline', segments: [20] }] } }]
  },
  scenarios: {
    'Dobby en veille': {},
    'Dobby nettoyage': {
      'vacuum.dobby': { state: 'cleaning' }
    },
    'Dobby qui rentre': {
      'vacuum.dobby': { state: 'returning' }
    },
    'Dobby en erreur': {
      'vacuum.dobby': { state: 'error' }
    },
    'Batterie faible (12%)': {
      'sensor.s7_batterie': { state: '12' }
    },
  }
};
