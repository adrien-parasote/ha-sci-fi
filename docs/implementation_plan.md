# Implementation Plan: Card Editors (Graphical Configuration UI)

This plan outlines the engineering steps to restore the 8 graphical card editors for the Home Assistant sci-fi dashboard. It introduces a clean, reusable set of input sub-components (`sf-editor-*`) and integrates them into a safe, immutable update cycle using unified events and infinite-loop guards.

---

## User Review Required

> [!IMPORTANT]
> **Unified Event Architecture:** All custom editor inputs (`sf-editor-input`, `sf-editor-dropdown`, `sf-editor-slider`, etc.) will communicate value updates via a single unified custom event: **`input-update`** (with standard `InputUpdateDetail` payload). This eliminates the distinction between clicks and keystrokes, simplifying card editors to a single event handler `@input-update="${this._update}"`.

> [!WARNING]
> **Immutability & Crash Protection:** To prevent UI state divergence and Lovelace crashes, `SciFiBaseEditor._getNewConfig()` will perform deep-clones, and `_dispatchChange()` will immediately update the local state `this.config = newConfig`. All sub-editors will spread nested config objects (`header`, `sensors`, `alert`, `custom_entities`) defensively before modifying fields to prevent `TypeError` crashes.

---

## Proposed Changes

### Reusable Editor Sub-Components

#### [NEW] [sf-editor-input.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-input.ts)
* Base custom element (`sf-editor-input`) rendering a text/number field with a dynamic floating label.

#### [NEW] [sf-editor-dropdown.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-dropdown.ts)
* Filterable dropdown picker extending the input field. Accepts `items: any[]` dynamically.

#### [NEW] [sf-editor-dropdown-entity.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-dropdown-entity.ts)
* Specialized entity picker filtering `hass.states` by domain (e.g., `'light.'`, `'weather.'`).

#### [NEW] [sf-editor-dropdown-icon.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-dropdown-icon.ts)
* Monospaced icon picker combining `CUSTOM_ICONS` (`sf:`) and common MDI names, applying a search limit of 200 *after* query matching.

#### [NEW] [sf-editor-multi-entity.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-multi-entity.ts)
* Multi-select entity picker rendering selected chips above a filterable dropdown.

#### [NEW] [sf-editor-slider.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-slider.ts)
* Clean numeric range slider.

#### [NEW] [sf-editor-chips.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-chips.ts)
* General multi-value tag list input.

#### [NEW] [sf-editor-color-picker.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-color-picker.ts)
* Styled color swatch picker.

#### [NEW] [sf-editor-accordion.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/components/editor-inputs/sf-editor-accordion.ts)
* Collapsible group panel for sub-configuration elements.

---

### Core Base Classes

#### [MODIFY] [base-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-editor.ts)
* Add `_getNewConfig<T>()` with fallback initialization (`this.config ? ... : {}`).
* Add `_dispatchChange(newConfig)` with synchronous local state synchronization.
* Add localized `getLabel(key)` dictionary using `msg()` from `@lit/localize`.

---

### Graphical Card Editors

#### [NEW] [sci-fi-weather-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/weather/sci-fi-weather-editor.ts)
#### [NEW] [sci-fi-climates-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/climates/sci-fi-climates-editor.ts)
#### [NEW] [sci-fi-lights-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/lights/sci-fi-lights-editor.ts)
* Incorporate async loop guards when checking `first_floor_to_render`.
#### [NEW] [sci-fi-plugs-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/plugs/sci-fi-plugs-editor.ts)
#### [NEW] [sci-fi-stove-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/stove/sci-fi-stove-editor.ts)
#### [NEW] [sci-fi-vacuum-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/vacuum/sci-fi-vacuum-editor.ts)
#### [NEW] [sci-fi-vehicles-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/vehicles/sci-fi-vehicles-editor.ts)
#### [NEW] [sci-fi-hexa-tiles-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.ts)

---

### Integration & Setup

#### [MODIFY] [sci-fi.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/sci-fi.ts)
* Import and register all 8 editors.

---

## Verification Plan

### Automated Tests
* Run the complete TypeScript test suite via Vitest to confirm coverage remains above 90%:
  ```bash
  npm run test
  ```

### Manual Verification
1. Build the production package and launch the local development server:
   ```bash
   npm run build
   ```
2. Navigate to the Dev Workbench: `http://localhost:8000/dev/workbench.html`.
3. Open `✏️ Édition` side-by-side workspace on each of the 8 cards.
4. Interact with dropdowns, sliders, switches, and multi-entity selectors, verifying that:
   * The live preview updates in real-time on the right.
   * Modifying nested keys (like adding custom entity overrides or shortcut items) does not crash the UI.
   * Switching languages dynamically (EN / FR) translates all labels and dropdown parameters instantly.
