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
 * The flat-map entries (window.customIcons['sci']['stove'] = 'M…') remain intact
 * because sf-icon.ts and sci-icon.ts use them for synchronous path lookup.
 * The HA picker helper functions are added as NON-ENUMERABLE own properties so
 * that spread/iteration in those components still yields only icon name→path pairs.
 */

import CUSTOM_ICONS from './data/sf-icons.js';
import WEATHER_ICONS from './data/sf-weather-icons.js';

const ALL_CUSTOM_ICONS: Record<string, string> = {
  ...(CUSTOM_ICONS as Record<string, string>),
  ...(WEATHER_ICONS as unknown as Record<string, string>),
};

// ─── 1. customIconsets — icon resolution for <ha-icon icon="sci:name"> ─────────

// eslint-disable-next-line @typescript-eslint/require-await
async function getIconForIconsets(name: string): Promise<{ path: string; viewBox: string } | string> {
  if (!(name in ALL_CUSTOM_ICONS)) {
    console.error(`[sf-iconset] Icon "sci:${name}" not available`);
    return '';
  }
  return {
    path: ALL_CUSTOM_ICONS[name]!,
    viewBox: '0 0 24 24',
  };
}

// ─── 2. customIcons helpers — icon picker grid (getIcon + getIconList) ─────────

/** HA icon picker: resolve one icon by name */
// eslint-disable-next-line @typescript-eslint/require-await
async function getIconForPicker(name: string): Promise<{ path: string; viewBox: string }> {
  return {
    path: ALL_CUSTOM_ICONS[name] ?? '',
    viewBox: '0 0 24 24',
  };
}

/** HA icon picker: return the full list so icons appear in the picker grid */
// eslint-disable-next-line @typescript-eslint/require-await
async function getIconList(): Promise<{ name: string; keywords?: string[] }[]> {
  return Object.keys(ALL_CUSTOM_ICONS).map((name) => ({ name }));
}

// ─── Registration ─────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // 1. customIconsets — for <ha-icon> resolution
  window.customIconsets = window.customIconsets ?? {};
  (window.customIconsets as Record<string, unknown>)['sci'] = getIconForIconsets;

  // 2. customIcons — for ha-icon-picker grid
  // sf-icon.ts already set window.customIcons['sci'] to a flat {name: path} map.
  // We add getIcon and getIconList as non-enumerable properties so that:
  //   • spread/for-in in sf-icon.ts still yields only icon-name → path entries
  //   • ha-icon-picker finds the functions via property access
  window.customIcons = window.customIcons ?? {};
  const sciMap = (window.customIcons['sci'] = window.customIcons['sci'] ?? {}) as Record<string, unknown>;

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
