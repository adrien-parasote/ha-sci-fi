/** Fix lot stove-bridge, O5 (bead ha-sci-fi-prw): running_states must be an array of strings. */
import { describe, it, expect } from 'vitest';
import { validateBridgeConfig } from '../../../src/cards/bridge/bridge-validate.js';

const T = 'custom:sci-fi-bridge';
const cycle = (running_states: unknown) => ({ type: T, appliances: { cycles: [{ entity: 'sensor.a' }, { entity: 'sensor.b', running_states }] } });

describe('O5', () => {
  it('test_O5_running_states_must_be_an_array_of_strings', () => {
    const msg = 'appliances.cycles[1].running_states: expected an array of strings';
    expect(validateBridgeConfig(cycle('Running'))).toBe(msg);
    expect(validateBridgeConfig(cycle(['Running', 3]))).toBe(msg);
    // positive control: a valid list passes
    expect(validateBridgeConfig(cycle(['Running']))).toBeNull();
  });
});
