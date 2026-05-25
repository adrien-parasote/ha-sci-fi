<!-- Generated: 2026-05-25 | Files scanned: 76 | Token estimate: ~500 | Updated: post-ts-fix-cycle -->

# Home Assistant Sci-Fi Cards — Architecture v2

## Layers

| Layer | Path | Responsibility |
|---|---|---|
| Cards | `src/cards/` | 9 Lovelace custom cards — extend `SciFiBaseCard` (hexa_tiles, lights, climates, plugs, weather, stove, vacuum, vehicles) |
| Components | `src/components/` | Reusable UI elements (`sf-icon`, `sf-toggle-switch`) |
| Selectors | `src/selectors/` | Pure HA state extraction helpers — no mutations |
| Utils | `src/utils/` | `base-card.ts`, `base-editor.ts` — Lit lifecycle base classes |
| Locales | `src/locales/` | `@lit/localize` runtime i18n — `localization.ts` (setLocale/getLocale) + `locales/fr.ts` (FR translations) |
| Types | `src/types/` | TypeScript interfaces (config, ha.ts, HA entity types) |
| Styles | `src/styles/` | `common.ts` — shared CSS custom properties (`--sf-*` tokens) |
| Entry | `src/sci-fi.ts` | Bundle entry — registers all 8 `customCards` + `customElements` |
| Dev Workbench | `dev/workbench.html` | Local UI test environment — loads `dist/sci-fi.min.js`, mock + live HA data |

## Key Files

| File | Purpose |
|---|---|
| `src/sci-fi.ts` | Main entry point — registers all cards in `window.customCards` |
| `src/utils/base-card.ts` | `SciFiBaseCard` — error boundary, `hass` guard, lifecycle |
| `src/components/sf-icon/sf-icon.ts` | MDI icon renderer — `willUpdate()` + 3-tier cache (mem→idb→HA) |
| `src/components/sf-icon/icon-cache.ts` | `resolveIcon()` — memory Map + idb-keyval + HA native registry |
| `src/cards/hexa_tiles/sci-fi-hexa-tiles.ts` | Hex dashboard — includes `_navigate()` HA-native router, ResizeObserver dynamic 100% width interlocking checkerboard grid |
| `src/cards/weather/sci-fi-weather.ts` | Weather card — Chart.js bundled, `@query` canvas ref |
| `vitest.config.ts` | Vitest runner — happy-dom, global Canvas/ResizeObserver mocks |
| `rollup.config.mjs` | Rollup 4 — `@rollup/plugin-terser@^1.0.0`, Chart.js bundled |
| `tests/setup.ts` | Global test setup — silences Lit dev warnings, mocks Canvas API |
| `dev/workbench.html` | Dev workbench — `npx serve . --listen 8888`, live HA via `home-assistant-js-websocket` |

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

## Dependencies

| Package | Version | Role |
|---|---|---|
| `lit` | `^3.2.1` | Web Components framework |
| `chart.js` | latest | Weather forecast graph — **bundled, never CDN** |
| `idb-keyval` | latest | Icon cache persistent layer (IndexedDB) |
| `vitest` + `happy-dom` | latest | Test runner |
| `@rollup/plugin-terser` | `^1.0.0` | Minification (upgraded from 0.4.x, fixes serialize-javascript RCE) |
| `typescript` | `5.x` | Strict type checking |
| `home-assistant-js-websocket` | bundled | HA WebSocket client — used by workbench for live entity subscription |
| `npx serve` | devDependency | Static file server for `dev/workbench.html` — `serve . --listen 8888 --cors` |

## Test Coverage

- **56 test files / 471 tests** — all GREEN
- `tsconfig.json` has `noUncheckedIndexedAccess: true` — all array index accesses in tests use `received[0]!` non-null assertion (L063)
- `HomeAssistantExt` includes `config?: { unit_system?: { temperature?, pressure? } }` — matches HA runtime object (L064)
- Canvas API mocked globally in `tests/setup.ts`
- `happy-dom` history API mocked per-test via `vi.stubGlobal`
- `window.customIcons` restored via `afterEach` cleanup
- Pure SVG data files excluded from coverage (`sf-weather-icons.ts`, `sf-icons.ts`, `ha.ts`)
- Branch coverage ceiling: Lit template ternaries structurally uncoverable by v8 (L023)
- **Verify gate**: ALWAYS run `npx tsc --noEmit` AND `npx vitest run` — Vitest alone does NOT typecheck (L063)

## Dev Workbench

Localhost UI test environment — run BEFORE any production deployment:

```bash
# Step 1 — build
npm run build

# Step 2 — serve
npx serve . --listen 8888 --cors

# Step 3 — open
open http://localhost:8888/dev/workbench.html
```

**Features:**
- 8 card tabs (all cards, production YAML configs)
- Mock mode: pre-built scenarios per card (Dobby cleaning, EvLink charging, pellets low…)
- Live mode: connects to real HA instance via `home-assistant-js-websocket` (OAuth or Long-Lived Token)
- Auto-reconnect from `localStorage` tokens
- In-browser console log for `callService` calls and state changes
