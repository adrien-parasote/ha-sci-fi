// @vitest-environment happy-dom
/**
 * Tests — bridge: configured but never rendered (lot bridge-unrendered-config, bead ha-sci-fi-vp3)
 * Spec: docs/specs/bridge-unrendered-config/spec.md
 */
import { expect, describe, it, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/cards/bridge/sci-fi-bridge.js';
import '../../../src/cards/bridge/sci-fi-bridge-editor.js';
import { resetBridgeWarnings } from '../../../src/cards/bridge/bridge-warn.js';
import { bridgeLabels } from '../../../src/cards/bridge/labels.js';
import { bridgeToast } from '../../../src/cards/bridge/bridge-toast.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

vi.mock('../../../src/cards/bridge/bridge-toast.js', () => ({ bridgeToast: vi.fn() }));

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement { addMessage() {} });
}
for (const tag of ['sf-editor-dropdown-icon', 'sf-editor-accordion', 'sf-editor-input', 'sf-editor-dropdown', 'sf-editor-dropdown-entity', 'sf-button']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), 'utf8');

type Spec = Record<string, string | { state: string; attributes?: Record<string, unknown> }>;

function hassOf(states: Spec, callService?: any) {
  const s: Record<string, any> = {};
  for (const [id, v] of Object.entries(states)) {
    const o = typeof v === 'string' ? { state: v } : v;
    s[id] = makeMockEntity({ entity_id: id, state: o.state, attributes: (o.attributes ?? {}) as any });
  }
  // English locale: the assertions name the source-language strings (fr.js now carries the French ones).
  return { ...makeMockHass({ states: s, callService }), locale: { language: 'en', number_format: 'language', time_format: '24' } } as any;
}

async function mountSection(tag: string, config: any, hass: any): Promise<any> {
  const el = document.createElement(tag) as any;
  el.config = config;
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

async function settle(el: any): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await el.updateComplete;
    const subs = Array.from(el.shadowRoot?.querySelectorAll('*') ?? []).filter(
      (n: any) => n.tagName.startsWith('SF-BRIDGE-')
    );
    await Promise.all(subs.map((n: any) => n.updateComplete));
  }
}

async function mountCard(config: any, hass: any): Promise<any> {
  const el = document.createElement('sci-fi-bridge') as any;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await settle(el);
  return el;
}

const sub = (card: any, tag: string): ShadowRoot => card.shadowRoot.querySelector(tag).shadowRoot;
const lastToast = (): string => vi.mocked(bridgeToast).mock.calls.slice(-1)[0]![1];
const tick = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve(); };

let warn: MockInstance<typeof console.warn>;
let error: MockInstance<typeof console.error>;
const bridgeWarns = () =>
  warn.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('[sf-bridge]'));

beforeEach(() => {
  resetBridgeWarnings();
  vi.mocked(bridgeToast).mockClear();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  error = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  document.body.replaceChildren();
  warn.mockRestore();
  error.mockRestore();
});

// ── FR-1 / FR-2 : siren ────────────────────────────────────────────────────────

const ALERTS = (smoke_switch: any) => ({
  smoke: [{ entity: 'binary_sensor.smoke', name: 'Salon' }],
  smoke_switch,
  toggles: [{ entity: 'automation.intru', name: 'Intrusion' }],
  occupancy: 'binary_sensor.occ',
});
const BASE_STATES = { 'binary_sensor.smoke': 'off', 'automation.intru': 'off', 'binary_sensor.occ': 'on' };

