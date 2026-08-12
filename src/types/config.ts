/**
 * Config KERNEL — the shape every sci-fi card config shares, plus the
 * lightweight type-guards that replace Zod (Zod = ~45KB bundle overhead, ADR-006).
 *
 * ADR-017: the per-card config interfaces used to live here, one block per card,
 * in a file 30 modules imported. They now live next to the card that owns them,
 * in `src/cards/<card>/config.ts`. Nothing card-specific belongs in this file.
 *
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/discovery.md §2 + docs/specs/05_cards.md §YAML Config Contracts.
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface SciFiBaseConfig {
  readonly type: string;
  readonly header_message?: string;
  readonly tap_action?: ActionConfig;
  readonly hold_action?: ActionConfig;
  readonly double_tap_action?: ActionConfig;
}

export interface ActionConfig {
  readonly action: string;
  readonly navigation_path?: string;
  readonly service?: string;
  readonly service_data?: Record<string, unknown>;
}

// ─── Lightweight type-guards (replaces Zod — ADR-006) ───────────────────────

export function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid config: "${field}" must be a string, got ${typeof value}`);
  }
}

export function assertDefined<T>(value: T | undefined | null, field: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Invalid config: "${field}" is required but was not provided`);
  }
}

export function isValidCardType(config: unknown): config is { type: string } {
  return (
    typeof config === 'object' &&
    config !== null &&
    'type' in config &&
    typeof (config as Record<string, unknown>)['type'] === 'string'
  );
}
