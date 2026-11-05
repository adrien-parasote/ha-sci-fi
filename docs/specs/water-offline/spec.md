---
spec: docs/specs/water-offline/spec.md
sources:
  - src/cards/water/sci-fi-water-management.ts
  - src/cards/water/styles.ts
  - docs/specs/cards/water_history.md
  - docs/specs/cards/water.md
---

# Water History Offline Display — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-8fn3` (escalated from fix lot `water`, observation of `ha-sci-fi-1k7`). Today `_fetchHistoryLogs` empties `_rawLogs` before every call (`sci-fi-water-management.ts:141`); when the recorder query and the logbook fallback both reject, the card logs a `console.warn` and renders `No events recorded.`, the same state as an empty history. A sync click while HA is unreachable therefore wipes a list that was good a minute earlier. [water_history.md](../cards/water_history.md) Known Gaps D12 withdrew the old offline requirement and left it to a product decision; this spec is that decision (user, 2026-11-05: in-memory cache of the last success, `[ OFFLINE ]` header, one automatic retry after 5 s, then manual sync; review answers 2026-11-05: cache time in the header, a distinct empty-offline message, the existing scanner as the in-flight signal, simultaneous retries accepted).

## Requirements

- **FR-1**: a fetch no longer empties `_rawLogs` when it starts. `_rawLogs` is emptied only by a floor change or an `entityIds` change (both in `willUpdate`, FR-6) and by a fetch that has nothing to query (FR-13), and replaced only by a successful fetch for the current `_fetchId`.
- **FR-2**: the history is **offline** when, for the current `_fetchId`, `_queryHistory` rejected and `_queryLogbook` then rejected too. The card then sets `_historyOffline = true` and keeps `_rawLogs` and `_cachedAt` as they were (the cache of the last success on this floor, possibly empty). `_queryHistory` rejecting while `_queryLogbook` resolves is a success (FR-5), never offline.
- **FR-3**: while `_historyOffline` is true, `.log-header` shows a `.log-offline` element carrying `role="status"`, the `.log-console` element carries the class `offline`, and cached `.log-entry` rows render dimmed orange through `styles.ts`: colour `#ffaa00` (the warning colour of `.log-entry[data-status="warning"]`) and an `opacity` of at least 0.7 and below 1. `.log-header` wraps its children (`flex-wrap: wrap`) so the badge never overflows a 375 px card.
- **FR-4**: after an offline fetch started by a user, a floor or an `entityIds` change, the card schedules **one** automatic retry 5000 ms later (`water.md` Error Handling "API Failure … Retry in 5s") as `_fetchHistoryLogs(true)`. A fetch called with `isRetry = true` that ends offline schedules nothing; a fetch called with `isRetry = false` (the default — sync button, `updated`, reconnect) that ends offline arms one retry.
- **FR-5**: a successful fetch (either source resolves, an empty result included) for the current `_fetchId` sets `_historyOffline = false`, replaces `_rawLogs` and sets `_cachedAt = Date.now()`; the `.log-offline` badge and the `offline` class disappear.
- **FR-6**: lifecycle — every transition of the offline state, per path:

  | Path | `_rawLogs` | `_historyOffline` | `_cachedAt` | retry timer |
  |---|---|---|---|---|
  | fetch starts (`_fetchHistoryLogs`) | kept | kept | kept | cleared |
  | nothing to query (FR-13) | `[]` | `false` | `null` | none |
  | success, current `_fetchId` | replaced | `false` | `Date.now()` | none |
  | both reject, current `_fetchId` | kept | `true` | kept | armed once if `isRetry` false |
  | superseded fetch settles (`_fetchId` moved on) | untouched | untouched | untouched | untouched |
  | floor change or `entityIds` change (`willUpdate`) | `[]` | `false` | `null` | cleared |
  | timer fires | — | — | — | runs `_fetchHistoryLogs(true)` only if `this.isConnected` |
  | `disconnectedCallback` | kept | kept | kept | cleared |
  | `connectedCallback` while `_historyOffline` and `this.hass` set | kept | kept | kept | — ; starts `_fetchHistoryLogs()` |

