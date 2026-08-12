/**
 * Config types for the sci-fi-hexa-tiles card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig, ActionConfig } from '../../types/config.js';

export interface SciFiHexaTilesWeatherConfig {
  readonly activate?: boolean;
  readonly weather_entity: string;           // ADR-005: was weather_entity_id in v1.0.0-wip
  readonly weather_alert_entity?: string;    // ADR-005: was weather_alert_entity_id in v1.0.0-wip
  readonly link?: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

export interface SciFiHexaTileConfig {
  readonly standalone?: boolean;
  readonly entity?: string;                  // ADR-005: was entity_id in v1.0.0-wip
  readonly entity_kind?: string;             // domain type: light, climate, vacuum...
  readonly entities_to_exclude?: readonly string[];
  readonly active_icon?: string;             // ADR-005: was icon in v1.0.0-wip
  readonly inactive_icon?: string;           // ADR-005: missing in v1.0.0-wip
  readonly name?: string;
  readonly state_on?: readonly string[];     // states considered active
  readonly state_error?: string;
  readonly link?: string;                    // navigation path (e.g. 'lights')
  readonly visibility?: readonly string[];   // person entity IDs
  readonly tap_action?: ActionConfig;
  readonly hold_action?: ActionConfig;
  readonly double_tap_action?: ActionConfig;
}

export interface SciFiHexaTilesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-hexa-tiles';
  readonly weather?: SciFiHexaTilesWeatherConfig;
  readonly tiles?: readonly SciFiHexaTileConfig[];
}
