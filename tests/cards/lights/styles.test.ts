import { expect, describe, it } from 'vitest';
import { lightStyles } from '../../../src/cards/lights/styles.js';

describe('lights styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(lightStyles).toBeDefined();
    expect(typeof (lightStyles as any).cssText).toBe('string');
  });
});
