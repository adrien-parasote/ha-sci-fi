export default {
  vehicles: [
    {
      name: 'Car N°1',
      charging: 'binary_sensor.captur_ii_en_charge',
      rear_left_door_status: 'binary_sensor.captur_ii_porte_arriere_gauche',
      driver_door_status: 'binary_sensor.captur_ii_porte_conducteur',
      passenger_door_status: 'binary_sensor.captur_ii_porte_passager',
      plugged_in: 'binary_sensor.captur_ii_prise',
      lock_status: 'binary_sensor.captur_ii_serrure',
      hatch_status: 'binary_sensor.captur_ii_trappe',
      location: 'device_tracker.captur_ii_emplacement',
      battery_autonomy: 'sensor.captur_ii_autonomie_de_la_batterie',
      fuel_autonomy: 'sensor.captur_ii_autonomie_en_carburant',
      battery_level: 'sensor.captur_ii_batterie',
      battery_last_activity:
        'sensor.captur_ii_derniere_activite_de_la_batterie',
      location_last_activity:
        'sensor.captur_ii_derniere_activite_de_localisation',
      battery_available_energy:
        'sensor.captur_ii_energie_disponible_de_la_batterie',
      charge_state: 'sensor.captur_ii_etat_de_charge',
      plug_state: 'sensor.captur_ii_etat_du_branchement',
      mileage: 'sensor.captur_ii_kilometrage',
      fuel_quantity: 'sensor.captur_ii_quantite_de_carburant',
      battery_temperature: 'sensor.captur_ii_temperature_de_la_batterie',
      charging_remaining_time: 'sensor.captur_ii_temps_de_charge_restant',
    },
  ],
};
