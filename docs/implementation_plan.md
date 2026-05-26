# Implementation Plan — Guidelines Delta Remediation (ha-sci-fi)

This plan outlines the strategic remediation of the 5 compliance deltas identified between [guidelines.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/cards/guidelines.md) and the 8 custom Home Assistant cards in `ha-sci-fi`. It restores 100% theme compatibility, standard Lovelace action capabilities, and HACS catalog compliance without introducing breaking changes or heavy dependencies.

---

## User Review Required

> [!IMPORTANT]
> **Zero-Dependency Action Handling**
> Instead of installing the heavy `custom-card-helpers` npm package which would balloon the final bundle size (~70KB+ with sub-dependencies), we propose implementing a lightweight, standard event-based helper `fireHassAction()` in `src/utils/action.ts` (less than 20 lines of code).
> This dispatcher will fire native `hass-action` events that the Home Assistant frontend intercepts to process `tap_action`, `hold_action`, and `double_tap_action` configurations.

> [!IMPORTANT]
> **Climates Card Visual wrapping**
> Wrapping `sci-fi-climates` inside `<ha-card>` will automatically apply the default Home Assistant card background, border, and border-radius. This aligns the climates card with the other 7 cards visually, resolving a visual inconsistency.

---

## Open Questions

No outstanding open questions. The remediation strategy is designed to be 100% backward-compatible, requiring zero YAML configuration changes for active dashboards.

---

## Proposed Changes

### 1. Styling Layer (P1)
Refactor hardcoded hex/rgb values to leverage CSS design tokens from `src/styles/common.ts` or native HA theme variables to ensure 100% light/dark mode and custom theme compatibility.

#### [MODIFY] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/vacuum/styles.ts)
- Replace all hardcoded colors (e.g. `rgb(105, 211, 251)`, `rgb(102, 156, 210)`, `rgba(39, 40, 43, 0.3)`) with `--sf-primary`, `--sf-text-secondary`, `--sf-bg-secondary` or `--sf-border` tokens.
- Map battery thresholds (`battery-warn` and `battery-critical`) to `--sf-warning` and `--sf-error`.

#### [MODIFY] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa-tiles/styles.ts)
- Change `background: #000000 !important;` on `ha-card` to `background: var(--ha-card-background, #000000) !important;` to allow dashboard theme compatibility.
- Replace hex values on alert levels with `--sf-warning` and `--sf-error`.

#### [MODIFY] [styles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/climates/styles.ts)
- Refactor season colors (e.g. blue, green, yellow, orange) to use customizable CSS variables with standard fallbacks: `var(--sf-season-blue, #acd5f3)`.
- Replace hardcoded background colors with `--sf-bg-secondary`.

#### [MODIFY] [sci-fi-climates.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/climates/sci-fi-climates.ts)
- Wrap the rendered container within a `<ha-card>` element in `renderCard()` to satisfy Guideline §4.

---

### 2. Interaction & Actions Layer (P1)
Add support for standard tap/hold/double-tap Lovelace actions using the native Home Assistant event bus.

#### [NEW] [action.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/action.ts)
- Create a lightweight event dispatcher `fireHassAction()` which fires the native `hass-action` event up to the Home Assistant dashboard runner.

#### [MODIFY] [config.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/types/config.ts)
- Add standard action fields `tap_action`, `hold_action`, and `double_tap_action` to `SciFiHexaTileConfig` and `SciFiBaseConfig`.

#### [MODIFY] [sci-fi-hexa-tiles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa-tiles/sci-fi-hexa-tiles.ts)
- Bind mouse and touch event listeners on tiles to support both fast tap and long-press (hold).
- Dispatch standard Lovelace actions through the new helper, falling back to custom `_navigate()` if a `link` is configured.

---

### 3. API & Packaging Layer (P2)
Enforce API compliance, card sizing metrics, and standard package metadata.

#### [MODIFY] [base-card.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-card.ts)
- Declare and implement `LovelaceCard` typescript interface to force compilable contract-safety.

#### [MODIFY] Card Sizing Overrides
Implement explicit `getCardSize()` overrides for all 8 cards to reflect visual height:
- `hexa-tiles`: Override size to `6` (or dynamic size based on tiles row count).
- `stove`: Override size to `4`.
- `vacuum`: Override size to `6`.
- `vehicles`: Override size to `5`.
- `plugs`: Override size to `5`.
- `weather`: Override size to `4`.
- `climates`: Override size to `5`.

#### [MODIFY] [hacs.json](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/hacs.json)
- Add `"type": "plugin"` to ensure full HACS catalog compatibility.

#### [MODIFY] [sci-fi.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/sci-fi.ts)
- Add `documentationURL` pointing to the repository instructions inside each registered card configuration inside `window.customCards`.

---

## Verification Plan

### Automated Tests
- Run full Vitest suite to ensure zero regressions: `npm test`
- Write dedicated unit tests in `tests/utils/action.test.ts` to verify standard action event dispatching.
- Add test assertions checking `getCardSize()` values and config type definitions.

### Manual Verification
- Compile development bundle: `npm run build`
- Run the visual workbench local simulator: `npx serve .` (simulating entities and testing visual rendering across themes).
