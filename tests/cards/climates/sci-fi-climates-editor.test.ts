// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import '../../../src/cards/climates/sci-fi-climates-editor.js';
import type { SciFiClimatesEditor } from '../../../src/cards/climates/sci-fi-climates-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-climates', ...overrides };
}

async function createElement(): Promise<SciFiClimatesEditor> {
  const el = document.createElement('sci-fi-climates-editor') as SciFiClimatesEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-climates-editor', () => {
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

  it('renders sections for header, settings, states, modes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const sections = el.shadowRoot!.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it('renders header toggle switch', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch');
    expect(toggle).not.toBeNull();
  });

  it('renders state rows for auto, heat, off', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const editBtns = el.shadowRoot!.querySelectorAll('.edit-btn');
    // 3 state + 6 mode = 9 rows
    expect(editBtns.length).toBe(9);
  });

  it('dispatches config-changed on header toggle', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header: { display: true } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch')!;
    toggle.dispatchEvent(new CustomEvent('sf-toggle-change', {
      bubbles: true,
      composed: true,
      detail: { checked: false },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header.display).toBe(false);
  });

  it('dispatches config-changed on header field update', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header: { display: true } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Trigger _updateHeader via bubbling input-update with kind='header'
    const sfInput = el.shadowRoot!.querySelector('sf-editor-input')!;
    sfInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'icon_winter_state', kind: 'header', value: 'mdi:snowflake' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header.icon_winter_state).toBe('mdi:snowflake');
  });

  it('dispatches config-changed on exclude entity add', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ entities_to_exclude: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'exclude', value: 'climate.salon', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.entities_to_exclude).toContain('climate.salon');
  });

  it('dispatches config-changed on exclude entity remove', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ entities_to_exclude: ['climate.salon', 'climate.bedroom'] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'exclude', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.entities_to_exclude).toHaveLength(1);
  });

  it('enters edit mode when edit button clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const editBtn = el.shadowRoot!.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();
    await el.updateComplete;

    // Edit panel should be visible
    const editorPanel = el.shadowRoot!.querySelector('.editor');
    expect(editorPanel?.classList.contains('true')).toBe(true);
  });

  it('renders edit view with icon and color picker when in edit mode', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const editBtn = el.shadowRoot!.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();
    await el.updateComplete;

    const iconPicker = el.shadowRoot!.querySelector('.editor sf-editor-dropdown-icon');
    const colorPicker = el.shadowRoot!.querySelector('.editor sf-editor-color-picker');
    expect(iconPicker).not.toBeNull();
    expect(colorPicker).not.toBeNull();
  });

  it('exits edit mode when back button clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    // Enter edit
    const editBtn = el.shadowRoot!.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();
    await el.updateComplete;

    // Exit edit via sf-button button-click event
    const sfButton = el.shadowRoot!.querySelector('.editor sf-button')!;
    sfButton.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;

    const editorPanel = el.shadowRoot!.querySelector('.editor');
    expect(editorPanel?.classList.contains('false')).toBe(true);
  });

  it('dispatches config-changed when icon updated in edit mode', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const editBtn = el.shadowRoot!.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const iconPicker = el.shadowRoot!.querySelector('.editor sf-editor-dropdown-icon')!;
    iconPicker.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'heat', kind: 'state_icons', value: 'mdi:fire' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.state_icons?.heat).toBe('mdi:fire');
  });

  it('loads climate entities from hass.states', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    const mockHass = {
      ...makeMockHass(),
      states: {
        'climate.salon': { entity_id: 'climate.salon', state: 'heat', attributes: { friendly_name: 'Salon' } },
        'light.kitchen': { entity_id: 'light.kitchen', state: 'on', attributes: {} },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    expect((el as any)._climateEntities).toHaveLength(1);
    expect((el as any)._climateEntities[0].entity_id).toBe('climate.salon');
  });

  it('does not show header inputs when header.display is false', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header: { display: false } }));
    await el.updateComplete;

    const inputs = el.shadowRoot!.querySelectorAll('section:first-of-type sf-editor-input');
    expect(inputs.length).toBe(0);
  });

  it('shows header inputs when header.display is true', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header: { display: true } }));
    await el.updateComplete;

    const inputs = el.shadowRoot!.querySelectorAll('section sf-editor-input');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
