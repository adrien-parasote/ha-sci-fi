# Climate UI Restoration from Main

## Background
The user reported that the recent rewrite of the `sci-fi-climates` card lost its "Sci-Fi" design from the `main` branch. The current `sci-fi-climates.ts` implements a simple grid, whereas the `main` branch used a complex interface consisting of:
1. A `<sci-fi-hexa-row>` representing the floors of the house.
2. A `<sci-fi-hexa-row>` representing the areas within the selected floor.
3. A carousel (`.slider`) of `<sci-fi-radiator>` components for the climates in the selected area.
4. An SVG-based custom radiator UI (`sf-radiator`).

## Goal
Restore the exact visual design of the `sci-fi-climates` card from `main`, while adapting its backend logic to use the new v1.0.0 pure function selectors (`selectors/house.ts`, `selectors/climate.ts`) since the old stateful `House`, `Floor`, and `Area` classes have been removed (ADR-004).

## User Review Required
> [!IMPORTANT]
> The `main` branch relied heavily on stateful classes (`this._house.getFloorsOrderedByLevel()`). The new implementation will maintain the exact same UI structure but will fetch data using the pure selectors from `src/selectors/house.ts`.
### [x] Phase 2: Weather Card Header & UI Polish
* Remove `padding-top` from the weather card header (`.header`).
* Ensure days forecast slider border colors represent active/inactive selection (matching hexagons), while high/low temperature coloring applies only to text.
* Adjusted `.today-summary` and `.chart-container` padding/margins.

### [x] Phase 3: TypeScript Fixes
* Fix `TemplateResult | typeof nothing` return type mismatches in `renderCard`.
* Resolve `Object is possibly 'undefined'` errors for array accesses (`allFloors`, `areas`).
* Update `CSSResultGroup` typings for `sf-button-card` and `sf-button-card-select`.build.

## Proposed Changes

### 1. Re-introduce Missing Components
I will convert the following components from the `main` branch into TypeScript (`.ts`) and place them in `src/components/`:
- `sf-hexa-tile.ts` (and `sf-half-hexa-tile.ts`)
- `sf-hexa-row.ts`
- `sf-radiator.ts`

#### [NEW] src/components/sf-hexa-tile.ts
#### [NEW] src/components/sf-hexa-row.ts
#### [NEW] src/components/sf-radiator.ts

### 2. Rewrite Climate Card UI
I will rewrite `src/cards/climates/sci-fi-climates.ts` and `src/cards/climates/styles.ts` using the exact layout from `main`:
- **Header:** House temperature, global on/off action, and season icon.
- **Floors:** A `sci-fi-hexa-row` showing available floors.
- **Floor Content:** Floor name and average temperature.
- **Areas:** A `sci-fi-hexa-row` showing available areas in the selected floor.
- **Area Content:** A carousel containing the `sci-fi-radiator` components for the selected area.

#### [MODIFY] src/cards/climates/sci-fi-climates.ts
- Add local state for `_active_floor_id` and `_active_area_id`.
- Re-implement `__displayHeader`, `__displayFloors`, `__displayFloorInfo`, `__displayAreas`, `__displayAreaInfo`, and the carousel logic.
- Replace `this._house...` calls with pure selector calls (e.g., `getFloors(this.hass)`, `getAreasByFloor(this.hass, floorId)`, `getEntitiesByAreaAndDomain(this.hass, areaId, 'climate')`).

#### [MODIFY] src/cards/climates/styles.ts
- Port the CSS from `style.js` on `main` to `styles.ts`, adapting it for the new standard variable names (`--sf-bg-primary`, etc.) where appropriate, but keeping the exact structural classes (`.floors`, `.areas`, `.slider`, etc.).

## Verification Plan

### Automated Tests
- Typecheck (`tsc --noEmit`) to ensure the newly ported TS components compile correctly.
- Linting (`eslint src/cards/climates/`).

### Manual Verification
- Render the `workbench.html` and confirm the climate card visually matches the screenshots provided by the user and displays the mock entities correctly.
- Ensure clicking the hexagon floors and areas correctly updates the selected states.
- Ensure the `<sci-fi-radiator>` wheel and buttons render the exact same SVG structure.
