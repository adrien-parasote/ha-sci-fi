# Spec 16 — Tactical Water Management History Log

> Document Type: Implementation
> Covers: Feature-Water-History-01 (Unified activity and execution log shown in every accordion of the water card: the Automations accordion and each device accordion, each filtered to its own entities, as [water.md](./water.md) F-WATER-05 requires)
> Depends on: [Spec 05](./05_cards.md#sci-fi-water-management), [Spec 03](./03_base_classes.md#L1)
>
> **Arbitrage 2026-11-02 (bead `ha-sci-fi-enr`, décision utilisateur) : [water.md](./water.md) fait foi, le code la suit, et cette spec est alignée sur eux.** Fenêtre 7 jours, endpoint primaire `history/history_during_period` avec repli `logbook/get_events`, récupération au chargement du plancher : voir § 1. Les écarts du code que cette spec ne cache plus sont listés § Known Gaps, un bead chacun ; D12 est le seul où c'est la spec qui a reculé (exigence retirée), dit comme tel.

---

## Blueprint Coverage

| Feature ID | Description | Spec file | Covers |
|---|---|---|---|
| F-WATER-HIST-01 | Monospace activity timeline console shown in every accordion (Automations and each device), filtered to that accordion's entities | ✅ This spec § Technical Specifications & Data Contracts | tests/cards/water_history/sci-fi-water-management-history.test.ts :: TC-WATER-HISTORY-U-003, TC-WATER-HISTORY-U-004, TC-WATER-HISTORY-U-005, TC-WATER-HISTORY-U-008 |
| F-WATER-HIST-02 | Interactive filter buttons (All, Alerts) for log categories | ✅ This spec § Technical Specifications & Data Contracts | tests/cards/water_history/sci-fi-water-management-history.test.ts :: TC-WATER-HISTORY-U-006 (le filtre côté modèle seulement, sur `_historyLogs` que rien ne rend, voir D15 : aucun cas ne joue les boutons ni le rendu filtré) |
| F-WATER-HIST-03 | WebSocket fetch over a 7-day window: `history/history_during_period` first, `logbook/get_events` as fallback, for the floor's relevant entities (the strategy itself is F-WATER-06 of [water.md](./water.md)) | ✅ This spec § 1. API Integration & Query Scope | tests/cards/water_history/sci-fi-water-management-history.test.ts :: IT-WATER-HISTORY-I-004, IT-WATER-HISTORY-I-005, IT-WATER-HISTORY-I-009 |
| F-WATER-HIST-04 | Responsive fallback mock logs for local development in workbench | ✅ This spec § Local Development | ⬜ aucun cas ne couvre le repli en logs mockés du workbench |

---

## Assumptions

| ID | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The recorder WebSocket API `history/history_during_period` is the primary source; **logbook/get_events** is the fallback when it rejects | Low | SHOW | Verified HA Core API specs; `_fetchHistoryLogs` in `src/cards/water/sci-fi-water-management.ts` |
| 2 | Water entities on the current floor can be retrieved using the same logic as the main card | Low | SHOW | `_getWaterEntitiesForFloor` in `src/cards/water/sci-fi-water-management.ts` (`:414`) |
| 3 | `sf-editor-accordion` supports custom DOM elements injected into its slot | Low | SHOW | Checked `sf-editor-accordion.ts` implementation |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Run Vitest tests before completing, validate HA API responses, ensure all styles use HSL custom properties. |
| **Ask first** | Adding external third-party logging dependencies, changing default label-filtering behaviors. |
| **Never do** | Query the HA history or logbook APIs globally (without entity_id filters), block the UI thread during API fetch, bypass localization. |

---

## Cross-Spec Contracts

### Produces
N/A — This spec defines a visual component that consumes HA API data and exposes no external artifacts.

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `./water.md` | Markdown | [water.md](./water.md#L1) | Base Water Card Spec |

### Public Interface
This component MUST expose the following reactive Lit properties:
- `@property({ type: Object }) hass`: The Home Assistant instance.
- `@property({ type: Array }) entityIds`: The list of valid water entity IDs for the active floor.
- It exposes no card-level open-state property: each accordion keeps its own open state in `_expandedMap` ([water.md](./water.md) AP "Global expanded state"). The code still declares such a property, see Known Gaps, D21.

### External Invocations

| Type | Invoked | Defined in |
|---|---|---|
| WS API | `history/history_during_period` (primary), **logbook/get_events** (fallback) | Home Assistant Recorder / Logbook API WebSocket |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| Water Management Card | Enhanced with history panel | [water.md](./water.md#L1) |

---

## Technical Specifications & Data Contracts

### 1. API Integration & Query Scope
- **WebSocket Endpoint**: `history/history_during_period` first; when it rejects, **logbook/get_events** with the same window and entity list (`console.warn`). Only entities of the domains `switch`, `valve`, `automation`, `binary_sensor`, `input_boolean`, `sensor` are queried (water.md F-WATER-06 lists five, without `input_boolean`: Known Gaps, D24); `significant_changes_only: true` on the recorder call.
- **Query Filters**:
  - `start_time`: now minus **7 days** (ISO 8601), `end_time` omitted (up to now) — `sci-fi-water-management.ts:164`, [water.md](./water.md) § Features 6.
  - `entity_ids`: Strict list of water-labeled entities present on the currently selected floor.
  - **Client-Side Filtering**:
  - All logs for the 7-day window are fetched in a **single query per floor load**: when `_activeFloorId` or `entityIds` changes, and on the sync button (`_syncLogs`). Opening or closing an accordion never fetches ([water.md](./water.md) AP "Fetch on accordion open"). The code departs from this in two ways, see Known Gaps, D21.
  - **Concurrency Control**: The component MUST track the active fetch operation (e.g., using a monotonically increasing `_fetchId`). When a WebSocket response resolves, it MUST check if its original `_fetchId` matches the current `_fetchId`, discarding the response if it has been superseded by a newer request. Only a fetch that gets past the early returns increments `_fetchId`; those returns (no `entityIds`, sandbox) do not supersede a request already in flight, see Known Gaps, D23.
  - The "All / Alerts" filters are evaluated **strictly on the client side** using local arrays for instantaneous tab switching without network overhead.
  - **Alert Definition**: A log event is considered an Alert if its new state is `unavailable`, `unknown`, or `problem`, OR if the entity is a `binary_sensor` or `sensor` with `device_class: moisture` (leak sensor) transitioning to `on`. The `sensor` clause mirrors the code and can only fire for a non-numeric moisture `sensor` (the sandbox fixture): a real moisture `sensor` reports a number, never `on`, so in practice the leak alert comes from `binary_sensor`. The `device_class` MUST be retrieved safely via `this.hass?.states[event.entity_id]?.attributes?.device_class`. In Local Development mode, mock events MUST include a fake `device_class` on the event object, and the filter MUST check `event.device_class` as a fallback.
  - **Empty State Guard**: If the resolved list of `entity_ids` for the active floor is empty, DO NOT call any history API (neither `history/history_during_period` nor `logbook/get_events`). Immediately set both `_rawLogs` and `_historyLogs` to empty arrays and render the empty state.
- **Log Retention Limit**:
  - Store the FULL 7-day API response in a private property (e.g. `_rawLogs`). The limit of **50 log entries** (newest first) MUST be applied to the rendered array *after* the All/Alert filter is evaluated, ensuring alerts from the full 7-day window are visible even if buried under 50+ normal events. **Memory and CPU are not bounded by the 50**: the whole response stays in `_rawLogs`, and `_renderHistoryLogs` filters and sorts it again for every accordion at every render. This cost is accepted for the sensor-domain volumes of a single floor.
- **Sorting Contract**:
  - Log entries MUST be sorted in **reverse-chronological order** (newest events at the top); `_renderHistoryLogs` sorts `_rawLogs` itself at render time.

---

## Error Handling Matrix

| Failure | Mitigation | Trigger | Log |
|---|---|---|---|
| **HA API timeout / offline** | Per [water.md](./water.md) § Error Handling "History API unavailable": recorder failure falls back to logbook; if both fail the log stays empty and renders the same empty state as "no history". There is no `[ OFFLINE ]` header, no cached data, no timeout on `callWS`, and the water.md "API Failure: connection error, retry in 5s" behaviour is not implemented for the history fetch (see Known Gaps, D12). | `callWS` rejects | `console.warn` |
| **No history found** | Show beautiful empty state: `"Aucun événement enregistré."` | Response list is empty | none (nothing is logged) |
| **API returns malformed events** | Intent: ignore a malformed row and `console.warn`. Code today: the recorder path silently skips a row without `state` or `when` (no warn); the logbook path validates nothing, and a row without `state` reaches `log.state.toUpperCase()` which throws at render (Known Gaps, D22). | Row without `state` or `when` | none today (intent: `console.warn`) |
| **Active floor changes** | Automatically trigger a new log fetch and clear the old list (`_rawLogs` is emptied at the start of every fetch). | `_activeFloorId` or `entityIds` changes | none |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Polling the history API inside render() | Running HA API calls on every render loop, blocking UI performance | Fetch once per floor load and on the sync button, as [water.md](./water.md) AP "Fetch on accordion open" requires: never on accordion open, never from render(). |
| 2 | Direct innerHTML injection of log details | Using raw HTML or `unsafeHTML` to render event attributes | Always escape and render using standard Lit-html template expressions to avoid XSS |
| 3 | Fetching global system logbook | Querying the HA history or logbook API without filtering by entity_ids | Limit the WebSocket history and logbook queries strictly to the current floor's water entities |
| 4 | Hardcoded French UI labels | Directly writing text like 'Tout' or 'Logs' in the Lit template | Wrap all user-visible text with `@lit/localize` `msg()` |
| 5 | Inline CSS styling | Using style attributes or ad-hoc classes inside the main component | Place all custom CSS rules inside the `waterStyles` constant in `styles.ts` (the code still carries 4 inline `style=`: Known Gaps, D20) |

---

## Test Case Specifications

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Cinq des dix-sept lignes (`TC-WATER-HISTORY-U-001`, `002` et `IT-WATER-HISTORY-I-001` à `003`) : aucun test ne les porte. Les douze autres sont jouées par `tests/cards/water_history/sci-fi-water-management-history.test.ts` (lot `water-orphan-ids`, bead `ha-sci-fi-78y.7` : ses ids nus `TC-1201`..`TC-1205` et `IT-1201`..`IT-1205` y sont devenus des ids de cette spec, et ses cas d'historique ont quitté la suite de la carte, `tests/cards/water/sci-fi-water-management.test.ts`, parce que `tests/specs/ids-cas-uniques.test.ts` exige qu'un id de cette spec soit cité depuis `tests/cards/water_history/`).
> Le marqueur est la seule source : `tests/specs/ids-cas-uniques.test.ts` dérive
> l'ensemble des cas non joués de ces marques et refuse l'écart dans les deux
> sens — un cas non marqué que rien ne cite, comme un cas marqué qu'un test porte.

### Unit Tests

| ID | Type | Scenario | Setup / Given | Expected Result |
|---|---|---|---|---|
| TC-WATER-HISTORY-U-001 ⬜ | Unit | Toggling the "Alerts" filter | Click 'Alerts' button with 3 success and 2 warning logs | Only the 2 warning logs are rendered; others hidden |
| TC-WATER-HISTORY-U-002 ⬜ | Unit | Floor change triggers one fetch | `_activeFloorId` (or `entityIds`) changes | `_fetchHistoryLogs` is called exactly once; the sync button then triggers exactly one more |
| TC-WATER-HISTORY-U-003 | Unit | Empty history rendering | `_rawLogs` holds no entry matching the `filterEntityIds` passed to `_renderHistoryLogs` | Renders text `"Aucun événement enregistré."`. The test MUST pass `filterEntityIds` explicitly: called with no argument the filter set is empty, so the empty state renders whatever `_rawLogs` holds and the case proves nothing. `_renderHistoryLogs` reads `_rawLogs`, never `_historyLogs` (which only `_applyFiltersAndLimit` feeds) |
| TC-WATER-HISTORY-U-004 | Unit | Loading state rendering | `_historyLogsLoading` is set to `true`, with `filterEntityIds` passed and `_rawLogs` non-empty for that filter | Renders the `.log-scanner` loading placeholder and NOT the `.log-timeline` the same `_rawLogs` would otherwise produce — the loading test comes after the filter is computed but decides the render, so a passing assertion must show it wins over present data. The test reads the two elements; it does not read the pulsing animation |
| TC-WATER-HISTORY-U-005 | Unit | Timestamp formatting | `_formatTimestamp` is given an ISO string built from a LOCAL-time `Date` (1 June 2026 08:26:35; then 25 December 2026 23:05:00), so the expected text is the same whatever `TZ` the run uses; then the unparseable string `not-a-date` | Returns `01/06 08:26`, then `25/12 23:05`; `not-a-date` returns the fallback `00/00 00:00` and never throws. The brackets of `[DD/MM HH:MM]` are added by the template that wraps this return value, and this test does not read them. The date is part of the format because the card fetches a **7-day** window (`sci-fi-water-management.ts:164`); were that window cut to a single day this MUST return to `HH:MM` (see bead `ha-sci-fi-o5p`). The test MUST assert literals, never re-derive the implementation's own `getDate`/`getMonth`/`padStart` chain — a re-derivation stays green for any format the code picks |
| TC-WATER-HISTORY-U-006 | Unit | Client-side All / Alerts filter on `_rawLogs` | `_rawLogs` holds a `switch` log `on`, a moisture `sensor` log `on` and a `switch` log `unavailable`; `_applyFiltersAndLimit` is run with `_activeFilter` `all`, then `alerts` | `_historyLogs` holds 3 entries under `all`; under `alerts` it holds 2, the first being the `unavailable` one (newest first). It reads `_historyLogs`, which no render path reads (Known Gaps, D15): the rendered side of the filter is TC-WATER-HISTORY-U-001, still unplayed |
| TC-WATER-HISTORY-U-007 | Unit | Legacy `expanded` trigger (Known Gaps, D21) | `_fetchHistoryLogs` is replaced by a counter on a mounted card with `entityIds` set; `expanded` is `false` after the first update, then set to `true` and the update runs | The counter stays 0 while `expanded` is `false` and is exactly 1 once it is `true`. This pins what the code does today, not the reference: [water.md](./water.md) forbids an accordion-open fetch and D21 tracks the removal (`ha-sci-fi-xrc`); the row goes when the trigger does. No `Covers` cell cites it |
| TC-WATER-HISTORY-U-008 | Unit | Timeline rendered when entries match | `_rawLogs` holds one automation log, `_historyLogsLoading` is `false`, `filterEntityIds` passed to `_renderHistoryLogs` names that automation | The render holds a `.log-timeline` element and does not contain `"Aucun événement enregistré."` — the counterpart that gives TC-WATER-HISTORY-U-003 its meaning |

### Integration Tests

| ID | Type | Scenario | Setup / Given | Expected Result |
|---|---|---|---|---|
| IT-WATER-HISTORY-I-001 ⬜ | Integration | WebSocket API Call | Call `_fetchHistoryLogs` with entity list; then again with the recorder call rejecting | `hass.callWS` is first invoked with type `history/history_during_period` and the 7-day `start_time`; on rejection it is invoked with type **logbook/get_events** and the same entity IDs |
| IT-WATER-HISTORY-I-002 ⬜ | Integration | Floor Switch Refresh | `entityIds` array is updated by parent | Logs are cleared and a new history fetch (recorder first, logbook on rejection) is queued for the new floor |
| IT-WATER-HISTORY-I-003 ⬜ | Integration | Filter switching | Filter `alerts` active, then `all` | Only alert logs are rendered under `alerts`, all logs under `all`; there is no third (Warning) filter |
| IT-WATER-HISTORY-I-004 | Integration | Recorder rejects, logbook fallback | `hass.callWS` rejects `history/history_during_period` and resolves any other call with `[]`; `_fetchHistoryLogs` runs with `entityIds` `['switch.valve_1']` | The captured fallback payload has type `logbook/get_events` and `entity_ids` `['switch.valve_1']`. The `start_time` is not asserted (IT-WATER-HISTORY-I-001 stays unplayed for it) |
| IT-WATER-HISTORY-I-005 | Integration | Recorder first | `hass.callWS` resolves `{}` to every call; `_fetchHistoryLogs` runs with `entityIds` `['switch.valve_1']` | The payload captured is of type `history/history_during_period` with `entity_ids` `['switch.valve_1']` (the last call captured, the primary one resolving). The `start_time` is not asserted |
| IT-WATER-HISTORY-I-006 | Integration | `entityIds` change refetches (D21) | Mounted card with `expanded` `true`; `_fetchHistoryLogs` replaced by a counter reset after mount; `entityIds` replaced and the update run | The counter is exactly 1. With `expanded` `true` only: the legacy trigger of Known Gaps D21, not the reference. No `Covers` cell cites it |
| IT-WATER-HISTORY-I-007 | Integration | `_activeFloorId` change refetches (D21) | Same set-up with `expanded` `true`; `_activeFloorId` changes from `floor_1` to `floor_2` and the update runs | The counter is exactly 1. With `expanded` `true` only: Known Gaps D21. No `Covers` cell cites it |
| IT-WATER-HISTORY-I-008 | Integration | Logs cleared when a fetch starts | `_rawLogs` and `_historyLogs` each hold one entry; `_fetchHistoryLogs()` is called and not yet awaited | Straight after the synchronous call both `_rawLogs` and `_historyLogs` equal `[]` |
| IT-WATER-HISTORY-I-009 | Integration | `entityIds` follows the floor | `hass` has floor `basement`, area `utility`, and two labelled `water` entities of it: `automation.gestion_chauffe_eau` (no device) and `switch.pump` (device `pump_device`); `_activeFloorId` is `basement` and `willUpdate` runs | `entityIds` equals `['automation.gestion_chauffe_eau', 'switch.pump']`: every water entity of the floor, device-owned ones included, not only the standalone one (the test title says "only standalone"; its assertion says otherwise) |

---

## Known Gaps (where the code departs from water.md or from this spec)

Arbitrage `ha-sci-fi-enr`: [water.md](./water.md) is the reference and the code is meant to follow it. Where the code departs, the spec states the reference behaviour and the gap is a bead, not a rewritten requirement. D12 is the one exception: there the spec withdrew a requirement, and says so.

| Gap | Code today | Bead |
|---|---|---|
| D01 sync button never spins | `styles.ts:60` targets `.floor-sync-btn.syncing ha-icon`, the template renders `<sf-icon>` whose content sits in its own shadow root | `ha-sci-fi-9vv` |
| D07 floor absent from the selector can still render | the floor list is prefiltered to floors with at least one water entity (`:452`), so the selector never offers an empty floor; but `first_floor_to_render` naming an existing floor with no water entity passes the floor check and renders "No water equipment configured for this floor" (`:494`) for a floor the selector does not list | `ha-sci-fi-rd4` |
| D12 offline cache and `[ OFFLINE ]` withdrawn | This spec withdraws its former requirement (cached data shown dim orange under an `[ OFFLINE ]` header); water.md never had it. The requirement no longer exists in either spec, yet bead `ha-sci-fi-1k7` stays open: it now tracks a product decision (re-introduce an offline display, or close), not a defect against a spec. Code today: `_fetchHistoryLogs` empties `_rawLogs` before the call (`:146`), both-fail renders the same empty state as "no history", no timeout, no retry | `ha-sci-fi-1k7` |
| D15 `_historyLogs` never read | written by `_applyFiltersAndLimit` (`:283`), no render path reads it; `_renderHistoryLogs` filters, sorts and truncates `_rawLogs` itself | `ha-sci-fi-ijw` |
| D20 inline CSS | 4 `style="…"` in the template (`:515`, `:570`, `:610`, `:625`) against AP#5 | `ha-sci-fi-ln3` |
| D21 `expanded` trigger | the code declares an `expanded` property (`:41`, `:55`) and `updated()` fetches when it turns `true` and skips the floor-load fetch when it is `false` (`:118-122`); water.md forbids both ("Fetch on accordion open", "Global expanded state") and nothing in `src/` sets it | `ha-sci-fi-xrc` |
| D22 malformed rows not ignored | see the Error Handling Matrix: no validation on the logbook path (`:251`), `log.state.toUpperCase()` (`:374`) throws on a row without `state`, no `console.warn` on skipped rows | `ha-sci-fi-5aw` |
| D23 early returns keep a stale fetch alive | `_fetchId` is incremented after the early returns (`:159`), so a response in flight for the previous floor is not discarded when the new floor has no entities | `ha-sci-fi-p5a` |
| D24 domain list | the code and this spec query six domains, `input_boolean` included (`:141`); water.md F-WATER-06 lists five | `ha-sci-fi-7kb` |

Resolved by alignment, not by a bead: D16 (the "Warning" filter of IT-003 never existed, removed above), window and endpoint (`ha-sci-fi-o5p`), D14 (TC-WATER-HISTORY-U-005, played since lot `water-orphan-ids`, bead `ha-sci-fi-78y.7`, pins what `_formatTimestamp` returns, `DD/MM HH:MM` (`:312`, the `return` at `:323`) with the `00/00 00:00` fallback; the brackets come from the template that wraps it (`:370`) and no test pins the brackets: a render test of `.log-time` would close that).

## Local Development

If `this.hass` is undefined (workbench mode), do not call the WebSocket API. Instead, populate `_rawLogs` with a static array of mock logbook events (must include `name`, `entity_id`, `state`, and `when` properties) after a simulated 500ms network delay to trigger the loading state, then apply the active filter to populate `_historyLogs`.

---

## Deep Links

| Reference | Location |
|---|---|
| Base Water Card Spec | [water.md](./water.md#L1) |
| Lovelace Card Spec | [05_cards.md#sci-fi-water-management](./05_cards.md#sci-fi-water-management) |
| Common Styles Spec | [03_base_classes.md#L1](./03_base_classes.md#L1) |
