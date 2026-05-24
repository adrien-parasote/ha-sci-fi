/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';

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
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    document.body.appendChild(el);
    el.setConfig(SciFiHexaTilesCard.getStubConfig() as unknown as any);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('does NOT render weather alert when state is green, but renders it for non-green states', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: {
        activate: true,
        weather_alert_entity: 'sensor.alert',
        state_green: 'Vert',
        state_yellow: 'Jaune',
        state_orange: 'Orange',
        state_red: 'Rouge'
      }
    } as unknown as any);

    // Test green -> should not render anything
    el.hass = makeMockHass({ states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Vert' }) } });
    document.body.appendChild(el);
    await el.updateComplete;
    let alert = el.shadowRoot!.querySelector('.weather-alert') as HTMLElement;
    expect(alert).to.be.null;

    // Test red -> should render red banner
    el.hass = makeMockHass({ states: { 'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Rouge' }) } });
    await el.updateComplete;
    alert = el.shadowRoot!.querySelector('.weather-alert') as HTMLElement;
    expect(alert).not.to.be.null;
    expect(alert.getAttribute('data-level')).to.equal('red');
    expect(alert.textContent).to.include('Rouge');
  });

  it('renders connected user profile header with message, name, circular avatar and status badge', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      header_message: 'Hey, Welcome Back!',
      tiles: []
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'person.adrien': makeMockEntity({
          entity_id: 'person.adrien',
          state: 'home',
          attributes: {
            user_id: '1',
            friendly_name: 'Adrien',
            entity_picture: 'profile_pic.jpg'
          }
        }),
        'zone.home': makeMockEntity({
          entity_id: 'zone.home',
          state: '0',
          attributes: {
            persons: ['person.adrien'],
            icon: 'mdi:home-heart'
          }
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Check header elements
    const message = el.shadowRoot!.querySelector('.header-message') as HTMLElement;
    const name = el.shadowRoot!.querySelector('.header-name') as HTMLElement;
    const avatar = el.shadowRoot!.querySelector('.avatar img') as HTMLImageElement;
    const badge = el.shadowRoot!.querySelector('.status-badge sf-icon') as any;

    expect(message.textContent).to.include('Hey, Welcome Back!');
    expect(name.textContent).to.include('Adrien');
    expect(avatar.src).to.include('profile_pic.jpg');
    expect(badge.icon).to.equal('mdi:home-heart');
  });

  it('renders interlocking rows of 2 columns with left and right decorative half-hexagons', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [
        { entity: 'switch.t1', name: 'Tile 1' },
        { entity: 'switch.t2', name: 'Tile 2' },
        { entity: 'switch.t3', name: 'Tile 3' },
        { entity: 'switch.t4', name: 'Tile 4' },
        { entity: 'switch.t5', name: 'Tile 5' },
        { entity: 'switch.t6', name: 'Tile 6' }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'switch.t1': makeMockEntity({ entity_id: 'switch.t1', state: 'off' }),
        'switch.t2': makeMockEntity({ entity_id: 'switch.t2', state: 'off' }),
        'switch.t3': makeMockEntity({ entity_id: 'switch.t3', state: 'off' }),
        'switch.t4': makeMockEntity({ entity_id: 'switch.t4', state: 'off' }),
        'switch.t5': makeMockEntity({ entity_id: 'switch.t5', state: 'off' }),
        'switch.t6': makeMockEntity({ entity_id: 'switch.t6', state: 'off' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const rows = el.shadowRoot!.querySelectorAll('.hexa-row');
    expect(rows.length).to.equal(3);

    // Row 0 should chunk first 2 tiles and have left half-tile
    const row0 = rows[0] as HTMLElement;
    expect(row0.querySelectorAll('.hexa-tile').length).to.equal(2);
    expect(row0.querySelector('.hexa-half.left')).not.to.be.null;
    expect(row0.querySelector('.hexa-half.right')).to.be.null;

    // Row 1 should chunk next 2 tiles and have right half-tile
    const row1 = rows[1] as HTMLElement;
    expect(row1.querySelectorAll('.hexa-tile').length).to.equal(2);
    expect(row1.querySelector('.hexa-half.left')).to.be.null;
    expect(row1.querySelector('.hexa-half.right')).not.to.be.null;

    // Row 2 should chunk remaining 2 tiles and have left half-tile
    const row2 = rows[2] as HTMLElement;
    expect(row2.querySelectorAll('.hexa-tile').length).to.equal(2);
    expect(row2.querySelector('.hexa-half.left')).not.to.be.null;
    expect(row2.querySelector('.hexa-half.right')).to.be.null;
  });

  it('renders weather tile with temperature and link navigation', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    // ADR-005: weather_entity (not weather_entity_id)
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: { activate: true, weather_entity: 'weather.home', link: '/lovelace/weather' }
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: { temperature: 25.5 } })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tile = el.shadowRoot!.querySelector('.hexa-tile') as HTMLElement;
    expect(tile.textContent).to.include('25.5°');

    // Mock window.history.pushState (happy-dom has no history API)
    const pushStateMock = vi.fn();
    const dispatchMock = vi.fn();
    vi.stubGlobal('window', {
      ...window,
      history: { pushState: pushStateMock },
      dispatchEvent: dispatchMock,
      location: window.location,
      open: vi.fn(),
    });
    tile.click();
    expect(pushStateMock).toHaveBeenCalledWith(null, '', '/lovelace/weather');
    vi.unstubAllGlobals();
  });

  it('renders custom tiles with entity and link navigation', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      header_message: 'Custom Hexa',
      // ADR-005: entity (not entity_id), active_icon/inactive_icon (not icon), link (not tap_action)
      tiles: [
        {
          entity: 'switch.x',
          name: 'Switch X',
          active_icon: 'mdi:switch-on',
          inactive_icon: 'mdi:switch-off',
          state_on: ['on'],
          link: '/lovelace/lights'
        },
        {
          entity: 'binary_sensor.door',
          active_icon: 'mdi:door-open',
          inactive_icon: 'mdi:door-closed',
          link: '/lovelace/security'
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'switch.x': makeMockEntity({ entity_id: 'switch.x', state: 'on' }),
        'binary_sensor.door': makeMockEntity({ entity_id: 'binary_sensor.door', state: 'off', attributes: { friendly_name: 'Front Door' } })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Custom Hexa');

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile');
    expect(tiles.length).to.equal(2);

    // ADR-005: state_on = ['on'] → active when state === 'on'
    expect(tiles[0]!.getAttribute('data-active')).to.equal('true');
    expect(tiles[0]!.textContent).to.include('Switch X');
    const icon0 = tiles[0]!.querySelector('sf-icon') as unknown as any;
    expect(icon0.icon).to.equal('mdi:switch-on'); // ADR-005: active_icon

    // Inactive tile
    expect(tiles[1]!.getAttribute('data-active')).to.equal('false');
    expect(tiles[1]!.textContent).to.include('Front Door');
    const icon1 = tiles[1]!.querySelector('sf-icon') as unknown as any;
    expect(icon1.icon).to.equal('mdi:door-closed'); // ADR-005: inactive_icon

    // Click navigates via link
    const pushStateMock = vi.fn();
    vi.stubGlobal('window', {
      ...window,
      history: { pushState: pushStateMock },
      dispatchEvent: vi.fn(),
      location: window.location,
      open: vi.fn(),
    });
    (tiles[0] as HTMLElement).click();
    expect(pushStateMock).toHaveBeenCalledWith(null, '', '/lovelace/lights');
    vi.unstubAllGlobals();
  });

  it('renders person tiles using entity+state_on pattern', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    // ADR-005: persons are tiles with entity (no separate persons[] array)
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [
        {
          entity: 'person.bob',
          active_icon: 'mdi:account-check',
          inactive_icon: 'mdi:account-off',
          state_on: ['home']
        },
        {
          entity: 'person.alice',
          active_icon: 'mdi:account-check',
          inactive_icon: 'mdi:account-off',
          state_on: ['home']
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'person.bob': makeMockEntity({ entity_id: 'person.bob', state: 'home', attributes: { friendly_name: 'Bob' } }),
        'person.alice': makeMockEntity({ entity_id: 'person.alice', state: 'not_home', attributes: { friendly_name: 'Alice' } }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile');
    expect(tiles.length).to.equal(2);

    expect(tiles[0]!.getAttribute('data-active')).to.equal('true');  // Bob home
    expect(tiles[0]!.textContent).to.include('Bob');

    expect(tiles[1]!.getAttribute('data-active')).to.equal('false'); // Alice away
    expect(tiles[1]!.textContent).to.include('Alice');
  });

  it('navigates to external URL with window.open when link starts with https://', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    // Branch coverage: _navigate() L183-184 — external URLs use window.open, not pushState
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [{
        entity: 'switch.ext',
        active_icon: 'mdi:link',
        inactive_icon: 'mdi:link-off',
        link: 'https://example.com'
      }]
    } as unknown as any);

    el.hass = makeMockHass({
      states: { 'switch.ext': makeMockEntity({ entity_id: 'switch.ext', state: 'on' }) }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const openMock = vi.fn();
    vi.stubGlobal('window', {
      ...window,
      open: openMock,
      history: { pushState: vi.fn() },
      dispatchEvent: vi.fn(),
      location: window.location,
    });

    const tile = el.shadowRoot!.querySelector('.hexa-tile') as HTMLElement;
    tile.click();
    expect(openMock).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    vi.unstubAllGlobals();
  });
});
