// @vitest-environment happy-dom
import { expect, describe, it, vi } from 'vitest';
import { html } from 'lit';
import * as fs from 'fs';
import * as path from 'path';

import { bridgeLabels } from '../../src/cards/bridge/labels.js';
import { climatesLabels } from '../../src/cards/climates/labels.js';
import { hexaTilesLabels } from '../../src/cards/hexa-tiles/labels.js';
import { lightsLabels } from '../../src/cards/lights/labels.js';
import { plugsLabels } from '../../src/cards/plugs/labels.js';
import { stoveLabels } from '../../src/cards/stove/labels.js';
import { tvLabels } from '../../src/cards/tv/labels.js';
import { vacuumLabels } from '../../src/cards/vacuum/labels.js';
import { vehiclesLabels } from '../../src/cards/vehicles/labels.js';
import { weatherLabels } from '../../src/cards/weather/labels.js';

import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor, sharedEditorLabels } from '../../src/utils/base-editor.js';
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

/**
 * Stands in for any card editor: whatever dictionary is assigned goes through
 * the real getLabel() merge, so TC-1018 exercises the production lookup rather
 * than reading the dictionaries directly.
 */
@customElement('mock-editor-card-labels')
class MockCardEditor extends SciFiBaseEditor {
  dictionary: Record<string, string> = {};
  protected override get cardLabels(): Record<string, string> {
    return this.dictionary;
  }
  protected override renderEditor() {
    return html`<div>Mock Card Editor</div>`;
  }
}

/**
 * The 10 card-owned dictionaries. Listed rather than globbed because
 * `import.meta.glob` would need `vite/client` in tsconfig `types`, widening the
 * whole project's type surface for one test. The list is a list of MODULES, not
 * of keys: a new label is covered automatically, and the cross-check below
 * fails if a new card's labels.ts is ever added without a line here.
 */
const cardLabelModules: Record<string, () => Record<string, string>> = {
  bridge: bridgeLabels,
  climates: climatesLabels,
  'hexa-tiles': hexaTilesLabels,
  lights: lightsLabels,
  plugs: plugsLabels,
  stove: stoveLabels,
  tv: tvLabels,
  vacuum: vacuumLabels,
  vehicles: vehiclesLabels,
  weather: weatherLabels,
};

/** Card directories that actually ship a labels.ts, read from disk. */
function cardDirsWithLabels(): string[] {
  const cardsDir = path.join(__dirname, '..', '..', 'src', 'cards');
  return fs
    .readdirSync(cardsDir)
    .filter((d) => fs.existsSync(path.join(cardsDir, d, 'labels.ts')))
    .sort();
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

  it('IT-303: hass setter triggers setLocale asynchronously when language differs', async () => {
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

  it('TC-1004: _dispatchChange dispatches config-changed and syncs local config', () => {
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

  it('TC-305: _dispatchConfigChanged dispatches config-changed event', () => {
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

  it('TC-1003: _getNewConfig returns a deep clone of config', () => {
    const el = makeEl();
    el.setConfig({ type: 'custom:mock', title: 'Original' } as unknown as SciFiBaseConfig);

    const cloned = (el as any)._getNewConfig();
    expect(cloned).not.toBe(el.config);
    expect(cloned).toEqual({ type: 'custom:mock', title: 'Original' });
  });

  it('TC-1015: _getNewConfig modifications do not affect original config', () => {
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

  it('TC-1001: getLabel returns a string for known keys', () => {
    const el = makeEl();
    const result = el.getLabel('section-title-header');
    expect(typeof result).toBe('string');
  });

  it('TC-1002: getLabel returns empty string for unknown key', () => {
    const el = makeEl();
    expect(el.getLabel('totally-unknown-key-xyz')).toBe('');
  });

  it('TC-1017: every shared key resolves to a non-empty label', () => {
    // getLabel() returns '' for an unknown key, so a shared entry that is
    // misspelled, or whose msg() resolves to nothing, fails silently at
    // runtime — the field just renders unlabelled (anti-pattern 12).
    // Iterates the real dictionary rather than restating it, so a new key is
    // covered the moment it is added.
    const el = makeEl();
    const empty = Object.keys(sharedEditorLabels()).filter((key) => el.getLabel(key) === '');
    expect(empty, `shared keys resolving to an empty label: ${JSON.stringify(empty)}`).toEqual([]);
  });

  // Same failure mode as TC-1017, over the 10 card-owned dictionaries — which
  // hold 142 of the 179 keys, including the two the vacuum defect (85da36f)
  // actually rendered blank.
  it('TC-1018: covers every card that ships a labels.ts', () => {
    // Keeps the module list above honest: add a card, and this fails until the
    // card is wired in, so the per-card assertions can never go quietly stale.
    expect(Object.keys(cardLabelModules).sort()).toEqual(cardDirsWithLabels());
    for (const [card, dict] of Object.entries(cardLabelModules)) {
      expect(Object.keys(dict()).length, `${card} dictionary is empty`).toBeGreaterThan(0);
    }
  });

  for (const [card, dict] of Object.entries(cardLabelModules)) {
    it(`TC-1018: ${card} — every key resolves to a non-empty label`, () => {
      const el = document.createElement('mock-editor-card-labels') as MockCardEditor;
      document.body.appendChild(el);
      const dictionary = dict();
      el.dictionary = dictionary;
      const empty = Object.keys(dictionary).filter((key) => el.getLabel(key) === '');
      expect(empty, `${card} keys resolving to an empty label: ${JSON.stringify(empty)}`).toEqual([]);
    });
  }

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
