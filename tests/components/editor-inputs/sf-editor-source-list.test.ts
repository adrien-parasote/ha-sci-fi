// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/components/editor-inputs/sf-editor-source-list.js';
import { SfEditorSourceList } from '../../../src/components/editor-inputs/sf-editor-source-list.js';

for (const tag of ['sf-editor-input', 'sf-editor-action', 'sf-icon']) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends HTMLElement {});
  }
}

async function createElement(
  props: Partial<{ label: string; values: any[]; elementId: string }> = {}
): Promise<SfEditorSourceList> {
  const el = document.createElement('sf-editor-source-list') as SfEditorSourceList;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('SfEditorSourceList', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders add button when values is empty', async () => {
    const el = await createElement({ values: [] });
    const btn = el.shadowRoot!.querySelector('.add-btn');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Ajouter');
  });

  it('renders 2 .source-item elements for 2 object sources', async () => {
    const el = await createElement({
      values: [
        { name: 'Source A', action: 'none' },
        { name: 'Source B', action: 'navigate' },
      ],
    });
    const items = el.shadowRoot!.querySelectorAll('.source-item');
    expect(items.length).toBe(2);
  });

  it('_addSource dispatches input-update with value of length 1 (from empty)', async () => {
    const el = await createElement({ elementId: 'sl1', values: [] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._addSource();

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.value).toHaveLength(1);
  });

  it('_removeSource(0) dispatches input-update with value of length 0', async () => {
    const el = await createElement({
      elementId: 'sl2',
      values: [{ name: 'Only', action: 'none' }],
    });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._removeSource(0);

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.value).toHaveLength(0);
  });

  it('_updateSourceName updates name on object source', async () => {
    const el = await createElement({
      elementId: 'sl3',
      values: [{ name: 'Old', action: 'none' }],
    });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateSourceName(0, 'Novo');

    expect(received[0]!.detail.value[0].name).toBe('Novo');
  });

  it('_updateSourceName converts string source to object with new name', async () => {
    const el = await createElement({
      elementId: 'sl4',
      values: ['StringSource'],
    });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateSourceName(0, 'Novo');

    expect(received[0]!.detail.value[0]).toEqual({ name: 'Novo', action: 'none' });
  });

  it('_updateSourceAction updates action fields and preserves name', async () => {
    const el = await createElement({
      elementId: 'sl5',
      values: [{ name: 'Keep', action: 'none' }],
    });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateSourceAction(0, { action: 'navigate', navigation_path: '/test' });

    const updated = received[0]!.detail.value[0];
    expect(updated.name).toBe('Keep');
    expect(updated.action).toBe('navigate');
    expect(updated.navigation_path).toBe('/test');
  });

  it('elementId is passed as detail.id in dispatched events', async () => {
    const el = await createElement({ elementId: 'source-list-xyz', values: [] });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._addSource();

    expect(received[0]!.detail.id).toBe('source-list-xyz');
  });
});