- **FR-7**: the sandbox path (`this.hass` undefined) is unchanged and never sets `_historyOffline`.
- **FR-8**: [water_history.md](../cards/water_history.md) and [water.md](../cards/water.md) state this behaviour: the Error Handling rows "HA API timeout / offline" and "Active floor changes", the Known Gaps D12 line marked resolved by this lot, water.md's "API Failure" row naming the history log, and water_history.md's IT-WATER-HISTORY-I-008 row restated as "a fetch keeps the old logs while it runs".
- **FR-9**: two user-visible source strings are added, `OFFLINE` (French `HORS LIGNE`) and `History unavailable` (French `Historique indisponible`), with their `xliff/fr.xlf` units and `src/locales/locales/fr.js` rebuilt (`npm run localize-extract`, `npm run localize-build`); the id parity test stays green.
- **FR-10**: the badge text is `[ ${msg('OFFLINE')} · HH:MM ]`, `HH:MM` being `_cachedAt` formatted with `toLocaleTimeString(<current locale>, { hour: '2-digit', minute: '2-digit' })`; with `_cachedAt` null (no success on this floor) it is `[ ${msg('OFFLINE')} ]`.
- **FR-11**: offline with an empty cache, the list area renders `.empty-log` with `History unavailable`, never `No events recorded.`; online with no events it stays `No events recorded.`.
- **FR-12**: while a fetch is in flight offline (sync click, retry, reconnect), the existing `.log-scanner` replaces the list as today and the `.log-offline` badge stays shown until the fetch settles. [ACCEPTED-LIMIT: user, 2026-11-05 — after an outage every card on the dashboard fires its single retry 5 s after its own failure, so retries may land in the same instant; bounded at one request per card, no jitter; timing across cards is not a behaviour a unit test pins.]
- **FR-13**: a fetch with `this.hass` set whose `entityIds` is empty or holds no id of a meaningful domain (the early returns at `sci-fi-water-management.ts:153` and `:163`) sets `_rawLogs = []`, `_historyOffline = false`, `_cachedAt = null`, and arms no retry.
- **FR-14**: existing test IT-WATER-HISTORY-I-008 (`tests/cards/water_history/sci-fi-water-management-history.test.ts`) is rewritten to assert that `_rawLogs` still holds its rows right after `_fetchHistoryLogs()` is invoked, and the `mountCard` comment above it stops saying a connect resets `_rawLogs`.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | "Offline" is detected only as both WebSocket queries rejecting; no `navigator.onLine`, no connection-state subscription | Medium | TELL — user decision 2026-11-05; code `:164-176` | TC-WO-U-02 |
| 2 | The cache is in memory, per element and per floor: a page reload or a floor change loses it | Low | TELL — user decision 2026-11-05 | TC-WO-U-07 |
| 3 | An empty result from a resolving query is a success (online, no events), not offline | Medium | SHOW — `_queryHistory` / `_queryLogbook` return `[]` on an empty response | TC-WO-U-05 |
| 4 | `#ffaa00` is the warning colour already used by `.log-entry[data-status="warning"]` (`styles.ts:409-416`); no new token | Low | SHOW — `styles.ts` | TC-WO-U-03 |
| 5 | A hung WebSocket (no rejection ever) keeps the scanner forever — today's behaviour, unchanged by this lot | Low | SHOW — no timeout in `_queryHistory` | — |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Retry loop (`setInterval`, or every retry re-arming itself) | one timer per failed non-retry fetch, FR-4 |
| 2 | Timer left alive after the card is removed | cleared in `disconnectedCallback`, the callback checks `isConnected`, FR-6 |
| 3 | Emptying the cache to "show fresh state" while loading | the scanner shows while loading; the list is kept, FR-1 |
| 4 | Showing another entity set's rows after an `entityIds` change | `willUpdate` empties the cache on that change, FR-6 |

## Test Case Specifications

