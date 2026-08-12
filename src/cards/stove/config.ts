/**
 * Config types for the sci-fi-stove card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiStoveSensors {
  readonly sensor_actual_power?: string;
  readonly sensor_combustion_chamber_temperature?: string;
  readonly sensor_inside_temperature?: string;    // ADR-005: missing in v1.0.0-wip
  readonly sensor_pellet_quantity?: string;
  readonly sensor_power?: string;                 // ADR-005: missing in v1.0.0-wip
  readonly sensor_status?: string;                // ADR-005: missing in v1.0.0-wip (binary_sensor)
  readonly sensor_fan_speed?: string;             // ADR-005: missing in v1.0.0-wip
  readonly sensor_pressure?: string;              // ADR-005: missing in v1.0.0-wip
  readonly sensor_time_to_service?: string;       // ADR-005: missing in v1.0.0-wip
}

export interface SciFiStoveConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-stove';
  readonly entity: string;                        // ADR-005: was entity_id
  readonly sensors?: SciFiStoveSensors;
  readonly storage_counter?: string;              // ADR-005: missing in v1.0.0-wip (counter entity)
  readonly pellet_quantity_threshold?: number;    // ADR-005: missing in v1.0.0-wip (range [0,1])
  readonly storage_counter_threshold?: number;    // ADR-005: missing in v1.0.0-wip (range [0,1])
}
