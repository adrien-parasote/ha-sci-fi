# Stage summary — VERIFY (spec-12-renumber)

Lane feature, bead ha-sci-fi-b8g. All VERIFY steps closed.

## Proofs earned
- doc-updated, verify-passed (verify.py full run, all blocking checks PASS), coldboot-passed.
- spec-gate-passed, adversarial-passed re-earned by `scr.py run`.
- codereview-passed (APPROVE) and security-passed (DEPLOY) re-recorded with
  `review_gate.py --auditor subagent`: only dist/sci-fi.min.js moved (rebuild), reviewed source unchanged.
- intent-gate: not owed (no trace file).

## Reports
- docs/reviews/spec-12-renumber/code-review.md
- docs/reviews/spec-12-renumber/security-review.md
- docs/adversarial-review/spec-12-renumber.md
- Spec: docs/specs/spec-12-renumber/spec.md

## Integration tests played by command
- IT-RN-I-01: `npx vitest run` -> 107 files, 1309 tests passed.
- IT-RN-I-02: `npx tsc --noEmit` exit 0, `npm run build` exit 0, src/ untouched (no diff under src).
- IT-RN-I-03: tests/docs/spec-numbering.test.ts red on pre-change specs (names "Spec 12:
  docs/specs/cards/vehicles.md, docs/specs/cards/water_history.md"), green after restore.

## Notes for next stage
- dist/sci-fi.min.js is rebuilt in the tree: do NOT commit dist/.
- Changed: docs/specs/cards/{plugs,vacuum,water_history}.md, tests/docs/, tests/fixtures/spec-numbers.ts,
  tests/cards/water/sci-fi-water-management.test.ts, tests/specs/delivered-design.test.ts.
- No commit made yet.

**Tests:** files +1 ~2 −0 · cases +9 −1 · 1 earlier test file(s) edited, none lost a case
