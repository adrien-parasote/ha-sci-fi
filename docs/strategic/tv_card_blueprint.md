# 🎯 STRATEGY — Planet Orbit Exit (TV Card v1.1) Blueprint

> Document Type: Strategic  
> Stream Coding · STRATEGY stage · Created 2026-05-29  
> Decision: **Pure Lit 3 Web Component — Full Home Assistant Integration & Workbench Simulation**  
> Implementation spec: [Spec 07](../specs/cards/tv.md)  

---

## The Space Theme & Naming

As part of the `v1.x` prioritized roadmap, this release is named **Planet Orbit Exit** (TV Card `v1.1`). 
The visual and strategic design treats the television as the main viewing viewport of the spaceship bridge, where selecting media sources is akin to scanning different space quadrants or planetary orbits, and controlling the volume resembles calibrating the ship's warp throttle or sub-space audio transmitter.

---

## The 7 Questions

### Q1 — What exact problem are we solving?
* **Problem**: Standard Lovelace media player cards are boxy, generic, and do not fit in the futuristic, deeply glowing sci-fi command deck of the user's HA dashboard. They lack integrated tactical remote buttons (like a central D-pad) and require multiple cluttered cards to achieve both TV volume control, source switching, and directional navigation.
* **Target Audience**: Adrien Parasote controlling his Sony Bravia 4K TV (`media_player.bravia_4k_vh22`) and potentially other devices.
* **Expected Outcome**: A single, beautifully integrated, HUD-style card combining an interactive circular volume telemetry dial, a glowing bridge D-pad, and quick-access hexagon source select buttons.

### Q2 — Success Metrics
* **Interactions**: Circular volume dial drag gestures respond in `<16ms` (fluid 60fps) using native Web PointerEvents.
* **Bundle Footprint**: Bundle increase limited to `<30KB` (no third-party slider/gauge libraries).
* **Performance**: Strict selective rendering via `getRelevantEntities()` — card only updates when the specific `media_player` or `remote` entity changes.
* **Compatibility**: 100% compatible with existing custom cards, and zero regressions on the existing `v1.0.0` elements.

### Q3 — Why we will win
* **Unparalleled Aesthetics**: Cyberpunk HUD design with SVG concentric rings and glowing radial ticks.
* **All-in-One Utility**: Blends standard media player states, custom tactile directional buttons, and custom inputs into a unified grid, removing dashboard clutter.
* **Dev Workbench First**: Complete mock-mode simulation in `dev/workbench.html` to allow thorough visual and interactive testing before actual HA deployment.

### Q4 — Core Architectural Decision
* **Unified Component Layer**: Build `sci-fi-tv` extending `SciFiBaseCard` and `sci-fi-tv-editor` extending `SciFiBaseEditor`.
* **Universal D-Pad Services**: D-pad buttons trigger standard HA service calls (defaulting to standard `remote.send_command` targeting the user's remote entity like `remote.bravia_4k_vh22`, but fully configurable for custom services/commands).

### Q5 — Tech Stack Rationale
* **Lit 3.x + strict TypeScript 5.x**: Consistent with the codebase.
* **SVG Pointer Tracking**: Trigonometric angle parsing (`Math.atan2`) in pure JS/TS to map drag coordinates onto the circular track without external gauge library dependencies.

### Q6 — Features (Ordered by dependency)
1. **Tier 0**: Config interfaces, translation keys (`fr.ts`, `en.ts`), and registration in `sci-fi.ts`.
2. **Tier 1 (Core Viewport)**: Power status button, media title telemetry, connection/active state displays.
3. **Tier 2 (Telemetry Dial)**: Interactive circular dial mapping the `volume_level` (0.0 to 1.0) to a circular arc.
4. **Tier 3 (Tactical D-Pad)**: Up, Down, Left, Right, Select, Back, Home, and Menu buttons calling configurable Remote service actions.
5. **Tier 4 (Hex Grid)**: 3-to-6 hexagon quick-select buttons for TV sources (e.g. Netflix, YouTube, Console, HDMI 1).

### Q7 — What we are NOT building
* We are **NOT** writing an independent Bravia API connector (we rely strictly on Home Assistant integrations).
* We are **NOT** implementing media play progress scrubbing (timeline bar) as this is designed as a TV system controller.

---

## 🔍 Assumption Audit

| # | Assumption | Risk Rating | Status | Verification / Evidence |
|---|---|---|---|---|
| 1 | TV entity volume is controlled via `volume_set` service and `volume_level` attribute (0.0 to 1.0). | Low | **VERIFIED** | Standard Home Assistant media_player model. |
| 2 | TV remote controls require key commands like "Up", "Down", "Left", "Right", "Select", "Back", "Home". | Medium | **ASSUMED** | Bravia HA remote integration accepts standard remote commands via `remote.send_command`. |
| 3 | Hex quick select inputs can trigger `media_player.select_source` service with configured string options. | Low | **VERIFIED** | Standard media player service. |
| 4 | The local `dev/workbench.html` can successfully host and simulate this new card. | Low | **VERIFIED** | Workbench has full live/mock structure. We will implement standard mock states for the TV (Power off, Netflix active, YouTube active). |

---

## 📋 Deliverable Alignment

We will produce:
1. `docs/strategic/tv_card_blueprint.md` (This document)
2. `docs/strategic/adr_tv_remote_mapping.md` (ADR-011 on D-pad execution models)
3. `docs/specs/cards/tv.md` (Full AI-Ready Spec)
4. Implementation files (`src/cards/tv/...`) and Workbench simulation states.
