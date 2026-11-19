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
import { buildMockHass, republishedHass } from '../../dev/modules/mock-hass.js';
import { setViewMode, getViewMode } from '../../dev/modules/view-modes.js';
import { setWorkMode, getWorkMode } from '../../dev/modules/work-mode.js';
import { handleHassAction } from '../../dev/modules/hass-action.js';
import { setupConsoleProxy } from '../../dev/modules/console.js';
import { MOCK_STATES } from '../../dev/modules/mock-data.js';
import hexaCard from '../../dev/cards/hexa.js';
import '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';

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
  document.body.replaceChildren();
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

// ── Hexa quick actions (docs/specs/hexa-tiles-quick-actions/spec.md FR-16) ────

describe('workbench — hexa quick actions', () => {
  const warn = console.warn;
  const error = console.error;
  beforeEach(() => {
    document.body.innerHTML = '<div id="console-area"></div>';
    setupConsoleProxy();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    console.warn = warn;
    console.error = error;
  });

  const lines = (): string[] => Array.from(document.querySelectorAll('#console-area .console-line')).map(l => l.textContent ?? '');
  const toggle = (entity: string) => ({ action: 'tap', config: { entity, tap_action: { action: 'toggle' } } });
  interface MockHass { states: Record<string, { state: string }>; callService: (...a: unknown[]) => Promise<void> }
  const mockHass = (scenario: Record<string, unknown>): MockHass => buildMockHass(scenario, 'fr') as unknown as MockHass;

  it('TC-HQA-U-17: the hexa workbench card carries the three target tiles and the mock the EV charger on', () => {
    const tiles = (hexaCard as { config: { tiles: Array<{ entity?: string }> } }).config.tiles.map(t => t.entity);
    for (const id of ['cover.portail', 'light.zbmini_l_dressing_parent', 'switch.mureva_evlink']) {
      expect(tiles, id).toContain(id);
    }
    expect((MOCK_STATES as Record<string, { state: string }>)['switch.mureva_evlink']!.state).toBe('on');
    expect((MOCK_STATES as Record<string, { state: string; attributes: Record<string, unknown> }>)['cover.portail']).toMatchObject({ state: 'closed', attributes: { device_class: 'gate' } });
    expect((MOCK_STATES as Record<string, { state: string }>)['light.zbmini_l_dressing_parent']!.state).toBe('off');
  });

  /** What the workbench hears: every `states` object the Mock publishes on `mock-hass-state-changed`. */
  function listenPublished(): { published: Array<MockHass['states']>; stop: () => void } {
    const published: Array<MockHass['states']> = [];
    const on = (e: Event) => published.push((e as CustomEvent<{ states: MockHass['states'] }>).detail.states);
    window.addEventListener('mock-hass-state-changed', on);
    return { published, stop: () => window.removeEventListener('mock-hass-state-changed', on) };
  }

  it('TC-HQA-U-17: in Mock mode a toggle calls the domain service 3 s later; any other action is only logged', async () => {
    const hass = mockHass({});
    const { published, stop } = listenPublished();
    const latest = () => published[published.length - 1] ?? hass.states;
    try {
      handleHassAction(toggle('cover.portail'), { hass, live: false, scenario: {} });
      await vi.advanceTimersByTimeAsync(2999);
      expect(latest()['cover.portail']!.state).toBe('closed');
      await vi.advanceTimersByTimeAsync(1);
      expect(latest()['cover.portail']!.state).toBe('open');
      expect(lines().some(l => l.includes('open_cover'))).toBe(true);

      handleHassAction(toggle('light.zbmini_l_dressing_parent'), { hass: { ...hass, states: latest() }, live: false, scenario: {} });
      await vi.advanceTimersByTimeAsync(3000);
      expect(latest()['light.zbmini_l_dressing_parent']!.state).toBe('on');
      expect(latest()['cover.portail']!.state, 'a second mutation keeps the first').toBe('open');
      expect(lines().some(l => l.includes('turn_on'))).toBe(true);

      const before = JSON.stringify(latest());
      const count = lines().length;
      const publishedCount = published.length;
      handleHassAction({ action: 'tap', config: { entity: 'cover.portail', tap_action: { action: 'more-info' } } }, { hass, live: false, scenario: {} });
      await vi.advanceTimersByTimeAsync(5000);
      expect(lines()).toHaveLength(count + 1);
      expect(published).toHaveLength(publishedCount);
      expect(JSON.stringify(latest())).toBe(before);
    } finally {
      stop();
    }
  });

  it('TC-HQA-U-17: each Mock mutation publishes a NEW states object, the one already published left untouched', async () => {
    const hass = mockHass({});
    const { published, stop } = listenPublished();
    try {
      const first = hass.states;
      await hass.callService('cover', 'open_cover', { entity_id: 'cover.portail' });
      expect(published).toHaveLength(1);
      const next = published[0]!;
      expect(next, 'a new states object, as HA sends').not.toBe(first);
      expect(first['cover.portail']!.state, 'the published states is never mutated in place').toBe('closed');
      expect(next['cover.portail']!.state).toBe('open');
      expect(next['cover.portail']).not.toBe(first['cover.portail']);
      expect(next['light.zbmini_l_dressing_parent'], 'an untouched entity keeps its reference').toBe(first['light.zbmini_l_dressing_parent']);
    } finally {
      stop();
    }
  });

  it('TC-HQA-U-17: the mounted hexa card, republished as the workbench does, ends its pending when the Mock mutation lands at 3 s', async () => {
    type Card = HTMLElement & { hass: MockHass; setConfig(c: unknown): void; updateComplete: Promise<unknown> };
    const el = document.createElement('sci-fi-hexa-tiles') as unknown as Card;
    el.setConfig((hexaCard as { config: unknown }).config);
    el.hass = mockHass({});
    // The workbench wiring (dev/modules/workbench-app.js): hass-action → handleHassAction; a Mock mutation → a new hass.
    el.addEventListener('hass-action', (e) => handleHassAction((e as CustomEvent).detail, { hass: el.hass, live: false, scenario: {} }));
    const republish = (e: Event) => {
      const next = republishedHass(el.hass, (e as CustomEvent).detail) as MockHass | undefined;
      if (next) el.hass = next;
    };
    window.addEventListener('mock-hass-state-changed', republish);
    document.body.appendChild(el);
    try {
      await el.updateComplete;
      const gate = (): HTMLElement => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.hexa-tile[role="button"]'))
        .find(t => (t.getAttribute('aria-label') ?? '').startsWith('Portail'))!;
      expect(gate(), 'the gate tile is rendered').toBeTruthy();
      gate().click();
      await vi.advanceTimersByTimeAsync(2999);
      await el.updateComplete;
      expect(gate().getAttribute('data-pending')).toBe('true');
      await vi.advanceTimersByTimeAsync(1);
      await el.updateComplete;
      expect(gate().hasAttribute('data-pending'), 'the pending ends on the new state').toBe(false);
      expect(gate().getAttribute('aria-label')).toBe('Portail, Ouvert');
    } finally {
      window.removeEventListener('mock-hass-state-changed', republish);
      el.remove();
    }
  });

  it('TC-HQA-U-17: a deferred Mock mutation of a hass the card no longer holds is not published onto it', async () => {
    const { published, stop } = listenPublished();
    const details: unknown[] = [];
    const keep = (e: Event) => details.push((e as CustomEvent).detail);
    window.addEventListener('mock-hass-state-changed', keep);
    try {
      const tapped = mockHass({});
      handleHassAction(toggle('cover.portail'), { hass: tapped, live: false, scenario: {} });
      // Before 3 s the workbench hands the card another mock hass (scenario, language or config change).
      const scenarios = (hexaCard as { scenarios: Record<string, Record<string, unknown>> }).scenarios;
      const current = mockHass(scenarios['Indisponible']!);
      await vi.advanceTimersByTimeAsync(3000);
      expect(published, 'the superseded hass still mutates its own states').toHaveLength(1);
      expect(republishedHass(current, details[0]), 'never written onto the card that holds another hass').toBeUndefined();
      expect(current.states['cover.portail']!.state).toBe('unavailable');
      const own = republishedHass(tapped, details[0]) as MockHass;
      expect(own.states['cover.portail']!.state, 'the hass the mutation came from is republished').toBe('open');
      expect(own.callService).toBe(tapped.callService);
    } finally {
      window.removeEventListener('mock-hass-state-changed', keep);
      stop();
    }
  });

  it('TC-HQA-U-17: the four scenarios — muted relay applies nothing, unavailable and moving gate, stove off', async () => {
    const scenarios = (hexaCard as { scenarios: Record<string, Record<string, unknown>> }).scenarios;
    const muted = scenarios['Relais muet']!;
    const hass = mockHass(muted);
    const callService = vi.spyOn(hass, 'callService');
    handleHassAction(toggle('cover.portail'), { hass, live: false, scenario: muted });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(hass.states['cover.portail']!.state).toBe('closed');
    expect(callService).not.toHaveBeenCalled();

    expect(mockHass(scenarios['Indisponible']!).states['cover.portail']!.state).toBe('unavailable');
    expect(mockHass(scenarios['Portail en mouvement']!).states['cover.portail']!.state).toBe('opening');

    // 'Poêle éteint' (user ask 2026-11-19): compare the Poêle tile between heat and off, a tap navigates to stove.
    expect(mockHass({}).states['climate.clou']!.state, 'the mock default is heat').toBe('heat');
    expect(scenarios['Poêle éteint'], "scenario 'Poêle éteint'").toBeDefined();
    expect(mockHass(scenarios['Poêle éteint']!).states['climate.clou']!.state).toBe('off');
    const tiles = (hexaCard as { config: { tiles: Array<Record<string, unknown>> } }).config.tiles;
    const stove = tiles.find((t) => t.entity === 'climate.clou');
    expect(stove, 'the Poêle tile').toBeDefined();
    expect(stove!.link).toBe('stove');
    expect(stove!.state_on).toContain('heat');
    expect(stove!.state_on).not.toContain('off');
  });

  it('TC-HQA-U-17: in Live mode a toggle calls the real service at once, with the service of the state', () => {
    const callService = vi.fn().mockResolvedValue(undefined);
    const hass = { states: { 'cover.portail': { state: 'open' }, 'switch.mureva_evlink': { state: 'on' } }, callService };
    handleHassAction(toggle('cover.portail'), { hass, live: true, scenario: {} });
    handleHassAction({ action: 'hold', config: { entity: 'switch.mureva_evlink', hold_action: { action: 'toggle' } } }, { hass, live: true, scenario: {} });
    expect(callService.mock.calls).toEqual([
      ['cover', 'close_cover', { entity_id: 'cover.portail' }],
      ['switch', 'turn_off', { entity_id: 'switch.mureva_evlink' }],
    ]);
  });

  it('TC-HQA-U-17: in Live mode a service HA rejects is logged as an error, never left unhandled', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const callService = vi.fn().mockRejectedValue(new Error('Entity cover.portail is unavailable'));
      const hass = { states: { 'cover.portail': { state: 'unavailable' } }, callService };
      vi.useRealTimers(); // the unhandled-rejection report needs a real turn of the event loop
      handleHassAction(toggle('cover.portail'), { hass, live: true, scenario: {} });
      await new Promise(r => setTimeout(r, 20));
      expect(lines().some(l => l.includes('Entity cover.portail is unavailable'))).toBe(true);
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it('TC-HQA-U-17: in Mock mode a service call rejected at 3 s is logged as an error, never left unhandled', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const callService = vi.fn().mockRejectedValue(new Error('Service cover.open_cover not found'));
      const hass = { states: { 'cover.portail': { state: 'closed' } }, callService };
      handleHassAction(toggle('cover.portail'), { hass, live: false, scenario: {} });
      await vi.advanceTimersByTimeAsync(3000);
      expect(callService).toHaveBeenCalledTimes(1);
      vi.useRealTimers(); // the unhandled-rejection report needs a real turn of the event loop
      await new Promise(r => setTimeout(r, 20));
      expect(lines().some(l => l.includes('Service cover.open_cover not found'))).toBe(true);
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});
