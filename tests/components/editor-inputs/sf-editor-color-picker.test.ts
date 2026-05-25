// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-color-picker.js';
import type { SfEditorColorPicker } from '../../../src/components/editor-inputs/sf-editor-color-picker.js';

async function createElement(
  props: Partial<{ label: string; value: string; elementId: string; kind: string; icon: string }> = {}
): Promise<SfEditorColorPicker> {
  const el = document.createElement('sf-editor-color-picker') as SfEditorColorPicker;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-color-picker', () => {
  it('renders a color input', async () => {
    const el = await createElement();
    const input = el.shadowRoot!.querySelector('input[type="color"]');
    expect(input).not.toBeNull();
  });

  it('renders label', async () => {
    const el = await createElement({ label: 'Pick color' });
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Pick color');
  });

  it('always has has-value class (label always floated)', async () => {
    const el = await createElement({ value: '' });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(true);
  });

  it('shows color swatch', async () => {
    const el = await createElement({ value: '#ff0000' });
    const swatch = el.shadowRoot!.querySelector('.color-swatch') as HTMLElement;
    expect(swatch).not.toBeNull();
    expect(swatch.style.background).toContain('#ff0000');
  });

  it('color-value span shows current value', async () => {
    const el = await createElement({ value: '#00ff00' });
    const span = el.shadowRoot!.querySelector('.color-value');
    expect(span?.textContent?.trim()).toBe('#00ff00');
  });

  it('color-value span shows "—" when value is empty', async () => {
    const el = await createElement({ value: '' });
    const span = el.shadowRoot!.querySelector('.color-value');
    expect(span?.textContent?.trim()).toBe('—');
  });

  it('color input defaults to #000000 when value is empty', async () => {
    const el = await createElement({ value: '' });
    const input = el.shadowRoot!.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#000000');
  });

  it('dispatches input-update on color input change', async () => {
    const el = await createElement({ elementId: 'cp1', kind: 'color' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input[type="color"]') as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('input'));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.value).toBe('#123456');
    expect(received[0]!.detail.id).toBe('cp1');
  });

  it('renders icon slot when icon is provided', async () => {
    const el = await createElement({ icon: 'mdi:palette' });
    const iconSlot = el.shadowRoot!.querySelector('.icon-slot');
    expect(iconSlot).not.toBeNull();
  });
});
