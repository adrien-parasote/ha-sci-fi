/**
 * Config types for the sci-fi-lights card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiEntityOverride {
  readonly name?: string;
  readonly icon_on?: string;
  readonly icon_off?: string;
}

export interface SciFiLightsConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-lights';
  readonly default_icon_on?: string;
  readonly default_icon_off?: string;
  readonly first_floor_to_render?: string;
  readonly first_area_to_render?: string;
  readonly ignored_entities?: readonly string[];                             // ADR-005: was ignored_entity_ids
  readonly custom_entities?: Readonly<Record<string, SciFiEntityOverride>>; // ADR-005: was entity_overrides
}
