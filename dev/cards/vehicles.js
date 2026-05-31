export default {
  id: 'vehicles',
  label: '🚗 Vehicles',
  tag: 'sci-fi-vehicles',
  config: {
    type: 'custom:sci-fi-vehicles', vehicles: [{ id: 'b35bbd24dc8783e010d0d9da45678554', name: 'Captur II', charging: 'binary_sensor.captur_ii_en_charge', lock_status: 'binary_sensor.captur_ii_serrure', location: 'device_tracker.captur_ii_emplacement', battery_autonomy: 'sensor.captur_ii_autonomie_de_la_batterie', fuel_autonomy: 'sensor.captur_ii_autonomie_en_carburant', battery_level: 'sensor.captur_ii_batterie', location_last_activity: '', charge_state: '', plug_state: 'sensor.captur_ii_etat_du_branchement', mileage: 'sensor.captur_ii_kilometrage', fuel_quantity: 'sensor.captur_ii_quantite_de_carburant', charging_remaining_time: 'sensor.captur_ii_temps_de_charge_restant' }]
  },
  scenarios: {
    'À la maison, déchargé': {},
    'En charge électrique': {
      'binary_sensor.captur_ii_en_charge': { state: 'on' },
      'sensor.captur_ii_temps_de_charge_restant': { state: '45' }
    },
    'Batterie faible (18%)': {
      'sensor.captur_ii_batterie': { state: '18' }
    },
    'Voiture déverrouillée': {
      'binary_sensor.captur_ii_serrure': { state: 'unlocked' }
    },
  }
};
