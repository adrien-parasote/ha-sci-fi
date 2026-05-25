# Goal Description: Urbanisation, Performance & Code Consolidation

Comprehensive refactoring, rendering performance optimization, unit test suite merging, and documentation cleanup for the `ha-sci-fi` custom Lovelace cards package.

This plan moves `ha-sci-fi` to a state-of-the-art codebase, resolving legacy folder naming duplicates, ensuring extreme rendering speed via selective entity tracking, standardizing visual component styles, and consolidating scattered test resources.

---

## User Review Required

> [!IMPORTANT]
> **Performance Improvements via `getRelevantEntities()`**
> We are introducing a strict performance gate in `SciFiBaseCard`. All cards will now override `getRelevantEntities()` to return only the list of Home Assistant entity IDs they actively monitor.
> This ensures that the cards **never** re-render when other unrelated entities in the home update (which normally triggers heavy re-renders due to HA's massive dynamic `hass` updates).
>
> **Urbanization and Folder Alignment**
> We are renaming `src/cards/hexa_tiles` to `src/cards/hexa-tiles` to conform with kebab-case standards of all other card folders. All imports, tests, and bundler configurations will be updated accordingly.

> [!WARNING]
> **Eliminating Legacy Manual Tests and Redundant folders**
> The old `tests/icons.html` and `tests/index.html` manual test files from the pre-TS era are obsolete and dead links (they refer to non-existent JS files). We will delete them.
> The directory `src/components/icons/` is a direct copy of the custom icons data in `src/components/sf-icon/data/`. We will route all imports to the latter and delete the former.

---

## Open Questions

> [!NOTE]
> 1. **Testing Consolidation**: We propose to merge all redundant `*-extended.test.ts`, `*-new.test.ts`, and `*-design.test.ts` files into a single unified test file for the card (`sci-fi-<card>.test.ts`) and its editor (`sci-fi-<card>-editor.test.ts`). Do you approve this structure?
> 2. **Verification confirmation**: Do you approve running validation locally via the Dev Workbench (`npx serve .` on port 8888) as mandated by ADR-007 after we complete our changes?

---

## Proposed Changes

---

### 1. Codebase Urbanization (Folder Structure Standard)

#### [NEW] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/lights/styles.ts)
- Separate style definition extracted from `sci-fi-lights.ts`.

#### [NEW] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/weather/styles.ts)
- Separate style definition extracted from `sci-fi-weather.ts`.

#### [NEW] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa-tiles/styles.ts)
- Separate style definition extracted from `sci-fi-hexa-tiles.ts`.

#### [DELETE] [hexa_tiles](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa_tiles)
- Rename directory to `src/cards/hexa-tiles/` for naming consistency.

#### [DELETE] [icons](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/icons)
- Delete redundant duplicate icons directory. All imports moved to `src/components/sf-icon/`.

#### [DELETE] [icons.html](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/icons.html)
- Delete obsolete pre-TS manual HTML test.

#### [DELETE] [index.html](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/index.html)
- Delete obsolete pre-TS manual HTML index.

---

### 2. Performance & Code Optimizations

#### [MODIFY] [base-card.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-card.ts)
- Ensure the `shouldUpdate` logic strictly checks array elements and works hand-in-hand with card-specific `getRelevantEntities()` overrides.

#### [MODIFY] [sci-fi-hexa-tiles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa-tiles/sci-fi-hexa-tiles.ts)
- Implement `getRelevantEntities()` to listen to weather entities, alerts, and active tile entities.

#### [MODIFY] [sci-fi-lights.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/lights/sci-fi-lights.ts)
- Implement `getRelevantEntities()` to listen to all light domain entities and `sun.sun`.

#### [MODIFY] [sci-fi-climates.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/climates/sci-fi-climates.ts)
- Implement `getRelevantEntities()` to listen to all climate domain entities and `sensor.season`.

#### [MODIFY] [sci-fi-plugs.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/plugs/sci-fi-plugs.ts)
- Implement `getRelevantEntities()` to listen to config plugs and sensor entities.

#### [MODIFY] [sci-fi-weather.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/weather/sci-fi-weather.ts)
- Implement `getRelevantEntities()` to listen to the weather forecast entity, alert entity, and `sun.sun`.
- Move `_subscribeForecasts()` trigger to `willUpdate()` to prevent the Lit concurrent-update warning.

#### [MODIFY] [sci-fi-stove.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/stove/sci-fi-stove.ts)
- Implement `getRelevantEntities()` for stove entities and temperature sensors.

#### [MODIFY] [sci-fi-vacuum.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/vacuum/sci-fi-vacuum.ts)
- Implement `getRelevantEntities()` for vacuum entities.

#### [MODIFY] [sci-fi-vehicles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/vehicles/sci-fi-vehicles.ts)
- Implement `getRelevantEntities()` for vehicle gauges and charge status sensors.

---

### 3. Unit Test Suite Consolidation

#### [DELETE] [extended test files](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/)
- Merge all `*-extended.test.ts`, `*-new.test.ts`, `*-design.test.ts` files into their main unified test suites under `tests/cards/`.

#### [MODIFY] [house.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/selectors/house.test.ts)
- Merge `house.selectors.test.ts` into `house.test.ts` to keep a single, clean domain selector test.

---

### 4. Documentation Consolidation

#### [DELETE] [00_MASTER.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/00_MASTER.md)
- Remove duplicate specification index to keep a single source of truth at `docs/MASTER.md`.

---

## Verification Plan

### Automated Tests
- Run `npm test` to ensure all 583 tests (and newly merged ones) compile and pass with green status.
- Run `npm run typecheck` to confirm zero compilation errors in strictly typed TS decorators.
- Run `npm run lint` to enforce formatting and import standards.

### Manual Verification
- Compile production bundle using `npm run build`.
- Spin up local Dev Workbench using `npx serve . --listen 8888 --cors`.
- Open `http://localhost:8888/dev/workbench.html` and visually verify that all 8 Lovelace cards render fluidly without flicker or console warnings when simulation toggles are fired.
