import { expect, describe, it, beforeEach } from 'vitest';
import { sciFiCommonStyles } from '../../src/styles/common.js';

describe('common styles', () => {
  it('exports css tagged template literals', () => {
    expect(sciFiCommonStyles).to.exist;
    // @ts-ignore
    expect(sciFiCommonStyles.cssText).to.include('--sf-primary');
  });
});
