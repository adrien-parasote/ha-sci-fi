export default {
  id: 'climates',
  label: '🌡️ Climates',
  tag: 'sci-fi-climates',
  config: {
    type: 'custom:sci-fi-climates', header: { icon_winter_state: 'mdi:thermometer-chevron-up', message_winter_state: 'Winter is coming', icon_summer_state: 'mdi:thermometer-chevron-down', message_summer_state: 'Summer time', display: false }, entities_to_exclude: ['climate.clou'], state_icons: { auto: 'mdi:thermostat-auto', 'off': 'mdi:thermostat', heat: 'mdi:fire' }, state_colors: { auto: '#69d4fb', 'off': '#6c757d', heat: '#ff7f50' }, mode_icons: { frost_protection: 'mdi:snowflake', eco: 'mdi:leaf', comfort: 'mdi:sun-thermometer-outline', 'comfort-1': 'mdi:sun-thermometer-outline', 'comfort-2': 'mdi:sun-thermometer-outline', boost: 'mdi:rocket-launch-outline' }, mode_colors: { frost_protection: '#acd5f3', eco: '#96d35f', comfort: '#ffff8f', 'comfort-1': '#ffff8f', 'comfort-2': '#ffff8f', boost: '#ff3a30' }
  },
  scenarios: {
    'Hiver — chauffage actif': {
      'climate.radiateur_chambre': { state: 'auto', attributes: { hvac_mode: 'auto', preset_mode: 'eco', temperature: 18 } }
    },
    'Tout mode éco': {
      'climate.radiateur_salon': { state: 'auto', attributes: { preset_mode: 'eco', hvac_mode: 'auto' } },
      'climate.radiateur_salon_2': { state: 'auto', attributes: { preset_mode: 'eco', hvac_mode: 'auto' } },
      'climate.radiateur_cuisine': { state: 'auto', attributes: { preset_mode: 'eco', hvac_mode: 'auto' } },
      'climate.radiateur_bureau': { state: 'auto', attributes: { preset_mode: 'eco', hvac_mode: 'auto' } }
    },
    'Mode boost (salon)': {
      'climate.radiateur_salon': { attributes: { preset_mode: 'boost', temperature: 25 } }
    },
    'Tout hors gel': {
      'climate.radiateur_salon': { state: 'off', attributes: { hvac_mode: 'off', preset_mode: 'frost_protection', temperature: null } },
      'climate.radiateur_salon_2': { state: 'off', attributes: { hvac_mode: 'off', preset_mode: 'frost_protection', temperature: null } },
      'climate.radiateur_cuisine': { state: 'off', attributes: { hvac_mode: 'off', preset_mode: 'frost_protection', temperature: null } },
      'climate.radiateur_bureau': { state: 'off', attributes: { hvac_mode: 'off', preset_mode: 'frost_protection', temperature: null } },
      'climate.radiateur_chambre': { state: 'off', attributes: { hvac_mode: 'off', preset_mode: 'frost_protection', temperature: null } }
    },
  }
};
