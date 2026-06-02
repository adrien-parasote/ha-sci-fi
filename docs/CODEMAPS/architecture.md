<!-- Generated: 2026-06-02 | Files scanned: ~110 | Token estimate: ~580 -->

# Home Assistant Sci-Fi Cards — Architecture v2

## Layers

| Layer | Path | Responsibility |
|---|---|---|
| Cards | `src/cards/` | 11 Lovelace custom cards — extend `SciFiBaseCard` (bridge, climates, hexa-tiles, lights, plugs, stove, tv, vacuum, vehicles, water, weather) |
| Components | `src/components/` | Reusable UI elements (`sf-icon`, `sf-toggle-switch`, `sf-button*`, `editor-inputs/`) |
| Selectors | `src/selectors/` | Pure HA state extraction helpers — no mutations |
| Utils | `src/utils/` | `base-card.ts`, `base-editor.ts`, `action.ts`, `toast.ts` — Lit lifecycle base classes |
| Locales | `src/locales/` | `@lit/localize` runtime i18n — `localization.ts` (setLocale/getLocale) + `locales/fr.ts` (FR translations) |
| Types | `src/types/` | TypeScript interfaces (`config.ts` — all card configs, `ha.ts` — HA entity types) |
| Styles | `src/styles/` | `common.ts` — shared CSS custom properties (`--sf-*` tokens). `editor-common.ts` — shared editor layout |
| Entry | `src/sci-fi.ts` | Bundle entry — registers all 11 `customCards` + `customElements` (HMR-safe define guard) |
| Dev Workbench | `dev/` | Local UI test environment — modular ES modules, mock + live HA data |

## Key Files

| File | Purpose |
|---|---|
| `src/sci-fi.ts` | Main entry — registers all cards in `window.customCards`. HMR protection patch prevents duplicate `customElements.define` crashes |
| `src/utils/base-card.ts` | `SciFiBaseCard` (156 lines) — error boundary, `hass` guard, lifecycle |
| `src/utils/base-editor.ts` | `SciFiBaseEditor` (304 lines) — `_dispatchChange()`, `getLabel()` i18n dict, `setConfig()` pattern |
| `src/utils/toast.ts` | `showToast(msg, type)` — module-level active-toast dedup, auto-dismiss 1.8s |
| `src/components/sf-icon/sf-icon.ts` | MDI icon renderer — `willUpdate()` + 3-tier cache (mem→idb→HA) |
| `src/components/sf-icon/icon-cache.ts` | `resolveIcon()` — memory Map + idb-keyval + HA native registry |
| `src/cards/bridge/sci-fi-bridge.ts` | Bridge Overview card — 8 optional sections, responsive CSS Grid (1→2 col) |
| `src/cards/bridge/sci-fi-bridge-editor.ts` | Bridge editor — sf-editor-* components (icon picker, accordion, entity dropdown) |
| `src/cards/weather/sci-fi-weather.ts` | Weather card — Chart.js bundled, `@query` canvas ref |
| `vitest.config.ts` | Vitest runner — happy-dom, global Canvas/ResizeObserver mocks |
| `rollup.config.mjs` | Rollup 4 — `@rollup/plugin-terser@^1.0.0`, Chart.js bundled |
| `tests/setup.ts` | Global test setup — silences Lit dev warnings, mocks Canvas API |

## Card Anatomy (standard pattern)

```
src/cards/<card>/
  sci-fi-<card>.ts        ← card logic (extends SciFiBaseCard)
  sci-fi-<card>-editor.ts ← config editor (extends SciFiBaseEditor)
  styles.ts               ← css`` tagged template (imported by card)
  <card>_const.ts         ← constants/type guards (optional)
  sections/               ← sub-components (bridge only)
```

## Bridge Card — Sections (new in v1.3)

```
src/cards/bridge/sections/
  sf-bridge-crew.ts         ← person tiles (hexa style, zone-aware)
  sf-bridge-alerts.ts       ← smoke + toggles + occupancy
  sf-bridge-access.ts       ← covers + locks list
  sf-bridge-automations.ts  ← automation toggles + slider
  sf-bridge-appliances.ts   ← cycles + consumables
  sf-bridge-stove.ts        ← pellets progress + stock counter
  sf-bridge-vehicle.ts      ← EV power sensor read-only
  sf-bridge-actions.ts      ← quick actions

```

