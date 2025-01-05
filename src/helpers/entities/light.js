import {
  ENTITY_KIND_LIGHT,
  HASS_LIGHT_SERVICE,
  HASS_LIGHT_SERVICE_ACTION_TURN_OFF,
  HASS_LIGHT_SERVICE_ACTION_TURN_ON,
  STATE_LIGHT_OFF,
  STATE_LIGHT_ON,
} from './const';

export class LightEntity {
  static kind = ENTITY_KIND_LIGHT;

  constructor(entity_id, state, icon, friendly_name) {
    this.entity_id = entity_id ? entity_id : null;
    this.state = state ? state : STATE_LIGHT_OFF;
    this.icon = icon ? icon : null;
    this.friendly_name = friendly_name ? friendly_name : '';
  }

  get active() {
    return this.state == STATE_LIGHT_ON;
  }

  get kind() {
    return LightEntity.kind;
  }

  renderAsEntity() {
    return {
      entity_id: this.entity_id,
      attributes: {
        icon: this.icon,
        friendly_name: this.friendly_name,
      },
      state: this.state,
    };
  }

  callService(hass) {
    hass.callService(
      HASS_LIGHT_SERVICE,
      this.active
        ? HASS_LIGHT_SERVICE_ACTION_TURN_OFF
        : HASS_LIGHT_SERVICE_ACTION_TURN_ON,
      {
        entity_id: [this.entity_id],
      }
    );
  }
}
