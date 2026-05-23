// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';

describe('sci-fi-climates', () => {
  it('provides getConfigElement', () => {
    const el = SciFiClimatesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-climates-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiClimatesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-climates');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    document.body.appendChild(el);
    el.setConfig(SciFiClimatesCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
