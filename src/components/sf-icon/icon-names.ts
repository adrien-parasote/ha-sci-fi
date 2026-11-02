/**
 * icon-names.ts — the static `sci:` icon names, and the own-key lookup that
 * keeps inherited names (`constructor`, `__proto__`…) from reading as icons.
 *
 * STATIC_ICON_NAMES is the single source read by sf-iconset.ts (HA picker list)
 * and by sf-editor-dropdown-icon.ts (card editor), so the two cannot disagree.
 * Animated weather icons are templates, not paths, and are deliberately absent.
 */

import CUSTOM_ICONS from './data/sf-icons.js';

/** The `sci:` icons that are plain SVG paths: the keys of data/sf-icons.ts. */
export const STATIC_ICON_NAMES: readonly string[] = Object.keys(CUSTOM_ICONS);

/**
 * Value stored under `key` itself, never one inherited from Object.prototype.
 * Same semantics as Object.hasOwn (ES2022; the build targets ES2021 lib).
 */
export function ownValue<T>(map: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}
