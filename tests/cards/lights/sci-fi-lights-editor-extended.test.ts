/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — sci-fi-lights-editor.ts
 * Covers: _addCustomEntity, _deleteCustomEntity, _renameCustomEntity,
 * _startEditCustom, _endEdit, _updateCustomEntity, _updateIgnored,
 * _tryAutoSetup, _updateAreaItems, edit view rendering.
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/lights/sci-fi-lights-editor.js';
import type { SciFiLightsEditor } from '../../../src/cards/lights/sci-fi-lights-editor.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-lights', ...overrides };
}

async function createElement(): Promise<SciFiLightsEditor> {
  const el = document.createElement('sci-fi-lights-editor') as SciFiLightsEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-lights-editor extended', () => {
  afterEach(() => { document.body.replaceChildren(); });

  // ── _addCustomEntity ────────────────────────────────────────────────────────

  it('dispatches config-changed and enters edit mode when add-custom-entity clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: {} }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const btn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();

    expect(received).toHaveLength(1);
    const config = received[0]!.detail.config;
    const keys = Object.keys(config.custom_entities ?? {});
    expect(keys.length).toBe(1);
    expect(keys[0]).toBe('light.new');
    // Edit mode opened
    expect((el as any)._edit).toBe(true);
    expect((el as any)._editTarget).toBe('light.new');
  });

  it('avoids duplicate key by incrementing suffix', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: { 'light.new': { name: 'First' } } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const btn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();

    const config = received[0]!.detail.config;
    const keys = Object.keys(config.custom_entities ?? {});
    expect(keys).toContain('light.new1');
  });

  // ── _deleteCustomEntity ─────────────────────────────────────────────────────

  it('dispatches config-changed when delete button clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: { 'light.salon': { name: 'Salon' } } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const deleteBtn = el.shadowRoot!.querySelector('.delete-btn sf-button')!;
    deleteBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    const config = received[0]!.detail.config;
    expect(Object.keys(config.custom_entities ?? {})).toHaveLength(0);
  });

  // ── _startEditCustom / _endEdit ─────────────────────────────────────────────

  it('enters edit mode when edit-btn clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: { 'light.salon': { name: 'Salon' } } }));
    await el.updateComplete;

    const editBtn = el.shadowRoot!.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();
    await el.updateComplete;

    expect((el as any)._edit).toBe(true);
    expect((el as any)._editTarget).toBe('light.salon');
  });

  it('renders edit view when _edit is true', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_entities: { 'light.salon': { name: 'Salon', icon_on: 'mdi:lightbulb', icon_off: 'mdi:lightbulb-off' } },
    }));
    await el.updateComplete;

    (el as any)._editTarget = 'light.salon';
    (el as any)._edit = true;
    await el.updateComplete;

    const editorDiv = el.shadowRoot!.querySelector('.editor.true');
    expect(editorDiv).not.toBeNull();
  });

  it('exits edit mode when back button clicked in edit view', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_entities: { 'light.salon': { name: 'Salon' } },
    }));
    await el.updateComplete;

    (el as any)._editTarget = 'light.salon';
    (el as any)._edit = true;
    await el.updateComplete;

    const backBtn = el.shadowRoot!.querySelector('.editor.true .head sf-button')!;
    backBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect((el as any)._edit).toBe(false);
    expect((el as any)._editTarget).toBeNull();
  });

  // ── _updateCustomEntity ──────────────────────────────────────────────────────

  it('dispatches config-changed when custom entity name is updated in edit view', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_entities: { 'light.salon': { name: 'Old', icon_on: 'mdi:bulb', icon_off: 'mdi:bulb-off' } },
    }));
    await el.updateComplete;

    (el as any)._editTarget = 'light.salon';
    (el as any)._edit = true;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const nameInput = el.shadowRoot!.querySelector('.editor.true sf-editor-input')!;
    nameInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'name', kind: 'custom-entity', value: 'New Name' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.custom_entities['light.salon'].name).toBe('New Name');
  });

  // ── _renameCustomEntity ──────────────────────────────────────────────────────

  it('dispatches config-changed when entity id is renamed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      custom_entities: { 'light.salon': { name: 'Salon' } },
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Call internal rename method directly — the dropdown has dynamic element-id
    (el as any)._renameCustomEntity('light.salon', 'light.bedroom');

    expect(received).toHaveLength(1);
    const keys = Object.keys(received[0]!.detail.config.custom_entities);
    expect(keys).toContain('light.bedroom');
    expect(keys).not.toContain('light.salon');
  });

  it('_renameCustomEntity does nothing when old and new id are the same', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ custom_entities: { 'light.salon': { name: 'Salon' } } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Same id → _renameCustomEntity returns early, no dispatch
    (el as any)._renameCustomEntity('light.salon', 'light.salon');

    // No dispatch when same id
    expect(received).toHaveLength(0);
  });

  // ── _updateIgnored ──────────────────────────────────────────────────────────

  it('dispatches config-changed when entity is added to ignored_entities', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ ignored_entities: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'ignored_entities', kind: 'exclude', value: 'light.avoid', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.ignored_entities).toContain('light.avoid');
  });

  it('dispatches config-changed when entity is removed from ignored_entities', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ ignored_entities: ['light.avoid', 'light.other'] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'ignored_entities', kind: 'exclude', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.ignored_entities).not.toContain('light.avoid');
    expect(received[0]!.detail.config.ignored_entities).toContain('light.other');
  });

  // ── _update floor / area change ─────────────────────────────────────────────

  it('dispatches config-changed when floor dropdown changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ first_floor_to_render: '' }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const floorDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="first_floor_to_render"]')!;
    floorDropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'first_floor_to_render', kind: 'floor', value: 'ground' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.first_floor_to_render).toBe('ground');
    // area reset when floor changes
    expect(received[0]!.detail.config.first_area_to_render).toBeNull();
  });

  it('dispatches config-changed when header message changes', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ header_message: '' }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="header_message"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'header_message', kind: 'header', value: 'Hello World' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBe('Hello World');
  });
});
