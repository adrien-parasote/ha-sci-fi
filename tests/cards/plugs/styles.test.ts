import { expect, describe, it } from 'vitest';
import { plugStyles } from '../../../src/cards/plugs/styles.js';

describe('plugs styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(plugStyles).toBeDefined();
    expect(typeof (plugStyles as any).cssText).toBe('string');
  });
});
