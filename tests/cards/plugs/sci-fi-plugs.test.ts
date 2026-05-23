/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-plugs', () => {
  it('provides getConfigElement', () => {
    const el = SciFiPlugsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiPlugsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-plugs');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    document.body.appendChild(el);
    el.setConfig(SciFiPlugsCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty when no devices config', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    el.setConfig({ type: 'custom:sci-fi-plugs' } as unknown as unknown as any);
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.plug-tile').length).to.equal(0);
  });

  it('renders plugs and handles toggle clicks', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    const mockCallService = vi.fn();
    
    el.setConfig({
      type: 'custom:sci-fi-plugs',
      header_message: 'Smart Plugs',
      devices: [
        {
          device_id: 'plug1',
          entity_id: 'switch.tv',
          name: 'TV Plug',
          sensors: { power: 'sensor.tv_power', energy: 'sensor.tv_energy' }
        },
        {
          device_id: 'plug2',
          entity_id: 'switch.unknown',
          // no sensors
        }
      ]
} as unknown as unknown as any);

    el.hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: '45.2' }),
        'sensor.tv_energy': makeMockEntity({ entity_id: 'sensor.tv_energy', state: '1.2' }),
        'switch.unknown': makeMockEntity({ entity_id: 'switch.unknown', state: 'off', attributes: { friendly_name: 'Unknown Plug' } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Smart Plugs');

    const tiles = el.shadowRoot!.querySelectorAll('.plug-tile');
    expect(tiles.length).to.equal(2);

    // TV Plug
    const tvTile = tiles[0] as HTMLElement;
    expect(tvTile.getAttribute('data-on')).to.equal('true');
    expect(tvTile.querySelector('.plug-name')!.textContent).to.equal('TV Plug');
    expect(tvTile.querySelector('.plug-power')!.textContent).to.include('45.2 W');
    expect(tvTile.querySelector('.plug-energy')!.textContent).to.include('1.2 kWh');
    expect((tvTile.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:power-plug'); // default active

    const btn1 = tvTile.querySelector('.plug-btn') as HTMLElement;
    expect(btn1.textContent).to.equal('Éteindre');
    btn1.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.tv' });

    // Unknown Plug
    const unknownTile = tiles[1] as HTMLElement;
    expect(unknownTile.getAttribute('data-on')).to.equal('false');
    expect(unknownTile.querySelector('.plug-name')!.textContent).to.equal('Unknown Plug'); // fallback friendly name
    expect(unknownTile.querySelector('.plug-power')).to.be.null; // missing sensor
    expect((unknownTile.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:power-plug-off');

    const btn2 = unknownTile.querySelector('.plug-btn') as HTMLElement;
    expect(btn2.textContent).to.equal('Allumer');
    btn2.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.unknown' });
  });
});
