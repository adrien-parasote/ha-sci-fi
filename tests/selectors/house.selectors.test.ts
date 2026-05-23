import { describe, it, expect } from 'vitest';
import { makeMockHass, makeMockEntityEntry } from '../fixtures/mock-hass.js';
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

describe('house selectors', () => {
  // TC-201: getFloors returns all floors
  it('TC-201: getFloors() returns all floors sorted by level', () => {
    const hass = makeMockHass();
    const floors = getFloors(hass);
    expect(floors).toHaveLength(2);
    expect(floors[0]?.floor_id).toBe('ground'); // level 0 first
    expect(floors[1]?.floor_id).toBe('first');  // level 1 second
  });

  // TC-205: getFloors returns empty if no floors registered
  it('TC-205: getFloors() returns [] when floors registry is empty', () => {
    const hass = makeMockHass({ floors: {} });
    const floors = getFloors(hass);
    expect(floors).toEqual([]);
  });

  // TC-202: getAreasByFloor filters by floor
  it('TC-202: getAreasByFloor() returns only areas on the given floor', () => {
    const hass = makeMockHass();
    const groundAreas = getAreasByFloor(hass, 'ground');
    expect(groundAreas).toHaveLength(2); // living_room + kitchen
    expect(groundAreas.every(a => a.floor_id === 'ground')).toBe(true);
  });

  it('TC-202b: getAreasByFloor() returns [] when floor has no areas', () => {
    const hass = makeMockHass();
    const areas = getAreasByFloor(hass, 'nonexistent_floor');
    expect(areas).toEqual([]);
  });

  it('getFloorById() returns the correct floor', () => {
    const hass = makeMockHass();
    const floor = getFloorById(hass, 'first');
    expect(floor?.name).toBe('First Floor');
  });

  it('getFloorById() returns undefined for unknown floor', () => {
    const hass = makeMockHass();
    expect(getFloorById(hass, 'rooftop')).toBeUndefined();
  });

  it('getFirstFloor() returns the floor with the lowest level', () => {
    const hass = makeMockHass();
    const floor = getFirstFloor(hass);
    expect(floor?.floor_id).toBe('ground');
  });

  it('getFirstFloor() returns undefined when no floors', () => {
    const hass = makeMockHass({ floors: {} });
    expect(getFirstFloor(hass)).toBeUndefined();
  });

  it('getAreaById() returns the correct area', () => {
    const hass = makeMockHass();
    const area = getAreaById(hass, 'kitchen');
    expect(area?.name).toBe('Kitchen');
  });

  it('getAreas() returns all areas', () => {
    const hass = makeMockHass();
    expect(getAreas(hass)).toHaveLength(3);
  });

  // TC-203: getEntitiesByArea filters by area
  it('getEntitiesByArea() returns all entries in the area', () => {
    const hass = makeMockHass();
    const entities = getEntitiesByArea(hass, 'living_room');
    // living_room has light.salon, switch.prise, climate.salon
    expect(entities).toHaveLength(3);
  });

  // TC-203: domain filter
  it('getEntitiesByAreaAndDomain() filters by domain', () => {
    const hass = makeMockHass();
    const lights = getEntitiesByAreaAndDomain(hass, 'living_room', 'light');
    expect(lights).toHaveLength(1);
    expect(lights[0]?.entity_id).toBe('light.salon');
  });

  it('getEntitiesByAreaAndDomain() excludes disabled entities', () => {
    const hass = makeMockHass({
      entities: {
        'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', area_id: 'living_room', disabled_by: 'user' }),
      },
    });
    const lights = getEntitiesByAreaAndDomain(hass, 'living_room', 'light');
    expect(lights).toHaveLength(0);
  });

  // IT-201: selectors are pure — no mutation
  it('IT-201: getFloors() called twice returns equal data without mutation', () => {
    const hass = makeMockHass();
    const floors1 = getFloors(hass);
    const floors2 = getFloors(hass);
    expect(floors1).toEqual(floors2);
    expect(floors1).not.toBe(floors2); // different array references (immutable)
  });
});
