# ha-sci-fi v1.3.x — Master Spec Index

> Document Type: Strategic
> Stream Coding · SPEC Stage · Revised 2026-06-02
> Current stable: `v1.3.2` on `main`

---

## Blueprint Coverage Matrix

| Step | Feature IDs | Spec file | Status |
|---|---|---|---|
| Step 1 — Infrastructure | F-INFRA-01 to 08 | [01_infrastructure.md](./specs/01_infrastructure.md#blueprint-coverage) | ✅ |
| Step 2 — Domain Selectors + Types | F-DOM-01 to 09 | [02_domain_selectors.md](./specs/02_domain_selectors.md#blueprint-coverage) | ✅ |
| Step 3 — Base Classes | F-BASE-01 to 06 | [03_base_classes.md](./specs/03_base_classes.md#blueprint-coverage) | ✅ |
| Step 4 — Components | F-COMP-01 to 04 | [04_components.md](./specs/04_components.md#blueprint-coverage) | ✅ |
| Step 5 — Cards (11) | F-CARD-01 to 11 | [05_cards.md](./specs/05_cards.md#blueprint-coverage) | ✅ |
| Step 6 — Entry + i18n | F-ENTRY-01, F-ICON-01, F-I18N-01, F-GIT-01 | [06_entry_migration.md](./specs/06_entry_migration.md#blueprint-coverage) | ✅ |
| Step 7 — Workbench + Editor i18n | F-WB-01 to 05 | [09_workbench_editor_i18n.md](./specs/09_workbench_editor_i18n.md) | ✅ |
| Step 8 — Card Editors | F-EDIT-01 to 11 | [10_card_editors.md](./specs/10_card_editors.md) | ✅ |
| Step 9 — Guidelines Remediation | F-GUIDE-01 to 04 | [11_guidelines_remediation.md](./specs/11_guidelines_remediation.md) | ✅ |
| Card specs (per card) | — | [specs/cards/](./specs/cards/) | ✅ |

**Coverage: 100% — no orphan feature.**

---

## Source of Truth

> [!IMPORTANT]
> **Before any refactoring, read these documents in order:**
> 1. [`discovery.md`](./research/discovery.md) — Audit of v0.9.6 (exact YAML schemas, architecture, critical rules)
> 2. [strategic/blueprint.md](./strategic/blueprint.md) — strategy + ADR summary index (full ADRs in [docs/adr/](./adr/))
> 4. [specs/05_cards.md](./specs/05_cards.md#blueprint-coverage) — full YAML contracts per card
> 5. [guidelines.md](./guidelines.md) — complete card development and urbanization guide
> 6. [release-process.md](./release-process.md) — release process (versioning, build, tag, draft release, wiki)
> 7. [`.agents/learnings.md`](../.agents/learnings.md) — 85 project-specific learnings (L012-L085 + L086+)
> 8. [`docs/adr/`](./adr/) — 15 Architectural Decision Records (ADR-001 to ADR-015)

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
05_cards (11 cards)
       ↓
06_entry_migration
       ↓
09_workbench_editor_i18n
       ↓
10_card_editors
       ↓
11_guidelines_remediation
       ↓
Release (see docs/release-process.md)
```

---

## Cross-Spec Contracts

 ### Produces
| Artifact | Consumer | Description |
|---|---|---|
| Master Spec | All specs | Defines global ADRs and source of truth references. |

 ### Consumes
| Artifact | Provider | Description |
|---|---|---|
| All other specs | Spec 01-11 + cards/ | Monitored for blueprint coverage. |

 ### Public Interface
| Element | Signature | Description |
|---|---|---|
| N/A | N/A | Strategic document. |

| Produced by | Consumed by | Artifact |
|------------|-------------|---------|
| Spec 01 | Spec 02-11 | `tsconfig.json`, `package.json`, test runner |
| Spec 02 | Spec 03, 04, 05 | `types/ha.ts`, `types/config.ts`, `selectors/*.ts` |
| Spec 03 | Spec 04, 05 | `SciFiBaseCard`, `SciFiBaseEditor`, shared styles |
| Spec 04 | Spec 05 | `sf-icon`, `sf-radiator` (4 components), `sf-toggle-switch`, etc. |
| Spec 05 | Spec 06 | 11 cards auto-registered via `customElements.define` (HMR-safe guard in `sci-fi.ts`) |
| Spec 06 | HA Dashboard | `dist/sci-fi.min.js` |

---

## Spec Gate Pre-Checklist

Before launching BUILD, verify:

- [x] Blueprint Coverage Matrix complete (0 orphan feature)
- [x] Each spec has an `Anti-Patterns` section (min 5)
- [x] Each spec has a `Test Case Specifications` section (min 5 unit + 2 integration)
- [x] Each spec has an `Error Handling` section
- [x] Each spec has a `Cross-Spec Contracts` section
- [x] ADR-005 respected — zero YAML field renamed across all specs
- [x] Full YAML contracts documented in Spec 05 §YAML Config Contracts
- [x] `discovery.md` referenced as source of truth in MASTER.md + blueprint.md

---

## ADR Summary

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | Full Rewrite TypeScript | ✅ Accepted |
| ADR-002 | Rollup 4 (not Vite) | ✅ Accepted |
| ADR-003 | lodash-es removed | ✅ Accepted |
| ADR-004 | Domain-first tests (not E2E) | ✅ Accepted |
| ADR-005 | **Zero Breaking YAML Changes** | ✅ Accepted — CRITICAL |
| ADR-006 | **config-metadata.ts kept** | ✅ Accepted |
| ADR-007 | **Local workbench mandatory before prod release** | ✅ Accepted |
| ADR-008 | Selective rendering via `getRelevantEntities()` | ✅ Accepted |
| ADR-009 | Unified card structure + styles urbanization | ✅ Accepted |
| ADR-010 | Consolidated unit test suites | ✅ Accepted |
| ADR-011 | TV D-pad remote mapping | ✅ Accepted — see [ADR-011](./adr/ADR-011_tv-dpad-mapping.md) |
| ADR-012 | Bridge independent section components | ✅ Accepted — see [ADR-012](./adr/ADR-012_bridge-sections.md) |
| ADR-013 | Container queries for bridge responsive layout | ✅ Accepted — see [ADR-013](./adr/ADR-013_container-queries.md) |
| ADR-014 | CREW + ACTIONS sections always full width | ✅ Accepted — see [ADR-014](./adr/ADR-014_crew-actions-fullwidth.md) |
| ADR-015 | Persons loaded dynamically from hass.states | ✅ Accepted — see [ADR-015](./adr/ADR-015_persons-dynamic.md) |

> **ADR-007 rationale:** The v1.0.0 release broke production without prior visual validation. Rule: `npm run build` → validate all cards in `dev/workbench.html` → ONLY THEN release (see [release-process.md](./release-process.md)).

> [!NOTE]
> **Spec numbering:** Two numbering systems coexist:
> - **Main specs (01-11):** `docs/specs/01_*.md` to `docs/specs/11_*.md` — ordered build layers (infrastructure → cards → editors → release)
> - **Card specs:** `docs/specs/cards/*.md` — per-card reference docs with independent spec numbers
> The gap at 07/08 in main specs is intentional: those numbers appear in the card spec series (TV = Spec 07). The main spec jumped to 09 to avoid collision.

---

## Reference & External Assets File Tree

This section lists reference documentation, external dependencies, and assets used by this project so they are recognized by the cross-spec validator.

```
├── research/
│   ├── discovery.md
├── cards/
│   ├── guidelines.md
│   ├── bridge.md
│   ├── climates.md
│   ├── hexa-tiles.md
│   ├── lights.md
│   ├── plugs.md
│   ├── stove.md
│   ├── tv.md
│   ├── vacuum.md
│   ├── vehicles.md
│   ├── water.md
│   └── weather.md
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
| 3 | Misaligned dependencies | Changing a shared API without updating dependents | Follow the dependency chain (Spec 01 → 11) |
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
