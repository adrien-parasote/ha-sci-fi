import { expect, describe, it } from 'vitest';
import { climateStyles } from '../../../src/cards/climates/styles.js';

describe('climates styles', () => {
  it('exports styles correctly', () => {
    expect(climateStyles).to.exist;
    expect(climateStyles.cssText).to.be.a('string');
  });
});
