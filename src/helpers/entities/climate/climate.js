import {Counter} from '../counter.js';
import {Sensor} from '../sensor/sensor.js';
import {
  STOVE_SENSORS,
  STOVE_SENSOR_ACTUAL_POWER,
  STOVE_SENSOR_COMBUSTION_CHAMBER_TEMP,
  STOVE_SENSOR_FAN_SPEED,
  STOVE_SENSOR_INSIDE_TEMP,
  STOVE_SENSOR_PELLET_QTY,
  STOVE_SENSOR_POWER,
  STOVE_SENSOR_PRESSURE,
  STOVE_SENSOR_STATUS,
  STOVE_SENSOR_TIME_TO_SERVICE,
} from '../sensor/sensor_const.js';
import {
  ENTITY_KIND_CLIMATE,
  HASS_CLIMATE_PRESET_MODE_FROST,
  HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
  HASS_CLIMATE_SERVICE,
  HASS_CLIMATE_SERVICE_SET_HVAC_MODE,
  HASS_CLIMATE_SERVICE_SET_PRESET_MODE,
  HASS_CLIMATE_SERVICE_SET_TEMPERATURE,
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_COOL,
  STATE_CLIMATE_HEAT,
  STATE_CLIMATE_OFF,
} from './climate_const.js';

export class ClimateEntity {
  static kind = ENTITY_KIND_CLIMATE;

  constructor(entity, device) {
    this.entity_id = entity.entity_id ? entity.entity_id : null;
    this.state = entity.state ? entity.state : STATE_CLIMATE_OFF;
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
    this._current_temperature = entity.attributes.current_temperature
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
    this.device_id = device.id ? device.id : null;

    // Floor & area links
    this.floor_id = null;
    this.area_id = device.area_id ? device.area_id : null;
  }

  get current_temperature() {
    return this._current_temperature;
  }

  get kind() {
    return ClimateEntity.kind;
  }

  get active() {
    return (
      STATE_CLIMATE_HEAT == this.state ||
      (STATE_CLIMATE_AUTO == this.state &&
        ![
          HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
          HASS_CLIMATE_PRESET_MODE_FROST,
        ].includes(this.preset_mode))
    );
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
        hvac_modes: this.hvac_modes,
      },
      state: this.state,
    };
  }

  setPresetMode(hass, preset_mode) {
    return hass.callService(
      HASS_CLIMATE_SERVICE,
      HASS_CLIMATE_SERVICE_SET_PRESET_MODE,
      {
        entity_id: [this.entity_id],
        preset_mode: preset_mode,
      }
    );
  }

  setHvacMode(hass, hvac_mode) {
    return hass.callService(
      HASS_CLIMATE_SERVICE,
      HASS_CLIMATE_SERVICE_SET_HVAC_MODE,
      {
        entity_id: [this.entity_id],
        hvac_mode: hvac_mode,
      }
    );
  }

  setTemperature(hass, temperature) {
    return hass.callService(
      HASS_CLIMATE_SERVICE,
      HASS_CLIMATE_SERVICE_SET_TEMPERATURE,
      {
        entity_id: [this.entity_id],
        temperature: temperature,
      }
    );
  }
}

export class StoveEntity extends ClimateEntity {
  constructor(entity, device) {
    super(entity, device);
    this.sensors = {};
    STOVE_SENSORS.forEach((sensor) => (this.sensors[sensor] = null));
    this.storage = null;
  }

  get current_temperature() {
    return this.inside_temperature
      ? parseFloat(this.inside_temperature.value)
      : this._current_temperature;
  }

  get inside_temperature() {
    return this.sensors[STOVE_SENSOR_INSIDE_TEMP]
      ? this.sensors[STOVE_SENSOR_INSIDE_TEMP]
      : {};
  }

  get actual_power() {
    return this.sensors[STOVE_SENSOR_ACTUAL_POWER]
      ? this.sensors[STOVE_SENSOR_ACTUAL_POWER]
      : {};
  }

  get combustion_chamber_temperature() {
    return this.sensors[STOVE_SENSOR_COMBUSTION_CHAMBER_TEMP]
      ? this.sensors[STOVE_SENSOR_COMBUSTION_CHAMBER_TEMP]
      : {};
  }

  get pellet_quantity() {
    return this.sensors[STOVE_SENSOR_PELLET_QTY]
      ? this.sensors[STOVE_SENSOR_PELLET_QTY]
      : {};
  }

  get status() {
    return this.sensors[STOVE_SENSOR_STATUS]
      ? this.sensors[STOVE_SENSOR_STATUS].state
      : null;
  }

  get power() {
    return this.sensors[STOVE_SENSOR_POWER]
      ? this.sensors[STOVE_SENSOR_POWER]
      : {};
  }

  get fan_speed() {
    return this.sensors[STOVE_SENSOR_FAN_SPEED]
      ? this.sensors[STOVE_SENSOR_FAN_SPEED]
      : {};
  }

  get pressure() {
    return this.sensors[STOVE_SENSOR_PRESSURE]
      ? this.sensors[STOVE_SENSOR_PRESSURE]
      : {};
  }

  get time_to_service() {
    return this.sensors[STOVE_SENSOR_TIME_TO_SERVICE]
      ? this.sensors[STOVE_SENSOR_TIME_TO_SERVICE]
      : null;
  }

  addSensors(sensors, hass) {
    Object.keys(sensors).forEach((sensor_key) => {
      if (sensors[sensor_key])
        this.sensors[sensor_key] = new Sensor(sensors[sensor_key], hass);
    });
  }

  get active() {
    return [STATE_CLIMATE_HEAT, STATE_CLIMATE_COOL].includes(this.state);
  }

  addStockCounter(counter_id, hass) {
    this.storage = new Counter(counter_id, hass);
  }
}
