// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-multi-entity.js';
import type { SfEditorMultiEntity } from '../../../src/components/editor-inputs/sf-editor-multi-entity.js';
import type { EditorHassEntity } from '../../../src/components/editor-inputs/sf-editor-dropdown-entity.js';

function makeEntity(overrides: Partial<EditorHassEntity> = {}): EditorHassEntity {
  return {
    entity_id: 'light.salon',
    attributes: { friendly_name: 'Salon', icon: 'mdi:lightbulb' },
    ...overrides,
  };
}

async function createElement(
  props: Partial<{
    label: string;
    value: string;
    values: string[];
    elementId: string;
    kind: string;
    items: EditorHassEntity[];
    disabled: boolean;
    icon: string;
  }> = {}
): Promise<SfEditorMultiEntity> {
  const el = document.createElement('sf-editor-multi-entity') as SfEditorMultiEntity;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-multi-entity', () => {
  it('renders with empty values list — no chips', async () => {
    const el = await createElement({ values: [], items: [] });
    const chips = el.shadowRoot!.querySelectorAll('.chip');
    expect(chips.length).toBe(0);
  });

  it('renders chips for each selected entity in values', async () => {
    const items = [
      makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } }),
      makeEntity({ entity_id: 'switch.prise', attributes: { friendly_name: 'Prise' } }),
    ];
    const el = await createElement({ values: ['light.salon', 'switch.prise'], items });
    const chips = el.shadowRoot!.querySelectorAll('.chip');
    expect(chips.length).toBe(2);
  });

  it('applies has-value class when values is non-empty', async () => {
    const el = await createElement({ values: ['light.salon'], items: [] });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(true);
  });

  it('does NOT apply has-value class when values is empty and not open', async () => {
    const el = await createElement({ values: [], items: [] });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(false);
  });

  it('chip shows entity_id as text', async () => {
    const el = await createElement({ values: ['light.salon'], items: [] });
    const chipText = el.shadowRoot!.querySelector('.chip-text');
    expect(chipText?.textContent?.trim()).toBe('light.salon');
  });

  it('dispatches input-update type:remove when chip delete clicked', async () => {
    const el = await createElement({
      values: ['light.salon', 'switch.prise'],
      items: [],
      elementId: 'me1',
      kind: 'entities',
    });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const deleteBtn = el.shadowRoot!.querySelector('.chip-delete') as HTMLButtonElement;
    deleteBtn.click();

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.type).toBe('remove');
    expect(received[0]!.detail.value).toBe('0'); // index 0
  });

  it('excludes already-selected entities from dropdown items', async () => {
    const items = [
      makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } }),
      makeEntity({ entity_id: 'light.kitchen', attributes: { friendly_name: 'Kitchen' } }),
    ];
    const el = await createElement({ values: ['light.salon'], items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    // 'light.salon' is already in values — should be filtered out
    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(1);
  });

  it('dispatches input-update type:add when entity selected from dropdown', async () => {
    const items = [
      makeEntity({ entity_id: 'light.kitchen', attributes: { friendly_name: 'Kitchen' } }),
    ];
    const el = await createElement({ values: [], items, elementId: 'me2', kind: 'entities' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const item = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.type).toBe('add');
    expect(received[0]!.detail.value).toBe('light.kitchen');
  });

  it('closes dropdown after entity selection without setting value property', async () => {
    const items = [makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } })];
    const el = await createElement({ values: [], items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const item = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await el.updateComplete;

    // Dropdown should be closed
    const menu = el.shadowRoot!.querySelector('.dropdown-menu');
    expect(menu).toBeNull();
  });

  it('renders input for typing filter', async () => {
    const el = await createElement({ values: [], items: [] });
    const input = el.shadowRoot!.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('disables input when disabled=true', async () => {
    const el = await createElement({ disabled: true, values: [], items: [] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('renders label', async () => {
    const el = await createElement({ label: 'Select entities', values: [], items: [] });
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Select entities');
  });
});
