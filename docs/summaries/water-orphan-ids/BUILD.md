# BUILD - water-orphan-ids (stage summary)

**Decided:**
- Guard written first, red on 4 cases (01, 03, 04, 09), then split + 28 renames: guard 11/11 green, full vitest 111 files, 1338 passed, 1 skipped (1339 total; base 1328, +11 guard cases).
- 13 history it() blocks moved byte for byte (IT-WATOI-I-01 (a): exactly 13 differing lines); water file 23 it / 37 expect, history file 13 it / 25 expect; the sf-toast stub was NOT needed in the history file.
- Unforeseen by the spec: tests/docs/spec-numbering.test.ts TC-RN-U-05 read the water file for 'Automation History Logs (Spec 16)'; its path now points at the history file (one-line edit).
- test-compaction plan listed 9 history tests as removable; NOT applied (they carry spec row ids, FR-11 pins 13/36); step passed with nothing removed.
- tdd lock re-locked after the renames with a reason; .sc/smoke.yaml (run recipe: vitest on the two water dirs) authored for the cold-boot lint.
- SPEC-time edits (rows, Covers, notes, D14, MASTER, aligned guard) verified by TC-WATOI-U-05/07/08/11: no correction needed.

**Artifacts:**
- tests/cards/water/water-ids-declared.test.ts
- tests/cards/water_history/sci-fi-water-management-history.test.ts
- tests/cards/water/sci-fi-water-management.test.ts
- tests/docs/spec-numbering.test.ts
- .sc/task.md, .sc/smoke.yaml

**Open/risky:** IT-WATOI-I-01 (b) measured: 15 added title lines only. tsc and eslint clean on touched tests. node_modules in the worktree is a symlink to ../../node_modules (git ignores it). dist/ untouched.

**Next action:** VERIFY: IT-WATOI-I-02 (ids-cas-uniques, blueprint-traceability, water-history-aligned) and IT-WATOI-I-03 (full vitest), then code review of the diff.

**Tests:** files +2 ~3 −0 · cases +40 −28 · 2 earlier test file(s) edited, none lost a case
