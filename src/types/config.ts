/**
 * Config types for all 8 sci-fi cards — v2
 * Lightweight TypeScript type-guards replace Zod (Zod = ~45KB bundle overhead).
 * Each config interface reflects the v2 YAML field names.
 */


// ─── Shared ───────────────────────────────────────────────────────────────────

export interface SciFiBaseConfig {
  readonly type: string;
  readonly header_message?: string;
}

export interface SciFiEntityOverride {
  readonly name?: string;
  readonly icon_on?: string;
  readonly icon_off?: string;
}

// ─── sci-fi-hexa-tiles ────────────────────────────────────────────────────────

export interface SciFiHexaTilesWeatherConfig {
  readonly activate?: boolean;
  readonly weather_entity_id: string;
  readonly weather_alert_entity_id?: string;
  readonly link?: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

export interface SciFiHexaTileConfig {
  readonly entity_id: string;
  readonly icon: string;
  readonly name?: string;
  readonly tap_action?: ActionConfig;
}

export interface SciFiHexaTilesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-hexa-tiles';
  readonly weather?: SciFiHexaTilesWeatherConfig;
  readonly tiles?: readonly SciFiHexaTileConfig[];
  readonly persons?: readonly string[];
  readonly vehicles?: readonly string[];
}

// ─── sci-fi-lights ────────────────────────────────────────────────────────────

export interface SciFiLightsConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-lights';
  readonly default_icon_on?: string;
  readonly default_icon_off?: string;
  readonly first_floor_to_render?: string;
  readonly first_area_to_render?: string;
  readonly ignored_entity_ids?: readonly string[];       // v2: was ignored_entities
  readonly entity_overrides?: Readonly<Record<string, SciFiEntityOverride>>;  // v2: was custom_entities
}

// ─── sci-fi-climates ─────────────────────────────────────────────────────────

export interface SciFiClimatesHeaderConfig {
  readonly display?: boolean;
  readonly icon_winter_state?: string;
  readonly icon_summer_state?: string;
  readonly season_entity_id?: string;                    // v2: was season_entity
}

export interface SciFiClimatesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-climates';
  readonly excluded_entity_ids?: readonly string[];      // v2: was entities_to_exclude
  readonly header?: SciFiClimatesHeaderConfig;
}

// ─── sci-fi-plugs ─────────────────────────────────────────────────────────────

export interface SciFiPlugSensors {
  readonly power?: string;
  readonly energy?: string;
}

export interface SciFiPlugDevice {
  readonly device_id: string;
  readonly entity_id: string;
  readonly name?: string;
  readonly active_icon?: string;
  readonly inactive_icon?: string;
  readonly sensors?: SciFiPlugSensors;
}

export interface SciFiPlugsConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-plugs';
  readonly devices?: readonly SciFiPlugDevice[];
}

// ─── sci-fi-weather ───────────────────────────────────────────────────────────

export interface SciFiWeatherConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-weather';
  readonly weather_entity_id: string;                    // v2: was weather_entity
  readonly weather_daily_forecast_limit?: number;
  readonly chart_first_kind_to_render?: 'temperature' | 'precipitation' | 'wind';
}

// ─── sci-fi-stove ─────────────────────────────────────────────────────────────

export interface SciFiStoveSensors {
  readonly sensor_actual_power?: string;
  readonly sensor_combustion_chamber_temperature?: string;
  readonly sensor_pellet_quantity?: string;
}

export interface SciFiStoveConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-stove';
  readonly entity_id: string;                            // v2: was entity
  readonly sensors?: SciFiStoveSensors;
}

// ─── sci-fi-vacuum ────────────────────────────────────────────────────────────

export interface SciFiVacuumSensors {
  readonly battery?: string;
  readonly mop_intensity?: string;
  readonly current_clean_area?: string;
  readonly current_clean_duration?: string;
  readonly map?: string;
}

export interface SciFiVacuumEntry {
  readonly entity_id: string;                            // v2: was entity
  readonly sensors?: SciFiVacuumSensors;
  readonly start?: boolean;
  readonly pause?: boolean;
  readonly stop?: boolean;
  readonly return_to_base?: boolean;
  readonly set_fan_speed?: boolean;
}

export interface SciFiVacuumConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-vacuum';
  readonly vacuums: readonly SciFiVacuumEntry[];
}

// ─── sci-fi-vehicles ─────────────────────────────────────────────────────────

export interface SciFiVehicleEntry {
  readonly id: string;
  readonly name: string;
  readonly charging?: string;
  readonly lock_status?: string;
  readonly battery_level?: string;
  readonly range?: string;
  readonly mileage?: string;
  readonly location?: string;
}

export interface SciFiVehiclesConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-vehicles';
  readonly vehicles: readonly SciFiVehicleEntry[];
}

// ─── Lightweight type-guards (replaces Zod — MEDIUM-01 fix) ──────────────────

export function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid config: "${field}" must be a string, got ${typeof value}`);
  }
}

export function assertDefined<T>(value: T | undefined | null, field: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Invalid config: "${field}" is required but was not provided`);
  }
}

export function isValidCardType(config: unknown): config is { type: string } {
  return (
    typeof config === 'object' &&
    config !== null &&
    'type' in config &&
    typeof (config as Record<string, unknown>)['type'] === 'string'
  );
}

  // ActionConfig will be filled in when cards are implemented
export interface ActionConfig {
  readonly action: string;
  readonly navigation_path?: string;
  readonly service?: string;
  readonly service_data?: Record<string, unknown>;
}
