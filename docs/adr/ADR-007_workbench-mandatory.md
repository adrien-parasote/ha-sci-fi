# ADR-007: Local Workbench Mandatory Before Production Release

- **Status:** Accepted
- **Date:** 2026-05-15

## Context

Production deployments caused visual regressions not detected by headless unit tests.

## Decision

Using the local workbench (`dev/workbench.html`) is mandatory for all visual validation before any release.

## Rationale

LitElement relies on a complex async render cycle and injected CSS styles that can behave differently in HA. Systematic visual validation in a workbench simulating dynamic entities is essential.

## Consequences

- Every change must be tested manually in both Mock and Live mode in `dev/workbench.html` via `npx serve .` before shipping.
- This is enforced by the release process: see [docs/release-process.md](../release-process.md).
