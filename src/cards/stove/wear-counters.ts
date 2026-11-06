/**
 * Wear counters of the stove card (fumis total_increasing sensors): a header button opens a stats view.
 * Spec: docs/specs/stove-wear-counters/spec.md FR-2.1, FR-3, FR-5, FR-6, FR-7.
 */
import { html, nothing, type TemplateResult } from 'lit';
import { msg } from '@lit/localize';

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

/** FR-7: a plain decimal; `Number()` alone would also read '0x10', '0b11' as numbers. */
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

const wellFormed =(id: string): boolean => id.length <= ID_MAX && ID_SHAPE.test(id);

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

/** FR-7: the unit of an entity, from its own `unit_of_measurement` attribute. */
function unitOf(entity: HassEntity): string {
  const attributes = entity.attributes ?? {};
  // Object.hasOwn semantics; the tsconfig lib predates ES2022.
  const unit: unknown = Object.prototype.hasOwnProperty.call(attributes, 'unit_of_measurement')
    ? attributes['unit_of_measurement']
    : undefined;
  return typeof unit === 'string' ? unit.trim() : '';
}

/** FR-7: a numeric state is rounded to one decimal; any other state goes through HA's formatter, else the raw state. */
export function wearValue(hass: HomeAssistantExt, entity: HassEntity): string {
  const raw = rawState(entity);
  const n = Number(raw);
  const numeric = DECIMAL.test(raw.trim()) && Number.isFinite(n);
  if (!numeric) {
    const formatted = formattedState(hass, entity);
    if (formatted !== undefined) return formatted;
  }
  const value = numeric ? String(Number(n.toFixed(1))) : raw;
  const unit = unitOf(entity);
  return unit !== '' ? `${value}${NBSP}${unit}` : value;
}

/** FR-6: the header button, absent when no counter is configured. */
export function renderWearToggle(
  rows: readonly WearCounterRow[],
  open: boolean,
  onToggle: (open: boolean) => void,
  connection: HomeAssistantExt['connection'],
): TemplateResult | typeof nothing {
  if (rows.length === 0) return nothing;
  return html`
    <button class="wear-toggle" type="button" aria-label="${msg('Wear')}" aria-expanded="${open}" @click=${() => onToggle(!open)}>
      <sf-icon icon="${open ? 'mdi:close' : 'mdi:wrench-clock'}" aria-hidden="true" .connection="${connection}"></sf-icon>
    </button>
  `;
}

/** FR-6: the stats view that replaces the card body while open. */
export function renderWearView(rows: readonly WearCounterRow[], connection: HomeAssistantExt['connection']): TemplateResult {
  return html`
    <div class="wear-view" role="region" aria-label="${msg('Wear')}">
      ${rows.map(
        (r) => html`
          <div class="wear-counter ${r.key.replace(/^sensor_/, '')}">
            <sf-icon icon="${r.icon}" aria-hidden="true" .connection="${connection}"></sf-icon>
            <span class="wear-label" title="${r.label}">${r.label}</span>
            <span class="wear-value" title="${r.fullValue}">${r.value}</span>
          </div>
        `,
      )}
    </div>
  `;
}
