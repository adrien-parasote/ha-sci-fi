---
spec: docs/specs/plugs-history-states/spec.md
sources:
  - src/cards/plugs/sci-fi-plugs.ts
  - tests/cards/plugs/sci-fi-plugs.test.ts
  - docs/specs/cards/plugs.md
  - docs/reviews/p1-runtime-defects/code-review.md
---

# Plugs power-history states — Implementation Spec

Document Type: implementation

## Overview

The plugs card's 24 h power chart (`SciFiPlugs._loadPowerChart` in [sci-fi-plugs.ts](../../../src/cards/plugs/sci-fi-plugs.ts)) owes the loading state, error state and 2 s budget of [plugs.md § Adversarial Fixes item 2 (F-PLG-AF2)](../cards/plugs.md#adversarial-fixes-edge-cases--error-states) and has none (bead ha-sci-fi-8ap). Three earlier attempts each caused a regression (bead table, rounds 2 and 4); this spec replaces the single boolean latch `_chartLoaded` with a **per-plug attempt record keyed by the plug's power entity id**, invalidated on config change, and an **ownership invariant**: an async answer writes state, chart or message only when its attempt is still the current attempt of the selected plug. Every regression of the three attempts is pinned by a test case below. Interface: [OWN-INTERFACE] for the card; the HA REST route `history/period` is consumed as already shipped [NO-BUNDLE-PUBLISHED].

## Requirements

- **FR-1**: The card keeps one attempt record per plug, keyed by that plug's power entity id, in `_historyAttempts: Map<string, HistoryAttempt>`, with `status` one of `'loading' | 'loaded' | 'empty' | 'error'`; a key absent from the map means "never attempted".
- **FR-2**: `updated()` starts a history request for the selected plug if and only if the card body (`.chart-container`) is rendered, `hass` is set, the plug has a power sensor, and its key is absent from `_historyAttempts` — whatever property changed in that update (`hass`, `config`, `_selected_plug_id`) and whatever the mount order (`setConfig`→`appendChild`→`hass`, `hass` first, or `devices: []` then `setConfig`).
- **FR-3**: A `hass` update never starts a request for a key already present in `_historyAttempts`, whatever its status (no refetch per power reading, including after an error).
- **FR-4**: While the selected plug's attempt is `'loading'`, the chart section renders an element `.history-loading` with `role="status"` and the text `msg('Loading history…')`; `.chart-container` stays in the DOM with `display: none`, and `.msg-container` renders no text.
- **FR-5**: Each request is raced against a 2000 ms budget (`HISTORY_BUDGET_MS = 2000`, strict: an answer at 1999 ms is accepted, at 2000 ms the attempt is already `'error'`) via `_withTimeout(promise, ms)`; on expiry the attempt becomes `'error'` with reason `'timeout'`.
- **FR-6**: When the request rejects or times out, the selected plug's chart section renders `.history-error` with `msg('Power history unavailable')` and a `sf-button.history-retry` labelled `msg('Retry')`; it never renders the empty-state text `msg('No power data to display')`, and no toast is raised for a history failure. `.history-error` carries `role="alert"`. Timeout and request errors render the same single string `msg('Power history unavailable')` (user decision 2026-11-05: one string; `reason` is stored for tests and not surfaced).
- **FR-7**: Activating `.history-retry` synchronously replaces the selected plug's record with a new `'loading'` attempt (new token) before any `await`, and starts exactly one new request — a second activation in the same tick finds the key present and starts nothing (FR-3), so a single-device dashboard (no navigation arrows, `devices.length === 1`) recovers its chart without reload.
- **FR-8**: A point is a history element that is an object with a string `state` parsing to a finite number (`Number.isFinite(parseFloat(state))`); other elements (`'unavailable'`, `'unknown'`, `'NaN'`, non-objects) are dropped, not mapped to 0. An answer that is not an array, or a non-empty array whose first element is not an array, is a malformed answer: attempt `'error'`, reason `'request'`; an empty array `[]` (no series for the entity) is a successful answer with zero points. At most `HISTORY_MAX_POINTS = 5000` points are kept per record (the most recent). When the request succeeds with zero points, the attempt is `'empty'` and the section renders `msg('No power data to display')` (the existing `.msg-container` text) with the chart container hidden; with ≥1 point it is `'loaded'` and the chart is drawn.
- **FR-9**: Each attempt carries a monotonically increasing `token`; on settle, the answer writes the attempt record only if `_historyAttempts.get(key)?.token === token`, and draws the chart, sets the section state or shows anything only if, in addition, `key` is the selected plug's current key.
- **FR-10**: While one plug's attempt is `'loading'`, selecting another plug starts that plug's own request (if never attempted) and never a second concurrent request for the same key; at most one request per key is in flight.
- **FR-11**: `setConfig` invalidates every attempt whose key is no longer the power entity id of any configured device, destroys `_chart`, and resets `_selected_plug_id` per the existing clamp; an attempt whose key is still configured is kept as-is (same key, same record, no new request), so the chart never shows history of an entity that is not the selected plug's power sensor.
- **FR-12**: Re-selecting a plug whose attempt is `'loaded'` or `'empty'` replays its stored datasets without a request, for the card's lifetime — no age bound, no auto-refresh [ACCEPTED-LIMIT: user, 2026-11-05 — no refresh of a loaded chart is a decided scope cut; nothing to test since no refresh behaviour exists, the absence of a call is all TC-PHS-U-10 can pin]; re-selecting a plug whose attempt is `'error'` shows the error state without a request (retry is explicit, FR-7).
- **FR-13**: The field `fetchedAt`, the field `_chart_generation` and the boolean `_chartLoaded` are removed from the card; the cached datasets and labels live in the `'loaded'`/`'empty'` attempt record, and test fixtures seed `HistoryAttempt` objects of the declared type. The existing cases of `tests/cards/plugs/sci-fi-plugs.test.ts` that seed `_chart_generation` or assert a toast on history error are migrated to seed `_historyAttempts` and assert `.history-error`.
- **FR-14**: The three new strings of FR-4, FR-6 are added to `xliff/fr.xlf` — `Loading history…` → `Chargement de l'historique…`, `Power history unavailable` → `Historique de puissance indisponible`, `Retry` → `Réessayer` — and built via `npm run localize-build`; `No power data to display` already exists and is unchanged.
- **FR-15**: `.history-loading` and `.history-error` occupy the same reserved height as `.chart-container` (the chart section has a fixed `min-height` equal to the chart height), so switching loading → error → chart moves no content below the section.
- **FR-16**: After activating `.history-retry`, focus is moved to the chart section container (`.chart-section`, `tabindex="-1"`), which persists across the state change, so focus never falls to `document.body` when the button is removed.
- **FR-17**: `disconnectedCallback` clears every pending budget timer and bumps a card-level generation so every in-flight token is stale: a late answer after disconnect writes neither record nor UI.
- **FR-18**: The power entity id is placed in the `history/period` query via `encodeURIComponent(powerEntityId)`.
- **FR-19**: `docs/specs/cards/plugs.md` is amended in the same lot as listed in § Amendments owed to plugs.md.

