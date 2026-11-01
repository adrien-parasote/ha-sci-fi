AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/tv/tv-ids-declared.test.ts | 1-49 | 49 | yes |
| docs/specs/cards/tv.md | diff hunks + rows 289-343 | 381 | partial (diff scope) |
| tests/cards/tv/sci-fi-tv.test.ts | diff + 340-830 (all 27 renamed tests) | 1020 | partial (diff scope) |
| tests/cards/tv/sci-fi-tv-editor.test.ts | diff + 149-251 (TC-TV-U-716..719, 739) | 336 | partial (diff scope) |
| docs/specs/tv-orphan-ids/spec.md | full | spec | yes |
(must_read.txt is empty: no entry point was packaged.)
VERDICT: APPROVE
SPEC: docs/specs/tv-orphan-ids/spec.md
FINDINGS: none (0 critical, 0 high)
NOTES:
- FR-2 reading check done row by row: every row TC-TV-U-716..745 in docs/specs/cards/tv.md:314-343 matches what its test body asserts (the event count and payload for 716-719/739; `.offline-banner` for 720/721; turn_off/turn_on args for 722/723; truthy string for 724-726/740/741/743-745 and `'HDMI 2'` for 742; callService not called / select_source / play_media / script.start_netflix / hass-action once for 727-732; drag-state fields for 733-736; both ids for 737; `75%` for 738).
- Titles of TC-TV-U-740 ("standby string") and TC-TV-U-741 ("idle string") at tests/cards/tv/sci-fi-tv.test.ts:446,454, and the comment "covers all branches" at :436, say more than the tests assert (they only check for a truthy string). The spec rows say what is asserted. The builder call says only the id changes in a title, so this wording comes from before this lot and is not a defect of the lot.
- The test diff touches only it() titles and their comment lines: a grep of the +/- lines in tests/ that are not it() or comment lines found nothing (IT-TVO-I-01, the diff holds only title and comment lines).
- The mapping table (TC-718b to TC-TV-U-739 … TC-726b to TC-TV-U-745) is respected: 739 editor:211, 740-742 card:446-462, 743/744 card:479/487, 745 card:505.
- The note above the table was updated to "quarante-neuf lignes" (tv.md:292). 30 + 19 = 49, consistent.
- Run: vitest on tests/cards/tv and tests/specs/ids-cas-uniques.test.ts: 5 files, 78 tests passed, exit 0 (IT-TVO-I-02, the repo-wide id guard, is green).
CONFORMANCE EVIDENCE:
- FR-1 (every cited id is declared) → tests/cards/tv/tv-ids-declared.test.ts:24-31 (the U-01 orphan check, plus the U-02 fixture that returns the orphan 'TC-TV-U-99999')
- FR-2 (one row per case, read from its assertions) → tv.md:314-343; tv-ids-declared.test.ts:33-38 (each id appears exactly once)
- FR-3 (no unprefixed TC-7xx title, no skip/todo/only) → tv-ids-declared.test.ts:40-48; grep "TC-7[0-9][0-9]" on both tv test files finds no match

## Round 2 (delta)
AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/tv/tv-ids-declared.test.ts | 1-49 | 49 | yes |
| docs/specs/tv-orphan-ids/spec.md | strikethrough rows 25-28 + mapping table | spec | partial (delta scope) |
| .verifyignore | diff hunk | 23 | partial (delta scope) |
| dist/sci-fi.min.js | stat only (generated bundle; src/ unchanged vs HEAD) | bundle | no (generated) |
(must_read.txt is empty: no entry point was packaged.)
VERDICT: APPROVE
SPEC: docs/specs/tv-orphan-ids/spec.md
FINDINGS: none (0 critical, 0 high)
NOTES:
- The `?? ''` fallbacks at tests/cards/tv/tv-ids-declared.test.ts:11,14 only satisfy noUncheckedIndexedAccess; capture groups 2 and 1 always participate in a match, so behaviour is unchanged. `tsc --noEmit` exit 0.
- spec.md:25-28 strikes through only the 4 old ids in the left column (TC-718b, TC-724b/c/d); TC-725b, TC-725c, TC-726b in the right column are not struck. It looks inconsistent, but it is only a historical mapping table and no guard depends on it (tests green), so it is not a defect.
- The .verifyignore entry suppresses P7 for src/sci-fi.ts only. That file is not touched by this lot (`git status` shows no src/ change), and the justification is written inline.
- dist/sci-fi.min.js was rebuilt from an unchanged src/, so no product behaviour moves.
- Run: vitest tests/cards/tv + tests/specs: 10 files, 160 tests passed, exit 0.
CONFORMANCE EVIDENCE:
- FR-1 (every cited id is declared) → tests/cards/tv/tv-ids-declared.test.ts:24-31 (still green after the type fix)
- FR-3 (no unprefixed TC-7xx title) → tests/cards/tv/tv-ids-declared.test.ts:40-44
