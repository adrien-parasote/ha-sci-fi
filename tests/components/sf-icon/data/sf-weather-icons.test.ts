import { expect, describe, it } from 'vitest';
import WEATHER_ICONS from '../../../../src/components/sf-icon/data/sf-weather-icons.js';

describe('sf-weather-icons data', () => {
  it('contains valid TemplateResult weather icons', () => {
    expect(WEATHER_ICONS).to.be.an('object');
    expect(WEATHER_ICONS['clear-day']).to.be.an('object');
  });
});