## Declared types

```ts
type HistoryStatus = 'loading' | 'loaded' | 'empty' | 'error';
interface HistoryAttempt {
  status: HistoryStatus;
  token: number;
  datasets: unknown[];
  labels: string[];
  reason?: 'timeout' | 'request';
}
const HISTORY_BUDGET_MS = 2000;
const HISTORY_MAX_POINTS = 5000;
// private method of SciFiPlugsCard (B-14), not a module function:
//   _withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
```

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Today the only load triggers are `has('_selected_plug_id')` and `!_chartLoaded && has('hass')` | Low | SHOW — `grep -n "isInitialLoad\|plugChanged" src/cards/plugs/sci-fi-plugs.ts` → lines 137-138 | TC-PHS-U-01 |
| 2 | `_chartLoaded = true` is set before the call, so a failure removes the retry trigger | Low | SHOW — `sed -n 140,146p src/cards/plugs/sci-fi-plugs.ts` → `this._chartLoaded = true; void this._loadPowerChart(...)` | TC-PHS-U-05 |
| 3 | `idx` guards only the cache write in `_loadPowerChart`; toast and draw are unguarded | Low | SHOW — `sed -n 496,535p` → `this._chart_generation[idx] = …` then unconditional `_drawChart` / `_toast` | TC-PHS-U-07 |
| 4 | `fetchedAt` is written and never read | Low | SHOW — `grep -rn fetchedAt src/` → one writer line 525, the type line 79, no reader | TC-PHS-U-10 |
| 5 | A power entity id identifies a plug uniquely within one card's config | Medium | TELL — plugs.md config model; two devices sharing one power sensor share one attempt (accepted by user 2026-11-05: same data) | TC-PHS-U-09 |
| 6 | 2 s budget, late answer discarded, error shown with Retry | Low | DECIDED — user, 2026-11-05 (closes Q1); not measured on the user's instance, accepted | TC-PHS-U-03, IT-PHS-I-03 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Round 2: set the latch only on success and keep `has('hass')` as the trigger — every power reading after a failure fires a `history/period` (5 calls for 1 mount + 4 pushes, 3 concurrent) | Trigger on "key absent from `_historyAttempts`" (FR-2/FR-3); an error is a present key |
| 2 | Round 4a: trigger only from `firstUpdated` and `_selected_plug_id` change, never re-evaluated — 0 calls when the card becomes loadable after first render (workbench order, editor `devices: []` stub) | Evaluate the FR-2 condition in every `updated()` |
| 3 | Round 4b: a re-entrancy guard reading a card-wide `_historyLoading` flag cleared in `willUpdate` — the clear reopens the guard mid-flight; a late answer of plug 1 paints plug 2 or locks it in error | Per-key status plus token ownership (FR-9/FR-10); never one flag shared by all plugs |
| 4 | Keying cache or latch by device index — a config edit reuses index 0 for another plug and shows the removed plug's data | Key by power entity id; invalidate on `setConfig` (FR-11) |
| 5 | Rendering the empty-state text on a failed read | Distinct `.history-error` state (FR-6) |

