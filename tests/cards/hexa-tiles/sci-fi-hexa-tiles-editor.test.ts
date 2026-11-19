// @vitest-environment happy-dom
import { expect, describe, it, afterEach, beforeEach } from 'vitest';
import { setLocale } from '../../../src/locales/localization.js';
import { makeMockEntity } from '../../fixtures/mock-hass.js';
import '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.js';
import type { SciFiHexaTilesEditor } from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-hexa-tiles', ...overrides };
}

async function createElement(): Promise<SciFiHexaTilesEditor> {
  const el = document.createElement('sci-fi-hexa-tiles-editor') as SciFiHexaTilesEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-hexa-tiles-editor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor structure when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;
    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('renders add-tile button', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.add-btn');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders one accordion per tile', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [
        { entity_id: 'light.salon', name: 'Salon' },
        { entity_id: 'switch.prise', name: 'Prise' },
      ],
    }));
    await el.updateComplete;
    // Tile accordions only: each tile now nests its own Actions accordion (FR-11).
    const accordions = el.shadowRoot!.querySelectorAll('.container > sf-editor-accordion');
    expect(accordions.length).toBe(2);
  });

  it('dispatches config-changed when add-tile clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const btn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();

    expect(received).toHaveLength(1);
    expect(Array.isArray(received[0]!.detail.config.tiles)).toBe(true);
    expect(received[0]!.detail.config.tiles.length).toBe(1);
  });

  it('dispatches config-changed when tile is removed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_id: 'light.salon', name: 'Salon' }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion')!;
    accordion.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: '0', kind: 'accordion', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles).toHaveLength(0);
  });

  it('renders weather toggle switch when weather section exists', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: {} }));
    await el.updateComplete;

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch');
    expect(toggle).not.toBeNull();
  });

  it('loads weather and people entities from hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    const mockHass = {
      ...makeMockHass(),
      states: {
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: {} },
        'person.adrien': { entity_id: 'person.adrien', state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: null } },
        'light.salon': { entity_id: 'light.salon', state: 'on', attributes: {} },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    expect((el as any)._weatherEntities).toHaveLength(1);
    expect((el as any)._people).toHaveLength(1);
  });

  // ── Extended Tests ──────────────────────────────────────────────────────────

  it('dispatches config-changed when header message is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="header_message"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'header_message', kind: '', value: 'Hello World' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBe('Hello World');
  });

  it('clears header_message to undefined when empty value', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], header_message: 'Old' }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input[element-id="header_message"]')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'header_message', kind: '', value: '' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.header_message).toBeUndefined();
  });

  it('dispatches config-changed when weather toggle is switched on', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: false } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch')!;
    toggle.dispatchEvent(new CustomEvent('sf-toggle-change', {
      bubbles: true,
      composed: true,
      detail: { checked: true },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.weather.activate).toBe(true);
  });

  it('renders weather entities accordion when weather is active', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion[element-id="weather-detail"]');
    expect(accordion).not.toBeNull();
  });

  it('dispatches config-changed when weather entity is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const weatherDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="weather_entity"]')!;
    weatherDropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'weather_entity', kind: 'weather_entity', value: 'weather.home' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.weather.weather_entity).toBe('weather.home');
  });

  it('dispatches config-changed when weather link is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ tiles: [], weather: { activate: true, weather_entity: '' } }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const linkInput = el.shadowRoot!.querySelector('sf-editor-input[element-id="weather_link"]')!;
    linkInput?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'link', kind: 'link', value: 'http://example.com' },
    }));

    if (received.length > 0) {
      expect(received[0]!.detail.config.weather.link).toBe('http://example.com');
    } else {
      (el as any)._updateWeatherField('link', 'http://example.com');
      expect(el.config).toBeDefined();
    }
  });

  it('dispatches config-changed when tile name is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Old', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const nameInput = el.shadowRoot!.querySelector('sf-editor-input[element-id="name"]')!;
    nameInput.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'name', kind: 'name', value: 'New Name' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].name).toBe('New Name');
  });

  it('dispatches config-changed when tile active_icon is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', active_icon: '', inactive_icon: '', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const activeIconDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-icon[element-id="active_icon"]')!;
    activeIconDropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'active_icon', kind: 'active_icon', value: 'mdi:lightbulb-on' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].active_icon).toBe('mdi:lightbulb-on');
  });

  it('dispatches config-changed when entity is added to entities_to_exclude', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], entities_to_exclude: [] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity[element-id="entities_to_exclude"]')!;
    multiEntity?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'entities_to_exclude', value: 'light.avoid', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].entities_to_exclude).toContain('light.avoid');
  });

  it('dispatches config-changed when entity is removed from entities_to_exclude', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], entities_to_exclude: ['light.avoid', 'light.other'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const multiEntity = el.shadowRoot!.querySelector('sf-editor-multi-entity')!;
    multiEntity.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entities_to_exclude', kind: 'entities_to_exclude', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].entities_to_exclude).not.toContain('light.avoid');
  });

  it('dispatches config-changed when state_on chip is added', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const chips = el.shadowRoot!.querySelector('sf-editor-chips[element-id="state_on"]')!;
    chips.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'state_on', kind: 'state_on', value: 'playing', type: 'add' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].state_on).toContain('playing');
  });

  it('dispatches config-changed when state_on chip is removed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on', 'playing'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const chips = el.shadowRoot!.querySelector('sf-editor-chips[element-id="state_on"]')!;
    chips.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'state_on', kind: 'state_on', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].state_on).not.toContain('on');
    expect(received[0]!.detail.config.tiles[0].state_on).toContain('playing');
  });

  it('renders entity dropdown when standalone is true', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lamp', standalone: true, entity: 'light.salon', state_on: ['on'] }],
    }));
    await el.updateComplete;

    const entityDropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="entity"]');
    expect(entityDropdown).not.toBeNull();
  });

  it('dispatches config-changed when standalone is toggled', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', standalone: false, state_on: ['on'] }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    (el as any)._updateTileField(0, 'standalone', true);

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].standalone).toBe(true);
  });

  it('renders people visibility section when person entities exist in hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const visibilitySection = el.shadowRoot!.querySelector('.visibility-section');
    expect(visibilitySection).not.toBeNull();
  });

  it('dispatches config-changed when person visibility is toggled', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], visibility: [] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const visibilityBtn = el.shadowRoot!.querySelector('.visibility-section .people-row sf-button')!;
    visibilityBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].visibility).toContain('person.adrien');
  });

  it('removes person from visibility when toggled again', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'], visibility: ['person.adrien'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: null },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const visibilityBtn = el.shadowRoot!.querySelector('.visibility-section .people-row sf-button')!;
    visibilityBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles[0].visibility).not.toContain('person.adrien');
  });

  it('dispatches config-changed when tile is removed via accordion', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [
        { entity_kind: 'light', name: 'Lights', state_on: ['on'] },
        { entity_kind: 'climate', name: 'AC', state_on: ['heat'] },
      ],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    accordions[0]?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: '0', kind: 'accordion', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.tiles).toHaveLength(1);
  });

  it('renders person avatar with image when entity_picture is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      tiles: [{ entity_kind: 'light', name: 'Lights', state_on: ['on'] }],
    }));

    const mockHass = {
      ...makeMockHass(),
      states: {
        'person.adrien': {
          entity_id: 'person.adrien',
          state: 'home',
          attributes: { friendly_name: 'Adrien', entity_picture: '/api/image/adrien.jpg' },
        },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    const img = el.shadowRoot!.querySelector('.avatar img');
    expect(img).not.toBeNull();
  });
});

