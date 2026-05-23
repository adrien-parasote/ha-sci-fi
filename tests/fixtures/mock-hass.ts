/**
 * Mock HomeAssistantExt fixture for tests
 * Provides minimal but realistic data to exercise selectors.
 */

import type {
  HomeAssistantExt,
  HassEntity,
  HassArea,
  HassFloor,
  HassEntityEntry,
} from '../../src/types/ha.js';

// ─── Mock builders ────────────────────────────────────────────────────────────

export function makeMockFloor(overrides: Partial<HassFloor> = {}): HassFloor {
  return {
    floor_id: 'ground',
    name: 'Ground Floor',
    aliases: [],
    icon: null,
    level: 0,
    ...overrides,
  };
}

export function makeMockArea(overrides: Partial<HassArea> = {}): HassArea {
  return {
    area_id: 'living_room',
    name: 'Living Room',
    aliases: [],
    floor_id: 'ground',
    icon: null,
    labels: [],
    picture: null,
    ...overrides,
  };
}

export function makeMockEntityEntry(
  overrides: Partial<HassEntityEntry> = {}
): HassEntityEntry {
  return {
    entity_id: 'light.salon',
    area_id: 'living_room',
    device_id: null,
    disabled_by: null,
    domain: 'light',
    platform: 'hue',
    labels: [],
    ...overrides,
  };
}

export function makeMockEntity(
  overrides: Partial<HassEntity> = {}
): HassEntity {
  return {
    entity_id: 'light.salon',
    state: 'off',
    attributes: { friendly_name: 'Salon' },
    last_changed: '2024-01-01T00:00:00+00:00',
    last_updated: '2024-01-01T00:00:00+00:00',
    ...overrides,
  };
}

// ─── Full mock hass ───────────────────────────────────────────────────────────

export function makeMockHass(
  overrides: {
    floors?: Record<string, HassFloor>;
    areas?: Record<string, HassArea>;
    entities?: Record<string, HassEntityEntry>;
    states?: Record<string, HassEntity>;
  } = {}
): HomeAssistantExt {
  const callService = () =>
    Promise.resolve({} as Awaited<ReturnType<HomeAssistantExt['callService']>>);

  return {
    floors: overrides.floors ?? {
      ground: makeMockFloor({ floor_id: 'ground', level: 0 }),
      first: makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
    },
    areas: overrides.areas ?? {
      living_room: makeMockArea({ area_id: 'living_room', floor_id: 'ground' }),
      kitchen: makeMockArea({ area_id: 'kitchen', name: 'Kitchen', floor_id: 'ground' }),
      bedroom: makeMockArea({ area_id: 'bedroom', name: 'Bedroom', floor_id: 'first' }),
    },
    entities: overrides.entities ?? {
      'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', area_id: 'living_room' }),
      'light.cuisine': makeMockEntityEntry({ entity_id: 'light.cuisine', area_id: 'kitchen' }),
      'switch.prise': makeMockEntityEntry({ entity_id: 'switch.prise', area_id: 'living_room', domain: 'switch' }),
      'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', area_id: 'living_room', domain: 'climate' }),
    },
    states: overrides.states ?? {
      'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
      'light.cuisine': makeMockEntity({ entity_id: 'light.cuisine', state: 'off' }),
      'switch.prise': makeMockEntity({ entity_id: 'switch.prise', state: 'off' }),
      'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat' }),
    },
    devices: {},
    locale: { language: 'fr', number_format: 'comma', time_format: '24' },
    user: { id: '1', name: 'Adrien', is_admin: true },
    connection: {
      sendMessagePromise: () => Promise.resolve({} as never),
    },
    callService,
  };
}
