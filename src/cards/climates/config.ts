/**
 * Config types for the sci-fi-climates card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiClimatesHeaderConfig {
  readonly display?: boolean;
  readonly icon_winter_state?: string;      // default: mdi:thermometer-chevron-up
  readonly message_winter_state?: string;   // ADR-005: missing in v1.0.0-wip
  readonly icon_summer_state?: string;      // default: mdi:thermometer-chevron-down
  readonly message_summer_state?: string;   // ADR-005: missing in v1.0.0-wip
}

export interface SciFiStateIconsConfig {
  readonly auto?: string;   // default: sci:radiator-auto
  readonly off?: string;    // default: sci:radiator-off
  readonly heat?: string;   // default: sci:radiator-heat
}

export interface SciFiStateColorsConfig {
  readonly auto?: string;   // hex — default: #669cd2
  readonly off?: string;    // hex — default: #6c757d
  readonly heat?: string;   // hex — default: #ff7f50
}

export interface SciFiModeIconsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

export interface SciFiModeColorsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

export interface SciFiClimatesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-climates';
  readonly entities_to_exclude?: readonly string[];  // ADR-005: was excluded_entity_ids
  readonly header?: SciFiClimatesHeaderConfig;
  readonly state_icons?: SciFiStateIconsConfig;      // ADR-005: missing in v1.0.0-wip
  readonly state_colors?: SciFiStateColorsConfig;    // ADR-005: missing in v1.0.0-wip
  readonly mode_icons?: SciFiModeIconsConfig;        // ADR-005: missing in v1.0.0-wip
  readonly mode_colors?: SciFiModeColorsConfig;      // ADR-005: missing in v1.0.0-wip
}
