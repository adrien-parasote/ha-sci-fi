// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/lights/sci-fi-lights.js';
import { SciFiLightsCard } from '../../../src/cards/lights/sci-fi-lights.js';

describe('sci-fi-lights', () => {
  it('provides getConfigElement', () => {
    const el = SciFiLightsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-lights-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiLightsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-lights');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    document.body.appendChild(el);
    el.setConfig(SciFiLightsCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
