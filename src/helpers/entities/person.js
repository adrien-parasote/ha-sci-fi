export class Person {
  constructor(hass) {
    const conUser = this.__getConnectedUser(hass);
    this.id = conUser.entity_id;
    this.state = conUser.state;
    this.attributes = conUser.attributes;
    // Connected user language preferences
    this.language = hass.language;
    this.locale = hass.locale;
    // HA Config
    this.currency = hass.config.currency
    this.unit_system = hass.config.unit_system
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
