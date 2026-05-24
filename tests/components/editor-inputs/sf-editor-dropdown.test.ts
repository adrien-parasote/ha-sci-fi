// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-dropdown.js';
import type { SfEditorDropdown } from '../../../src/components/editor-inputs/sf-editor-dropdown.js';

async function createElement(
  props: Partial<{
    label: string;
    value: string;
    icon: string;
    elementId: string;
    kind: string;
    disabled: boolean;
    items: unknown[];
    disabledFilter: boolean;
  }> = {}
): Promise<SfEditorDropdown> {
  const el = document.createElement('sf-editor-dropdown') as SfEditorDropdown;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-dropdown', () => {
  it('renders with empty items list', async () => {
    const el = await createElement({ items: [] });
    expect(el.items).toEqual([]);
  });

  it('renders an input element', async () => {
    const el = await createElement({ items: ['a', 'b'] });
    const input = el.shadowRoot!.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('shows value in input when not open', async () => {
    const el = await createElement({ value: 'selected', items: ['selected', 'other'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('selected');
  });

  it('dropdown menu is hidden when not focused', async () => {
    const el = await createElement({ items: ['a', 'b'] });
    // Dropdown only renders in DOM when _open=true (returns nothing when false)
    const menu = el.shadowRoot!.querySelector('.dropdown-menu');
    expect(menu).toBeNull();
  });

  it('dropdown menu appears after focus event', async () => {
    const el = await createElement({ items: ['alpha', 'beta', 'gamma'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const menu = el.shadowRoot!.querySelector('.dropdown-menu');
    expect(menu).not.toBeNull();
  });

  it('renders all items when dropdown is open', async () => {
    const el = await createElement({ items: ['one', 'two', 'three'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(3);
  });

  it('filters items on input typing', async () => {
    const el = await createElement({ items: ['apple', 'apricot', 'banana'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(2); // apple, apricot
  });

  it('typing does NOT dispatch input-update', async () => {
    const el = await createElement({ elementId: 'dd1', items: ['a', 'b'] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'a';
    input.dispatchEvent(new Event('input'));

    expect(received).toHaveLength(0);
  });

  it('dispatches input-update when item is selected via mousedown', async () => {
    const el = await createElement({ elementId: 'dd2', kind: 'entity', items: ['alpha', 'beta'] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const firstItem = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    firstItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.value).toBe('alpha');
    expect(received[0].detail.id).toBe('dd2');
  });

  it('closes dropdown after item is selected', async () => {
    const el = await createElement({ items: ['x', 'y'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const firstItem = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    firstItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await el.updateComplete;

    const menu = el.shadowRoot!.querySelector('.dropdown-menu');
    expect(menu).toBeNull();
  });

  it('shows all items when disabledFilter=true regardless of input', async () => {
    const el = await createElement({ items: ['cat', 'dog', 'fish'], disabledFilter: true });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'cat';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(3); // all items despite filter
  });

  it('updates value property after item selection', async () => {
    const el = await createElement({ items: ['selected-value'] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const item = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(el.value).toBe('selected-value');
  });

  it('disables the input when disabled=true', async () => {
    const el = await createElement({ disabled: true, items: [] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('_itemMatchesQuery returns true for non-string items', async () => {
    const el = await createElement({ items: [{ id: 1 }, { id: 2 }] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    // Non-string items always pass filter — all should render
    const dropItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(dropItems.length).toBe(2);
  });
});
