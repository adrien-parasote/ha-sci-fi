/**
 * Light domain selectors
 * Pure, stateless functions. No mutation.
 */

import type { HomeAssistantExt, HassEntityEntry, HassEntity } from '../types/ha.js';
import { getEntitiesByAreaAndDomain } from './house.js';

/**
 * Returns all light entity entries in a given area.
 * Disabled entities are excluded.
 */
export function getLightEntities(
  hass: HomeAssistantExt,
  areaId: string
): readonly HassEntityEntry[] {
  return getEntitiesByAreaAndDomain(hass, areaId, 'light');
}

/**
 * Returns the HassEntity state for a light entity entry.
 * Returns undefined if the entity is not in hass.states.
 */
export function getLightState(
  hass: HomeAssistantExt,
  entityEntry: HassEntityEntry
): HassEntity | undefined {
  return hass.states[entityEntry.entity_id];
}

/**
 * Counts light entities that are currently on in a given area.
 */
export function countActiveLights(
  hass: HomeAssistantExt,
  areaId: string
): number {
  return getLightEntities(hass, areaId).filter(entry => {
    const state = hass.states[entry.entity_id];
    return state?.state === 'on';
  }).length;
}

/**
 * Returns true if any light in the area is on.
 */
export function hasActiveLights(
  hass: HomeAssistantExt,
  areaId: string
): boolean {
  return countActiveLights(hass, areaId) > 0;
}
