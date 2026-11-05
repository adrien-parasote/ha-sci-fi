AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/water/sci-fi-water-management.ts | diff hunks + 1-60, 110-260, 385-415 | 791 | partial (all changed regions and their callers) |
| src/cards/water/styles.ts | diff hunks | - | partial |
| src/locales/locales/fr.js / xliff/fr.xlf | grep of the two ids | - | partial |
| tests/cards/water/water-offline.test.ts | test ids, run | 382 | partial |
| docs/specs/cards/water_history.md, water.md | changed rows | - | partial |
must_read.txt: empty (no entry point packaged).
VERDICT: APPROVE
SPEC: docs/specs/water-offline/spec.md
FINDINGS:
- [LOW] docs/specs/cards/water_history.md:158 — a reader following the line reference lands on the wrong statement as soon as the card file shifts — D12 row cites `:233` for `_historyOffline` being set; a symbol reference (`_markOffline`) would not rot.
  RESOLUTION: fixed — D12 row now cites the symbol `_markOffline` instead of `:233`; proof: `grep -c ':233' docs/specs/cards/water_history.md` = 0 (doc-only change, no test applies)
NOTES:
- Fetch triggers stay `updated` (floor / entityIds change), sync button, retry timer, and the reattach in connectedCallback; matches FR-4 and the Builder Calls line on reattach.
- Pre-existing `let logs: any[]` is outside this lot's change.
- Tests: tests/cards/water 96 passed / 1 skipped; tests/cards/water_history 13 passed. All 20 spec test ids present in tests/cards/water/water-offline.test.ts.
### Spec limit F-01 — holds
FR-1 (a fetch keeps the old rows while it runs): src/cards/water/sci-fi-water-management.ts `_fetchHistoryLogs` no longer assigns `_rawLogs = []`; I-008 rewritten at tests/cards/water_history/sci-fi-water-management-history.test.ts:232-241 and passes.
### Spec limit F-02 — holds
FR-13 (nothing to query clears cache): both early returns call `_resetHistoryCache()` (sci-fi-water-management.ts:188-191, :200-203); entityIds change and floor change reset in willUpdate (:121, :130). Covered by TC-WO-U-12.
### Spec limit F-03 — holds
FR-10 (badge shows cache time): `_offlineLabel()` formats `_cachedAt` with getLocale(), 2-digit hour/minute, hour12 false; `_cachedAt = Date.now()` only on current-fetch success (:216). TC-WO-U-14.
CONFORMANCE EVIDENCE:
- FR-2 (both sources reject = offline): catch with fetchId guard -> `_markOffline` (:220); logbook fallback success path sets online (:213-217).
- FR-3 (badge role=status, offline class, dimmed orange, wrapping header): template :393-396; styles.ts `.log-console.offline .log-entry { color:#ffaa00; opacity:0.75 }`, `.log-header flex-wrap: wrap`.
- FR-4 (single retry at 5 s): `_markOffline` returns on isRetry, window.setTimeout 5000 calling `_fetchHistoryLogs(true)` guarded by isConnected.
- FR-6 (lifecycle): `_clearOfflineRetry` at fetch start, in disconnectedCallback and `_resetHistoryCache`; superseded fetch untouched by fetchId guards.
- FR-9 (strings): fr.js `HORS LIGNE` (sba57eb78174ce7a8, existing id reused) and `Historique indisponible`; xliff units at fr.xlf:862, :1407.
- FR-11: empty-log text switches on `_historyOffline` (:409).

## Round 2 (delta)
AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| .verifyignore | delta hunk | 33 | yes |
| docs/specs/cards/water_history.md | delta hunk + D12 rows :7, :97, :154, :158 | n/a | delta only |
SPEC: docs/specs/water-offline/spec.md
FINDINGS:
- none (critical: 0, high: 0)
NOTES:
- .verifyignore P7 entry for src/cards/bridge/sci-fi-bridge.ts: `git diff --stat b312e10` on it is empty, so this is debt the base already had.
- water_history.md:158 cites `:233`. src/cards/water/sci-fi-water-management.ts:233 is `this._historyOffline = true;` in `_markOffline`, and the retry at 5 s is at :234-238. TC-WSA-U-04 requires this cite. It supersedes the round-1 RESOLUTION, which had removed the cite.
- water_history.md:97 matches the code (:241-245, :409, styles.ts:412-429).
CONFORMANCE EVIDENCE:
- FR-2/FR-4: src/cards/water/sci-fi-water-management.ts:232-238
- FR-10: src/cards/water/sci-fi-water-management.ts:241-245
VERDICT: APPROVE
