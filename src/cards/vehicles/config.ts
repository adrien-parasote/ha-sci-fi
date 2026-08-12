/**
 * Config types for the sci-fi-vehicles card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiVehicleEntry {
  readonly id: string;
  readonly name: string;
  readonly charging?: string;
  readonly lock_status?: string;
  readonly location?: string;
  readonly battery_autonomy?: string;          // ADR-005: was range (partial)
  readonly fuel_autonomy?: string;             // ADR-005: was range (partial)
  readonly battery_level?: string;
  readonly location_last_activity?: string;    // ADR-005: missing in v1.0.0-wip
  readonly charge_state?: string;              // ADR-005: missing in v1.0.0-wip
  readonly plug_state?: string;                // ADR-005: missing in v1.0.0-wip
  readonly mileage?: string;
  readonly fuel_quantity?: string;             // ADR-005: missing in v1.0.0-wip
  readonly charging_remaining_time?: string;   // ADR-005: missing in v1.0.0-wip
}

export interface SciFiVehiclesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-vehicles';
  readonly vehicles: readonly SciFiVehicleEntry[];
}