## Test Case Specifications

All cases live in one new file: `tests/cards/plugs/plugs-history-states.test.ts`; each `it(...)` title starts with its ID. `callApi` is a `vi.fn()` on the mounted card's `hass`; fake timers for budgets.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-PHS-U-01 | Mount with 1 plug, `callApi` rejects; then push 4 `hass` updates changing the power sensor state | FR-3, FR-6 | `callApi` called exactly 1 time; `.history-error` visible; no toast message added (round 2 regression) |
| TC-PHS-U-02 | `callApi` pending; inspect section | FR-4 | `.history-loading` text `Loading history…`; `.chart-container` display none; `.msg-container` empty |
| TC-PHS-U-03 | `callApi` never resolves; advance 1999 ms then 1 ms | FR-5, FR-6 | at 1999 ms status `'loading'`; at 2000 ms status `'error'`, reason `'timeout'`, `.history-error` shown, empty text absent |
| TC-PHS-U-04 | `callApi` resolves at 1999 ms with 3 points | FR-5, FR-8 | status `'loaded'`, chart drawn, no error |
| TC-PHS-U-05 | Single device, `callApi` rejects then resolves; click `.history-retry` | FR-7 | 2 calls total; status `'loaded'`; chart drawn (round 1 defect) |
| TC-PHS-U-06 | `callApi` resolves `[[]]`, and separately `[]` | FR-8 | status `'empty'`; `.msg-container` = `No power data to display`; chart hidden |
| TC-PHS-U-07 | 2 plugs; plug 0 pending; select plug 1 (resolves); then plug 0 resolves late with data | FR-9, FR-10 | 2 calls (one per key, none concurrent per key); chart datasets = plug 1's; plug 0 record `'loaded'`; header and chart agree (round 4b) |
| TC-PHS-U-08 | 2 plugs; plug 0 pending; select plug 1 (resolves); plug 0 rejects late | FR-9 | plug 1 still `'loaded'`, no `.history-error`, no toast |
| TC-PHS-U-09 | 2 plugs, plug 0 loaded with `sensor.tv_power`; `setConfig` with only the second plug (`sensor.lamp_power`) | FR-11, FR-2 | `sensor.tv_power` key removed; 1 new call for `sensor.lamp_power`; chart never shows tv data under "Lamp Plug" (round 5 HIGH) |
| TC-PHS-U-10 | Loaded plug 0, select 1, select back 0; source scan | FR-12, FR-13 | no extra call for plug 0; `fetchedAt`, `_chart_generation`, `_chartLoaded` absent from `src/cards/plugs/sci-fi-plugs.ts` |
| TC-PHS-U-11 | Plug in `'error'`, navigate away and back | FR-12 | no new call; `.history-error` shown |
| TC-PHS-U-12 | `_withTimeout(Promise.resolve(1), 2000)` and `_withTimeout(never, 2000)` | FR-5 | resolves 1; rejects with reason timeout after 2000 ms |
| TC-PHS-U-13 | `xliff/fr.xlf` contains the three new targets | FR-14 | `Chargement de l'historique…`, `Historique de puissance indisponible`, `Réessayer` each present as the target of its English source |
| TC-PHS-U-14 | Loading then error states; click retry | FR-4, FR-6, FR-16 | `.history-loading` has `role="status"`; `.history-error` has `role="alert"`; after click `document.activeElement` is `.chart-section` |
| TC-PHS-U-15 | Plug in `'error'`; dispatch two clicks on `.history-retry` in the same tick | FR-7 | exactly 1 new call (2 total); record `'loading'` right after the first click, before any microtask |
| TC-PHS-U-16 | `callApi` resolves `{}`, then (retry) `[[42]]`, then (retry) `[[{state:'unavailable'},{state:'NaN'}]]`, then 6000 valid points | FR-8 | `{}` → `'error'` reason `'request'`; `[[42]]` → `'empty'`; all-invalid → `'empty'` with empty text; 6000 → `'loaded'` with 5000 points |
| TC-PHS-U-17 | Same failure reached once by timeout and once by rejection | FR-6 | `.history-error` text identical in both; equals `Power history unavailable` |
| TC-PHS-U-18 | Section height in loading, error, loaded states | FR-15 | `.chart-section` computed `min-height` identical and non-zero in all three |
| TC-PHS-U-19 | `callApi` pending; remove card from DOM; advance 2000 ms; resolve | FR-17 | `vi.getTimerCount()` 0 after disconnect; record not written; no `_drawChart` call |
| TC-PHS-U-20 | Power entity id `sensor.a&x=1` | FR-18 | `callApi` path contains `filter_entity_id=sensor.a%26x%3D1` |
| TC-PHS-U-21 | 2 plugs A, B; A pending; select B; select A; select B | FR-10 | exactly 2 calls (one per key); no second call for A |
| TC-PHS-U-22 | Selected plug without power sensor | FR-2 | 0 calls; no record; no `.history-loading` |
| TC-PHS-U-23 | 2 plugs loaded; `setConfig` keeps both entity ids | FR-11 | records kept; 0 new calls |
| TC-PHS-U-24 | Migrated cases of `sci-fi-plugs.test.ts` | FR-13 | `grep -c "_chart_generation" tests/cards/plugs/sci-fi-plugs.test.ts` = 0; suite green |
| TC-PHS-U-25 | `docs/specs/cards/plugs.md` after amendment | FR-19 | contains a link to `plugs-history-states/spec.md`; no `historyLoading`, `_chartLoaded`, `fetchedAt` |
| TC-PHS-U-26 | `_withTimeout` arity; a pending budget timer, then disconnect | FR-5, FR-17, B-14 | `_withTimeout.length` = 2; the timer is held in a `Set`; disconnect empties it |
| TC-PHS-U-27 | 2 plugs, TV pending (never answers); `setConfig` with only LAMP; advance 2000 ms | FR-11, FR-5 | TV's timer is not cleared by `setConfig`; at 2000 ms it fires and the set holds no TV timer; no TV record re-created |
| TC-PHS-U-28 | History request through `hass.callApi` | FR-18 | called with exactly `('GET', path)`; the source carries no `as any).callApi` |
| IT-PHS-I-01 | Workbench order: `setConfig` → `appendChild` → set `hass` | FR-2, FR-1 | exactly 1 call; record created under the power entity id (round 4a) |
| IT-PHS-I-02 | Editor order: `getStubConfig()` (`devices: []`) → `setConfig` with 1 plug on the same element, `hass` already set | FR-2 | exactly 1 call after the second `setConfig` (round 4a) |
| IT-PHS-I-03 | Full flow single device: mount, timeout at 2000 ms, retry, resolve with data | FR-4, FR-5, FR-6, FR-7, FR-8 | loading → error → loading → chart; 2 calls total |
| IT-PHS-I-04 | Mount order: `hass` set first, then `setConfig`, then `appendChild` | FR-2 | exactly 1 call |

