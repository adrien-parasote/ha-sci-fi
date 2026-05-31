export default {
  id: 'water',
  label: '💧 Tactical Water',
  tag: 'sci-fi-water-management',
  config: {
    type: 'custom:sci-fi-water-management',
    header_message: 'Water Management',
    filter_label: 'water',
    first_floor_to_render: 'Extérieur',
    ignored_entities: [
      'sensor.0x4c97a1fffeefd20f_linkquality'
    ]
  },
  scenarios: {
    'Normal': {},
    'En Arrosage': {
      'switch.arrosage_terrasse': { state: 'on' },
      'switch.arrosage_haie': { state: 'on' }
    },
  }
};
