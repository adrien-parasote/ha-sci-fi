# ADR-001: Full Rewrite vs Incremental Refactoring

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

8 cards, 0 tests, EOL stack (Rollup 2, es-dev-server), critical bugs, untyped architecture. The v1.0.0-wip branch had already attempted a rewrite but introduced breaking YAML changes and removed existing features.

## Decision

Full rewrite in TypeScript.

## Rationale

TypeScript strict + reproducible tests + green-field architecture. Incremental refactoring would preserve structural JS anti-patterns and accumulate migration debt.

## Consequences

- All 8 cards unavailable during migration on the `v1.0.0-wip` branch.
- `main` stays stable on v0.9.6.
- Cards delivered one by one after full test coverage per card.
