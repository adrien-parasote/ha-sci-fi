# Tactical Water Management

> Document type: Implementation

## Context
A dynamic, spaceship-style dashboard component designed to display and manage water-related entities across different floors/areas. It acts as a unified hub for water control, adapting dynamically to the user's Home Assistant setup based on tags/labels rather than static configuration.

## Features
1. **Dynamic Floor Selector**: Hexagonal tabs for floors (e.g., Ground, First Floor, Exterior). Selecting a floor filters the entities shown below. Floor name and a sync button are displayed in a horizontal bar below the selector.
2. **Label-based Discovery**: Automatically finds and lists any HA entity labeled with `water` (or a custom configured label).
3. **Smart Entity Controls**:
   - `switch`, `valve`, `automation`, `input_boolean`: Rendered with an ON/OFF state and a sci-fi toggle switch.
   - `sensor`, `number`, `select`: Rendered with their current value.
4. **Grouped Accordions**: Entities are grouped by device. Each device gets its own `sf-editor-accordion`. Entities without a device (automations, standalone switches) are grouped under a dedicated "Automations" accordion. Each accordion manages its own expanded/collapsed state independently.
5. **Execution Log per Accordion**: Every accordion (Automations + each device) shows a filtered execution log displaying state changes for that accordion's entities only.
6. **History Fetch Strategy**:
   - Fetches history **once per floor load** using `history/history_during_period` (HA recorder API). Payload must specify `start_time` as `now - 7 days` (e.g., `new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()`) and omit `end_time` to fetch up to now.
   - Falls back to `logbook/get_events` if the recorder API is unavailable.
   - Only queries meaningful domains: `switch`, `valve`, `automation`, `binary_sensor`, `sensor`.
   - Uses `significant_changes_only: true` to suppress high-frequency sensor noise.
   - Manual refresh via sync button (`mdi:refresh`) in the floor bar.
7. **Resilient UI**: Gracefully handles states where no floors exist, or no water entities are present on the selected floor.
8. **i18n**: All user-visible strings are translated via `@lit/localize`. Language follows HA's current language.

## Configuration & Tags (Labels)

For entities to appear automatically in the card, they must:
1. Have the configured label (default: `water`).
2. Be assigned to a **Room (Area)**, which is itself assigned to a **Floor**.

## Visuals
- Matches the overarching Sci-Fi theme: glowing neon borders (`var(--sf-primary)`), dark translucent backgrounds, sci-fi toggles, and customized SVG corner cutouts on entity rows.
- Dynamic Island / Hexagonal tabs with `scale` transforms on selection/hover.
- Execution log: two-row layout per entry (timestamp+badge row + name→state row) for full readability on mobile.
- Sync button: bare `mdi:refresh` icon (no border), spins during loading.

