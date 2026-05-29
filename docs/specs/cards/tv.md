> Document Type: Implementation
> Covers: F-CARD-09 from [tv_card_blueprint.md](../strategic/tv_card_blueprint.md#q6--features-ordered-by-dependency)  
> Depends on: [Spec 03](../03_base_classes.md#blueprint-coverage), [Spec 04](../04_components.md#blueprint-coverage)  

# Spec 07 — Planet Orbit Exit (TV Card v1.1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-CARD-09 | `sci-fi-tv` Custom Card & `sci-fi-tv-editor` | ✅ Full implementation spec of card interface, editor, dynamic dial, and D-pad. |

---

## Assumptions

| # | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | TV entity volume is controlled via the `volume_set` service and `volume_level` attribute (0.0 to 1.0). | Low | [verified] Standard Home Assistant `media_player` model — [docs](https://www.home-assistant.io/integrations/media_player/). |
| 2 | Sony Bravia remote command strings are **PascalCase** ("Up", "Down", "Left", "Right", "Confirm", "Back", "Home", "Menu") as accepted by `remote.send_command`. | Medium | [unverified — assumed correct 2026-05-29] Bravia integration README examples use PascalCase. Verify by calling `remote.send_command` with `Up` and confirming execution in HA logbook before first HA deployment. |
| 3 | Hex quick select inputs can trigger `media_player.select_source` service with configured string options. | Low | [verified] Standard `media_player.select_source` service — [docs](https://www.home-assistant.io/integrations/media_player/#action-media_playerselect_source). |
| 4 | The local workbench HTML file can successfully host and simulate this new card. | Low | [verified] Workbench has full live/mock structure confirmed in existing cards. |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Use strict TypeScript types for all config mappings. Maintain HSL color tokens for visual continuity. Use `setPointerCapture(pointerId)` on the SVG element for all pointer drag interactions. Selective rendering via `getRelevantEntities()`. Add `display: block` to `:host` (L059). Use English-only strings as `msg()` source keys (L060). Never add `@state()` on a field not mutated in the same PR (L018 / YAGNI). |
| **Ask first** | Modifying `SciFiBaseCard` interface or common styles in `src/styles/common.ts`. Adding external icon libraries (strictly reuse `sf-icon` caching). |
| **Never do** | Introduce third-party volume slider libraries or canvas gauges. Bypass standard HA `callService` bounds. Hardcode specific Bravia commands without custom action fallbacks. Use `!= null` — always use `!== null && !== undefined` (L024 / `eqeqeq: always`). Use `rem` as CSS fallback values — always use `px` (L058). Target 100% branch coverage on Lit template ternaries — branch target is 90% (L023). Use circular CSS custom property self-references `--x: var(--x, default)` (L057). |

---

## Cross-Spec Contracts

### Produces
* `custom:sci-fi-tv` registered element for Lovelace dashboard.
* `custom:sci-fi-tv-editor` registered editor element.

### Consumes
| Path / Identifier | Format | Schema Location | Producer |
|---|---|---|---|
| `SciFiBaseCard` | TypeScript Class | [Spec 03](../03_base_classes.md#blueprint-coverage) | base-card.ts |
| `SciFiBaseEditor` | TypeScript Class | [Spec 03](../03_base_classes.md#blueprint-coverage) | base-editor.ts |
| `<sf-icon>` | Lit Component | [Spec 04](../04_components.md#blueprint-coverage) | sf-icon.ts |

### Public Interface
* Lovelace custom card configurations (`SciFiTVConfig`).

---

## Design System & Visual Tokens

To ensure perfect HUD cyber-deck aesthetics without visual drift:

| Token Name | Value | Purpose |
|---|---|---|
| **--sf-bg** | `hsl(240, 30%, 8%)` | Deep space-deck background |
| **--sf-glow-cyan** | `hsl(190, 100%, 50%)` | Primary active glowing telemetries |
| **--sf-glow-navy** | `hsl(230, 40%, 15%)` | Card borders and button frames |
| **--sf-glow-red** | `hsl(0, 100%, 50%)` | Alert state (Warp core warning / TV off) |
| **--sf-telemetry-border**| `rgba(0, 210, 255, 0.2)` | Concentric radar grid lines |
| **--sf-glow-cyan-active**| `hsl(190, 100%, 70%)` | Hex source button active/pressed state |
| **--sf-bg-active**| `hsl(240, 30%, 15%)` | Hex source button pressed state background |

---

## YAML Config Contract

```typescript
export interface SciFiTVCustomActions {
  readonly up?: LovelaceAction;
  readonly down?: LovelaceAction;
  readonly left?: LovelaceAction;
  readonly right?: LovelaceAction;
  readonly confirm?: LovelaceAction;
  readonly back?: LovelaceAction;
  readonly home?: LovelaceAction;
  readonly menu?: LovelaceAction;
}

export interface SciFiTVConfig extends LovelaceCardConfig {
  readonly type: 'custom:sci-fi-tv';
  readonly entity: string;                    // Required: media_player (e.g. media_player.bravia_4k_vh22)
  readonly remote_entity?: string;            // Optional: remote (e.g. remote.bravia_4k_vh22)
  readonly name?: string;                     // Optional: Custom spaceship bridge quadrant label
  readonly sources?: readonly string[];       // Optional: Array of hex button sources (e.g. ['HDMI 1', 'Netflix'])
  readonly custom_actions?: Readonly<SciFiTVCustomActions>; // Optional: per-button Lovelace action overrides
}
```

**Custom action key lookup:** `this._config.custom_actions?.[btn as keyof SciFiTVCustomActions]`

**Example YAML:**
```yaml
type: custom:sci-fi-tv
entity: media_player.bravia_4k_vh22
remote_entity: remote.bravia_4k_vh22
custom_actions:
  home:
    action: call-service
    service: script.warp_speed_home
  back:
    action: navigate
    navigation_path: /lovelace/main
```

---

## Interaction & Math Specifications

### 1. The Orbital Volume Dial (SVG)
* Centered at coordinate `(100, 100)` inside a viewbox `0 0 200 200`.
* Radius `r = 75` (Circumference `C ≈ 471.24`).
* Dashed Arc starts at `-135°` (top-left) and ends at `135°` (bottom-left) to leave an opening at the bottom for labels. Active arc matches the `volume_level` (0.0 to 1.0).

* **Zero-volume rendering (TV `on`, `volume_level = 0.0`)**: Render a minimum visible arc of `3°` at the `-135°` start position (never zero-length). Arc color: `--sf-glow-cyan` at `40%` opacity. Display `"0%"` in the dial center label. This is visually distinct from the `off`/`unavailable` state (which uses red/grey).

* **Pointer Capture (PointerEvents) — full formula:**
  1. On `pointerdown` on the SVG track: call `svgElement.setPointerCapture(event.pointerId)`. This routes all subsequent pointer events to the SVG regardless of cursor position (essential for mobile touch drag on HA dashboard).
  2. Bind `pointermove` and `pointerup`/`pointercancel` on the **SVG element itself** (not `window`) — `setPointerCapture` guarantees delivery even when the finger/cursor leaves the element.
  3. Release capture in `pointerup`/`pointercancel` via `svgElement.releasePointerCapture(event.pointerId)` and clean up listeners.
  4. Also remove listeners in `disconnectedCallback()` as a safety net.

* **Coordinate conversion (DOM → SVG viewBox):**
  ```typescript
  const bbox = svgElement.getBoundingClientRect();
  const svgX = ((event.clientX - bbox.left) / bbox.width) * 200;
  const svgY = ((event.clientY - bbox.top) / bbox.height) * 200;
  const cx = 100, cy = 100; // fixed SVG viewBox center
  ```

* **Angle normalization + clamp (full formula):**
  ```typescript
  const thetaDeg = Math.atan2(svgY - cy, svgX - cx) * (180 / Math.PI);
  // Shift origin: -135° (top-left start) → 0; +135° (bottom-left end) → 270
  const shiftedDeg = ((thetaDeg + 135 + 360) % 360);
  // Dead-zone clamp: pointer in bottom gap [270°, 360°) → snap to nearest edge
  const clampedDeg = shiftedDeg > 270 ? (shiftedDeg > 315 ? 0 : 270) : shiftedDeg;
  // Volume level rounded to 2 decimal places
  const volumeLevel = Math.round((clampedDeg / 270) * 100) / 100; // [0.00, 1.00]
  ```

* **Throttle**: `volume_set` service calls throttled to max **once per 80ms** during active drag to prevent flooding the TV WiFi integration.

### 2. Tactical D-Pad
* **Layout**: Standard D-pad cross grid (Up, Left, Confirm, Right, Down) + supplementary buttons row (Back, Home, Menu).
* **Command strings (PascalCase — matches Sony Bravia HA integration):**

| Button | Default `remote.send_command` value | Internal key for `custom_actions` |
|---|---|---|
| Up | `"Up"` | `"up"` |
| Down | `"Down"` | `"down"` |
| Left | `"Left"` | `"left"` |
| Right | `"Right"` | `"right"` |
| Confirm/OK | `"Confirm"` | `"confirm"` |
| Back | `"Back"` | `"back"` |
| Home | `"Home"` | `"home"` |
| Menu | `"Menu"` | `"menu"` |

* **Service Triggers**:
  * Default mode (`remote_entity` defined, no matching key in `custom_actions`):
    * Calls `remote.send_command` with the PascalCase command string from the table above.
  * Custom Action mode: When `this._config.custom_actions?.[btn]` is defined, trigger the action on `@click`. Import `handleAction` from `custom-card-helpers` and pass a synthetic configuration object: `handleAction(this, this.hass, { tap_action: this._config.custom_actions[btn as keyof SciFiTVCustomActions] }, 'tap')`.

### 3. Central Planet Orbiting Satellite
* **Layout**: A small satellite (`r = 2.5`) orbiting along the diagonal ellipse (`rx = 32`, `ry = 6`) rotated by `-25°` centered around the planet body (`r = 18`) at `(100, 100)`.
* **State dependency**: Rendered always. When the TV power state is `off` or `unavailable`, it carries the `.is-off` class, styling it as a dim red standby beacon (`--sf-glow-red`, `opacity: 0.45`).
* **3D Depth Simulation**: To simulate the satellite passing behind the planet, a custom CSS animation (`planet-satellite-orbit-anim` running at `6s linear infinite`) translates it along the unrotated ellipse path:
  * $dx = 32 \cos(\theta)$, $dy = 6 \sin(\theta)$
  * Behind the planet ($\theta$ between $235.8^\circ$ and $304.2^\circ$, or approx $66\%$ to $84\%$ of the animation loop), the satellite is hidden using `visibility: hidden`.
  * Everywhere else (front half and outside the planet sphere's width), the satellite is visible with `visibility: visible`. This decouples depth occlusion from power-state dimming.

---

## Editor Architecture

The `custom:sci-fi-tv-editor` relies exclusively on the components established in Spec 10. It extends `SciFiBaseEditor` and uses localized labels (`this.getLabel()`) for all section headers, accordions, and input elements to support dynamic language switching (e.g. French).

**State loaded from hass:**
- `_mediaPlayers: HassEntity[]` — `Object.values(hass.states).filter(e => e.entity_id.startsWith('media_player.'))`
- `_remotes: HassEntity[]` — `Object.values(hass.states).filter(e => e.entity_id.startsWith('remote.'))`

**Main view sections:**
1. **Entity (Required)**
   - `<sf-editor-dropdown-entity>` for `entity`. Filtered list from `_mediaPlayers`.
2. **Settings (Accordion)**
   - `<sf-editor-input>` for `name` (text, spaceship quadrant label).
   - `<sf-editor-dropdown-entity>` for `remote_entity`. Filtered list from `_remotes`.
3. **Shortcuts (Accordion)**
   - `<sf-editor-chips>` for `sources` (e.g., HDMI 1, Netflix).
4. **Custom Actions**
   - Due to the complexity of Lovelace action configurations, `custom_actions` are strictly configured via YAML and are NOT exposed in the graphical editor. The editor preserves them implicitly via `SciFiBaseEditor._getNewConfig()`.

**`_update` handler logic:**
Follows the standard `e.detail.id` / `e.detail.value` mapping directly onto the new config object before calling `this._dispatchChange(newConfig)`. For `sf-editor-chips` (sources), handle `type: 'add'` and `type: 'remove'`.

---

## Anti-patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **`window` event binding for pointer drag** | Binding `pointermove`/`pointerup` on `window` is a fragile workaround. On mobile (touch), `pointercancel` fires when the finger drifts off the SVG and the drag stops mid-gesture. | Use `svgElement.setPointerCapture(event.pointerId)` on `pointerdown`. Bind `pointermove`, `pointerup`, `pointercancel` on the **SVG element** itself. Release capture in `pointerup`/`pointercancel`. Clean up in `disconnectedCallback()`. |
| 2 | **Dynamic script injection for slider libraries** | Importing a third-party gauge or dial library via dynamic `import()` at runtime. | Direct mathematical trigonometry (`Math.atan2`) with DOM→SVG coordinate conversion in pure TypeScript. Keeps bundle `<30KB`. |
| 3 | **Uncontrolled volume service flooding** | Calling `volume_set` on every `pointermove` event without rate-limiting. | Implement time throttling of `80ms` — at most one `volume_set` call per 80ms window during active drag. |
| 4 | **Ignoring disconnected/turn-off states** | Sending commands or rendering an active dial when TV state is `off` or `unavailable`. | Draw the dial in dim grey/red with "OFFLINE" label. Disable all interactive elements (D-pad, hex sources). |
| 5 | **Inline CSS duplicated styles** | Copy-pasting color tokens or layout rules into this card's `styles.ts`. | Extend `SciFiBaseCard` and import shared styles from `common.ts`. |
| 6 | **Uppercase D-pad command strings** | Using `"UP"`, `"DOWN"` etc. — incorrect casing for Bravia integration. | Use PascalCase: `"Up"`, `"Down"`, `"Left"`, `"Right"`, `"Confirm"`, `"Back"`, `"Home"`, `"Menu"` (see Interaction §2 command table). |
| 7 | **Open `Record<string, LovelaceAction>` for custom_actions** | Accepting any string key allows runtime errors when an invalid button name is passed. | Type-narrow to `SciFiTVCustomActions` with 8 explicit optional keys. Use `custom_actions?.[btn as keyof SciFiTVCustomActions]` — TypeScript enforces valid keys at compile time. |

---

## Test Cases

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| **TC-701** | Unit | Throws error when mandatory `entity` is missing | Config with no `entity` parameter | Throws config validation error |
| **TC-702** | Unit | D-pad default remote command uses PascalCase | Click D-pad Up | Calls `remote.send_command` with `"Up"` (not `"UP"`) |
| **TC-703** | Unit | Custom actions override default remote commands | D-pad Home click with `custom_actions.home` defined | Triggers custom `tap_action` script — `remote.send_command` not called |
| **TC-704** | Unit | Hex grid renders all configured source names | Sources: `['HDMI 1', 'Netflix']` | Renders two quick source hexagons |
| **TC-705** | Unit | `getRelevantEntities` returns TV and remote entities | Valid card config | Array of both entity IDs |
| **TC-706** | Unit | Angle clamp: pointer in dead-zone snaps to nearest edge | `pointermove` at bottom center (270° shifted) | `volumeLevel = 1.0` (clamped, not NaN / >1.0) |
| **TC-707** | Unit | Coordinate conversion: DOM px correctly maps to SVG viewBox | `pointermove` at DOM center of rendered SVG | Computed `svgX ≈ 100`, `svgY ≈ 100` regardless of render size |
| **TC-708** | Unit | Orbiting planet satellite is rendered when TV is on | TV state is `'on'` | Planet orbiting satellite element exists in shadowRoot |
| **TC-709** | Unit | Orbiting planet satellite is not rendered when TV is off | TV state is `'off'` | Planet orbiting satellite element does not exist in shadowRoot |
| **IT-701** | Integration | Custom elements register correctly in HA registry | Load built bundle | Elements `sci-fi-tv` and `sci-fi-tv-editor` exist |
| **IT-702** | Integration | Workbench — Netflix active mock state renders dial at 35% | Workbench mock state `netflix_active` | Volume dial arc covers 35% of full arc; source label "Netflix" highlighted |
| **IT-703** | Integration | Dragging orbital dial calls correct service volume | Pointer dragging to 60% position | Calls `media_player.volume_set` with `volume_level: 0.6` |
| **IT-704** | Integration | Volume throttle: 10 rapid `pointermove` events → ≤2 `callService` calls | Fire 10 events over 50ms | `callService` called ≤2 times (80ms throttle window) |

---

## External API Contract

| Service | Official Docs | Format | Status |
|---|---|---|---|
| `remote.send_command` | [HA remote integration](https://www.home-assistant.io/integrations/remote/) | `entity_id: string, command: string` | [unverified — assumed 2026-05-29] PascalCase commands for Bravia. Verify via HA logbook before first HA deployment. |
| `media_player.volume_set` | [HA media_player](https://www.home-assistant.io/integrations/media_player/#action-media_playervolume_set) | `entity_id: string, volume_level: float [0.0–1.0]` | [verified] Standard HA service. |
| `media_player.select_source` | [HA media_player](https://www.home-assistant.io/integrations/media_player/#action-media_playerselect_source) | `entity_id: string, source: string` | [verified] Standard HA service. |

---

## Workbench Mock States

Derive entity IDs verbatim from `yaml backup/` — never invent IDs (L027).

| State Name | `media_player.bravia_4k_vh22` state | Key attributes | `remote.bravia_4k_vh22` state |
|---|---|---|---|
| **tv_off** | `off` | `volume_level: 0.0`, `source: null`, `media_title: null` | `off` |
| **netflix_active** | `on` | `volume_level: 0.35`, `source: 'Netflix'`, `media_title: 'Stranger Things'` | `on` |
| **youtube_active** | `on` | `volume_level: 0.5`, `source: 'YouTube'`, `media_title: 'Tech Review'` | `on` |
| **tv_unavailable** | `unavailable` | — | `unavailable` |

---

## Error Handling

| Error/Failure | Detection | Response | Fallback |
|---|---|---|---|
| Missing `entity` | Config validator `__validateConfig()` | Throw validation error | `SciFiBaseCard` handles crash → displays Red Error card |
| Entity `unavailable` | State matches `unavailable` or `unknown` | Draw yellow radar telemetry caution, disable all buttons | Visual alert label "TACTICAL BRIDGE DISCONNECTED" |
| TV Power is `off` | State matches `off` | Dim HUD to `rgba(255, 255, 255, 0.1)`, glow power red; volume arc: 3° minimum at 20% opacity | Standby screen showing offline status |
| `remote.send_command` fails | HA service call `catch` block | `sf-toast` notification — message: "Remote command failed" | Toast UI error overlay; no retry |
