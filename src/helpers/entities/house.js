import {ClimateEntity} from './climate.js';
import {
  ENTITY_KIND_CLIMATE,
  ENTITY_KIND_LIGHT,
  HASS_LIGHT_SERVICE,
  HASS_LIGHT_SERVICE_ACTION_TURN_OFF,
  HASS_LIGHT_SERVICE_ACTION_TURN_ON,
} from './const';
import {LightEntity} from './light.js';

const SCI_FI_ENTITIES = {};
SCI_FI_ENTITIES[ENTITY_KIND_LIGHT] = LightEntity;
SCI_FI_ENTITIES[ENTITY_KIND_CLIMATE] = ClimateEntity;
const SERVICES = [];
SERVICES[ENTITY_KIND_LIGHT] = {
  service: HASS_LIGHT_SERVICE,
  actions: {
    true: HASS_LIGHT_SERVICE_ACTION_TURN_ON,
    false: HASS_LIGHT_SERVICE_ACTION_TURN_OFF,
  },
};

export class House {
  constructor(hass) {
    this._floors = this.__build(hass);

    let home = hass.states['zone.home'];
    if (!home) home = {};
    this.latitude = home.attributes.latitude ? home.attributes.latitude : null;
    this.longitude = home.attributes.longitude
      ? home.attributes.longitude
      : null;
    this.icon = home.attributes.icon ? home.attributes.icon : null;
    this.name = home.attributes.friendly_name
      ? home.attributes.friendly_name
      : null;
  }

  __build(hass) {
    return Object.keys(hass.devices).reduce((floors, device_id) => {
      // Create Area
      const area_id = hass.devices[device_id].area_id;
      if (!area_id) return floors; // Case with device without assigned area

      // Check if device can be associated to an entity
      const entities_ids = this.__getDeviceEntitiesIds(device_id, hass);
      if (entities_ids.lenght == 0) return floors;
      const entities = this.__getEntities(entities_ids, hass, device_id);
      if (entities.lenght == 0) return floors;

      const area = new Area(area_id, hass);
      const floor_id = area.floor_id;

      // Create Floor if not exist
      if (!Object.keys(floors).includes(floor_id))
        floors[floor_id] = new Floor(floor_id, hass);

      // check if area already exist
      if (!floors[floor_id].hasArea(area_id)) floors[floor_id].addArea(area);

      // Add entities to floor area
      floors[floor_id].addEntities(area_id, entities);

      return floors;
    }, {});
  }

  __getEntities(entities_ids, hass, device_id) {
    let entities = [];
    entities_ids.map((entity_id) => {
      const entity_kind = entity_id.split('.')[0];
      if (Object.keys(SCI_FI_ENTITIES).includes(entity_kind)) {
        const entity = hass.states[entity_id];
        if (entity)
          entities.push(
            new SCI_FI_ENTITIES[entity_kind](entity, hass.devices[device_id])
          );
      }
    });
    return entities;
  }

  __getDeviceEntitiesIds(device_id, hass) {
    return Object.values(hass.entities)
      .filter((entity) => entity.device_id == device_id)
      .reduce((acc, value) => acc.concat([value.entity_id]), []);
  }

  get floors() {
    return Object.values(this._floors);
  }

  getDefaultFloor(entity_kind) {
    let first = this.floors.filter((floor) =>
      this.isfloorActive(floor.id, entity_kind)
    )[0];
    if (first) return first;
    // Case of no active kind
    return this.floors.filter((floor) => floor.hasEntityKind(entity_kind))[0];
  }

  getDefaultArea(floor_id, entity_kind) {
    return this.getFloor(floor_id).getFirstArea(entity_kind);
  }

  isActive(entity_kind) {
    return Object.values(this._floors)
      .map((floor) => {
        return floor.isActive(entity_kind);
      })
      .reduce((acc, value) => acc || value, false);
  }

  isfloorActive(floor_id, entity_kind) {
    if (!this._floors[floor_id]) return false;
    return this._floors[floor_id].isActive(entity_kind);
  }

  getFloor(floor_id) {
    if (!this._floors[floor_id]) return null;
    return this._floors[floor_id];
  }

  getArea(floor_id, area_id) {
    const floor = this.getFloor(floor_id);
    if (!floor) return null;
    return floor.getArea(area_id);
  }

  getTemperature(entities_to_exclude = []) {
    let temp = [];
    Object.values(this._floors)
      .filter((floor) => floor.hasEntityKind(ENTITY_KIND_CLIMATE))
      .forEach((floor) => {
        temp.push(floor.getTemperature(entities_to_exclude));
      });
    return temp.length > 0
      ? Math.round(
          (temp.reduce((sum, currentValue) => sum + currentValue, 0) /
            temp.length) *
            10,
          1
        ) / 10
      : null;
  }

  getEntitiesByKind(entity_kind, entities_to_exclude = []) {
    let temp = [];
    return Object.values(this._floors)
      .map((floor) => {
        return floor.getEntitiesByKind(entity_kind, entities_to_exclude);
      })
      .flat();
  }

  getFloorAreaEntitiesByKind(floor_id, area_id, entity_kind) {
    return this.getFloor(floor_id)
      .getArea(area_id)
      .getEntitiesByKind(entity_kind);
  }

  getFloorsOrderedByLevel(asc = true) {
    if (asc)
      return this.floors.sort((a, b) =>
        a.level > b.leve ? 1 : b.level > a.level ? -1 : 0
      );
    return this.floors.sort((a, b) =>
      a.level < b.leve ? 1 : b.level < a.level ? -1 : 0
    );
  }

