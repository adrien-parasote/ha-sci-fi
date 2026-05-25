import { expect, describe, it } from 'vitest';
import { vehicleStyles } from '../../../src/cards/vehicles/styles.js';

describe('vehicles styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(vehicleStyles).toBeDefined();
    expect(typeof (vehicleStyles as any).cssText).toBe('string');
  });
});
