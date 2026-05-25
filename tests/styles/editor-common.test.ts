import { expect, describe, it } from 'vitest';
import { sciFiEditorCommonStyles } from '../../src/styles/editor-common.js';

describe('editor-common styles', () => {
  it('is a valid Lit CSSResult', () => {
    expect(sciFiEditorCommonStyles).toBeDefined();
    expect(typeof (sciFiEditorCommonStyles as any).cssText).toBe('string');
  });
});
