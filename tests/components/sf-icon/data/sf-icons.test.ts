import { expect, describe, it } from 'vitest';
import CUSTOM_ICONS from '../../../../src/components/sf-icon/data/sf-icons.js';

describe('sf-icons data', () => {
  it('contains valid svg path string data', () => {
    expect(CUSTOM_ICONS).to.be.an('object');
    expect(CUSTOM_ICONS.stove).to.be.a('string');
  });
});
