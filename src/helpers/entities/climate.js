import {
  ENTITY_KIND_CLIMATE,
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_HEAT,
} from './const';

export class ClimateEntity {
  static kind = ENTITY_KIND_CLIMATE;

  constructor(entity, device) {
    this.entity_id = entity.entity_id ? entity.entity_id : null;
    this.state = entity.state ? entity.state : STATE_LIGHT_OFF;

    this.hvac_modes = entity.attributes.hvac_modes
      ? entity.attributes.hvac_modes
      : null;
    this.max_temp = entity.attributes.max_temp
      ? entity.attributes.max_temp
      : 35;
    this.min_temp = entity.attributes.min_temp ? entity.attributes.min_temp : 7;
    this.preset_mode = entity.attributes.preset_mode
      ? entity.attributes.preset_mode
      : null;
    this.preset_modes = entity.attributes.preset_modes
      ? entity.attributes.preset_modes
      : [];
    this.current_temperature = entity.attributes.current_temperature
      ? entity.attributes.current_temperature
      : null;
    this.temperature = entity.attributes.temperature
      ? entity.attributes.temperature
      : null;
    this.friendly_name = entity.attributes.friendly_name
      ? entity.attributes.friendly_name
      : null;
    this.icon = entity.attributes.icon ? entity.attributes.icon : null;

    this.manufacturer = device.manufacturer ? device.manufacturer : null;
    this.model = device.model ? device.model : null;

    // Floor & area links
    this.floor_id = null;
    this.area_id = null;
  }

  get kind() {
    return ClimateEntity.kind;
  }

  get active() {
    return [STATE_CLIMATE_AUTO, STATE_CLIMATE_HEAT].includes(this.state);
  }

  renderAsEntity() {
    return {
      entity_id: this.entity_id,
      attributes: {
        hvac_mode: this.hvac_mode,
        max_temp: this.max_temp,
        min_temp: this.min_temp,
        preset_mode: this.preset_mode,
        preset_modes: this.preset_modes,
        current_temperature: this.current_temperature,
        temperature_unit: this.temperature_unit,
        temperature: this.temperature,
        friendly_name: this.friendly_name,
        icon: this.icon,
      },
      state: this.state,
    };
  }
}
