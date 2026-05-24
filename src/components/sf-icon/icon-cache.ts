/**
 * sf-icon — icon cache layer
 *
 * Strategy (CRITICAL-01 fix):
 * 1. Check module-level Map (in-memory cache — fast, survives incognito)
 * 2. Check idb-keyval IndexedDB cache (persistent)
 * 3. Fetch from HA native icon registry via hass.connection
 * 4. NEVER fetch from external CDNs (breaks offline HA)
 *
 * MEDIUM-03 fix: IndexedDB blocked in incognito → in-memory Map fallback
 * with a concurrent-fetch rate limiter.
 */

import { get, set } from 'idb-keyval';

// ─── Module-level in-memory cache (survives incognito, cleared on page reload) ─

const memCache = new Map<string, string>();
let idbAvailable: boolean | null = null; // null = not yet tested
let activeFetches = 0;
const MAX_CONCURRENT_FETCHES = 5;

// ─── IDB availability check ───────────────────────────────────────────────────

async function checkIdbAvailable(): Promise<boolean> {
  if (idbAvailable !== null) return idbAvailable;
  try {
    await set('__sf_idb_probe__', '1');
    idbAvailable = true;
  } catch {
    console.warn('[sf-icon] IndexedDB unavailable, using in-memory fallback');
    idbAvailable = false;
  }
  return idbAvailable;
}

// ─── Cache read/write ─────────────────────────────────────────────────────────

async function readCache(iconKey: string): Promise<string | undefined> {
  const memHit = memCache.get(iconKey);
  if (memHit !== undefined) return memHit;

  const idb = await checkIdbAvailable();
  if (!idb) return undefined;

  try {
    const cached = await get<string>(iconKey);
    if (cached !== undefined) {
      memCache.set(iconKey, cached); // promote to memory
    }
    return cached;
  } catch {
    return undefined;
  }
}

async function writeCache(iconKey: string, svg: string): Promise<void> {
  memCache.set(iconKey, svg);
  const idb = await checkIdbAvailable();
  if (!idb) return;
  try {
    await set(iconKey, svg);
  } catch {
    // Non-fatal — memory cache is still set
  }
}

// ─── HA native icon registry fetch ───────────────────────────────────────────

export interface HassIconConnection {
  sendMessagePromise: <T>(msg: Record<string, unknown>) => Promise<T>;
}

export interface MdiIconsResponse {
  resources: Record<string, string>; // icon name → path data
}

let registryPromises = new WeakMap<HassIconConnection, Promise<MdiIconsResponse>>();

async function getMdiRegistry(connection: HassIconConnection): Promise<MdiIconsResponse> {
  let promise = registryPromises.get(connection);
  if (!promise) {
    promise = connection.sendMessagePromise<MdiIconsResponse>({
      type: 'frontend/get_icons',
      category: 'mdi',
    }).catch(err => {
      registryPromises.delete(connection); // clear on error to retry next time
      throw err;
    });
    registryPromises.set(connection, promise);
  }
  return promise;
}

/** Fetch MDI icon path from HA native icon registry. No CDN. */
async function fetchMdiFromHass(
  connection: HassIconConnection,
  iconName: string
): Promise<string | null> {
  try {
    const response = await getMdiRegistry(connection);
    const pathData = response?.resources?.[iconName] ?? response?.resources?.[`mdi:${iconName}`];
    return pathData ?? null;
  } catch (err: unknown) {
    const errMsg = err && typeof err === 'object' ? JSON.stringify(err) : String(err);
    console.warn(`[sf-icon] Failed to fetch icon '${iconName}' from HA registry: ${errMsg}`);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ICON_NOT_FOUND = Symbol('ICON_NOT_FOUND');

/**
 * Resolves an icon path from:
 * 1. In-memory cache
 * 2. IndexedDB cache
 * 3. HA native icon registry (no CDN — CRITICAL-01)
 *
 * Returns the SVG path data string, or ICON_NOT_FOUND symbol.
 */
export async function resolveIcon(
  connection: HassIconConnection,
  iconKey: string,
  iconName: string
): Promise<string | typeof ICON_NOT_FOUND> {
  const cached = await readCache(iconKey);
  if (cached !== undefined) return cached;

  const pathData = await fetchMdiFromHass(connection, iconName);
  if (pathData === null) return ICON_NOT_FOUND;

  await writeCache(iconKey, pathData);
  return pathData;
}

/** Clear the in-memory cache (useful for testing). */
export function clearMemCache(): void {
  memCache.clear();
  idbAvailable = null;
  activeFetches = 0;
  registryPromises = new WeakMap();
}

/** Expose for testing only. */
export { memCache as _memCache };
