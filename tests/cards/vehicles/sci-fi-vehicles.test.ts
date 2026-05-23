// @vitest-environment happy-dom
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';

describe('sci-fi-vehicles', () => {
  it('provides getConfigElement', () => {
    const el = SciFiVehiclesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vehicles-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiVehiclesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vehicles');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    document.body.appendChild(el);
    el.setConfig(SciFiVehiclesCard.getStubConfig());
    expect(el.shadowRoot!.textContent).to.be.empty;
  });
});
