# BUILD — repo-wide-ids-guard (stage summary)

**Decided:**
- Guard written first, RED on the real tree (5 orphan titles, no retired rows), then GREEN after the edits.
- Titles read with the TypeScript AST; ids from literal fragments counted; suffix/dynamic/digit-less runs refused.
- Ghost ids and fragments only: the guard spells no card id, no unplayed id.
- Retired TC-VOI-U-01/-02 and TC-BRI-U-03 with their sole helpers; rows kept with [RETIRED] cell; five stale sentences fixed.
- test-compaction plan listed 9 unrelated water_history cases: NOT applied (outside the lot, spec cases); verify minted the proof.
- .sc/smoke.yaml is a one-shot run recipe (vitest on the guard and ids-cas-uniques).

**Artifacts:**
- tests/docs/repo-wide-ids-guard.test.ts (new, 9 cases)
- tests/cards/vacuum/vacuum-ids-declared.test.ts, tests/utils/bare-range-ids-declared.test.ts
- tests/cards/water/water-history-aligned.test.ts, tests/docs/spec-numbering.test.ts, tests/selectors/house.test.ts
- docs/specs/vacuum-orphan-ids/spec.md, docs/specs/bare-range-ids/spec.md, docs/specs/02_domain_selectors.md (TC-208 row, from SPEC)
- .sc/task.md, .sc/smoke.yaml

**Open/risky:** full vitest green (112 files, 1344 passed, 1 skipped). IT-RWG ids are played by command at VERIFY. Do not commit dist/.

**Next action:** VERIFY: run the three IT commands, then code review of the guard against FR-1..FR-10.

**Tests:** files +1 ~5 −0 · cases +36 −11