describe('siren row', () => {
  it('TC-BUC-U-01: renders one .siren-row between smoke and toggles, follows state, absent and empty cases', async () => {
    const on = await mountSection('sf-bridge-alerts', ALERTS('switch.siren'), hassOf({ ...BASE_STATES, 'switch.siren': 'on' }));
    const rows = on.shadowRoot.querySelectorAll('.siren-row');
    expect(rows.length).to.equal(1);
    expect(rows[0]!.classList.contains('toggle-row')).to.equal(true);
    expect(rows[0]!.previousElementSibling!.classList.contains('alerts-smoke-row')).to.equal(true);
    expect(rows[0]!.nextElementSibling!.classList.contains('alerts-toggles-row')).to.equal(true);
    expect(rows[0]!.querySelector('sf-icon')!.getAttribute('icon')).to.equal('mdi:alarm-light');
    const name = rows[0]!.querySelector('.toggle-name')!;
    expect(name.textContent!.trim()).to.equal('Sirens');
    expect(name.classList.contains('toggle-on')).to.equal(true);

    on.hass = hassOf({ ...BASE_STATES, 'switch.siren': 'off' });
    await on.updateComplete;
    expect(on.shadowRoot.querySelector('.siren-row .toggle-name').classList.contains('toggle-off')).to.equal(true);

    on.hass = hassOf({ ...BASE_STATES });
    await on.updateComplete;
    const btn = on.shadowRoot.querySelector('.siren-row .sf-toggle');
    expect(on.shadowRoot.querySelector('.siren-row .toggle-name').classList.contains('toggle-unknown')).to.equal(true);
    expect(btn.hasAttribute('disabled')).to.equal(true);
    expect(btn.getAttribute('aria-disabled')).to.equal('true');
    expect(bridgeWarns().filter(c => c[1] === 'switch.siren').length).to.equal(1);

    for (const empty of [undefined, null, '']) {
      warn.mockClear();
      resetBridgeWarnings();
      document.body.replaceChildren();
      const el = await mountSection('sf-bridge-alerts', ALERTS(empty), hassOf({ ...BASE_STATES }));
      expect(el.shadowRoot.querySelector('.siren-row')).to.equal(null);
      expect(bridgeWarns().length).to.equal(0);
    }
  });

  it('TC-BUC-U-02: click calls switch.turn_off then turn_on with toasts, nothing when disabled', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = await mountSection('sf-bridge-alerts', ALERTS('switch.siren'), hassOf({ ...BASE_STATES, 'switch.siren': 'on' }, callService));
    el.shadowRoot.querySelector('.siren-row .sf-toggle').click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('switch', 'turn_off', { entity_id: 'switch.siren' });
    expect(lastToast()).to.equal('Sirens off');

    el.hass = hassOf({ ...BASE_STATES, 'switch.siren': 'off' }, callService);
    await el.updateComplete;
    el.shadowRoot.querySelector('.siren-row .sf-toggle').click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('switch', 'turn_on', { entity_id: 'switch.siren' });
    expect(lastToast()).to.equal('Sirens on');

    callService.mockClear();
    el.hass = hassOf({ ...BASE_STATES }, callService);
    await el.updateComplete;
    el.shadowRoot.querySelector('.siren-row .sf-toggle').click();
    await tick();
    expect(callService).not.toHaveBeenCalled();
  });

  it('TC-BUC-U-10: unavailable and unknown siren is disabled, silent, not clickable; on is clickable', async () => {
    const callService = vi.fn().mockResolvedValue({});
    for (const state of ['unavailable', 'unknown']) {
      document.body.replaceChildren();
      const el = await mountSection('sf-bridge-alerts', ALERTS('switch.siren'), hassOf({ ...BASE_STATES, 'switch.siren': state }, callService));
      const btn = el.shadowRoot.querySelector('.siren-row .sf-toggle');
      expect(el.shadowRoot.querySelector('.siren-row .toggle-name').classList.contains('toggle-unknown')).to.equal(true);
      expect(btn.hasAttribute('disabled')).to.equal(true);
      expect(btn.getAttribute('aria-disabled')).to.equal('true');
      btn.click();
      await tick();
    }
    expect(callService).not.toHaveBeenCalled();
    expect(bridgeWarns().length).to.equal(0);
    document.body.replaceChildren();
    const el = await mountSection('sf-bridge-alerts', ALERTS('switch.siren'), hassOf({ ...BASE_STATES, 'switch.siren': 'on' }, callService));
    el.shadowRoot.querySelector('.siren-row .sf-toggle').click();
    await tick();
    expect(callService).toHaveBeenCalledTimes(1);
  });

  it('IT-BUC-I-01: full card re-renders the siren on each hass replacement and clicks the configured entity', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const cfg = { type: 'custom:sci-fi-bridge', alerts: { smoke_switch: 'switch.siren' } };
    const card = await mountCard(cfg, hassOf({ 'switch.siren': 'off' }, callService));
    const name = () => sub(card, 'sf-bridge-alerts').querySelector('.siren-row .toggle-name')!;
    expect(name().classList.contains('toggle-off')).to.equal(true);
    card.hass = hassOf({ 'switch.siren': 'on' }, callService);
    await settle(card);
    expect(name().classList.contains('toggle-on')).to.equal(true);
    (sub(card, 'sf-bridge-alerts').querySelector('.siren-row .sf-toggle') as HTMLElement).click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('switch', 'turn_off', { entity_id: 'switch.siren' });
    card.hass = hassOf({ 'switch.siren': 'off' }, callService);
    await settle(card);
    (sub(card, 'sf-bridge-alerts').querySelector('.siren-row .sf-toggle') as HTMLElement).click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('switch', 'turn_on', { entity_id: 'switch.siren' });
  });
});

