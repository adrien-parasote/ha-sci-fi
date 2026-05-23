import { expect, describe, it, beforeEach } from 'vitest';
import { resolveIcon, ICON_NOT_FOUND, clearMemCache } from '../../../src/components/sf-icon/icon-cache.js';

describe('icon-cache', () => {
  beforeEach(() => {
    clearMemCache();
  });

  it('resolves icon via hass connection if not in cache', async () => {
    const mockConnection = {
      sendMessagePromise: <T>(msg: any): Promise<T> => {
        if (msg.type === 'frontend/get_icons' && msg.category === 'mdi') {
          return { resources: { 'home': 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z' } } as any;
        }
        return {} as any;
      }
    };

    const path = await resolveIcon(mockConnection, 'mdi:home', 'home');
    expect(path).to.equal('M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z');
  });

  it('returns ICON_NOT_FOUND when icon is missing from registry', async () => {
    const mockConnection = {
      sendMessagePromise: <T>(): Promise<T> => Promise.resolve({ resources: {} } as any),
    };

    const path = await resolveIcon(mockConnection, 'mdi:unknown', 'unknown');
    expect(path).to.equal(ICON_NOT_FOUND);
  });
});
