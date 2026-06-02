<!-- Generated: 2026-06-02 | Files scanned: ~95 | Token estimate: ~450 -->

# ha-sci-fi Frontend Codemap

## Custom Cards
All cards register as standard web components and are bound in `src/sci-fi.ts`.
*(Note: `src/sci-fi.ts` contains an HMR protection patch for `customElements.define` to prevent duplicate registration crashes during dev/workbench reloads)*
- **Bridge Overview:** `sci-fi-bridge` / `sci-fi-bridge-editor` — 8 sections indépendantes dans `src/cards/bridge/sections/`
- **Climates:** `sci-fi-climates` / `sci-fi-climates-editor`
- **Hexa Tiles:** `sci-fi-hexa-tiles` / `sci-fi-hexa-tiles-editor`
- **Lights:** `sci-fi-lights` / `sci-fi-lights-editor`
- **Plugs:** `sci-fi-plugs` / `sci-fi-plugs-editor`
- **Stove:** `sci-fi-stove` / `sci-fi-stove-editor`
- **TV Remote:** `sci-fi-tv` / `sci-fi-tv-editor`
- **Vacuum:** `sci-fi-vacuum` / `sci-fi-vacuum-editor`
- **Vehicles:** `sci-fi-vehicles` / `sci-fi-vehicles-editor`
- **Water Management:** `sci-fi-water-management` / `sci-fi-water-management-editor`
- **Weather:** `sci-fi-weather` / `sci-fi-weather-editor`

## Base Classes
- `SciFiBaseCard` (in `src/utils/base-card.ts`) → Core Home Assistant `hass` state proxy, error boundaries, Lit `update()` overrides.
- `SciFiBaseEditor` (in `src/utils/base-editor.ts`) → Configuration dispatcher (`config-changed` via `_dispatchChange()`). Exposes `getLabel(key)` for i18n — all editor labels go through this method, never via direct `msg()`. All editors extend this class.

## Components Hierarchy
- **Icons (`sf-icon/`)**
  - `sf-icon` → Renders MDI SVGs
  - `icon-cache` → LRU in-memory + IndexedDB fallback + HA native WebSocket bridge
  - `sf-iconset` → Local icon registry
- **Inputs (`editor-inputs/`)**
  - `sf-editor-input` → Text/Number fields
  - `sf-editor-dropdown` / `sf-editor-dropdown-entity` / `sf-editor-dropdown-icon` → Selectors
  - `sf-editor-slider` → Range input
  - `sf-editor-color-picker` → Color selection
  - `sf-editor-multi-entity` → Multi-select for entities
  - `sf-editor-action` → Lovelace action configurator
  - `sf-editor-source-list` → Repeatable source configuration list
- **Visuals**
  - `sf-circle-progress-bar`, `sf-stack-bar`, `sf-wheel` → Data visualization
  - `sf-hexa-tile`, `sf-hexa-row` → Core honeycomb layout components
  - `sf-toggle-switch`, `sf-button`, `sf-button-card` → Interaction

## Selectors (State Extraction)
- `src/selectors/climate.ts` → `getClimateState()`
- `src/selectors/house.ts` → `getHouseState()`
- `src/selectors/light.ts` → `getLightState()`

## Localization
- **Tool:** `@lit/localize`
- **Logic:** `src/locales/localization.ts` (Dynamic loader)
- **Dictionaries:** `src/locales/locales/fr.js` (Target, generated — do not edit manually), `xliff/fr.xlf` (Source translation file, edit this)
- **Pattern:** All editor labels use `this.getLabel('key')` via `SciFiBaseEditor.getLabel()` — never `msg('string')` directly in editor templates.
- **Workflow:** `npx lit-localize extract` → edit `xliff/fr.xlf` → `npx lit-localize build` → `fr.js` is regenerated.
