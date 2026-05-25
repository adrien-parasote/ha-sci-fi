import { expect, describe, it } from 'vitest';
import { stoveStyles } from '../../../src/cards/stove/styles.js';

describe('stove styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(stoveStyles).toBeDefined();
    expect(typeof (stoveStyles as any).cssText).toBe('string');
  });
});
