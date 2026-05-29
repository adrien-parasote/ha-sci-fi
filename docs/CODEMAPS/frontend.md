<!-- Generated: 2026-05-25 | Files scanned: ~65 | Token estimate: ~400 -->

# ha-sci-fi Frontend Codemap

## Custom Cards
All cards register as standard web components and are bound in `src/sci-fi.ts`.
- **Climates:** `sci-fi-climates` / `sci-fi-climates-editor`
- **Hexa Tiles:** `sci-fi-hexa-tiles` / `sci-fi-hexa-tiles-editor`
- **Lights:** `sci-fi-lights` / `sci-fi-lights-editor`
- **Plugs:** `sci-fi-plugs` / `sci-fi-plugs-editor`
- **Stove:** `sci-fi-stove` / `sci-fi-stove-editor`
- **TV Remote:** `sci-fi-tv` / `sci-fi-tv-editor`
- **Vacuum:** `sci-fi-vacuum` / `sci-fi-vacuum-editor`
- **Vehicles:** `sci-fi-vehicles` / `sci-fi-vehicles-editor`
- **Weather:** `sci-fi-weather` / `sci-fi-weather-editor`

## Base Classes
- `BaseCard` (in `src/utils/base-card.ts`) → Core Home Assistant `hass` state proxy, error boundaries, Lit `update()` overrides.
- `BaseEditor` (in `src/utils/base-editor.ts`) → HA form schema wrapper, configuration dispatcher (`config-changed` event).

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
- **Dictionaries:** `src/locales/locales/fr.ts` (Target), `xliff/fr.xlf` (Source translation)