All sections are optional — absent from YAML → not rendered (zero errors).

## Editor Component System

All editors use internal `sf-editor-*` components (NOT HA native `ha-textfield`/`ha-entity-picker`):

| Field type | Component |
|---|---|
| Entity | `sf-editor-dropdown-entity` |
| Text/Number | `sf-editor-input` |
| Icon | `sf-editor-dropdown-icon` — searchable MDI + sci-fi |
| Select | `sf-editor-dropdown` |
| Section toggle | `sf-editor-accordion` |
| Action config | `sf-editor-action` |
| Repeatable list | `sf-editor-source-list` |

All editors dispatch via `SciFiBaseEditor._dispatchChange(config)` → `config-changed` CustomEvent.

## Navigation Pattern (hexa-tiles)

Internal HA paths use the `_navigate(path)` helper (never `window.location.assign`):
```ts
window.history.pushState(null, '', path);
window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
// External URLs: window.open(url, '_blank', 'noopener,noreferrer')
```

## sf-icon Binding Rule

Dynamic icon values **require** Lit property binding (`.icon=`), not attribute binding (`icon=`):
```html
<!-- ✅ correct — updates dynamically -->
<sf-icon .icon="${isCharging ? 'mdi:ev-station' : 'mdi:car-electric'}" .connection="${...}"></sf-icon>

<!-- ❌ wrong — does NOT update after first render -->
<sf-icon icon="${expression}" .connection="${...}"></sf-icon>
```

## Test Coverage

- **87 test files / 953 tests** — all GREEN
- Global: Lines 86.3% | Branches 75.49% | Functions 82.62% | Statements 87.95%
- Thresholds: lines/statements/functions ≥ 80%, branches ≥ 75%
- `tsconfig.json` has `noUncheckedIndexedAccess: true` — array accesses use `!` non-null assertion
- Canvas API mocked globally in `tests/setup.ts`
- Pure SVG data files excluded from coverage (`sf-weather-icons.ts`, `sf-icons.ts`, `ha.ts`)
- Branch coverage ceiling: Lit template ternaries structurally uncoverable by v8 (L023)
- **Verify gate**: ALWAYS run `npx tsc --noEmit` AND `npx vitest run` — Vitest alone does NOT typecheck

## Dev Workbench

Modular UI test environment — run BEFORE any production deployment:

```bash
npm run build
npx serve . --listen 8888 --cors
open http://localhost:8888/dev/workbench.html
```

**Architecture (modular ES modules):**

```
dev/
├── workbench.html          ← HTML shell
├── workbench.css           ← All styles
├── cards/                  ← Declarative card definitions (1 file = 1 card)
│   ├── _registry.js        ← Auto-import of all cards
│   ├── bridge.js, climates.js, hexa.js, lights.js, plugs.js
│   ├── stove.js, tv.js, vacuum.js, vehicles.js, water.js, weather.js
└── modules/                ← Engine modules
    ├── workbench-app.js    ← Main entry — init, tabs, renderCard, scenarioData forwarding
    ├── mock-data.js        ← MOCK_STATES, MOCK_AREAS, MOCK_FLOORS, MOCK_ENTITIES
    ├── mock-hass.js        ← buildMockHass (declarative merge), buildLiveHass
    ├── ha-connection.js    ← connectToHA, disconnectHA, OAuth/token auto-reconnect
    ├── console.js          ← Console proxy, filters, search, copy
    ├── editor.js           ← GUI/YAML editor — mountUiEditor(tag, config, scenarioData)
    ├── view-modes.js       ← Card/Panel mode, device simulator
    ├── ui-helpers.js       ← HA status, live mode toggle, modals
    └── ha-icon.js          ← Mock ha-icon custom element
```

**Critical workbench rule:** `editor.js::updateCardConfig(newConfig, scenarioData)` MUST receive `scenarioData` — without it, entity dropdowns empty on every GUI edit (L078).

**Adding a new card (declarative):**
1. Create `dev/cards/my-card.js` → `export default { id, label, tag, config, scenarios }`
2. Add 1 import line in `dev/cards/_registry.js`
3. Zero engine modifications

**Scenario format:** Pure data objects (deep-merged with MOCK_STATES). `$match:light.*` syntax for bulk overrides.
