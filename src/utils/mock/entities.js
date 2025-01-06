import {
  NOW,
  WEATHER_STATES,
  generateid,
  getStrDatetime,
  nameToId,
} from './utils';

class Entity {
  static kind = '';
  constructor(entity_id, device_id, icon, platform, name) {
    this.entity_id = entity_id;
    this.device_id = device_id;
    this.labels = [];
    this.platform = '';
    this.icon = icon;
    this.platform = platform;
    this.name = name;
  }
}

class EntityState {
  constructor(entity_id, state, attributes = {}) {
    this.entity_id = entity_id;
    this.state = state;
    this.attributes = attributes;
    this.context = {
      id: generateid(),
      parent_id: null,
      user_id: null,
    };
    this.last_changed = NOW.toISOString();
    this.last_updated = NOW.toISOString();
  }

  __getPlateform() {
    return this.entity_id.split('.')[0];
  }

  getEntity(device_id) {
    return new Entity(
      this.entity_id,
      device_id,
      this.attributes.icon,
      this.__getPlateform(),
      this.attributes.friendly_name
    );
  }
}

export class PersonEntity extends EntityState {
  static kind = 'person';

  constructor(friendly_name) {
    const states = ['unknown', 'home'];
    const attributes = {
      editable: true,
      id: PersonEntity.kind,
      device_trackers: [],
      user_id: generateid(),
      friendly_name: friendly_name,
      editable: true,
      latitude: 48.8575,
      longitude: 2.3514,
      gps_accuracy: 7,
      entity_picture: '/demo/people.png',
    };
    super(
      nameToId(PersonEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class LightEntity extends EntityState {
  static kind = 'light';

  constructor(friendly_name) {
    const states = ['on', 'off'];
    const attributes = {
      color_mode: null,
      supported_color_modes: ['onoff'],
      friendly_name: friendly_name,
      supported_features: 0,
      icon: 'mdi:lightbulb-on-outline',
    };
    super(
      nameToId(LightEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class ClimateEntity extends EntityState {
  static kind = 'climate';

  constructor(friendly_name) {
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
      nameToId(ClimateEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class ClimateStoveEntity extends EntityState {
  static kind = 'climate';

  constructor(friendly_name) {
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
      friendly_name: friendly_name,
      supported_features: 401,
    };
    super(
      nameToId(ClimateEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class VacuumEntity extends EntityState {
  static kind = 'vacuum';

  constructor(friendly_name) {
    const states = ['cleaning', 'docked', 'returning', 'error', 'idle'];
    const selected_state = states[Math.floor(Math.random() * states.length)];
    const battery_state_values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const battery_state = Math.floor(
      Math.random() * battery_state_values.length
    );
    const attributes = {
      fan_speed_list: ['Silent', 'Standard', 'Medium', 'Turbo'],
      battery_level: battery_state,
      battery_icon: 'mdi:battery-charging-' + battery_state,
      fan_speed: 'Medium',
      status: selected_state,
      friendly_name: friendly_name,
      supported_features: 14204,
    };
    super(
      nameToId(VacuumEntity.kind, friendly_name),
      selected_state,
      attributes
    );
  }
}

export class WeatherEntity extends EntityState {
  static kind = 'weather';

  constructor(friendly_name) {
    const states = WEATHER_STATES;
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
      friendly_name: friendly_name,
      supported_features: 3,
    };
    super(
      nameToId(WeatherEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}

export class SunEntity extends EntityState {
  static kind = 'sun';

  constructor(friendly_name) {
    let next_rising = new Date(NOW);
    let next_setting = new Date(NOW);

    if (next_rising.getHours() > 9) {
      next_rising.setDate(next_rising.getDate() + 1);
    }
    next_rising.setHours(8);
    next_rising.setMinutes(50);

    if (next_setting.getHours() > 21) {
      next_setting.setDate(next_setting.getDate() + 1);
    }
    next_setting.setHours(20);
    next_setting.setMinutes(50);

    const states = ['above_horizon', 'below_horizon'];
    const attributes = {
      next_dawn: '2024-12-15T07:10:37.828926+00:00',
      next_dusk: '2024-12-14T16:52:07.416565+00:00',
      next_midnight: '2024-12-15T00:01:32+00:00',
      next_noon: '2024-12-15T12:01:18+00:00',
      next_rising: getStrDatetime(next_rising, true),
      next_setting: getStrDatetime(next_setting, true),
      elevation: 5.23,
      azimuth: 227.09,
      rising: false,
      friendly_name: friendly_name,
    };
    super(
      nameToId(SunEntity.kind, friendly_name),
      states[Math.floor(Math.random() * states.length)],
      attributes
    );
  }
}
