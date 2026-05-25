// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-input.js';
import type { SfEditorInput } from '../../../src/components/editor-inputs/sf-editor-input.js';

async function createElement(
  props: Partial<{ label: string; value: string; icon: string; elementId: string; kind: string; disabled: boolean; type: string }> = {}
): Promise<SfEditorInput> {
  const el = document.createElement('sf-editor-input') as SfEditorInput;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-input', () => {
  it('renders with default empty state', async () => {
    const el = await createElement();
    expect(el.value).toBe('');
    expect(el.label).toBe('');
    expect(el.disabled).toBe(false);
  });

  it('renders label text', async () => {
    const el = await createElement({ label: 'My Label' });
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toBe('My Label');
  });

  it('renders with initial value', async () => {
    const el = await createElement({ value: 'hello' });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('applies has-value class when value is set', async () => {
    const el = await createElement({ value: 'something' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(true);
  });

  it('does not apply has-value class when value is empty', async () => {
    const el = await createElement({ value: '' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(false);
  });

  it('applies has-icon class when icon is set', async () => {
    const el = await createElement({ icon: 'mdi:home' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-icon')).toBe(true);
  });

  it('does not apply has-icon class when icon is empty', async () => {
    const el = await createElement({ icon: '' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-icon')).toBe(false);
  });

  it('renders sf-icon when icon property is set', async () => {
    const el = await createElement({ icon: 'mdi:home' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).not.toBeNull();
  });

  it('does not render icon slot when icon is empty', async () => {
    const el = await createElement({ icon: '' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).toBeNull();
  });

  it('disables the input when disabled=true', async () => {
    const el = await createElement({ disabled: true });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('dispatches input-update event on input', async () => {
    const el = await createElement({ elementId: 'test-id', kind: 'text' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'new value';
    input.dispatchEvent(new Event('input'));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.value).toBe('new value');
    expect(received[0]!.detail.id).toBe('test-id');
    expect(received[0]!.detail.kind).toBe('text');
  });

  it('input-update event does NOT include type when not provided', async () => {
    const el = await createElement({ elementId: 'e1' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));

    expect('type' in received[0]!.detail).toBe(false);
  });

  it('updates value property on input event', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    expect(el.value).toBe('typed');
  });
});
