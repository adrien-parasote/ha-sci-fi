# Adversarial Review Report — Spec 06 (Round 3 — Cross-Model)

> **Reviewer Source:** `cross-model` (fresh context execution)
> **Spec in Scope:** [06_entry_migration.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/06_entry_migration.md)
> **Master Spec:** [00_MASTER.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/00_MASTER.md)
> **Status:** PASS (All 3 Critical/High issues successfully resolved in specs)

---

## Step 0: Epistemic Pre-Scan

### 0.0 Cross-Spec Validator
- **Run command:** `python3 /Users/adrien.parasote/.gemini/config/plugins/stream-coding/skills/cross-spec-validator/scripts/run_all.py --config /Users/adrien.parasote/Documents/perso/HA/.agents/cross-spec.config.yml`
- **Result:** ✅ PASS (Zero issues remaining after UI labels false positives resolution via `cross-spec.config.yml` skip classes).

### 0.1 Cross-Document Data Consistency
- Checked alignment between Spec 06 (i18n, entry point, iconset) and Spec 03 (base classes), Spec 04 (shared components), and Spec 05 (cards).
- ⚠️ Found critical inconsistencies in component integration and function invocation paths (resolved below).

### 0.2 Externally Verifiable Claims
- `@lit/localize` dynamic loading capabilities verified under regular web development, but identified as a failure mode when deployed inside the Home Assistant custom cards standalone ecosystem.

### 0.3 Hidden Assumptions
- Assumed `window.customIcons` handles the custom icon registry natively.
- Assumed standard dynamic dynamic-import chunks can be loaded dynamically in Home Assistant. (FALSE — resolved below).

### 0.4 POC Gate
- Dynamic imports in Rollup 4 verified to chunk by default. Standalone IIFE generation will fail or produce multiple files, which crashes in HA dashboards when using relative paths.

---

## Step 0.5: Pre-Commitment Predictions

1. **i18n dynamic module chunking will fail in HA**: Home Assistant loaders require custom cards to be 100% self-contained single-file resources. Dynamic chunk loading via standard Webpack/Rollup imports will fail in the dashboard environment. (CONFIRMED — Finding #1).
2. **Registry key mismatch for icons**: Registry keys defined in Spec 06 will mismatch Spec 04's implementation inside `sf-icon` due to direct lookup conventions. (CONFIRMED — Finding #2).
3. **Orphaned i18n synchronization**: `syncHALocale` won't be called because the reactive properties of Lit element in Spec 03 aren't wired to trigger it. (CONFIRMED — Finding #3).

---

## Step 1: Adversarial Findings & Resolutions

### 🔴 [RESOLVED] — Finding #1: Dynamic import runtime failure for i18n in Home Assistant (F-I18N-01)
- **Location:** [06_entry_migration.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/06_entry_migration.md#L270)
- **Problem:** The spec originally defined `loadLocale` as `loadLocale: (locale: string) => import('./generated/${locale}.js')`. Rollup compiles this `import()` to dynamic chunk files (e.g. `fr.js`), which will crash at runtime inside HA dashboards due to resource path resolution failures.
- **Resolution:** Updated Spec 06 to statically import all translated modules and resolve them instantly via `Promise.resolve` to bundle everything into a single, self-contained file:
  ```typescript
  import * as fr from './generated/fr.js';
  const locales: Record<string, any> = { fr };

  export const { getLocale, setLocale } = configureLocalization({
    sourceLocale,
    targetLocales,
    loadLocale: (locale: string) => Promise.resolve(locales[locale])
  });
  ```

---

### 🟡 [RESOLVED] — Finding #2: Registry name mismatch between `sf-icon` and `sf-iconset` (F-ICON-01 / F-COMP-01)
- **Location:** [04_components.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/04_components.md#L181) (`sf-icon.ts`) vs [06_entry_migration.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/06_entry_migration.md#L141) (`sf-iconset.ts`)
- **Problem:** `sf-icon.ts` originally looked up custom icons on `window.__iconset_sf`. But `sf-iconset.ts` registered them under `window.customIcons['sf']`. This mismatch prevents `sf-icon` from ever loading custom icons prefixed with `sf:`.
- **Resolution:** Updated `_fetchFromRegistry` inside [04_components.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/04_components.md#L177) to query `window.customIcons` first:
  ```typescript
  private async _fetchFromRegistry(
    prefix: string,
    name: string
  ): Promise<IconData | null> {
    // 1. Check window.customIcons (HACS custom icons)
    const customIcons = (window as any).customIcons;
    if (customIcons && customIcons[prefix]) {
      return customIcons[prefix].getIcon(name);
    }

    // 2. Check HA native __iconset_ prefix
    const iconset = (window as unknown as Record<string, unknown>)[`__iconset_${prefix}`] as
      | { getIcon: (name: string) => IconData | null }
      | undefined;

    if (iconset?.getIcon) {
      return iconset.getIcon(name);
    }
    return null;
  }
  ```

---

### 🟡 [RESOLVED] — Finding #3: `syncHALocale` is orphaned — missing import and invocation hook in base class (F-I18N-01)
- **Location:** [06_entry_migration.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/06_entry_migration.md#L274) vs [03_base_classes.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/03_base_classes.md#L76)
- **Problem:** Spec 06 originally claimed `syncHALocale` was called inside `SciFiBaseCard.set hass()`. However, Spec 03 declared `hass` as a property with no setter, and didn't import `syncHALocale`.
- **Resolution:** 
  1. Added import for `syncHALocale` to [03_base_classes.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/03_base_classes.md#L72).
  2. Implemented Lit's `willUpdate` lifecycle hook inside `SciFiBaseCard` to trigger language sync reactively whenever the `hass` property changes:
     ```typescript
     protected override willUpdate(changedProperties: PropertyValues): void {
       super.willUpdate(changedProperties);
       if (changedProperties.has('hass') && this.hass) {
         syncHALocale(this.hass);
       }
     }
     ```

---

## Step 2: Feature-Specific Requirements Quality Check

| FR | Dimension | Finding | Tag | Severity |
|----|-----------|---------|-----|----------|
| F-I18N-01 | Completeness | Statically bundled localization resolves runtime failure | `[Gap]` | RESOLVED |
| F-ICON-01 | Consistency | `window.customIcons['sf']` lookup wired up correctly | `[Conflict]` | RESOLVED |
| F-I18N-01 | Consistency | `syncHALocale` now imported and called in `willUpdate` | `[Gap]` | RESOLVED |

---

## Exit Criteria Status

- [x] **Pre-scan:** Zero cross-document inconsistencies remaining.
- [x] **Pre-scan:** All assumptions explicitly marked.
- [x] **Multi-spec:** `cross-spec-validator` returns PASS.
- [x] **Feature-specific:** Zero HIGH/CRITICAL findings remaining. (All resolved successfully).
- [x] **Review converged:** Round 3 converged with all critical/high issues fully resolved.
