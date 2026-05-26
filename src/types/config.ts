/**
 * Config types for all 8 sci-fi cards — v1.0.0
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/discovery.md §2 + docs/specs/05_cards.md §YAML Config Contracts.
 * Lightweight type-guards replace Zod (Zod = ~45KB bundle overhead — ADR-006).
 */


// ─── Shared ───────────────────────────────────────────────────────────────────

export interface SciFiBaseConfig {
  readonly type: string;
  readonly header_message?: string;
  readonly tap_action?: ActionConfig;
  readonly hold_action?: ActionConfig;
  readonly double_tap_action?: ActionConfig;
}

// ─── sci-fi-hexa-tiles ────────────────────────────────────────────────────────

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

// ─── sci-fi-lights ────────────────────────────────────────────────────────────

export interface SciFiEntityOverride {
  readonly name?: string;
  readonly icon_on?: string;
  readonly icon_off?: string;
}

export interface SciFiLightsConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-lights';
  readonly default_icon_on?: string;
  readonly default_icon_off?: string;
  readonly first_floor_to_render?: string;
  readonly first_area_to_render?: string;
  readonly ignored_entities?: readonly string[];                             // ADR-005: was ignored_entity_ids
  readonly custom_entities?: Readonly<Record<string, SciFiEntityOverride>>; // ADR-005: was entity_overrides
}

// ─── sci-fi-climates ─────────────────────────────────────────────────────────

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

// ─── sci-fi-plugs ─────────────────────────────────────────────────────────────

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

// ─── sci-fi-weather ───────────────────────────────────────────────────────────

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

// ─── sci-fi-stove ─────────────────────────────────────────────────────────────

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

// ─── sci-fi-vacuum ────────────────────────────────────────────────────────────

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

// ─── sci-fi-vehicles ─────────────────────────────────────────────────────────

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

// ─── Lightweight type-guards (replaces Zod — ADR-006) ───────────────────────

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

export interface ActionConfig {
  readonly action: string;
  readonly navigation_path?: string;
  readonly service?: string;
  readonly service_data?: Record<string, unknown>;
}
