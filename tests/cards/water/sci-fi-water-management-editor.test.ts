// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/cards/water/sci-fi-water-management-editor.js';
import type { SciFiWaterManagementEditor } from '../../../src/cards/water/sci-fi-water-management-editor.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-water-management', ...overrides };
}

async function createElement(): Promise<SciFiWaterManagementEditor> {
  const el = document.createElement('sci-fi-water-management-editor') as SciFiWaterManagementEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-water-management-editor', () => {
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
    el.hass = { states: {}, devices: {}, entities: {} } as any;
    await el.updateComplete;

    const editorContainer = el.shadowRoot!.querySelector('.card-config');
    expect(editorContainer).not.toBeNull();
  });

  it('dispatches config-changed when header message is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header_message: 'Old Message' }));
    el.hass = { states: {}, devices: {}, entities: {} } as any;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const inputs = el.shadowRoot!.querySelectorAll('sf-editor-input');
    const headerInput = Array.from(inputs).find(i => i.configValue === 'header_message');
    headerInput?.dispatchEvent(new CustomEvent('value-changed', {
      bubbles: true,
      composed: true,
      detail: { value: 'New Message' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBe('New Message');
  });

  it('dispatches config-changed when filter label is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ filter_label: 'old_label' }));
    el.hass = { states: {}, devices: {}, entities: {} } as any;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const inputs = el.shadowRoot!.querySelectorAll('sf-editor-input');
    const labelInput = Array.from(inputs).find(i => i.configValue === 'filter_label');
    labelInput?.dispatchEvent(new CustomEvent('value-changed', {
      bubbles: true,
      composed: true,
      detail: { value: 'new_label' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.filter_label).toBe('new_label');
  });

  it('dispatches config-changed when ignored entities are updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ ignored_entities: [] }));
    el.hass = {
      entities: {
        'some_entity_id': { entity_id: 'some_entity_id', labels: ['water'] }
      },
      devices: {},
      states: {}
    } as any;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const toggleButton = el.shadowRoot!.querySelector('.people-row sf-button') as HTMLElement;
    toggleButton?.dispatchEvent(new CustomEvent('button-click', {
      bubbles: true,
      composed: true
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.ignored_entities).toContain('some_entity_id');
  });

  it('removes entity from ignored_entities when made visible', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ ignored_entities: ['some_entity_id'] }));
    el.hass = {
      entities: {
        'some_entity_id': { entity_id: 'some_entity_id', labels: ['water'] }
      },
      devices: {},
      states: {}
    } as any;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const toggleButton = el.shadowRoot!.querySelector('.people-row sf-button') as HTMLElement;
    toggleButton?.dispatchEvent(new CustomEvent('button-click', {
      bubbles: true,
      composed: true
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.ignored_entities || []).not.toContain('some_entity_id');
  });
});
