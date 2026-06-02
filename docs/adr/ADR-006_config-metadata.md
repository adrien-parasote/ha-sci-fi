# ADR-006: config-metadata.ts Kept (not replaced by zod)

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

The v1.0.0-wip branch replaced `config-metadata` with simple TypeScript interfaces in `types/config.ts`, losing dynamic validation and the HA editor.

## Decision

Migrate `config-metadata` to typed TypeScript. Do not replace with zod.

## Rationale

`config-metadata` does 3 things simultaneously: (1) validates YAML config, (2) applies default values, (3) drives the HA editor UI. These 3 responsibilities are intrinsically tied to the schema. zod would handle (1) but not (2)+(3) without duplication. Bundle cost: ~45KB saved by not adding zod.

## Consequences

- `config-metadata.ts` migrated to TypeScript with strict types for `type`, `mandatory`, `default` values.
- The HA editor continues to be driven by this declarative schema.
