<!-- Generated: 2026-06-02 | Files scanned: ~110 | Token estimate: ~520 -->

# ha-sci-fi Frontend Codemap

## Custom Cards
All cards register as standard web components and are bound in `src/sci-fi.ts`.
*(Note: `src/sci-fi.ts` contains an HMR protection patch for `customElements.define` — guarded by `if (__DEV__)`, dead-code-eliminated by Terser in production. ⚠️ `window.customCards.type` MUST be the bare tag name e.g. `'sci-fi-lights'` — HA prepends `custom:` internally. Double-prefixing breaks `hui-card-picker` lookup since v1.0.0 fix in v1.3.2.)*
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
  - `sf-icon` → Renders MDI SVGs and custom sci-fi icons (internal element, used by built-in cards)
  - `sci-icon` → Public-facing `<sci-icon>` element — same API as `sf-icon`, usable in any HA component (`sci:`, `sf:`, `mdi:` prefixes; CSS props: `--icon-width`, `--icon-height`, `--icon-color`)
  - `sf-iconset` → Registers `sci:` namespace via `window.customIconsets` (`<ha-icon>`) + `window.customIcons.sci` with `getIconList()`/`getIcon()` (`<ha-icon-picker>` search integration)
  - `icon-cache` → LRU in-memory + IndexedDB fallback + HA native WebSocket bridge
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

## Workbench Dev Tools (`dev/`)

| File | Role |
|---|---|
| `dev/workbench.html` | Entry point — tab layout, toolbar, preview area |
| `dev/modules/workbench-app.js` | Main orchestrator — card loading, scenarios, live/mock hass |
| `dev/modules/icon-browser.js` | Icon browser panel — dynamically reads `window.customIcons.sci.getIconList()`, renders all `sci:` icons in an isolated-shadow-root grid with search, size slider, color picker |
| `dev/cards/_registry.js` | Card registry — imports all card modules + the special `icons` panel |
| `dev/cards/icons.js` | Icon browser card entry (`type: 'iconpicker'`) — triggers `mountIconBrowser()` instead of a Lit card mount |
| `dev/cards/hexa.js` … `bridge.js` | One module per card — provides `tag`, `config`, `scenarios` |

**Icon Browser rendering contract:** weather icons (`SVGTemplateResult` with `<symbol>` IDs) are rendered inside an isolated Shadow Root per cell to prevent SVG symbol ID conflicts in the flat workbench DOM. This is workbench-only — production cards are unaffected.