## Code Contracts
- **Card**: `sci-fi-water-management` (extends [SciFiBaseCard](./03_base_classes.md#scifibasecard))
- **Editor**: `sci-fi-water-management-editor` (extends [SciFiBaseEditor](./10_card_editors.md#scifibaseeditor))
- **Config Interface**: `SciFiWaterManagementConfig`

### Properties
- `header_message` (string, optional): Title at the top.
- `filter_label` (string, optional): HA label to look for (default: `water`).
- `first_floor_to_render` (string, optional): Default selected floor. Resolves by `floor_id` or case-insensitive floor name.
- `default_icon` (string, optional): Fallback icon for entities without an explicit icon.
- `ignored_entities` (string[], optional): List of `entity_id`s to exclude from rendering.

### Internal State
| Property | Type | Description |
|----------|------|-------------|
| `_activeFloorId` | `string \| null` | Currently selected floor |
| `_expandedMap` | `Map<string, boolean>` | Expanded state per accordion key (device_id or `no_device`) |
| `_rawLogs` | `any[]` | All history entries for current floor (unfiltered) |
| `_historyLogsLoading` | `boolean` | True while history fetch is in progress |
| `_activeFilter` | `'all' \| 'alerts'` | Log filter toggle |
| `entityIds` | `string[]` | All water entity IDs for current floor |
| `_devices` / `_entities` | `Record<string, any>` | Registry cache (device + entity registry) |

### Key Methods
| Method | Description |
|--------|-------------|
| `_fetchHistoryLogs()` | Fetches 7-day history via `history/history_during_period`, falls back to logbook |
| `_syncLogs()` | Manual refresh trigger |
| `_renderHistoryLogs(filterEntityIds: string[])` | Renders log console filtered to specific entity IDs |
| `_renderFloorInfo(floor)` | Renders floor name bar + sync button |
| `_renderEntitiesGrouped(entities)` | Groups entities by device_id, renders one accordion per group |
| `_getWaterEntitiesForFloor(floorId)` | Returns all water-labeled entities assigned to areas on this floor |

### Events
| Event | Source | Handler |
|-------|--------|---------|
| `sf-accordion-toggle` | `sf-editor-accordion` | Updates `_expandedMap` for that accordion key |

## Anti-Patterns

| Anti-Pattern | Violation | Correct Behavior |
|--------------|-----------|------------------|
| Hardcoding entities | **Do NOT hardcode entities**: card must remain dynamic based on labels and areas. | Rely on HA labels and area discovery. |
| Using `getAreas()` alone | **Do NOT use `getAreas()` alone**: resolve floor first. | Use `getFloors()` → get areas per floor. |
| `@click` on accordion host | **Do NOT use `@click` to toggle accordion**: conflicts with native label+checkbox toggle → double-click bug. | Listen to `sf-accordion-toggle` custom event dispatched by the component. |
| Fetch on accordion open | **Do NOT fetch history on every accordion open**: too many WS calls, stale state risk. | Fetch once on floor load; manual sync via button. |
| Logbook-only for history | **Do NOT rely solely on `logbook/get_events`**: many domains excluded by default. | Use `history/history_during_period` (recorder) with logbook fallback. |
| Global expanded state | **Do NOT use a single `expanded` boolean**: one accordion's state bleeds into others. | Use `_expandedMap: Map<string, boolean>` keyed by device_id or `no_device`. |
| `white-space: nowrap` on log text | Truncates names on mobile screens. | Use `white-space: normal; word-break: break-word` with column flex layout. |
| Ignoring missing state | Failing to render when no floors or water entities exist. | Render a graceful fallback UI. |

## Cross-Spec Contracts
### Produces
N/A — this card renders UI only; it does not publish events or data consumed by other specs.

### Consumes
| Path / Identifier | Format | Schema Location | Producer |
|---|---|---|---|
| `SciFiBaseCard` | TypeScript Class | [Spec 03](../03_base_classes.md#blueprint-coverage) | base-card.ts |
| `SciFiBaseEditor` | TypeScript Class | [Spec 10](../10_card_editors.md#sci-fi-bridge-editor) | base-editor.ts |
| `sf-editor-accordion` | Lit Component | [Spec 04](../04_components.md#blueprint-coverage) | sf-editor-accordion.ts |

### Public Interface
| Type | Identifier | Description |
|---|---|---|
| Custom Element | `custom:sci-fi-water-management` | Registered Lovelace card element |
| Custom Element | `custom:sci-fi-water-management-editor` | Registered editor element |
| Config Property | `filter_label` | HA label string (default: `water`) |
| Config Property | `ignored_entities` | `string[]` of entity_id to exclude |

### External Invocations
- `history/history_during_period` (HA recorder WebSocket API)
- `logbook/get_events` (fallback)
- `config/device_registry/list` + `config/entity_registry/list` (registry cache)

### Tracked Concepts
| Concept | Status | Mentioned in |
|---|---|---|
| HA floor/area topology | In use | .agents/learnings.md |
| Recorder vs logbook fallback | Implemented | .agents/learnings/ha_recorder_fallback.md |

## Assumptions
| # | Assumption | Risk | Validation |
|---|------------|------|------------|
| 1 | Water entities are labeled with `water` by default | Low | Verified via `grep -r "water" src/cards/tactical-water-management/` |
| 2 | Floor configuration exists in HA | Medium | Validated via graceful empty-state rendering — `hass.floors` guard in render() |
| 3 | Area configuration is linked to floors | Low | Verified via HA docs — area.floor_id is standard HA registry field |
| 4 | HA recorder is enabled (not fully disabled) | Low | Validated via logbook API fallback — empty array returned if recorder off |
| 5 | Relevant entity domains are not excluded from recorder | Medium | Verified via logbook empty-state rendering — displays message if no data |

## Test Cases
| ID | Type | Description |
|---|---|---|
| TC-001 | Unit | Card renders with no floors gracefully |
| TC-002 | Unit | Floor selection updates displayed entities and clears logs |
| TC-003 | Unit | Toggle switch updates entity state |
| TC-004 | Unit | Dynamic labels filter correctly |
| TC-005 | Unit | Sensor values display correctly with units |
| TC-006 | Unit | `_expandedMap` tracks each accordion independently |
| TC-007 | Unit | `_renderHistoryLogs` filters rawLogs by provided entity IDs |
| TC-008 | Unit | Sync button triggers `_fetchHistoryLogs` |
| IT-001 | Integration | Fetching floors from HA |
| IT-002 | Integration | Fetching entities from selected floor |
| IT-003 | Integration | Submitting state change to HA |
| IT-004 | Integration | history/history_during_period returns state changes for floor entities |

## Error Handling
| Error | Response | Fallback | Logging |
|---|---|---|---|
| No Floors | Show empty state | N/A | Log warning |
| API Failure | Show connection error | Retry in 5s | Log error |
| Invalid Entity | Hide entity | N/A | Log warning |
| History API unavailable | Fallback to logbook | Empty log if both fail | `console.warn` |
| Registry fetch failure | Use `hass.entities` / `hass.devices` | Reduced label filtering | `console.warn` |
