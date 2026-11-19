// @vitest-environment happy-dom
/**
 * Fix lot hexa-tiles-quick-actions, O1 (bead ha-sci-fi-b92r.1): « ↺ Recharger carte » removed the
 * bundle <script> and appended a fresh one, so every customElements.define ran a second time in
 * the same page and threw on 'sf-icon'. A page can evaluate the bundle only once: the button
 * navigates back to the workbench document, and the selected card, scenario and edited config
 * survive that reload.
 */
import { afterEach, expect, describe, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  reloadWorkbench,
  restoreSelection,
  saveReloadState,
  takeReloadState,
} from '../../dev/modules/reload-state.js';
import { CARDS as REGISTRY } from '../../dev/cards/_registry.js';

// The workbench entry module runs its init sequence on import; only what would reach the network
// or the bundle is replaced, so the restore path below runs the real workbench-app.js.
vi.mock('../../dev/modules/bundle-loader.js', () => ({
  createBundleLoader: () => ({ load: () => Promise.resolve() }),
}));
vi.mock('../../dev/modules/icon-browser.js', () => ({ mountIconBrowser: () => Promise.resolve() }));
vi.mock('../../dev/modules/ha-connection.js', () => ({
  connectToHA: vi.fn(),
  disconnectHA: vi.fn(),
  refreshLiveStates: vi.fn(),
  tryAutoReconnect: vi.fn(),
  isLiveMode: () => false,
  getLiveHass: () => null,
  getHaConnection: () => null,
  getHaAuth: () => null,
  getCurrentLanguage: () => 'fr',
  setCurrentLanguage: vi.fn(),
}));

class MemoryStorage {
  private readonly items = new Map<string, string>();
  getItem(k: string): string | null { return this.items.get(k) ?? null; }
  setItem(k: string, v: string): void { this.items.set(k, v); }
  removeItem(k: string): void { this.items.delete(k); }
}

const CARDS = {
  hexa: { scenarios: { 'Tout éteint': {}, 'Salon allumé': {} } },
  stove: { scenarios: { 'Poêle éteint': {}, 'Poêle allumé': {} } },
  icons: { type: 'iconpicker' },
};

