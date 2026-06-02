# ADR-014: CREW and ACTIONS Sections Always Full Width

- **Status:** Accepted
- **Date:** 2026-06-01
- **Scope:** `sci-fi-bridge` card only

## Context

The Bridge card uses a 2-column grid on wide viewports. The question is whether all sections should follow this grid or some should span the full width.

## Decision

CREW (presence) and ACTIONS (generic buttons) always use `grid-column: 1 / -1` — full width regardless of viewport.

## Rationale

- CREW is the most important section (immediate readability of who is home).
- ACTIONS groups quick-action shortcuts that need full width to align as an adaptive button grid.

## Consequences

- Both sections rendered first and last in the grid respectively.
- All other sections follow the 1fr / 1fr two-column layout.