Tests live in `tests/cards/water/water-offline.test.ts` and cite these ids in their titles. The card is driven with a mock `hass` whose `callWS` is a `vi.fn` resolving or rejecting per call; fake timers drive the 5 s retry and `Date.now()`.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-WO-U-01 | fetch succeeds with 2 rows, then a second fetch is started and kept pending | FR-1, FR-14 | while pending `_rawLogs` still holds the 2 rows |
| TC-WO-U-02 | fetch succeeds with 2 rows, then both `callWS` reject on sync | FR-2, FR-3 | `_historyOffline` true; `_rawLogs` the 2 rows; `.log-offline` rendered with `role="status"`; `.log-console` has class `offline`; 2 `.log-entry` rendered |
| TC-WO-U-03 | mounted element offline with 2 cached rows; `getComputedStyle` of a `.log-entry` and of `.log-header` | FR-3 | entry `color` is `rgb(255, 170, 0)`, `opacity` ≥ 0.7 and < 1; header `flex-wrap` is `wrap` |
| TC-WO-U-04 | first fetch both-reject with no cache | FR-3, FR-10, FR-11 | badge text `[ OFFLINE ]`; `.empty-log` text `History unavailable`; no `No events recorded.` |
| TC-WO-U-05 | offline, then 5000 ms elapse and the retry resolves `[]` | FR-4, FR-5, FR-11 | exactly one new `history/history_during_period` call at 5000 ms (none at 4999); `_historyOffline` false, no `.log-offline`, `.empty-log` text `No events recorded.` |
| TC-WO-U-06 | offline, the retry fails again, 60 s elapse, then a sync click that fails, then 5000 ms | FR-4 | no `callWS` between the retry and the click; after the click's failure exactly one retry fires at 5000 ms |
| TC-WO-U-07 | offline with a retry pending, then (a) floor change, (b) element removed | FR-6 | no `callWS` from the timer in either case; (a) `_historyOffline` false, `_rawLogs` `[]`, `_cachedAt` null |
| TC-WO-U-08 | a fetch for floor A rejects after a floor switch to B started a new fetch | FR-6 | `_historyOffline` false and `_offlineRetryTimer` null after A's rejection settles |
| TC-WO-U-09 | no `hass` (sandbox) | FR-7 | `_historyOffline` stays false |
| TC-WO-U-10 | read the two card specs | FR-8 | water_history.md has `[ OFFLINE` in its "HA API timeout / offline" row, D12 marked resolved by `water-offline` and the I-008 row restated; water.md "API Failure" row names the history log |
| TC-WO-U-11 | read `xliff/fr.xlf` and `src/locales/locales/fr.js`; scan `msg(` sources of the card | FR-9 | `msg('OFFLINE')` and `msg('History unavailable')` present in the card; a `fr.xlf` unit and a `fr.js` entry exist for each id, French `HORS LIGNE` and `Historique indisponible` |
| TC-WO-U-12 | offline with 2 cached rows and `_cachedAt` set, then `entityIds` set to `[]` and a fetch runs; separately, `entityIds` set to `['light.x']` only | FR-13, FR-6 | both cases: `_rawLogs` `[]`, `_historyOffline` false, `_cachedAt` null, `_offlineRetryTimer` null, no `.log-offline` |
| TC-WO-U-13 | `history/history_during_period` rejects, `logbook/get_events` resolves 1 row | FR-2, FR-5 | `_historyOffline` false; `_rawLogs` the 1 row; `_offlineRetryTimer` null |
| TC-WO-U-14 | `Date.now()` set to 2026-11-05T14:32 local, fetch succeeds, then both reject | FR-10, FR-5 | badge text `[ OFFLINE · 14:32 ]` (`[ HORS LIGNE · 14:32 ]` under `fr`) |
| TC-WO-U-15 | offline, cached row whose `name` is `<img src=x onerror=alert(1)>` | FR-3 | no `img` element under `.log-console`; the entry's text contains `<img src=x` |
| TC-WO-U-16 | offline with cache, sync clicked, both `callWS` kept pending | FR-12 | `.log-scanner` rendered and `.log-offline` still rendered |
| IT-WO-I-01 | real `sci-fi-water-management` element created with `document.createElement`, appended to `document.body`, `setConfig` then `hass` assigned (a floor with one `switch.*` water entity); `callWS` resolves 2 rows, then rejects on both endpoints after a click on `.floor-sync-btn`, then resolves 1 row on the 5 s retry | FR-1, FR-2, FR-3, FR-4, FR-5 | after the click: `.log-offline` and the 2 cached rows in the shadow DOM; after 5000 ms: no `.log-offline`, 1 row |
| IT-WO-I-02 | same real element offline with a retry pending, then removed from `document.body`; 10 s elapse | FR-6 | no `callWS` call after the removal |
| IT-WO-I-03 | same real element with two floors, offline on floor A with cache, then the floor B hexagon clicked and B's fetch resolves 1 row | FR-6, FR-5 | no `.log-offline`; only B's row rendered; the pending retry for A never calls `callWS` |
| IT-WO-I-04 | same real element offline with cache, removed from `document.body`, then appended again with `callWS` resolving 1 row | FR-6, FR-5 | one `callWS` on reattach; no `.log-offline`; 1 row |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| recorder and logbook both reject | `.log-offline` badge with cache time, cache kept dimmed; empty cache → `History unavailable` | one retry at 5 s, then sync button | `console.warn` (unchanged) |
| recorder rejects, logbook resolves | online, logbook rows shown | — | `console.warn` (unchanged) |
| retry fails | stays offline | sync button | `console.warn` |
| card removed with retry pending | timer cleared | re-fetch on reattach | none |

