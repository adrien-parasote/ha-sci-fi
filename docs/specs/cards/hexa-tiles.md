# sci-fi-hexa-tiles Schema

### sci-fi-hexa-tiles

```typescript
interface SciFiHexaTilesWeatherConfig {
  readonly activate?: boolean;
  readonly weather_entity: string;          // ← "weather_entity" (PAS weather_entity_id)
  readonly weather_alert_entity?: string;   // ← "weather_alert_entity" (PAS weather_alert_entity_id)
  readonly link?: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

interface SciFiHexaTileConfig {
  readonly standalone?: boolean;
  readonly entity?: string;                 // ← "entity" (PAS entity_id) — pour tiles standalone
  readonly entity_kind?: string;            // type domaine (light, climate, vacuum...)
  readonly entities_to_exclude?: readonly string[];
  readonly active_icon?: string;
  readonly inactive_icon?: string;
  readonly name?: string;
  readonly state_on?: readonly string[];    // états considérés actifs
  readonly state_error?: string;
  readonly link?: string;                   // navigation (ex: "lights")
  readonly visibility?: readonly string[];  // person entity IDs
}

interface SciFiHexaTilesConfig {
  readonly header_message?: string;
  readonly weather?: SciFiHexaTilesWeatherConfig;
  readonly tiles?: readonly SciFiHexaTileConfig[];
}
```

**Exemple de config validée (backup production) :**
```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Hey, welcome back !"
weather:
  activate: true
  weather_entity: weather.la_chapelle_sur_erdre
  weather_alert_entity: sensor.44_weather_alert
  link: weather
  state_green: Vert
tiles:
  - standalone: true
    entity: climate.clou
    active_icon: sci:stove-heat
    inactive_icon: sci:stove-off
    name: Poêle
    state_on: [cool, heat]
    link: stove
```


# Spec 07 — Hexagonal Dashboard Card Fixes

