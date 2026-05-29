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
});
