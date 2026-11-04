// @vitest-environment happy-dom
/** Fix lot stove-bridge, O2 (bead ha-sci-fi-bnf): setConfig refuses a stove config without `entity`. */
import { describe, it, expect } from 'vitest';
import '../../../src/cards/stove/sci-fi-stove.js';

function make(): any {
  return document.createElement('sci-fi-stove');
}

describe('O2', () => {
  it('test_O2_setconfig_refuses_a_config_without_entity', () => {
    expect(() => make().setConfig({ type: 'custom:sci-fi-stove' })).toThrow('You need to define an entity');
    expect(() => make().setConfig({ type: 'custom:sci-fi-stove', entity: '' })).toThrow('You need to define an entity');
    // positive control: a config with an entity is accepted
    expect(() => make().setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' })).not.toThrow();
  });
});
