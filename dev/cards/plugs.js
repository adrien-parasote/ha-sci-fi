export default {
  id: 'plugs',
  label: '🔌 Plugs',
  tag: 'sci-fi-plugs',
  config: {
    type: 'custom:sci-fi-plugs', devices: [
      { device_id: '31428114e049a5557c8a8a05e2b7f9bd', entity_id: 'switch.nous_ventilateur_leonard', active_icon: 'mdi:fan', inactive_icon: 'mdi:fan-off', name: 'Ventilateur Léonard', sensors: { 'number.nous_ventilateur_leonard_countdown': { show: true, name: 'Countdown', icon: 'mdi:ray-vertex', power: false }, 'select.nous_ventilateur_leonard_power_outage_memory': { show: true, name: 'Power outage memory', power: false }, 'sensor.nous_ventilateur_leonard_power': { show: false, name: 'Puissance', power: true }, 'switch.nous_ventilateur_leonard_child_lock': { show: true, name: 'Child lock', icon: 'mdi:account-lock', power: false }, 'sensor.nous_ventilateur_leonard_energy': { show: true, name: 'Énergie', icon: 'mdi:lightning-bolt', power: false } } },
      {
        device_id: 'a041422639f495ca70ed05e3a74ff183', entity_id: 'switch.mureva_evlink', active_icon: 'sci:landspeeder-plugged', inactive_icon: 'sci:landspeeder-plugged-off', name: 'EvLink', sensors: {
          'sensor.mureva_evlink_energy_corrected': { show: true, name: 'Energy corrected', icon: 'mdi:lightning-bolt', power: false },
          'sensor.mureva_evlink_power_corrected': { show: false, name: 'Puissance corrected', power: true },
          'binary_sensor.mureva_evlink_charge': { show: true, name: 'Charge', icon: 'mdi:stop', power: false },
          'sensor.mureva_evlink_current': { show: true, name: 'Courant', power: false },
          'select.mureva_evlink_power_on_behavior': { show: true, name: 'Power-on behavior', icon: 'mdi:power-settings', power: false },
        }
      },
      {
        device_id: '7ae536ffff7d2371aadcdbc90750108d', entity_id: 'switch.nous_paillette_charlotte', active_icon: 'mdi:lava-lamp', inactive_icon: 'mdi:lava-lamp', name: 'Paillette Charlotte', sensors: {
          'sensor.nous_paillette_charlotte_power': { show: false, name: 'Puissance', power: true },
          'sensor.nous_paillette_charlotte_energy': { show: true, name: 'Energy', icon: 'mdi:lightning-bolt', power: false },
          'switch.nous_paillette_charlotte_child_lock': { show: true, name: 'Child lock', icon: 'mdi:account-lock', power: false },
          'select.nous_paillette_charlotte_power_outage_memory': { show: true, name: 'Power outage memory', icon: 'mdi:power-settings', power: false },
        }
      }
    ]
  },
  scenarios: {
    'Normal': {},
    'Ventilo OFF': {
      'switch.nous_ventilateur_leonard': { state: 'off' }
    },
    'EvLink en charge': {
      'switch.mureva_evlink': { state: 'on' },
      'binary_sensor.mureva_evlink_charge': { state: 'on' },
      'sensor.mureva_evlink_current': { state: '16' },
      'sensor.mureva_evlink_power_corrected': { state: '3600' }
    },
  }
};
