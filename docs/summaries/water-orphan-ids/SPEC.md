# SPEC - water-orphan-ids (bead ha-sci-fi-78y.7, stage summary)

**Decided:**
- 28 water test titles citing 25 bare ids (TC-1201..1205, IT-1201..1205, TC-W01..W15) get one spec row each, worded from the assertion, in the spec of the behaviour; titles take derived prefixes (WATER, WATER-HISTORY).
- Test split (user, after adversarial F-01): ids-cas-uniques O1 refuses water_history ids cited outside tests/cards/water_history/. The 13 history it() blocks (rows 1..13, base lines 123..386) move byte for byte to tests/cards/water_history/sci-fi-water-management-history.test.ts; 15 water titles stay. Counts: water file 23 it/37 expect, history file 13 it/25 expect (base 36/62).
- Lot guard tests/cards/water/water-ids-declared.test.ts, 11 it, cases TC-WATOI-U-01..10, IT-WATOI-I-01 (played by command). No repo guard amended; 78y.8 generalises.
- Builds ids of either spec from fragments in the guard.

**Artifacts:**
- docs/specs/water-orphan-ids/spec.md
- docs/adversarial-review/water-orphan-ids.md
- Written at SPEC (BUILD verifies): rows, Covers cells, D14 move in docs/specs/cards/water.md and water_history.md, MASTER.md line, edit of tests/cards/water/water-history-aligned.test.ts

**BUILD touches:**
- tests/cards/water/sci-fi-water-management.test.ts (titles of rows 14..28; history block removed)
- tests/cards/water_history/sci-fi-water-management-history.test.ts (new)
- tests/cards/water/water-ids-declared.test.ts (new, write first, watch fail)

**Open/risky:** IT-WATOI-I-01 diff check against merge-base (only titles change); ids-cas-uniques and blueprint-traceability stay green; helpers renderLogs/mountCard/A_LOG move with the block.

**Dead ends:** renaming in place (O1 refuses); a guard under tests/specs/.

**Next action:** guard first, red, then split and rename, then vitest.

**Tests:** files +8 ~9 −1 · cases +133 −61 · 1 earlier test file(s) edited, none lost a case
