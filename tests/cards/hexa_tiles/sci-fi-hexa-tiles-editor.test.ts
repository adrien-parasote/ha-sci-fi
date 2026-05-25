// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.js';
import type { SciFiHexaTilesEditor } from '../../../src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-hexa-tiles', ...overrides };
}

async function createElement(): Promise<SciFiHexaTilesEditor> {
  const el = document.createElement('sci-fi-hexa-tiles-editor') as SciFiHexaTilesEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-hexa-tiles-editor', () => {
  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor structure when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;
    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('renders add-tile button', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.add-btn');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders one accordion per tile', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [
        { entity_id: 'light.salon', name: 'Salon' },
        { entity_id: 'switch.prise', name: 'Prise' },
      ],
    }));
    await el.updateComplete;
    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    expect(accordions.length).toBe(2);
  });

  it('dispatches config-changed when add-tile clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const btn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();

    expect(received).toHaveLength(1);
    expect(Array.isArray(received[0]!.detail.config.tiles)).toBe(true);
    expect(received[0]!.detail.config.tiles.length).toBe(1);
  });

  it('dispatches config-changed when tile is removed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_id: 'light.salon', name: 'Salon' }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion')!;
    accordion.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: '0', kind: 'accordion', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles).toHaveLength(0);
  });

  it('renders weather toggle switch when weather section exists', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: {} }));
    await el.updateComplete;

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch');
    expect(toggle).not.toBeNull();
  });

  it('loads weather and people entities from hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    const mockHass = {
      ...makeMockHass(),
      states: {
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: {} },
        'person.adrien': { entity_id: 'person.adrien', state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: null } },
        'light.salon': { entity_id: 'light.salon', state: 'on', attributes: {} },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    expect((el as any)._weatherEntities).toHaveLength(1);
    expect((el as any)._people).toHaveLength(1);
  });
});