> Document Type: Implementation
> Covers: Hexagonal card layout, header, interlocking, active/inactive styling, icons, weather alert, and fixed responsiveness.
> Depends on: [Spec 03](./03_base_classes.md#L1), [Spec 04](./04_components.md#L1), [Spec 05](./05_cards.md#L1)

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | The connected user can be identified in HA by matching a `person.*` entity whose `attributes.user_id` is equal to `hass.user.id`. | Low | → Confirmed by Home Assistant developer guidelines for user-to-person associations. |
| 2 | Home Assistant zones contain the `persons` attribute containing a list of person entity IDs (e.g. `['person.adrien']`). | Low | → Confirmed by HA native zone schema. |
| 3 | The card is loaded in a standard Lovelace context where `this.hass.states` is fully populated. | Low | → Standard HA card lifecycle behavior. |

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-HEX-01 | User header with picture, status badge, message, and name | ✅ Section [User Header](#user-header) |
| F-HEX-02 | Interlocking rows grid with offset margins and decorative side half-tiles | ✅ Section [Interlocking Hexagon Grid](#interlocking-hexagon-grid) |
| F-HEX-03 | Custom SVG-based active/inactive border and background styling | ✅ Section [Hexagon Design and Styling](#hexagon-design-and-styling) |
| F-HEX-04 | Visible and centered custom icons in tiles | ✅ Section [Tile Content & Icons](#tile-content--icons) |
| F-HEX-05 | Weather alert visibility band logic (hidden on green) | ✅ Section [Weather Alert Banner](#weather-alert-banner) |
| F-HEX-06 | Fixed dimensions on all viewport sizes (priority mobile) | ✅ Section [Fixed Dimensions & Responsiveness](#fixed-dimensions--responsiveness) |
| F-HEX-07 | Weather tile border glow matches alert severity color | ✅ Section [Weather Tile Alert Coloring](#weather-tile-alert-coloring) |
| F-HEX-08 | Alert banner label displays phenomenon names from entity attributes | ✅ Section [Weather Alert Banner](#weather-alert-banner) |

---

## User Header

The card header must display the connected user profile information:
1. **Avatar image** with a blue border and glow.
2. **Status badge** at the top-right of the avatar, displaying the icon corresponding to the user's active zone (using zone entity lookup where `persons` contains the user's entity ID).
3. **Welcome message** (e.g., "Hey, Welcome Back!") styled in small light blue/cyan text.
4. **User name** in white, bold, and larger font, with a glowing text-shadow matching the theme.

---

## Interlocking Hexagon Grid

To achieve nested, interlocking columns with a perfect checkerboard (damier) layout:
- **Even rows (Row 0, 2, 4...)** start with a decorative Left Half-Hexagon tile (`HL`, flat edge on the left, sloped on the right) and end with full hexagons.
  - Form: `1/2 (left) + cols full hexagons` (e.g. `1/2 + 2 = 2.5` hexagons on mobile).
- **Odd rows (Row 1, 3, 5...)** start with full hexagons and end with a decorative Right Half-Hexagon tile (`HR`, sloped on the left, flat edge on the right).
  - Form: `cols full hexagons + 1/2 (right)` (e.g. `2 + 1/2 = 2.5` hexagons on mobile).
- Interlocking is achieved vertically using negative margins: `margin-bottom: calc(var(--tile-height) * -0.25)` to lock them into the vertical gaps of the adjacent rows.
- Outer margins and card horizontal padding must be set to `0` to let the outer flat edges of the half-tiles touch the screen/device borders cleanly.

---

## Hexagon Design and Styling

Each hexagon uses inline SVGs (`viewBox="0 0 132 164"`) with a background polygon and a border polygon.
- **Active tile**:
  - Background polygon fill: `rgba(0, 210, 255, 0.08)`
  - Border polygon stroke: `var(--sf-primary)` (`#00d2ff`), stroke-width: `2px`, filter: standard cyan drop-shadow.
  - Text color: `var(--sf-primary)` (`#00d2ff`) with a glowing text-shadow.
- **Inactive tile**:
  - Background polygon fill: `rgba(16, 22, 38, 0.6)`
  - Border polygon stroke: `rgba(224, 232, 255, 0.1)`, stroke-width: `1.5px`.
  - Text color: `rgba(224, 232, 255, 0.4)`.

## Tile Content & Icons

- Hexagon `<sf-icon>` elements are sized uniformly to `56px` width and height.
- **Weather Tile**: Dynamically resolves custom animated weather icons via the `sf:` namespace (e.g. `sf:partlycloudy-day`) rather than static `mdi:` icons. This ensures seamless integration with the existing 'sf-weather-icons.js' Lit SVG templates. Active weather tiles receive a specific yellow drop-shadow (`#ffd60a`).
- **Avatar Status Badge**: Positioned at the top-right of the avatar with `26px` width/height and `22px` icons, with no circular background block behind it, to ensure it visually floats over the avatar border.

---

## Weather Alert Banner

The weather alert band is displayed only when the alert state is NOT green.
- If state matches `state_green` (case-insensitive), the alert is completely hidden.

### Alert Level Detection

`_getAlertLevel()` maps the entity `state` to a level string (`green` / `yellow` / `orange` / `red`) by comparing it (case-insensitive) against the configured `state_yellow`, `state_orange`, `state_red` values (defaults: `jaune`, `orange`, `rouge`).

### Alert Label — Phenomenon Name from Entity Attributes

The label displayed after `Alerte météo :` is **not** the entity `state` (which is the color code, e.g., `"Jaune"`). It is derived from the **entity attributes** using the same logic as `sci-fi-weather`:

1. Collect the set of non-green level values (state_yellow / state_orange / state_red, lowercased).
2. Iterate `Object.keys(alertEntity.attributes)` — each key is a phenomenon name (e.g., `"canicule"`, `"vent"`).
3. Keep keys whose attribute value (lowercased) is in the non-green set.
4. Join matching keys with `", "` → this is the label.
5. Fallback to `alertEntity.state` if no attribute key matches.

**Result:** `⚠️ Alerte météo : canicule` instead of `⚠️ Alerte météo : Jaune`.

**Why attributes, not state:** The entity `state` is the max alert color level. The phenomenon names ("canicule", "vent", etc.) are stored as attribute keys whose values hold the corresponding color.

---

## Weather Tile Alert Coloring

When the weather tile is active (`data-active="true"`) and a non-green alert is present, the tile border glow matches the alert color:

| `data-alert-level` | Border stroke | Drop-shadow |
|--------------------|--------------|-------------|
| `yellow` | `#ffd60a` | `6px` |
| `orange` | `#ff6b35` | `6px` |
| `red` | `#ff4d6d` | `8px` (more intense) |
| `green` (default) | `var(--sf-primary, #00d2ff)` | standard |

The `data-alert-level` attribute is set on the weather tile `<div>` by `_renderWeatherTile()` via `_getAlertLevel()`. The icon color also updates to match.

**Rule of Divergence:** `_getAlertLevel()` is a single shared helper used by both `_renderWeatherTile()` and `_renderWeatherAlert()` — do not duplicate the level detection logic.

## Responsive 100% Sizing & Viewport Height Filling

Instead of fixed sizing, hexagons dynamically resize to fit exactly 100% of their parent container's width:
- **Mobile Portrait (width < 375px or default)**: Automatically uses exactly `2` columns (`2.5` hexagons per line).
- **Tablet/PC**: Dynamically calculates the maximum columns possible to fit edge-to-edge: `cols = Math.floor(width / 150 - 0.5)` (minimum `2`).
- **CSS Proportions**: The CSS calculates widths dynamically using host-level CSS custom variables:
  - `--tile-width: calc(100% / (var(--cols) + 0.5))`
  - `--tile-height: calc(var(--tile-width) * 1.1547)` (mathematically perfect 1.1547 aspect ratio).
- **Viewport Height Filling**: The card calculates how many rows are needed to completely fill the screen viewport height. If there are fewer tiles than rows needed to fill the screen, it pads the grid with empty inactive placeholder hexagons. If there are more tiles, the card naturally scrolls.
- **ResizeObserver**: Sizing calculations are observed relative to the element's actual layout width (using `ResizeObserver`), ensuring consistent, beautiful proportions in iframe dashboard grids, sidebar panels, and workbench simulators.

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Preserve all configuration contracts from Spec 05, use property binding for sf-icon, filter tiles by person visibility, set `--cols` directly on the host style declaration. |
| **Ask first** | Add any external JS packages. |
| **Never do** | Use CSS `clip-path` for rendering hexagon borders, modify host styles inside the Custom Element constructor, rename or remove any config properties. |

---

## Cross-Spec Contracts

 ### Produces
| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `sci-fi-hexa-tiles` | Custom Element | This spec | HA Lovelace Dashboard |

 ### Consumes
| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `SciFiBaseCard` | Class | `src/utils/base-card.ts` | Spec 03 |
| `<sf-icon>` | Component | `src/components/sf-icon/sf-icon.ts` | Spec 04 |
| `sciFiCommonStyles` | CSS | `src/styles/common.ts` | Spec 03 |

 ### Public Interface
| Element | Signature | Description |
|---|---|---|
| `sci-fi-hexa-tiles` | Custom Element | Lovelace card — no JS public API exposed |
| `setConfig(config)` | `(config: SciFiHexaTilesConfig) => void` | Called by HA to configure the card |
| `getCardSize()` | `() => number` | Returns layout size hint to Lovelace |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Using CSS `clip-path` for hexagon borders** | Standard borders are clipped, making it impossible to render glowing or custom borders. | Use inline SVG polygons with perfect vector styling. |
| 2 | **Using window.innerWidth for grid calculations** | In dashboard grids or simulator containers, the window is wider than the card, causing squeezed rows. | Use `ResizeObserver` to observe actual card layout width. |
| 3 | **Displaying green weather alert banner** | Screen clutter when weather alert is green. | Completely hide the weather alert banner when level is green. |
| 4 | **Swallowing or ignoring icon property updates** | Static attribute binding doesn't update when icon state changes. | Use dynamic property binding `.icon="${icon}"` on `<sf-icon>`. |
| 5 | **Monolithic or manual grid positioning** | Absolute positioning of tiles requires complex JS coordinate math. | Use flex rows with decorative half-hexagons and negative margin vertical overlap. |
| 6 | **Setting style properties inside the constructor** | Setting style properties inside custom element constructors blocks element upgrades and throws DOMExceptions. | Set styles/custom properties safely in `connectedCallback` or `willUpdate`. |
| 7 | **Using entity `state` as the alert banner label** | Entity state is the color level ("Jaune"), not the phenomenon name. Displaying it gives no user-readable context. | Read `Object.keys(alertEntity.attributes)` filtered by non-green values to get phenomenon names ("canicule", "vent"). |
| 8 | **Duplicating `_getAlertLevel()` logic** | Two independent copies diverge silently: banner and tile show different levels. | Always call the single shared `_getAlertLevel()` helper from both `_renderWeatherAlert()` and `_renderWeatherTile()`. |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-701 | Unit | User header correctly identifies connected person | HASS states with matching `user_id` | Renders user picture, welcome message, and name |
| TC-702 | Unit | Status badge shows active zone icon | Person associated with a zone entity | Status badge renders correct zone icon |
| TC-703 | Unit | Weather alert hidden when green | Alert state = "Vert" | Alert banner is not rendered in the DOM |
| TC-704 | Unit | Interlocking rows structured with half-hexagons | 6 tiles configured (portrait) | Row 0 starts with Left Half-Hexagon (`HL`), Row 1 ends with Right Half-Hexagon (`HR`). Total 5 rows padded. |
| TC-705 | Unit | Active vs Inactive tiles have correct data-active attributes | Tiles with active and inactive states | Active tile has `data-active="true"`, inactive has `data-active="false"` |
| TC-706 | Unit | Alert banner shows phenomenon name from entity attributes | Alert entity with `attributes.canicule = 'Jaune'`, state_yellow = 'Jaune' | Banner renders `Alerte météo : canicule` |
| TC-707 | Unit | Alert banner fallback to state when no attribute matches | Alert entity with state = 'orange', no matching attribute keys | Banner renders `Alerte météo : orange` |
| TC-708 | Unit | Weather tile `data-alert-level` set from alert entity state | Alert entity state = 'Jaune', state_yellow = 'Jaune' | Weather tile div has `data-alert-level="yellow"` |
| TC-709 | Unit | Weather tile `data-alert-level` defaults to green when no alert entity | No `weather_alert_entity` configured | Weather tile div has `data-alert-level="green"` |
| IT-701 | Integration | Entire grid interlocking behaves correctly on mobile portrait | Mobile viewport width 375px | Renders 2 columns (2.5 hexagons) taking exactly 100% card width with no gaps |
| IT-702 | Integration | Icons and text glow is rendered when tiles are active | Active switch tile config | Rendered SVG border and text-shadow reflect CSS shadow styles |
| IT-703 | Integration | Home Assistant theme variables are applied dynamically | Dynamic state and theme updates | Elements pick up `--sf-primary` correctly |

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Connected user not found | No `person.*` entity matches `hass.user.id` | Display `hass.user.name` in header | Initials from user name, default home icon |
| User picture missing | `entity_picture` attribute is null or undefined | Render name initials inside circle | First letter of friendly name |
| Zone icon not found | Zone entity has no `icon` attribute | Fallback to home/away default icon | `mdi:home` or `mdi:home-off-outline` |


## Adversarial Fixes: Responsive Layout
**Responsive Wrap Behavior**: The layout MUST use `flex-wrap: wrap` and maintain a fixed tile width (e.g., 80px) so that when more tiles are configured than fit horizontally, they wrap gracefully to a new row rather than shrinking or overflowing.
