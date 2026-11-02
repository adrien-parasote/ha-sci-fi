# Code review — weather-orphan-ids

AUDITOR: subagent
Packet: .sc/review/7b8b4d5-90fda7d2 (first round, dirty 7b8b4d5..worktree, no delta.txt).

COVERAGE (must_read.txt is EMPTY: no entry point was packaged; rows below are the packet's files.txt plus the joins read outside it):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/weather/weather-ids-declared.test.ts | 1-107 | 107 | yes |
| tests/cards/weather/sci-fi-weather.test.ts | diff hunks + 237-286 (IT-WEATHER-I-004 body) + all 17 extracted titles | 406 | no — change is 4 title strings; the bodies outside the diff are untouched (git diff shows 4 -/4 + lines) |
| docs/specs/cards/weather.md | diff hunk + table tail 151-154 | 154 | no — one added row |
| docs/specs/weather-orphan-ids/spec.md | 1-106 | 106 | yes |
| docs/specs/05_cards.md | F-CARD-05 row (31), TC-502/503 rows (274-275) | 303 | no — read-only join |
| docs/adversarial-review/*, docs/summaries/weather-orphan-ids/* | not audited for conformance (process documentation, no product behaviour) | — | no |

VERDICT: APPROVE
SPEC: docs/specs/weather-orphan-ids/spec.md

FINDINGS:
- none

Evidence gathered (commands run, not asserted):
- `npx vitest run tests/cards/weather tests/specs/ids-cas-uniques.test.ts tests/specs/blueprint-traceability.test.ts` → 6 files, 69 tests passed (IT-WOI-I-02 (repo spec guards green)).
- `npx vitest run` (full) → 106 files, 1301 tests passed (IT-WOI-I-03 (full suite green)).
- `git diff 7b8b4d5 -- tests/cards/weather/sci-fi-weather.test.ts` → exactly four `-` and four `+` content lines, each an `it(` title (IT-WOI-I-01 (title-only diff)).
- The guard's TITLE_RE run over the real file extracts all 17 titles, including the multi-line `it.each([...])(` one at line 386.

Mutation testing (guard copied with the three files it reads into a scratch root, mutant applied there, nothing written to the tree):
MUTATION: sci-fi-weather.test.ts IT-WEATHER-I-004 title reverted to the old `IT-004: ...` title — KILLED by TC-WOI-U-01, TC-WOI-U-03, TC-WOI-U-04
MUTATION: `(line 501)` appended to the `_getChartData answers ... series` title — KILLED by TC-WOI-U-03, TC-WOI-U-04
MUTATION: IT-WEATHER-I-004 row deleted from weather.md — KILLED by TC-WOI-U-01, TC-WOI-U-03, TC-WOI-U-05
MUTATION: IT-WEATHER-I-004 row duplicated in weather.md — KILLED by TC-WOI-U-03
MUTATION: `drawImage` removed from the IT-WEATHER-I-004 row wording — KILLED by TC-WOI-U-05
MUTATION: `it.each` turned into `it.only.each` in sci-fi-weather.test.ts — KILLED by TC-WOI-U-06
MUTATION: F-CARD-05 row lists TC-504 for sci-fi-weather.test.ts — KILLED by TC-WOI-U-07

NOTES:
- Comments in sci-fi-weather.test.ts still name source lines (e.g. "the fallback branch at line 389"); FR-3 (only the four title strings change) explicitly keeps them, so not a defect of this lot.
- The IT-WEATHER-I-004 test does not assert "does not throw" explicitly; a throw from `_renderChart()` would fail the test, which is what the row claims. Spec Assumption 3 records the same reading.
- TITLE_RE tolerates one level of nested parentheses in an `it.each(...)` table; FR-1 pins exactly that (the `[f(1)]` fixture). A deeper-nested table would be missed — out of what the spec asks; 78y.8 (the repo-wide guard) owns generalisation.
- The guard reads its inputs at module load from process.cwd(); a missing file errors the whole suite instead of a named failure. Same shape as the vacuum precedent the spec names; not pinned otherwise.

CONFORMANCE EVIDENCE:
- FR-1 (every cited title id is declared, guard enforces it): tests/cards/weather/weather-ids-declared.test.ts:11-29 (extractor, detector, F-CARD-05 cut filtered to 05_cards row heads), :43-47 (non-empty declared sets + empty orphan list), :49-60 (four forms incl. `it.each([f(1)])`), :103-106 (TC-504 orphan, TC-502 passes).
- FR-2 (IT-WEATHER-I-004 row after IT-WEATHER-I-003, once, no line): docs/specs/cards/weather.md:154 directly after :153; wording names weatherIcon, afterDatasetsDraw, drawImage, console.warn, "Chart.js failed to init"; matches the test body at sci-fi-weather.test.ts:238-283 (plugin.id, drawImage spy, warn with "Chart.js failed to init" + Error). Checked by guard :62-63, :89-95.
- FR-3 (four titles changed, nothing else): sci-fi-weather.test.ts:237, :287, :294, :318 equal the FR-3 table's new titles verbatim; guard :62-79 compares whole extracted titles.
- FR-4 (no bare IT-004..IT-007, no line mention, no skip/only): guard :81-87 and :97-101; skip fixtures built from fragments as the Builder Calls require; guard spells no IT-WOI-I-* id (grep empty).

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 0 | pass |
| LOW | 0 | pass |

VERDICT: APPROVE