## Screens

| Screen | Route | Design reference | Landmarks it must render |
|---|---|---|---|
| Plugs chart section | Lovelace card | docs/specs/cards/plugs.md | `.chart-section` holding `.history-loading` / `.history-error` + `.history-retry` / `.msg-container` / `.chart-container` |

## Selectors for E2E tests

| Selector | State |
|---|---|
| `.chart-section` | FR-15, FR-16 |
| `.history-loading` | FR-4 |
| `.history-error` | FR-6 |
| `sf-button.history-retry` | FR-7 |
| `.msg-container` | FR-8 empty |
| `.chart-container` | FR-8 loaded |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| `callApi` rejects (5xx, 401, network) | attempt `'error'`, reason `'request'`, `.history-error` | `.history-retry` (FR-7) | none (no toast) |
| No answer within 2000 ms | attempt `'error'`, reason `'timeout'`, same text as a rejection | retry; late answer discarded by token (FR-9) | none |
| Late answer of a superseded attempt or non-selected plug | record written only if token current; no UI write unless selected | — | none |
| Late answer after `disconnectedCallback` | discarded (FR-17) | — | none |
| Answer `[[]]`, `[]`, or only non-finite states | `'empty'` | empty text | none |
| Malformed answer (non-array, or first element non-array) | treated as `'error'`, reason `'request'` | retry | none |
| More than 5000 points | most recent 5000 kept (FR-8) | — | none |
| Plug without power sensor | no request, no record | chart section unchanged from today | none |
| Config edit removes the plug of an attempt | key dropped, chart destroyed (FR-11) | new key loads | none |

