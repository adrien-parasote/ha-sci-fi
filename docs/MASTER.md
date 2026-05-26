# ha-sci-fi v1.0.0 — Master Spec Index

> Document Type: Strategic
> Stream Coding · SPEC Stage · Révisé 2026-05-24
> Branch: `v1.0.0-wip` (main = v0.9.6 stable)

---

## Blueprint Coverage Matrix

| Étape | Feature IDs | Spec file | Status |
|---|---|---|---|
| Étape 1 — Infrastructure | F-INFRA-01 à 08 | [01_infrastructure.md](./specs/01_infrastructure.md#blueprint-coverage) | ✅ |
| Étape 2 — Domain Selectors + Types | F-DOM-01 à 09 | [02_domain_selectors.md](./specs/02_domain_selectors.md#blueprint-coverage) | ✅ |
| Étape 3 — Base Classes | F-BASE-01 à 06 | [03_base_classes.md](./specs/03_base_classes.md#blueprint-coverage) | ✅ |
| Étape 4 — Components | F-COMP-01 à 04 | [04_components.md](./specs/04_components.md#blueprint-coverage) | ✅ |
| Étape 5 — Cards (8) | F-CARD-01 à 08 | [05_cards.md](./specs/05_cards.md#blueprint-coverage) | ✅ |
| Étape 6 — Entry + i18n | F-ENTRY-01, F-ICON-01, F-I18N-01, F-GIT-01 | [06_entry_migration.md](./specs/06_entry_migration.md#blueprint-coverage) | ✅ |

**Couverture : 100% — aucun feature orphelin.**

---

## Source de Vérité

> [!IMPORTANT]
> **Avant tout refactoring, lire ces documents dans l'ordre :**
> 1. [`discovery.md`](./research/discovery.md) — Audit de l'existant v0.9.6 (schémas YAML exacts, architecture, règles critiques)
> 2. [strategic/blueprint.md](./strategic/blueprint.md#blueprint) — stratégie + ADR (dont ADR-005 : zero breaking YAML)
> 3. [implementation_plan.md](./implementation_plan.md#implementation-plan) — plan d'implémentation step-by-step
> 4. [specs/05_cards.md](./specs/05_cards.md#blueprint-coverage) — contrats YAML complets par carte
> 5. [cards/guidelines.md](./cards/guidelines.md) — Guide complet de développement et d'urbanisation de cartes custom HA.

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

## Cross-Spec Contracts

 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| Master Spec | All specs | Defines global ADRs and source of truth references. |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| All other specs | Spec 01-06 | Monitored for blueprint coverage. |

 ### Public Interface
| Element | Signature | Description |
|---|---|---|
| N/A | N/A | Strategic document. |

| Produit par | Consommé par | Artefact |
|------------|-------------|---------|
| Spec 01 | Spec 02-06 | `tsconfig.json`, `package.json`, test runner |
| Spec 02 | Spec 03, 04, 05 | `types/ha.ts`, `types/config.ts`, `selectors/*.ts` |
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
| ADR-007 | **Workbench local obligatoire avant déploiement prod** | ✅ Accepted — 2026-05-24 |

> **ADR-007 rationale :** Le déploiement v1.0.0 a cassé la prod sans validation visuelle préalable. La règle est désormais : `npm run build` → `npx serve . --listen 8888` → valider toutes les cartes dans `dev/workbench.html` → SEULEMENT ALORS copier `dist/sci-fi.min.js` vers `www/community/ha-sci-fi/`.

---

## Reference & External Assets File Tree

This section lists reference documentation, external dependencies, and assets used by this project so they are recognized by the cross-spec validator.

├── research/
│   ├── discovery.md
├── cards/
│   ├── guidelines.md
├── sci-fi.min.js
├── plugs.yaml
├── vacuum.yaml
├── climate.yaml
├── yaml_backup/plugs.yaml
├── yaml_backup/vacuum.yaml
├── yaml_backup/climate.yaml
└── hacsfiles/ha-sci-fi/icons/
```

---

## Anti-Patterns
| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Skipping the Master Spec | Modifying individual specs without updating MASTER | Keep Master Spec in sync with all sub-specs |
| 2 | Losing ADR context | Ignoring ADR-005 constraints | Read ADRs before any implementation |
| 3 | Misaligned dependencies | Changing a shared API without updating dependents | Follow the dependency chain (Spec 01 -> 06) |
| 4 | Duplicated schemas | Redefining YAML interfaces across specs | Rely on Spec 02 for shared definitions |
| 5 | Hardcoding paths | Using absolute paths for dependencies | Use relative paths defined in the file tree |

---

## Test Case Specifications
| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-001 | Unit | Test matrix coverage | Validate all specs have test IDs | All specs pass verification |
| TC-002 | Unit | Test ADR-005 presence | Verify ADR-005 is declared | ADR-005 present in Master |
| TC-003 | Unit | Test blueprint IDs | Verify blueprint mapping | Matrix complete |
| TC-004 | Unit | Test cross-spec references | Validate anchors | Anchors load correctly |
| TC-005 | Unit | Test file tree structure | Validate file tree syntax | Syntax is valid |
| IT-001 | Integration | Global spec validation | Run `spec_precheck` on `docs/specs` | All PASS |
| IT-002 | Integration | E2E validation cycle | Run verification loop on workspace | Validated |
| IT-003 | Integration | HACS distribution check | Verify `hacs.json` integration | Validation succeeds |

---

## Error Handling
| Error | Detection | Response | Fallback |
|---|---|---|---|
| Missing spec file | 404 on link | Flag in pre-check | Create missing file |
| Broken anchor | Invalid reference | Lint failure | Correct anchor name |
| Contradictory rules | Spec review | Halt implementation | Update Master Spec |
| ADR violation | Code review | Reject PR | Enforce ADR-005 |

