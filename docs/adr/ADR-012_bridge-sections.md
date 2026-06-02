# ADR-012: Independent Section Components

- **Status:** Accepted
- **Date:** 2026-06-01
- **Scope:** `sci-fi-bridge` card only

## Context

The Bridge Overview card needs to display 8 distinct sections (crew, alerts, access, automations, appliances, stove, vehicle, actions). The question is whether to implement this as one monolithic `render()` or as independent Lit components.

## Decision

Each section is a dedicated Lit `@customElement` component.

## Rationale

- Individual testability per section.
- Targeted `shouldUpdate()` per section — only the relevant section re-renders on entity change.
- Extensibility without touching the main card.

## Consequences

- 8 section components: `sf-bridge-crew`, `sf-bridge-alerts`, `sf-bridge-access`, `sf-bridge-automations`, `sf-bridge-appliances`, `sf-bridge-stove`, `sf-bridge-vehicle`, `sf-bridge-actions`.
- 1 orchestrator card: `sci-fi-bridge`.
- Each component < 200 lines.
