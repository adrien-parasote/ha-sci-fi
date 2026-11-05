/**
 * State label of a stove entity: HA's formatted state, else the raw state.
 * Spec: docs/specs/stove-wear-counters/spec.md FR-1 (shared by diagnostics and wear counters).
 */
import type { HassEntity, HomeAssistantExt } from '../../types/ha.js';

/** HA's translation when it answers a non-blank string, else undefined; nothing is logged. */
export function formattedState(hass: HomeAssistantExt, entity: HassEntity): string | undefined {
  const format = hass.formatEntityState;
  if (typeof format !== 'function') return undefined;
  try {
    const label: unknown = format(entity);
    return typeof label === 'string' && label.trim() !== '' ? label : undefined;
  } catch {
    // A failing formatter falls back to the raw state, nothing is logged.
    return undefined;
  }
}

/** The raw state, trimmed, `_` as spaces. */
export function rawState(entity: HassEntity): string {
  return String(entity.state).trim().replaceAll('_', ' ');
}

export function stateLabel(hass: HomeAssistantExt, entity: HassEntity): string {
  return formattedState(hass, entity) ?? rawState(entity);
}
