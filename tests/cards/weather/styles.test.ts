import { expect, describe, it } from 'vitest';
import { weatherStyles } from '../../../src/cards/weather/styles.js';

describe('weather styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(weatherStyles).toBeDefined();
    expect(typeof (weatherStyles as any).cssText).toBe('string');
  });
});
