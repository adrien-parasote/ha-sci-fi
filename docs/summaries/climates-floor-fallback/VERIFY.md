# VERIFY — climates-floor-fallback (stage summary)

**Decided:**
- Reviews closed: code APPROVE (3 findings fixed), security DEPLOY (round 3, cap delta by fresh reviewer, --auditor subagent).
- Beyond the Builder Calls (noted in the spec, Builder Calls section): `area?.floor_id` in getAreasByFloor and a null filter in getFloors() (`f !== null && f !== undefined`, eqeqeq-clean) in src/selectors/house.ts; extra `floor &&` guard at sci-fi-climates.ts:69 and `if (!floor) return nothing` at :247.
- P3 lint error (eqeqeq on the first filter form) fixed; reviews re-recorded on the existing reports.
- ui-walk cannot run (no browser surface in smoke.yaml): not an exit branch for this lot (serves-ui exit 2).

**Artifacts:**
- docs/specs/climates-floor-fallback/spec.md
- docs/reviews/climates-floor-fallback/code-review.md
- docs/reviews/climates-floor-fallback/security-review.md
- docs/adversarial-review/climates-floor-fallback.md
- src/selectors/house.ts
- src/cards/climates/sci-fi-climates.ts
- tests/cards/climates/sci-fi-climates.test.ts
- docs/specs/cards/climates.md

**Intent items touched:** none.

**Open/risky:** dist/ rebuilt by verify.py: never stage it. Review rounds past the cap of 2 (security round 3).

**Dead ends:** none.

**Next action:** HARDEN: learn-eval, full vitest, tsc on both tsconfigs, eslint src/tests, stage only the lot's files, commit via -F.

**Tests:** files +0 ~1 −0 · cases +12 −0 · 1 earlier test file(s) edited, none lost a case
