# Spec 11 — Guidelines Delta Remediation

> Document Type: Implementation
> Covers: [implementation_plan.md](../implementation_plan.md#L1)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 03](./03_base_classes.md#L1), [Spec 05](./05_cards.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-REMED-01 | Vacuum styling tokens refactoring | ✅ `src/cards/vacuum/styles.ts` |
| F-REMED-02 | Hexa-tiles theme support and alerts mapping | ✅ `src/cards/hexa-tiles/styles.ts` |
| F-REMED-03 | Climates season CSS variables & `<ha-card>` wrapping | ✅ `src/cards/climates/` |
| F-REMED-04 | Lightweight event action dispatcher | ✅ `src/utils/action.ts` |
| F-REMED-05 | Lovelace action handlers for hexa-tiles and lights | ✅ `src/cards/hexa-tiles/` & `src/cards/lights/` |
| F-REMED-06 | `LovelaceCard` typescript interface declaration | ✅ `src/utils/base-card.ts` |
| F-REMED-07 | Card height overrides (`getCardSize()`) | ✅ All 8 card classes |
| F-REMED-08 | HACS `"type": "plugin"` + `documentationURL` | ✅ `hacs.json` & `src/sci-fi.ts` |

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | The native `hass-action` event is correctly intercepted by the dashboard without `custom-card-helpers`. | Low | → IT-114: Deploy hexa-tiles card to HA dashboard, click tile, verify HA navigates/toggles entity based on action config. |
| 2 | Wrapping the climates card in `<ha-card>` does not break its flexible horizontal layout. | Medium | → Render the card in the workbench and inspect element rendering under mobile breakpoints. |
| 3 | CSS variables with fallbacks preserve the premium visual appearance in all default dashboard themes. | Low | → Audit style elements in dev workbench under dark, light, and custom active themes. |

---

## File Tree

```text
src/
├── utils/
│   ├── action.ts               [NEW] Lovelace action helper
│   └── base-card.ts            [MODIFY] Implement LovelaceCard interface
├── cards/
│   ├── climates/
│   │   ├── sci-fi-climates.ts  [MODIFY] Wrap renderCard in <ha-card>
│   │   └── styles.ts           [MODIFY] Use CSS variables for season colors
│   ├── hexa-tiles/
│   │   ├── sci-fi-hexa-tiles.ts [MODIFY] Implement action support
│   │   └── styles.ts           [MODIFY] Support theme colors and design tokens
│   ├── lights/
│   │   └── sci-fi-lights.ts    [MODIFY] Implement action support
│   └── vacuum/
│       └── styles.ts           [MODIFY] Replace hardcoded rgb values with tokens
├── sci-fi.ts                   [MODIFY] Add documentationURL to customCards registry
hacs.json                       [MODIFY] Add plugin type
```

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Run `npm test` before finalizing implementation, keep dark-theme visual appearance 100% identical, use pure CSS variable fallbacks |
| **Ask first** | Add any new NPM package dependencies to `package.json` |
| **Never do** | Change card configuration YAML keys, drop existing test assertions |

---

## Cross-Spec Contracts

### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/utils/action.ts` | TypeScript | This spec § "Lovelace Action Dispatcher" | `sci-fi-hexa-tiles.ts`, `sci-fi-lights.ts` |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `src/types/config.ts` | TypeScript | `src/types/config.ts` § "ActionConfig" | `src/types/config.ts` |
| `src/styles/common.ts` | TypeScript | `src/styles/common.ts` § "sciFiCommonStyles" | `src/styles/common.ts` |

### Public Interface

| Type | Identifier | Documented at |
|---|---|---|
| Function | `fireHassAction(node: HTMLElement, config: any, action: 'tap' | 'hold' | 'double_tap')` | This spec § "Lovelace Action Dispatcher" |

### External Invocations

| Type | Invoked | Defined in |
|---|---|---|
| CustomEvent | `hass-action` event dispatched on HTMLElement | Home Assistant Lovelace Frontend Event Bus |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| Lovelace Actions | Handled via CustomEvent | [guidelines.md](../cards/guidelines.md#L237) |
| Card Sizing | Restructured via `getCardSize()` | [guidelines.md](../cards/guidelines.md#L48) |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Installing `custom-card-helpers` NPM package | Bloats bundle size (~70KB+) for a simple IIFE plugin | Use lightweight CustomEvent `hass-action` natively |
| 2 | Hex colors in climates season declarations | `--icon-color: #acd5f3;` | Use themeable variables: `var(--sf-season-blue, #acd5f3);` |
| 3 | Hardcoded black card background in hexa-tiles | `background: #000000 !important;` | Use theme-aware value: `background: var(--ha-card-background, #000000) !important;` |
| 4 | Underestimating visual height in `getCardSize()` | Returning base size `3` for tall cards | Override `getCardSize()` to accurately represent layout rows |
| 5 | Missing card frame wrapper in climates | Returning raw `div.container` | Wrap climates in `<ha-card>` for native card frames |

---

## Technical Specifications

### 1. Lovelace Action Dispatcher (`src/utils/action.ts`)
```typescript
/**
 * Dispatches a native Home Assistant Lovelace action event up the DOM tree.
 * The HA frontend intercepts this event and handles tap/hold/double_tap actions.
 */
export function fireHassAction(
  element: HTMLElement,
  config: {
    entity?: string;
    tap_action?: any;
    hold_action?: any;
    double_tap_action?: any;
    [key: string]: any;
  },
  action: 'tap' | 'hold' | 'double_tap'
): void {
  const event = new CustomEvent('hass-action', {
    detail: {
      config,
      action,
    },
    bubbles: true,
    composed: true,
  });
  element.dispatchEvent(event);
}
```

### 2. UI Action Binding
- In `sci-fi-hexa-tiles.ts`, Lovelace action triggers MUST be bound to the root element of each custom tile (`.hexa-tile`). Use Lit's `@click=${(e) => this._handleTileClick(tile)}` (or similar event binding). The handler MUST call `fireHassAction(this, tile, 'tap')` to dispatch the individual tile's configured action (falling back to `this._navigate(tile.link)` if a `link` is configured directly on the tile, and ignoring empty tiles).
- In `sci-fi-lights.ts`, individual light buttons (`.light-btn`) continue to execute the direct toggling service call `this._toggleLight(light.entity_id, isOn)` and do NOT dispatch the global card-level action config. Any card-level `tap_action`, `hold_action`, or `double_tap_action` defined on `SciFiBaseConfig` is bound to the card's main header or designated action area if requested.

### 3. SciFiBaseCard Interface Contract
The `SciFiBaseCard` abstract class MUST implement a lightweight local declaration of the `LovelaceCard` interface inside `src/utils/base-card.ts` (or import it from `src/types/ha.ts`) to ensure compilation correctness:
```typescript
export interface LovelaceCard extends HTMLElement {
  hass?: any;
  setConfig(config: any): void;
  getCardSize?(): number;
}
```
- `setConfig(config: any)`: Stores the user configuration.
- `set hass(hass: any)`: Home Assistant calls this setter whenever state changes. The base card MUST store it and trigger a reactive update.
- `getCardSize(): number`: Instance method returning the visual height in rows. By default, it returns `3`. Child cards override this (e.g. `hexa-tiles=6`, `stove=4`, `vacuum=6`, `vehicles=5`, `plugs=5`, `weather=4`, `climates=5`). Both the base class and all subclass overrides MUST handle undefined or invalid configurations gracefully by returning the default height `3` early (e.g., if `this.config` is not yet set or is incomplete).

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-111 | Unit | `fireHassAction` dispatches native CustomEvent | Element node, config, action = 'tap' | CustomEvent `hass-action` caught with correct detail, composed=true, bubbles=true |
| TC-112 | Unit | `getCardSize()` returns specific values per card class | Concrete card instances | Correct overrides: hexa-tiles=6, stove=4, vacuum=6, climates=5, plugs=5, vehicles=5, weather=4 |
| TC-113 | Unit | `SciFiBaseCard` complies with `LovelaceCard` | Subclass contract verification | Class implements `getCardSize()`, `setConfig()`, `set hass()`, and supports Lit lifecycle |
| TC-114 | Unit | customCards array contains `documentationURL` for all 8 cards | `sci-fi.ts` export | `window.customCards` entries have `documentationURL` string |
| TC-115 | Unit | `hacs.json` includes required plugin classification | Parse `hacs.json` | JSON contains `"type": "plugin"` |
| IT-111 | Integration | Hexa-tiles handles custom click action | Click tile element with tap_action config | `hass-action` CustomEvent fired up the DOM tree |
| IT-112 | Integration | Climates card renders surrounded by `<ha-card>` wrapper | Render `sci-fi-climates` | Top element in shadow root is `<ha-card>` |
| IT-113 | Integration | Season variables fallback to hexes when undefined | Render climates card | Season icon color maps to default hexes |
| IT-114 | Integration | HA Dashboard intercepts `hass-action` | Deploy card to HA dashboard, click tile | HA navigates/toggles entity based on action config (Verifies Assumption 1) |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Action Dispatch failure | DOM element unmounted / invalid action type | Catch error and log warning to console | Ignore action gracefully |
| Theme variable missing | Variable not declared in theme | Browser falls back to second property argument | Use default premium hex values |
| Card Sizing computation | Calculation on invalid configurations | Fall back to default height `3` in `getCardSize()` instance method | Return base size `3` |
