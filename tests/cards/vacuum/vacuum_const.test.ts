import { expect, describe, it } from 'vitest';
import { VACUUM_STATE_CLEANING, VACUUM_ICONS } from '../../../src/cards/vacuum/vacuum_const.js';

describe('vacuum constants', () => {
  it('defines correct status mapping', () => {
    expect(VACUUM_STATE_CLEANING).toBe('cleaning');
    expect(VACUUM_ICONS[VACUUM_STATE_CLEANING]).toBe('mdi:robot-vacuum');
  });
});
