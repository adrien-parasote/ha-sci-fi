/**
 * Domain selectors — house (floors + areas)
 * Pure, stateless functions. No mutation. Returns new readonly arrays.
 * selectHouseState() is REMOVED per ADR-004 — use direct selectors instead.
 */

import type { HomeAssistantExt, HassFloor, HassArea, HassEntityEntry } from '../types/ha.js';

// ─── Floors ───────────────────────────────────────────────────────────────────

/**
 * Returns all floors registered in HA, sorted by level (nulls last).
 */
export function getFloors(hass: HomeAssistantExt): readonly HassFloor[] {
  if (!hass.floors) return [];
  return Object.values(hass.floors).sort((a, b) => {
    if (a.level === null && b.level === null) return 0;
    if (a.level === null) return 1;
    if (b.level === null) return -1;
    return a.level - b.level;
  });
}

/**
 * Returns a single floor by its floor_id, or undefined if not found.
 */
export function getFloorById(
  hass: HomeAssistantExt,
  floorId: string
): HassFloor | undefined {
  return hass.floors?.[floorId];
}

/**
 * Returns the first floor (lowest level), or undefined if none configured.
 */
export function getFirstFloor(hass: HomeAssistantExt): HassFloor | undefined {
  const floors = getFloors(hass);
  return floors[0];
}

// ─── Areas ────────────────────────────────────────────────────────────────────

/**
 * Returns all areas registered in HA.
 */
export function getAreas(hass: HomeAssistantExt): readonly HassArea[] {
  if (!hass.areas) return [];
  return Object.values(hass.areas);
}

/**
 * Returns areas belonging to a specific floor.
 */
export function getAreasByFloor(
  hass: HomeAssistantExt,
  floorId: string
): readonly HassArea[] {
  return getAreas(hass).filter(area => area.floor_id === floorId);
}

/**
 * Returns a single area by its area_id, or undefined if not found.
 */
export function getAreaById(
  hass: HomeAssistantExt,
  areaId: string
): HassArea | undefined {
  return hass.areas?.[areaId];
}

// ─── Entity entries ───────────────────────────────────────────────────────────

/**
 * Returns all entity entries in an area.
 */
export function getEntitiesByArea(
  hass: HomeAssistantExt,
  areaId: string
): readonly HassEntityEntry[] {
  if (!hass.entities) return [];
  return Object.values(hass.entities).filter(entry => entry.area_id === areaId);
}

/**
 * Returns entity entries in an area filtered by domain.
 * Domain is extracted from entity_id prefix (e.g. "light" from "light.salon").
 */
export function getEntitiesByAreaAndDomain(
  hass: HomeAssistantExt,
  areaId: string,
  domain: string
): readonly HassEntityEntry[] {
  return getEntitiesByArea(hass, areaId).filter(
    entry => entry.domain === domain && !entry.disabled_by
  );
}
