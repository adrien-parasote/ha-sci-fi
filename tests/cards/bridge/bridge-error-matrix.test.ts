// @vitest-environment happy-dom
/**
 * Tests — bridge error handling matrix (lot bridge-error-matrix, bead ha-sci-fi-5em)
 * Spec: docs/specs/bridge-error-matrix/spec.md
 */
import { expect, describe, it, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/cards/bridge/sci-fi-bridge.js';
import { resetBridgeWarnings } from '../../../src/cards/bridge/bridge-warn.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement { addMessage() {} });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type StateMap = Record<string, string>;

function hassOf(states: StateMap, callService?: any, attrs: Record<string, any> = {}) {
  const s: Record<string, any> = {};
  for (const [id, state] of Object.entries(states)) {
    s[id] = makeMockEntity({ entity_id: id, state, attributes: attrs[id] ?? {} });
  }
  return makeMockHass({ states: s, callService });
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

function section(card: any, tag: string): ShadowRoot {
  return card.shadowRoot.querySelector(tag).shadowRoot;
}

async function mountSection(tag: string, config: any, hass: any): Promise<ShadowRoot> {
  const el = document.createElement(tag) as any;
  el.config = config;
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el.shadowRoot;
}

const text = (root: ParentNode, sel: string): string =>
  (root.querySelector(sel)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();

const NBSP = ' ';

let warn: MockInstance<typeof console.warn>;
let error: MockInstance<typeof console.error>;
const bridgeWarns = () =>
  warn.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('[sf-bridge]'));

beforeEach(() => {
  resetBridgeWarnings();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  error = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  error.mockRestore();
  document.body.replaceChildren();
  vi.useRealTimers();
});

const STOVE = { pellet_quantity: 'sensor.pq', pellet_stock: 'sensor.ps', status: 'sensor.st' };

// ── Stove / vehicle ────────────────────────────────────────────────────────────

describe('bridge error matrix — stove and vehicle', () => {
  it('TC-BEM-U-02: stove placeholders for absent / unavailable, bars for numeric', async () => {
    // absent
    let root = await mountSection('sf-bridge-stove', STOVE, hassOf({ 'sensor.st': 'off' }));
    expect(text(root, '.stove-pellet-placeholder')).to.equal(`--${NBSP}%`);
    expect(text(root, '.stove-stock-placeholder')).to.equal('--');
    expect(root.querySelector('sf-circle-progress-bar')).to.be.null;
    expect(root.querySelector('sf-stack-bar')).to.be.null;
    expect(bridgeWarns().map(c => c[0])).to.deep.equal([
      '[sf-bridge] entity not found:',
      '[sf-bridge] entity not found:',
    ]);
    expect(bridgeWarns().map(c => c[1])).to.deep.equal(['sensor.pq', 'sensor.ps']);

    // unavailable
    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-stove', STOVE,
      hassOf({ 'sensor.st': 'off', 'sensor.pq': 'unavailable', 'sensor.ps': 'unavailable' })
    );
    expect(text(root, '.stove-pellet-placeholder')).to.equal(`--${NBSP}%`);
    expect(text(root, '.stove-stock-placeholder')).to.equal('--');
    expect(root.querySelector('sf-circle-progress-bar')).to.be.null;
    expect(root.querySelector('sf-stack-bar')).to.be.null;
    expect(bridgeWarns().map(c => c[0])).to.deep.equal([
      '[sf-bridge] non-numeric state:',
      '[sf-bridge] non-numeric state:',
    ]);

    // numeric
    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-stove', STOVE,
      hassOf({ 'sensor.st': 'off', 'sensor.pq': '0.5', 'sensor.ps': '2' })
    );
    expect(root.querySelector('sf-circle-progress-bar')).to.not.be.null;
    expect(root.querySelector('sf-stack-bar')).to.not.be.null;
    expect(root.querySelector('.stove-pellet-placeholder')).to.be.null;
    expect(root.querySelector('.stove-stock-placeholder')).to.be.null;
    expect(bridgeWarns()).to.have.length(0);
  });

  it('TC-BEM-U-03: vehicle -- W and Unavailable for absent / unavailable, kW for 3500', async () => {
    const VEH = { power_sensor: 'sensor.ev' };
    let root = await mountSection('sf-bridge-vehicle', VEH, hassOf({}));
    expect(text(root, '.vehicle-power-value')).to.equal(`--${NBSP}W`);
    expect(text(root, '.vehicle-status-label')).to.equal('Unavailable');
    expect(root.querySelector('.bridge-section')).to.not.be.null;
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'sensor.ev']]);

    document.body.replaceChildren();
    warn.mockClear();
    resetBridgeWarnings();
    root = await mountSection('sf-bridge-vehicle', VEH, hassOf({ 'sensor.ev': 'unavailable' }));
    expect(text(root, '.vehicle-power-value')).to.equal(`--${NBSP}W`);
    expect(text(root, '.vehicle-status-label')).to.equal('Unavailable');
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] non-numeric state:', 'sensor.ev']]);

    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection('sf-bridge-vehicle', VEH, hassOf({ 'sensor.ev': '3500' }));
    expect(text(root, '.vehicle-power-value')).to.equal(`3.5${NBSP}kW`);
    expect(bridgeWarns()).to.have.length(0);
  });

  it('TC-BEM-U-10: Infinity and negative readings are non-numeric, 0 is a measurement', async () => {
    const cases: Array<[string, string]> = [['Infinity', 'a'], ['-Infinity', 'b'], ['-5', 'c']];
    for (const [pq] of cases) {
      document.body.replaceChildren();
      warn.mockClear();
      resetBridgeWarnings();
      const root = await mountSection(
        'sf-bridge-stove', STOVE,
        hassOf({ 'sensor.st': 'off', 'sensor.pq': pq, 'sensor.ps': '1' })
      );
      expect(text(root, '.stove-pellet-placeholder'), pq).to.equal(`--${NBSP}%`);
      expect(root.querySelector('sf-circle-progress-bar'), pq).to.be.null;
      expect(bridgeWarns(), pq).to.deep.equal([['[sf-bridge] non-numeric state:', 'sensor.pq']]);
    }
    for (const ps of ['-3', 'Infinity']) {
      document.body.replaceChildren();
      warn.mockClear();
      resetBridgeWarnings();
      const root = await mountSection(
        'sf-bridge-stove', STOVE,
        hassOf({ 'sensor.st': 'off', 'sensor.pq': '0.5', 'sensor.ps': ps })
      );
      expect(text(root, '.stove-stock-placeholder'), ps).to.equal('--');
      expect(root.querySelector('sf-stack-bar'), ps).to.be.null;
      expect(bridgeWarns(), ps).to.deep.equal([['[sf-bridge] non-numeric state:', 'sensor.ps']]);
    }
    for (const p of ['Infinity', '-500']) {
      document.body.replaceChildren();
      warn.mockClear();
      resetBridgeWarnings();
      const root = await mountSection('sf-bridge-vehicle', { power_sensor: 'sensor.ev' }, hassOf({ 'sensor.ev': p }));
      expect(text(root, '.vehicle-power-value'), p).to.equal(`--${NBSP}W`);
      expect(bridgeWarns(), p).to.deep.equal([['[sf-bridge] non-numeric state:', 'sensor.ev']]);
    }
    // zero stays a measurement
    document.body.replaceChildren();
    warn.mockClear();
    resetBridgeWarnings();
    let root = await mountSection(
      'sf-bridge-stove', STOVE, hassOf({ 'sensor.st': 'off', 'sensor.pq': '0', 'sensor.ps': '0' })
    );
    expect(root.querySelector('sf-circle-progress-bar')).to.not.be.null;
    expect(root.querySelector('.stove-pellet-placeholder')).to.be.null;
    document.body.replaceChildren();
    root = await mountSection('sf-bridge-vehicle', { power_sensor: 'sensor.ev' }, hassOf({ 'sensor.ev': '0' }));
    expect(text(root, '.vehicle-power-value')).to.equal(`0${NBSP}W`);
  });
});

