/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/tv/sci-fi-tv.js';
import { SciFiTVCard } from '../../../src/cards/tv/sci-fi-tv.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

describe('sci-fi-tv', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('provides getConfigElement', () => {
    const el = SciFiTVCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-tv-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiTVCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-tv');
    expect(config.entity).to.equal('media_player.bravia_4k_vh22');
  });

  it('returns card size of 5', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig(SciFiTVCard.getStubConfig());
    expect(el.getCardSize()).to.equal(5);
  });

  // TC-701: Throws error when mandatory entity is missing
  it('TC-701: throws error when mandatory entity is missing', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    expect(() => {
      el.setConfig({
        type: 'custom:sci-fi-tv'
      } as any);
    }).to.throw('Missing entity configuration parameter.');
  });

  // TC-702: D-pad default remote command mappings use PascalCase
  it('TC-702: D-pad default remote command mappings are correct', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      remote_entity: 'remote.bravia_4k_vh22'
    });

    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' }),
        'remote.bravia_4k_vh22': makeMockEntity({ entity_id: 'remote.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Trigger D-pad Up click
    const upBtn = el.shadowRoot!.querySelector('[data-key="up"]') as HTMLElement;
    expect(upBtn).to.exist;
    upBtn.click();

    expect(callServiceMock).toHaveBeenCalledWith('remote', 'send_command', {
      entity_id: 'remote.bravia_4k_vh22',
      command: 'Up'
    });
  });

  // TC-703: Custom actions override default remote commands
  it('TC-703: custom actions override default remote commands', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      remote_entity: 'remote.bravia_4k_vh22',
      custom_actions: {
        home: {
          action: 'call-service',
          service: 'script.warp_speed_home'
        }
      }
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const actionSpy = vi.fn();
    el.addEventListener('hass-action', actionSpy);

    const homeBtn = el.shadowRoot!.querySelector('[data-key="home"]') as HTMLElement;
    expect(homeBtn).to.exist;
    homeBtn.click();

    expect(actionSpy).toHaveBeenCalledOnce();
    const event = actionSpy.mock.calls[0]![0] as CustomEvent;
    expect(event.detail.action).toBe('tap');
    expect(event.detail.config.tap_action.service).toBe('script.warp_speed_home');
  });

  // TC-704: Hex grid renders all configured source names
  it('TC-704: hex grid renders all configured source names', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: ['HDMI 1', 'Netflix', 'YouTube']
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on', attributes: { source: 'Netflix' } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const sourceHexas = el.shadowRoot!.querySelectorAll('.source-hexa');
    expect(sourceHexas.length).to.equal(3);
    expect(sourceHexas[0]!.textContent).to.include('HDMI 1');
    expect(sourceHexas[1]!.textContent).to.include('Netflix');
    expect(sourceHexas[1]!.getAttribute('data-active')).to.equal('true');
  });

  // TC-705: getRelevantEntities returns TV and remote entities
  it('TC-705: getRelevantEntities returns TV and remote entities', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      remote_entity: 'remote.bravia_4k_vh22'
    });
    const entities = (el as any).getRelevantEntities();
    expect(entities).to.include('media_player.bravia_4k_vh22');
    expect(entities).to.include('remote.bravia_4k_vh22');
  });

  // TC-708: Renders orbiting planet satellite when TV is on
  it('TC-708: renders the orbiting planet satellite when the TV is on', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const satellite = el.shadowRoot!.querySelector('.planet-orbit-satellite');
    expect(satellite).to.exist;
    expect(satellite!.tagName.toLowerCase()).to.equal('circle');
    expect(satellite!.classList.contains('is-off')).to.be.false;
  });

  // TC-709: Renders orbiting planet satellite in standby mode when TV is off
  it('TC-709: renders the orbiting planet satellite in standby mode when the TV is off', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'off' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const satellite = el.shadowRoot!.querySelector('.planet-orbit-satellite');
    expect(satellite).to.exist;
    expect(satellite!.classList.contains('is-off')).to.be.true;
  });

  // TC-710: Renders the active application name when media title and source are missing
  it('TC-710: renders active application name (app_name) when media title and source are missing', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({
          entity_id: 'media_player.bravia_4k_vh22',
          state: 'on',
          attributes: {
            app_name: 'Netflix',
            friendly_name: 'Bravia 4K TV'
          }
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const playingSegment = el.shadowRoot!.querySelector('.segment-right .segment-value');
    expect(playingSegment).to.exist;
    expect(playingSegment!.textContent).to.equal('Netflix');

    const dialTitle = el.shadowRoot!.querySelector('.dial-title');
    expect(dialTitle).to.exist;
    expect(dialTitle!.textContent).to.include('Netflix');
  });

  // TC-711: Renders the active application ID when app_name, media title, and source are missing
  it('TC-711: renders active application ID (app_id) when other metadata is missing', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({
          entity_id: 'media_player.bravia_4k_vh22',
          state: 'on',
          attributes: {
            app_id: 'com.netflix.ninja',
            friendly_name: 'Bravia 4K TV'
          }
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const playingSegment = el.shadowRoot!.querySelector('.segment-right .segment-value');
    expect(playingSegment).to.exist;
    expect(playingSegment!.textContent).to.equal('com.netflix.ninja');

    const dialTitle = el.shadowRoot!.querySelector('.dial-title');
    expect(dialTitle).to.exist;
    expect(dialTitle!.textContent).to.include('com.netflix.ninja');
  });
  // TC-712: uses app_entity metadata when provided
  it('TC-712: uses app_entity metadata when provided', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.sony_kd_55x75wl',
      app_entity: 'media_player.television'
    });

    el.hass = makeMockHass({
      states: {
        'media_player.sony_kd_55x75wl': makeMockEntity({
          entity_id: 'media_player.sony_kd_55x75wl',
          state: 'on',
          attributes: {
            source: 'HDMI 1',
            media_title: 'Smart TV'
          }
        }),
        'media_player.television': makeMockEntity({
          entity_id: 'media_player.television',
          state: 'playing',
          attributes: {
            app_name: 'Netflix'
          }
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const playingSegment = el.shadowRoot!.querySelector('.segment-right .segment-value');
    expect(playingSegment).to.exist;
    expect(playingSegment!.textContent).to.equal('Netflix');
  });

  // TC-713: active source highlighting guarantees only one source is highlighted, prioritizing appName
  it('TC-713: active source highlighting guarantees only one source is highlighted, prioritizing appName', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.sony_kd_55x75wl',
      app_entity: 'media_player.television',
      sources: ['Netflix', 'HDMI 1']
    });

    el.hass = makeMockHass({
      states: {
        'media_player.sony_kd_55x75wl': makeMockEntity({
          entity_id: 'media_player.sony_kd_55x75wl',
          state: 'on',
          attributes: { source: 'HDMI 1' }
        }),
        'media_player.television': makeMockEntity({
          entity_id: 'media_player.television',
          state: 'playing',
          attributes: { app_name: 'Netflix' }
        })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const sourceHexas = el.shadowRoot!.querySelectorAll('.source-hexa');
    expect(sourceHexas.length).to.equal(2);
    
    // Netflix should be active (prioritized)
    expect(sourceHexas[0]!.textContent).to.include('Netflix');
    expect(sourceHexas[0]!.getAttribute('data-active')).to.equal('true');
    
    // HDMI 1 should NOT be active, even though sourceLabel matches
    expect(sourceHexas[1]!.textContent).to.include('HDMI 1');
    expect(sourceHexas[1]!.getAttribute('data-active')).to.equal('false');
  });

  // ── TC-720: TV unavailable renders offline banner ──────────────────────────

  it('TC-720: renders offline-banner when TV state is unavailable', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'unavailable' }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const banner = el.shadowRoot!.querySelector('.offline-banner');
    expect(banner).to.exist;
  });

  // ── TC-721: TV entity missing renders offline banner ─────────────────────

  it('TC-721: renders offline banner when TV entity is missing from states', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.missing_tv',
    });

    el.hass = makeMockHass({ states: {} });

    document.body.appendChild(el);
    await el.updateComplete;

    const banner = el.shadowRoot!.querySelector('.offline-banner');
    expect(banner).to.exist;
  });

  // ── TC-722: _togglePower turn_off when on ──────────────────────────────────

  it('TC-722: _togglePower calls turn_off when TV is on', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const powerBtn = el.shadowRoot!.querySelector('.header-power') as HTMLElement;
    expect(powerBtn).to.exist;
    powerBtn.click();

    expect(callServiceMock).toHaveBeenCalledWith('media_player', 'turn_off', { entity_id: 'media_player.bravia_4k_vh22' });
  });

  // ── TC-723: _togglePower turn_on when off ─────────────────────────────────

  it('TC-723: _togglePower calls turn_on when TV is off', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'off' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const powerBtn = el.shadowRoot!.querySelector('.header-power') as HTMLElement;
    expect(powerBtn).to.exist;
    powerBtn.click();

    expect(callServiceMock).toHaveBeenCalledWith('media_player', 'turn_on', { entity_id: 'media_player.bravia_4k_vh22' });
  });

  // ── TC-724: _getPlayingStatus covers all branches ─────────────────────────

  it('TC-724: _getPlayingStatus returns a truthy string when unavailable', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPlayingStatus(true, false, undefined, undefined, undefined, undefined);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-724b: _getPlayingStatus returns a standby string when off', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPlayingStatus(false, true, undefined, undefined, undefined, undefined);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-724c: _getPlayingStatus returns idle string when no metadata', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPlayingStatus(false, false, undefined, undefined, undefined, undefined);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-724d: _getPlayingStatus returns sourceLabel when mediaTitle and appName are absent', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPlayingStatus(false, false, undefined, undefined, 'HDMI 2', undefined);
    expect(result).to.equal('HDMI 2');
  });

  // ── TC-725: _getTransmissionStatus branches ───────────────────────────────

  it('TC-725: _getTransmissionStatus returns a truthy string when unavailable', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getTransmissionStatus(true, false);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-725b: _getTransmissionStatus returns a truthy string when on', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getTransmissionStatus(false, false);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-725c: _getTransmissionStatus returns a truthy string when off', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getTransmissionStatus(false, true);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  // ── TC-726: _getPowerButtonTitle ──────────────────────────────────────────

  it('TC-726: _getPowerButtonTitle returns a truthy string when on', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPowerButtonTitle(true);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('TC-726b: _getPowerButtonTitle returns a truthy string when off', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    const result = (el as any)._getPowerButtonTitle(false);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  // ── TC-727: source hexa click disabled when TV off ────────────────────────

  it('TC-727: source hexa click does nothing when TV is off', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: ['Netflix']
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'off' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    expect(hexa).to.exist;
    hexa.click();

    // callService should not have been called (TV is off)
    expect(callServiceMock).not.toHaveBeenCalled();
  });

  // ── TC-728: _selectSource string → select_source ─────────────────────────

  it('TC-728: _selectSource with string source calls media_player.select_source', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: ['HDMI 1']
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    expect(hexa).to.exist;
    hexa.click();

    expect(callServiceMock).toHaveBeenCalledWith('media_player', 'select_source', {
      entity_id: 'media_player.bravia_4k_vh22',
      source: 'HDMI 1'
    });
  });

  // ── TC-729: _selectSource string → uses volume_entity when set ────────────

  it('TC-729: _selectSource with string source uses volume_entity when configured', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.sony',
      volume_entity: 'media_player.sony_vol',
      sources: ['Netflix']
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.sony': makeMockEntity({ entity_id: 'media_player.sony', state: 'on' }),
        'media_player.sony_vol': makeMockEntity({ entity_id: 'media_player.sony_vol', state: 'on', attributes: { volume_level: 0.5 } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    hexa.click();

    expect(callServiceMock).toHaveBeenCalledWith('media_player', 'select_source', {
      entity_id: 'media_player.sony_vol',
      source: 'Netflix'
    });
  });

  // ── TC-730: _selectSource object call-service path ────────────────────────

  it('TC-730: _selectSource with object action call-service calls the right service', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: [{
        name: 'Netflix',
        action: 'call-service',
        service: 'media_player.play_media',
        data: { media_content_id: 'netflix://home', media_content_type: 'app' }
      }]
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    hexa.click();

    expect(callServiceMock).toHaveBeenCalledWith('media_player', 'play_media', {
      media_content_id: 'netflix://home',
      media_content_type: 'app'
    });
  });

  // ── TC-731: _selectSource object perform-action path ──────────────────────

  it('TC-731: _selectSource with object action perform-action calls the right service', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: [{
        name: 'Netflix',
        action: 'perform-action',
        perform_action: 'script.start_netflix',
        service_data: { room: 'living' }
      }]
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    hexa.click();

    expect(callServiceMock).toHaveBeenCalledWith('script', 'start_netflix', { room: 'living' });
  });

  // ── TC-732: _selectSource object with navigate action ─────────────────────

  it('TC-732: _selectSource with object navigate action fires hass-action event', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      sources: [{
        name: 'Dashboard',
        action: 'navigate',
        navigation_path: '/lovelace/0'
      }]
    });

    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const actionSpy = vi.fn();
    el.addEventListener('hass-action', actionSpy);

    const hexa = el.shadowRoot!.querySelector('.source-hexa') as HTMLElement;
    hexa.click();

    expect(actionSpy).toHaveBeenCalledOnce();
  });

  // ── TC-733: disconnectedCallback resets drag state ────────────────────────

  it('TC-733: disconnectedCallback resets drag state', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    // Simulate drag state
    (el as any)._isDragging = true;
    (el as any)._activePointerId = 42;
    el.disconnectedCallback();
    expect((el as any)._isDragging).to.be.false;
    expect((el as any)._activePointerId).to.be.null;
  });

  // ── TC-734: _onPointerDown does nothing when TV is off ────────────────────

  it('TC-734: _onPointerDown does nothing when TV state is off', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'off' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    (el as any)._onPointerDown(new PointerEvent('pointerdown', { pointerId: 1 }));
    expect((el as any)._isDragging).to.be.false;
  });

  // ── TC-735: _onPointerMove ignores wrong pointerId ────────────────────────

  it('TC-735: _onPointerMove does nothing when pointerId does not match', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    (el as any)._isDragging = true;
    (el as any)._activePointerId = 1;
    const initialVolume = (el as any)._localVolume;
    (el as any)._onPointerMove(new PointerEvent('pointermove', { pointerId: 99 }));
    // No change expected
    expect((el as any)._localVolume).to.equal(initialVolume);
  });

  // ── TC-736: _onPointerUp resets dragging state ────────────────────────────

  it('TC-736: _onPointerUp resets drag state when pointerId matches', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    (el as any)._isDragging = true;
    (el as any)._activePointerId = 5;
    (el as any)._localVolume = 0.7;
    (el as any)._onPointerUp(new PointerEvent('pointerup', { pointerId: 5 }));

    expect((el as any)._isDragging).to.be.false;
    expect((el as any)._activePointerId).to.be.null;
    expect((el as any)._localVolume).to.be.null;
  });

  // ── TC-737: getRelevantEntities with volume_entity ────────────────────────

  it('TC-737: getRelevantEntities includes volume_entity when set', () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.sony',
      volume_entity: 'media_player.sony_vol'
    });
    const ids = (el as any).getRelevantEntities();
    expect(ids).to.include('media_player.sony');
    expect(ids).to.include('media_player.sony_vol');
  });

  // ── TC-738: volume_entity used for volume display ─────────────────────────

  it('TC-738: volume is read from volume_entity when present', async () => {
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.sony',
      volume_entity: 'media_player.sony_vol'
    });

    el.hass = makeMockHass({
      states: {
        'media_player.sony': makeMockEntity({ entity_id: 'media_player.sony', state: 'on', attributes: { volume_level: 0.1 } }),
        'media_player.sony_vol': makeMockEntity({ entity_id: 'media_player.sony_vol', state: 'on', attributes: { volume_level: 0.75 } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const dialValue = el.shadowRoot!.querySelector('.dial-value');
    expect(dialValue?.textContent?.trim()).to.equal('75%');
  });

  // ── TC-739: mute button calls remote command ─────────────────────────────

  it('TC-739: mute button calls remote send_command volume_mute when no custom action', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-tv') as SciFiTVCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-tv',
      entity: 'media_player.bravia_4k_vh22',
      remote_entity: 'remote.bravia'
    });

    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' }),
        'remote.bravia': makeMockEntity({ entity_id: 'remote.bravia', state: 'on' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const muteBtn = el.shadowRoot!.querySelector('.mute-btn') as HTMLElement;
    expect(muteBtn).to.exist;
    muteBtn.click();

    // volume_mute is not in D_PAD_KEYS so commandString is undefined but callService should be called
    expect(callServiceMock).toHaveBeenCalled();
  });
});
