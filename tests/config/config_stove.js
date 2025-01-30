export default {
  entity: 'climate.clou',
  unit: '°C',
  sensors: {
    sensor_actual_power: 'sensor.clou_actual_power',
    sensor_combustion_chamber_temperature:
      'sensor.clou_combustion_chamber_temperature',
    sensor_inside_temperature: 'sensor.clou_inside_temperature',
    sensor_pellet_quantity: 'sensor.clou_pellet_quantity',
    sensor_power: 'sensor.clou_power_2',
  },
  storage_counter: 'counter.pellet_stock',
  pellet_quantity_threshold: 0.4,
  storage_counter_threshold: 0.07,
};