// ── FR-3 : lock button ─────────────────────────────────────────────────────────

const ACCESS = { items: [{ entity: 'cover.g', name: 'Garage', lock: 'lock.g' }] };
const lockHass = (state: string | undefined, callService?: any, attributes: Record<string, unknown> = {}) =>
  hassOf({ 'cover.g': 'closed', ...(state === undefined ? {} : { 'lock.g': { state, attributes } }) }, callService);
const lockBtn = (el: any): HTMLButtonElement => el.shadowRoot.querySelector('button.lock-btn');
const lockIcon = (el: any): Element => el.shadowRoot.querySelector('button.lock-btn sf-icon, sf-icon.lock-unknown');

describe('lock button', () => {
  it('TC-BUC-U-03: one click unlocks from locked then locks from unlocked, no dialog', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = await mountSection('sf-bridge-access', ACCESS, lockHass('locked', callService));
    expect(lockIcon(el).classList.contains('lock-locked')).to.equal(true);
    lockBtn(el).click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('lock', 'unlock', { entity_id: 'lock.g' });
    expect(lastToast()).to.equal('Door unlocked');
    el.hass = lockHass('unlocked', callService);
    await el.updateComplete;
    expect(lockIcon(el).classList.contains('lock-unlocked')).to.equal(true);
    lockBtn(el).click();
    await tick();
    expect(callService).toHaveBeenLastCalledWith('lock', 'lock', { entity_id: 'lock.g' });
    expect(lastToast()).to.equal('Door locked');
    expect(el.shadowRoot.querySelector('dialog, .confirm, ha-dialog')).to.equal(null);
  });

  it('TC-BUC-U-04: unavailable, jammed, unlocking and absent lock are disabled and call nothing', async () => {
    const callService = vi.fn().mockResolvedValue({});
    for (const state of ['unavailable', 'jammed', 'unlocking']) {
      document.body.replaceChildren();
      const el = await mountSection('sf-bridge-access', ACCESS, lockHass(state, callService));
      expect(lockBtn(el).hasAttribute('disabled')).to.equal(true);
      expect(lockBtn(el).getAttribute('aria-disabled')).to.equal('true');
      lockBtn(el).click();
      await tick();
    }
    expect(callService).not.toHaveBeenCalled();
    document.body.replaceChildren();
    resetBridgeWarnings();
    const el = await mountSection('sf-bridge-access', ACCESS, lockHass(undefined, callService));
    const icon = lockIcon(el);
    expect(icon.getAttribute('icon')).to.equal('mdi:lock-question');
    expect(icon.classList.contains('lock-unknown')).to.equal(true);
    expect(lockBtn(el).hasAttribute('disabled')).to.equal(true);
    expect(bridgeWarns().filter(c => c[1] === 'lock.g').length).to.equal(1);
  });

  it('TC-BUC-U-09: code_format disables, double click calls once, guard released after settle and rejection, states and titles', async () => {
    const callService = vi.fn().mockResolvedValue({});
    for (const state of ['locked', 'unlocked']) {
      document.body.replaceChildren();
      const el = await mountSection('sf-bridge-access', ACCESS, lockHass(state, callService, { code_format: '^\\d+$' }));
      expect(lockBtn(el).hasAttribute('disabled')).to.equal(true);
      expect(lockBtn(el).title).to.equal('Code required');
      lockBtn(el).click();
      await tick();
    }
    expect(callService).not.toHaveBeenCalled();

    document.body.replaceChildren();
    let release!: (v?: unknown) => void;
    const pending = vi.fn().mockImplementation(() => new Promise(r => { release = r; }));
    const el = await mountSection('sf-bridge-access', ACCESS, lockHass('locked', pending));
    lockBtn(el).click();
    lockBtn(el).click();
    await el.updateComplete;
    expect(pending).toHaveBeenCalledTimes(1);
    expect(lockBtn(el).hasAttribute('disabled')).to.equal(true);
    release();
    await tick();
    await el.updateComplete;
    expect(lockBtn(el).hasAttribute('disabled')).to.equal(false);

    const rejecting = vi.fn().mockRejectedValue(new Error('boom'));
    el.hass = lockHass('locked', rejecting);
    await el.updateComplete;
    lockBtn(el).click();
    await tick();
    await el.updateComplete;
    expect(rejecting).toHaveBeenCalledTimes(1);
    expect(lockBtn(el).hasAttribute('disabled')).to.equal(false);

    const cases: Array<[string, string, string, string]> = [
      ['locking', 'mdi:lock-clock', 'lock-pending', 'Locking…'],
      ['unlocking', 'mdi:lock-clock', 'lock-pending', 'Unlocking…'],
      ['jammed', 'mdi:lock-alert', 'lock-jammed', 'Lock jammed'],
      ['locked', 'mdi:lock', 'lock-locked', 'Unlock'],
      ['unlocked', 'mdi:lock-open', 'lock-unlocked', 'Lock'],
      ['open', 'mdi:lock-open', 'lock-unavailable', 'Lock unavailable'],
    ];
    for (const [state, icon, cls, title] of cases) {
      el.hass = lockHass(state, callService);
      await el.updateComplete;
      expect(lockIcon(el).getAttribute('icon')).to.equal(icon);
      expect(lockIcon(el).classList.contains(cls)).to.equal(true);
      expect(lockBtn(el).title).to.equal(title);
      expect(lockBtn(el).getAttribute('aria-label')).to.equal(title);
    }
  });

  it('IT-BUC-I-02: full card lock click calls lock.unlock; a rejection logs once, no toast, button usable again', async () => {
    const callService = vi.fn().mockRejectedValue(new Error('nope'));
    const cfg = { type: 'custom:sci-fi-bridge', access: { items: [{ entity: 'cover.g', name: 'Garage', lock: 'lock.g' }] } };
    const card = await mountCard(cfg, lockHass('locked', callService));
    const acc = () => card.shadowRoot.querySelector('sf-bridge-access');
    (sub(card, 'sf-bridge-access').querySelector('button.lock-btn') as HTMLElement).click();
    await tick();
    await acc().updateComplete;
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.g' });
    const errs = error.mock.calls.filter(c => c[0] === '[sf-bridge] callService error:');
    expect(errs.length).to.equal(1);
    expect(vi.mocked(bridgeToast)).not.toHaveBeenCalled();
    expect(bridgeWarns().length).to.equal(0);
    expect((sub(card, 'sf-bridge-access').querySelector('button.lock-btn') as HTMLButtonElement).disabled).to.equal(false);
  });
});

