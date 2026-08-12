/**
 * Config types for the sci-fi-water-management card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiWaterManagementConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-water-management';
  readonly filter_label?: string;          // HA label used to find water entities (default: 'water')
  readonly first_floor_to_render?: string;
  readonly ignored_entities?: readonly string[];
  readonly default_icon?: string;
}
