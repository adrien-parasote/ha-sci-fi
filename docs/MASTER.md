# ha-sci-fi v2 — Master Spec Index

> Document Type: Strategic
> Stream Coding · SPEC Stage · May 2026
> Branch: `v2`

---

## Blueprint Coverage Matrix

Tous les steps du [implementation_plan.md](./implementation_plan.md#L1) sont couverts par un spec file.

| Étape | Feature IDs | Spec file | Status |
|---|---|---|---|
| Étape 1 — Infrastructure | F-INFRA-01 à 08 | [01_infrastructure.md](./specs/01_infrastructure.md#L1) | ✅ |
| Étape 2 — Domain Selectors | F-DOM-01 à 09 | [02_domain_selectors.md](./specs/02_domain_selectors.md#L1) | ✅ |
| Étape 3 — Base Classes | F-BASE-01 à 06 | [03_base_classes.md](./specs/03_base_classes.md#L1) | ✅ |
| Étape 4 — Components | F-COMP-01 à 04 | [04_components.md](./specs/04_components.md#L1) | ✅ |
| Étape 5 — Cards (8) | F-CARD-01 à 08 | [05_cards.md](./specs/05_cards.md#L1) | ✅ |
| Étape 6 — Entry + Migration | F-ENTRY-01, F-ICON-01, F-I18N-01, F-MIGR-01, F-GIT-01 | [06_entry_migration.md](./specs/06_entry_migration.md#L1) | ✅ |

**Couverture : 100% — aucun feature orphelin.**

---

## Dependency Chain

```
01_infrastructure
       ↓
02_domain_selectors
       ↓
03_base_classes
       ↓
04_components
       ↓
05_cards
       ↓
06_entry_migration
```

---

## Cross-Spec Contract Summary

| Produit par | Consommé par | Artefact |
|------------|-------------|---------|
| Spec 01 | Spec 02-06 | `tsconfig.json`, `package.json`, `tests/fixtures/mock-hass.ts` infra |
| Spec 02 | Spec 03, 04, 05 | `types/ha.ts`, `types/config.ts`, `selectors/*.ts`, `tests/fixtures/mock-hass.ts` |
| Spec 03 | Spec 04, 05 | `SciFiBaseCard`, `SciFiBaseEditor`, `LABELS`, `styles/*.ts` |
| Spec 04 | Spec 05 | `sf-icon`, `sf-radiator` (4 composants), `sf-toggle-switch`, etc. |
| Spec 05 | Spec 06 | 8 cards auto-enregistrées via `@customElement` |
| Spec 06 | HA Dashboard | `dist/sci-fi.min.js`, `docs/MIGRATION.md` |

---

## Spec Gate Pre-Checklist

Avant de lancer le BUILD, vérifier :

- [x] Blueprint Coverage Matrix complète (0 feature orpheline)
- [x] Chaque spec a une section `Anti-Patterns` (min 5)
- [x] Chaque spec a une section `Test Case Specifications` (min 5 unit + 2 integration)
- [x] Chaque spec a une section `Error Handling Matrix`
- [x] Chaque spec a une section `Constraints` (Always/Ask/Never)
- [x] Chaque spec a une section `Cross-Spec Contracts`
- [x] Chaque spec a une section `Bundling & Native-Module Audit` (BM1-BM4)
- [x] Zéro marqueur `[NEEDS-CLARIFICATION]` restant
- [x] YAML breaking changes documentés dans Spec 05 § BM4 + Spec 06 `docs/MIGRATION.md`
- [x] Branche `v2` isolée documentée

---

## Anti-Patterns

For anti-patterns, see the implementation specs, e.g. [01_infrastructure.md](./specs/01_infrastructure.md#antipatterns).
