/**
 * Config types for the sci-fi-plugs card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiPlugSensorEntry {
  readonly show?: boolean;
  readonly name?: string;
  readonly power?: boolean;  // true = this is the power consumption sensor (for graph)
  readonly icon?: string;
}

export interface SciFiPlugDevice {
  readonly device_id: string;
  readonly entity_id: string;
  readonly name?: string;
  readonly active_icon?: string;    // default: mdi:power-socket-fr
  readonly inactive_icon?: string;  // default: sci:power-socket-fr-off
  // ADR-005: sensors = dict keyed by entity_id (NOT {power: string, energy: string})
  readonly sensors?: Readonly<Record<string, SciFiPlugSensorEntry>>;
}

export interface SciFiPlugsConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-plugs';
  readonly devices?: readonly SciFiPlugDevice[];
}