## Builder Calls

| Call | Decision |
|---|---|
| Where the timeout lives | `_withTimeout` private method on `SciFiPlugs`, `setTimeout` + `Promise.race`, timer cleared on settle |
| Rendering of states | from template via a `@state() _historyAttempts` (reassign a new Map on each change), not by `textContent` writes |
| Chart canvas lifetime | destroy `_chart` when the selected key changes or on `setConfig`; draw on `'loaded'` in `updated()` |
| Existing tests | FR-13 / TC-PHS-U-24 |
| Accessibility roles and focus (agent's call) | loading `role="status"`, error `role="alert"`, focus to `.chart-section` after Retry (FR-4, FR-6, FR-16) |
| Reserved height (agent's call) | `.chart-section` `min-height` = chart height in every state (FR-15) |

## Builder check answers

| # | Question | Answer |
|---|---|---|
| B-1 | Shape of `datasets`/`labels`, `_drawChart` signature | `_drawChart` keeps its current signature; `datasets`/`labels` hold exactly what it takes today (agent's call: smallest diff, no chart rewrite) |
| B-2 | Replay of a record loaded while not selected | On every selection of a `'loaded'` key, `updated()` draws from the stored record on a fresh canvas (FR-12; agent's call) |
| B-3 | Selected plug without power sensor | `_chart` destroyed, `.chart-container` hidden, no history element rendered (agent's call: no stale chart, FR-11 intent) |
| B-4 | Containers per state | `.chart-container` is always in the DOM (FR-2 gate) and `display: none` unless `'loaded'`; `.history-loading`, `.history-error`, `.msg-container` text are mutually exclusive by status (agent's call) |
| B-5 | `setConfig` with kept keys | kept `'loaded'` record of the selected key is redrawn in the next `updated()`; kept `'loading'` record keeps its timer and token; a dropped key's timer is cleared (agent's call) |
| B-6 | Token vs card generation; reconnect | an answer is current only if token matches AND card generation unchanged; `connectedCallback` deletes every `'loading'` record so FR-2 restarts it (agent's call: otherwise stuck spinner) |
| B-7 | "Most recent 5000" | last 5000 elements after FR-8 filtering, in the API's chronological order; labels built as today; no downsampling (agent's call) |
| B-8 | Point without valid timestamp | dropped (agent's call) |
| B-9 | Retry binding | `@click` on `sf-button.history-retry` (agent's call) |
| B-10 | Shared sensor | same chart under either header — accepted by user 2026-11-05 (Assumption 5) |
| B-11 | Focus on pointer click | always moved to `.chart-section` (FR-16; agent's call) |
| B-12 | Other locales | only `xliff/fr.xlf` exists for translation; `localize-build` output is regenerated and committed as the repo does today (agent's call) |
| B-13 | `_toast` | kept for other uses; only the history failure no longer calls it (FR-6) |
| B-14 | Budget start; `_withTimeout` placement | budget starts when the request is issued, each retry restarts it; `_withTimeout` is a private method on `SciFiPlugs`, tests call `card._withTimeout(...)` (Builder Calls row wins over the Declared types line; agent's call) |
| B-15 | Rest of the history URL | unchanged from today apart from FR-18 |

## Amendments owed to plugs.md

- `docs/specs/cards/plugs.md` § Adversarial Fixes item 2: replace "a `historyLoading` property" with a link to this spec (per-plug `_historyAttempts`, FR-1..FR-12).
- `docs/specs/cards/plugs.md` translation table: add the three strings of FR-14.
- `docs/specs/cards/plugs.md`: remove any mention of `_chartLoaded`/`fetchedAt`/toast on history error.

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-5` | code — `HISTORY_BUDGET_MS` | `SciFiPlugs._loadPowerChart` calls `_withTimeout` |

## References

[sci-fi-plugs.ts](../../../src/cards/plugs/sci-fi-plugs.ts), [plugs.md](../cards/plugs.md), [round reports](../../reviews/p1-runtime-defects/code-review.md), bead ha-sci-fi-8ap.
