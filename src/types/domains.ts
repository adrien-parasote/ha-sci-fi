/**
 * Home Assistant domains used by the cards and selectors — one constant, no string literal.
 * Spec: docs/specs/domain-constants/spec.md (FR-1). Each key is the UPPER_SNAKE of its value.
 * `homeassistant` is a service domain, not an entity domain; it lives here by decision D3.
 */
export const DOMAIN = {
  LIGHT: 'light',
  CLIMATE: 'climate',
  SENSOR: 'sensor',
  BINARY_SENSOR: 'binary_sensor',
  SWITCH: 'switch',
  COVER: 'cover',
  LOCK: 'lock',
  MEDIA_PLAYER: 'media_player',
  VACUUM: 'vacuum',
  WEATHER: 'weather',
  PERSON: 'person',
  ZONE: 'zone',
  REMOTE: 'remote',
  SELECT: 'select',
  NUMBER: 'number',
  COUNTER: 'counter',
  AUTOMATION: 'automation',
  SCRIPT: 'script',
  INPUT_BOOLEAN: 'input_boolean',
  INPUT_SELECT: 'input_select',
  INPUT_NUMBER: 'input_number',
  INPUT_BUTTON: 'input_button',
  VALVE: 'valve',
  HOMEASSISTANT: 'homeassistant',
} as const;

export type Domain = (typeof DOMAIN)[keyof typeof DOMAIN];