// ── FR-4 : editor running_states ───────────────────────────────────────────────

const editorHass = () => hassOf({ 'sensor.a': 'x', 'binary_sensor.b': 'off', 'sensor.dishwasher': 'running' });

async function mountEditor(cycles: any[]): Promise<any> {
  const el = document.createElement('sci-fi-bridge-editor') as any;
  el.hass = editorHass();
  el.setConfig({ type: 'custom:sci-fi-bridge', appliances: { cycles } });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const runInputs = (el: any): any[] =>
  Array.from(el.shadowRoot.querySelectorAll('sf-editor-input')).filter(
    (n: any) => n.label === bridgeLabels()['input-running-states']
  );
async function type(el: any, idx: number, value: string): Promise<void> {
  runInputs(el)[idx].dispatchEvent(new CustomEvent('input-update', { detail: { value }, bubbles: true }));
  await el.updateComplete;
}
const cyclesOf = (el: any): any[] => el.config.appliances.cycles;

describe('editor running_states', () => {
  it('TC-BUC-U-05: input only for sensor cycles, label resolves, emitted array then key deleted', async () => {
    const el = await mountEditor([
      { entity: 'sensor.a', name: 'A', icon: 'mdi:x' },
      { entity: 'binary_sensor.b', name: 'B', icon: 'mdi:x' },
      { entity: '', name: 'C', icon: 'mdi:x' },
    ]);
    expect(runInputs(el).length).to.equal(1);
    expect(bridgeLabels()['input-running-states']).to.equal('Running states (comma-separated)');
    expect(el.getLabel('input-running-states')).to.equal('Running states (comma-separated)');
    await type(el, 0, 'Running, washing ');
    expect(cyclesOf(el)[0].running_states).to.deep.equal(['Running', 'washing']);
    await type(el, 0, '  ');
    expect('running_states' in cyclesOf(el)[0]).to.equal(false);
  });

  it('TC-BUC-U-11: keeps the raw typed string per keystroke, emits parsed array, normalises on focusout', async () => {
    const el = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x' }]);
    for (const typed of ['Wash', 'Washing machine', 'Washing machine,', 'Washing machine, ']) {
      await type(el, 0, typed);
      expect(runInputs(el)[0].value).to.equal(typed);
    }
    expect(cyclesOf(el)[0].running_states).to.deep.equal(['Washing machine']);
    await type(el, 0, 'Washing machine, Running');
    expect(runInputs(el)[0].value).to.equal('Washing machine, Running');
    expect(cyclesOf(el)[0].running_states).to.deep.equal(['Washing machine', 'Running']);
    await type(el, 0, 'Washing machine,  Running ,');
    runInputs(el)[0].dispatchEvent(new Event('focusout', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(runInputs(el)[0].value).to.equal('Washing machine, Running');
  });

  it('TC-BUC-U-12: a string or number running_states does not throw and is replaced by an array when typed', async () => {
    const str = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x', running_states: 'Running' }]);
    expect(runInputs(str)[0].value).to.equal('Running');
    await type(str, 0, 'Idle');
    expect(cyclesOf(str)[0].running_states).to.deep.equal(['Idle']);
    document.body.replaceChildren();
    const num = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x', running_states: 5 }]);
    expect(runInputs(num)[0].value).to.equal('');
    await type(num, 0, 'Idle');
    expect(cyclesOf(num)[0].running_states).to.deep.equal(['Idle']);
  });

  it('TC-BUC-U-13: leaving sensor.* deletes the key and hides the input', async () => {
    for (const next of ['binary_sensor.x', '']) {
      document.body.replaceChildren();
      const el = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x', running_states: ['Running'] }]);
      const ent = el.shadowRoot.querySelector('sf-editor-dropdown-entity');
      ent.dispatchEvent(new CustomEvent('input-update', { detail: { value: next }, bubbles: true }));
      await el.updateComplete;
      expect(cyclesOf(el)[0].entity).to.equal(next);
      expect('running_states' in cyclesOf(el)[0]).to.equal(false);
      expect(runInputs(el).length).to.equal(0);
    }
  });

  it('FR-4: an external setConfig drops the raw typed string (shows the stored value)', async () => {
    const el = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x' }]);
    await type(el, 0, 'a,');
    expect(runInputs(el)[0].value).to.equal('a,');
    el.setConfig({ type: 'custom:sci-fi-bridge', appliances: { cycles: [{ entity: 'sensor.a', name: 'A', icon: 'mdi:x', running_states: ['x'] }] } });
    await el.updateComplete;
    expect(runInputs(el)[0].value).to.equal('x');
  });

  it('FR-4: removing a cycle does not leak its raw typed string onto the next one', async () => {
    const el = await mountEditor([
      { entity: 'sensor.a', name: 'A', icon: 'mdi:x' },
      { entity: 'sensor.b', name: 'B', icon: 'mdi:x', running_states: ['stored'] },
    ]);
    await type(el, 0, 'a,');
    el.shadowRoot.querySelectorAll('.btn-delete')[0].click();
    await el.updateComplete;
    expect(runInputs(el).length).to.equal(1);
    expect(runInputs(el)[0].value).to.equal('stored');
  });

  it('FR-4: leaving sensor.* and coming back shows an empty input, not the old raw string', async () => {
    const el = await mountEditor([{ entity: 'sensor.a', name: 'A', icon: 'mdi:x' }]);
    await type(el, 0, 'a,');
    const setEntity = async (value: string) => {
      el.shadowRoot.querySelector('sf-editor-dropdown-entity')
        .dispatchEvent(new CustomEvent('input-update', { detail: { value }, bubbles: true }));
      await el.updateComplete;
    };
    await setEntity('binary_sensor.x');
    await setEntity('sensor.a');
    expect(runInputs(el)[0].value).to.equal('');
  });

  it('FR-4: a cycle without an entity key does not throw and shows no running_states input', async () => {
    const el = await mountEditor([{ name: 'A', icon: 'mdi:x' }]);
    expect(runInputs(el).length).to.equal(0);
  });

  it('IT-BUC-I-03: emitted running_states makes the card cycle run, case-insensitively; vehicle title follows vehicle.icon', async () => {
    const el = await mountEditor([{ entity: 'sensor.dishwasher', name: 'LV', icon: 'mdi:x' }]);
    await type(el, 0, 'Running');
    const withKey = { ...el.config, vehicle: { power_sensor: 'sensor.p', icon: 'mdi:car-electric' } };
    const hass = hassOf({ 'sensor.dishwasher': 'running', 'sensor.p': '0' });
    let card = await mountCard(withKey, hass);
    expect(sub(card, 'sf-bridge-appliances').querySelector('.cycle-status.running')).not.to.equal(null);
    expect(sub(card, 'sf-bridge-vehicle').querySelector('.bridge-section-title sf-icon')!.getAttribute('icon')).to.equal('mdi:car-electric');
    document.body.replaceChildren();
    const noKey = structuredClone(withKey);
    delete noKey.appliances.cycles[0].running_states;
    card = await mountCard(noKey, hass);
    expect(sub(card, 'sf-bridge-appliances').querySelector('.cycle-status.idle')).not.to.equal(null);
  });
});

// ── FR-5 : vehicle icon ────────────────────────────────────────────────────────

describe('vehicle icon', () => {
  it('TC-BUC-U-06: title icon follows config.icon else sci:landspeeder; editor shows the same default', async () => {
    const states = { 'sensor.p': { state: '120', attributes: { unit_of_measurement: 'W' } } };
    const titleIcon = (el: any) => el.shadowRoot.querySelector('.bridge-section-title sf-icon').getAttribute('icon');
    const withIcon = await mountSection('sf-bridge-vehicle', { power_sensor: 'sensor.p', icon: 'mdi:car-electric' }, hassOf(states));
    expect(titleIcon(withIcon)).to.equal('mdi:car-electric');
    const plug = withIcon.shadowRoot.querySelector('.vehicle-body sf-icon').getAttribute('icon');
    document.body.replaceChildren();
    const without = await mountSection('sf-bridge-vehicle', { power_sensor: 'sensor.p' }, hassOf(states));
    expect(titleIcon(without)).to.equal('sci:landspeeder');
    expect(without.shadowRoot.querySelector('.vehicle-body sf-icon').getAttribute('icon')).to.equal(plug);

    document.body.replaceChildren();
    const ed = document.createElement('sci-fi-bridge-editor') as any;
    ed.hass = editorHass();
    ed.setConfig({ type: 'custom:sci-fi-bridge', vehicle: { power_sensor: 'sensor.p' } });
    document.body.appendChild(ed);
    await ed.updateComplete;
    const acc = Array.from(ed.shadowRoot.querySelectorAll('sf-editor-accordion')).find(
      (a: any) => a.getAttribute('title') === ed.getLabel('section-title-vehicle')
    ) as HTMLElement;
    expect(acc.getAttribute('icon')).to.equal('sci:landspeeder');
    const field = Array.from(ed.shadowRoot.querySelectorAll('sf-editor-dropdown-icon')).find(
      (n: any) => n.label === ed.getLabel('input-icon-section') && n.value === 'sci:landspeeder'
    );
    expect(field).not.to.equal(undefined);
    expect('icon' in ed.config.vehicle).to.equal(false);
    expect(read('src/cards/bridge/config.ts')).to.not.contain('ev-station');
    const files = ['sci-fi-bridge-editor.ts', 'config.ts', 'sections/sf-bridge-vehicle.ts'];
    for (const f of files) expect(read(`src/cards/bridge/${f}`)).to.not.contain('mdi:ev-station');
  });
});

// ── FR-6 : CSS ─────────────────────────────────────────────────────────────────

describe('bridge styles', () => {
  it('TC-BUC-U-07: dead families gone, lock rules present, no .siren-row rule, no other file names the dead selectors', () => {
    const css = read('src/cards/bridge/styles.ts');
    for (const dead of ['crew-badge-name', 'vehicle-icon-square', 'call-kids-btn']) expect(css).to.not.contain(dead);
    for (const live of ['.lock-btn', '.lock-pending', '.lock-jammed']) expect(css).to.contain(live);
    expect(css).to.not.contain('.siren-row');
    const walk = (dir: string): string[] =>
      // dot-dirs are transient (tests/.eit-base-<pid> is created and removed by another worker)
      fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).filter(d => !d.name.startsWith('.')).flatMap(d =>
        d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]);
    const self = 'tests/cards/bridge/bridge-unrendered-config.test.ts';
    const offenders = [...walk('src'), ...walk('tests')].filter(f =>
      f !== self && f !== 'tests/styles/card-css-baseline.json' &&
      /crew-badge-name|vehicle-icon-square|call-kids-btn/.test(read(f)));
    expect(offenders).to.deep.equal([]);
  });
});

// ── FR-7 : bridge.md ───────────────────────────────────────────────────────────

describe('bridge.md', () => {
  it('TC-BUC-U-08: documents the siren row, lock button, _toggleLock via bridgeCall, sci:landspeeder, running_states', () => {
    const md = read('docs/specs/cards/bridge.md');
    expect(md).to.contain('.siren-row');
    expect(md).to.contain('.lock-btn');
    expect(md).to.contain('disabled');
    expect(md).to.contain('sci:landspeeder');
    expect(md).to.not.contain("config.icon ?? 'mdi:ev-station'");
    expect(md).to.match(/running_states[^\n]*sensor/i);
    const at = md.indexOf('_toggleLock');
    expect(at).to.be.greaterThan(-1);
    const block = /```[a-z]*\n([\s\S]*?)```/g;
    let snippet = '';
    for (let m = block.exec(md); m; m = block.exec(md)) {
      if (m[1]!.includes('_toggleLock')) { snippet = m[1]!; break; }
    }
    expect(snippet).to.contain('bridgeCall');
    expect(snippet).to.not.contain('callService');
    expect(snippet).to.not.match(/jammed|unavailable/);
  });
});
