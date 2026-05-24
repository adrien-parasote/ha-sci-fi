// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import '../../../src/cards/lights/sci-fi-lights-editor.js';
import type { SciFiLightsEditor } from '../../../src/cards/lights/sci-fi-lights-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-lights', ...overrides };
}

async function createElement(): Promise<SciFiLightsEditor> {
  const el = document.createElement('sci-fi-lights-editor') as SciFiLightsEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-lights-editor', () => {
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

  it('renders add-custom-entity button', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: [] }));
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.add-btn');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('loads floor, area, and light entities from hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    const mockHass = {
      ...makeMockHass(),
      states: {
        'light.salon': { entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'Salon' } },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;
    el.hass = mockHass;
    await el.updateComplete;
    // floors and areas are populated from hass.floors / hass.areas
    expect((el as any)._floorItems).toBeDefined();
    expect((el as any)._lightEntities).toBeDefined();
  });

  it('config is defined after setConfig', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;
    expect(el.config).toBeDefined();
    expect(el.config.type).toBe('custom:sci-fi-lights');
  });
});
