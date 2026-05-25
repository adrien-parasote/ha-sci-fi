// @vitest-environment happy-dom
import { expect, describe, it, vi } from 'vitest';

import '../../../src/components/editor-inputs/sf-editor-accordion.js';
import type { SfEditorAccordion } from '../../../src/components/editor-inputs/sf-editor-accordion.js';

async function createElement(
  props: Partial<{ title: string; icon: string; open: boolean; elementId: string; deletable: boolean }> = {}
): Promise<SfEditorAccordion> {
  const el = document.createElement('sf-editor-accordion') as SfEditorAccordion;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sf-editor-accordion', () => {
  it('renders with default closed state', async () => {
    const el = await createElement({ elementId: 'test-ac', title: 'My Section' });
    const checkbox = el.shadowRoot!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('renders with open=true — checkbox is checked', async () => {
    const el = await createElement({ open: true, elementId: 'ac1' });
    const checkbox = el.shadowRoot!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('renders the title text in the label', async () => {
    const el = await createElement({ title: 'Tile Config', elementId: 'ac2' });
    const label = el.shadowRoot!.querySelector('.label');
    expect(label?.textContent).toContain('Tile Config');
  });

  it('uses elementId to form checkbox id', async () => {
    const el = await createElement({ elementId: 'my-item' });
    const checkbox = el.shadowRoot!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.id).toBe('accordion-my-item');
  });

  it('falls back to "ac" when elementId is empty', async () => {
    const el = await createElement({ elementId: '' });
    const checkbox = el.shadowRoot!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.id).toBe('accordion-ac');
  });

  it('renders sf-icon when icon is provided', async () => {
    const el = await createElement({ icon: 'mdi:home', elementId: 'ac3' });
    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon).not.toBeNull();
  });

  it('does NOT render sf-icon when icon is empty', async () => {
    const el = await createElement({ icon: '', elementId: 'ac4' });
    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon).toBeNull();
  });

  it('does NOT render delete button when deletable=false', async () => {
    const el = await createElement({ deletable: false, elementId: 'ac5' });
    const deleteDiv = el.shadowRoot!.querySelector('.delete');
    expect(deleteDiv).toBeNull();
  });

  it('renders delete button when deletable=true', async () => {
    const el = await createElement({ deletable: true, elementId: 'ac6' });
    const deleteDiv = el.shadowRoot!.querySelector('.delete');
    expect(deleteDiv).not.toBeNull();
  });

  it('dispatches input-update with type:remove when delete button clicked', async () => {
    const el = await createElement({ deletable: true, elementId: 'my-item' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    // Trigger the private _onDelete via button-click event on sf-button
    const sfButton = el.shadowRoot!.querySelector('sf-button');
    sfButton?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.type).toBe('remove');
    expect(received[0]!.detail.id).toBe('my-item');
    expect(received[0]!.detail.value).toBe('my-item');
    expect(received[0]!.detail.kind).toBe('accordion');
  });

  it('renders slot for content projection', async () => {
    const el = await createElement({ elementId: 'slot-test' });
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).not.toBeNull();
  });
});
