# Adversarial review — water-offline

Regime: fan-out (Security, User, Scope — sonnet, author opus). Round 1. Verdict: CLAIM_OVERSTATED — no critical, the spec leaves stale-state and test-scope holes.

## Findings

- [HIGH] — F-01 FR-1 breaks IT-WATER-HISTORY-I-008 (`sci-fi-water-management-history.test.ts:232-241` asserts `_rawLogs` is `[]` right after a fetch starts); the spec names no existing test to retire or rewrite (Scope) [RESOLVED] TC-WO-U-01, TC-WO-U-10 — FR-14 rewrites I-008 and its comment, FR-8 restates the I-008 row
- [HIGH] — F-02 Early returns (`entityIds` empty `:153`, no queryable ids `:163`) and an `entityIds` change keep the old cache and a stale `_historyOffline` — other entities' rows or `[ OFFLINE ]` with no query made (Security + Scope, convergence) [RESOLVED] TC-WO-U-12 — FR-13 and the FR-6 lifecycle table
- [HIGH] — F-03 The cached rows carry no age: after a long outage the user reads hour-old valve/leak events as current (User) [RESOLVED] TC-WO-U-14 — FR-10, cache time in the badge (user 2026-11-05)
- [MEDIUM] — F-04 FR-4 gives no mechanism telling the timer's retry from a user fetch, so "a retry that fails again schedules no further retry" is not buildable as written (Scope) [RESOLVED] TC-WO-U-06 — FR-4 `isRetry` parameter
- [MEDIUM] — F-05 FR-6's floor-change reset of `_historyOffline` has no stated home (`willUpdate`), and the timer callback states no `isConnected` / `_fetchId` guard; `disconnectedCallback` does not exist yet and a re-attached card stays offline with no timer (Security + Scope) [RESOLVED] IT-WO-I-04, TC-WO-U-07 — FR-6 lifecycle table
- [MEDIUM] — F-06 No TC pins "history rejects, logbook resolves" (partial failure is online) (Scope) [RESOLVED] TC-WO-U-13
- [MEDIUM] — F-07 TC-WO-U-03 reads CSS text only, TC-WO-U-08 names no observable for "no retry timer" (Scope) [RESOLVED] TC-WO-U-03, TC-WO-U-08 — computed style, `_offlineRetryTimer` null
- [MEDIUM] — F-08 The offline signal is not announced to assistive tech (`role="status"` absent) and the dimmed rows' contrast is unbounded (User) [RESOLVED] TC-WO-U-02, TC-WO-U-03 — FR-3 role and opacity ≥ 0.7
- [MEDIUM] — F-09 Offline with an empty cache renders `No events recorded.`, the very ambiguity the lot exists to remove (User) [RESOLVED] TC-WO-U-04 — FR-11 `History unavailable` (user 2026-11-05)
- [MEDIUM] — F-10 Nothing tells the user a fetch is in flight while offline (sync click, pending retry) (User) [RESOLVED] TC-WO-U-16 — FR-12, existing scanner (user 2026-11-05)
- [LOW] — F-11 The French value of `OFFLINE` is not fixed and the header width on phones is unspecified (User) [RESOLVED] TC-WO-U-11, TC-WO-U-03 — FR-9 `HORS LIGNE`, FR-3 `flex-wrap`
- [LOW] — F-12 N cards retry in the same instant after an outage (bounded at one retry each) (Security) [ACCEPTED: spec FR-12]
- [LOW] — F-13 No test that a cached log message containing markup renders as text in the offline state (Security) [RESOLVED] TC-WO-U-15

## Cross-synthesis

- Convergence: F-02 raised by two lenses independently — the highest-confidence hole: FR-1 removes the only reset without replacing it on the paths that never reach a query.
- Pattern: F-02, F-04, F-05 are one class — the spec states outcomes of the fetch lifecycle without naming the state transitions per path (start, early return, success, both-reject, supersede, timer, disconnect, reconnect).
- Tension: F-03 / F-09 / F-10 (more user feedback) against the user's brief "`[ OFFLINE ]` header" — each adds strings and FR rows; the smallest one that closes each is preferred.
- Blind spot: no lens checked a hung WebSocket (no rejection ever) — the card would scan forever; today's behaviour, unchanged by this lot.

## Stress-test

One hostile pass over the top arguments. F-01 holds: the test exists and will go red. F-02 holds: FR-1 removes the clear and the two early returns sit before any assignment. F-04 holds: a retry and a sync are the same call. F-03 is a real gap for a water card but the smallest fix is a time in the header, not a new subsystem. F-12 and F-13 are low and bounded. Verdict: the spec is sound in direction, owes one lifecycle table and four test rows; no redesign.

## Hostile-Input Checklist

- HIC-1 N/A — bounded: one retry per failed fetch, cache capped at 50 rows by the existing slice
- HIC-2 FINDING F-13
- HIC-3 N/A — no new sink; only a static `msg('OFFLINE')` string is added and Lit escapes interpolations
- HIC-4 N/A — no route or authz; `hass.callWS` runs under the user's own HA session
- HIC-5 FINDING F-06
- HIC-6 N/A — the only number is the fixed 5000 ms constant; no user-supplied numeric field

## Builder check

One cold builder (sonnet), spec only, 8 questions.

### Answered
- Reattach double fetch — Builder Calls "Reattach" line (FR-6)
- One cache slot vs per-floor map — Builder Calls "one slot" line (Assumption 2, IT-WO-I-03)
- Retry on the FR-13 path — Builder Calls "unreachable" line (FR-6)

### My calls
- `_fetchId` and timer clear on every fetch, retry included — Builder Calls
- `offline` class kept while loading — Builder Calls
- Locale `getLocale()` with `hour12: false` — Builder Calls (FR-10)
- Badge markup and colour — Builder Calls (FR-3)
- `console.warn` texts unchanged, repeated on retry — Builder Calls

### Theirs
none
