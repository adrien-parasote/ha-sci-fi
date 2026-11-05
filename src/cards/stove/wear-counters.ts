/**
 * Wear counters of the stove card (fumis total_increasing sensors), in a collapsible section.
 * Spec: docs/specs/stove-wear-counters/spec.md FR-2.1, FR-3, FR-5, FR-6, FR-7.
 */
import { html, nothing, type TemplateResult } from 'lit';
import { msg } from '@lit/localize';

import '../../components/editor-inputs/sf-editor-accordion.js';
import '../../components/sf-icon/sf-icon.js';
import { DOMAIN } from '../../types/domains.js';
import type { HassEntity, HomeAssistantExt } from '../../types/ha.js';
import type { SciFiStoveSensors } from './config.js';
import { capText, configuredId, readDiagnostic } from './diagnostics.js';
import { formattedState, rawState } from './state-label.js';

export type WearCounterKey = 'sensor_heating_time' | 'sensor_fuel_used' | 'sensor_igniter_starts' | 'sensor_misfires' | 'sensor_overheatings';
export interface WearCounterSpec { readonly key: WearCounterKey; readonly icon: string; readonly label: () => string; }
export interface WearCounterRow {
  readonly key: WearCounterKey;
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly fullValue: string;
}

export const WEAR_COUNTERS: readonly WearCounterSpec[] = [
  { key: 'sensor_heating_time', icon: 'mdi:timer-outline', label: () => msg('Heating time') },
  { key: 'sensor_fuel_used', icon: 'mdi:fuel', label: () => msg('Fuel used') },
  { key: 'sensor_igniter_starts', icon: 'mdi:fire', label: () => msg('Igniter starts') },
  { key: 'sensor_misfires', icon: 'mdi:fire-alert', label: () => msg('Misfires') },
  { key: 'sensor_overheatings', icon: 'mdi:thermometer-alert', label: () => msg('Overheatings') },
];

export const WEAR_MISSING = '—';

/** FR-2.1: the shape of a HA entity id, bounded. */
const ID_MAX = 255;
const ID_SHAPE = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const SENSOR_PREFIX = `${DOMAIN.SENSOR}.`;
const UNREADABLE: readonly string[] = ['unavailable', 'unknown'];
const NBSP = ' ';

const wellFormed = (id: string): boolean => id.length <= ID_MAX && ID_SHAPE.test(id);

/** FR-2, FR-2.1: configured and well-formed ids, in WEAR_COUNTERS order. */
export function wearEntityIds(sensors: SciFiStoveSensors): string[] {
  return WEAR_COUNTERS.map((c) => configuredId(sensors[c.key])).filter((id): id is string => id !== undefined && wellFormed(id));
}

function readable(hass: HomeAssistantExt, id: string): HassEntity | undefined {
  if (!wellFormed(id)) return undefined;
  const entity = readDiagnostic(hass.states, id, SENSOR_PREFIX);
  if (!entity || typeof entity.state !== 'string') return undefined;
  const s = entity.state.trim();
  return s === '' || UNREADABLE.includes(s.toLowerCase()) ? undefined : entity;
}

/** FR-5: one row per configured counter; an unreadable one shows WEAR_MISSING. */
export function wearRows(hass: HomeAssistantExt, sensors: SciFiStoveSensors): WearCounterRow[] {
  const rows: WearCounterRow[] = [];
  for (const c of WEAR_COUNTERS) {
    const id = configuredId(sensors[c.key]);
    if (id === undefined) continue;
    const entity = readable(hass, id);
    const fullValue = entity ? wearValue(hass, entity) : WEAR_MISSING;
    rows.push({ key: c.key, icon: c.icon, label: c.label(), value: capText(fullValue), fullValue });
  }
  return rows;
}

/** FR-7: HA's formatted value (unit included), else the raw state and its own unit. */
export function wearValue(hass: HomeAssistantExt, entity: HassEntity): string {
  const formatted = formattedState(hass, entity);
  if (formatted !== undefined) return formatted;
  const attributes = entity.attributes ?? {};
  // Object.hasOwn semantics; the tsconfig lib predates ES2022.
  const unit: unknown = Object.prototype.hasOwnProperty.call(attributes, 'unit_of_measurement')
    ? attributes['unit_of_measurement']
    : undefined;
  const raw = rawState(entity);
  return typeof unit === 'string' && unit.trim() !== '' ? `${raw}${NBSP}${unit.trim()}` : raw;
}

/** FR-6: the collapsible section, absent when no counter is configured. */
export function renderWearCounters(
  rows: readonly WearCounterRow[],
  open: boolean,
  onToggle: (open: boolean) => void,
  connection: HomeAssistantExt['connection'],
): TemplateResult | typeof nothing {
  if (rows.length === 0) return nothing;
  return html`
    <sf-editor-accordion
      class="wear-counters"
      element-id="wear"
      title="${msg('Wear')}"
      icon="mdi:wrench-clock"
      ?open=${open}
      @sf-accordion-toggle=${(e: CustomEvent<{ open: boolean }>) => onToggle(e.detail.open)}
    >
      ${rows.map(
        (r) => html`
          <div class="wear-counter ${r.key.replace(/^sensor_/, '')}">
            <sf-icon icon="${r.icon}" aria-hidden="true" .connection="${connection}"></sf-icon>
            <span class="wear-label" title="${r.label}">${r.label}</span>
            <span class="wear-value" title="${r.fullValue}">${r.value}</span>
          </div>
        `,
      )}
    </sf-editor-accordion>
  `;
}
