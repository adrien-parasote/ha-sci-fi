// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';

describe('sci-fi-plugs', () => {
  it('provides getConfigElement', () => {
    const el = SciFiPlugsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiPlugsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-plugs');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    document.body.appendChild(el);
    el.setConfig(SciFiPlugsCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
