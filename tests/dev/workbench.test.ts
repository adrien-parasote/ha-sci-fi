// @vitest-environment happy-dom
/**
 * Tests — developer workbench (dev/workbench.html + dev/modules/*.js)
 * Spec: docs/specs/09_workbench_editor_i18n.md
 *
 * The workbench is a client-side dev tool: its modules read the DOM of
 * workbench.html by element id. Each test builds the minimal scaffold the
 * module under test touches, so a missing id fails loudly instead of silently
 * turning a check green.
 *
 * js-yaml is loaded from a CDN by workbench.html and is deliberately NOT a
 * package dependency — the spec lists "adding new packages to package.json"
 * under "Ask first". `window.jsyaml` is therefore a test double here; what is
 * under test is the wrapper's branching (accept / reject + line number), not
 * the YAML parser.
 */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import { handleYamlInput, updateCardConfig, mountUiEditor } from '../../dev/modules/editor.js';
import { buildMockHass } from '../../dev/modules/mock-hass.js';
import { setViewMode, getViewMode } from '../../dev/modules/view-modes.js';
import { setWorkMode, getWorkMode } from '../../dev/modules/work-mode.js';

// ── DOM scaffold ──────────────────────────────────────────────────────────────

function scaffoldEditor(): void {
  document.body.innerHTML = `
    <textarea id="yaml-textarea"></textarea>
    <div id="yaml-error-banner"></div>
    <div id="gui-editor-mount"></div>
  `;
}

function scaffoldViewModes(): void {
  document.body.innerHTML = `
    <div class="preview-area"></div>
    <div id="card-mount"></div>
    <button id="btn-mode-card"></button>
    <button id="btn-mode-panel"></button>
    <div id="device-toggle"></div>
    <div id="orientation-toggle"></div>
    <div id="device-viewport"></div>
    <div id="device-name-label"></div>
    <button id="btn-dev-desktop"></button>
    <button id="btn-dev-tablet"></button>
    <button id="btn-dev-phone"></button>
    <div id="device-vol-left"></div>
  `;
}

/** Minimal js-yaml stand-in: enough shape for the two branches under test. */
function installFakeJsYaml(): void {
  (window as any).jsyaml = {
    load(text: string) {
      if (text.includes('@@BAD@@')) {
        const err: any = new Error('bad indentation of a mapping entry');
        err.mark = { line: 2 }; // js-yaml marks are 0-based
        throw err;
      }
      // Deliberately tiny: `key: value` per line, which is all these tests feed it.
      const out: Record<string, string> = {};
      for (const line of text.split('\n')) {
        const m = /^(\w+):\s*(.+)$/.exec(line.trim());
        if (m) out[m[1]!] = m[2]!;
      }
      return Object.keys(out).length ? out : null;
    },
    dump(obj: unknown) {
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join('\n');
    },
  };
}

/**
 * The dev/ modules are plain JS with JSDoc, so their parameter objects are untyped
 * here. These two helpers keep the `as any` in one place instead of at every call.
 */
function yamlParams(extra: Record<string, unknown> = {}): any {
  return {
    cardEl: null, isLive: false, liveHass: null, haConnection: null, haAuth: null,
    language: 'fr', onConfigParsed: undefined,
    ...extra,
  };
}

function editorParams(extra: Record<string, unknown>): any {
  return {
    cardEl: null, isLive: false, liveHass: null, haConnection: null, haAuth: null,
    language: 'fr', onConfigChanged: undefined,
    ...extra,
  };
}

function makeCardStub() {
  return {
    setConfig: vi.fn(),
    hass: null as unknown,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  delete (window as any).jsyaml;
  localStorage.clear();
});

// ── YAML editor ───────────────────────────────────────────────────────────────