// ── Other sections ─────────────────────────────────────────────────────────────

describe('bridge error matrix — absent entities in the other sections', () => {
  it('TC-BEM-U-04: slider and cover over an absent entity', async () => {
    let root = await mountSection(
      'sf-bridge-automations',
      { items: [{ entity: 'input_number.t', name: 'Tempo', type: 'slider', min: 5, max: 60 }] },
      hassOf({})
    );
    expect(text(root, '.slider-value')).to.equal('--');
    const input = root.querySelector('input[type=range]') as HTMLInputElement;
    expect(input.disabled).to.be.true;
    expect(input.value).to.equal('5');
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'input_number.t']]);

    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-access', { items: [{ entity: 'cover.g', name: 'Garage' }] }, hassOf({})
    );
    const tag = root.querySelector('.access-state-tag')!;
    expect(tag.textContent!.trim()).to.equal('Unavailable');
    expect(tag.classList.contains('state-unavailable')).to.be.true;
    const btns = Array.from(root.querySelectorAll('.access-btn')) as HTMLButtonElement[];
    expect(btns).to.have.length(2);
    for (const b of btns) expect(b.hasAttribute('disabled')).to.be.true;
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'cover.g']]);
  });

  it('TC-BEM-U-05: crew, toggles over absent then unavailable entities', async () => {
    const mk = async (hass: any) => {
      document.body.replaceChildren();
      warn.mockClear();
      resetBridgeWarnings();
      return mountCard(
        {
          type: 'custom:sci-fi-bridge',
          persons: [{ entity: 'person.x' }],
          alerts: { toggles: [{ entity: 'switch.a', name: 'A' }] },
          automations: { items: [{ entity: 'automation.b', name: 'B', type: 'toggle' }] },
        },
        hass
      );
    };
    let card = await mk(hassOf({}));
    expect(section(card, 'sf-bridge-crew').querySelector('.crew-badge')).to.be.null;
    for (const [tag] of [['sf-bridge-alerts'], ['sf-bridge-automations']]) {
      const btn = section(card, tag!).querySelector('button.sf-toggle') as HTMLButtonElement;
      expect(btn.disabled, tag).to.be.true;
      expect(btn.getAttribute('aria-disabled'), tag).to.equal('true');
      expect(btn.getAttribute('data-on'), tag).to.equal('false');
      const name = section(card, tag!).querySelector('.toggle-name, .auto-name') as HTMLElement;
      expect(name.classList.contains('toggle-unknown'), tag).to.be.true;
      expect(name.classList.contains('toggle-on') || name.classList.contains('toggle-off'), tag).to.be.false;
    }
    expect(bridgeWarns().map(c => c[1]).sort()).to.deep.equal(['automation.b', 'person.x', 'switch.a']);
    expect(bridgeWarns().every(c => c[0] === '[sf-bridge] entity not found:')).to.be.true;

    card = await mk(hassOf({ 'person.x': 'home', 'switch.a': 'unavailable', 'automation.b': 'unknown' }));
    for (const tag of ['sf-bridge-alerts', 'sf-bridge-automations']) {
      const btn = section(card, tag).querySelector('button.sf-toggle') as HTMLButtonElement;
      expect(btn.disabled, tag).to.be.false;
    }
    expect(bridgeWarns()).to.have.length(0);
  });

  it('TC-BEM-U-08: indicators over an absent entity show a neutral state', async () => {
    const hass = hassOf({ 'cover.g': 'closed' });
    // alerts
    let root = await mountSection(
      'sf-bridge-alerts',
      { smoke: [{ entity: 'binary_sensor.s', name: 'S' }], occupancy: 'binary_sensor.o' },
      hass
    );
    const chip = root.querySelector('.smoke-chip')!;
    expect(chip.classList.contains('smoke-unknown')).to.be.true;
    expect(chip.classList.contains('smoke-ok')).to.be.false;
    expect(chip.classList.contains('smoke-active')).to.be.false;
    expect(text(chip, '.smoke-state-placeholder')).to.equal('--');
    const pill = root.querySelector('.occupancy-pill')!;
    expect(pill.classList.contains('unknown')).to.be.true;
    expect(pill.classList.contains('occupied')).to.be.false;
    expect(pill.classList.contains('empty')).to.be.false;
    expect(pill.textContent!.trim()).to.equal('--');
    expect(bridgeWarns().map(c => c[1]).sort()).to.deep.equal(['binary_sensor.o', 'binary_sensor.s']);

    // appliances
    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-appliances',
      {
        cycles: [{ entity: 'binary_sensor.c', name: 'C', icon: 'mdi:washing-machine' }],
        consumables: [{ entity: 'binary_sensor.k', name: 'Rinse', ok_when: 'off' }],
      },
      hass
    );
    const cyc = root.querySelector('.cycle-status')!;
    expect(cyc.classList.contains('unknown')).to.be.true;
    expect(cyc.classList.contains('running')).to.be.false;
    expect(cyc.classList.contains('idle')).to.be.false;
    expect(cyc.textContent!.trim()).to.equal('--');
    const cons = root.querySelector('.consumable-chip')!;
    expect(cons.classList.contains('consumable-unknown')).to.be.true;
    expect(cons.classList.contains('consumable-ok')).to.be.false;
    expect(cons.classList.contains('consumable-warn')).to.be.false;
    expect(cons.textContent!.replace(/\s+/g, ' ').trim()).to.equal('Rinse --');
    expect(bridgeWarns().map(c => c[1]).sort()).to.deep.equal(['binary_sensor.c', 'binary_sensor.k']);

    // stove status
    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-stove', STOVE, hassOf({ 'sensor.pq': '0.5', 'sensor.ps': '2' })
    );
    const sc = root.querySelector('.stove-status-chip')!;
    expect(sc.classList.contains('stove-off')).to.be.true;
    expect(sc.classList.contains('stove-unknown')).to.be.true;
    expect(sc.classList.contains('stove-on')).to.be.false;
    expect(sc.textContent!.trim()).to.equal('--');
    expect(root.querySelector('.stove-status-row sf-icon')!.getAttribute('icon')).to.equal('sci:stove-off');
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'sensor.st']]);

    // lock
    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-access',
      { items: [{ entity: 'cover.g', name: 'G', lock: 'lock.g' }] },
      hass
    );
    const lock = root.querySelector('.lock-unknown')!;
    expect(lock).to.not.be.null;
    expect(lock.getAttribute('icon')).to.equal('mdi:lock-question');
    expect(root.querySelector('sf-icon[icon="mdi:lock-open"]')).to.be.null;
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'lock.g']]);
  });

  it('TC-BEM-U-09: action button over an absent entity is disabled and calls nothing', async () => {
    const callService = vi.fn().mockResolvedValue({});
    let root = await mountSection(
      'sf-bridge-actions', { items: [{ entity: 'script.go', name: 'Go' }] }, hassOf({}, callService)
    );
    let btn = root.querySelector('.action-btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.true;
    btn.click();
    expect(callService).not.toHaveBeenCalled();
    expect(bridgeWarns()).to.deep.equal([['[sf-bridge] entity not found:', 'script.go']]);

    document.body.replaceChildren();
    warn.mockClear();
    root = await mountSection(
      'sf-bridge-actions', { items: [{ entity: 'script.go', name: 'Go' }] },
      hassOf({ 'script.go': 'off' }, callService)
    );
    btn = root.querySelector('.action-btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.false;
    expect(bridgeWarns()).to.have.length(0);
  });

  it('TC-BEM-U-13: slider input over an absent entity calls no service', async () => {
    vi.useFakeTimers();
    const callService = vi.fn().mockResolvedValue({});
    const root = await mountSection(
      'sf-bridge-automations',
      { items: [{ entity: 'input_number.t', name: 'T', type: 'slider', min: 0, max: 60 }] },
      hassOf({}, callService)
    );
    const input = root.querySelector('input[type=range]') as HTMLInputElement;
    input.value = '30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(400);
    expect(callService).not.toHaveBeenCalled();
    expect(text(root, '.slider-value')).to.equal('--');
  });

  it('TC-BEM-U-11: empty entity ids render absent and never warn', async () => {
    const card = await mountCard(
      {
        type: 'custom:sci-fi-bridge',
        persons: [{ entity: '' }],
        alerts: { occupancy: '' },
      },
      hassOf({})
    );
    expect(section(card, 'sf-bridge-crew').querySelector('.crew-badge')).to.be.null;
    expect(section(card, 'sf-bridge-alerts').querySelector('.occupancy-pill.unknown')).to.not.be.null;
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('[sf-bridge]'), expect.anything());
    expect(bridgeWarns()).to.have.length(0);
  });
});

