/**
 * Climate domain selectors
 * Pure, stateless functions. No mutation.
 */

import type { HomeAssistantExt, HassEntityEntry } from '../types/ha.js';
import { DOMAIN } from '../types/domains.js';

/**
 * Returns all climate entity entries registered in HA.
 * Disabled entities are excluded.
 */
export function getClimateEntities(hass: HomeAssistantExt): readonly HassEntityEntry[] {
  if (!hass.entities) return [];
  return Object.values(hass.entities).filter(
    entry => entry.entity_id.startsWith(`${DOMAIN.CLIMATE}.`) && !entry.disabled_by
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

/** States that never count as "on": off, and a thermostat HA cannot read (spec 02, decision 2026-11-04). */
const CLIMATE_NOT_ON_STATES: ReadonlySet<string> = new Set(['off', 'unavailable', 'unknown']);

/**
 * Returns true if the climate entity exists and is on and reachable: its state is
 * neither 'off', 'unavailable' nor 'unknown' — "on", not "heating" (spec 02).
 */
export function isClimateOn(
  hass: HomeAssistantExt,
  entityId: string
): boolean {
  const entity = hass.states[entityId];
  return entity !== undefined && !CLIMATE_NOT_ON_STATES.has(entity.state);
}
