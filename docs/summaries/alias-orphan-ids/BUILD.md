# BUILD — alias-orphan-ids (stage summary)

**Decided:** guard written first and seen RED (2 of 5 failing), then four titles renamed (FR-2) and two spec tree lines rewritten (FR-4). Re-lock done with --reason (titles changed). test-compacted: nothing removable. .sc/smoke.yaml = npm run build.

**Artifacts:**
- tests/cards/plugs/alias-ids-declared.test.ts (new)
- tests/cards/plugs/sci-fi-plugs.test.ts
- tests/cards/vehicles/sci-fi-vehicles.test.ts
- docs/specs/cards/plugs.md
- docs/specs/cards/vehicles.md
- .sc/task.md, .sc/smoke.yaml

**Intent items touched:** none

**Open/risky:** vitest on tests/cards/plugs, tests/cards/vehicles, tests/specs: 240/240 green. IT-AOI-I-01..03 are played at VERIFY (diff of the two test files = 4 title lines, spec guards, full vitest). Historical alias table rows in the specs stay by design.

**Dead ends:** none

**Next action:** VERIFY: run IT-AOI-I-01..03, full vitest, reviews.

**Tests:** files +1 ~2 −0 · cases +11 −4
