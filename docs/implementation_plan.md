# Implementation Plan — Planet Orbit Exit (TV Card v1.1)

This plan outlines the design and step-by-step implementation of the new futuristic TV Card **Planet Orbit Exit** (`sci-fi-tv`) and its visual dashboard editor (`sci-fi-tv-editor`) on the newly created `1.1` branch. The card features an SVG concentric-ring orbital volume dial, a tactical command bridge D-pad, and quick-select hexagon inputs, and will be fully simulated and testable under the local `dev/workbench.html` environment.

---

## User Review Required

> [!IMPORTANT]
> **Universal Action Engine (ADR-011)**  
> By default, if `remote_entity` is defined (e.g. `remote.bravia_4k_vh22`), clicking the D-pad buttons will automatically trigger standard Home Assistant remote command service calls (`remote.send_command` with payloads like `UP`, `DOWN`, `ENTER`, `BACK`, `HOME`, `MENU`).
> If you have custom scripts or a TV brand that requires completely different service calls (e.g., LG webOS), you can easily specify `custom_actions` blocks inside your dashboard YAML to override any specific button click.

> [!IMPORTANT]
> **Simulated Workbench Testing**  
> We will integrate a full TV card tab in `dev/workbench.html` featuring interactive mock states:
> * **Power On / Playing Mode**: Renders active cyan telemetry circles, glowing volume arc, active sources grid, and working D-pad.
> * **Power Off Mode**: Dims the telemetry rings to offline red/dark navy and disables interaction with volume and D-pad.
> * **Live HASS Connection**: Connects successfully to your Bravia 4K TV and remote entity to trigger real command calls.

---

## Open Questions

No outstanding open questions. We have established all default naming parameters and state mappings matching standard media player entities.

---

## Proposed Changes

### 1. Configuration & Registry Layer

We will define the TypeScript interfaces for the TV configuration and register the card element with Home Assistant's Lovelace cards picker.

#### [MODIFY] [config.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/types/config.ts)
* Define `SciFiTVConfig` extending `LovelaceCardConfig` with fields `entity`, `remote_entity`, `name`, `sources`, and `custom_actions`.

#### [MODIFY] [sci-fi.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/sci-fi.ts)
* Import the new card element (`./cards/tv/sci-fi-tv.js`) and editor element (`./cards/tv/sci-fi-tv-editor.js`).
* Register `sci-fi-tv` in `CARD_REGISTRATIONS` array for the Home Assistant card picker.

---

### 2. Card UI & Interaction Layer

We will create the directory `src/cards/tv/` and write the main element class, styling, and editor component.

#### [NEW] [style.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/tv/style.ts)
* Declare Lit CSS styles including the concentric circle layout, SVG volume dial glow effects, custom cross D-pad buttons, and hex grid animations.

#### [NEW] [sci-fi-tv.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/tv/sci-fi-tv.ts)
* Implement `SciFiTV` extending `SciFiBaseCard`.
* Build standard properties, `renderCard()` returning the complete spaceship bridge HUD.
* Add native `PointerEvents` handling (`pointerdown`, `pointermove`, `pointerup` bounds) to trigonometry-track the volume drag.
* Add service action dispatchers (`remote.send_command`, `media_player.select_source`, `media_player.volume_set`).
* Implement selective rendering filter `getRelevantEntities()`.

#### [NEW] [sci-fi-tv-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/tv/sci-fi-tv-editor.ts)
* Implement `SciFiTVEditor` extending `SciFiBaseEditor` to drive the visual entity picker in HA visual editor.

---

### 3. Simulation & Dev Workbench

We will update the development workbench to mock and test the card's visual states instantly.

#### [MODIFY] [workbench.html](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/workbench.html)
* Add a `TV Remote (1.1)` tab to the sidebar menu.
* Build full mock scenario states:
  * "Sony Bravia ON — HDMI 1 Active"
  * "Sony Bravia STANDBY"
* Map mock HASS events to print out to the in-page log when D-pad clicks or volume changes occur.

---

## Verification Plan

### Automated Tests
* Create unit tests in `tests/cards/sci-fi-tv.test.ts` to assert:
  * Proper schema parsing and missing entity throws.
  * Correct D-pad service command payloads.
  * Hex source elements are rendered dynamically.
* Run Vitest checks: `npm test`
* Check TypeScript types: `npm run typecheck`

### Manual Verification
* Build development package: `npm run build`
* Start local dev server: `npx serve . --listen 8888 --cors`
* Open `http://localhost:8888/dev/workbench.html` on your desktop/mobile to test interactive visual gestures.
