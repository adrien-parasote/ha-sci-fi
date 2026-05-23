# Adversarial Review Summary

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026
> Reviewer Source: `cross-model` (Antigravity-Adversarial)
> Overall Verdict: **PASS WITH MITIGATIONS** (CRITICAL/HIGH issues must be resolved before BUILD)

---

## 🔍 Overview of the Review

A rigorous, skeptical adversarial review was performed across the entire specification suite of the `ha-sci-fi` project.
The specs are of exceptionally high quality, fully matching the structural requirements of Stream Coding (100% precheck script success). However, some deep technical assumptions and boundary-scoping edge cases were flagged for mitigation.

---

## 🎯 Predictions vs. Findings

We compare our pre-commitment predictions against the actual semantic findings discovered during the stress-test.

| Prediction Area | Confirmed? | Actual Finding Ref | Notes |
|---|---|---|---|
| **Spec 01 (Infra): Decorators Compile** | ✅ Yes | [HIGH-02](./05-findings-high.md#2-high--rollup-4-typescript-decorators-compilation-failure) | Explicit Rollup compiler flags required to compile Lit decorators cleanly. |
| **Spec 02 (Selectors): Unsafe State** | ❌ No | *Skipped* | Selector functions naturally return default empty structures. |
| **Spec 02 (Selectors): House State** | ✅ Yes | [HIGH-01](./05-findings-high.md#1-high--domain-selector-architectural-contradiction-house-state-registry) | Contradiction: obsolete `selectHouseState()` was kept despite the blueprint deleting it. |
| **Spec 02 (Selectors): Zod size** | ✅ Yes | [MEDIUM-01](./06-findings-medium.md#1-medium--zod-bundle-size-overhead-risk) | Zod dependency is too heavy (~45KB) for a single-file IIFE bundle. |
| **Spec 03 (Base): Super lifecycle calls** | ✅ Yes | [MEDIUM-02](./06-findings-medium.md#2-medium--omission-of-superwillupdate-in-card-subclasses) | card subclasses overriding willUpdate would bypass base locale sync. |
| **Spec 04 (Shared): Offline Icons** | ✅ Yes | [CRITICAL-01](./04-findings-critical.md#critical--dynamic-mdi-icon-fetch-fallback-deficiency-offline-ha-support) | Gaps in fallback fetch endpoint url will break offline installations. |
| **Spec 04 (Shared): Incognito Mode** | ✅ Yes | [MEDIUM-03](./06-findings-medium.md#3-medium--indexdb-incognito-mode-diagnostic-fallback) | IndexedDB blocks inside private windows need rate-limitedMap fallback. |
| **Spec 05 (Cards): Weather Chart Dynamic CDN** | ✅ Yes | [HIGH-03](./05-findings-high.md#3-high--chart-js-offline-failure-in-sci-fi-weather-card) | Weather forecast chart dynamic loading breaks completely offline. |
| **Spec 06 (Entry): Overwrite customIcons** | ✅ Yes | [HIGH-04](./05-findings-high.md#4-high--defensive-windowcustomicons-merger) | Overwriting customIcons without defensive check causes crash or collision. |

*Note: The high rate of prediction confirmation proves that our pre-commitment expectations accurately targeted the technological friction-points of modern Home Assistant card developments.*

---

## 📊 Summary of Findings

- **[CRITICAL] — Dynamic MDI Icon Fetch Fallback Deficiency (Offline HA Support)**: Lack of defined MDI source URL leads to CDN dependencies that fail offline.
- **[HIGH] — Domain Selector Architectural Contradiction**: Obsolete `selectHouseState()` referenced despite blueprint deleting it.
- **[HIGH] — Rollup 4 TypeScript Decorators Compilation Failure**: Missing Rollup overrides for compiling decorator syntax cleanly.
- **[HIGH] — Chart.js Offline Failure**: Dynamic Chart.js load will crash weather card in offline instances.
- **[HIGH] — Defensive window.customIcons Merger**: Direct assignment blocks/overwrites other icon set packages.
- **[MEDIUM] — Zod Bundle Size Overhead**: Zod integration inflates the final single-file bundle by ~45KB.
- **[MEDIUM] — Omission of super.willUpdate**: Subclass overrides bypass base card locale sync updates.
- **[MEDIUM] — IndexDB Incognito Mode Fallback**: Incognito browser blocking will trigger fetch floods on dashboards.

---

## 📋 Next Steps

To exit the SPEC stage and proceed safely to BUILD:
1. Update `02_domain_selectors.md` to remove `selectHouseState()` and add direct entity queries.
2. Update `04_components.md` to define offline icon fetch handling using Home Assistant's local registries.
3. Update `01_infrastructure.md` to explicitly declare Rollup compiler decorator options.
4. Update `05_cards.md` and `06_entry_migration.md` to cover defensive customIcons registration and Chart.js static fallbacks.
