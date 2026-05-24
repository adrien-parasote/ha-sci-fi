/**
 * sf-iconset.ts — Registers the sci: custom icon namespace with Home Assistant.
 *
 * HA resolves custom icon prefixes via window.customIconsets[prefix] = getIcon.
 * Without this file, icons like sci:stove-heat are unknown to HA and render blank.
 *
 * Port of the legacy src/components/icons/sf-iconset.js (main branch).
 */

import CUSTOM_ICONS from './data/sf-icons.js';
import WEATHER_ICONS from './data/sf-weather-icons.js';

const ALL_CUSTOM_ICONS: Record<string, string> = {
  ...(CUSTOM_ICONS as Record<string, string>),
  ...(WEATHER_ICONS as unknown as Record<string, string>),
};

async function getIcon(name: string): Promise<{ path: string; viewBox: string } | string> {
  if (!(name in ALL_CUSTOM_ICONS)) {
    console.error(`[sf-iconset] Icon "sci:${name}" not available`);
    return '';
  }
  return {
    path: ALL_CUSTOM_ICONS[name]!,
    viewBox: '0 0 24 24',
  };
}

async function getIconList(): Promise<{ name: string }[]> {
  return Object.keys(ALL_CUSTOM_ICONS).map(name => ({ name }));
}

// Register under the canonical sci: prefix used in production YAML configs
// Only registers customIconsets (HA API for icon resolution via ha-icon).
// window.customIcons['sci'] flat map is already handled by sf-icon.ts module init.
if (typeof window !== 'undefined') {
  window.customIconsets = window.customIconsets ?? {};
  (window.customIconsets as Record<string, unknown>)['sci'] = getIcon;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customIconsets?: Record<string, any>;
  }
}
