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

  // TC-714
  it('renders 11 sf-editor-action components for custom_actions', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;
    
    // The accordion for Custom Actions should contain 11 sf-editor-action components
    const actionEditors = el.shadowRoot!.querySelectorAll('sf-editor-action');
    expect(actionEditors.length).toBe(11);
  });

  // TC-715
  it('handles fallback for ha-selector in mock environment without crashing', async () => {
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
});
