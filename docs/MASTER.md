# ha-sci-fi v1.0.0 — Master Spec Index

> Document Type: Strategic
> Stream Coding · SPEC Stage · Révisé 2026-05-24
> Branch: `v1.0.0-wip` (main = v0.9.6 stable)

---

## Blueprint Coverage Matrix

| Étape | Feature IDs | Spec file | Status |
|---|---|---|---|
| Étape 1 — Infrastructure | F-INFRA-01 à 08 | [01_infrastructure.md](./specs/01_infrastructure.md) | ✅ |
| Étape 2 — Domain Selectors + Types | F-DOM-01 à 09 | [02_domain_selectors.md](./specs/02_domain_selectors.md) | ✅ |
| Étape 3 — Base Classes | F-BASE-01 à 06 | [03_base_classes.md](./specs/03_base_classes.md) | ✅ |
| Étape 4 — Components | F-COMP-01 à 04 | [04_components.md](./specs/04_components.md) | ✅ |
| Étape 5 — Cards (8) | F-CARD-01 à 08 | [05_cards.md](./specs/05_cards.md) | ✅ |
| Étape 6 — Entry + i18n | F-ENTRY-01, F-ICON-01, F-I18N-01, F-GIT-01 | [06_entry_migration.md](./specs/06_entry_migration.md) | ✅ |

**Couverture : 100% — aucun feature orphelin.**

---

## Source de Vérité

> [!IMPORTANT]
> **Avant tout refactoring, lire ces documents dans l'ordre :**
> 1. [discovery.md](./discovery.md) — inventaire exhaustif v0.9.6 (schémas YAML exacts, architecture, règles critiques)
> 2. [strategic/blueprint.md](./strategic/blueprint.md) — stratégie + ADR (dont ADR-005 : zero breaking YAML)
> 3. [implementation_plan.md](./implementation_plan.md) — plan d'implémentation step-by-step
> 4. [specs/05_cards.md](./specs/05_cards.md) — contrats YAML complets par carte

---

## Dependency Chain

```
01_infrastructure
       ↓
02_domain_selectors (types + config-metadata.ts + selectors)
       ↓
03_base_classes
       ↓
04_components
       ↓
05_cards
       ↓
06_entry_migration
       ↓
YAML Contract Validation Gate
       ↓
Merge v1.0.0-wip → main + tag v1.0.0
```

---

## Cross-Spec Contract Summary

| Produit par | Consommé par | Artefact |
|------------|-------------|---------|
| Spec 01 | Spec 02-06 | `tsconfig.json`, `package.json`, test runner |
| Spec 02 | Spec 03, 04, 05 | `types/ha.ts`, `types/config.ts`, `types/config-metadata.ts`, `selectors/*.ts` |
| Spec 03 | Spec 04, 05 | `SciFiBaseCard`, `SciFiBaseEditor`, styles partagés |
| Spec 04 | Spec 05 | `sf-icon`, `sf-radiator` (4 composants), `sf-toggle-switch`, etc. |
| Spec 05 | Spec 06 | 8 cards auto-enregistrées via `@customElement` |
| Spec 06 | HA Dashboard | `dist/sci-fi.min.js` |

---

## Spec Gate Pre-Checklist

Avant de lancer le BUILD, vérifier :

- [x] Blueprint Coverage Matrix complète (0 feature orpheline)
- [x] Chaque spec a une section `Anti-Patterns` (min 5)
- [x] Chaque spec a une section `Test Case Specifications` (min 5 unit + 2 integration)
- [x] Chaque spec a une section `Error Handling`
- [x] Chaque spec a une section `Cross-Spec Contracts`
- [x] ADR-005 respecté — zéro champ YAML renommé dans toutes les specs
- [x] Contrats YAML complets documentés dans Spec 05 §YAML Config Contracts
- [x] Backup YAML `yaml backup/*.yaml` couverts par les TC d'intégration IT-502 à IT-504
- [x] `discovery.md` référencé comme source de vérité dans MASTER.md + blueprint.md

---

## ADR Summary

| ADR | Décision | Status |
|-----|----------|--------|
| ADR-001 | Full Rewrite TypeScript | ✅ Accepted |
| ADR-002 | Rollup 4 (pas Vite) | ✅ Accepted |
| ADR-003 | lodash-es supprimé | ✅ Accepted |
| ADR-004 | Tests domain-first (pas E2E) | ✅ Accepted |
| ADR-005 | **Zero Breaking YAML Changes** | ✅ Accepted — CRITIQUE |
| ADR-006 | **config-metadata.ts conservé** | ✅ Accepted |
