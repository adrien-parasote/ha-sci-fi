# Spec 07 — Hexagonal Dashboard Card Fixes

> Document Type: Implementation
> Covers: Hexagonal card layout, header, interlocking, active/inactive styling, icons, weather alert, and fixed responsiveness.
> Depends on: [Spec 03](./03_base_classes.md#L1), [Spec 04](./04_components.md#L1), [Spec 05](./05_cards.md#L1)

---

## Assumptions

| # | Assumption | Risk | Validation |
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
  - Text color: `#ffffff` with a glowing text-shadow.
- **Inactive tile**:
  - Background polygon fill: `rgba(16, 22, 38, 0.6)`
  - Border polygon stroke: `rgba(224, 232, 255, 0.1)`, stroke-width: `1.5px`.
  - Text color: `rgba(224, 232, 255, 0.4)`.

---

## Weather Alert Banner

The weather alert band is displayed only when the alert state is NOT green.
- If state matches `state_green` (case-insensitive), the alert is completely hidden.

---

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

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-701 | Unit | User header correctly identifies connected person | HASS states with matching `user_id` | Renders user picture, welcome message, and name |
| TC-702 | Unit | Status badge shows active zone icon | Person associated with a zone entity | Status badge renders correct zone icon |
| TC-703 | Unit | Weather alert hidden when green | Alert state = "Vert" | Alert banner is not rendered in the DOM |
| TC-704 | Unit | Interlocking rows structured with half-hexagons | 6 tiles configured (portrait) | Row 0 starts with Left Half-Hexagon (`HL`), Row 1 ends with Right Half-Hexagon (`HR`). Total 5 rows padded. |
| TC-705 | Unit | Active vs Inactive tiles have correct data-active attributes | Tiles with active and inactive states | Active tile has `data-active="true"`, inactive has `data-active="false"` |
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
