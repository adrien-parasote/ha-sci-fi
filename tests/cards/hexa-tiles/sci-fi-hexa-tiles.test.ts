 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { SciFiHexaTilesCard } from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';
import { hexaTilesStyles } from '../../../src/cards/hexa-tiles/styles.js';

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

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 375);
    vi.stubGlobal('innerHeight', 812);
  });

  afterEach(async () => {
    await setLocale('fr');
    document.body.replaceChildren();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
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

  // Mutant: header built from the wrong person (first person.* instead of the one whose user_id
  // matches hass.user.id), or the zone lookup dropped (badge stuck on the default icon).
  it('TC-BTG-U-04 TC-HEXA-TILES-U-701 TC-HEXA-TILES-U-702: header names the connected user with the zone icon of their zone, falls back when absent', async () => {
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
        // Another person, listed after, with another user_id and its own zone: must be ignored.
        'person.autre': makeMockEntity({
          entity_id: 'person.autre',
          state: 'home',
          attributes: { user_id: '2', friendly_name: 'Autre' }
        }),
        'zone.work': makeMockEntity({
          entity_id: 'zone.work',
          state: '0',
          attributes: { persons: ['person.autre'], icon: 'mdi:briefcase' }
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
    expect(name.textContent).not.to.include('Autre');

    // Connected user matching no person: hass.user.name, initial, default home icon.
    const absent = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    absent.setConfig({ type: 'custom:sci-fi-hexa-tiles', tiles: [] } as unknown as any);
    absent.hass = {
      ...makeMockHass({
        states: {
          'person.autre': makeMockEntity({
            entity_id: 'person.autre',
            state: 'home',
            attributes: { user_id: '2', friendly_name: 'Autre' }
          })
        }
      }),
      user: { id: '9', name: 'Zoe', is_admin: false }
    } as any;
    document.body.appendChild(absent);
    await absent.updateComplete;
    expect(absent.shadowRoot!.querySelector('.header-name')!.textContent).to.include('Zoe');
    expect(absent.shadowRoot!.querySelector('.avatar-initials')!.textContent).to.equal('Z');
    expect((absent.shadowRoot!.querySelector('.status-badge sf-icon') as any).icon).to.equal('mdi:home');
  });

  // Mutant: always render the banner on green; drop a half-hexagon (left of row 0 / right of row 1);
  // invert data-active.
  it('TC-BTG-U-05 TC-HEXA-TILES-U-703 TC-HEXA-TILES-U-704 TC-HEXA-TILES-U-705: green alert has no banner, rows interlock with half-hexagons, data-active follows the state', async () => {
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
    expect(rows.length).to.equal(5);

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

    // data-active: the six tiles are off.
    const offTiles = Array.from(el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]'));
    expect(offTiles.length).to.equal(6);
    for (const t of offTiles) expect(t.getAttribute('data-active')).to.equal('false');

    // One tile on, one off: data-active true / false, not inverted.
    el.hass = makeMockHass({
      states: {
        'switch.t1': makeMockEntity({ entity_id: 'switch.t1', state: 'on' }),
        'switch.t2': makeMockEntity({ entity_id: 'switch.t2', state: 'off' })
      }
    });
    await el.updateComplete;
    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]');
    expect(tiles[0]?.getAttribute('data-active')).to.equal('true');
    expect(tiles[1]?.getAttribute('data-active')).to.equal('false');

    // Green alert on a weather header: no banner in the DOM.
    const green = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    green.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: {
        activate: true,
        weather_entity: 'weather.home',
        weather_alert_entity: 'sensor.alert',
        state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge'
      }
    } as unknown as any);
    green.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny' }),
        'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state: 'Vert' })
      }
    });
    document.body.appendChild(green);
    await green.updateComplete;
    expect(green.shadowRoot!.querySelector('.weather-tile'), 'the weather tile is rendered').not.to.be.null;
    expect(green.shadowRoot!.querySelector('.weather-alert')).to.be.null;
  });

  // Mutant: swap two levels (yellow/orange); 'green' hard-coded; data-alert-level attribute not written.
  it('TC-BTG-U-03 TC-HEXA-TILES-U-708 TC-HEXA-TILES-U-709: weather tile data-alert-level follows the alert entity state, green when unmapped or absent', async () => {
    const levelFor = async (alertState: string | null) => {
      const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
      el.setConfig({
        type: 'custom:sci-fi-hexa-tiles',
        weather: {
          activate: true,
          weather_entity: 'weather.home',
          ...(alertState === null ? {} : { weather_alert_entity: 'sensor.alert' }),
          state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge'
        }
      } as unknown as any);
      const states: Record<string, any> = {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny' })
      };
      if (alertState !== null) {
        states['sensor.alert'] = makeMockEntity({ entity_id: 'sensor.alert', state: alertState });
      }
      el.hass = makeMockHass({ states });
      document.body.appendChild(el);
      await el.updateComplete;
      const tile = el.shadowRoot!.querySelector('.weather-tile');
      expect(tile, 'the weather tile must render').not.toBeNull();
      const level = tile!.getAttribute('data-alert-level');
      el.remove();
      return level;
    };

    expect(await levelFor('Jaune')).to.equal('yellow');
    expect(await levelFor('Orange')).to.equal('orange');
    expect(await levelFor('Rouge')).to.equal('red');
    expect(await levelFor('Vert')).to.equal('green');
    expect(await levelFor('EtatInconnu')).to.equal('green');
    expect(await levelFor(null)).to.equal('green');
  });

  it('renders weather tile with custom weather icon and city name and link navigation', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    // ADR-005: weather_entity (not weather_entity_id)
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: { activate: true, weather_entity: 'weather.home', link: '/lovelace/weather' }
    } as unknown as any);

    // Test 1: Day (sunny) should be active
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: {
            temperature: 25.5,
            friendly_name: 'La Chapelle-sur-Erdre'
          }
        })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    let tile = el.shadowRoot!.querySelector('.hexa-tile') as HTMLElement;
    expect(tile.textContent).to.include('La Chapelle-sur-Erdre');
    expect(tile.textContent).not.to.include('25.5°');
    expect(tile.getAttribute('data-active')).to.equal('true');

    const iconEl = tile.querySelector('sf-icon') as any;
    expect(iconEl).not.to.be.null;
    expect(iconEl.icon).to.equal('sf:sunny-day');

    // Test 2: Night (clear-night) should be inactive
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'clear-night',
          attributes: {
            temperature: 15.0,
            friendly_name: 'La Chapelle-sur-Erdre'
          }
        })
      }
    });
    await el.updateComplete;

    tile = el.shadowRoot!.querySelector('.hexa-tile') as HTMLElement;
    expect(tile.getAttribute('data-active')).to.equal('false');

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

  it('TC-501: renders custom tiles with entity and link navigation', async () => {
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

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]');
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

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]');
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

  it('renders non-standalone (aggregated kind) tiles and resolves active state correctly', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [
        {
          standalone: false,
          entity_kind: 'light',
          name: 'Lumières',
          entities_to_exclude: ['light.excluded'],
          state_on: ['on']
        },
        {
          standalone: false,
          entity_kind: 'climate',
          name: 'Chauffage',
          state_on: ['auto', 'heat']
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'light.l1': makeMockEntity({ entity_id: 'light.l1', state: 'off' }),
        'light.l2': makeMockEntity({ entity_id: 'light.l2', state: 'on' }),
        'light.excluded': makeMockEntity({ entity_id: 'light.excluded', state: 'on' }),
        'climate.c1': makeMockEntity({ entity_id: 'climate.c1', state: 'off' }),
        'climate.c2': makeMockEntity({ entity_id: 'climate.c2', state: 'heat' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tiles = el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]');
    expect(tiles.length).to.equal(2);

    // Light tile: active because light.l2 is 'on' (and l1 is off, excluded is ignored)
    expect(tiles[0]!.getAttribute('data-active')).to.equal('true');
    expect(tiles[0]!.textContent).to.include('Lumières');

    // Climate tile: active because climate.c2 is 'heat'
    expect(tiles[1]!.getAttribute('data-active')).to.equal('true');
    expect(tiles[1]!.textContent).to.include('Chauffage');
  });

  it('handles media_player playing state as active when state_on includes on', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [
        {
          standalone: true,
          entity: 'media_player.bravia_4k_vh22',
          name: 'Télévision',
          state_on: ['on']
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'playing' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tile = el.shadowRoot!.querySelector('.hexa-tile[role="button"]') as HTMLElement;
    expect(tile.getAttribute('data-active')).to.equal('true');
    expect(tile.textContent).to.include('Télévision');
  });

  it('covers various fallback branches including avatar error, weather conditions, alert levels, and media_player default state', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      header_message: 'Hey, Welcome Back!',
      weather: {
        activate: true,
        weather_entity: 'weather.home',
        weather_alert_entity: 'sensor.alert',
        state_green: 'Vert',
        state_yellow: 'Jaune',
        state_orange: 'Orange',
        state_red: 'Rouge'
      },
      tiles: [
        {
          entity: 'media_player.living_room_tv',
          name: 'TV'
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'person.adrien': makeMockEntity({
          entity_id: 'person.adrien',
          state: 'home',
          attributes: {
            user_id: '1',
            friendly_name: 'Adrien',
            entity_picture: 'profile_pic_broken.jpg'
          }
        }),
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'unsupported_condition', // Should trigger fallback to cloudy
          attributes: {
            friendly_name: 'Météo'
          }
        }),
        'sensor.alert': makeMockEntity({
          entity_id: 'sensor.alert',
          state: 'UnknownColorState' // Should default to 'green' and hide the alert
        }),
        'media_player.living_room_tv': makeMockEntity({
          entity_id: 'media_player.living_room_tv',
          state: 'playing'
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // 1. Trigger @error on avatar img
    const avatarImg = el.shadowRoot!.querySelector('.avatar img') as HTMLImageElement;
    expect(avatarImg).to.exist;
    avatarImg.dispatchEvent(new Event('error'));
    expect(avatarImg.style.display).to.equal('none');

    // 2. Weather alert fallback to 'green' (should not render alert banner)
    const alertBanner = el.shadowRoot!.querySelector('.weather-alert');
    expect(alertBanner).to.be.null;

    // 3. Unsupported weather condition fallback (should fallback to sf:cloudy-day)
    const weatherIcon = el.shadowRoot!.querySelector('.weather-tile sf-icon') as any;
    expect(weatherIcon).to.exist;
    expect(weatherIcon.icon).to.equal('sf:cloudy-day');

    // 4. media_player default state checking (active when playing)
    const mediaTile = el.shadowRoot!.querySelectorAll('.hexa-tile[role="button"]')[0] as HTMLElement;
    expect(mediaTile.getAttribute('data-active')).to.equal('true');
  });

  it('IT-111: Hexa-tiles handles custom click action and dispatches hass-action event', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [
        {
          entity: 'light.living_room',
          name: 'Living Room Light',
          tap_action: {
            action: 'call-service',
            service: 'light.turn_on',
            service_data: { entity_id: 'light.living_room' }
          }
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'light.living_room': makeMockEntity({ entity_id: 'light.living_room', state: 'off' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const tile = el.shadowRoot!.querySelector('.hexa-tile[role="button"]') as HTMLElement;
    expect(tile).to.exist;

    const spy = vi.fn();
    el.addEventListener('hass-action', spy);

    tile.click();

    expect(spy).toHaveBeenCalledOnce();
    const event = spy.mock.calls[0]![0] as CustomEvent;
    expect(event.detail.action).toBe('tap');
    expect(event.detail.config.entity).toBe('light.living_room');
    expect(event.detail.config.tap_action.action).toBe('call-service');
  });

  // ── Weather alert banner label ────────────────────────────────────────────

  async function mountWithAlert(alertAttributes: Record<string, unknown>, alertState: string) {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      weather: {
        activate: true,
        weather_alert_entity: 'sensor.alert',
        state_green: 'Vert',
        state_yellow: 'Jaune',
        state_orange: 'Orange',
        state_red: 'Rouge',
      },
    } as any);
    el.hass = makeMockHass({
      states: {
        'sensor.alert': makeMockEntity({
          entity_id: 'sensor.alert',
          state: alertState,
          attributes: alertAttributes,
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('TC-HEXA-TILES-U-706 TC-I18N-U-15: alert banner names the phenomenon whose attribute matches a non-green level', async () => {
    await setLocale('fr');
    const el = await mountWithAlert({ canicule: 'Jaune', vent: 'Vert' }, 'Jaune');
    const banner = el.shadowRoot!.querySelector('.weather-alert');
    expect(banner, 'a non-green alert must render the banner').not.toBeNull();
    expect(banner!.textContent).toContain('Alerte météo');
    expect(banner!.textContent).toContain('canicule');
    // 'vent' is green — it must not be listed.
    expect(banner!.textContent).not.toContain('vent');
  });

  it('TC-HEXA-TILES-U-707 TC-I18N-U-15: alert banner falls back to the entity state when no attribute matches', async () => {
    await setLocale('fr');
    const el = await mountWithAlert({ friendly_name: 'Vigilance' }, 'Orange');
    const banner = el.shadowRoot!.querySelector('.weather-alert');
    expect(banner).not.toBeNull();
    expect(banner!.textContent).toContain('Alerte météo');
    expect(banner!.textContent).toContain('Orange');
  });

  // ── Layout & theming contracts ────────────────────────────────────────────
  //
  // IT-BTG-I-03: the sheet is mounted in the card and read through getComputedStyle.
  // CANARY (spec assumption 4): happy-dom resolves an adopted stylesheet. Measured at
  // BUILD: the branch COMPUTED held (the :host rule of the adopted sheet is read back,
  // `var(--cols, 2)` resolved to 2). Note: happy-dom does not inherit custom properties
  // to descendants, so --tile-width is read on the host, where the :host rule applies.
  // If the canary ever fails, the test fails loudly (accepted-limit branch = cssText
  // regexes, not needed today).

  async function mountGrid() {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [{ entity: 'switch.a', name: 'A' }, { entity: 'switch.b', name: 'B' }],
    } as unknown as any);
    el.hass = makeMockHass({
      states: {
        'switch.a': makeMockEntity({ entity_id: 'switch.a', state: 'on' }),
        'switch.b': makeMockEntity({ entity_id: 'switch.b', state: 'off' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  // Mutant: 0.5 -> 1 in --tile-width; row overlap factor dropped; a level colour changed;
  // the glow (drop-shadow / text-shadow) dropped; a --sf-primary fallback removed.
  it('IT-BTG-I-03 IT-HEXA-TILES-I-701 IT-HEXA-TILES-I-702 IT-HEXA-TILES-I-703: grid divides the width by cols + 0.5, active tiles glow, each alert level has its stroke, --sf-primary has fallbacks', async () => {
    const el = await mountGrid();
    const sr = el.shadowRoot!;

    // Canary: the adopted sheet is resolved by getComputedStyle.
    const tileWidth = getComputedStyle(el).getPropertyValue('--tile-width');
    expect(tileWidth, 'happy-dom does not resolve this sheet').not.toBe('');

    // 701: 2 columns -> 2.5 hexagons across exactly 100% of the width.
    expect(tileWidth).to.equal('calc(100% / (2 + 0.5))');
    expect(getComputedStyle(el).getPropertyValue('--tile-height')).to.contain('* 1.1547');
    // Each row climbs a quarter of a tile into the one above.
    expect(getComputedStyle(sr.querySelector('.hexa-row')!).marginBottom).to.contain('* -0.25');

    // 702: the active tile glows (SVG border and label).
    const active = sr.querySelector('.hexa-tile[data-active="true"]')!;
    const inactive = sr.querySelector('.hexa-tile[data-active="false"]')!;
    expect(getComputedStyle(active.querySelector('.hexa-border')!).filter).to.contain('drop-shadow');
    expect(getComputedStyle(active.querySelector('.tile-label')!).textShadow).not.to.be.oneOf(['', 'none']);
    // The inactive tile has no glow: the rule is anchored on data-active.
    expect(getComputedStyle(inactive.querySelector('.hexa-border')!).filter).not.to.contain('drop-shadow');

    // 702: each alert level has its stroke.
    const strokes: Record<string, string> = { Jaune: '#ffd60a', Orange: '#ff6b35', Rouge: '#ff4d6d' };
    for (const [state, stroke] of Object.entries(strokes)) {
      document.body.replaceChildren();
      const w = await (async () => {
        const e = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
        e.setConfig({
          type: 'custom:sci-fi-hexa-tiles',
          weather: {
            activate: true, weather_entity: 'weather.home', weather_alert_entity: 'sensor.alert',
            state_green: 'Vert', state_yellow: 'Jaune', state_orange: 'Orange', state_red: 'Rouge'
          }
        } as unknown as any);
        e.hass = makeMockHass({
          states: {
            'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny' }),
            'sensor.alert': makeMockEntity({ entity_id: 'sensor.alert', state }),
          },
        });
        document.body.appendChild(e);
        await e.updateComplete;
        return e;
      })();
      const border = w.shadowRoot!.querySelector('.weather-tile .hexa-border')!;
      expect(getComputedStyle(border).stroke, `alert ${state}`).to.equal(stroke);
    }

    // 703: computation erases var(), so the fallbacks are read on the exported cssText.
    const cssText = hexaTilesStyles.cssText;
    // The bare variable is only accepted inside color-mix(), by design: strip those declarations.
    const withoutMix = cssText.replace(/color-mix\([^;]*;/g, ';');
    const uses = withoutMix.match(/var\(--sf-primary[^)]*\)/g) ?? [];
    expect(uses.length, '--sf-primary must drive the theme').toBeGreaterThan(5);
    // Every plain usage carries a fallback so an HA theme without the variable still paints
    // (color-mix() declarations are stripped above).
    for (const use of uses) {
      expect(use, `${use} must carry a hex fallback`).toMatch(/var\(--sf-primary,\s*#[0-9a-fA-F]{3,6}\)/);
    }
  });
});
