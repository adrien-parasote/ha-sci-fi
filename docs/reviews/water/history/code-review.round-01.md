AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/water/sci-fi-water-management.ts | diff vs main + 100-200, 300-360 | see wc | no (diff-scoped) |
| src/cards/water/sci-fi-water-management-editor.ts | diff vs main + 40-60, 100-170 | see wc | no (diff-scoped) |
| src/utils/ws.ts | 1-10 | 10 | yes |
| src/types/ha.ts | diff hunk + 85-100 | see wc | no |
| docs/specs/cards/water_history.md | Known Gaps | see wc | no |
VERDICT: BLOCK
SPEC: docs/specs/cards/water.md, docs/specs/cards/water_history.md (lot register docs/fixes/water/lot.json)
FINDINGS:
- [HIGH] docs/specs/cards/water_history.md:162 — the D14 row cites :310, :321, :356 of sci-fi-water-management.ts; the O8 loading-flag fix moved the early returns into the try and shifted the code by 4 lines (now :306, :317, :352). TC-WSA-U-04 (tests/cards/water/water-history-aligned.test.ts:314) fails: `npx vitest run tests/cards/water` rc=1, 1 failed / 75 passed. FIX-CLASS: corrects. Expected: re-cite :306/:317/:352, whole suite green.
- [LOW] docs/reviews/water/code-review.md — the previous round's APPROVE was diff-scoped and recorded the O8 resolution without re-running the whole suite, which would have caught the HIGH. Expected: re-record after a full green suite.
NOTES:
- Prior LOW resolutions verified real: O9 registry fallback (editor.ts:113, :166-167; test_O9_editor_falls_back_to_hass_entities_when_the_registry_fetch_fails, fix-water.test.ts:158); O8 fetch-id at entry (:137-138), finally clears only the current fetch (:176-179), sandbox supersede at :187 (test_O8_every_early_exit_clears_the_loading_flag :147).
- callWS helper keeps `this` bound (src/utils/ws.ts:7-10); typing consistent (src/types/ha.ts:96-97).
- _historyLogs, `expanded`, _applyFiltersAndLimit: no remaining readers outside absence tests; _visibleLogs is the single filter/sort/50-cap.
- Security: no new surface; static template classes, no HTML injection, history/logbook rows type-checked.
