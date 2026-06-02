# Spec 06 — Entry Point & Migration

> Document Type: Implementation
> Covers: Step 6 (Entry) from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1), [Spec 03](./03_base_classes.md#L1), [Spec 04](./04_components.md#L1), [Spec 05](./05_cards.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-ENTRY-01 | Main entry point script setup | ✅ `src/sci-fi.ts` |
| F-ICON-01 | Custom iconset registrations | ✅ `src/sci-fi.ts` |
| F-I18N-01 | Dynamic language sync and localize | ✅ `src/locales/` |
| F-MIGR-01 | Configuration legacy migration | ✅ `docs/MIGRATION.md` |
| F-GIT-01 | Branch `v2` isolation setup | ✅ Git setup |

---

## File Tree

```
src/
├── sci-fi.ts                       [MODIFY] Main package entry point
├── locales/
│   ├── generated/
│   │   └── locale-codes.js         [NEW] lit-localize output codes
│   ├── locales/
│   │   └── fr.ts                   [NEW] French static translations
│   └── localization.ts             [NEW] Static import translation config
└── docs/MIGRATION.md               [NEW] Lovelace YAML migration guide
```

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | HA single-resource requires absolute self-contained files | Low | → Run bundle compilation and verify output file is standalone |
| 2 | Static import locales prevent dynamic loading fetch errors | High | → Run build size check and check output includes locale keys |
| 3 | Custom icons registered in window persist across navigation | Medium | → Run customIcons check inside active browser window console |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `dist/sci-fi.min.js` | HA Lovelace | Standalone packaging including locales |
| `window.customIcons['sf']` | Spec 04 | custom sf iconset namespace |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `SciFiBaseCard` | Spec 03 | Standard card parent class |
| Lovelace Cards (8) | Spec 05 | Cards compiled and registered |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `window.customIcons` | HA Frontend | Registers custom icons for the sf namespace |
| `syncHALocale` | Base class | Reactively maps language states to card locales |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Dynamic bundle imports | `import('./fr.js')` splits files | Statically import translation files in `localization.ts` |
| 2 | Direct `window.customIcons.sf` overwrite | `window.customIcons.sf = sfIconset` — overwrites other cards' icons | Defensive spread merge: `window.customIcons = window.customIcons \|\| {}; window.customIcons.sf = { ...window.customIcons.sf, ...sfIconset }` |
| 3 | Manual card registration | Registering cards in separate files | Single entry point handles card class imports |
| 4 | No config migrations | Rejecting legacy configs | Parse and migrate YAML fields in the setter |
| 5 | Git force push to main | Force pushing branches in prod | Isolate active work to short-lived branch `v2` |
| 6 | `window.customIcons` unguarded access | `window.customIcons.sf = ...` when `customIcons` undefined | Always guard: `window.customIcons = window.customIcons \|\| {}` first |
| 7 | Terser collapses symmetric ternary `msg()` calls | Optimizer compiles `isOn ? msg('A') : msg('B')` into `msg(isOn ? 'A' : 'B')`, bypassing static hashing | Use un-collapsible array-tuple lookups: `[msg('B'), msg('A')][isOn ? 1 : 0] as string` |
| 8 | Global `customElements.define` patch in production | Wrapping `customElements.define` globally blocks HA's scoped element registry (used by `hui-card-picker`) — cards appear registered in global scope but are invisible to the picker dialog scope → "Custom element not found" at card creation | Wrap in `if (__DEV__)` — Rollup injects `__DEV__=false` in production, Terser dead-code-eliminates the block entirely |
| 9 | Hardcoded version string in console banner | `'%c SCI-FI CARDS %c v1.0.0 '` hardcoded — never updates on release | Use `__VERSION__` compile-time constant injected by `@rollup/plugin-replace` from `package.json` at build time: `` `v${__VERSION__}` `` |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-601 | Unit | syncHALocale switches language | HASS state lang `fr` | setLocale resolves to French statically |
| TC-602 | Unit | CustomIcons registers successfully | Load entry script | `window.customIcons.sf` is defined |
| TC-603 | Unit | Card registration compiles all elements | Load entry script | Custom card element tags get registered |
| TC-604 | Unit | MIGRATION parses legacy config keys | Legacy YAML configuration | Mapped and migrated configuration output |
| TC-605 | Unit | Static locales bundled cleanly | Run build command | `dist/sci-fi.min.js` contains locales text |
| IT-601 | Integration | Single-bundle loads in HA dashboard | Include bundle in HA resources | Cards render without fetch failures |
| IT-602 | Integration | Language switches reactively in dashboard | Update HA user language | Card UI updates translation language |
| IT-603 | Integration | Custom icons render in HA entities | Request `sf:radiator` icon | Renders target custom packaged SVG |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Locale Load Error | Static import failures | Fail compiling | Block build pipeline, output error trace |
| `window.customIcons` undefined at load | Direct property access crashes | `TypeError` at runtime | Guard: `window.customIcons = window.customIcons \|\| {}` before any assignment |
| `window.customIcons.sf` namespace conflict | Another HACS card defines `sf` | Our icons would be silently overwritten | Spread merge: `{ ...window.customIcons.sf, ...sfIconset }` preserves both |
| Legacy Config Error | Migration parser failure | Catch parse error | Apply defaults, print configuration warnings |
