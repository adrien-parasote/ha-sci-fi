# ADR-009: Unified Card Structure and Stylesheet Urbanization

- **Status:** Accepted
- **Date:** 2026-05-15

## Context

Inconsistencies in directory names (mix of snake_case/kebab-case) and CSS styles declared inline in the render function for 3 cards (`lights`, `weather`, `hexa_tiles`).

## Decision

Adopt a strictly standardized directory tree for cards, rename `hexa_tiles` to `hexa-tiles`, and move all inline CSS into standalone `styles.ts` files.

## Rationale

Urbanization and cohesion ease maintenance and future card portability.

## Consequences

- `styles.ts` created for all cards.
- Associated directories renamed in `src/` and `tests/`.
- `.sentrux/rules.toml` unaffected — uses recursive glob patterns.