describe('workbench — YAML editor', () => {
  beforeEach(() => {
    scaffoldEditor();
    installFakeJsYaml();
  });

  it('TC-901: accepts valid YAML — no error banner, parsed config handed back', () => {
    (document.getElementById('yaml-textarea') as HTMLTextAreaElement).value =
      'type: custom:sci-fi-lights\nheader_message: Salon';
    const onConfigParsed = vi.fn();

    handleYamlInput(yamlParams({ onConfigParsed }));

    expect(onConfigParsed).toHaveBeenCalledTimes(1);
    expect(onConfigParsed.mock.calls[0]![0]).toEqual({
      type: 'custom:sci-fi-lights',
      header_message: 'Salon',
    });
    expect(document.getElementById('yaml-error-banner')!.classList.contains('visible')).toBe(false);
  });

  it('TC-902: rejects invalid YAML — banner visible and carries the 1-based line number', () => {
    (document.getElementById('yaml-textarea') as HTMLTextAreaElement).value = 'type: x\n@@BAD@@';
    const onConfigParsed = vi.fn();

    handleYamlInput(yamlParams({ onConfigParsed }));

    const banner = document.getElementById('yaml-error-banner')!;
    expect(banner.classList.contains('visible')).toBe(true);
    expect(banner.textContent).toContain('ligne 3'); // mark.line 2 → displayed as 3
    expect(banner.textContent).toContain('bad indentation');
    expect(onConfigParsed).not.toHaveBeenCalled();
  });

  it('IT-902: valid YAML re-configures the previewed card', () => {
    const cardEl = makeCardStub();
    (document.getElementById('yaml-textarea') as HTMLTextAreaElement).value = 'type: custom:sci-fi-lights';

    handleYamlInput(yamlParams({ cardEl }));

    expect(cardEl.setConfig).toHaveBeenCalledWith({ type: 'custom:sci-fi-lights' });
    expect(cardEl.hass).not.toBeNull();
  });

  it('IT-903: malformed YAML leaves the card on its last valid config', () => {
    const cardEl = makeCardStub();
    const textarea = document.getElementById('yaml-textarea') as HTMLTextAreaElement;

    textarea.value = 'type: custom:sci-fi-lights';
    handleYamlInput(yamlParams({ cardEl }));
    expect(cardEl.setConfig).toHaveBeenCalledTimes(1);

    textarea.value = 'type: x\n@@BAD@@';
    handleYamlInput(yamlParams({ cardEl }));

    // No second setConfig: the card keeps the configuration it already had.
    expect(cardEl.setConfig).toHaveBeenCalledTimes(1);
    expect(document.getElementById('yaml-error-banner')!.classList.contains('visible')).toBe(true);
  });
});

// ── Language ──────────────────────────────────────────────────────────────────

describe('workbench — language', () => {
  it('TC-903: the mock hass carries the selected language on both language and locale', () => {
    const fr = buildMockHass({}, 'fr') as any;
    expect(fr.language).toBe('fr');
    expect(fr.locale.language).toBe('fr');

    const en = buildMockHass({}, 'en') as any;
    expect(en.language).toBe('en');
    expect(en.locale.language).toBe('en');
  });

  it('IT-901: switching language re-applies a hass carrying the new language to the card', () => {
    scaffoldEditor();
    const cardEl = makeCardStub();

    updateCardConfig({ type: 'custom:sci-fi-lights' }, cardEl, false, null, null, null, 'fr');
    expect((cardEl.hass as any).language).toBe('fr');

    updateCardConfig({ type: 'custom:sci-fi-lights' }, cardEl, false, null, null, null, 'en');
    expect((cardEl.hass as any).language).toBe('en');
    expect((cardEl.hass as any).locale.language).toBe('en');
  });
});

// ── GUI editor mounting ───────────────────────────────────────────────────────

