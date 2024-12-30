import {ENTITY_KIND_LIGHT} from './const';
import {LightEntity} from './light';

const SCI_FI_ENTITIES = {};
SCI_FI_ENTITIES[ENTITY_KIND_LIGHT] = LightEntity;

export class House {
  constructor(hass) {
    this._components = this.__build(hass);
  }

  __build(hass) {
    return Object.keys(hass.devices).reduce((floors, device_id) => {
      // Create Area
      const area_id = hass.devices[device_id].area_id;
      if (!area_id) return floors; // Case with device without assigned area

      // Check if device can be associated to an entity
      const entities_ids = this.__getDeviceEntitiesIds(device_id, hass);
      if (entities_ids.lenght == 0) return floors;
      const entities = this.__getEntities(entities_ids, hass);
      if (entities.lenght == 0) return floors;

      const area = new Area(area_id, hass);
      const floor_id = area.floor_id;

      // Create Floor if not exist
      if (!Object.keys(floors).includes(floor_id))
        floors[floor_id] = new Floor(floor_id, hass);

      // check if area already exist
      if (!floors[floor_id].hasArea(area_id)) floors[floor_id].addArea(area);

      // Add entities to floor area
      floors[floor_id].addEntitiesToArea(area_id, entities);

      return floors;
    }, {});
  }

  __getEntities(entities_ids, hass) {
    let entities = [];
    entities_ids.map((entity_id) => {
      const entity_kind = entity_id.split('.')[0];
      if (Object.keys(SCI_FI_ENTITIES).includes(entity_kind)) {
        const entity = hass.states[entity_id];
        entities.push(
          new SCI_FI_ENTITIES[entity_kind](
            entity.entity_id,
            entity.state,
            entity.attributes.icon,
            entity.attributes.friendly_name
          )
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
    return Object.values(this._components);
  }

  getDefaultFloor(entity_kind) {
    return this.floors.filter((floor) =>
      this.isfloorActive(floor.id, entity_kind)
    )[0];
  }

  getDefaultArea(floor_id, entity_kind) {
    return this.getFloor(floor_id).getFirstArea(entity_kind);
  }

  isfloorActive(floor_id, entity_kind) {
    if (!this._components[floor_id]) return false;
    return this._components[floor_id].isActive(entity_kind);
  }

  getFloor(floor_id) {
    if (!this._components[floor_id]) return null;
    return this._components[floor_id];
  }

  getArea(floor_id, area_id) {
    const floor = this.getFloor(floor_id);
    if (!floor) return null;
    return floor.getArea(area_id);
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

  addEntitiesToArea(area_id, entities) {
    entities.map((entity) => {
      this.areas[area_id].addEntity(entity);
    });
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

  getEntitiesByKind(entity_kind) {
    return Object.values(this.areas)
      .map((area) => {
        return area.getEntitiesByKind(entity_kind);
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
}

class Area {
  constructor(area_id, hass) {
    this.id = area_id;
    this.icon = hass.areas[area_id].icon;
    this.name = hass.areas[area_id].name;
    this.floor_id = hass.areas[area_id].floor_id;
    this.entities = {};
  }

  getEntitiesByKind(entity_kind) {
    if (!this.entities[entity_kind]) return [];
    return this.entities[entity_kind];
  }

  hasEntityKind(entity_kind) {
    return this.getEntitiesByKind(entity_kind).length > 0;
  }

  addEntity(entity) {
    if (!entity) return;
    if (!this.entities[entity.kind]) this.entities[entity.kind] = [];
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
}
