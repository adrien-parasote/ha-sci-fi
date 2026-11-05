/**
 * Config types for the sci-fi-stove card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

/**
 * Alert thresholds the card applies when the YAML omits them.
 *
 * Exported because the editor's sliders must start on the SAME value the card
 * uses: bead ha-sci-fi-4h4 (ST-29) found four different defaults for
 * `pellet_quantity_threshold` — docs 0.5, the card 0.1, the slider 0.2 — so the
 * literal lives here once and both consumers read it.
 */
export const STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT = 0.1;
export const STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT = 0.1;

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
  readonly sensor_door?: string;                  // core fumis binary_sensor.*_door (stove-diagnostics)
  readonly sensor_alert?: string;                 // core fumis sensor.*_alert (enum, `none` when quiet)
  readonly sensor_error?: string;                 // core fumis sensor.*_error (enum, raw code in attributes.code)
}

export interface SciFiStoveConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-stove';
  readonly entity: string;                        // ADR-005: was entity_id
  readonly sensors?: SciFiStoveSensors;
  readonly storage_counter?: string;              // ADR-005: missing in v1.0.0-wip (counter entity)
  readonly switch_eco_mode?: string;              // core fumis: eco is a switch, not a climate preset
  readonly number_power_level?: string;           // core fumis number.*_power_level, or an input_number
  readonly number_fan_speed?: string;             // core fumis number.*_fan_speed (disabled by default in HA), or an input_number
  readonly pellet_quantity_threshold?: number;    // ADR-005: missing in v1.0.0-wip (range [0,1])
  readonly storage_counter_threshold?: number;    // ADR-005: missing in v1.0.0-wip (range [0,1])
}
