/**
 * config-metadata.ts — Bridge card validation schema
 * Spec: docs/specs/cards/bridge.md §config-metadata
 * All sections optional (spec rule: absent section = hidden, not error)
 */
export const bridgeConfigMetadata = {
  persons: { type: 'array', mandatory: false, default: [] },
  alerts: { type: 'object', mandatory: false },
  access: { type: 'object', mandatory: false },
  automations: { type: 'object', mandatory: false },
  appliances: { type: 'object', mandatory: false },
  stove: { type: 'object', mandatory: false },
  vehicle: { type: 'object', mandatory: false },
  actions: { type: 'object', mandatory: false },
} as const;
