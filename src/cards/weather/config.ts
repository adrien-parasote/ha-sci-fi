/**
 * Config types for the sci-fi-weather card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

export interface SciFiWeatherAlertConfig {
  readonly entity_id: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

export interface SciFiWeatherConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-weather';
  readonly weather_entity: string;                        // ADR-005: was weather_entity_id
  readonly weather_daily_forecast_limit?: number;         // range [0, 15]
  readonly chart_first_kind_to_render?: 'temperature' | 'precipitation' | 'wind';
  readonly alert?: SciFiWeatherAlertConfig;               // ADR-005: missing in v1.0.0-wip
}
