import { expect, describe, it } from 'vitest';
import { HASS_PLUG_SERVICE, CHART_BORDER_COLOR } from '../../../src/cards/plugs/plug_const.js';

describe('plug constants', () => {
  it('defines correct service and style mapping', () => {
    expect(HASS_PLUG_SERVICE).toBe('switch');
    expect(CHART_BORDER_COLOR).toBe('rgb(102, 156, 210)');
  });
});
