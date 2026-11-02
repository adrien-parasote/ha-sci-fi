# SPEC — vacuum-orphan-ids (stage summary)

**Decided:**
- 11 orphan vacuum test ids (not 9): TC-VE01..06, TC-1016, TC-1528..1530, TC-506.
- Nine get rows TC-VACUUM-U-1528..1536 (VE01..06→1528..1533, 1529→1534, 1530→1535, 1016→1536). 1527 is skipped: vacuum.md retires 1525/1526/1527.
- TC-1528 (alias of 1524) and TC-506 (title already has 1518) lose their id; TC-1528 title points to TC-VACUUM-U-1524.
- sci-fi-plugs.ts:81 cites TC-VACUUM-U-1535.
- The vacuum.md note near line 839 is rewritten (FR-5): names 1534 and 1535, drops unprefixed ids.
- Guard tests/cards/vacuum/vacuum-ids-declared.test.ts: ten `it` blocks TC-VOI-U-01..10; 78y.8 absorbs it later.

**Artifacts:**
- docs/specs/vacuum-orphan-ids/spec.md
- docs/adversarial-review/vacuum-orphan-ids.md
- target edits: docs/specs/cards/vacuum.md, tests/cards/vacuum/*.test.ts, src/cards/plugs/sci-fi-plugs.ts

**Open/risky:**
- IT-VOI-I-01 diff check (only title and comment lines change).
- ids-cas-uniques must stay green; row bodies must match each test's assertions (TC-VE06 is conditional).

**Dead ends:** reusing 1527 (retired number); a guard under tests/specs/.

**Next action:** write the guard first and watch it fail, then add rows 1528..1536, rename titles, fix plugs comment and the vacuum.md note, run vitest.

**Tests:** files +1 ~2 −1 · cases +36 −32
