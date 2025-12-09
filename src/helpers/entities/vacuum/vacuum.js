import {BatterySensor, Sensor} from '../sensor/sensor';
import {
  VACUUM_ACTIONS_ICONS,
  VACUUM_ACTION_PAUSE,
  VACUUM_ACTION_RETURN_TO_BASE,
  VACUUM_ACTION_START,
  VACUUM_ACTION_STOP,
  VACUUM_ACTIVITY_STATE,
  VACUUM_ICONS,
} from './vacuum_const';

export class VacuumEntity {
  constructor(hass, config) {
    this._hass = hass;
    this.entity_id = config.entity;
    let entity = hass.states[config.entity];
    this.state = entity.state;
    this._sensors = config.sensors;
    this._fan_speed = entity.attributes.fan_speed;
    this.friendly_name = entity.attributes.friendly_name;

    this._service = config.shortcuts.service
      ? config.shortcuts.service.split('.')[0]
      : null;
    this._service_action = config.shortcuts.service
      ? config.shortcuts.service.split('.')[1]
      : null;
    this._command = config.shortcuts.command ? config.shortcuts.command : null;
    this.shortcuts = config.shortcuts.description;
    this._actions = {};
    this._actions[VACUUM_ACTION_START] = config.start;
    this._actions[VACUUM_ACTION_PAUSE] = config.pause;
    this._actions[VACUUM_ACTION_STOP] = config.stop;
    this._actions[VACUUM_ACTION_RETURN_TO_BASE] = config.return_to_base;
  }

  get fan_speed() {
    return this._fan_speed ? this._fan_speed : null;
  }

  get name() {
    return this.friendly_name ? this.friendly_name : this.entity_id;
  }

  get battery() {
    return this._sensors['battery']
      ? new BatterySensor(this._sensors['battery'], this._hass)
      : null;
  }

  get mop_intensite() {
    return !this._sensors['mop_intensite']
      ? null
      : new Sensor(this._sensors['mop_intensite'], this._hass);
  }

  get current_clean_area() {
    return !this._sensors['current_clean_area']
      ? null
      : new Sensor(this._sensors['current_clean_area'], this._hass);
  }

  get current_clean_duration() {
    return !this._sensors['current_clean_duration']
      ? null
      : new Sensor(this._sensors['current_clean_duration'], this._hass);
  }

  get map() {
    return !this._sensors['map']
      ? null
      : new Sensor(this._sensors['map'], this._hass);
  }

  get sensors() {
    return [this.current_clean_area, this.current_clean_duration].filter(
      (n) => n
    );
  }

  get actions() {
    return Object.keys(this._actions)
      .filter((k) => this._actions[k])
      .map((k) => {
        return {
          key: k,
          icon: VACUUM_ACTIONS_ICONS[k],
        };
      });
  }

  get icon() {
    return VACUUM_ICONS[this.state];
  }

  get activity() {
    return VACUUM_ACTIVITY_STATE[this.state];
  }

  renderAsEntity() {
    return {
      entity_id: this.entity_id,
      attributes: {
        friendly_name: this.friendly_name,
        battery: this.battery,
        fan_speed: this.fan_speed,
        icon: this.icon,
        map_url: this.map,
      },
      state: this.state,
    };
  }

  callService(id, is_shortcut = false) {
    return is_shortcut
      ? this._callShortcutService(id)
      : this._callDefaultService(id);
  }

  _callShortcutService(id) {
    if (!this._service) throw new Error('Service to call is not defined');
    if (!this._command)
      throw new Error('Service command to call is not defined');
    const shortcuts = this.shortcuts[id];
    if (!shortcuts.segments)
      throw new Error('Segment list for ' + shortcuts.name + 'is empty');
    return this._hass.callService(this._service, this._service_action, {
      command: this._command,
      params: [{segments: shortcuts.segments}],
    }, {entity_id: this.entity_id});
  }

  _callDefaultService(id) {
    return this._hass.callService('vacuum', id, {
      entity_id: this.entity_id,
    });
  }
}
