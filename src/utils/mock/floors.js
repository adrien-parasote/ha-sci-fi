import {NOW} from './utils';

export class Floor {
  constructor(floor_id, icon, level, name) {
    this.aliases = [];
    this.created_at = NOW.toISOString();
    this.modified_at = NOW.toISOString();
    this.floor_id = floor_id;
    this.icon = icon;
    this.level = level;
    this.name = name;
  }
}

export class Area {
  constructor(area_id, floor_id, icon, name) {
    this.aliases = [];
    this.labels = [];
    this.picture = [];
    this.created_at = NOW.toISOString();
    this.modified_at = NOW.toISOString();
    this.area_id = area_id;
    this.floor_id = floor_id;
    this.icon = icon;
    this.name = name;
  }
}