// ── setConfig validation ───────────────────────────────────────────────────────

const T = 'custom:sci-fi-bridge';
const SECRET = '<script>SECRET-9f3</script>';

async function configOutcome(config: any): Promise<{ card: any; msg: string | undefined }> {
  error.mockClear();
  const card = document.createElement('sci-fi-bridge') as any;
  card.hass = hassOf({});
  expect(() => card.setConfig(config)).not.toThrow();
  document.body.appendChild(card);
  await settle(card);
  const calls = error.mock.calls.filter(c => c[0] === '[sf-bridge] invalid config:');
  return { card, msg: calls.length === 1 ? (calls[0]![1] as string) : `calls:${calls.length}` };
}

describe('bridge error matrix — setConfig validation', () => {
  it('TC-BEM-U-06: invalid configs render an error card, a valid {type} does not', async () => {
    const cases: Array<[any, string]> = [
      [{ type: T, persons: {} }, 'persons: expected an array'],
      [{ type: T, access: { items: 1 } }, 'access.items: expected an array'],
      [{ type: T, stove: { pellet_quantity: 'a', pellet_stock: 'b' } }, 'stove.status: expected a string'],
      [{ type: T, vehicle: {} }, 'vehicle.power_sensor: expected a string'],
    ];
    for (const [cfg, expected] of cases) {
      document.body.replaceChildren();
      const { card, msg } = await configOutcome(cfg);
      expect(msg).to.equal(expected);
      expect(card.shadowRoot.querySelector('.sf-error-card')).to.not.be.null;
      expect(text(card.shadowRoot, '.sf-error-message')).to.equal(expected);
    }
    document.body.replaceChildren();
    const { card, msg } = await configOutcome({ type: T });
    expect(msg).to.equal('calls:0');
    expect(card.shadowRoot.querySelector('.sf-error-card')).to.be.null;
  });

  it('TC-BEM-U-12: every FR-8 rule yields its path-and-type message, never the value', async () => {
    const ARRAY_KEYS: Array<[string, (v: any) => any]> = [
      ['persons', v => ({ persons: v })],
      ['access.items', v => ({ access: { items: v } })],
      ['automations.items', v => ({ automations: { items: v } })],
      ['actions.items', v => ({ actions: { items: v } })],
      ['alerts.smoke', v => ({ alerts: { smoke: v } })],
      ['alerts.toggles', v => ({ alerts: { toggles: v } })],
      ['appliances.cycles', v => ({ appliances: { cycles: v } })],
      ['appliances.consumables', v => ({ appliances: { consumables: v } })],
    ];
    const cases: Array<[string, any, string]> = [
      ['null', null, 'config: expected an object'],
      ['number', 42, 'config: expected an object'],
      ['string', 'x', 'config: expected an object'],
      ['no type', {}, 'type: expected a string'],
      ['type 3', { type: 3 }, 'type: expected a string'],
      ['stove array', { type: T, stove: [] }, 'stove: expected an object'],
      ['alerts string', { type: T, alerts: 'x' }, 'alerts: expected an object'],
      ...ARRAY_KEYS.map(([k, w]): [string, any, string] => [
        `${k} as object`, { type: T, ...w({}) }, `${k}: expected an array`,
      ]),
      ['persons null', { type: T, persons: [null] }, 'persons[0].entity: expected a string'],
      ['persons entity 42', { type: T, persons: [{ entity: 42 }] }, 'persons[0].entity: expected a string'],
      ['automations entity', { type: T, automations: { items: [{ entity: 'a.b' }, { entity: 42 }] } },
        'automations.items[1].entity: expected a string'],
      ['smoke object', { type: T, alerts: { smoke: {} } }, 'alerts.smoke: expected an array'],
      ['occupancy 1', { type: T, alerts: { occupancy: 1 } }, 'alerts.occupancy: expected a string'],
      ['smoke_switch 1', { type: T, alerts: { smoke_switch: 1 } }, 'alerts.smoke_switch: expected a string'],
      ['lock 1', { type: T, access: { items: [{ entity: 'cover.a', lock: 1 }] } },
        'access.items[0].lock: expected a string'],
      ['stove no pq', { type: T, stove: { pellet_stock: 'b', status: 'c' } }, 'stove.pellet_quantity: expected a string'],
      ['stove no ps', { type: T, stove: { pellet_quantity: 'a', status: 'c' } }, 'stove.pellet_stock: expected a string'],
      ['stove no status', { type: T, stove: { pellet_quantity: 'a', pellet_stock: 'b' } }, 'stove.status: expected a string'],
      ['vehicle no sensor', { type: T, vehicle: {} }, 'vehicle.power_sensor: expected a string'],
      // secret sentinel is never reflected
      ['secret as entity', { type: T, persons: [{ entity: { secret: SECRET } }] }, 'persons[0].entity: expected a string'],
      ['secret as type', { type: { secret: SECRET } }, 'type: expected a string'],
      ['secret as occupancy', { type: T, alerts: { occupancy: { s: SECRET } } },
        'alerts.occupancy: expected a string'],
    ];
    for (const [name, cfg, expected] of cases) {
      document.body.replaceChildren();
      const { msg } = await configOutcome(cfg);
      expect(msg, name).to.equal(expected);
      expect(msg, name).to.not.contain('SECRET-9f3');
      expect(msg, name).to.not.contain('<script>');
    }
    // valid shapes
    for (const cfg of [{ type: T, stove: null }, { type: T }, { type: T, persons: [{ entity: '' }] }]) {
      document.body.replaceChildren();
      const { msg } = await configOutcome(cfg);
      expect(msg).to.equal('calls:0');
    }
  });
});

