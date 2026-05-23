import { expect, describe, it, beforeEach } from 'vitest';
import {
  getFloors,
  getFloorById,
  getFirstFloor,
  getAreas,
  getAreasByFloor,
  getAreaById,
  getEntitiesByArea,
  getEntitiesByAreaAndDomain,
} from '../../src/selectors/house.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry } from '../fixtures/mock-hass.js';

describe('house selectors', () => {
  describe('floors', () => {
    it('getFloors returns floors sorted by level, nulls last', () => {
      const hass = makeMockHass({
        floors: {
          'null1': makeMockFloor({ floor_id: 'null1', level: null }),
          'level2': makeMockFloor({ floor_id: 'level2', level: 2 }),
          'level0': makeMockFloor({ floor_id: 'level0', level: 0 }),
          'null2': makeMockFloor({ floor_id: 'null2', level: null }),
        },
      });

      const floors = getFloors(hass);
      expect(floors.length).to.equal(4);
      expect(floors[0]!.floor_id).to.equal('level0');
      expect(floors[1]!.floor_id).to.equal('level2');
      expect(floors[2]!.floor_id).to.equal('null1');
      expect(floors[3]!.floor_id).to.equal('null2');
    });

    it('getFloorById returns the correct floor', () => {
      const hass = makeMockHass();
      const floor = getFloorById(hass, 'ground');
      expect(floor).to.exist;
      expect(floor!.floor_id).to.equal('ground');
    });

    it('getFirstFloor returns the lowest level floor', () => {
      const hass = makeMockHass({
        floors: {
          'top': makeMockFloor({ floor_id: 'top', level: 2 }),
          'ground': makeMockFloor({ floor_id: 'ground', level: 0 }),
        },
      });
      const first = getFirstFloor(hass);
      expect(first!.floor_id).to.equal('ground');
    });
  });

  describe('areas', () => {
    it('getAreas returns all areas', () => {
      const hass = makeMockHass();
      const areas = getAreas(hass);
      expect(areas.length).to.be.greaterThan(0);
    });

    it('getAreasByFloor returns areas matching floor_id', () => {
      const hass = makeMockHass({
        areas: {
          'area1': makeMockArea({ area_id: 'area1', floor_id: 'floor1' }),
          'area2': makeMockArea({ area_id: 'area2', floor_id: 'floor1' }),
          'area3': makeMockArea({ area_id: 'area3', floor_id: 'floor2' }),
        },
      });

      const areas = getAreasByFloor(hass, 'floor1');
      expect(areas.length).to.equal(2);
      expect(areas.every(a => a.floor_id === 'floor1')).to.be.true;
    });

    it('getAreaById returns the correct area', () => {
      const hass = makeMockHass();
      const area = getAreaById(hass, 'living_room');
      expect(area).to.exist;
      expect(area!.area_id).to.equal('living_room');
    });
  });

  describe('entities', () => {
    it('getEntitiesByArea returns entries matching area_id', () => {
      const hass = makeMockHass({
        entities: {
          'light.1': makeMockEntityEntry({ entity_id: 'light.1', area_id: 'area1' }),
          'light.2': makeMockEntityEntry({ entity_id: 'light.2', area_id: 'area1' }),
          'light.3': makeMockEntityEntry({ entity_id: 'light.3', area_id: 'area2' }),
        },
      });

      const entities = getEntitiesByArea(hass, 'area1');
      expect(entities.length).to.equal(2);
    });

    it('getEntitiesByAreaAndDomain filters by domain and excludes disabled', () => {
      const hass = makeMockHass({
        entities: {
          'light.1': makeMockEntityEntry({ entity_id: 'light.1', area_id: 'area1', domain: 'light' }),
          'light.disabled': makeMockEntityEntry({ entity_id: 'light.disabled', area_id: 'area1', domain: 'light', disabled_by: 'user' }),
          'switch.1': makeMockEntityEntry({ entity_id: 'switch.1', area_id: 'area1', domain: 'switch' }),
        },
      });

      const lights = getEntitiesByAreaAndDomain(hass, 'area1', 'light');
      expect(lights.length).to.equal(1);
      expect(lights[0]!.entity_id).to.equal('light.1');
    });
  });
});
