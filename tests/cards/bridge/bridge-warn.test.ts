// @vitest-environment happy-dom
/**
 * Tests — bridge-warn (warnOnce / resetBridgeWarnings)
 * Spec: docs/specs/bridge-error-matrix/spec.md FR-1
 */
import { expect, describe, it, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { warnOnce, resetBridgeWarnings } from '../../../src/cards/bridge/bridge-warn.js';

describe('bridge-warn', () => {
  let warn: MockInstance<typeof console.warn>;
  beforeEach(() => {
    resetBridgeWarnings();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
    resetBridgeWarnings();
  });

  it('TC-BEM-U-01: warns once per reason+entity pair until resetBridgeWarnings()', () => {
    warnOnce('not-found', 'sensor.a');
    warnOnce('not-found', 'sensor.a');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenLastCalledWith('[sf-bridge] entity not found:', 'sensor.a');

    warnOnce('not-found', 'sensor.b');
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenLastCalledWith('[sf-bridge] entity not found:', 'sensor.b');

    warnOnce('non-numeric', 'sensor.a');
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenLastCalledWith('[sf-bridge] non-numeric state:', 'sensor.a');

    resetBridgeWarnings();
    warnOnce('not-found', 'sensor.a');
    expect(warn).toHaveBeenCalledTimes(4);
  });

  it('TC-BEM-U-11: warnOnce ignores empty and non-string entity ids', () => {
    warnOnce('not-found', '');
    warnOnce('not-found', undefined);
    warnOnce('non-numeric', 42);
    expect(warn).not.toHaveBeenCalled();
  });
});
