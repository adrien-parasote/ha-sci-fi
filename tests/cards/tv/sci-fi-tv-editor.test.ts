// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/cards/tv/sci-fi-tv-editor.js';
import type { SciFiTVEditor } from '../../../src/cards/tv/sci-fi-tv-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return {
    type: 'custom:sci-fi-tv',
    entity: 'media_player.bravia_4k_vh22',
    ...overrides
  };
}

async function createElement(): Promise<SciFiTVEditor> {
  const el = document.createElement('sci-fi-tv-editor') as SciFiTVEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-tv-editor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor structure when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;
    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('loads media_player and remote entities from hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    const mockHass = {
      ...makeMockHass(),
      states: {
        'media_player.bravia_4k_vh22': { entity_id: 'media_player.bravia_4k_vh22', state: 'on', attributes: { friendly_name: 'Bravia TV' } },
        'remote.bravia_4k_vh22': { entity_id: 'remote.bravia_4k_vh22', state: 'on' },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;
    el.hass = mockHass;
    await el.updateComplete;
    expect((el as any)._mediaPlayers).toBeDefined();
    expect((el as any)._remotes).toBeDefined();
  });

  it('dispatches config-changed when main entity dropdown changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="entity"]')!;
    dropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entity', value: 'media_player.other_tv' }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.entity).toBe('media_player.other_tv');
  });

  it('dispatches config-changed when remote_entity changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="remote_entity"]')!;
    dropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'remote_entity', value: 'remote.other_remote' }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.remote_entity).toBe('remote.other_remote');
  });

  it('dispatches config-changed when name input changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="name"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'name', value: 'Bridge Quadrant 4' }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.name).toBe('Bridge Quadrant 4');
  });

  // TC-TV-U-714
  it('renders one sf-editor-action per button the card actually renders', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    // 10: the 8 D-pad and supplementary buttons, plus power and volume_mute.
    // `info` is deliberately absent — no info button exists to bind — and the
    // confirm selector replaces the `enter` one the card never read.
    const actionEditors = el.shadowRoot!.querySelectorAll('sf-editor-action');
    expect(actionEditors.length).toBe(10);
    const ids = [...actionEditors].map(e => e.getAttribute('element-id'));
    expect(ids).to.include('confirm');
    expect(ids).to.not.include('enter');
    expect(ids).to.not.include('info');
  });

  it('TC-TV-U-715: handles fallback for ha-selector in mock environment without crashing', async () => {
    // In Vitest happy-dom, ha-selector is not defined, so it's naturally a mock environment
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_actions: {
        home: { action: 'navigate', navigation_path: '/test' }
      }
    }));
    await el.updateComplete;
    
    // Test that sf-editor-action renders a fallback textarea
    const actionEditor = el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]');
    expect(actionEditor).not.toBeNull();
  });

  // TC-716: _handleSourceListUpdate dispatches with non-empty sources
  it('TC-716: dispatches config-changed with sources when source-list-update fires with items', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const sourceList = el.shadowRoot!.querySelector('sf-editor-source-list');
    expect(sourceList).not.toBeNull();
    sourceList!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { value: ['HDMI 1', 'Netflix'] }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.sources).toEqual(['HDMI 1', 'Netflix']);
  });

  // TC-717: _handleSourceListUpdate clears sources when empty array
  it('TC-717: dispatches config-changed with undefined sources when source list is empty', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ sources: ['HDMI 1'] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const sourceList = el.shadowRoot!.querySelector('sf-editor-source-list');
    sourceList!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { value: [] }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.sources).toBeUndefined();
  });

  // TC-718: _handleActionUpdate sets custom_action
  it('TC-718: dispatches config-changed with updated custom_action when action-update fires', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const actionEditor = el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]');
    expect(actionEditor).not.toBeNull();
    actionEditor!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'home', value: { action: 'navigate', navigation_path: '/test' } }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.custom_actions?.home).toEqual({ action: 'navigate', navigation_path: '/test' });
  });

  // TC-718b: _handleActionUpdate removes custom_action when set to 'none'
  it('TC-718b: dispatches config-changed without custom_action when action is none', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_actions: { home: { action: 'navigate', navigation_path: '/test' } }
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const actionEditor = el.shadowRoot!.querySelector('sf-editor-action[element-id="home"]');
    actionEditor!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'home', value: { action: 'none' } }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.custom_actions).toBeUndefined();
  });

  // TC-719: volume_entity dropdown dispatches config change
  it('TC-719: dispatches config-changed when volume_entity changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="volume_entity"]');
    expect(dropdown).not.toBeNull();
    dropdown!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'volume_entity', value: 'media_player.sony_vol' }
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.volume_entity).toBe('media_player.sony_vol');
  });

  // ── O2 / review round 1: the legacy `enter` binding must be removable ─────

  describe('legacy enter binding', () => {
    const LEGACY = { action: 'call-service', service: 'script.legacy' };

    const armWithLegacyEnter = async () => {
      const el = await createElement();
      el.hass = makeMockHass() as HomeAssistantExt;
      el.setConfig(makeConfig({ custom_actions: { enter: LEGACY } }));
      await el.updateComplete;
      const received: CustomEvent[] = [];
      el.addEventListener('config-changed', e => received.push(e as CustomEvent));
      const confirmSelector = el.shadowRoot!.querySelector(
        'sf-editor-action[element-id="confirm"]'
      )!;
      return { el, received, confirmSelector };
    };

    it('shows a legacy enter binding under the confirm selector', async () => {
      const { confirmSelector } = await armWithLegacyEnter();
      expect((confirmSelector as any).value).to.deep.equal(LEGACY);
    });

    /**
     * `enter` has no selector of its own any more, so this handler is the only
     * code that can delete it. Without that, clearing confirm left `enter` in
     * the config and the selector re-displayed it on the next render: the action
     * came back after being deleted.
     */
    it('clears the legacy enter binding when the confirm selector is cleared', async () => {
      const { received, confirmSelector } = await armWithLegacyEnter();

      confirmSelector.dispatchEvent(
        new CustomEvent('input-update', {
          detail: { id: 'confirm', value: undefined },
          bubbles: true,
          composed: true,
        })
      );

      expect(received).toHaveLength(1);
      expect(received[0]!.detail.config.custom_actions).to.be.undefined;
    });

    it('migrates off enter when the confirm selector is given a new action', async () => {
      const { received, confirmSelector } = await armWithLegacyEnter();
      const fresh = { action: 'call-service', service: 'script.fresh' };

      confirmSelector.dispatchEvent(
        new CustomEvent('input-update', {
          detail: { id: 'confirm', value: fresh },
          bubbles: true,
          composed: true,
        })
      );

      expect(received).toHaveLength(1);
      const actions = received[0]!.detail.config.custom_actions;
      expect(actions.confirm).to.deep.equal(fresh);
      expect(actions, 'enter must not survive beside confirm').to.not.have.property('enter');
    });

    it('leaves other bindings alone while clearing enter', async () => {
      const el = await createElement();
      el.hass = makeMockHass() as HomeAssistantExt;
      el.setConfig(makeConfig({ custom_actions: { enter: LEGACY, home: LEGACY } }));
      await el.updateComplete;
      const received: CustomEvent[] = [];
      el.addEventListener('config-changed', e => received.push(e as CustomEvent));

      el.shadowRoot!
        .querySelector('sf-editor-action[element-id="confirm"]')!
        .dispatchEvent(
          new CustomEvent('input-update', {
            detail: { id: 'confirm', value: undefined },
            bubbles: true,
            composed: true,
          })
        );

      expect(received[0]!.detail.config.custom_actions).to.deep.equal({ home: LEGACY });
    });
  });
});
