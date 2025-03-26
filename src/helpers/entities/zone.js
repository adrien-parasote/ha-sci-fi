import {ZoneSensor} from './sensor/sensor.js';

export class Zones {
  constructor(hass) {
    this.zones = Object.keys(hass.states)
      .filter((s) => s.startsWith('zone.'))
      .map((id) => new ZoneSensor(id, hass));
  }

  get_associated_zones(user_id) {
    return this.zones.filter((zone) => zone.has_user(user_id));
  }
}
