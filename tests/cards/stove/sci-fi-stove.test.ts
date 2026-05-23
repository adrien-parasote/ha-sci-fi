// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';

describe('sci-fi-stove', () => {
  it('provides getConfigElement', () => {
    const el = SciFiStoveCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-stove-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiStoveCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-stove');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    document.body.appendChild(el);
    el.setConfig(SciFiStoveCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
