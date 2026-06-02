// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/components/editor-inputs/sf-editor-action.js';
import { SfEditorAction } from '../../../src/components/editor-inputs/sf-editor-action.js';

if (!customElements.get('sf-editor-input')) {
  customElements.define('sf-editor-input', class extends HTMLElement {});
}

async function createElement(
  props: Partial<{ label: string; value: any; elementId: string }> = {}
): Promise<SfEditorAction> {
  const el = document.createElement('sf-editor-action') as SfEditorAction;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('SfEditorAction', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the label in .label', async () => {
    const el = await createElement({ label: 'My Label' });
    const label = el.shadowRoot!.querySelector('.label');
    expect(label?.textContent?.trim()).toBe('My Label');
  });

  it('renders the fallback-ui when ha-selector is not registered', async () => {
    const el = await createElement({ label: 'Action' });
    const fallback = el.shadowRoot!.querySelector('.fallback-ui');
    expect(fallback).not.toBeNull();
  });

  it('_dispatch dispatches input-update with kind: action', async () => {
    const el = await createElement({ elementId: 'el1' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._dispatch({ action: 'none' });

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.kind).toBe('action');
    expect(received[0]!.detail.value.action).toBe('none');
  });

  it('_dispatch passes elementId as detail.id', async () => {
    const el = await createElement({ elementId: 'my-id-42' });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._dispatch({ action: 'none' });

    expect(received[0]!.detail.id).toBe('my-id-42');
  });

  it('_updateFallbackField("action", "navigate") → value.action === "navigate"', async () => {
    const el = await createElement({ elementId: 'el2', value: {} });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateFallbackField('action', 'navigate');

    expect(received[0]!.detail.value.action).toBe('navigate');
  });

  it('_updateFallbackField("action", "") → value.action === "none" (empty string → none)', async () => {
    const el = await createElement({ elementId: 'el3', value: { action: 'navigate' } });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateFallbackField('action', '');

    expect(received[0]!.detail.value.action).toBe('none');
  });

  it('_updateFallbackField("service", ...) → value.service is set', async () => {
    const el = await createElement({ elementId: 'el4', value: { action: 'call-service' } });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateFallbackField('service', 'media_player.play');

    expect(received[0]!.detail.value.service).toBe('media_player.play');
  });

  it('_updateFallbackField("navigation_path", ...) → value.navigation_path is set', async () => {
    const el = await createElement({ elementId: 'el5', value: { action: 'navigate' } });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateFallbackField('navigation_path', '/lovelace/0');

    expect(received[0]!.detail.value.navigation_path).toBe('/lovelace/0');
  });

  it('_updateFallbackField("data.entity_id", ...) → value.data.entity_id is set', async () => {
    const el = await createElement({ elementId: 'el6', value: { action: 'call-service', data: {} } });
    const received: CustomEvent[] = [];
    el.addEventListener('input-update', (e) => received.push(e as CustomEvent));

    (el as any)._updateFallbackField('data.entity_id', 'media_player.tv');

    expect(received[0]!.detail.value.data.entity_id).toBe('media_player.tv');
  });
});
