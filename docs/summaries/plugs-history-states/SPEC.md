# SPEC - plugs-history-states (stage summary)

**Decided:**
- Per-plug attempt record `_historyAttempts: Map<powerEntityId, HistoryAttempt>` (loading/loaded/empty/error); `_chartLoaded`, `fetchedAt`, `_chart_generation` removed (FR-1, FR-13).
- Strict 2000 ms budget; late answer discarded -> error + Retry; timeout and request error share one text; toast dropped (user 2026-11-05; FR-5, FR-6).
- Retry sets loading synchronously, one request; works on single-device dashboards (FR-7).
- Token + card generation gate every write; disconnect clears timers; reconnect refetches loading records (FR-9, FR-17, B-6).
- a11y: loading role=status, error role=alert, focus to .chart-section; chart height reserved (FR-15, FR-16, agent's calls).
- No refresh of a loaded chart: ACCEPTED-LIMIT FR-12. Spike: no. Build mode: headless.

**Artifacts:** docs/specs/plugs-history-states/spec.md, docs/adversarial-review/plugs-history-states.md

**Intent items touched:** none

**Open/risky:** three past attempts regressed (bead ha-sci-fi-8ap): each regression has its own TC (U-01 round 2, I-01/I-02 round 4a, U-07/U-08 round 4b, U-09 round 5, U-05/I-03 round 1). Existing plugs tests must migrate to HistoryAttempt fixtures (FR-13). plugs.md AF2 amendment owed (FR-19).

**Dead ends:** `_chartLoaded` set only on success (round 2: refetch storm on hass updates); load triggered by firstUpdated (round 4: never loads in some mount orders); reentrancy guard on a flag cleared by the reset (round 4b).

**Next action:** TDD: tests/cards/plugs/plugs-history-states.test.ts from TC-PHS-U-01..25, I-01..04.

**Tests:** files +21 ~24 −1 · cases +88 −31 · 9 earlier test file(s) edited, none lost a case
