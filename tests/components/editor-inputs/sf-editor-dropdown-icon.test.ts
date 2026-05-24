// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-dropdown-icon.js';
import type { SfEditorDropdownIcon } from '../../../src/components/editor-inputs/sf-editor-dropdown-icon.js';

async function createElement(
  props: Partial<{ label: string; value: string; elementId: string; kind: string; icon: string; disabled: boolean }> = {}
): Promise<SfEditorDropdownIcon> {
  const el = document.createElement('sf-editor-dropdown-icon') as SfEditorDropdownIcon;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-dropdown-icon', () => {
  it('loads ALL_ICONS into items on connectedCallback', async () => {
    const el = await createElement();
    expect(el.items.length).toBeGreaterThan(0);
  });

  it('renders an input element', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('renders label', async () => {
    const el = await createElement({ label: 'Icon picker' });
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Icon picker');
  });

  it('shows icon preview when value is set', async () => {
    const el = await createElement({ value: 'mdi:home' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).not.toBeNull();
  });

  it('does NOT show icon preview when value and icon are both empty', async () => {
    const el = await createElement({ value: '', icon: '' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).toBeNull();
  });

  it('shows icon preview using icon property as fallback when value is empty', async () => {
    const el = await createElement({ value: '', icon: 'mdi:home' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).not.toBeNull();
  });

  it('applies has-value class when value is set', async () => {
    const el = await createElement({ value: 'mdi:lightbulb' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(true);
  });

  it('applies has-icon class when value or icon is set', async () => {
    const el = await createElement({ value: 'mdi:home' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-icon')).toBe(true);
  });

  it('opens dropdown on focus', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const menu = el.shadowRoot!.querySelector('.dropdown-menu');
    expect(menu).not.toBeNull();
  });

  it('limits dropdown to 200 items max', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const items = el.shadowRoot!.querySelectorAll('.dropdown-item');
    expect(items.length).toBeLessThanOrEqual(200);
  });

  it('filters icon list by query', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'mdi:home';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const items = el.shadowRoot!.querySelectorAll('.dropdown-item');
    // Filtered list should have fewer than unfiltered (200 max)
    expect(items.length).toBeGreaterThan(0);
  });

  it('typing does NOT dispatch input-update', async () => {
    const el = await createElement({ elementId: 'icon-pick' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.value = 'mdi';
    input.dispatchEvent(new Event('input'));

    expect(received).toHaveLength(0);
  });

  it('dispatches input-update when icon is selected', async () => {
    const el = await createElement({ elementId: 'icon-pick2', kind: 'icon' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    const firstItem = el.shadowRoot!.querySelector('.dropdown-item') as HTMLDivElement;
    firstItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(received).toHaveLength(1);
    expect(typeof received[0].detail.value).toBe('string');
  });

  it('shows icon-name span for each item in dropdown', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'mdi:home';
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;

    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const iconNames = el.shadowRoot!.querySelectorAll('.icon-name');
    expect(iconNames.length).toBeGreaterThan(0);
  });

  it('disables input when disabled=true', async () => {
    const el = await createElement({ disabled: true });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
