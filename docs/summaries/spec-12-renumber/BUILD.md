# BUILD — spec-12-renumber (stage summary)

**Decided:** Guard first: the uniqueness test was rewritten and run red on the unchanged tree (`expected [7, 12] to equal [7]`), then green after FR-1..FR-4. The TC-RN-U ids live in `tests/docs/spec-numbering.test.ts` with the pure checks in `tests/fixtures/spec-numbers.ts`, because `tests/specs/` is excluded from id-citation counting by `ids-cas-uniques.test.ts` (otherwise the 7 ids read as unplayed). The FR-2 guard itself stays in `tests/specs/delivered-design.test.ts`.

**Artifacts:** docs/specs/cards/water_history.md (Spec 16); docs/specs/cards/plugs.md, docs/specs/cards/vacuum.md (links to ./vehicles.md#L1); tests/cards/water/sci-fi-water-management.test.ts (describe Spec 16); tests/specs/delivered-design.test.ts; tests/docs/spec-numbering.test.ts; tests/fixtures/spec-numbers.ts; .sc/task.md; .sc/smoke.yaml (npm run build recipe, copied from the root repo).

**Intent items touched:** none.

**Open/risky:** tdd re-locked with reason "renumber Spec 12 collision, bead ha-sci-fi-b8g" (8 tests moved/renamed). dist/ not touched. IT-RN-I-02 build is run by the smoke recipe at VERIFY; tsc already exit 0. Plan gate was bypassed by authorize-feature.

**Dead ends:** TC-RN-U ids inside tests/specs/ were counted as orphans by ids-cas-uniques; moved out.

**Next action:** VERIFY: full vitest (1309 green), build, code review; do not commit dist/.

**Tests:** files +1 ~2 −0 · cases +9 −1 · 1 earlier test file(s) edited, none lost a case
