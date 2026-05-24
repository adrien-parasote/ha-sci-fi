// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import weatherIcons from '../../../../src/components/icons/data/sf-weather-icons.js';

describe('sf-weather-icons data', () => {
  it('registers and exports weather icons correctly', () => {
    expect(weatherIcons).to.be.an('object');
    expect(weatherIcons['clear-day']).to.exist;
  });
});
