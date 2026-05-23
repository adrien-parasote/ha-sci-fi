import { expect, describe, it, beforeEach } from 'vitest';
import { sciFiCommonStyles, sciFiEditorStyles } from '../../src/styles/common.js';

describe('common styles', () => {
  it('exports css tagged template literals', () => {
    expect(sciFiCommonStyles).to.exist;
    // @ts-ignore
    expect(sciFiCommonStyles.cssText).to.include('--sf-primary');

    expect(sciFiEditorStyles).to.exist;
    // @ts-ignore
    expect(sciFiEditorStyles.cssText).to.include('.editor-row');
  });
});