// ── Documentation ──────────────────────────────────────────────────────────────

describe('bridge error matrix — bridge.md', () => {
  it('TC-BEM-U-07: matrix and vehicle layout state the once-per-entity behaviour', () => {
    const md = fs.readFileSync(path.resolve(__dirname, '../../../docs/specs/cards/bridge.md'), 'utf8');
    const start = md.indexOf('## Error Handling Matrix');
    const matrix = md.slice(start);
    const rows = matrix.split('\n').filter(l => l.startsWith('|'));
    const absent = rows.find(r => r.includes('Entité absente de `hass.states`'))!;
    expect(absent).to.contain('une fois par entité');
    expect(absent).to.contain('setConfig');
    expect(absent).to.contain('état neutre');
    for (const label of ['`pellet_quantity` non numérique', 'EV power non numérique']) {
      const row = rows.find(r => r.includes(label))!;
      expect(row, label).to.contain('une fois par entité');
      expect(row, label).to.contain('setConfig');
      expect(row, label).to.contain('Number.isFinite');
    }
    const invalid = rows.find(r => r.includes('Config invalide'))!;
    expect(invalid).to.contain('[sf-bridge] invalid config:');
    for (const r of rows) {
      if (r.includes('console.warn(')) expect(r, r).to.contain('une fois par entité');
    }
    const vStart = md.indexOf('### sf-bridge-vehicle');
    const vEnd = md.indexOf('### sf-bridge-actions');
    const vehicle = md.slice(vStart, vEnd);
    expect(vehicle).to.contain('.vehicle-power-value');
    expect(vehicle).to.contain('.vehicle-status-label');
    expect(vehicle).to.not.contain('.vehicle-power (');
    expect(vehicle).to.contain('Number.isFinite');
    const stove = md.slice(md.indexOf('### sf-bridge-stove'), vStart);
    expect(stove).to.contain('Number.isFinite');
    expect(stove).to.not.contain('`parseFloat` retourne NaN');
  });
});

