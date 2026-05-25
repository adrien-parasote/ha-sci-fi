// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-dropdown-entity.js';
import type {
  SfEditorDropdownEntity,
  EditorHassEntity,
} from '../../../src/components/editor-inputs/sf-editor-dropdown-entity.js';

function makeEntity(overrides: Partial<EditorHassEntity> = {}): EditorHassEntity {
  return {
    entity_id: 'light.salon',
    attributes: { friendly_name: 'Salon', icon: 'mdi:lightbulb' },
    ...overrides,
  };
}

async function createElement(
  props: Partial<{ label: string; value: string; elementId: string; kind: string; items: EditorHassEntity[] }> = {}
): Promise<SfEditorDropdownEntity> {
  const el = document.createElement('sf-editor-dropdown-entity') as SfEditorDropdownEntity;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-dropdown-entity', () => {
  it('renders with empty items list', async () => {
    const el = await createElement({ items: [] });
    expect(el.items).toEqual([]);
  });

  it('filters by friendly_name', async () => {
    const items = [
      makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } }),
      makeEntity({ entity_id: 'switch.kitchen', attributes: { friendly_name: 'Kitchen' } }),
    ];
    const el = await createElement({ items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'sal';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(1);
  });

  it('filters by entity_id', async () => {
    const items = [
      makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } }),
      makeEntity({ entity_id: 'switch.kitchen', attributes: { friendly_name: 'Kitchen' } }),
    ];
    const el = await createElement({ items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'switch';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(1);
  });

  it('renders entity name and entity_id in dropdown items', async () => {
    const items = [makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } })];
    const el = await createElement({ items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const entityName = el.shadowRoot!.querySelector('.entity-name');
    const entityId = el.shadowRoot!.querySelector('.entity-id');
    expect(entityName?.textContent?.trim()).toBe('Salon');
    expect(entityId?.textContent?.trim()).toBe('light.salon');
  });

  it('uses entity_id as fallback name when friendly_name is missing', async () => {
    const items = [makeEntity({ entity_id: 'light.unnamed', attributes: {} })];
    const el = await createElement({ items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const entityName = el.shadowRoot!.querySelector('.entity-name');
    expect(entityName?.textContent?.trim()).toBe('light.unnamed');
  });

  it('dispatches input-update with entity_id on item selection', async () => {
    const items = [makeEntity({ entity_id: 'light.salon', attributes: { friendly_name: 'Salon' } })];
    const el = await createElement({ items, elementId: 'ent1', kind: 'entity' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const item = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.value).toBe('light.salon');
  });

  it('uses fallback icon when entity has no icon attribute', async () => {
    const items = [makeEntity({ entity_id: 'light.no-icon', attributes: { friendly_name: 'No Icon' } })];
    // Remove icon attribute
    (items[0] as any).attributes.icon = undefined;
    const el = await createElement({ items });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon?.getAttribute('icon')).toBe('mdi:information-off-outline');
  });
});
