/**
 * Climate domain selectors
 * Pure, stateless functions. No mutation.
 */

import type { HomeAssistantExt, HassEntityEntry, HassEntity } from '../types/ha.js';

/**
 * Returns all climate entity entries registered in HA.
 * Disabled entities are excluded.
 */
export function getClimateEntities(hass: HomeAssistantExt): readonly HassEntityEntry[] {
  if (!hass.entities) return [];
  return Object.values(hass.entities).filter(
    entry => entry.entity_id.startsWith('climate.') && !entry.disabled_by
  );
}

/**
 * Returns climate entities excluding a list of entity IDs.
 */
export function getClimateEntitiesExcluding(
  hass: HomeAssistantExt,
  excludedIds: readonly string[]
): readonly HassEntityEntry[] {
  const excluded = new Set(excludedIds);
  return getClimateEntities(hass).filter(entry => !excluded.has(entry.entity_id));
}

/**
 * Returns the HassEntity state for a climate entity entry.
 * Returns undefined if not in hass.states.
 */
export function getClimateState(
  hass: HomeAssistantExt,
  entityEntry: HassEntityEntry
): HassEntity | undefined {
  return hass.states[entityEntry.entity_id];
}

/**
 * Returns true if the climate entity is currently heating (state !== 'off').
 */
export function isClimateActive(
  hass: HomeAssistantExt,
  entityId: string
): boolean {
  const entity = hass.states[entityId];
  return entity !== undefined && entity.state !== 'off';
}
