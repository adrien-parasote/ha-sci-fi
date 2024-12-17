let now = new Date();

function generateid() {
  let result = ' ';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 26; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class Entity {
  constructor(entity_id, state, attributes = {}) {
    this.entity_id = entity_id;
    this.state = state;
    this.attributes = attributes;
    this.context = {
      id: generateid(),
      parent_id: null,
      user_id: null,
    };
    this.last_changed = now.toISOString();
    this.last_updated = now.toISOString();
  }
}

export class PersonEntity extends Entity {
  constructor(entity_id) {
    const states = ['unknown', 'home'];
    const attributes = {
      editable: true,
      id: entity_id.split('.')[0],
      device_trackers: [],
      user_id: generateid(),
      friendly_name: entity_id.split('.')[1],
      editable: true,
      latitude: 48.8575,
      longitude: 2.3514,
      gps_accuracy: 7,
      entity_picture: '/demo/people.png',
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class LightEntity extends Entity {
  constructor(entity_id, friendly_name) {
    const states = ['on', 'off'];
    const attributes = {
      color_mode: null,
      supported_color_modes: ['onoff'],
      friendly_name: friendly_name,
      supported_features: 0,
      icon: 'mdi:lightbulb-group',
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class ClimateEntity extends Entity {
  constructor(entity_id, friendly_name) {
    const states = ['on', 'off', 'auto'];
    const attributes = {
      hvac_modes: states,
      min_temp: 7,
      max_temp: 35,
      preset_modes: [
        'none',
        'frost_protection',
        'eco',
        'comfort',
        'comfort-1',
        'comfort-2',
        'auto',
        'boost',
        'external',
        'prog',
      ],
      current_temperature: 22,
      temperature: 19,
      preset_mode: 'comfort',
      friendly_name: friendly_name,
      supported_features: 401,
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class ClimateStoveEntity extends Entity {
  constructor(entity_id) {
    const states = ['off', 'heat', 'cool'];
    const attributes = {
      hvac_modes: states,
      min_temp: 7,
      max_temp: 35,
      target_temp_step: 0.1,
      preset_modes: ['none', 'eco'],
      current_temperature: 22,
      temperature: 19,
      preset_mode: 'none',
      friendly_name: 'Stove',
      supported_features: 401,
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class VacuumEntity extends Entity {
  constructor(entity_id) {
    const states = ['cleaning', 'docked', 'returning', 'error', 'idle'];
    const battery_state_values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const battery_state = Math.floor(
      Math.random() * battery_state_values.length
    );
    const attributes = {
      fan_speed_list: ['Silent', 'Standard', 'Medium', 'Turbo'],
      battery_level: battery_state,
      battery_icon: 'mdi:battery-charging-' + battery_state,
      fan_speed: 'Medium',
      status: 'Charging',
      friendly_name: 'Cleaner',
      supported_features: 14204,
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class WeatherEntity extends Entity {
  constructor(entity_id) {
    const states = [
      'clear-night',
      'cloudy',
      'exceptional',
      'fog',
      'hail',
      'lightning',
      'lightning-rainy',
      'partlycloudy',
      'pouring',
      'rainy',
      'snowy',
      'snowy-rainy',
      'sunny',
      'windy',
      'windy-variant',
    ];
    const attributes = {
      temperature: 14.2,
      temperature_unit: '°C',
      humidity: 95,
      pressure: 1015.3,
      pressure_unit: 'hPa',
      wind_bearing: 235,
      wind_speed: 25.2,
      wind_speed_unit: 'km/h',
      visibility_unit: 'km',
      precipitation_unit: 'mm',
      attribution: 'Data provided by Météo-France',
      friendly_name: 'A long City Name',
      supported_features: 3,
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class SunEntity extends Entity {
  constructor(entity_id) {
    const states = ['above_horizon', 'below_horizon'];
    const attributes = {
      next_dawn: '2024-12-15T07:10:37.828926+00:00',
      next_dusk: '2024-12-14T16:52:07.416565+00:00',
      next_midnight: '2024-12-15T00:01:32+00:00',
      next_noon: '2024-12-15T12:01:18+00:00',
      next_rising: '2024-12-15T07:47:03.007119+00:00',
      next_setting: '2024-12-14T16:15:44.366871+00:00',
      elevation: 5.23,
      azimuth: 227.09,
      rising: false,
      friendly_name: 'Sun',
    };
    super(
      entity_id,
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}
