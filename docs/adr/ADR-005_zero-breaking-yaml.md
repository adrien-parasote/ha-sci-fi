# ADR-005: Zero Breaking YAML Changes ⚠️ CRITICAL

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

The v1.0.0-wip branch renamed 8 YAML fields and removed entire features, breaking production dashboards.

## Decision

No YAML config field may be renamed or removed.

## Rationale

YAML field names are a **public contract** between the cards and user dashboards. Changing these names silently breaks existing configurations. Personal use does not mean "no migration cost" — on the contrary, there is no team to absorb that cost.

**Source of truth:** `docs/research/discovery.md` §2 (exhaustive inventory) + `src/cards/*/config-metadata` v0.9.6.

**Validation rule:** Before each PR, diff TypeScript fields in `src/types/config.ts` against `docs/research/discovery.md` §2. Any missing or renamed field blocks the merge.

## Consequences

- No MIGRATION.md required (no breaking changes).
- `config-metadata.ts` migrated to TS but schema unchanged.
- If a field MUST change → new major version (v2.0.0) with MIGRATION.md and a deprecation period.
