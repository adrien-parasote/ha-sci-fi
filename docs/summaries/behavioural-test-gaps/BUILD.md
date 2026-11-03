# BUILD — behavioural-test-gaps (stage summary)

**Decided:**
- Plan: 6 steps, 13 distinct files after two Atomic groups (9 sheet tests, 5 spec marker removals); .sc/task.md.
- Five families fanned out; tests first, TDD lock, then tv src fixes FR-1, FR-12, FR-13 applied.
- Hexa canary: COMPUTED branch held (happy-dom resolves adopted sheets); --tile-width read on the host.
- Weather O1 mutant (no hasOwnProperty) survived: one test added citing TC-BTG-U-17. Plugs O5 and climates TC-CLIMATES-U-005 audits: all mutants killed, nothing added.
- Guards widened: tv/vehicles/weather/vacuum *-ids-declared accept lot ids (TC-BTG-U, IT-BTG-I) declared in the lot spec.
- Audit ids TC-BTG-U-16/18/19 cited in test comments (ids-cas-uniques needs a citation).
- TC-LIGHTS-U-005 row amended: getRelevantEntities also returns sun.sun.

**Artifacts:**
- src/cards/tv/sci-fi-tv.ts
- tests/helpers/blank-comments.ts, tests/helpers/blank-comments.test.ts
- tests/cards/{tv,hexa-tiles,vacuum,climates,lights,plugs,stove,vehicles,weather}/ (see git status)
- docs/specs/cards/{tv,hexa-tiles,vacuum,climates,lights,vehicles}.md

**Intent items touched:** none

**Open/risky:**
- Full vitest 1585 passed, 1 skipped; tsc both configs and eslint src tests clean.
- TC-BTG-U-24 (hexa styles): a sheet-only class rename survives it (classes read from the card); IT-BTG-I-03 catches it.
- Mutants verified on scratch copies per family; TC-BTG-U-06 NaN-guard mutant is equivalent.
- Bead filed: ha-sci-fi-3oe0 (dead #ff4d6d fallback). .beads not committed.
- Test-compaction removed 0 tests.

**Dead ends:** none

**Next action:** VERIFY (fresh-context reviewers); commit lists row -> mutant -> red/green.

**Tests:** files +1 ~24 −0 · cases +41 −19 · 9 earlier test file(s) edited, none lost a case
