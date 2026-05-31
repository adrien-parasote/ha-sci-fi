export default {
  id: 'weather',
  label: '⛅ Weather',
  tag: 'sci-fi-weather',
  config: {
    type: 'custom:sci-fi-weather', weather_entity: 'weather.la_chapelle_sur_erdre', weather_hourly_forecast_limit: 24, weather_daily_forecast_limit: 10, alert: { state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge', entity_id: 'sensor.44_weather_alert' }
  },
  scenarios: {
    'Partiellement nuageux': {},
    'Pluie + alerte jaune': {
      'weather.la_chapelle_sur_erdre': { state: 'rainy', attributes: { temperature: 14, humidity: 89, wind_speed: 32 } },
      'sensor.44_weather_alert': { state: 'Jaune', attributes: { friendly_name: 'Alerte météo 44', vent_violent: 'Jaune', inondation: 'Vert' } }
    },
    'Grand soleil': {
      'weather.la_chapelle_sur_erdre': { state: 'sunny', attributes: { temperature: 28, humidity: 45, wind_speed: 8 } }
    },
    'Orage + alerte rouge': {
      'weather.la_chapelle_sur_erdre': { state: 'lightning-rainy' },
      'sensor.44_weather_alert': { state: 'Rouge', attributes: { friendly_name: 'Alerte météo 44', orages: 'Rouge', vent_violent: 'Jaune' } }
    },
  }
};