## Builder Calls

- Field names `_historyOffline`, `_offlineRetryTimer` and `_cachedAt` (*mine*); timer via `window.setTimeout`, cleared with `clearTimeout`, reset to `null`.
- Signature `_fetchHistoryLogs(isRetry = false)` (*mine*); the timer callback calls `_fetchHistoryLogs(true)`.
- The bracket text is built in the template around `msg('OFFLINE')` (*mine*), as `.log-time` does for timestamps.
- French values `HORS LIGNE` and `Historique indisponible` (*mine*).
- Every `_fetchHistoryLogs` call, a retry included, increments `_fetchId` and clears `_offlineRetryTimer` first; a retry superseded by a sync settles untouched like any superseded fetch (agent's call: one rule for every fetch).
- While loading offline, `.log-console` keeps the `offline` class and the badge; only the list area shows the scanner (agent's call).
- Reattach: `updated` fetches only on a `_activeFloorId` / `entityIds` change, which a reattach does not produce, so `connectedCallback` is the single fetch IT-WO-I-04 counts (answered from FR-6).
- The cache is one slot (`_rawLogs`, `_cachedAt`), not a per-floor map: returning to a floor shows the scanner until its fetch settles (answered: Assumption 2, IT-WO-I-03).
- "Current locale" in FR-10 is lit-localize `getLocale()`, with `hour12: false` so the time is `HH:MM` in every locale (agent's call: TC-WO-U-14 expects `14:32`).
- `.log-offline` is one `<span>` after `.log-title`, its whole text read by `textContent`, colour `#ffaa00`, the title's font (agent's call).
- A retry hitting the FR-13 path is unreachable once `willUpdate` clears the timer on an `entityIds` change; FR-13 still arms nothing (answered: FR-6).
- Both `console.warn` messages keep their text; a failing retry logs them again (agent's call).

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-2` | code — `SciFiWaterManagementCard._fetchHistoryLogs` | Lovelace dashboards through `sci-fi-water-management` |
| `FR-3` | code — `_renderHistoryLogs`, `styles.ts` | same |
| `FR-6` | code — `willUpdate`, `connectedCallback`, `disconnectedCallback` | same |
| `FR-8` | docs — `water_history.md`, `water.md` | readers of the card specs |

## References

- [water_history.md](../cards/water_history.md)
- [water.md](../cards/water.md)
