import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resolveIcon,
  clearMemCache,
  ICON_NOT_FOUND,
  _memCache,
  type HassIconConnection,
} from '../../src/components/sf-icon/icon-cache.js';

// ─── Mock idb-keyval ──────────────────────────────────────────────────────────
vi.mock('idb-keyval', () => {
  const store = new Map<string, string>();
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key))),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  };
});

// ─── Mock hass connection ─────────────────────────────────────────────────────

function mockConnection(pathData: string | null, iconName = 'test-icon'): HassIconConnection {
  return {
    sendMessagePromise: vi.fn().mockResolvedValue(
      pathData !== null
        ? { resources: { [iconName]: pathData } }
        : { resources: {} }
    ),
  };
}

describe('icon-cache', () => {
  beforeEach(() => {
    clearMemCache();
  });

  // TC-403: icon cache saves icons successfully
  it('TC-403: resolveIcon fetches from HA registry and caches result', async () => {
    const conn = mockConnection('M1 2 3 4Z');
    const result = await resolveIcon(conn, 'mdi:test-icon', 'test-icon');
    expect(result).toBe('M1 2 3 4Z');
    expect(_memCache.get('mdi:test-icon')).toBe('M1 2 3 4Z');
  });

  // TC-401: sf-icon checks customIcons first (via cache hit)
  it('TC-401: resolveIcon returns memory-cached value without calling HA', async () => {
    _memCache.set('mdi:cached-icon', 'M5 6 7 8Z');
    const conn = mockConnection('should-not-reach', 'cached-icon');
    const result = await resolveIcon(conn, 'mdi:cached-icon', 'cached-icon');
    expect(result).toBe('M5 6 7 8Z');
    expect(conn.sendMessagePromise).not.toHaveBeenCalled();
  });

  it('resolveIcon returns ICON_NOT_FOUND when HA has no matching icon', async () => {
    const conn = mockConnection(null);
    const result = await resolveIcon(conn, 'mdi:unknown', 'unknown');
    expect(result).toBe(ICON_NOT_FOUND);
  });

  it('resolveIcon handles HA connection error gracefully', async () => {
    const conn: HassIconConnection = {
      sendMessagePromise: vi.fn().mockRejectedValue(new Error('WebSocket closed')),
    };
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await resolveIcon(conn, 'mdi:error-icon', 'error-icon');
    expect(result).toBe(ICON_NOT_FOUND);
    consoleSpy.mockRestore();
  });

  // IT-401: icon cache hit avoids server queries
  it('IT-401: after first resolveIcon, memCache is populated for instant second return', async () => {
    const conn = mockConnection('M9 10 11 12Z', 'repeat-icon');
    // First call — fetches from HA
    const result1 = await resolveIcon(conn, 'mdi:repeat-icon', 'repeat-icon');
    expect(result1).toBe('M9 10 11 12Z');
    // After first call, memory cache MUST be populated
    expect(_memCache.get('mdi:repeat-icon')).toBe('M9 10 11 12Z');
    // Second call — returns from memory cache
    const result2 = await resolveIcon(conn, 'mdi:repeat-icon', 'repeat-icon');
    expect(result2).toBe('M9 10 11 12Z');
  });
});
