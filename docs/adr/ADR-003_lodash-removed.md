# ADR-003: lodash-es Removed

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

`lodash-es` was used exclusively for `isEqual` on domain objects.

## Decision

Remove `lodash-es`.

## Rationale

Lit `@state()` triggers re-render when the reference changes. If the domain object is reconstructed on every `hass` update (new object → new reference), Lit will re-render. `isEqual` is no longer needed.

## Consequences

- ~70KB removed from the bundle.
- If a performance issue arises → revisit this ADR with measurement.
