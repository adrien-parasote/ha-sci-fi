<!-- Generated: 2026-05-25 | Files scanned: 1 (package.json) | Token estimate: ~150 -->

# ha-sci-fi Dependencies Codemap

## Core Framework
- **`lit` (^3.2.1)**: Web Components framework. Provides reactive properties, declarative templates, and scoped styles.
- **`@lit/task` (^1.0.2)**: Controller for async data fetching and state management within Lit components.

## Home Assistant Integration
- **`home-assistant-js-websocket` (^9.6.0)**: Official client for HA WebSocket API. Used primarily in the Dev Workbench for live data subscription and service calls. In production, the `hass` object is injected directly into custom cards by the Lovelace dashboard.

## Features
- **`@lit/localize` (^0.12.2)**: Runtime localization. Extracts templates to XLIFF and builds TS dictionaries.
- **`chart.js` (^4.4.7)**: Used for rendering the 48-hour forecast graph in the Weather card. Note: Bundled directly into the output, not loaded via CDN.
- **`idb-keyval` (^6.2.1)**: Promise-based IndexedDB wrapper. Used by `icon-cache.ts` for persistent caching of requested Material Design Icons to prevent network spam.

## Build & Test
- **`rollup`**: Module bundler, with plugins for Node resolution, TS, and terser minification.
- **`vitest`**: Test framework with `happy-dom` for browser simulation.
- **`playwright` & `@vitest/browser`**: For full browser E2E/UI testing if configured.
