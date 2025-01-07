import {Device} from './devices.js';
import {
  ClimateStoveEntity,
  PersonEntity,
  SunEntity,
  VacuumEntity,
  WeatherEntity,
} from './entities.js';
import {Area, Floor} from './floors.js';
import {HOUSE} from './house.js';
import {buildForecast, getWeatherSensors} from './weather_forecast.js';

const CITY_NAME = 'A long-long city name';

class Hass {
  // Private
  _counters = {};

  constructor() {
    this.__build();
    // Add services & connected user
    this.callService = this.__callService;
    this.user = this._mockConnectedUser('person.punk1');
  }

  __callService(service, action, data) {
    if (service == 'weather' && action == 'get_forecasts') {
      let res = {};
      res[data.target.entity_id] = {
        forecast:
          data.data.type == 'daily'
            ? buildForecast(false)
            : buildForecast(true),
      };
      return res;
    } else {
      console.log(service, action, data);
    }
  }

  __build() {
    // Define elements
    this.states = {};
    this.devices = {};
    this.entities = {};
    this.floors = {};
    this.areas = {};
    // Build them
    HOUSE.map((floor) => {
      floor.areas.map((area) => {
        // Create area entities counter
        this._counters[area.name] = {};
        // Create area linked devices
        area.devices.map((deviceCls) => {
          // Create device friendly name
          const device_king = deviceCls.kind;
          // Define friendly name
          let counter = this._counters[area.name][device_king]
            ? this._counters[area.name][device_king]
            : 0;

          let friendly_name = '';
          switch (deviceCls) {
            case ClimateStoveEntity:
              friendly_name = 'Stove';
              break;
            case VacuumEntity:
              friendly_name = 'Cleaner';
              break;
            default:
              friendly_name = [
                device_king.charAt(0).toUpperCase() + device_king.slice(1),
                area.name.toLowerCase(),
                counter,
              ].join(' ');
              this._counters[area.name][device_king] = counter + 1;
              break;
          }
          // Create device
          const device = new Device(area.id, friendly_name);
          // Create entity state and get linked entity
          const entity_state = new deviceCls(friendly_name);
          const entity = entity_state.getEntity(device.id);
          // Add elements
          this.devices[device.id] = device;
          this.entities[entity_state.entity_id] = entity;
          this.states[entity_state.entity_id] = entity_state;
        });
        // Add Area
        this.areas[area.id] = new Area(area.id, floor.id, area.icon, area.name);
      });
      // Add Floor
      this.floors[floor.id] = new Floor(
        floor.id,
        floor.icon,
        floor.level,
        floor.name
      );
    });

    // Build person entities
    ['root', 'punk1', 'punk2'].map((friendly_name) => {
      // Create entity
      const entity_state = new PersonEntity(friendly_name);
      const entity = entity_state.getEntity(null);
      // Add elements
      this.entities[entity_state.entity_id] = entity;
      this.states[entity_state.entity_id] = entity_state;
    });

    // Build sun & weather entities
    [new WeatherEntity(CITY_NAME), new SunEntity('Sun')].map((entity_state) => {
      const entity = entity_state.getEntity(null);
      this.entities[entity_state.entity_id] = entity;
      this.states[entity_state.entity_id] = entity_state;
    });

    // Build weather sensors
    Object.entries(getWeatherSensors(CITY_NAME)).map(([id, sensor]) => {
      this.states[id] = sensor;
    });
  }

  _mockConnectedUser(id) {
    return {
      id: this.states[id].attributes.user_id,
      name: this.states[id].attributes.friendly_name,
      is_owner: false,
      is_admin: true,
      credentials: [
        {
          auth_provider_type: 'homeassistant',
          auth_provider_id: null,
        },
      ],
      mfa_modules: [
        {
          id: 'totp',
          name: 'Authenticator app',
          enabled: false,
        },
      ],
    };
  }
}

export const hass = new Hass();