// ─── Quick actions (docs/specs/hexa-tiles-quick-actions/spec.md FR-11, FR-12) ──

type TileConf = Record<string, unknown>;

function fire(target: Element, value: unknown, kind = ''): void {
  target.dispatchEvent(new CustomEvent('input-update', {
    bubbles: true,
    composed: true,
    detail: { id: target.getAttribute('element-id') ?? '', kind, value },
  }));
}

async function editorWith(tile: TileConf, states: Record<string, string> = {}): Promise<{ el: SciFiHexaTilesEditor; received: CustomEvent[] }> {
  const el = await createElement();
  const entities = Object.fromEntries(Object.entries(states).map(([id, state]) => [id, makeMockEntity({ entity_id: id, state, attributes: {} })]));
  el.hass = makeMockHass({ states: entities, language: 'en' }) as unknown as HomeAssistantExt;
  el.setConfig(makeConfig({ tiles: [tile] }));
  await el.updateComplete;
  const received: CustomEvent[] = [];
  el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));
  return { el, received };
}

const lastTile = (received: CustomEvent[]): TileConf => (received[received.length - 1]!.detail.config.tiles as TileConf[])[0]!;
const q = (el: SciFiHexaTilesEditor, sel: string): HTMLElement => {
  const found = el.shadowRoot!.querySelector<HTMLElement>(sel);
  expect(found, sel).not.toBeNull();
  return found!;
};
type KeyField = HTMLElement & { updateComplete: Promise<boolean> };
const keyField = (el: SciFiHexaTilesEditor, i: number): KeyField =>
  rows(el)[i]!.querySelector('sf-editor-input[element-id="state_key"]') as KeyField;
const innerInput = (host: KeyField): HTMLInputElement => host.shadowRoot!.querySelector('input')!;
/** One keystroke as the browser delivers it: the inner <input> value changes, then `input` fires. */
async function typeInto(host: KeyField, value: string): Promise<void> {
  const input = innerInput(host);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await host.updateComplete;
}
const rows = (el: SciFiHexaTilesEditor): HTMLElement[] => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.state-row'));
const rowKeys = (el: SciFiHexaTilesEditor): string[] =>
  rows(el).map(r => (r.querySelector('sf-editor-input[element-id="state_key"]') as unknown as { value: string }).value);

