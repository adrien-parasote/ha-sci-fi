# ADR-013: Container Queries for Responsive (not Media Queries)

- **Status:** Accepted
- **Date:** 2026-06-01
- **Scope:** `sci-fi-bridge` card only

## Context

The Bridge card can be placed in a narrow column on desktop, a full-width panel on mobile, or a sidebar. Viewport-based `@media` queries cannot handle this correctly.

## Decision

Use `@container sf-card (min-width: 600px)` — not `@media`.

## Rationale

Container queries respond to the card container width, not the viewport. The card renders correctly regardless of where it is placed in the HA dashboard.

## Consequences

- `common.ts` already provides `container-type: inline-size; container-name: sf-card`. Zero additional configuration.
- Layout: `grid-template-columns: 1fr` below 600px.
- ~~`grid-template-columns: 1fr 1fr` at 600px and above.~~ **Superseded on 2026-08-12 by
  [ADR-016](ADR-016_bridge-column-flow.md)**: the wide layout is a column flow
  (`display: block; columns: 2`), which is what the code has always implemented.
  The container-query decision above is unaffected.
