# Maximize Test Coverage in ha-sci-fi

This implementation plan aims to elevate the unit test coverage of the custom Lovelace card codebase (`ha-sci-fi`) to the absolute maximum (targeting 95%+ statements, branches, and lines) by covering all remaining uncovered branches in base components and card controllers.

## User Review Required

> [!NOTE]
> All changes are restricted exclusively to test suites (`tests/`). No production code is modified or impacted, eliminating any risk of regression in Home Assistant.

## Proposed Changes

### 1. Base Components Unit Tests

I will enrich existing component test suites to cover edge cases, wrap-around selectors, and dynamic fallbacks.

#### [MODIFY] [sf-button-card-select.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/components/buttons/sf-button-card-select.test.ts)
* Test items without an explicit `color` to cover the fallback branch logic.
* Test `clickBtn(e)` without passing an event object `e` to cover the `if (e)` conditional check.

#### [MODIFY] [sf-wheel.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/components/sf-wheel.test.ts)
* Simulating clicks when the wheel is empty to hit the `items.length === 0` guard clause.
* Testing wrap-around on `up` clicks (moving from the last item back to index 0).
* Testing wrap-around on `down` clicks (moving from index 0 to the last item).
* Testing navigation when `selectedId` is invalid or not in the list to cover default index matching fallbacks.

#### [MODIFY] [sf-radiator.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/components/sf-radiator.test.ts)
* Add test cases targeting `__getPresetOptions()` branch filtering when the climate state is `'auto'`:
  * `preset_mode` is not frost/frost_protection (e.g. `'eco'`) -> verify only `frost_protection` is returned.
  * `preset_mode` is frost/frost_protection (e.g. `'frost_protection'`) -> verify `'eco'` and `'comfort'` are allowed.
* Test custom state/preset icon override fallbacks for frost protection icons.

---

### 2. Card Controllers Unit Tests

I will expand card controller test suites to cover floor/area clicks, error boundary flows, and mock device aggregations.

#### [MODIFY] [sci-fi-climates.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/cards/climates/sci-fi-climates.test.ts)
* Query floor and area hexagon rows (`sf-hexa-row`) and dispatch custom `cell-selected` events to simulate user selections.
* Remove the `<sf-toast>` element from the shadow DOM before dispatching an action to force the `else` warning fallback (`console.warn`) path in `__toast` and spy on `console.warn` to check its behavior.

#### [MODIFY] [sci-fi-hexa-tiles.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/cards/hexa_tiles/sci-fi-hexa-tiles.test.ts)
* Dispatch an `'error'` event on the avatar `<img>` element and verify that its style display updates to `'none'`.
* Mock a weather alert sensor with an unsupported state and verify that `stateToLevel` defaults to `'green'` (meaning the alert banner stays hidden).
* Set an unsupported weather condition to verify that the card falls back to a `'cloudy'` animated icon representation.
* Register a custom `media_player` tile without `state_on` config, set its state to `'playing'`, and verify it evaluates to active.

#### [MODIFY] [sci-fi-lights.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/cards/lights/sci-fi-lights.test.ts)
* Add test cases simulating user interactions with all power toggle controls:
  * Click on individual light buttons (`_toggleLight`).
  * Click on the area power button (`_toggleAreaLights`).
  * Click on the floor power button (`_toggleFloorLights`).
  * Click on the header global power button (`_toggleAllLights`).
* Assert that the mock `hass.callService` is called with the correct payloads.

#### [MODIFY] [sci-fi-weather.test.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/tests/cards/weather/sci-fi-weather.test.ts)
* Verify the custom Chart.js `weatherIcon` plugin's hook `afterDatasetsDraw` directly. We will mock the `Chart` instance, mock `globalThis.Image` to trigger `onload` immediately, call the hook, and verify `ctx.drawImage` is executed.
* Mock `globalThis.__mockChartShouldThrow = true` to force the Chart constructor to fail, and verify that the error handling code catches it gracefully and outputs a warning via `console.warn`.

---

## Verification Plan

### Automated Tests
- Run `npm run test:coverage` to execute the full unit test suite and verify that the Statements, Branches, and Lines coverage statistics are elevated to > 90% (and functions remaining above 90%).
- Run `npm run typecheck` to verify that there are zero TypeScript compiler warnings or errors in both the production code and the test suites.
- Run `npm run lint` to verify that there are no style or syntax check failures.
