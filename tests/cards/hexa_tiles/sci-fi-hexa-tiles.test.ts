/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles.js';
import { SciFiHexaTilesCard } from '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-hexa-tiles', () => {
  it('provides getConfigElement', () => {
    const el = SciFiHexaTilesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-hexa-tiles-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiHexaTilesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-hexa-tiles');
    expect(config.tiles).to.be.an('array');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    document.body.appendChild(el);
    el.setConfig(SciFiHexaTilesCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders weather alert with correct colors', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: {
        activate: true,
        weather_alert_entity_id: 'sensor.alert',
        state_green: 'Vert',
        state_yellow: 'Jaune',
        state_orange: 'Orange',
        state_red: 'Rouge'
      }
} as unknown as unknown as any);

    // Test green
    el.hass = makeMockHass({ states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Vert' }) } });
    document.body.appendChild(el);
    await el.updateComplete;
    const alert = el.shadowRoot!.querySelector('.weather-alert') as HTMLElement;
    expect(alert.getAttribute('data-level')).to.equal('green');
    expect(alert.textContent).to.include('Vert');

    // Test red
    el.hass = makeMockHass({ states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Rouge' }) } });
    await el.updateComplete;
    expect(alert.getAttribute('data-level')).to.equal('red');

    // Test unknown state (defaults to green)
    el.hass = makeMockHass({ states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Inconnu' }) } });
    await el.updateComplete;
    expect(alert.getAttribute('data-level')).to.equal('green');
  });

  it('renders weather tile with temperature and navigation', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: { activate: true, weather_entity_id: 'weather.home', link: '/lovelace/weather' }
} as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: { temperature: 25.5 } })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tile = el.shadowRoot!.querySelector('.hexa-tile') as HTMLElement;
    expect(tile.textContent).to.include('25.5°');

    // Mock window location
    const assignMock = vi.fn();
    vi.stubGlobal('window', { location: { assign: assignMock } });
    tile.click();
    expect(assignMock).toHaveBeenCalledWith('/lovelace/weather');
    vi.unstubAllGlobals();
  });

  it('renders person and vehicle tiles', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      persons: ['person.bob', 'person.alice'],
      vehicles: ['device_tracker.car']
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'person.bob': makeMockEntity({ entity_id: 'person.bob', state: 'home', attributes: { friendly_name: 'Bob' } }),
        'person.alice': makeMockEntity({ entity_id: 'person.alice', state: 'not_home', attributes: { friendly_name: 'Alice' } }),
        'device_tracker.car': makeMockEntity({ entity_id: 'device_tracker.car', state: 'home', attributes: { friendly_name: 'Car' } })
      }
} as unknown as unknown as any);
    document.body.appendChild(el);
    await el.updateComplete;

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile');
    expect(tiles.length).to.equal(3);

    expect(tiles[0]!.getAttribute('data-active')).to.equal('true'); // Bob home
    expect(tiles[0]!.textContent).to.include('Bob');
    
    expect(tiles[1]!.getAttribute('data-active')).to.equal('false'); // Alice away
    expect(tiles[1]!.textContent).to.include('Alice');

    expect(tiles[2]!.textContent).to.include('Car');
    expect((tiles[2]!.querySelector('sf-icon') as HTMLElement).getAttribute('icon')).to.equal('mdi:car');
  });

  it('renders custom tiles and handles tap_action', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    const mockCallService = vi.fn();
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      header_message: 'Custom Hexa',
      tiles: [
        {
          entity_id: 'switch.x',
          name: 'Switch X',
          icon: 'mdi:switch',
          tap_action: { action: 'call-service', service: 'switch.toggle', service_data: { entity_id: 'switch.x' } }
        },
        {
          entity_id: 'unknown.y',
          tap_action: { action: 'navigate', navigation_path: '/lovelace/y' }
        }
      ]
} as unknown as unknown as any);

    el.hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.x': makeMockEntity({ entity_id: 'switch.x', state: 'on' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Custom Hexa');
    
    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile');
    expect(tiles.length).to.equal(2);

    expect(tiles[0]!.getAttribute('data-active')).to.equal('true'); // on
    expect(tiles[0]!.textContent).to.include('Switch X');

    // Click on call-service tile
    (tiles[0] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'toggle', { entity_id: 'switch.x' });

    // Click on navigate tile
    const assignMock = vi.fn();
    vi.stubGlobal('window', { location: { assign: assignMock } });
    (tiles[1] as HTMLElement).click();
    expect(assignMock).toHaveBeenCalledWith('/lovelace/y');
    vi.unstubAllGlobals();
  });
});
