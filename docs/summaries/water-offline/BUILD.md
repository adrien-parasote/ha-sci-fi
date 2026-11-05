# BUILD - water-offline (stage summary)

**Decided:**
- Offline cache, badge, single 5 s retry, reconnect re-fetch implemented in src/cards/water/sci-fi-water-management.ts per spec FR-1..14; styles in src/cards/water/styles.ts (rows #ffaa00, opacity 0.75, header flex-wrap).
- FR string `Historique indisponible` added; `OFFLINE` already had `HORS LIGNE`.
- TC-WO-U-03 reads the waterStyles CSS text, not getComputedStyle (happy-dom unreliable in shadow DOM) - weaker than spec wording.
- Existing tests updated in place: water-history-aligned, water-ids-declared, card-css-baseline.json, I-008 rewrite (FR-14).
- test-compacted BYPASSED by the user: test_reduce.py plan crashes (helper JSON truncated at 64 KiB, plugin 7.96.0).

**Artifacts:** src/cards/water/sci-fi-water-management.ts, src/cards/water/styles.ts, xliff/fr.xlf, src/locales/locales/fr.js, dist/sci-fi.min.js, docs/specs/cards/water.md, docs/specs/cards/water_history.md, tests/cards/water/water-offline.test.ts, .sc/task.md

**Intent items touched:** none

**Open/risky:** suite 1659 passed / 1 skipped; tsc clean; lint 0 errors. .sc/plan-bypass was posted by sc_route.py authorize-feature. Nothing committed.

**Dead ends:** test_reduce.py plan (plugin crash, do not retry on 7.96.0)

**Next action:** VERIFY: scr.py why, then /verify-stage.

**Tests:** files +1 ~3 −0 · cases +21 −1 · 2 earlier test file(s) edited, none lost a case
