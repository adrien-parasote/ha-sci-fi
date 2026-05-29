// @vitest-environment happy-dom
import { expect, describe, it, vi } from 'vitest';
import { html } from 'lit';

import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../src/utils/base-editor.js';
import type { HomeAssistantExt } from '../../src/types/ha.js';
import type { SciFiBaseConfig } from '../../src/types/config.js';
import { makeMockHass } from '../fixtures/mock-hass.js';

@customElement('mock-editor-v2')
class MockEditor extends SciFiBaseEditor {
  protected override renderEditor() {
    return html`<div>Mock Editor</div>`;
  }
}

function makeEl(): MockEditor {
  const el = document.createElement('mock-editor-v2') as MockEditor;
  document.body.appendChild(el);
  return el;
}

describe('base-editor', () => {
  // ── Core ──────────────────────────────────────────────────────────────────

  it('initializes default config properties', () => {
    const el = makeEl();
    expect((el as any).config).to.be.undefined;
    el.setConfig({ type: 'custom:mock' });
    expect((el as any).config).to.deep.equal({ type: 'custom:mock' });
  });

  it('render() returns no-config div when config is not set', () => {
    const el = makeEl();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('render() delegates to renderEditor() when config is set', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock' });
    const result = el.render();
    expect(result).toBeDefined();
  });

  // ── hass setter ───────────────────────────────────────────────────────────

  it('hass setter stores hass and getter returns it', () => {
    const el = makeEl();
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    el.hass = mockHass;
    expect(el.hass).toBe(mockHass);
  });

  it('hass setter accepts undefined without throwing', () => {
    const el = makeEl();
    expect(() => { el.hass = undefined; }).not.toThrow();
    expect(el.hass).toBeUndefined();
  });

  it('hass setter triggers setLocale asynchronously when language differs', async () => {
    const el = makeEl();
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    expect(() => { el.hass = mockHass; }).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(el.hass).toBe(mockHass);
  });

  it('hass setter with unsupported locale completes without crash', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = makeEl();
    const mockHass = { locale: { language: 'de' } } as unknown as HomeAssistantExt;
    expect(() => { el.hass = mockHass; }).not.toThrow();
    await new Promise((r) => setTimeout(r, 20));
    consoleSpy.mockRestore();
  });

  // ── _dispatchChange ───────────────────────────────────────────────────────

  it('_dispatchChange dispatches config-changed and syncs local config', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock' });
    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const newConfig = { type: 'custom:mock', title: 'Updated' };
    (el as any)._dispatchChange(newConfig);

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config).toEqual(newConfig);
    expect(el.config).toEqual(newConfig);
  });

  it('_dispatchChange event bubbles', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock' });
    let fired = false;
    document.body.addEventListener('config-changed', () => { fired = true; });
    (el as any)._dispatchChange({ type: 'custom:mock' });
    expect(fired).toBe(true);
  });

  // ── _dispatchConfigChanged (deprecated compat) ─────────────────────────────

  it('_dispatchConfigChanged dispatches config-changed event', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock' });
    let eventFired = false;
    let detailConfig: any = null;
    el.addEventListener('config-changed', (e: any) => {
      eventFired = true;
      detailConfig = e.detail.config;
    });
    (el as any)._dispatchConfigChanged({ type: 'custom:mock', title: 'New' });
    expect(eventFired).to.be.true;
    expect(detailConfig.title).to.equal('New');
  });

  it('_dispatchConfigChanged merges patch with existing config', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock', title: 'Base' } as unknown as SciFiBaseConfig);
    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    (el as any)._dispatchConfigChanged({ extra: 'field' });

    expect(received[0]!.detail.config.type).toBe('custom:mock');
    expect(received[0]!.detail.config.title).toBe('Base');
    expect(received[0]!.detail.config.extra).toBe('field');
  });

  // ── _getNewConfig ─────────────────────────────────────────────────────────

  it('_getNewConfig returns a deep clone of config', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock', title: 'Original' } as unknown as SciFiBaseConfig);

    const cloned = (el as any)._getNewConfig();
    expect(cloned).not.toBe(el.config);
    expect(cloned).toEqual({ type: 'custom:mock', title: 'Original' });
  });

  it('_getNewConfig modifications do not affect original config', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock' });

    const cloned = (el as any)._getNewConfig();
    cloned.extra = 'injected';

    expect((el.config as any).extra).toBeUndefined();
  });

  it('_getNewConfig returns empty object when config is not set', () => {
    const el = makeEl();
    // No setConfig — config is undefined
    const cloned = (el as any)._getNewConfig();
    expect(cloned).toEqual({});
  });

  // ── getLabel ──────────────────────────────────────────────────────────────

  it('getLabel returns a string for known keys', () => {
    const el = makeEl();
    const result = el.getLabel('section-title-header');
    expect(typeof result).toBe('string');
  });

  it('getLabel returns empty string for unknown key', () => {
    const el = makeEl();
    expect(el.getLabel('totally-unknown-key-xyz')).toBe('');
  });

  it('TC-308: getLabel returns translated French string when locale is fr', async () => {
    const el = makeEl();
    const mockHass = {
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;
    el.hass = mockHass;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(el.getLabel('section-title-header')).toBe('En-tête');
  });

  it('getLabel covers a variety of known keys without throwing', () => {
    const el = makeEl();
    const keys = [
      'section-title-settings',
      'section-title-vehicle',
      'section-title-entity',
      'input-icon',
      'input-name',
      'input-entity-id',
      'input-link',
      'action-add-tile',
      'action-add-custom-entity',
      'action-add-vehicle',
      'action-add-device',
      'action-add-segment',
      'action-add-shortcut',
      'action-delete-shortcut',
      'action-edit-shortcut',
      'text-optional',
      'text-required',
      'edit-section-title',
      'input-floor-id',
      'input-area-id',
      'input-location',
      'input-mileage',
      'input-battery-level',
      'input-charging-state',
      'input-fuel-autonomy',
      'input-weather-entity',
      'input-message-text',
      'input-color-auto',
      'input-icon-auto',
      'input-switch-entity',
      'input-vacuum-entity',
      'text-no-vacuum',
      'section-title-device-settings',
      'section-title-media-sources',
      'input-media-player-entity',
      'input-quadrant-name',
      'input-remote-entity',
      'input-media-sources',
    ];
    for (const key of keys) {
      const result = el.getLabel(key);
      expect(typeof result).toBe('string');
    }
  });

  // ── getSectionTitle ───────────────────────────────────────────────────────

  it('getSectionTitle returns a TemplateResult object for known key', () => {
    const el = makeEl();
    const result = el.getSectionTitle('section-title-header');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('getSectionTitle returns a TemplateResult for unknown key (fallback icon)', () => {
    const el = makeEl();
    const result = el.getSectionTitle('unknown-section-xyz');
    expect(result).toBeDefined();
  });

  it('getSectionTitle covers all mapped section keys', () => {
    const el = makeEl();
    const keys = [
      'section-title-header',
      'section-title-settings',
      'section-title-vehicle',
      'section-title-state',
      'section-title-mode',
      'section-title-weather',
      'section-title-chart',
      'section-title-alert',
      'section-title-tile',
      'section-title-technical',
      'section-title-home-selection',
      'section-title-appearance',
      'section-title-entity',
      'section-title-entity-light-custom',
      'section-title-sensor',
      'section-title-storage',
      'section-title-plug',
      'section-title-energy',
      'section-title-other',
      'section-title-monitoring',
      'section-title-config',
      'section-title-device',
      'section-title-visibility',
      'section-title-default-actions',
      'section-title-custom-actions',
      'section-title-shortcuts',
      'section-title-segments',
    ];
    for (const key of keys) {
      const result = el.getSectionTitle(key);
      expect(result).toBeDefined();
    }
  });
});
