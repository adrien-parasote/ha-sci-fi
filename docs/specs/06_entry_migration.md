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
| F-MIGR-01 | Configuration legacy migration | ⬜ not delivered — [ADR-005](../adr/ADR-005_zero-breaking-yaml.md#L1) forbids renaming or removing any YAML field, so no migration guide was ever needed |
| F-GIT-01 | Isolation de la réécriture v2 sur sa propre branche | ✅ accompli — plus aucune branche `v2` (sonde : `git branch -a --list '*v2*'` → 0) ; le travail vit sur `main` et les lots sur `fix/*`, `feat/*` |

---

## File Tree

```
src/
├── sci-fi.ts                       [MODIFY] Main package entry point
└── locales/
    ├── locale-codes.ts             [NEW] lit-localize output codes
    ├── locales/
    │   └── fr.js                   [NEW] French static translations (generated)
    └── localization.ts             [NEW] Static import translation config
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
| Lovelace Cards (11) | Spec 05 | Cards compiled and registered |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `window.customIconsets['sci']` | HA Frontend (`<ha-icon>`) | Fonction de résolution du namespace `sci` (`src/components/sf-icon/sf-iconset.ts`) |
| `window.customIcons` | HA Frontend (icon-picker) | Porte `['sci']` avec `getIcon`/`getIconList` pour le picker, et `['sf']` que `sf-icon.ts` peuple pour son propre rendu. ⚠ Seul `sci` est enregistré auprès de `customIconsets`, donc seul `sci:` résout dans un `<ha-icon>` |
| `setLocale` | [`src/locales/localization.ts`](../../src/locales/localization.ts#L12) | Appelé par `SciFiBaseCard` dans son setter `hass` quand la locale cible change, et sa méthode `shouldUpdate()` re-rend sur un changement de `hass.locale?.language` ; `SciFiBaseEditor` fait de même (`src/utils/base-card.ts`, `src/utils/base-editor.ts` — nommés par symbole, un numéro de ligne se périme). ⚠ Cette ligne nommait `syncHALocale`, symbole qui n'a jamais existé dans `src/` |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Dynamic bundle imports | `import('./fr.js')` splits files | Statically import translation files in `localization.ts` |
| 2 | Direct `window.customIcons.sf` overwrite | `window.customIcons.sf = sfIconset` — overwrites other cards' icons | Defensive spread merge: `window.customIcons = window.customIcons \|\| {}; window.customIcons.sf = { ...window.customIcons.sf, ...sfIconset }` |
| 3 | Manual card registration | Registering cards in separate files | Single entry point handles card class imports |
| 4 | Écrire un chemin de migration de config | Parser et migrer des champs YAML dans le setter | Aucune migration : [ADR-005](../adr/ADR-005_zero-breaking-yaml.md#L1) interdit de renommer ou retirer un champ, donc une config ancienne est déjà valide. Accepter les champs gelés tels quels |
| 5 | Git force push to main | Force pushing branches in prod | Isoler le travail en cours sur une branche courte (`fix/*`, `feat/*`), jamais de force push sur `main` |
| 6 | `window.customIcons` unguarded access | `window.customIcons.sf = ...` when `customIcons` undefined | Always guard: `window.customIcons = window.customIcons \|\| {}` first |
| 7 | Terser collapses symmetric ternary `msg()` calls | Optimizer compiles `isOn ? msg('A') : msg('B')` into `msg(isOn ? 'A' : 'B')`, bypassing static hashing | Use un-collapsible array-tuple lookups: `[msg('B'), msg('A')][isOn ? 1 : 0] as string` |
| 8 | Global `customElements.define` patch in production | Wrapping `customElements.define` globally blocks HA's scoped element registry (used by `hui-card-picker`) — cards appear registered in global scope but are invisible to the picker dialog scope → "Custom element not found" at card creation | Wrap in `if (__DEV__)` — Rollup injects `__DEV__=false` in production, Terser dead-code-eliminates the block entirely |
| 9 | Hardcoded version string in console banner | `'%c SCI-FI CARDS %c v1.0.0 '` hardcoded — never updates on release | Use `__VERSION__` compile-time constant injected by `@rollup/plugin-replace` from `package.json` at build time: `` `v${__VERSION__}` `` |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-601 | Unit | Poser `hass` avec une langue différente déclenche `setLocale` | `hass.locale.language` = `fr` | `setLocale` est appelé avec la locale cible — couvert par `tests/utils/base-card.test.ts` (« TC-303, TC-601, IT-602 ») |
| TC-602 | Unit | Le point d'entrée enregistre le namespace d'icônes auprès de HA | Load entry script | `window.customIconsets['sci']` est la fonction de résolution `<ha-icon>`, et `window.customIcons['sci']` porte `getIcon` et `getIconList` pour le picker. ⚠ Cette ligne attendait `window.customIcons.sf` : ce namespace existe bien (peuplé par `sf-icon.ts`) mais ce n'est pas ce que le point d'entrée enregistre |
| TC-603 | Unit | Card registration compiles all elements | Load entry script | Custom card element tags get registered |

> **Retirée le 2026-08-12** (bead `ha-sci-fi-9xf`) — la ligne unitaire 604 : *MIGRATION
> parses legacy config keys*. (L'identifiant n'est pas réécrit ici : le contrôle de
> couverture P14 lit tout ID présent dans une spec comme une promesse à tenir.) Il n'y a aucun module de migration dans `src/`, et il ne doit pas y en
> avoir : ADR-005 « zero breaking yaml » pose que les clés historiques restent lues
> telles quelles (`entity` et non `entity_id`, `weather_entity`, …). La ligne
> contredisait son propre ADR — rien à migrer par construction.
| TC-605 | Unit | Static locales bundled cleanly | Run build command | `dist/sci-fi.min.js` contains locales text |
| IT-601 | Integration | Le bundle unique se charge sans aller chercher quoi que ce soit au runtime | Include bundle in HA resources | Les locales sont importées statiquement, et `localization.ts` ne porte ni `fetch(` ni `import(` — couvert par `tests/sci-fi.test.ts` (« TC-605, IT-601 »), le seul angle de ce cas qu'une suite puisse prouver sans un dashboard HA réel |
| IT-602 | Integration | Language switches reactively in dashboard | Update HA user language | Card UI updates translation language |
| IT-603 | Integration | Custom icons render in HA entities | Request `sf:radiator` icon | Renders target custom packaged SVG |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Locale Load Error | Static import failures | Fail compiling | Block build pipeline, output error trace |
| `window.customIcons` undefined at load | Direct property access crashes | `TypeError` at runtime | Guard: `window.customIcons = window.customIcons \|\| {}` before any assignment |
| `window.customIcons.sf` namespace conflict | Another HACS card defines `sf` | Our icons would be silently overwritten | Spread merge: `{ ...window.customIcons.sf, ...sfIconset }` preserves both |

