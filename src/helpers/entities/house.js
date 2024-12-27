import {html} from 'lit';

import {getIcon} from '../icons/icons';
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
      const area = new Area(area_id, hass);
      const floor_id = area.floor_id;

      // Create Floor if not exist
      if (!Object.keys(floors).includes(floor_id))
        floors[floor_id] = new Floor(floor_id, hass);

      // check if area already exist
      if (!floors[floor_id].hasArea(area_id)) floors[floor_id].addArea(area);

      // Add entity to floor area
      const entity = this.__getEntity(device_id, hass);
      floors[floor_id].addEntityToArea(area_id, entity);

      return floors;
    }, {});
  }

  __getEntity(device_id, hass) {
    const entity = this.__getDeviceEntityState(device_id, hass);
    const entity_kind = entity.entity_id.split('.')[0];
    if (Object.keys(SCI_FI_ENTITIES).includes(entity_kind))
      return new SCI_FI_ENTITIES[entity_kind](
        entity.entity_id,
        entity.state,
        entity.attributes.icon,
        entity.attributes.friendly_name
      );
    return null;
  }

  __getDeviceEntityState(device_id, hass) {
    return hass.states[
      Object.values(hass.entities).find(
        (entity) => entity.device_id == device_id
      ).entity_id
    ];
  }

  get floors() {
    return Object.values(this._components);
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

  addEntityToArea(area_id, entity) {
    this.areas[area_id].addEntity(entity);
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
        return area.getEntities(entity_kind);
      })
      .flat();
  }

  getAreas() {
    return Object.values(this.areas);
  }

  getArea(area_id) {
    if (!this.areas[area_id]) return null;
    return this.areas[area_id];
  }

  render(entity_kind, selected = false) {
    return html`
      <sci-fi-hexa-tile
        active-tile
        state="${this.isActive(entity_kind) ? 'on' : 'off'}"
        class="${selected ? 'selected' : ''}"
      >
        <div class="item-icon">${getIcon(this.icon)}</div>
      </sci-fi-hexa-tile>
    `;
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

  getEntities(entity_kind) {
    if (!this.entities[entity_kind]) return [];
    return this.entities[entity_kind];
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

  render(entity_kind) {
    const area_state = this.isActive(entity_kind) ? 'on' : 'off';
    return html`
      <sci-fi-hexa-tile active-tile state="${area_state}" class="${area_state}">
        <div class="item-icon">${getIcon(this.icon)}</div>
      </sci-fi-hexa-tile>
    `;
  }
}
