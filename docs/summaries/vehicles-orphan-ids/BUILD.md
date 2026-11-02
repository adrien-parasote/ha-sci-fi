# BUILD summary — vehicles-orphan-ids (bead ha-sci-fi-78y.6, lane feature)

Spec: docs/specs/vehicles-orphan-ids/spec.md. Plan: .sc/task.md (1 build, 2 steps).

## Done
- Guard created, red first (3 of 8 failed on the unrenamed tree): tests/cards/vehicles/vehicles-ids-declared.test.ts (TC-VEHOI-U-01..08).
- Nine it() titles renamed (id token only): tests/cards/vehicles/sci-fi-vehicles.test.ts (TC-1215 -> TC-VEHICLES-U-1215; TC-V01..V08 -> 1216..1223; TC-508 kept in 1216).
- Rows 1215..1223, F-VEH-D06 cell, "vingt-six" note verified present in docs/specs/cards/vehicles.md (written at SPEC, not touched).
- TDD locked once, after the renames (no re-lock needed). test-compaction: 0 of 1317 removable; proof minted.
- .sc/smoke.yaml: runs the guard only (lint passes).

## Tests
Full vitest: see report of the stage-runner (all green). IT-VEHOI-I-01..03 are played by commands at VERIFY.

## Notes for VERIFY
- node_modules in the worktree is a symlink to ../../node_modules (ignored by git).
- No dist/ touched, nothing committed.
- Old ids remain in comments of the test file (FR-5, accepted).

**Tests:** files +1 ~1 −0 · cases +20 −9
