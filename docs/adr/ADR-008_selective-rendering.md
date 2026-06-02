# ADR-008: Selective Rendering via getRelevantEntities()

- **Status:** Accepted
- **Date:** 2026-05-15

## Context

Home Assistant continuously injects the full `hass` state dictionary. Without restriction, every sensor change in the house triggers a full re-render of all cards on the page.

## Decision

Implement `getRelevantEntities()` on all 11 cards to filter the `shouldUpdate` cycle.

## Rationale

Restricting the render cycle to only the entities tracked by each card's configuration eliminates CPU lag and smooths loading and animations.

## Consequences

- Each card must maintain a clean list of entities of interest derived from its config parameters.
- `getRelevantEntities()` must be audited on every card to ensure 100% coverage of rendered entities.
