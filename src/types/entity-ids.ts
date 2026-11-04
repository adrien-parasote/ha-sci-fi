/**
 * Complete Home Assistant entity ids written by the cards — one constant, no string literal.
 * Follows docs/specs/domain-constants/spec.md (Assumption 4): DOMAIN names the domains,
 * ENTITY_ID names the whole ids (infrastructure, editor stubs, demo data). Bead ha-sci-fi-4syw.
 */
export const ENTITY_ID = {
  /** HA's built-in sun entity: infrastructure read by several cards. */
  SUN: 'sun.sun',
  /** The season sensor the climates card reads. */
  SEASON: 'sensor.season',
  // stub configs (getStubConfig) and editor placeholders
  STUB_PERSON: 'person.CHANGE_ME',
  STUB_STOVE: 'climate.poele',
  STUB_VACUUM: 'vacuum.robot',
  STUB_WEATHER: 'weather.forecast_home',
  STUB_TV: 'media_player.bravia_4k_vh22',
  NEW_CUSTOM_LIGHT: 'light.new',
  // water-management demo history
  DEMO_IRRIGATION_TERRACE: 'switch.arrosage_terrasse',
  DEMO_LEAK_KITCHEN: 'sensor.leak_kitchen',
  DEMO_IRRIGATION_HEDGE: 'switch.arrosage_haie',
} as const;
