export default {
  id: 'stove',
  label: '🔥 Stove',
  tag: 'sci-fi-stove',
  config: {
    type: 'custom:sci-fi-stove', sensors: { sensor_combustion_chamber_temperature: 'sensor.clou_combustion_chamber_temperature', sensor_inside_temperature: 'sensor.frient_smoke_detector_salon_temperature', sensor_fan_speed: 'sensor.clou_fan_speed', sensor_pressure: 'sensor.clou_pressure', sensor_actual_power: 'sensor.clou_power', sensor_power: 'sensor.smart_energy_monitor_poele_power', sensor_pellet_quantity: 'sensor.clou_pellet_quantity', sensor_time_to_service: 'sensor.clou_time_to_service', sensor_status: 'binary_sensor.clou_stove_status' }, pellet_quantity_threshold: 0.3, storage_counter_threshold: 0.1, entity: 'climate.clou', storage_counter: 'counter.pellet_stock'
  },
  scenarios: {
    'Poêle en chauffe (combustion)': {
      'binary_sensor.clou_stove_status': { state: 'combustion' },
      'sensor.clou_combustion_chamber_temperature': { state: '380' },
      'sensor.clou_fan_speed': { state: '4' },
      'sensor.clou_power': { state: '8.5' },
      'sensor.smart_energy_monitor_poele_power': { state: '120' }
    },
    'Poêle en refroidissement (cooling)': {
      'climate.clou': { state: 'cool', attributes: { hvac_mode: 'cool' } },
      'binary_sensor.clou_stove_status': { state: 'cooling' },
      'sensor.clou_combustion_chamber_temperature': { state: '85' },
      'sensor.clou_fan_speed': { state: '1' },
      'sensor.clou_power': { state: '0' },
      'sensor.smart_energy_monitor_poele_power': { state: '12' }
    },
    'Pellets bas (25%)': {
      'sensor.clou_pellet_quantity': { state: '25' }
    },
    'Pellets critiques (8%)': {
      'sensor.clou_pellet_quantity': { state: '8' }
    },
    'Stock sacs vide (1/20)': {
      'counter.pellet_stock': { state: '1' }
    },
    'Poêle éteint': {
      'climate.clou': { state: 'off', attributes: { hvac_mode: 'off' } },
      'binary_sensor.clou_stove_status': { state: 'off' },
      'sensor.clou_combustion_chamber_temperature': { state: '22' },
      'sensor.clou_fan_speed': { state: '0' },
      'sensor.clou_power': { state: '0' },
      'sensor.smart_energy_monitor_poele_power': { state: '2' }
    },
  }
};
