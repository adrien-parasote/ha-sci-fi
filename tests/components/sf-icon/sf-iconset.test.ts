// @vitest-environment happy-dom
/**
 * Tests for sf-iconset.ts
 * Covers: customIconsets registration, getIcon, getIconList (HA icon picker API).
 */
import { expect, describe, it, vi } from 'vitest';
import { STATIC_ICON_NAMES } from '../../../src/components/sf-icon/icon-names.js';

describe('sf-iconset', () => {
  it('registers customIconsets.sci in window as a function', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    expect((window as any).customIconsets?.sci).toBeDefined();
    expect(typeof (window as any).customIconsets!.sci).toBe('function');
  });

  it('TC-408: getIcon (customIconsets) returns path and viewBox for a known custom icon', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    // Input taken from TC-408 itself. The assertion is unconditional on
    // purpose: the previous `if (object) … else expect(result).toBe('')` form
    // passed on BOTH branches, so a regression to the error path ('') stayed
    // green. The '' contract belongs to the unknown-icon test below.
    const result = await getIcon('stove');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('viewBox', '0 0 24 24');
    expect(typeof result.path).toBe('string');
    expect(result.path.length).toBeGreaterThan(0);
  });

  it('TC-408: getIcon (customIconsets) takes the unknown-icon branch for a weather name', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    expect(await getIcon('clear-night-day')).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith('[sf-iconset] Icon "sci:clear-night-day" not available');
    consoleSpy.mockRestore();
  });

  it('getIcon (customIconsets) returns empty string for unknown icon and logs error', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    const result = await getIcon('__nonexistent_icon_xyz__');
    expect(result).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('__nonexistent_icon_xyz__'));
    consoleSpy.mockRestore();
  });

  // ─── HA icon picker API (window.customIcons['sci']) ───────────────────────

  it('registers window.customIcons.sci with getIcon and getIconList (HA picker API)', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons?.sci;
    expect(sciMap).toBeDefined();
    expect(typeof sciMap.getIcon).toBe('function');
    expect(typeof sciMap.getIconList).toBe('function');
  });

  it('getIcon (picker) returns { path, viewBox } for a known icon', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons!.sci as Record<string, any>;
    const result = await sciMap.getIcon('stove');
    expect(result).toHaveProperty('path');
    expect(result).toHaveProperty('viewBox', '0 0 24 24');
    expect(typeof result.path).toBe('string');
    expect(result.path.length).toBeGreaterThan(0);
  });

  it('getIcon (picker) returns empty path for unknown icon', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons!.sci as Record<string, any>;
    const result = await sciMap.getIcon('__does_not_exist__');
    expect(result).toHaveProperty('path', '');
    expect(result).toHaveProperty('viewBox', '0 0 24 24');
  });

  it('TC-407: getIconList returns a non-empty array with name fields', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons!.sci as Record<string, any>;
    const list: { name: string; keywords?: string[] }[] = await sciMap.getIconList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('name');
    expect(typeof list[0]!.name).toBe('string');
    // Membership, not just non-emptiness: the list IS the static name set.
    expect(list.map((i) => i.name).sort()).toEqual([...STATIC_ICON_NAMES].sort());
  });

  it('getIconList includes known icons like "stove" and "landspeeder"', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons!.sci as Record<string, any>;
    const list: { name: string }[] = await sciMap.getIconList();
    const names = list.map((i) => i.name);
    expect(names).toContain('stove');
    expect(names).toContain('landspeeder');
  });

  it('getIcon and getIconList are non-enumerable on window.customIcons.sci', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const sciMap = (window as any).customIcons!.sci;
    const ownEnumerableKeys = Object.keys(sciMap);
    // The HA picker helpers are non-enumerable — spread/for-in won't include them
    expect(ownEnumerableKeys).not.toContain('getIcon');
    expect(ownEnumerableKeys).not.toContain('getIconList');
    // They are still accessible via property access (what ha-icon-picker does)
    expect(typeof sciMap.getIcon).toBe('function');
    expect(typeof sciMap.getIconList).toBe('function');
  });
});
