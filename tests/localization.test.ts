// @vitest-environment happy-dom
/**
 * Tests — src/locales/localization.ts
 *
 * Written during the P14 pass (bead ha-sci-fi-9xf): the module had no test, which
 * the TDD gate was flagging. It is small but load-bearing — every msg() in the
 * codebase resolves through the configuration it builds.
 */
import { expect, describe, it } from 'vitest';

import { getLocale, setLocale } from '../src/locales/localization.js';
import { sourceLocale, targetLocales } from '../src/locales/locale-codes.js';

describe('localization', () => {
  it('exposes the lit-localize runtime pair', () => {
    expect(getLocale).toBeTypeOf('function');
    expect(setLocale).toBeTypeOf('function');
  });

  it('starts on the source locale', () => {
    expect(getLocale()).toBe(sourceLocale);
  });

  it('declares fr as a target locale and exposes its templates for the workbench', () => {
    expect([...targetLocales]).toContain('fr');
    // sci-fi.ts and the dev workbench read this to switch language without a rebuild.
    expect((window as any).__scifi_frTemplates).toBeDefined();
  });

  it('switches to a declared target locale and back', async () => {
    await setLocale('fr');
    expect(getLocale()).toBe('fr');

    await setLocale(sourceLocale);
    expect(getLocale()).toBe(sourceLocale);
  });

  it('rejects a locale that is not declared', () => {
    // lit-localize throws synchronously on an unknown code — it does not hand back
    // a rejected promise, so a caller using .catch() alone would miss it.
    expect(() => setLocale('de')).toThrow(/Invalid locale/);
    expect(getLocale()).toBe(sourceLocale);
  });
});
