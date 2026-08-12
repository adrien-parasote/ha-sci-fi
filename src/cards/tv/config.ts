/**
 * Config types for the sci-fi-tv card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig, ActionConfig } from '../../types/config.js';

export interface SciFiTVCustomActions {
  readonly up?: ActionConfig;
  readonly down?: ActionConfig;
  readonly left?: ActionConfig;
  readonly right?: ActionConfig;
  readonly confirm?: ActionConfig;
  readonly back?: ActionConfig;
  readonly home?: ActionConfig;
  readonly menu?: ActionConfig;
  readonly power?: ActionConfig;
  readonly info?: ActionConfig;
  readonly enter?: ActionConfig;
  readonly volume_mute?: ActionConfig;
}

export interface SciFiTVConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-tv';
  readonly entity: string;
  readonly volume_entity?: string;
  readonly remote_entity?: string;
  readonly app_entity?: string;
  readonly name?: string;
  readonly sources?: readonly (string | (ActionConfig & { name: string }))[];
  readonly custom_actions?: Readonly<SciFiTVCustomActions>;
}
