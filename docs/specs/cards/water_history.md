# Spec 12 — Tactical Water Management History Log

> Document Type: Implementation
> Covers: Feature-Water-History-01 (Unified activity and execution log inside the Automations accordion)
> Depends on: [Spec 05](./05_cards.md#sci-fi-water-management), [Spec 03](./03_base_classes.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Spec file | Covers |
|---|---|---|---|
| F-WATER-HIST-01 | Monospace activity timeline console inside the automations accordion | ✅ This spec § Technical Specifications & Data Contracts | TC-002, TC-003, TC-005 |
| F-WATER-HIST-02 | Interactive filter buttons (All, Alerts) for log categories | ✅ This spec § Technical Specifications & Data Contracts | TC-001, IT-003 |
| F-WATER-HIST-03 | WebSocket API fetch using the **logbook/get_events** endpoint for relevant entities | ✅ This spec § 1. API Integration & Query Scope | IT-001, IT-002 |
| F-WATER-HIST-04 | Responsive fallback mock logs for local development in workbench | ✅ This spec § Local Development | TC-004 |

---

## Assumptions

| ID | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The Home Assistant logbook WebSocket API is accessible via **logbook/get_events** | Low | SHOW | Verified HA Core API specs |
| 2 | Water entities on the current floor can be retrieved using the same logic as the main card | Low | SHOW | sci-fi-water-management L101 |
| 3 | `sf-editor-accordion` supports custom DOM elements injected into its slot | Low | SHOW | Checked `sf-editor-accordion.ts` implementation |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Run Vitest tests before completing, validate HA API responses, ensure all styles use HSL custom properties. |
| **Ask first** | Adding external third-party logging dependencies, changing default label-filtering behaviors. |
| **Never do** | Query the HA logbook API globally (without entity_id filters), block the UI thread during API fetch, bypass localization. |

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
- `@property({ type: Boolean }) expanded`: Indicates if the parent accordion is currently open.

### External Invocations

| Type | Invoked | Defined in |
|---|---|---|
| WS API | **logbook/get_events** | Home Assistant Logbook API WebSocket |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| Water Management Card | Enhanced with history panel | [water.md](./water.md#L1) |

---

## Technical Specifications & Data Contracts

### 1. API Integration & Query Scope
- **WebSocket Endpoint**: **logbook/get_events**
- **Query Filters**:
  - `start_time`: Local time minus 24 hours (ISO 8601 format).
  - `entity_ids`: Strict list of water-labeled entities present on the currently selected floor.
  - **Client-Side Filtering**:
  - All logs for the 24-hour window are fetched in a **single query** ONLY when the accordion is expanded, OR when the floor switches *while* the accordion is currently expanded.
  - **Concurrency Control**: The component MUST track the active fetch operation (e.g., using a monotonically increasing `_fetchId`). When a WebSocket response resolves, it MUST check if its original `_fetchId` matches the current `_fetchId`, discarding the response if it has been superseded by a newer request.
  - The "All / Alerts" filters are evaluated **strictly on the client side** using local arrays for instantaneous tab switching without network overhead.
  - **Alert Definition**: A log event is considered an Alert if its new state is `unavailable`, `unknown`, or `problem`, OR if the entity is a `binary_sensor` with `device_class: moisture` (leak sensor) transitioning to `on`. The `device_class` MUST be retrieved safely via `this.hass?.states[event.entity_id]?.attributes?.device_class`. In Local Development mode, mock events MUST include a fake `device_class` on the event object, and the filter MUST check `event.device_class` as a fallback.
  - **Empty State Guard**: If the resolved list of `entity_ids` for the active floor is empty, DO NOT call the logbook API. Immediately set both `_rawLogs` and `_historyLogs` to empty arrays and render the empty state.
- **Log Retention Limit**:
  - Store the FULL 24-hour API response in a private property (e.g. `_rawLogs`). The limit of **50 log entries** (newest first) MUST be applied to the rendered array *after* the All/Alert filter is evaluated, ensuring alerts from the full 24-hour window are visible even if buried under 50+ normal events.
- **Sorting Contract**:
  - Log entries MUST be sorted in **reverse-chronological order** (newest events at the top) prior to template rendering.

---

## Error Handling Matrix

| Failure | Mitigation | Trigger | Log |
|---|---|---|---|
| **HA API timeout / offline** | Show dim orange warning `[ OFFLINE ]` in console header and display cached log data. | `callWS` rejects with timeout | `console.warn` dynamic query error |
| **No history found** | Show beautiful empty state: `"Aucun événement enregistré."` | Response list is empty | Log debug info |
| **API returns malformed events** | Validate each event item's structure. Ignore malformed rows. | Invalid JSON structure | `console.warn` parse error |
| **Active floor changes** | Automatically trigger a new log fetch and clear the old list. | `entityIds` array changes | Log active floor switch |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Polling logbook API inside render() | Running HA API calls on every render loop, blocking UI performance | Only fetch logs when the accordion becomes expanded, or when the active floor changes while the accordion is expanded. Do NOT fetch on component initialization if the accordion is closed. |
| 2 | Direct innerHTML injection of log details | Using raw HTML or `unsafeHTML` to render event attributes | Always escape and render using standard Lit-html template expressions to avoid XSS |
| 3 | Fetching global system logbook | Querying the HA logbook API without filtering by entity_ids | Limit the WebSocket logbook query strictly to the current floor's water entities |
| 4 | Hardcoded French UI labels | Directly writing text like 'Tout' or 'Logs' in the Lit template | Wrap all user-visible text with `@lit/localize` `msg()` |
| 5 | Inline CSS styling | Using style attributes or ad-hoc classes inside the main component | Place all custom CSS rules inside the `waterStyles` constant in `styles.ts` |

---

## Test Case Specifications

### Unit Tests

| ID | Type | Scenario | Setup / Given | Expected Result |
|---|---|---|---|---|
| TC-001 | Unit | Toggling the "Alerts" filter | Click 'Alerts' button with 3 success and 2 warning logs | Only the 2 warning logs are rendered; others hidden |
| TC-002 | Unit | Accordion expansion triggers fetch | Automations accordion is expanded by user | `_fetchHistoryLogs` is called exactly once |
| TC-003 | Unit | Empty history rendering | `_rawLogs` holds no entry matching the `filterEntityIds` passed to `_renderHistoryLogs` | Renders text `"Aucun événement enregistré."`. The test MUST pass `filterEntityIds` explicitly: called with no argument the filter set is empty, so the empty state renders whatever `_rawLogs` holds and the case proves nothing. `_renderHistoryLogs` reads `_rawLogs`, never `_historyLogs` (which only `_applyFiltersAndLimit` feeds) |
| TC-004 | Unit | Loading state rendering | `_historyLogsLoading` is set to `true`, with `filterEntityIds` passed and `_rawLogs` non-empty for that filter | Renders a pulsing digital scanner animation placeholder, and NOT the timeline the same `_rawLogs` would otherwise produce — the loading branch is evaluated before the filter, so a passing assertion must show it wins over present data |
| TC-005 | Unit | Timestamp formatting | Log time is `2026-06-01T08:26:35Z`, rendered under a fixed `TZ` | Text content displays `[DD/MM HH:MM]` for the run's timezone — e.g. `[01/06 08:26]` under `TZ=UTC`. The date is part of the format because the card fetches a **7-day** window (`sci-fi-water-management.ts:164`); were that window reduced to 24 h this MUST return to `[HH:MM]` (see bead `ha-sci-fi-o5p`). The test MUST assert a literal, never re-derive the implementation's own `getDate`/`getMonth`/`padStart` chain — a re-derivation stays green for any format the code picks |

### Integration Tests

| ID | Type | Scenario | Setup / Given | Expected Result |
|---|---|---|---|---|
| IT-001 | Integration | WebSocket API Call | Call `_fetchHistoryLogs` with entity list | `hass.callWS` is invoked with type **logbook/get_events** and entity IDs |
| IT-002 | Integration | Floor Switch Refresh | `entityIds` array is updated by parent | Logs are cleared and a new logbook fetch is queued for new floor |
| IT-003 | Integration | Filter combination | Alert + Warning filters both active | Only matching logs rendered; count label updates |

---

## Local Development

If `this.hass` is undefined (workbench mode), do not call the WebSocket API. Instead, populate `_rawLogs` with a static array of mock logbook events (must include `name`, `entity_id`, `state`, and `when` properties) after a simulated 500ms network delay to trigger the loading state, then apply the active filter to populate `_historyLogs`.

---

## Deep Links

| Reference | Location |
|---|---|
| Base Water Card Spec | [water.md](./water.md#L1) |
| Lovelace Card Spec | [05_cards.md#sci-fi-water-management](./05_cards.md#sci-fi-water-management) |
| Common Styles Spec | [03_base_classes.md#L1](./03_base_classes.md#L1) |
