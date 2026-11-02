/**
 * sf-iconset.ts — Registers the sci: custom icon namespace with Home Assistant.
 *
 * Registers TWO separate HA APIs:
 *
 * 1. window.customIconsets['sci'] = getIcon
 *    → Used by <ha-icon icon="sci:name"> for icon resolution (already worked).
 *
 * 2. window.customIcons['sci'].getIcon + window.customIcons['sci'].getIconList
 *    → Used by ha-icon-picker to populate the searchable icon grid.
 *    → Without getIconList, sci: icons are invisible in the HA icon picker UI.
 *
 * The flat-map entries (window.customIcons['sci']['stove'] = 'M…') are seeded by
 * sf-icon.ts for third parties reading the page global; sf-icon.ts itself resolves
 * built-ins from its own module data, not from this object.
 * The HA picker helper functions are added as NON-ENUMERABLE own properties so
 * that spread/iteration in those components still yields only icon name→path pairs.
 */

import CUSTOM_ICONS from './data/sf-icons.js';
import { STATIC_ICON_NAMES, ownValue } from './icon-names.js';

/** Only static icons are paths HA can draw; weather icons are templates (see sf-icon.ts). */
const STATIC_ICONS: Readonly<Record<string, string>> = CUSTOM_ICONS;

/** Config-supplied name made safe for a log line: printable ASCII only, 64 chars at most. */
function logName(name: string): string {
  return name.replace(/[^\x20-\x7e]/g, '?').slice(0, 64);
}

// ─── 1. customIconsets — icon resolution for <ha-icon icon="sci:name"> ─────────

// eslint-disable-next-line @typescript-eslint/require-await
async function getIconForIconsets(name: string): Promise<{ path: string; viewBox: string } | string> {
  const path = ownValue(STATIC_ICONS, name);
  if (path === undefined) {
    console.error(`[sf-iconset] Icon "sci:${logName(name)}" not available`);
    return '';
  }
  return { path, viewBox: '0 0 24 24' };
}

// ─── 2. customIcons helpers — icon picker grid (getIcon + getIconList) ─────────

/** HA icon picker: resolve one icon by name (unknown name → empty path, silent) */
// eslint-disable-next-line @typescript-eslint/require-await
async function getIconForPicker(name: string): Promise<{ path: string; viewBox: string }> {
  return {
    path: ownValue(STATIC_ICONS, name) ?? '',
    viewBox: '0 0 24 24',
  };
}

/** HA icon picker: the static icon names, so they appear in the picker grid */
// eslint-disable-next-line @typescript-eslint/require-await
async function getIconList(): Promise<{ name: string; keywords?: string[] }[]> {
  return STATIC_ICON_NAMES.map((name) => ({ name }));
}

// ─── Registration ─────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // 1. customIconsets — for <ha-icon> resolution
  window.customIconsets = window.customIconsets ?? {};
  (window.customIconsets as Record<string, unknown>)['sci'] = getIconForIconsets;

  // 2. customIcons — for ha-icon-picker grid
  // sf-icon.ts already set window.customIcons['sci'] to a flat {name: path} map.
  // We add getIcon and getIconList as non-enumerable properties so that:
  //   • spread/for-in over the object by third parties still yields only icon-name → path entries
  //   • ha-icon-picker finds the functions via property access
  window.customIcons = window.customIcons ?? {};
  const sciMap = (window.customIcons['sci'] = window.customIcons['sci'] ?? {});

  Object.defineProperty(sciMap, 'getIcon', {
    value: getIconForPicker,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(sciMap, 'getIconList', {
    value: getIconList,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

// ─── Global type augmentation ─────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customIconsets?: Record<string, any>;
  }
}
