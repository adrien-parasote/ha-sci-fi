/**
 * Config types for the sci-fi-bridge card.
 * Field names match EXACTLY the v0.9.6 config-metadata.js schemas (ADR-005).
 * Source of truth: docs/specs/05_cards.md § YAML Config Contracts.
 *
 * Co-located with the card by ADR-017 — this card is the only consumer.
 */

import type { SciFiBaseConfig } from '../../types/config.js';

// RÈGLE : tous les champs optionnels sauf entity/type/items.
// Sous-section absente = non rendue. (spec bridge.md §TypeScript Interfaces)

export interface BridgePersonEntry {
  entity: string; // e.g. "person.adrien"
}

export interface BridgeSmokeEntry {
  entity: string;
  name: string;
  icon?: string; // override (default: 'mdi:smoke-detector')
}

export interface BridgeToggleEntry {
  entity: string;
  name: string;
  icon?: string; // override (default: auto par domain)
}

export interface BridgeAlertsConfig {
  icon?: string;                      // section icon (default: 'mdi:shield-alert')
  smoke?: BridgeSmokeEntry[];         // OPTIONNEL — absent = sous-section masquée
  smoke_switch?: string;              // OPTIONNEL
  toggles?: BridgeToggleEntry[];      // OPTIONNEL — absent = sous-section masquée
  occupancy?: string;                 // OPTIONNEL — absent = badge masqué
}

export interface BridgeAccessEntry {
  entity: string;   // cover.*
  name: string;
  icon?: string;    // override (default: 'mdi:garage')
  lock?: string;    // lock.* — OPTIONNEL
}

// access wrappé pour supporter l'icon section (spec bridge.md §Interfaces)
export interface BridgeAccessConfig {
  icon?: string;          // section icon (default: 'mdi:door-closed')
  items: BridgeAccessEntry[];
}

export type BridgeAutomationType = 'toggle' | 'slider';

export interface BridgeAutomationEntry {
  entity: string;
  name: string;
  type: BridgeAutomationType;
  icon?: string;  // override (default: auto par domain)
  // slider only:
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// automations wrappé pour supporter l'icon section
export interface BridgeAutomationsConfig {
  icon?: string;          // section icon (default: 'mdi:robot')
  items: BridgeAutomationEntry[];
}

export interface BridgeCycleEntry {
  entity: string;
  name: string;
  icon: string;                   // REQUIS — icône visible de l'appareil
  running_states?: string[];      // for sensor entities (non-binary)
}

export interface BridgeConsumableEntry {
  entity: string;
  name: string;
  ok_when: 'on' | 'off';
}

export interface BridgeAppliancesConfig {
  icon?: string;                          // section icon (default: 'mdi:washing-machine')
  cycles: BridgeCycleEntry[];
  consumables?: BridgeConsumableEntry[];  // OPTIONNEL
}

export interface BridgeStoveConfig {
  icon?: string;          // section icon (default: 'sci:stove')
  pellet_quantity: string;
  pellet_stock: string;
  status: string;
  low_threshold?: number; // default: 0.3
}

export interface BridgeVehicleConfig {
  icon?: string;          // section icon (default: 'mdi:ev-station')
  power_sensor: string;
  name?: string;          // optional display name override (e.g. entity name chip)
}

/** A single action button in the bridge Actions panel */
export interface BridgeActionItem {
  entity: string;         // input_button, script, or automation entity
  name?: string;          // display label
  icon?: string;          // icon override (default: 'mdi:play')
  color?: string;         // accent color override (CSS color or --sf-* token)
}

export interface BridgeActionsConfig {
  icon?: string;          // section icon (default: 'mdi:lightning-bolt')
  items: BridgeActionItem[];
}

export interface SciFiBridgeConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-bridge';
  title?: string;
  persons?: BridgePersonEntry[];
  alerts?: BridgeAlertsConfig;
  access?: BridgeAccessConfig;
  automations?: BridgeAutomationsConfig;
  appliances?: BridgeAppliancesConfig;
  stove?: BridgeStoveConfig;
  vehicle?: BridgeVehicleConfig;
  actions?: BridgeActionsConfig;  // configurable action buttons panel
}
