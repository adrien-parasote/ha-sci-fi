import { expect, describe, it } from 'vitest';
import { vacuumStyles } from '../../../src/cards/vacuum/styles.js';

describe('vacuum styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(vacuumStyles).toBeDefined();
    expect(typeof (vacuumStyles as any).cssText).toBe('string');
  });
});
