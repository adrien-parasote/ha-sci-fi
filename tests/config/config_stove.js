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
    sensor_status: 'binary_sensor.clou_stove_status',
    sensor_fan_speed: 'sensor.clou_fan_speed',
    sensor_pressure: 'sensor.clou_pressure',
    sensor_time_to_service: 'sensor.clou_time_to_service',
  },
  storage_counter: 'counter.pellet_stock',
  pellet_quantity_threshold: 0.4,
  storage_counter_threshold: 0.07,
};
