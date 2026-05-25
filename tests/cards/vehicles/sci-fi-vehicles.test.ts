/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-vehicles', () => {
  it('provides getConfigElement', () => {
    const el = SciFiVehiclesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vehicles-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiVehiclesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vehicles');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiVehiclesCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders vehicle with missing sensors gracefully', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-vehicles',
      vehicles: [{ id: 'v1', name: 'Car 1' }]
} as unknown as unknown as any);
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    
    expect(el.shadowRoot!.textContent).to.include('Car 1');
    const stats = el.shadowRoot!.querySelectorAll('.stat-item');
    expect(stats.length).to.equal(0);
  });

  // Spec 12: test updated — old flat-stats layout replaced by header + sf-landspeeder + actions
  it('renders vehicle name in header and sf-landspeeder with data', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-vehicles',
      vehicles: [
        {
          id: 'v1',
          name: 'Tesla',
          battery_level: 'sensor.tesla_battery',
          charging: 'switch.tesla_charging',
          battery_autonomy: 'sensor.tesla_range',
          mileage: 'sensor.tesla_mileage',
          location: 'device_tracker.tesla',
          lock_status: 'lock.tesla'
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'sensor.tesla_battery': makeMockEntity({ entity_id: 'sensor.tesla_battery', state: '85' }),
        'switch.tesla_charging': makeMockEntity({ entity_id: 'switch.tesla_charging', state: 'on' }),
        'sensor.tesla_range': makeMockEntity({ entity_id: 'sensor.tesla_range', state: '450' }),
        'sensor.tesla_mileage': makeMockEntity({ entity_id: 'sensor.tesla_mileage', state: '15000' }),
        'device_tracker.tesla': makeMockEntity({ entity_id: 'device_tracker.tesla', state: 'home' }),
        'lock.tesla': makeMockEntity({ entity_id: 'lock.tesla', state: 'locked' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Header shows vehicle name
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');

    // sf-landspeeder component is present and receives vehicle prop
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder).not.to.be.null;
    expect(speeder.vehicle.id).to.equal('v1');

    // Actions section present
    expect(el.shadowRoot!.querySelector('.actions')).not.to.be.null;
  });

  it('renders card correctly for unlocked vehicle (header shows name)', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-vehicles',
      vehicles: [{ id: 'v1', name: 'Tesla', lock_status: 'lock.tesla' }]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'lock.tesla': makeMockEntity({ entity_id: 'lock.tesla', state: 'unlocked' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // In new layout, vehicle name is in header title
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');
    // sf-landspeeder receives vehicle with lock_status
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder.vehicle.lock_status).to.equal('lock.tesla');
  });
});
