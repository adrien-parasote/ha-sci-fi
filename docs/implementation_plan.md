# Implementation Plan — Spec 12: Tactical Water Management History Log

This document describes the steps to implement a futuristic, monospace automation history log within the `sci-fi-water-management` card.

---

## Proposed Changes

### Tactical Water Card Component

#### [MODIFY] [sci-fi-water-management.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/water/sci-fi-water-management.ts)
- Add reactive state properties:
  - `@state() private _historyLogs: any[] = [];`
  - `@state() private _historyLogsLoading: boolean = false;`
  - `@state() private _activeFilter: 'all' | 'alerts' = 'all';`
- Implement `_fetchHistoryLogs()` method:
  - Fetch logs for water-labeled entities via HA `hass.callWS` using `logbook/get_events` for the past 24 hours.
  - Filter out malformed events, limit log size to 50 entries, and sort in reverse-chronological order (newest first).
  - Add mock events fallback when running in local development mode (no HA connection).
- Integrate `_renderHistoryLogs()` rendering panel inside the `"Automations"` accordion.
- Handle reactive trigger: call logbook query on active floor switch or accordion expand.

#### [MODIFY] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/water/styles.ts)
- Append all timeline, console, filters, and status badges styling:
  - `.log-console` dashed border and glassmorphic translucent dark background.
  - Glowing timeline vertical line and colored timeline dot bullets.
  - Monospace font alignments and glowing color classes for status types (`[ OK ]`, `[ RUN ]`, `[ WARN ]`).

#### [MODIFY] [water.js](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/cards/water.js)
- Extend mock scenario configurations to include realistic simulated log data for local sandbox verification.

---

## Task List Checklist (Step-by-Step)

### Step 1: Types & API Query Interface
- [ ] Define dynamic log interfaces in `src/types/ha.ts` or local signatures.
- [ ] Implement robust WebSocket `logbook/get_events` call filtering by selected floor's entities.

### Step 2: Styling Assets
- [ ] Append cybernetic styled layouts for the timeline console to `src/cards/water/styles.ts`.

### Step 3: Card Integration & Client Filters
- [ ] Implement reactive `@state` variables and UI bindings in `sci-fi-water-management.ts`.
- [ ] Write client-side filtering logic for "All" / "Alerts" controls.
- [ ] Implement fallback mock history data.

### Step 4: Verification Loop
- [ ] Write Vitest unit tests for filters, empty states, and accordion queries.
- [ ] Launch development workbench and verify visual micro-animations and layouts.

---

## Verification Plan

### Automated Tests
- **Run Vitest command**:
  ```bash
  npx vitest run src/cards/water
  ```
- **Tests covered**:
  - Filter logic correctly displays/hides event statuses.
  - State changes correctly trigger clean log refreshes.
  - Time format conversions execute smoothly.

### Manual Verification
- Deploy to local Workbench sandbox via `npm run dev`.
- Select `Tactical Water` card tab.
- Click and expand `Automations` accordion to inspect glowing console logs and toggle filter controls.
