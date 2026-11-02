/**
 * bridge-validate.ts — shape validation of a bridge card config (FR-8).
 *
 * Returns the first failing rule's message, or null when the config is valid.
 * A message is built ONLY from the key path, the index and the expected type:
 * the config comes from user YAML and an editor, and is never reflected.
 */

const SECTION_KEYS = ['stove', 'vehicle', 'alerts', 'access', 'automations', 'appliances', 'actions'] as const;

/** [path, parent key, child key | null] */
const ARRAY_PATHS: ReadonlyArray<readonly [string, string | null, string]> = [
  ['persons', null, 'persons'],
  ['access.items', 'access', 'items'],
  ['automations.items', 'automations', 'items'],
  ['actions.items', 'actions', 'items'],
  ['alerts.smoke', 'alerts', 'smoke'],
  ['alerts.toggles', 'alerts', 'toggles'],
  ['appliances.cycles', 'appliances', 'cycles'],
  ['appliances.consumables', 'appliances', 'consumables'],
];

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const present = (v: unknown): boolean => v !== undefined && v !== null;

function arrayAt(config: Obj, parent: string | null, key: string): unknown {
  if (parent === null) return config[key];
  const section = config[parent];
  return isObject(section) ? section[key] : undefined;
}

function firstBadElement(config: Obj): string | null {
  for (const [path, parent, key] of ARRAY_PATHS) {
    const arr = arrayAt(config, parent, key);
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      const el: unknown = arr[i];
      if (!isObject(el) || typeof el.entity !== 'string') return `${path}[${i}].entity: expected a string`;
    }
  }
  return null;
}

function firstBadOptionalString(config: Obj): string | null {
  const alerts = config.alerts;
  if (isObject(alerts)) {
    for (const key of ['occupancy', 'smoke_switch']) {
      if (present(alerts[key]) && typeof alerts[key] !== 'string') return `alerts.${key}: expected a string`;
    }
  }
  const access = config.access;
  const items = isObject(access) ? access.items : undefined;
  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i++) {
      const lock = (items[i] as Obj).lock;
      if (present(lock) && typeof lock !== 'string') return `access.items[${i}].lock: expected a string`;
    }
  }
  return null;
}

function firstMissingRequired(config: Obj): string | null {
  const required: ReadonlyArray<readonly [string, readonly string[]]> = [
    ['stove', ['pellet_quantity', 'pellet_stock', 'status']],
    ['vehicle', ['power_sensor']],
  ];
  for (const [section, fields] of required) {
    const obj = config[section];
    if (!isObject(obj)) continue; // absent section: nothing to validate
    for (const f of fields) if (typeof obj[f] !== 'string') return `${section}.${f}: expected a string`;
  }
  return null;
}

export function validateBridgeConfig(config: unknown): string | null {
  if (!isObject(config)) return 'config: expected an object';
  if (typeof config.type !== 'string') return 'type: expected a string';
  for (const key of SECTION_KEYS) {
    if (present(config[key]) && !isObject(config[key])) return `${key}: expected an object`;
  }
  for (const [path, parent, key] of ARRAY_PATHS) {
    const arr = arrayAt(config, parent, key);
    if (present(arr) && !Array.isArray(arr)) return `${path}: expected an array`;
  }
  return (
    firstBadElement(config) ?? firstBadOptionalString(config) ?? firstMissingRequired(config)
  );
}