  turnOnOffLight(hass) {
    const active = this.isActive(ENTITY_KIND_LIGHT);
    const floor_ids = this.floors
      .filter((floor) => floor.hasEntityKind(ENTITY_KIND_LIGHT))
      .reduce((acc, value) => acc.concat([value.id]), []);

    return hass.callService(
      SERVICES[ENTITY_KIND_LIGHT].service,
      SERVICES[ENTITY_KIND_LIGHT].actions[!active],
      {
        floor_id: floor_ids,
      }
    );
  }
}

class Floor {
  constructor(floor_id, hass) {
    this.id = floor_id;
    this.icon = hass.floors[floor_id].icon;
    this.level = hass.floors[floor_id].level;
    this.name = hass.floors[floor_id].name;
    this.areas = {};
  }

  addArea(area) {
    if (area) this.areas[area.id] = area;
  }

  addEntities(area_id, entities) {
    this.areas[area_id].addEntities(entities);
  }

  hasArea(area_id) {
    return Object.keys(this.areas).includes(area_id);
  }

  isActive(entity_kind) {
    return Object.values(this.areas)
      .map((area) => {
        return area.isActive(entity_kind);
      })
      .reduce((acc, value) => acc || value, false);
  }

  countAreas() {
    return Object.keys(this.areas).length;
  }

  getEntitiesByKind(entity_kind, entities_to_exclude = []) {
    return Object.values(this.areas)
      .map((area) => {
        return area.getEntitiesByKind(entity_kind, entities_to_exclude);
      })
      .flat();
  }

  hasEntityKind(entity_kind) {
    return Object.values(this.areas)
      .map((area) => {
        return area.hasEntityKind(entity_kind);
      })
      .reduce((acc, value) => acc || value, false);
  }

  getAreas() {
    return Object.values(this.areas);
  }

  getArea(area_id) {
    if (!this.areas[area_id]) return null;
    return this.areas[area_id];
  }

  getFirstArea(entity_kind) {
    return this.getAreas().filter((area) => area.hasEntityKind(entity_kind))[0];
  }

  renderAsEntity() {
    return {
      entity_id: this.id,
      attributes: {
        icon: this.icon,
        friendly_name: this.name,
      },
    };
  }

  get climates() {
    return this.getEntitiesByKind(ENTITY_KIND_CLIMATE);
  }

  getTemperature(entities_to_exclude = []) {
    let temp = [];
    this.climates
      .filter((climate) => !entities_to_exclude.includes(climate.entity_id))
      .forEach((climate) => {
        temp.push(climate.current_temperature);
      });
    return temp.length > 0
      ? Math.round(
          (temp.reduce((sum, currentValue) => sum + currentValue, 0) /
            temp.length) *
            10,
          1
        ) / 10
      : null;
  }

  callService(hass, entity_kind) {
    // TODO : change - only used for light
    if (entity_kind == ENTITY_KIND_LIGHT) {
      return this.__turnOnOffLight(hass);
    }
  }

  __turnOnOffLight(hass) {
    const active = this.isActive(ENTITY_KIND_LIGHT);
    return hass.callService(
      SERVICES[ENTITY_KIND_LIGHT].service,
      SERVICES[ENTITY_KIND_LIGHT].actions[!active],
      {
        floor_id: [this.id],
      }
    );
  }
}

class Area {
  constructor(area_id, hass) {
    this.id = area_id;
    this.icon = hass.areas[area_id].icon;
    this.name = hass.areas[area_id].name;
    this.floor_id = hass.areas[area_id].floor_id;
    this.entities = {};
  }

  getEntitiesByKind(entity_kind, entities_to_exclude = []) {
    if (!this.entities[entity_kind]) return [];
    return this.entities[entity_kind].filter(
      (entity) => !entities_to_exclude.includes(entity.entity_id)
    );
  }

  hasEntityKind(entity_kind) {
    return this.getEntitiesByKind(entity_kind).length > 0;
  }

  addEntities(entities) {
    entities.map((entity) => {
      this.addEntity(entity);
    });
  }

  addEntity(entity) {
    if (!entity) return;
    if (!this.entities[entity.kind]) this.entities[entity.kind] = [];
    entity.floor_id = this.floor_id;
    entity.area_id = this.id;
    this.entities[entity.kind].push(entity);
  }

  isActive(entity_kind) {
    if (!this.entities[entity_kind]) return false;
    return this.entities[entity_kind].reduce(
      (acc, entity) => acc || entity.active,
      false
    );
  }

  renderAsEntity() {
    return {
      entity_id: this.id,
      attributes: {
        icon: this.icon,
        friendly_name: this.name,
      },
    };
  }

  getTemperature(entities_to_exclude = []) {
    let temp = [];
    this.getEntitiesByKind(ENTITY_KIND_CLIMATE)
      .filter((climate) => !entities_to_exclude.includes(climate.entity_id))
      .forEach((climate) => {
        temp.push(climate.current_temperature);
      });
    return temp.length > 0
      ? Math.round(
          (temp.reduce((sum, currentValue) => sum + currentValue, 0) /
            temp.length) *
            10,
          1
        ) / 10
      : null;
  }

  callService(hass, entity_kind) {
    // TODO : change - only used for light
    if (entity_kind == ENTITY_KIND_LIGHT) {
      return this.__turnOnOffLight(hass);
    }
  }

  __turnOnOffLight(hass) {
    const active = this.isActive(ENTITY_KIND_LIGHT);
    return hass.callService(
      SERVICES[ENTITY_KIND_LIGHT].service,
      SERVICES[ENTITY_KIND_LIGHT].actions[!active],
      {
        area_id: [this.id],
      }
    );
  }
}
