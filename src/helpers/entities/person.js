import {Zones} from './zone';

export class Person {
  constructor(hass) {
    const conUser = this.__getConnectedUser(hass);
    this.id = conUser.entity_id;
    this.state = conUser.state;
    this.attributes = conUser.attributes;
    // Connected user language preferences
    this.language = hass.language;
    this.locale = hass.locale;
    // Associate zone entity to display better user's location
    this.zones = new Zones(hass);
  }

  __getConnectedUser(hass) {
    return Object.keys(hass.states)
      .filter((key) => key.startsWith('person.'))
      .reduce((cur, key) => {
        return hass.states[key].attributes.user_id == hass.user.id
          ? hass.states[key]
          : cur;
      }, {});
  }

  get state_icon() {
    const zone = this.zones.get_associated_zones(this.id);
    return zone.length == 0 ? 'mdi:home-off-outline' : zone[0].icon;
  }

  get entity_picture() {
    return this.attributes.entity_picture;
  }

  get friendly_name() {
    return this.attributes.friendly_name;
  }

  get date_format() {
    return this.locale.date_format == 'language'
      ? this.language
      : this.locale.date_format;
  }

  get number_format() {
    return this.locale.number_format == 'language'
      ? this.language
      : this.locale.number_format;
  }
}
