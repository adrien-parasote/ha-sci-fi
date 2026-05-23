<!-- Generated: 2026-05-23 | Files scanned: 50 | Token estimate: ~300 -->

# Home Assistant Sci-Fi Cards Architecture

## Layers
- `src/cards/` → The visual Lovelace cards. Depend on components and selectors.
- `src/components/` → Reusable UI components (buttons, icons, toggles). Depend on selectors.
- `src/selectors/` → Helper functions and HA state extraction.
- `src/types/` → Types and TypeScript interfaces.

## Key Files
- `src/cards/weather/sci-fi-weather.ts` (Chart.js usage, weather card)
- `src/components/sf-icon/sf-icon.ts` (Custom icon loader, fallback)
- `src/selectors/house.ts` (HA entity state helpers)
- `vitest.config.ts` (Test runner config using happy-dom)
- `rollup.config.mjs` (Build pipeline config)

## Dependencies
- Lit (Web components)
- Chart.js (Weather graph)
- vitest & happy-dom (Testing framework)
- TypeScript & ESLint (Static analysis)
