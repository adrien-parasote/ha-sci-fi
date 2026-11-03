# BUILD - climates-floor-fallback (stage summary)

**Decided:**
- Both filter_by guards and both `as any` removed; floor fallback is `allFloors[0]?.floor_id`, area fallback `getAreas(hass)[0]?.area_id`. The duplicate allFloors is gone; the scan skips a nullish floor.
- Deviation from Builder Calls: `getFirstFloor` NOT used (equivalent, but the socle-contract guard tests/specs/socle-contract.test.ts would need docs/specs/02 amended for a new caller).
- IT ids renamed IT-CFF-I-01..04 (repo ids guard grammar IT-X-I-N) in spec.md, adversarial review (+history), SPEC summary and tests; TDD lock re-recorded with a reason, no assertion loosened.
- IT-CFF-I-03 asserts the fr rendering `Aucun radiateur configuré` (test locale is fr), as the existing empty-state test does.
- docs/specs/cards/climates.md (FR-7) was already amended at SPEC close; pinned by TC-CFF-U-06.
- .sc/smoke.yaml: one-shot run recipe (climates test + tsc), like earlier lots.

**Artifacts:**
- src/cards/climates/sci-fi-climates.ts
- src/selectors/house.ts
- tests/cards/climates/sci-fi-climates.test.ts
- docs/specs/climates-floor-fallback/spec.md
- docs/specs/cards/climates.md
- docs/summaries/climates-floor-fallback/BUILD.md

**Intent items touched:** none

**Open/risky:**
- Full vitest 1543 passed / 1 skipped; tsc both configs 0; eslint 0 errors (159 pre-existing warnings, the `any` count of climates unchanged except the 2 removed).
- Rebuilding dist at VERIFY: do not restore before the commit.
- TC-CFF-U-08 first draft was vacuous (base-card catches render errors). Now it spies console.error and _renderError; it found a real throw, fixed by `area?.floor_id` in src/selectors/house.ts getAreasByFloor (one file beyond Builder Calls) and `f &&` in __displayFloors.

**Dead ends:** getFirstFloor import (guard on spec 02 callers).

**Next action:** VERIFY: verify.py, then fresh-context code-reviewer and security-reviewer.

**Tests:** files +0 ~1 −0 · cases +12 −0 · 1 earlier test file(s) edited, none lost a case
