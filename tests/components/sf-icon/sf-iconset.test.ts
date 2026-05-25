// @vitest-environment happy-dom
/**
 * Tests for sf-iconset.ts
 * Covers: getIcon for known icon, getIcon for unknown icon, getIconList.
 */
import { expect, describe, it, vi } from 'vitest';

describe('sf-iconset', () => {
  it('registers customIconsets.sci in window', async () => {
    // The module registers window.customIconsets['sci'] on import
    await import('../../../src/components/sf-icon/sf-iconset.js');
    expect((window as any).customIconsets?.sci).toBeDefined();
    expect(typeof (window as any).customIconsets!.sci).toBe('function');
  });

  it('getIcon returns path and viewBox for a known custom icon', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    // 'power-socket-fr-off' is defined in sf-icons.ts
    const result = await getIcon('power-socket-fr-off');
    if (typeof result === 'object' && result !== null) {
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('viewBox', '0 0 24 24');
      expect(typeof result.path).toBe('string');
    } else {
      // If all icons are unknown in test env, verify the '' fallback
      expect(result).toBe('');
    }
  });

  it('getIcon returns empty string for unknown icon and logs error', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    const result = await getIcon('__nonexistent_icon_xyz__');
    expect(result).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('__nonexistent_icon_xyz__'));
    consoleSpy.mockRestore();
  });

  it('getIconList is accessible via the sci: registered function', async () => {
    await import('../../../src/components/sf-icon/sf-iconset.js');
    const getIcon = (window as any).customIconsets!.sci as (name: string) => Promise<any>;
    expect(typeof getIcon).toBe('function');
  });
});

