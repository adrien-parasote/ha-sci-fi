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

  constructor(entity, device) {
    this.entity_id = entity.entity_id ? entity.entity_id : null;
    this.state = entity.state ? entity.state : STATE_LIGHT_OFF;
    this.icon = entity.attributes.icon ? entity.attributes.icon : null;
    this.friendly_name = entity.attributes.friendly_name
      ? entity.attributes.friendly_name
      : '';

    // Floor & area links
    this.floor_id = null;
    this.area_id = null;
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
    return hass.callService(
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
