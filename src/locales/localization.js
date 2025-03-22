import {configureLocalization} from '@lit/localize';

import {sourceLocale, targetLocales} from './locale-codes.js';
import * as templates_fr from './locales/fr.js';

const localizedTemplates = new Map([['fr', templates_fr]]);

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => localizedTemplates.get(locale),
});
