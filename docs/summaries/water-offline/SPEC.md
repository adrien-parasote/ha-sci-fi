# SPEC - water-offline (stage summary)

**Decided:**
- Offline = recorder AND logbook both reject; in-memory one-slot cache kept, dimmed #ffaa00 (opacity >= 0.7), badge `[ OFFLINE · HH:MM ]` role=status (FR-2/3/10).
- One retry at 5 s via `_fetchHistoryLogs(isRetry=true)`; a failing retry re-arms nothing (FR-4).
- Lifecycle table FR-6 is the state contract per path (start, success, both-reject, superseded, floor/entityIds change, timer, disconnect, reconnect).
- Empty offline -> `History unavailable`; nothing-to-query clears all (FR-11, FR-13).
- Strings OFFLINE/HORS LIGNE, History unavailable/Historique indisponible (FR-9).
- Simultaneous retries across cards accepted (FR-12 ACCEPTED-LIMIT). Spike: no. Build mode: headless.

**Artifacts:** docs/specs/water-offline/spec.md, docs/adversarial-review/water-offline.md

**Intent items touched:** none

**Open/risky:** existing test IT-WATER-HISTORY-I-008 and the mountCard comment in tests/cards/water_history/sci-fi-water-management-history.test.ts must be rewritten (FR-14). Builder calls (locale getLocale + hour12:false, badge span after .log-title) are in spec "Builder Calls". Hung WebSocket out of scope (Assumption 5).

**Dead ends:** none

**Next action:** TDD: write tests/cards/water/water-offline.test.ts from TC-WO-U-01..16 and IT-WO-I-01..04, rewrite I-008, lock.

**Tests:** files +20 ~24 −1 · cases +67 −30 · 9 earlier test file(s) edited, none lost a case
