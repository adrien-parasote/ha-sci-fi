# Code review — water-orphan-ids (round 1)

AUDITOR: subagent
Packet: .sc/review/8ba40f4-3fb0933f (dirty, base 8ba40f4). must_read.txt is empty.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/water-orphan-ids/spec.md | 1-169 | 169 | yes |
| tests/cards/water/water-ids-declared.test.ts | 1-288 | 288 | yes |
| tests/cards/water_history/sci-fi-water-management-history.test.ts | header 1-20, tail, moved block diffed line by line against base 123..386 | 276 | yes (diff-verified) |
| tests/cards/water/sci-fi-water-management.test.ts | diff vs base (unified=0), 115-200 and title lines 262-385 | 448 | partial (unchanged bodies verified by diff) |
| tests/cards/water/water-history-aligned.test.ts | diff vs base (all hunks) | 416 | diff only |
| docs/specs/cards/water.md | diff vs base (all hunks) | 189 | diff only |
| docs/specs/cards/water_history.md | diff vs base (all hunks) | 182 | diff only |
| docs/MASTER.md | diff vs base | 254 | diff only |
| tests/docs/spec-numbering.test.ts | diff vs base | 103 | diff only |

VERDICT: APPROVE
SPEC: docs/specs/water-orphan-ids/spec.md

Evidence run:
- Moved block: base 8ba40f4 lines 123..386 vs the history file's `Automation History Logs` block: 264 = 264 lines, `diff` shows exactly 13 differing lines, all titles, each the mapping's id swap (row 1 also drops `, TC-WATER-U-007`). IT-WATOI-I-01 (a) holds.
- Water file: `git diff --unified=0 8ba40f4` has one deletion hunk `-123,265` (block + blank line 387) and exactly 15 `+` lines, the 15 title swaps of rows 14..28. IT-WATOI-I-01 (b) holds.
- Counts: water 23 `it(` / 37 `expect(`, history 13 / 25 (grep `it(` reports 15 because `_applyFiltersAndLimit(` matches twice; the guard's `^\s*it\(` counts 13), base 36 / 62.
- `npx vitest run tests/cards/water tests/cards/water_history tests/specs tests/docs`: 12 files, 161 passed, 1 skipped, rc 0 (ids-cas-uniques, blueprint-traceability, spec-numbering and the aligned guard included).
- `npx eslint` on the three test directories / files: rc 0.

FINDINGS:
- [MEDIUM] tests/cards/water/water-ids-declared.test.ts:95 — a history-file title that cites a water id NEXT TO a history id (the very shape of the old row-1 title, `TC-WATER-HISTORY-U-006, TC-WATER-U-007: …`) is not reported by the lot's guard, so the guard does not hold the locality clause it claims — FR-1 (titles cite only declared ids; "the history file cites only WATER-HISTORY ids") — the check filters whole titles with `waterOnlyRe.test(t) && !histRe.test(t)`, so any title that also contains a `WATER-HISTORY` id is exempted. Probe: `node -e` with the guard's two regexes on that title returns `caught? false`. ids-cas-uniques O1 would still catch it, which is why this is not HIGH, but the spec says the guard should name the file first. Fix: apply the test per cited id (`titlesOf(histSrc).flatMap(citedIds).filter((c) => waterOnlyRe.test(c) && !histRe.test(c))`), and add a fixture for the mixed title.
  RESOLUTION: fixed — check now per cited id (waterIdsIn) with a mixed-title fixture in TC-WATOI-U-02; vitest on water/water_history/docs/specs 161 passed
  SITES: tests/cards/water/water-ids-declared.test.ts:95
  SITES: tests/cards/water/water-ids-declared.test.ts:266
  FIX-CLASS: corrects
- [LOW] tests/cards/water/water-ids-declared.test.ts:49 — if the history file is renamed or deleted, TC-WATOI-U-01, -04 and -06 pass on an empty string instead of failing, so the guard reports a green orphan check on a file it never read — `existsSync(...) ? read(...) : ''` is a silent fallback; only TC-WATOI-U-09 (and U-03 indirectly) turn red. Fix: read the file unconditionally, so a missing file fails at load with its path.
  RESOLUTION: fixed — history file read unconditionally; same run green
  FIX-CLASS: corrects
- [LOW] docs/specs/water-orphan-ids/spec.md:84 — a reader of the lot's spec is told "nothing else in the played code" changes and the File layout table (spec.md:70-75) omits it, yet BUILD edited tests/docs/spec-numbering.test.ts:86 (TC-RN-U-05, the "the water describe carries Spec 16" check, now reads the history file) — FR-4 (only the 28 titles change) is literally contradicted. The edit itself is correct and necessary (the describe moved; without it TC-RN-U-05 would fail on `toContain('Automation History Logs (Spec 16)')`), and it is disclosed in docs/summaries/water-orphan-ids/BUILD.md:6. Fix: record the one-line path update in the spec (FR-4 exception and the layout table).
  RESOLUTION: fixed — spec FR-4 exception and layout-table row for tests/docs/spec-numbering.test.ts recorded
  FIX-CLASS: corrects
- [LOW] OUT-OF-DIFF: docs/specs/spec-12-renumber/spec.md:24 — that spec's FR-3 and TC-RN-U-05 row (:56) still name tests/cards/water/sci-fi-water-management.test.ts as the file carrying `describe('Automation History Logs (Spec 16)')`, which is no longer true after this lot, so a reader following that spec looks in the wrong file. Not this lot's write scope: a bead for the author, not a correction here.
  RESOLUTION: filed ha-sci-fi-1o6
  FIX-CLASS: corrects

NOTES:
- The tests/docs/spec-numbering.test.ts edit is judged sound on its merits: a path-only change, the assertions unchanged, and TC-RN-U-05's `not.toContain('(Spec 12)')` keeps its meaning since the water file no longer carries the describe at all.
- No test compaction was applied: deliberate, and correct here, because each moved test carries a spec row id and the spec requires the move to be byte for byte (FR-11, the move keeps every line except the title).
- TC-WATER-U-010's row says both labels are non-empty strings; the test checks `typeof` only on the `on` label. That is close enough for an anchor row; not a defect.
- TC-WATOI-U-11 checks bare substrings (`312`, `323`, `370`); weak alone, but the real check is in water-history-aligned.test.ts's mutants (D14_CITES), which pass.

CONFORMANCE EVIDENCE:
- FR-1 (declared ids) → tests/cards/water/water-ids-declared.test.ts:90-97 (non-empty sets, `toEqual([])` per file); four title forms → :99-110.
- FR-2 / FR-3 (new rows, markers, notes) → docs/specs/cards/water_history.md rows U-006..008, I-004..009 and note "Cinq des dix-sept"; docs/specs/cards/water.md rows U-009..021, U-007 ⬜, note "Neuf des vingt-cinq"; checked by guard :112-130, :230-252.
- FR-4 / FR-11 (titles only, byte-for-byte move) → diff evidence above; history file header tests/cards/water_history/sci-fi-water-management-history.test.ts:1-10 matches FR-11's imports and afterEach; no sf-toast stub needed (suite green).
- FR-5 (retired ids, bans) → guard :132-136, :183-190.
- FR-6 (Covers cells, exact sets) → guard :192-228; docs/MASTER.md example line updated.
- FR-7 (D14 move, scoped carve-out with mutants) → tests/cards/water/water-history-aligned.test.ts hunks at checkU03 (case-row filter + D21) and checkU04 (D14_CITES 312/323/370), with the two carve-out mutants and five D14 mutants.
