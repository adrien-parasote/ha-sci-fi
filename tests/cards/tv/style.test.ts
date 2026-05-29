import { expect, describe, it } from 'vitest';
import { tvStyles } from '../../../src/cards/tv/style.js';

describe('tv styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(tvStyles).toBeDefined();
    expect(typeof (tvStyles as any).cssText).toBe('string');
  });
});
