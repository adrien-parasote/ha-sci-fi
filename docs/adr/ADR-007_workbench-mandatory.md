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

- Every change must be tested manually in both Mock and Live mode in `dev/workbench.html` before shipping.
- **Exact server command** (run from project root, not from `dev/`):
  ```bash
  npm run dev &          # rollup watch — rebuilds dist/sci-fi.min.js on save
  npx serve@14 . -p 8888 # static server — must be serve@14, from project root
  ```
  Then open: `http://localhost:8888/dev/workbench.html`
  > ⚠️ `python3 -m http.server` and `npx serve --single` do NOT work — the workbench JS rewrites the URL to `/dev/workbench` (no `.html`) which requires serve@14's directory-listing fallback to resolve correctly.
- This is enforced by the release process: see [docs/release-process.md](../release-process.md).
