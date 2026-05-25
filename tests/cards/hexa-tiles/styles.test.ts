import { expect, describe, it } from 'vitest';
import { hexaTilesStyles } from '../../../src/cards/hexa-tiles/styles.js';

describe('hexa-tiles styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(hexaTilesStyles).toBeDefined();
    expect(typeof (hexaTilesStyles as any).cssText).toBe('string');
  });
});
