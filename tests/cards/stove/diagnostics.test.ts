/**
 * Pure helpers of the stove diagnostics.
 * Spec: docs/specs/stove-diagnostics/spec.md (FR-3, FR-5, FR-7, FR-14)
 */
import { expect, describe, it } from 'vitest';
import {
  configuredId,
  readDiagnostic,
  isDoorOpen,
  isReported,
  errorCode,
  errorText,
  capText,
  capErrorText,
} from '../../../src/cards/stove/diagnostics.js';

const e = (state: unknown, attributes: Record<string, unknown> = {}) => ({ state, attributes }) as any;

describe('stove diagnostics helpers', () => {
  it('TC-SDG-U-02: configuredId keeps non-blank strings only, trimmed', () => {
    expect(configuredId(' sensor.x ')).toBe('sensor.x');
    for (const raw of [undefined, 42, ['x'], '', '   ', null]) expect(configuredId(raw)).toBeUndefined();
  });

  it('TC-SDG-U-12: readDiagnostic checks own property and domain', () => {
    const states = Object.assign(Object.create({ 'sensor.p': e('x') }), { 'sensor.a': e('x'), 'switch.a': e('x') });
    expect(readDiagnostic(states, 'sensor.a', 'sensor.')).toBe(states['sensor.a']);
    expect(readDiagnostic(states, 'sensor.p', 'sensor.')).toBeUndefined();
    expect(readDiagnostic(states, 'switch.a', 'sensor.')).toBeUndefined();
    expect(readDiagnostic(states, undefined, 'sensor.')).toBeUndefined();
  });

  it('TC-SDG-U-03: normalisation of door, alert and error states', () => {
    expect(isDoorOpen(e(' ON '))).toBe(true);
    for (const s of ['off', 'unavailable', 42, '']) expect(isDoorOpen(e(s))).toBe(false);
    expect(isReported(e('low_fuel'))).toBe(true);
    for (const s of ['none', ' None ', 'UNAVAILABLE', 'unknown', '', '  ', 7]) expect(isReported(e(s))).toBe(false);
  });

  it('TC-SDG-U-05: errorCode and errorText', () => {
    expect(errorCode(' E101 ')).toBe('E101');
    expect(errorCode(0)).toBe('0');
    for (const raw of [undefined, '', '  ', NaN, Infinity, {}, true]) expect(errorCode(raw)).toBeUndefined();
    expect(errorText('Ignition failure', 'E101')).toBe('Ignition failure (E101)');
    expect(errorText('Ignition failure', undefined)).toBe('Ignition failure');
    expect(errorText(' e101 ', 'E101')).toBe('E101');
  });

  it('TC-SDG-U-13: caps keep the code', () => {
    expect(capText('x'.repeat(200))).toBe('x'.repeat(200));
    expect(capText('x'.repeat(201))).toBe(`${'x'.repeat(199)}…`);
    const t = capErrorText('a'.repeat(300), 'E101');
    expect(t.length).toBe(200);
    expect(t.endsWith('… (E101)')).toBe(true);
    const c = capErrorText('a'.repeat(300), 'C'.repeat(40));
    expect(c.length).toBeLessThanOrEqual(200);
    expect(c.endsWith(`… (${'C'.repeat(32)})`)).toBe(true);
    expect(capErrorText('short', 'E1')).toBe('short (E1)');
    expect(capErrorText('e1', 'E1')).toBe('E1');
    expect(capErrorText('label', undefined)).toBe('label');
  });

  it('TC-SDG-U-13: a short label beside a long code is not marked as cut', () => {
    expect(capErrorText('Ignition failure', 'C'.repeat(250))).toBe(`Ignition failure (${'C'.repeat(32)})`);
  });
});
