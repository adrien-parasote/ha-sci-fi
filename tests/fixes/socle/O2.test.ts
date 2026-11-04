/** Fix lot socle, O2 (bead ha-sci-fi-oyir.2 / ha-sci-fi-u9a): selectors with no caller and no TC are gone. */
import { describe, it, expect } from 'vitest';
import * as house from '../../../src/selectors/house.js';
import * as light from '../../../src/selectors/light.js';
import * as climate from '../../../src/selectors/climate.js';

describe('O2', () => {
  it('test_O2_uncalled_selectors_without_tc_are_not_exported', () => {
    expect(Object.keys(house)).not.toContain('getFirstFloor');
    expect(Object.keys(light)).not.toContain('getLightState');
    expect(Object.keys(climate)).not.toContain('getClimateState');
    // positive control: the module namespace is really read
    expect(Object.keys(house)).toContain('getFloors');
  });
});