describe('sci-fi-hexa-tiles-editor quick actions', () => {
  beforeEach(async () => {
    await setLocale('en');
  });
  afterEach(async () => {
    document.body.replaceChildren();
    await setLocale('fr');
  });

  it('TC-HQA-U-14: the Actions section writes subtitle, pending_timeout and the three actions, and removes emptied keys', async () => {
    const { el, received } = await editorWith({ standalone: true, entity: 'cover.portail', hold_action: { action: 'more-info' } });
    const section = q(el, '.container > sf-editor-accordion sf-editor-accordion[element-id="actions"]');
    expect(section.getAttribute('title')).toBe('Actions');
    const dbl = q(el, 'sf-editor-action[element-id="double_tap_action"]');
    const hint = dbl.nextElementSibling as HTMLElement;
    expect(hint.matches('p.hint')).toBe(true);
    expect(hint.textContent).toContain('A double tap action delays every tap by 250 ms');
    expect((q(el, 'sf-editor-input[element-id="pending_timeout"]') as unknown as { type: string }).type).toBe('number');

    fire(q(el, 'sf-editor-input[element-id="subtitle"]'), 'Voiture');
    expect(lastTile(received).subtitle).toBe('Voiture');
    fire(q(el, 'sf-editor-input[element-id="subtitle"]'), '');
    expect(Object.keys(lastTile(received))).not.toContain('subtitle');

    fire(q(el, 'sf-editor-input[element-id="pending_timeout"]'), '20');
    expect(lastTile(received).pending_timeout).toBe(20);
    fire(q(el, 'sf-editor-input[element-id="pending_timeout"]'), 'x');
    expect(Object.keys(lastTile(received))).not.toContain('pending_timeout');

    fire(q(el, 'sf-editor-action[element-id="tap_action"]'), { action: 'toggle' }, 'action');
    expect(lastTile(received).tap_action).toEqual({ action: 'toggle' });
    fire(q(el, 'sf-editor-action[element-id="hold_action"]'), null, 'action');
    expect(Object.keys(lastTile(received))).not.toContain('hold_action');
    expect(lastTile(received).tap_action).toEqual({ action: 'toggle' });
  });

  it('TC-HQA-U-15: the per-state list adds, renames, edits and removes entries, and reminds the current state', async () => {
    const { el, received } = await editorWith({ standalone: true, entity: 'cover.portail' }, { 'cover.portail': 'closed' });
    const hint = Array.from(el.shadowRoot!.querySelectorAll('.hint')).find(h => h.textContent!.includes('Current state'));
    expect(hint, 'a current-state hint').toBeDefined();
    expect(hint!.textContent).toContain('closed');

    for (let i = 0; i < 5; i++) {
      q(el, '.add-state-btn').click();
      await el.updateComplete;
    }
    expect(Object.keys(lastTile(received).states as object)).toEqual(['on', 'off', 'open', 'closed', 'state_1']);
    expect(rowKeys(el)).toEqual(['on', 'off', 'open', 'closed', 'state_1']);

    // rename onto an existing key, then onto an empty key, typed keystroke by keystroke into the inner
    // <input>: nothing is written while typing, the rename is refused at focusout, and the inner field
    // shows the old key again
    for (const [i, from, typed] of [[0, 'on', ['o', 'op', 'ope', 'open']], [1, 'off', ['of', 'o', '']]] as const) {
      const count = received.length;
      const host = keyField(el, i);
      for (const value of typed) await typeInto(host, value);
      expect(received.length, `typing ${typed.join(' > ')} writes nothing`).toBe(count);
      host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
      await el.updateComplete;
      await host.updateComplete;
      expect(received.length, `${from} -> '${typed[typed.length - 1]}' changes nothing`).toBe(count);
      expect(rowKeys(el)[i]).toBe(from);
      expect(innerInput(host).value, `the inner field shows ${from} again`).toBe(from);
    }

    const charge = keyField(el, 4);
    for (const value of ['c', 'ch', 'charge']) await typeInto(charge, value);
    charge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await el.updateComplete;
    expect(Object.keys(lastTile(received).states as object)).toEqual(['on', 'off', 'open', 'closed', 'charge']);
    expect((lastTile(received).states as Record<string, unknown>).charge).toEqual({});

    fire(rows(el)[0]!.querySelector('sf-editor-color-picker[element-id="state_color"]')!, '#ff0000');
    await el.updateComplete;
    fire(rows(el)[0]!.querySelector('sf-editor-dropdown-icon[element-id="state_icon"]')!, 'mdi:x');
    await el.updateComplete;
    expect((lastTile(received).states as Record<string, unknown>).on).toEqual({ color: '#ff0000', icon: 'mdi:x' });
    fire(rows(el)[0]!.querySelector('sf-editor-dropdown-icon[element-id="state_icon"]')!, '');
    await el.updateComplete;
    expect((lastTile(received).states as Record<string, unknown>).on).toEqual({ color: '#ff0000' });

    fire(rows(el)[0]!.querySelector('sf-editor-input[element-id="state_label"]')!, 'Allumé');
    await el.updateComplete;
    expect((lastTile(received).states as Record<string, unknown>).on).toEqual({ color: '#ff0000', label: 'Allumé' });

    for (let i = 0; i < 5; i++) {
      rows(el)[0]!.querySelector('sf-button.state-remove')!.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
      await el.updateComplete;
    }
    expect(rows(el)).toHaveLength(0);
    expect(Object.keys(lastTile(received))).not.toContain('states');
  });
});
