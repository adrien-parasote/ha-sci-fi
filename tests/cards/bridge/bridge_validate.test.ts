/**
 * Tests — validateBridgeConfig (rule order and message shape of FR-8).
 * The per-rule card-level cases live in bridge-error-matrix.test.ts.
 */
import { expect, describe, it } from 'vitest';
import { validateBridgeConfig } from '../../../src/cards/bridge/bridge-validate.js';

const T = 'custom:sci-fi-bridge';

describe('validateBridgeConfig', () => {
  it('returns null for a minimal and for a complete valid config', () => {
    expect(validateBridgeConfig({ type: T })).to.equal(null);
    expect(
      validateBridgeConfig({
        type: T,
        persons: [{ entity: 'person.a' }],
        stove: { pellet_quantity: 'a', pellet_stock: 'b', status: 'c' },
        vehicle: { power_sensor: 'd' },
        access: { items: [{ entity: 'cover.a', lock: 'lock.a' }] },
      })
    ).to.equal(null);
  });

  it('first failing rule wins: type before section shape before array shape', () => {
    expect(validateBridgeConfig({ persons: {}, stove: [] })).to.equal('type: expected a string');
    expect(validateBridgeConfig({ type: T, stove: [], persons: {} })).to.equal('stove: expected an object');
    expect(validateBridgeConfig({ type: T, persons: {}, vehicle: {} })).to.equal('persons: expected an array');
  });

  it('never reflects the offending value', () => {
    const msg = validateBridgeConfig({ type: T, persons: [{ entity: { x: 'LEAK-1' } }] });
    expect(msg).to.equal('persons[0].entity: expected a string');
  });
});
