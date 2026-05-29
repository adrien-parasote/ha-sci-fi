# Implementation Plan — Card Configurations i18n Fix

This plan outlines the diagnosis and solution for the bug where i18n/localization is not applied to the card editors/configurations.

---

## Strategic Diagnosis & Issues Identified

1. **Locale Normalization Race / Mismatch:**  
   Home Assistant provides locale codes like `"fr-FR"` or `"fr-CA"`. However, `@lit/localize` is configured with `targetLocales: ["fr"]`. Calling `setLocale("fr-FR")` directly throws an error because `"fr-FR"` is not registered. We need to normalize language codes to their 2-letter prefix (`"fr"` / `"en"`) before comparing and calling `setLocale()`.

2. **Missing Translations in XLIFF Source:**  
   The `xliff/fr.xlf` file defines `<trans-unit>` entries for all editor-related strings but completely lacks `<target>` elements for them. Thus, `lit-localize build` defaults to using the `<source>` tags (English) during translation compilation. We must add the `<target>` elements with proper French translations to `xliff/fr.xlf` and rebuild.

---

## Proposed Changes

### 1. Base Class Layer

We will normalize incoming locale codes to either `fr` or `en` inside the `hass` property setter of both base card and base editor classes to prevent loading errors.

#### [MODIFY] [base-card.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-card.ts)
* Normalize `hass.locale.language` to `fr` (if prefix is `fr`) or `en` before passing to `setLocale` and `getLocale()`.

#### [MODIFY] [base-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-editor.ts)
* Apply the identical normalization of `hass.locale.language` in the base editor class.

---

### 2. Localization Layer

We will add the missing `<target>` tags with their corresponding French translations to `xliff/fr.xlf`.

#### [MODIFY] [fr.xlf](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/xliff/fr.xlf)
* Populate `<target>` tags for all missing editor-related fields.

---

## Verification Plan

### Automated Tests
* Run `npm run typecheck` to verify TypeScript compile.
* Run `npm run localize-build` to compile localization files.
* Run `npm run test` to verify all Vitest tests pass cleanly.

### Manual Verification
* Build rollup: `npm run build`
* Launch local workbench `dev/workbench.html` and toggle between EN/FR, verifying that ALL card configurations and accordion settings/labels translate seamlessly into French.
