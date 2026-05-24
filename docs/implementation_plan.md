# Hexagonal Dashboard Card Layout & Layout Fixes

This implementation plan details the strategy and specification for refactoring the `sci-fi-hexa-tiles` card to resolve layout and functional issues, including interlocking hexagons, user header with avatar picture and status badge, centered icons, custom SVG-based borders, and correct case-insensitive weather alerts.

## User Review Required

> [!IMPORTANT]
> **Fixed Dimensions**: All hexagons will be rendered with a fixed size of `78px` width and `96px` height across all devices (mobile, tablet, desktop). This ensures they fit perfectly in 4 columns on mobile portrait without wrapping or overflow.
> **No clip-path**: We will replace the modern CSS `clip-path` hexagon implementation with inline SVGs containing `<polygon>` elements, which allows drawing crisp glowing neon borders that are not clipped.
> **Weather Alert Green State**: The weather alert banner is completely hidden when the alert level is green (e.g. `'Vert'`).

## Proposed Changes

### Hexagonal Tiles Card

#### [MODIFY] [sci-fi-hexa-tiles.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/hexa_tiles/sci-fi-hexa-tiles.ts)

- **Header Renders Profile Information**:
  - Lookup the connected person entity in `hass.states` using `person.*` where `attributes.user_id === hass.user.id`.
  - Render a gorgeous avatar circular image with blue border and glow.
  - Render an absolute-positioned status badge in the top-right of the avatar with the active zone icon.
  - Render the small, light blue welcome message (`header_message`) above the bold, white, glowing name.
- **Interlocking SVG Grid**:
  - Filter tiles array by person visibility constraint: `tile.visibility.includes(userId)`.
  - Render decorative Left/Right Half-Hexagon SVGs on the ends of odd/even rows to offset them by half a tile.
  - Pull rows vertically using `margin-bottom: calc(var(--tile-height) * -0.25)` to interlock them.
  - SVG uses viewBox `0 0 132 164` with custom `<polygon>` background and stroke.
- **Centered Icons & Text**:
  - Content elements absolutely positioned at `z-index: 2` on top of the SVG to prevent clipping.
  - Custom color/glow attributes for active states vs dark dim colors for inactive states.
- **Weather Alert Green Check**:
  - Hides the weather alert banner when the state is equal to `state_green`.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to verify that all TypeScript styles and models type-check perfectly.
- Run `npm test` to execute Vitest unit tests and integration tests.
- Re-run the deterministic spec gate check to verify conformance.

### Manual Verification
- Deploy build to Lovelace and load workbench to inspect UI across simulated desktop, iPad, and iPhone frames.
- Check active state updates (e.g. stove active vs inactive).
- Verify case-insensitive green weather alert hiding.
