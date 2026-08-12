/**
 * Config types for the sci-fi-vacuum card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiVacuumSensors {
  readonly map?: string;
  readonly battery?: string;
  readonly mop_intensite?: string;               // ADR-005: was mop_intensity (FR spelling preserved)
  readonly current_clean_area?: string;
  readonly current_clean_duration?: string;
}

export interface SciFiVacuumShortcutDescription {
  readonly icon?: string;
  readonly name: string;
  readonly segments: readonly number[];
}

export interface SciFiVacuumShortcuts {
  readonly service?: string;    // HA service name (e.g. 'vacuum.send_command')
  readonly command?: string;    // command param (e.g. 'app_segment_clean')
  readonly description?: readonly SciFiVacuumShortcutDescription[];
}

export interface SciFiVacuumEntry {
  readonly entity: string;               // ADR-005: was entity_id
  readonly start?: boolean;
  readonly pause?: boolean;
  readonly stop?: boolean;
  readonly return_to_base?: boolean;
  readonly set_fan_speed?: boolean;
  readonly sensors?: SciFiVacuumSensors;
  readonly shortcuts?: SciFiVacuumShortcuts;  // ADR-005: missing in v1.0.0-wip
}

export interface SciFiVacuumConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-vacuum';
  readonly vacuums: readonly SciFiVacuumEntry[];
}
