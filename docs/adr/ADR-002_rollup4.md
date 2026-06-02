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
- `@rollup/plugin-replace` injects compile-time constants: `__DEV__` (true in dev/test, false in prod) and `__VERSION__` (from `package.json`). Both must be declared in `src/types/globals.d.ts` for TypeScript and in `vitest.config.ts` `define` block for tests.
- **Critical:** Any global patch of `customElements.define` MUST be guarded by `if (__DEV__)`. HA uses a scoped custom element registry (`scoped-custom-element-registry.ts`) in `hui-card-picker`. A global interceptor sees elements as "already defined" in the global registry and skips scoped registration → cards become invisible to the card picker UI ("Custom element not found"). Terser dead-code-eliminates the `if (__DEV__)` block entirely in production (zero overhead).

