# ADR-016: Bridge Wide Layout Uses Column Flow, Not a Two-Column Grid

- **Status:** Accepted
- **Date:** 2026-08-12
- **Scope:** `sci-fi-bridge` card only
- **Supersedes:** the layout clause of [ADR-013](ADR-013_container-queries.md) (`grid-template-columns: 1fr 1fr` at ≥600px). ADR-013 stands in full otherwise — container queries remain the mechanism.

## Context

ADR-013 settled *how* the Bridge card reacts to width (container queries, not media
queries) and, in passing, *what* the wide layout is: a two-column grid.

A row-flow grid places sections left-to-right, row by row. Bridge sections have very
different heights — CREW is a strip of avatars, AUTOMATIONS can be a dozen rows. In a
row-flow grid every row is as tall as its tallest cell, so a short section sitting
beside a long one leaves a visible hole under it, and the holes move as entities
appear and disappear.

`styles.ts` has implemented a column flow instead since the Bridge card shipped. The
code carried a comment crediting the choice to "ADR-B02" — an ADR that does not exist,
in a numbering scheme this repository never used. This ADR is the record that was
missing, written from what the code does; it does not change behaviour.

## Decision

At `@container sf-card (min-width: 600px)`, `.bridge-grid` leaves grid layout:

```css
display: block;
columns: 2;
column-gap: var(--sf-spacing-sm, 8px);
gap: unset;
```

with `break-inside: avoid` on the children so no section is split across the columns.

Below 600px the base rule stays `display: grid; grid-template-columns: 1fr` — one
column, unchanged from ADR-013.

## Rationale

CSS multi-column fills the left column top to bottom, then the right one. Sections
pack against each other whatever their height, so there are no holes, and the layout
stays stable as sections grow or vanish. A row-flow grid cannot do this without
JavaScript measuring every section.

The cost is ordering: reading order is down-then-across, not across-then-down. For a
dashboard of independent sections that is acceptable — and it is what users have been
looking at since the card shipped.

## Consequences

- `IT-BRIDGE-I-05` in [the Bridge spec](../specs/cards/bridge.md) asserts `columns: 2`
  inside the container query, not `grid-template-columns: 1fr 1fr`.
- ADR-014 (CREW and ACTIONS full width) still holds: those sections use
  `column-span: all` rather than a grid span.
- The phantom "ADR-B02" reference in `src/cards/bridge/styles.ts` now points here.
- Anyone restoring a row-flow grid must supersede this ADR first, and should expect
  the height holes described above.

*Written 2026-08-12 during the P14 coverage pass — bead `ha-sci-fi-zkd`.*
