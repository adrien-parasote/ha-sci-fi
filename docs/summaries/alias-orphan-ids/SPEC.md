# SPEC summary — alias-orphan-ids (bead ha-sci-fi-78y.3)

Spec: docs/specs/alias-orphan-ids/spec.md
Review: docs/adversarial-review/alias-orphan-ids.md (12 findings closed: 11 RESOLVED, 1 FALSE; builder check done)

## Decisions
- FR-1 guard is narrowed to the alias pattern (TC-PLG-000n, TC-VEH-000n); the 11 other undeclared ids in the two test files are out of scope (78y.6, 78y.8).
- Guard builds alias regex and fixtures from fragments; no literal alias or TC-VEHICLES id in tests/cards/plugs/ (ids-cas-uniques O1).
- Extractor reads it/test/it.each titles; skip pattern widened (skip, skipIf, todo, only).
- FR-4: file-tree lines plugs.md:105 and vehicles.md:111 rewritten to name declared ids; historical tables untouched.

## Files to touch in BUILD
- tests/cards/plugs/alias-ids-declared.test.ts (new, write first, watch fail)
- tests/cards/plugs/sci-fi-plugs.test.ts (2 titles)
- tests/cards/vehicles/sci-fi-vehicles.test.ts (2 titles)
- docs/specs/cards/plugs.md, docs/specs/cards/vehicles.md (1 tree line each)

## Cases
TC-AOI-U-01..05 in the guard; IT-AOI-I-01..03 played at VERIFY.

## Dead ends
none. Spike: declined. Do not commit dist/.

**Tests:** files +2 ~4 −1 · cases +61 −43
