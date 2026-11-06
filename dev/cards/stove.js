export default {
  id: 'stove',
  label: '🔥 Stove',
  tag: 'sci-fi-stove',
  config: {
    type: 'custom:sci-fi-stove', sensors: { sensor_combustion_chamber_temperature: 'sensor.salon_clou_combustion_chamber_temperature', sensor_inside_temperature: 'sensor.frient_smoke_detector_salon_temperature', sensor_fan_speed: 'sensor.salon_clou_fan_speed', sensor_pressure: 'sensor.salon_clou_pressure', sensor_actual_power: 'sensor.salon_clou_power', sensor_power: 'sensor.smart_energy_monitor_poele_power', sensor_pellet_quantity: 'sensor.salon_clou_pellet_quantity', sensor_time_to_service: 'sensor.salon_clou_time_to_service', sensor_status: 'sensor.salon_clou_etat_detaille_du_poele', sensor_door: 'binary_sensor.salon_clou_porte', sensor_alert: 'sensor.salon_clou_alerte', sensor_error: 'sensor.salon_clou_erreur', sensor_heating_time: 'sensor.salon_clou_duree_de_combustion', sensor_igniter_starts: 'sensor.salon_clou_demarrages_de_l_allumeur', sensor_misfires: 'sensor.salon_clou_rates_d_allumage', sensor_overheatings: 'sensor.salon_clou_surchauffes' }, pellet_quantity_threshold: 0.3, storage_counter_threshold: 0.1, entity: 'climate.salon_clou_austroflamm_clou_pellet', storage_counter: 'counter.pellet_stock', switch_eco_mode: 'switch.salon_clou_mode_eco', number_power_level: 'number.salon_clou_niveau_de_puissance'
  },
  scenarios: {
    'Poêle en chauffe (combustion)': {
      'sensor.salon_clou_etat_detaille_du_poele': { state: 'combustion' },
      'sensor.salon_clou_combustion_chamber_temperature': { state: '380' },
      'sensor.salon_clou_fan_speed': { state: '4' },
      'sensor.salon_clou_power': { state: '8.5' },
      'sensor.smart_energy_monitor_poele_power': { state: '120' }
    },
    'Poêle en refroidissement (cooling)': {
      'climate.salon_clou_austroflamm_clou_pellet': { state: 'cool', attributes: { hvac_mode: 'cool' } },
      'sensor.salon_clou_etat_detaille_du_poele': { state: 'cooling' },
      'sensor.salon_clou_combustion_chamber_temperature': { state: '85' },
      'sensor.salon_clou_fan_speed': { state: '1' },
      'sensor.salon_clou_power': { state: '0' },
      'sensor.smart_energy_monitor_poele_power': { state: '12' }
    },
    'Démarrage à froid (cold_start)': {
      'sensor.salon_clou_etat_detaille_du_poele': { state: 'cold_start' },
    },
    'Mode éco actif': {
      'sensor.salon_clou_etat_detaille_du_poele': { state: 'eco' },
      'switch.salon_clou_mode_eco': { state: 'on' },
    },
    'Mode éco indisponible': {
      'switch.salon_clou_mode_eco': { state: 'unavailable' },
    },
    'Pellets bas (25%)': {
      'sensor.salon_clou_pellet_quantity': { state: '25' }
    },
    'Pellets critiques (8%)': {
      'sensor.salon_clou_pellet_quantity': { state: '8' }
    },
    'Stock sacs vide (1/20)': {
      'counter.pellet_stock': { state: '1' }
    },
    'Porte ouverte': {
      'binary_sensor.salon_clou_porte': { state: 'on' },
    },
    'Alerte active (pellets bas)': {
      'sensor.salon_clou_alerte': { state: 'low_fuel' },
    },
    'Alerte porte ouverte (fusion porte/alerte)': {
      'binary_sensor.salon_clou_porte': { state: 'on' },
      'sensor.salon_clou_alerte': { state: 'door_open' },
    },
    'Erreur (échec d\'allumage E101)': {
      'sensor.salon_clou_erreur': { state: 'ignition_failure', attributes: { code: 'E101' } },
    },
    'Porte ouverte + erreur': {
      'binary_sensor.salon_clou_porte': { state: 'on' },
      'sensor.salon_clou_erreur': { state: 'ignition_failure', attributes: { code: 'E101' } },
    },
    'Compteurs d\'usure indisponibles': {
      'sensor.salon_clou_duree_de_combustion': { state: 'unavailable' },
      'sensor.salon_clou_demarrages_de_l_allumeur': { state: 'unknown' },
    },
    'Molette puissance indisponible': {
      'number.salon_clou_niveau_de_puissance': { state: 'unavailable' },
    },
    'Poêle éteint': {
      'climate.salon_clou_austroflamm_clou_pellet': { state: 'off', attributes: { hvac_mode: 'off' } },
      'sensor.salon_clou_etat_detaille_du_poele': { state: 'off' },
      'sensor.salon_clou_combustion_chamber_temperature': { state: '22' },
      'sensor.salon_clou_fan_speed': { state: '0' },
      'sensor.salon_clou_power': { state: '0' },
      'sensor.smart_energy_monitor_poele_power': { state: '2' }
    },
  }
};
