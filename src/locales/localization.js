import {configureLocalization} from '@lit/localize';

import {sourceLocale, targetLocales} from './locale-codes.js';

const localizedTemplates = new Map(
  targetLocales.map((locale) => [locale, import(`./locales/${locale}.js`)])
);

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => localizedTemplates.get(locale),
});