describe('workbench — O1 reload card', () => {
  it('O1: reloadCard never re-evaluates the bundle in place and goes through reloadWorkbench', () => {
    // Repository-relative: vitest runs from the repository root.
    const app = readFileSync(join(process.cwd(), 'dev/modules/workbench-app.js'), 'utf8');
    const body = /function reloadCard\(\) \{([\s\S]*?)\n\}/.exec(app)?.[1];
    expect(body, 'function reloadCard in workbench-app.js').toBeDefined();
    expect(body, 'no <script> removed or re-appended').not.toMatch(/script|appendChild|bundle\.(reset|load)/);
    expect(body, 'reloads the workbench path, not the current URL').not.toMatch(/location\.reload\(/);
    expect(body).toMatch(/reloadWorkbench\(/);
  });

  it('O1: the reload goes back to the workbench path after a tile moved the address bar', () => {
    const loc = { pathname: '/dev/lights', replace: vi.fn(), reload: vi.fn() };
    const storage = new MemoryStorage();
    const state = { card: 'hexa', scenario: 'Salon allumé', config: { type: 'custom:sci-fi-hexa-tiles' } };
    reloadWorkbench(loc, storage, '/dev/workbench', state);
    expect(loc.replace).toHaveBeenCalledExactlyOnceWith('/dev/workbench');
    expect(loc.reload).not.toHaveBeenCalled();
    expect(takeReloadState(storage), 'saved before navigating').toEqual(state);
  });

  it('O1: the saved state is read once, and a missing or malformed one is null', () => {
    const storage = new MemoryStorage();
    expect(takeReloadState(storage)).toBeNull();
    saveReloadState(storage, { card: 'stove', scenario: 'Poêle éteint' });
    expect(takeReloadState(storage)).toEqual({ card: 'stove', scenario: 'Poêle éteint' });
    expect(takeReloadState(storage), 'a later manual reload starts on the defaults').toBeNull();
    storage.setItem('wb-reload', '{not json');
    expect(takeReloadState(storage)).toBeNull();
    storage.setItem('wb-reload', '"stove"');
    expect(takeReloadState(storage)).toBeNull();
  });

  it('O1: the restored card, scenario and edited config are reopened', () => {
    const config = { type: 'custom:sci-fi-stove', name: 'édité' };
    expect(restoreSelection({ card: 'stove', scenario: 'Poêle allumé', config }, CARDS, 'hexa'))
      .toEqual({ card: 'stove', scenario: 'Poêle allumé', config });
  });

  it('O1: an unknown scenario is dropped and the card opens on its first one', () => {
    expect(restoreSelection({ card: 'stove', scenario: 'Disparu' }, CARDS, 'hexa'))
      .toEqual({ card: 'stove', scenario: undefined, config: null });
    expect(restoreSelection({ card: 'stove', scenario: 'toString' }, CARDS, 'hexa').scenario).toBeUndefined();
  });

  it('O1: an unknown card falls back, with no scenario and no config', () => {
    expect(restoreSelection({ card: 'gone', scenario: 'Poêle allumé', config: { a: 1 } }, CARDS, 'hexa'))
      .toEqual({ card: 'hexa', scenario: undefined, config: null });
    expect(restoreSelection({ card: 42 }, CARDS, 'hexa').card).toBe('hexa');
  });

  it.each(['__proto__', 'toString', 'constructor'])('O1: a prototype name as card (%s) falls back', (card) => {
    expect(restoreSelection({ card, scenario: 'x', config: { a: 1 } }, CARDS, 'hexa'))
      .toEqual({ card: 'hexa', scenario: undefined, config: null });
  });

  it('O1: a card with no scenarios (iconpicker) is restored with no scenario', () => {
    expect(restoreSelection({ card: 'icons', scenario: 'x', config: null }, CARDS, 'hexa'))
      .toEqual({ card: 'icons', scenario: undefined, config: null });
  });

  it('O1: a non-object config is dropped', () => {
    expect(restoreSelection({ card: 'hexa', config: ['a'] }, CARDS, 'x').config).toBeNull();
    expect(restoreSelection({ card: 'hexa', config: 'a: 1' }, CARDS, 'x').config).toBeNull();
  });

  it('O1: no saved state opens on the fallback', () => {
    expect(restoreSelection(null, CARDS, 'hexa')).toEqual({ card: 'hexa', scenario: undefined, config: null });
  });
});

/** The registry entries the integration runs read, narrowed once (the registry is a union of card shapes). */
interface RegistryCard { label: string; scenarios: Record<string, unknown>; config?: Record<string, unknown> }

function registryCard(key: string): RegistryCard {
  const card = (REGISTRY as Record<string, RegistryCard | undefined>)[key];
  if (!card) throw new Error(`no '${key}' card in dev/cards/_registry.js`);
  return card;
}

function registryConfig(key: string): Record<string, unknown> {
  const config = registryCard(key).config;
  if (!config) throw new Error(`the '${key}' card has no config`);
  return config;
}

/** The card's scenario at `index`; the runs below need a non-first one, where a dropped scenario shows. */
function scenarioOf(key: string, index: number): string {
  const name = Object.keys(registryCard(key).scenarios)[index];
  if (name === undefined) throw new Error(`the '${key}' card has no scenario #${index}`);
  return name;
}

const WORKBENCH_URL = 'http://localhost:8888/dev/workbench';
const WORKBENCH_BODY = (() => {
  const html = readFileSync(join(process.cwd(), 'dev/workbench.html'), 'utf8');
  const inner = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1];
  if (inner === undefined) throw new Error('dev/workbench.html has no <body>');
  return inner.replace(/<script[\s\S]*?<\/script>/g, '');
})();
const happyDOM = (window as unknown as { happyDOM: { setURL: (url: string) => void } }).happyDOM;
// Each boot wraps history.pushState again; the next boot starts from the page's own.
const pagePushState = history.pushState;

function el(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} missing from dev/workbench.html`);
  return found;
}

const overlayHidden = () => vi.waitFor(() => expect(el('loading-overlay').classList.contains('hidden')).toBe(true));
const yamlShown = (): unknown => JSON.parse((el('yaml-textarea') as HTMLTextAreaElement).value);
const activeScenario = () => document.querySelector('#scenario-list .scenario-btn.active')?.textContent;

/** Loads the real workbench-app.js on the workbench document, `saved` seeded as the state a reload left. */
async function bootWorkbench(saved: object): Promise<void> {
  happyDOM.setURL(WORKBENCH_URL);
  document.body.innerHTML = WORKBENCH_BODY;
  (window as unknown as { jsyaml: { dump: (o: unknown) => string } }).jsyaml = { dump: (o) => JSON.stringify(o) };
  sessionStorage.setItem('wb-reload', JSON.stringify(saved));
  vi.resetModules();
  await import('../../dev/modules/workbench-app.js');
  await overlayHidden();
  expect(sessionStorage.getItem('wb-reload'), 'read once').toBeNull();
}

/** Clicks « ↺ Recharger carte » and returns the state it saved for the next document. */
function clickReloadCard(): { card: string, scenario: string | null, config: Record<string, unknown> | null } {
  const replace = vi.spyOn(location, 'replace').mockImplementation(() => {});
  const reload = vi.spyOn(location, 'reload').mockImplementation(() => {});
  el('btn-reload-card').click();
  expect(replace).toHaveBeenCalledExactlyOnceWith('/dev/workbench');
  expect(reload).not.toHaveBeenCalled();
  replace.mockRestore();
  reload.mockRestore();
  const saved = sessionStorage.getItem('wb-reload');
  if (saved === null) throw new Error('Recharger carte saved no state');
  sessionStorage.removeItem('wb-reload');
  return JSON.parse(saved);
}

describe('workbench — O1 reload card, the real workbench-app.js', () => {
  afterEach(() => {
    history.pushState = pagePushState;
    sessionStorage.clear();
  });

  it('O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config', async () => {
    const scenario = scenarioOf('stove', 1);
    const config = { ...registryConfig('stove'), name: 'édité avant le rechargement' };
    await bootWorkbench({ card: 'stove', scenario, config });
    expect(el('preview-title').textContent).toBe(registryCard('stove').label);
    expect(activeScenario()).toBe(scenario);
    expect(yamlShown()).toEqual(config);

    history.pushState(null, '', 'lights');
    expect(location.pathname, 'the tile link moved the address bar').toBe('/dev/lights');
    await vi.waitFor(() => expect(activeScenario()).toBe(scenarioOf('lights', 0)));
    await overlayHidden();
    // A non-first scenario, so a reload that dropped it would reopen on another one.
    const lightsScenario = scenarioOf('lights', 1);
    const button = [...document.querySelectorAll<HTMLElement>('#scenario-list .scenario-btn')]
      .find((b) => b.textContent === lightsScenario);
    if (!button) throw new Error(`no button for the '${lightsScenario}' scenario`);
    button.click();
    await overlayHidden();
    expect(activeScenario()).toBe(lightsScenario);
    const shown = yamlShown();

    const saved = clickReloadCard();
    expect(saved.card).toBe('lights');
    expect(saved.scenario, 'the selected scenario travels with the reload').toBe(lightsScenario);
    expect(saved.config, 'the config being shown travels with the reload').toEqual(shown);
    expect(saved.config?.type).toBe(registryConfig('lights').type);
  });

  it('O1: the default hexa card is reopened on a non-first scenario with its edited config', async () => {
    // hexa is the card the init renders before the restore: only the scenario half of the
    // stale-render guard tells that render apart from the restored one.
    const scenario = scenarioOf('hexa', 1);
    const config = { ...registryConfig('hexa'), header_message: 'édité avant le rechargement' };
    await bootWorkbench({ card: 'hexa', scenario, config });
    expect(el('preview-title').textContent).toBe(registryCard('hexa').label);
    expect(activeScenario()).toBe(scenario);
    expect(yamlShown(), 'the edited config survives the init render').toEqual(config);
    const saved = clickReloadCard();
    expect(saved).toEqual({ card: 'hexa', scenario, config });
  });

  it('O1: the icon browser is reopened, and its next reload carries no card config', async () => {
    // The init renders hexa before the restore selects icons: only the card half of the
    // stale-render guard drops that render, which would otherwise leave hexa's config active.
    await bootWorkbench({ card: 'icons', scenario: null, config: null });
    expect(el('preview-title').textContent).toBe(registryCard('icons').label);
    expect(activeScenario(), 'the icon browser has no scenario').toBeUndefined();
    const saved = clickReloadCard();
    expect(saved).toEqual({ card: 'icons', scenario: null, config: null });
  });
});
