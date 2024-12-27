import {html} from 'lit';

import {ENTITY_KIND_LIGHT, STATE_LIGHT_OFF, STATE_LIGHT_ON} from './const.js';

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
}