// ── Integration ────────────────────────────────────────────────────────────────

const IT_CONFIG = () => ({
  type: T,
  alerts: { occupancy: 'binary_sensor.o' },
  stove: { ...STOVE },
  vehicle: { power_sensor: 'sensor.ev' },
});

describe('bridge error matrix — integration', () => {
  it('IT-BEM-I-01: one warn per absent entity across 3 hass replacements', async () => {
    const card = await mountCard(IT_CONFIG(), hassOf({ 'binary_sensor.o': 'on' }));
    const pill = () => text(section(card, 'sf-bridge-alerts'), '.occupancy-pill');
    const seen = [pill()];
    for (const s of ['off', 'on']) {
      card.hass = hassOf({ 'binary_sensor.o': s });
      await settle(card);
      seen.push(pill());
    }
    // the card DID re-render at every replacement (text follows the state)
    expect(seen[1]).to.not.equal(seen[0]);
    expect(seen[2]).to.equal(seen[0]);
    expect(text(section(card, 'sf-bridge-stove'), '.stove-pellet-placeholder')).to.equal(`--${NBSP}%`);
    expect(text(section(card, 'sf-bridge-stove'), '.stove-stock-placeholder')).to.equal('--');
    expect(text(section(card, 'sf-bridge-vehicle'), '.vehicle-power-value')).to.equal(`--${NBSP}W`);
    expect(bridgeWarns().map(c => c[1]).sort()).to.deep.equal(
      ['sensor.ev', 'sensor.ps', 'sensor.pq', 'sensor.st'].sort()
    );
  });

  it('IT-BEM-I-02: setConfig re-arms the warning; present-then-absent warns once', async () => {
    const card = await mountCard(
      { type: T, vehicle: { power_sensor: 'sensor.ev' } }, hassOf({})
    );
    expect(bridgeWarns()).to.have.length(1);
    card.setConfig({ type: T, vehicle: { power_sensor: 'sensor.ev' } });
    await settle(card);
    expect(bridgeWarns()).to.have.length(2);

    // present (never warned), then absent
    document.body.replaceChildren();
    warn.mockClear();
    resetBridgeWarnings();
    const c2 = await mountCard(
      { type: T, vehicle: { power_sensor: 'sensor.ev' } }, hassOf({ 'sensor.ev': '100' })
    );
    expect(bridgeWarns()).to.have.length(0);
    c2.hass = hassOf({});
    await settle(c2);
    expect(bridgeWarns()).to.have.length(1);
    c2.hass = hassOf({ 'sensor.other': '1' });
    await settle(c2);
    expect(bridgeWarns()).to.have.length(1);
  });

  it('IT-BEM-I-03: invalid config shows the error card, a later valid one clears it', async () => {
    const card = document.createElement('sci-fi-bridge') as any;
    card.hass = hassOf({ 'person.x': 'home' });
    card.setConfig({ type: T, persons: {} });
    document.body.appendChild(card);
    await settle(card);
    expect(card.shadowRoot.querySelector('.sf-error-card')).to.not.be.null;
    expect(card.shadowRoot.querySelector('.bridge-grid')).to.be.null;

    card.setConfig({ type: T, persons: [{ entity: 'person.x' }] });
    await settle(card);
    expect(card.shadowRoot.querySelector('.sf-error-card')).to.be.null;
    expect(card.shadowRoot.querySelector('.bridge-grid')).to.not.be.null;
  });

  it('IT-BEM-I-04: a rejected callService logs an error and no warn', async () => {
    const boom = new Error('boom');
    const callService = vi.fn().mockRejectedValue(boom);
    const card = await mountCard(
      {
        type: T,
        actions: { items: [{ entity: 'script.go', name: 'Go' }] },
        vehicle: { power_sensor: 'sensor.ev' },
      },
      hassOf({ 'script.go': 'off' }, callService)
    );
    const warnsBefore = bridgeWarns().length;
    expect(warnsBefore).to.equal(1); // the absent vehicle sensor only
    const btn = section(card, 'sf-bridge-actions').querySelector('.action-btn') as HTMLButtonElement;
    btn.click();
    await vi.waitFor(() => expect(callService).toHaveBeenCalled());
    await new Promise(r => setTimeout(r, 0));
    const errs = error.mock.calls.filter(c => c[0] === '[sf-bridge] callService error:');
    expect(errs).to.have.length(1);
    expect(errs[0]![1]).to.equal(boom);
    expect(bridgeWarns().length).to.equal(warnsBefore);
  });

  it('IT-BEM-I-05: editor-style repeated setConfig warns once per call', async () => {
    const mkCfg = () => ({
      type: T,
      persons: [{ entity: 'person.here' }, { entity: '' }],
      vehicle: { power_sensor: 'sensor.ev' },
    });
    const card = await mountCard(mkCfg(), hassOf({ 'person.here': 'home' }));
    for (let i = 0; i < 4; i++) {
      card.setConfig(mkCfg());
      await settle(card);
    }
    const ev = bridgeWarns().filter(c => c[1] === 'sensor.ev');
    expect(ev).to.have.length(5);
    expect(bridgeWarns().filter(c => c[1] === '' || c[1] === 'person.here')).to.have.length(0);
  });
});
