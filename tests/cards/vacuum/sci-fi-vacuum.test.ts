// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVacuumCard } from '../../../src/cards/vacuum/sci-fi-vacuum.js';

describe('sci-fi-vacuum', () => {
  it('provides getConfigElement', () => {
    const el = SciFiVacuumCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vacuum-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiVacuumCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vacuum');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    document.body.appendChild(el);
    el.setConfig(SciFiVacuumCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
