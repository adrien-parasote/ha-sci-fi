export default {
  id: 'hexa',
  label: '🔷 Hexa Tiles',
  tag: 'sci-fi-hexa-tiles',
  config: {
    type: 'custom:sci-fi-hexa-tiles', header_message: 'Hey, welcome back !', weather: { activate: true, weather_entity: 'weather.la_chapelle_sur_erdre', link: 'weather', state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge', weather_alert_entity: 'sensor.44_weather_alert' }, tiles: [
      { standalone: false, entity_kind: 'light', entities_to_exclude: ['light.la_boite_a_cha_day_ambient_colour', 'light.la_boite_a_cha_night_ambient_colour', 'light.la_boite_a_nard_day_ambient_colour', 'light.la_boite_a_nard_night_ambient_colour'], active_icon: 'mdi:lightbulb-on-outline', inactive_icon: 'mdi:lightbulb', name: 'Lumières', state_on: ['on'], state_error: '', link: 'lights', visibility: ['person.adrien', 'person.virginie', 'person.root'] },
      { standalone: true, active_icon: 'sci:stove-heat', inactive_icon: 'sci:stove-off', name: 'Poêle', state_on: ['cool', 'heat'], state_error: null, link: 'stove', entity: 'climate.clou', visibility: ['person.adrien', 'person.virginie'] },
      { standalone: true, active_icon: 'mdi:robot-vacuum', inactive_icon: 'sci:vacuum-sleep', name: 'Dobby', state_on: ['cleaning', 'returning'], state_error: 'error', link: 'vacuum', entity: 'vacuum.dobby', visibility: ['person.adrien'], entities_to_exclude: [] },
      { standalone: true, active_icon: 'mdi:television-play', inactive_icon: 'mdi:television', name: 'Télévision', state_on: ['on'], state_error: null, link: 'media', entity: 'media_player.bravia_4k_vh22', visibility: ['person.virginie', 'person.adrien'], entities_to_exclude: [] },
      { standalone: false, entity_kind: 'climate', active_icon: 'sci:radiator-heat', inactive_icon: 'sci:radiator-off', name: 'Chauffage', state_on: ['auto', 'heat'], state_error: '', link: 'radiators', entities_to_exclude: ['climate.clou'], visibility: ['person.adrien'] },
      { standalone: true, active_icon: 'sci:landspeeder', inactive_icon: 'sci:landspeeder', name: 'Cars', state_on: ['on'], state_error: null, link: 'vehicles', entity: 'binary_sensor.captur_ii_en_charge', visibility: ['person.adrien'] },
      { entity: 'binary_sensor.eau_active', name: 'Eau', active_icon: 'mdi:water', inactive_icon: 'mdi:water-off', state_on: ['on'], link: 'water-management', standalone: true, visibility: ['person.adrien', 'person.virginie'] },
      { entity_kind: '', entities_to_exclude: [], active_icon: 'mdi:power-plug-outline', inactive_icon: 'mdi:power-plug-off-outline', name: 'Plug', state_on: ['on'], state_error: null, link: 'plug', visibility: ['person.adrien'], standalone: true, entity: 'switch.plugs' },
      { standalone: true, active_icon: 'mdi:water', inactive_icon: 'mdi:water-outline', name: 'Hydro', state_on: ['on'], state_error: null, link: 'water', entity: 'switch.arrosage_terrasse', visibility: ['person.adrien', 'person.virginie'] }
    ]
  },
  scenarios: {
    'Normal': {},
    'Alerte météo JAUNE': {
      'sensor.44_weather_alert': { state: 'Jaune', attributes: { friendly_name: 'Alerte météo 44', vent_violent: 'Jaune', inondation: 'Vert' } }
    },
    'Alerte météo ROUGE': {
      'sensor.44_weather_alert': { state: 'Rouge', attributes: { friendly_name: 'Alerte météo 44', orages: 'Rouge', vent_violent: 'Jaune' } }
    },
    'Dobby en nettoyage': {
      'vacuum.dobby': { state: 'cleaning' }
    },
    'Voiture en charge': {
      'binary_sensor.captur_ii_en_charge': { state: 'on' }
    },
    'Eau active': {
      'binary_sensor.eau_active': { state: 'on' }
    },
  }
};
