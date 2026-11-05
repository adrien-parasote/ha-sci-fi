/**
 * Number-wheel mechanism of the stove card (power level, fan speed).
 * Moved verbatim from sci-fi-stove.ts — docs/specs/stove-diagnostics/spec.md FR-1.
 */
import { msg } from '@lit/localize';

import { DOMAIN } from '../../types/domains.js';

// ── Number wheels (specs docs/specs/stove-power-level, docs/specs/stove-fan-speed) ──
/** Quiet time after the last wheel pick before the one set_value call (FR-8). */
export const NUMBER_DEBOUNCE_MS = 400;
/** Beyond this many items the bounds are replaced by the wheel's fallback trio (FR-5.1). */
export const NUMBER_MAX_ITEMS = 50;
/** The two writable domains a number wheel entity may belong to (FR-12). */
export const NUMBER_DOMAINS: readonly string[] = [DOMAIN.NUMBER, DOMAIN.INPUT_NUMBER];

export interface NumberTrio {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export type NumberWheelKey = 'powerLevel' | 'fanSpeed';

/** One number wheel of the bottom bar: everything that differs between the power and the fan wheels. */
export interface NumberWheelSpec {
  readonly key: NumberWheelKey;
  readonly field: 'number_power_level' | 'number_fan_speed';
  readonly cssClass: string;
  readonly fallback: NumberTrio;
  readonly label: () => string;
  readonly successMessage: () => string;
  readonly unavailableMessage: () => string;
}

/** Rendering order (stove-fan-speed FR-4): power first, then fan. */
export const NUMBER_WHEELS: readonly NumberWheelSpec[] = [
  {
    key: 'powerLevel',
    field: 'number_power_level',
    cssClass: 'power-level',
    fallback: { min: 1, max: 5, step: 1 },
    label: () => msg('Power'),
    successMessage: () => msg('Power level changed'),
    unavailableMessage: () => msg('Power level unavailable'),
  },
  {
    key: 'fanSpeed',
    field: 'number_fan_speed',
    cssClass: 'fan-speed',
    fallback: { min: 0, max: 5, step: 1 },
    label: () => msg('Fan'),
    successMessage: () => msg('Fan speed changed'),
    unavailableMessage: () => msg('Fan speed unavailable'),
  },
];

/** A pick not yet released to HA's state (FR-8); `sent` once set_value left. */
export interface NumberPick {
  readonly index: number;
  readonly sent: boolean;
}

export type NumberPicks = Readonly<Record<NumberWheelKey, NumberPick | null>>;

export interface NumberGrid {
  readonly min: number;
  readonly step: number;
  /** number of items */
  readonly n: number;
  /** decimals shown and kept */
  readonly d: number;
}

export type NumberEntity = { state: unknown; attributes: Record<string, unknown> };

/** FR-5: a finite number, or a non-blank string that reads as one. parseFloat is never used. */
export function isNumeric(raw: unknown): boolean {
  // Number.isFinite never coerces: it is true only for a finite number value.
  if (typeof raw === 'string') return raw.trim() !== '' && Number.isFinite(Number(raw));
  return Number.isFinite(raw);
}

/** FR-5.2: the smallest j in 0..10 such that x·10^j is an integer (10 when none). */
export function decimals(x: number): number {
  for (let j = 0; j <= 10; j++) {
    const scaled = x * 10 ** j;
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9) return j;
  }
  return 10;
}

export function gridOf(min: number, max: number, step: number): NumberGrid {
  return {
    min,
    step,
    n: Math.floor((max - min) / step + 1e-9) + 1,
    d: Math.max(decimals(min), decimals(step)),
  };
}

/** FR-5.1: per-bound fallback, then the whole trio falls back when it is incoherent or too large. */
export function numberGrid(attrs: Record<string, unknown> | undefined, fallback: NumberTrio): NumberGrid {
  const bound = (key: keyof NumberTrio): number =>
    isNumeric(attrs?.[key]) ? Number(attrs?.[key]) : fallback[key];
  const min = bound('min');
  const max = bound('max');
  const step = bound('step');
  const fallbackGrid = gridOf(fallback.min, fallback.max, fallback.step);
  if (step <= 0 || min > max) return fallbackGrid;
  const grid = gridOf(min, max, step);
  return grid.n > NUMBER_MAX_ITEMS ? fallbackGrid : grid;
}

/** v_k of FR-5.2, rounded to the grid's decimals. */
export function numberValue(grid: NumberGrid, k: number): number {
  return Number((grid.min + k * grid.step).toFixed(grid.d));
}

/**
 * FR-7: an unreadable state disables the wheel. HA's two non-value states
 * (unavailable, unknown) are not numeric, so this one test covers them.
 * The climate state never counts.
 */
export function isNumberDisabled(entityState: { state: unknown }): boolean {
  return !isNumeric(entityState.state);
}
