# VERIFY summary — vehicles-orphan-ids (bead ha-sci-fi-78y.6)

## Outcome
All VERIFY proofs minted: verify-passed, doc-updated, coldboot-passed, codereview-passed, security-passed (re-recorded --auditor subagent after dist/ rebuild; reports unchanged).

## Paths
- Spec: docs/specs/vehicles-orphan-ids/spec.md (TC-VEHOI-U-07 row aligned with its two fixture checks; FR-3 table got a leading # column so P14 stops reading old ids as row heads)
- Reviews: docs/reviews/vehicles-orphan-ids/code-review.md (APPROVE), docs/reviews/vehicles-orphan-ids/security-review.md (DEPLOY)
- Adversarial: docs/adversarial-review/vehicles-orphan-ids.md (F-04 resolution now cites TC-VEHOI-U-03, P13 fix)
- Tests: tests/cards/vehicles/vehicles-ids-declared.test.ts, tests/cards/vehicles/sci-fi-vehicles.test.ts
- Docs: docs/specs/cards/vehicles.md

## Played by command
- IT-VEHOI-I-01: git diff --unified=0 vs merge-base, 9 minus / 9 plus, each pair equal once id swapped: true
- IT-VEHOI-I-02: ids-cas-uniques + blueprint-traceability: 25 tests green
- IT-VEHOI-I-03: full vitest 108 files, 1317 tests green

## Open
- dist/sci-fi.min.js is modified by the verify rebuild: do NOT commit it.
- 2 advisories (P15 reachability) are pre-existing, outside the diff.

**Tests:** files +1 ~1 −0 · cases +20 −9
