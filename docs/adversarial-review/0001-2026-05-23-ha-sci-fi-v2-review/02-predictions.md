# Pre-Commitment Predictions

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026

Before conducting a detailed adversarial review of each specification, we record our pre-commitment predictions regarding potential gaps, inconsistencies, or hidden assumptions based on the technical stack and architecture.

---

## Spec 01 — Infrastructure & Tooling
- **Prediction 1 (Decorators/TS Config Compilation)**: Rollup 4 might have issues compiling class decorators cleanly if `@rollup/plugin-typescript` configurations or tsconfig target/useDefineForClassFields parameters are mismatched, causing property initialization crashes in Lit.
- **Prediction 2 (Chromium headless in DevContainer)**: `@web/test-runner` might fail to run inside Docker/DevContainer environments if required headless Chromium dependencies (like libnss3, libatk, libatk-bridge) are missing from the container image.
- **Prediction 3 (ESLint-Lit decorator mismatch)**: ESLint rules from `@typescript-eslint` might throw warnings/errors on modern Lit decorator structures without the correct parser options or configuration flags.

---

## Spec 02 — Domain Selectors & Types
- **Prediction 1 (Unsafe State Keys)**: Selected entity keys in `hass.states` might be accessed directly without verifying their existence at startup, leading to potential `undefined` reading crashes when the card loads before HA completes state hydration.
- **Prediction 2 (Zod Bloat)**: Zod schemas could significantly inflate the compiled standalone bundle size beyond the optimal ~100KB limit if Zod itself is bundled rather than using direct TypeScript validation.
- **Prediction 3 (Reference Sharing / Mutability)**: Returning shallow copies or nested records from selector functions could introduce shared-reference mutation bugs if subclasses modify properties on retrieved entities.

---

## Spec 03 — Base Classes & Styles
- **Prediction 1 (Lifecycle Super Call omission)**: If card subclasses override `updated()` or other lifecycle methods without calling `super.updated()`, it could break the parent class reactivity and the `syncHALocale` sync handler.
- **Prediction 2 (Global try/catch suppression)**: The global `try/catch` wrapper inside the `render()` function of `base-card.ts` might suppress critical Lit element lifecycle errors, making developer-mode debugging harder because issues will fail silently instead of throwing stack traces.
- **Prediction 3 (CSS variables state lag)**: Statically exported CSS theme templates from `styles/common.ts` might fail to dynamically respond to dark/light mode shifts in the Home Assistant dashboard if the color variables are not reactively updated on the element wrapper.

---

## Spec 04 — Shared Components
- **Prediction 1 (State/Event Synchronization)**: The decoupled `sf-radiator` sub-components could introduce state sync lag or event-loop cascades if they attempt to emit events back to the parent card while the parent card is concurrently re-rendering on property updates.
- **Prediction 2 (Incognito/Private Browser Cache Crash)**: The `sf-icon` cache utilizing `idb-keyval` could fail inside browser private/incognito windows or specialized embedded panels where IndexedDB is blocked or disabled by policy.
- **Prediction 3 (CSS scoping leak or override issues)**: Shadow DOM scoping in individual sub-components might prevent custom card styles from correctly injecting themes, causing broken borders or unstyled buttons in complex dashboard layouts.

---

## Spec 05 — Cards Rewrite (8 cards)
- **Prediction 1 (Weather Chart Network Dependency)**: Dynamic loading of Chart.js in `sci-fi-weather` is highly likely to crash or hang the rendering pipeline in offline/local Home Assistant deployments if a remote CDN is assumed as the primary source.
- **Prediction 2 (Vehicle SVG CPU Saturation)**: The dynamic SVG animation of the vehicle in `sci-fi-vehicles` (`sf-landspeeder`) could cause severe rendering stutter or elevated CPU usage on lower-power tablet displays (like wall-mounted dashboard tablets).
- **Prediction 3 (Missing Sensor Fallbacks)**: Specialized cards like the Stove or Vacuum cards will render empty panels or throw uncaught exceptions if the target user environment lacks the expected sensors or domain integrations.

---

## Spec 06 — Entry Point & Migration
- **Prediction 1 (Iconset registration overwrite)**: Overwriting `window.customIcons` directly rather than merging namespaces defensively could cause silent failures in other custom Lovelace integrations that utilize their own custom iconsets.
- **Prediction 2 (Migration Setter loop)**: Legacy YAML config migration logic running in the card setters might execute repeatedly on every state change event, causing performance degradation during active entity state updates.
- **Prediction 3 (Localization bundle size)**: Compiling all language files statically inside `dist/sci-fi.min.js` could inflate the single bundle file size, violating HACS constraints or slowing down initial dashboard loading times on mobile networks.
