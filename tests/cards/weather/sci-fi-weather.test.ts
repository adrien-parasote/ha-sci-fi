// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import '../../../src/cards/weather/sci-fi-weather.js';
import { SciFiWeatherCard } from '../../../src/cards/weather/sci-fi-weather.js';

describe('sci-fi-weather', () => {
  let el: SciFiWeatherCard;

  beforeEach(() => {
    el = document.createElement('sci-fi-weather') as SciFiWeatherCard;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('provides getConfigElement', () => {
    const editor = SciFiWeatherCard.getConfigElement();
    expect(editor.tagName.toLowerCase()).to.equal('sci-fi-weather-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiWeatherCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-weather');
  });

  it('renders gracefully without hass', async () => {
    el.setConfig(SciFiWeatherCard.getStubConfig());
    // Wait for lit update
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
