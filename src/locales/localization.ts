import { configureLocalization } from '@lit/localize';

import { sourceLocale, targetLocales } from './locale-codes.js';
// Generated JS file from lit-localize. Resolvable since tsconfig sets allowJs
// (checkJs stays off), so no @ts-expect-error is needed — and TS rejects an
// unused one.
import { templates as frTemplates } from './locales/fr.js';

const localizedTemplates = new Map([['fr', { templates: frTemplates }]]);
(window as any).__scifi_frTemplates = frTemplates;

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  // eslint-disable-next-line @typescript-eslint/require-await
  loadLocale: async (locale) => localizedTemplates.get(locale)!,
});
