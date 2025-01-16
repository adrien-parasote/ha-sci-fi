export default {
  weather_entity: 'weather.la_chapelle_sur_erdre',
  sensor_weather_alert: null,
  weather_hourly_forecast_limit: 24,
  weather_daily_forecast_limit: 15,
  alert: {
    entity_id: 'sensor.44_weather_alert',
    state_green: 'Vert',
    state_yellow: 'Jaune',
    state_orange: 'Orange',
    state_red: 'Rouge',
  },
};
