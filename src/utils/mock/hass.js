/****** DEV HASS *******/
import {
  ClimateEntity,
  ClimateStoveEntity,
  LightEntity,
  PersonEntity,
  SunEntity,
  VacuumEntity,
  WeatherEntity,
} from './entities.js';

class Hass {
  constructor() {
    this.callService = function (service, action, data) {
      console.log(service, action, data);
    };
    this.states = this._mockStates();
    this.user = this._mockConnectedUser('person.punk1');
  }

  _mockPersons() {
    return Object.fromEntries(
      ['person.root', 'person.punk1', 'person.punk2'].map((person) => {
        return [person, new PersonEntity(person)];
      })
    );
  }

  _mockClimates() {
    let climates = Object.fromEntries(
      Array.from({length: 5}, (v, i) => {
        return ['climate.room_' + i, 'Radiator Room ' + i];
      }).map((climate) => {
        return [climate[0], new ClimateEntity(climate[0], climate[1])];
      })
    );
    climates['climate.stove'] = new ClimateStoveEntity('climate.stove');
    return climates;
  }

  _mockLights() {
    return Object.fromEntries(
      Array.from({length: 5}, (v, i) => {
        return ['light.room_' + i, 'Room ' + i];
      }).map((light) => {
        return [light[0], new LightEntity(light[0], light[1])];
      })
    );
  }

  _mockVacuum() {
    return {'vacuum.cleaner': new VacuumEntity('vacuum.cleaner')};
  }

  _mockWeather() {
    return {'weather.a_city': new WeatherEntity('weather.a_city')};
  }

  _mockSun() {
    return {'sun.sun': new SunEntity('sun.sun')};
  }

  _mockStates() {
    return Object.assign(
      {},
      this._mockPersons(),
      this._mockLights(),
      this._mockClimates(),
      this._mockVacuum(),
      this._mockWeather(),
      this._mockSun()
    );
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