describe('workbench — GUI editor', () => {
  beforeEach(() => {
    scaffoldEditor();
    installFakeJsYaml();
  });

  it('TC-904: instantiates and configures the registered editor element', () => {
    const setConfig = vi.fn();
    if (!customElements.get('wb-probe-card-editor')) {
      customElements.define('wb-probe-card-editor', class extends HTMLElement {
        hass: unknown;
        setConfig(c: unknown) { setConfig(c); }
      });
    }

    mountUiEditor(editorParams({
      currentCard: 'probe',
      CARDS: { probe: { tag: 'wb-probe-card' } },
      activeConfig: { type: 'custom:wb-probe-card' },
    }));

    const mounted = document.getElementById('gui-editor-mount')!.firstElementChild;
    expect(mounted!.tagName.toLowerCase()).toBe('wb-probe-card-editor');
    expect((mounted as any).hass).not.toBeUndefined();
    expect(setConfig).toHaveBeenCalledWith({ type: 'custom:wb-probe-card' });
  });

  it('IT-904: a config-changed from the GUI editor regenerates the YAML textarea', () => {
    if (!customElements.get('wb-sync-card-editor')) {
      customElements.define('wb-sync-card-editor', class extends HTMLElement {
        hass: unknown;
        setConfig() { /* no-op */ }
      });
    }
    const onConfigChanged = vi.fn();

    mountUiEditor(editorParams({
      currentCard: 'sync',
      CARDS: { sync: { tag: 'wb-sync-card' } },
      activeConfig: { type: 'custom:wb-sync-card' },
      onConfigChanged,
    }));

    const editor = document.getElementById('gui-editor-mount')!.firstElementChild!;
    editor.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { type: 'custom:wb-sync-card', header_message: 'Cuisine' } },
    }));

    const textarea = document.getElementById('yaml-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('header_message: Cuisine');
    expect(onConfigChanged).toHaveBeenCalledTimes(1);
  });

  it('IT-905: falls back to the "éditeur indisponible" panel for an unregistered editor', () => {
    mountUiEditor(editorParams({
      currentCard: 'nope',
      CARDS: { nope: { tag: 'wb-unregistered-card' } },
      activeConfig: {},
    }));

    const mount = document.getElementById('gui-editor-mount')!;
    expect(mount.querySelector('.gui-fallback-panel')).not.toBeNull();
    expect(mount.textContent).toContain('Éditeur graphique indisponible');
    expect(mount.textContent).toContain('wb-unregistered-card-editor');
  });
});

// ── View modes ────────────────────────────────────────────────────────────────

describe('workbench — view modes', () => {
  beforeEach(scaffoldViewModes);

  it('TC-905: panel mode exposes the device selectors and marks its own button active', () => {
    setViewMode('panel');

    expect(getViewMode()).toBe('panel');
    expect(document.querySelector('.preview-area')!.classList.contains('mode-panel')).toBe(true);
    expect(document.querySelector('.preview-area')!.classList.contains('mode-card')).toBe(false);
    expect(document.getElementById('btn-mode-panel')!.classList.contains('active')).toBe(true);
    expect(document.getElementById('device-toggle')!.classList.contains('visible')).toBe(true);

    setViewMode('card');
    expect(document.getElementById('device-toggle')!.classList.contains('visible')).toBe(false);
  });

  it('IT-906: edit mode hides the device viewport and its selectors, view mode restores them', () => {
    document.body.insertAdjacentHTML('beforeend', `
      <button id="btn-work-view"></button>
      <button id="btn-work-edit"></button>
      <div id="edit-viewport"></div>
    `);
    // Panel view: the selectors are reachable...
    setViewMode('panel');
    expect(document.getElementById('device-toggle')!.classList.contains('visible')).toBe(true);

    const applied = vi.fn();
    setWorkMode('edit', applied);

    expect(getWorkMode()).toBe('edit');
    expect(applied).toHaveBeenCalledTimes(1);
    expect((document.getElementById('device-viewport') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('edit-viewport') as HTMLElement).style.display).toBe('flex');
    // ...and edit mode takes them away, forcing the computer layout.
    expect(document.getElementById('device-toggle')!.classList.contains('visible')).toBe(false);
    expect(document.getElementById('btn-work-edit')!.classList.contains('active')).toBe(true);

    setWorkMode('view');
    expect(getWorkMode()).toBe('view');
    expect((document.getElementById('device-viewport') as HTMLElement).style.display).toBe('');
    expect((document.getElementById('edit-viewport') as HTMLElement).style.display).toBe('none');
    // Back in panel view, the selectors come back.
    expect(document.getElementById('device-toggle')!.classList.contains('visible')).toBe(true);
    expect(document.getElementById('btn-work-view')!.classList.contains('active')).toBe(true);
  });
});
