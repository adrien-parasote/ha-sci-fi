# ADR-002: Rollup 4 (not Vite)

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

HA custom cards require a single-file IIFE bundle. Vite natively generates ES modules for SPAs.

## Decision

Rollup 4.

## Rationale

Rollup is the community standard (boilerplate-card, Mushroom, Bubble Card). The 2→4 migration is documented and simple. Vite + IIFE requires non-standard configuration.

## Consequences

- Dev server = `@web/dev-server`. Acceptable.
- No Vite HMR — workbench reloads on build.
