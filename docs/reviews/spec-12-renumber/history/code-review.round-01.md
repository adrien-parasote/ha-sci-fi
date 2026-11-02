# Code review — spec-12-renumber (round 1)

AUDITOR: subagent
PACKET: .sc/review/8ca174c-026ac6d8 (dirty 8ca174c..worktree, 13 files)

COVERAGE (must_read.txt is empty: no entry point packaged):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/spec-12-renumber/spec.md | all | 79 | yes |
| tests/docs/spec-numbering.test.ts | 1-96 | 96 | yes |
| tests/fixtures/spec-numbers.ts | 1-27 | 27 | yes |
| tests/specs/delivered-design.test.ts | diff hunks + SPECS usages (59,120,134,192,214,332) | 406 | no (diff only; unchanged rest out of scope) |
| tests/cards/water/sci-fi-water-management.test.ts | diff hunk | n/a | diff only (one-line change) |
| docs/specs/cards/water_history.md | diff hunk + `Spec 12` grep | n/a | diff only |
| docs/specs/cards/plugs.md | diff hunk | n/a | diff only |
| docs/specs/cards/vacuum.md | diff hunk | n/a | diff only |
| docs/summaries/spec-12-renumber/BUILD.md | all | n/a | yes |
| docs/adversarial-review/*, docs/summaries/.../SPEC.md | not read | n/a | no (process records, FR-5 out of scope) |

VERDICT: WARNING
SPEC: docs/specs/spec-12-renumber/spec.md

FINDINGS:
- [HIGH] tests/specs/delivered-design.test.ts:293 — when a new number collision appears, the guard's red message lists only the colliding numbers (`expected [7, 12] to equal [7]`), so whoever reads it has to go hunt for which two files collide; the line built to name them never runs — the keys assertion at :293 fires before the `rapport` assertion at :297-301, so `rapport` is dead code whenever there is another collision. This breaks the spec's Error Handling row (two specs sharing a number: the guard fails naming `Spec N: file, file`) and FR-6 (guard-first: the red run on the old tree must name `Spec 12` with both files). Reproduced: the fixture's `collidingNumbers` run on the real tree with water_history.md set back to `# Spec 12` gives keys `[7,12]`, and BUILD.md logs that exact red message, `expected [7, 12] to equal [7]`, with no file names.
  SITES:
  tests/specs/delivered-design.test.ts:293 (keys assertion placed before the named report)
  tests/specs/delivered-design.test.ts:297-301 (`rapport`: unreachable as a failure message)
  tests/docs/spec-numbering.test.ts:26 (`expect(pinnedOnly(...)).toBe(true)`: red message is `expected false to be true`, names nothing)
  tests/fixtures/spec-numbers.ts:23-27 (`pinnedOnly` returns a bare boolean and carries no diagnostic)
  FALSIFIED BY: TC-RN-U-06 extended so that on a fixture with a second collision on 12 (`y.md`, `z.md`) the guard's thrown message must contain `Spec 12: y.md, z.md`. It stays red if the assertion order is fixed in delivered-design but TC-RN-U-01 still asserts a boolean.
  ROOT: FR-6 / Error Handling: a collision failure names `Spec N: file, file`
  FIX-CLASS: corrects
  RESOLUTION: fixed — rapport asserted before the pin in tests/specs/delivered-design.test.ts and TC-RN-U-01 in tests/docs/spec-numbering.test.ts; message now `Spec N: file, file`.
- [MEDIUM] docs/specs/spec-12-renumber/spec.md:72 — anyone checking the spec against the code will look for TC-RN-U-01..07 in tests/specs/delivered-design.test.ts and not find them: the spec's Builder Calls put them there, but they live in tests/docs/spec-numbering.test.ts. BUILD.md gives the reason (tests/specs/ is left out of id-citation counting), but the spec was never amended, so spec and code disagree (Golden Rule: fix the spec first). The same paragraph says TC-RN-U-01 "is the existing uniqueness test rewritten", but TC-RN-U-01 is now a second, separate copy of that guard.
  RESOLUTION: fixed — spec Builder Calls amended (Placement now tests/docs/spec-numbering.test.ts).
- [LOW] tests/docs/spec-numbering.test.ts:21-27 — the collision guard now exists twice, each copy with its own spec-file filter regex (here at :23 and in `titledSpecFiles` at tests/specs/delivered-design.test.ts:54-56) and its own witness (file count `>8` here, number count `>8` there, which is the one FR-2 (the guard reads every spec title and fails on any collision except the pinned Spec 07) names). The two copies can drift apart. Keep one guard, or share the filter and the witness.
  RESOLUTION: fixed — filter shared as isTitledSpec in tests/fixtures/spec-numbers.ts, used by both.
- [LOW] tests/docs/spec-numbering.test.ts:84-89 — the check can stay green after every `Spec 12` mention under src/cards/vehicles/ is removed: TC-RN-U-07 (vehicles code and tests keep their `Spec 12` mentions) returns as soon as any one file in src or tests contains it, while the spec requires both `src/cards/vehicles/*` and `tests/cards/vehicles/*` to still contain it. TC-RN-U-07b at :91-95 checks only that stove.md names both files, not that the historical note is unchanged.
  RESOLUTION: fixed — TC-RN-U-07 asserts a Spec 12 hit in each of src/cards/vehicles and tests/cards/vehicles.
- [LOW] tests/docs/spec-numbering.test.ts:32 — the test title says the heading is on line 5, but the fixture puts it on line 6 (`'x\n\ny\n\n\n# Spec 07'`). TC-RN-U-03 (the check compares numbers as integers and reads a heading that is not on line 1) asks for line 5. The behaviour under test (not line 1) holds; the title and fixture disagree.
  RESOLUTION: fixed — title now says line 6.
- [LOW] tests/fixtures/spec-numbers.ts:9 — the spec-number regex `^#\s+Spec\s+(\d+)` with the `m` flag lets `\s+` run across newlines, and it also matches a `# Spec N` written inside a fenced code block. FR-2 defines the match per line. No current spec triggers either case (checked: every `^# Spec` hit is a real heading). Using `[ \t]+`, or matching line by line, would make it exactly what FR-2 says.
  RESOLUTION: fixed — regex uses [ \t]+ in tests/fixtures/spec-numbers.ts (fenced-block case: no current spec triggers it, pinned by the all-headings check).

NOTES:
- FR-2 calls the check "a local pure function". It lives in tests/fixtures/spec-numbers.ts and is imported, not defined in delivered-design.test.ts. It is pure and fixture-proven, which is the intent; the spec does not pin the file.
- `SPECS` stays in delivered-design.test.ts: it is still read by other cases (:120, :134, :192, :214, :332). Only its use in the uniqueness filter was removed, as FR-2 asks.
- The FR-6 tdd re-lock is reported in BUILD.md; this review cannot see the lock state from the packet.
- Out of scope per FR-4: plugs.md and vacuum.md still link `./11_stove_card_design_update.md` and `./13_plugs_card_design_update.md` (dead links).

CONFORMANCE EVIDENCE:
- FR-1 (water_history becomes Spec 16, vehicles keeps 12) → docs/specs/cards/water_history.md:1 `# Spec 16 — Tactical Water Management History Log`; docs/specs/cards/vehicles.md:1 unchanged; no `Spec 12` left in water_history.md (grep).
- FR-2 (the guard reads every spec title and fails on any collision except the pinned Spec 07) → tests/specs/delivered-design.test.ts:54-56 (filter on docs/specs/*.md and docs/specs/cards/*.md), :286-296 (pins `[7]` to hexa-tiles.md + tv.md, witness `size > 8`, no `12` exemption, new `it` title as specified); tests/fixtures/spec-numbers.ts:9-11 (first `# Spec N`, compared with parseInt).
- FR-3 (the water `describe` says Spec 16) → tests/cards/water/sci-fi-water-management.test.ts:123 `Automation History Logs (Spec 16)`; nothing else in that file changed.
- FR-4 (the vehicle links point at vehicles.md) → docs/specs/cards/plugs.md:923, docs/specs/cards/vacuum.md:976 `[Spec 12](./vehicles.md#L1)`; grep finds no `](…12_vehicle_card_design_update.md` link under docs/specs.
- FR-5 (vehicles code and tests, and the stove note, are left alone) → src/cards/vehicles/* (3 hits) and tests/cards/vehicles/sci-fi-vehicles.test.ts:4,50 still say `Spec 12`; none of them is in the diff.
- Run: `vitest run` on the 3 touched test files → 3 files, 59 tests passed.

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 4 |
