# Goal Description: Creating Exhaustive Custom Lovelace Card Developer Guidelines

This plan outlines the creation of a comprehensive, highly explicit, and state-of-the-art developer reference document for designing, building, and deploying custom cards for Home Assistant. The guidelines will integrate best practices collected from the official developer documentation, the active `ha-sci-fi` project, and community-validated patterns.

---

## User Review Required

> [!IMPORTANT]
> **Document Location & Purpose**
> We propose creating the final guidelines file at [guidelines.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/cards/guidelines.md).
> This puts it right alongside the other card specifications (`hexa-tiles.md`, `plugs.md`, etc.), making it easily accessible for active developers working on custom cards.
>
> **Target Audience and Depth**
> This reference manual covers highly advanced TypeScript & Lit lifecycle optimizations (specifically addressing the `hass` rendering bottleneck), reusable HA design components, and visual editor architecture to serve as a premium engineering handbook.

---

## Open Questions

> [!NOTE]
> 1. Do you have any specific internal custom cards that should be highlighted as examples in the guide besides the existing ones (like Hexa-Tiles)?
> 2. Should we include advanced build/bundling scripts (e.g. Rollup configuration boilerplate) as part of the guide? (We will include a premium example).

---

## Proposed Changes

### Documentation Layer

#### [NEW] [guidelines.md](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/cards/guidelines.md)
- Write the comprehensive custom card developer handbook, including:
  - Architecture & bundling (TypeScript + Lit + Rollup)
  - Critical performance tuning (`shouldUpdate`, selective rendering)
  - Standard Home Assistant styling and theme variables
  - Lovelace Action integration (`handleClick` and haptic feedback)
  - Visual editor implementation (`getConfigElement`, `<ha-form>`)
  - HACS packaging & publication workflow

---

## Verification Plan

### Automated Verification
- Run a link-checking and formatting validation to ensure that all markdown tags, alert boxes, and code blocks render correctly.

### Manual Verification
- Review the created document to confirm it is exhaustive, accurate, and completely aligned with the Home Assistant developer standards.
