# ADR-004: Domain-First Tests (not E2E)

- **Status:** Accepted
- **Date:** 2026-05-01
- **Amended:** 2026-06-02 — stack corrected from `@web/test-runner` to Vitest

## Context

Testing inside a real HA instance requires a dedicated devcontainer and complex fixtures. The initial plan used `@web/test-runner` + `@open-wc/testing`, but during BUILD the stack was migrated to **Vitest** with happy-dom for performance, better DX, and Vite-compatible config.

## Decision

**Vitest** + **happy-dom** for domain + component tests. No E2E tests in real HA.

```bash
npx vitest run           # full suite
npx vitest run --coverage  # with coverage report
npx tsc --noEmit         # typecheck (Vitest does NOT typecheck)
```

## Rationale

- 80% of test value is in the domain model (pure TS, testable without a browser).
- Lit components are tested via Vitest + happy-dom with mocked `hass` objects.
- happy-dom is faster than real Chromium for headless CI runs.
- Vitest integrates natively with the project's build tooling.

## Consequences

- Real network interactions (`callService`) are not tested. Acceptable for personal use.
- `tests/setup.ts` globally mocks Canvas API and silences Lit dev warnings.
- `npx tsc --noEmit` MUST be run in addition to `vitest` — Vitest does not typecheck.
- See CODEMAPS: Test Coverage section for current pass rates and thresholds.
