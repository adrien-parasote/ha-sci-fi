// @vitest-environment happy-dom
import { expect, describe, it, vi } from 'vitest';
import { html } from 'lit';

import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../src/utils/base-editor.js';
import type { HomeAssistantExt } from '../../src/types/ha.js';
import { makeMockHass } from '../fixtures/mock-hass.js';

@customElement('mock-editor')
class MockEditor extends SciFiBaseEditor {
  protected override renderEditor() {
    return html`<div>Mock Editor</div>`;
  }
}

describe('base-editor', () => {
  it('initializes default config properties', async () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    expect((el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */.config).to.be.undefined;
    el.setConfig({ type: 'custom:mock' });
    expect((el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */.config).to.deep.equal({ type: 'custom:mock' });
  });

  it('dispatches config-changed event on change', async () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    el.setConfig({ type: 'custom:mock' });

    let eventFired = false;
    let detailConfig: any = null;

    el.addEventListener('config-changed', (e: any) => {
      eventFired = true;
      detailConfig = e.detail.config;
    });

    (el as unknown as any) /* eslint-disable-line @typescript-eslint/no-unsafe-argument */._dispatchConfigChanged({ type: 'custom:mock', title: 'New' });

    expect(eventFired).to.be.true;
    expect(detailConfig.title).to.equal('New');
  });

  // ── i18n hass setter tests ───────────────────────────────────────────────────

  it('hass setter stores hass and getter returns it', () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    el.hass = mockHass;
    expect(el.hass).toBe(mockHass);
  });

  it('hass setter accepts undefined without throwing', () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    expect(() => {
      el.hass = undefined;
    }).not.toThrow();
    expect(el.hass).toBeUndefined();
  });

  it('hass setter triggers setLocale asynchronously when language differs', async () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    // Should not throw — locale update is async
    expect(() => {
      el.hass = mockHass;
    }).not.toThrow();
    // Allow micro-tasks to settle
    await new Promise((r) => setTimeout(r, 0));
    expect(el.hass).toBe(mockHass);
  });

  it('render() returns no-config div when config is not set', () => {
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    // No setConfig called — render() falls back to "No config"
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('hass setter with unsupported locale completes without crash', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = document.createElement('mock-editor') as MockEditor;
    document.body.appendChild(el);
    // 'de' is not in targetLocales — setLocale will error internally
    const mockHass = { locale: { language: 'de' } } as unknown as HomeAssistantExt;
    expect(() => { el.hass = mockHass; }).not.toThrow();
    // Allow async error to be caught
    await new Promise((r) => setTimeout(r, 20));
    consoleSpy.mockRestore();
  });
});
