// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-chips.js';
import type { SfEditorChips } from '../../../src/components/editor-inputs/sf-editor-chips.js';

async function createElement(
  props: Partial<{ label: string; value: string; values: string[]; elementId: string; kind: string; disabled: boolean }> = {}
): Promise<SfEditorChips> {
  const el = document.createElement('sf-editor-chips') as SfEditorChips;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-chips', () => {
  it('renders with empty values list — no chips', async () => {
    const el = await createElement({ values: [] });
    const chips = el.shadowRoot!.querySelectorAll('.chip');
    expect(chips.length).toBe(0);
  });

  it('renders chips for each value in values array', async () => {
    const el = await createElement({ values: ['tag1', 'tag2', 'tag3'] });
    const chips = el.shadowRoot!.querySelectorAll('.chip');
    expect(chips.length).toBe(3);
  });

  it('applies has-value class when values array is non-empty', async () => {
    const el = await createElement({ values: ['one'] });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(true);
  });

  it('does NOT apply has-value class when values array is empty', async () => {
    const el = await createElement({ values: [] });
    const container = el.shadowRoot!.querySelector('.container');
    expect(container?.classList.contains('has-value')).toBe(false);
  });

  it('chip shows value text', async () => {
    const el = await createElement({ values: ['hello'] });
    const chip = el.shadowRoot!.querySelector('.chip span');
    expect(chip?.textContent).toBe('hello');
  });

  it('dispatches input-update type:remove when chip delete button clicked', async () => {
    const el = await createElement({ values: ['a', 'b'], elementId: 'chips1', kind: 'chips' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const deleteBtn = el.shadowRoot!.querySelectorAll('.chip-delete')[1] as HTMLButtonElement;
    deleteBtn.click();

    expect(received).toHaveLength(1);
    expect(received[0].detail.type).toBe('remove');
    expect(received[0].detail.value).toBe('1'); // index 1
  });

  it('dispatches input-update type:add on Enter key with non-empty value', async () => {
    const el = await createElement({ elementId: 'chips2', kind: 'chips', values: [] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'new-tag';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.type).toBe('add');
    expect(received[0].detail.value).toBe('new-tag');
  });

  it('does NOT dispatch on Enter when input is empty', async () => {
    const el = await createElement({ elementId: 'chips3', values: [] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = '   '; // whitespace only
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(received).toHaveLength(0);
  });

  it('does NOT dispatch on non-Enter key', async () => {
    const el = await createElement({ elementId: 'chips4', values: [] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(received).toHaveLength(0);
  });

  it('clears input value after Enter adds chip', async () => {
    const el = await createElement({ elementId: 'chips5', values: [] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    input.value = 'new-tag';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(input.value).toBe('');
  });

  it('renders label', async () => {
    const el = await createElement({ label: 'Tags', values: [] });
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Tags');
  });

  it('disables input when disabled=true', async () => {
    const el = await createElement({ disabled: true, values: [] });
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
