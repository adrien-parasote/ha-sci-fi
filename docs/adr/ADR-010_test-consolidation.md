# ADR-010: Consolidated Unit Test Suites

- **Status:** Accepted
- **Date:** 2026-05-20

## Context

The test suite grew to 64 files, unnecessarily duplicating HASS configurations and mocks across `*-extended.test.ts`, `*-new.test.ts`, and `*-design.test.ts` files.

## Decision

Merge all secondary test files into unified `sci-fi-<card>.test.ts` and `sci-fi-<card>-editor.test.ts` suites.

## Rationale

Exactly one test file per card component and one test file per editor simplifies local Vitest execution and re-runs.

## Consequences

- Full restructuring and regrouping in `tests/cards/`.
- Zero dropped assertions — baseline run before and after each merge to guarantee.
