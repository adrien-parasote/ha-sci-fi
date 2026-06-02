/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-appliances
 * Covers: render guards, isCycleRunning (binary_sensor/sensor-running_states/
 *         no-running_states/no-stateObj), cycles nothing, consumables nothing,
 *         cycle-running/idle states, consumable ok/warn.
 */
import { expect, describe, it, afterEach } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-appliances.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
for (const tag of ['sf-icon']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-appliances') as any;
}

function makeHass(states: Record<string, any>) {
  return makeMockHass({ states });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-appliances', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ──────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { cycles: [] };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config is not set', async () => {
    const el = makeEl();
    el.hass = makeHass({});
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── _renderCycles: nothing branch ─────────────────────────────────────────

  it('does NOT render appliances-cycles when cycles is empty', async () => {
    const el = makeEl();
    el.config = { cycles: [] };
    el.hass = makeHass({});
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.appliances-cycles')).to.be.null;
  });

  // ── _renderConsumables: nothing branch ────────────────────────────────────

  it('does NOT render consumables-row when consumables is absent', async () => {
    const el = makeEl();
    el.config = { cycles: [] };
    el.hass = makeHass({});
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.consumables-row')).to.be.null;
  });

  // ── isCycleRunning: binary_sensor on → running ───────────────────────────

  it('shows cycle-running when binary_sensor is on', async () => {
    const el = makeEl();
    el.config = {
      cycles: [{ entity: 'binary_sensor.washer', name: 'Washer', icon: 'mdi:washing-machine' }],
    };
    el.hass = makeHass({
      'binary_sensor.washer': makeMockEntity({ entity_id: 'binary_sensor.washer', state: 'on' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.cycle-running')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.running')).not.to.be.null;
  });

  // ── isCycleRunning: binary_sensor off → idle ─────────────────────────────

  it('shows idle when binary_sensor is off', async () => {
    const el = makeEl();
    el.config = {
      cycles: [{ entity: 'binary_sensor.washer', name: 'Washer', icon: 'mdi:washing-machine' }],
    };
    el.hass = makeHass({
      'binary_sensor.washer': makeMockEntity({ entity_id: 'binary_sensor.washer', state: 'off' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.cycle-running')).to.be.null;
    expect(el.shadowRoot!.querySelector('.idle')).not.to.be.null;
  });

  // ── isCycleRunning: sensor with running_states match (lines 23-26) ───────

  it('shows cycle-running when sensor state matches running_states', async () => {
    const el = makeEl();
    el.config = {
      cycles: [
        { entity: 'sensor.washer_state', name: 'Washer', icon: 'mdi:washing-machine', running_states: ['running', 'spinning'] },
      ],
    };
    el.hass = makeHass({
      'sensor.washer_state': makeMockEntity({ entity_id: 'sensor.washer_state', state: 'running' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.cycle-running')).not.to.be.null;
  });

  // ── isCycleRunning: sensor running_states — case-insensitive ─────────────

  it('matches running_states case-insensitively', async () => {
    const el = makeEl();
    el.config = {
      cycles: [
        { entity: 'sensor.washer_state', name: 'Washer', icon: 'mdi:washing-machine', running_states: ['Running'] },
      ],
    };
    el.hass = makeHass({
      'sensor.washer_state': makeMockEntity({ entity_id: 'sensor.washer_state', state: 'running' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.cycle-running')).not.to.be.null;
  });

  // ── isCycleRunning: sensor with running_states — no match (line 28) ──────

  it('shows idle when sensor state does not match running_states', async () => {
    const el = makeEl();
    el.config = {
      cycles: [
        { entity: 'sensor.washer_state', name: 'Washer', icon: 'mdi:washing-machine', running_states: ['running'] },
      ],
    };
    el.hass = makeHass({
      'sensor.washer_state': makeMockEntity({ entity_id: 'sensor.washer_state', state: 'idle' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.idle')).not.to.be.null;
  });

  // ── isCycleRunning: sensor with no running_states → always false (line 28)

  it('shows idle for sensor without running_states', async () => {
    const el = makeEl();
    el.config = {
      cycles: [
        { entity: 'sensor.washer_state', name: 'Washer', icon: 'mdi:washing-machine' }, // no running_states
      ],
    };
    el.hass = makeHass({
      'sensor.washer_state': makeMockEntity({ entity_id: 'sensor.washer_state', state: 'on' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.idle')).not.to.be.null;
  });

  // ── isCycleRunning: no stateObj → false ──────────────────────────────────

  it('shows idle when stateObj is missing', async () => {
    const el = makeEl();
    el.config = {
      cycles: [
        { entity: 'sensor.washer_state', name: 'Washer', icon: 'mdi:washing-machine', running_states: ['running'] },
      ],
    };
    el.hass = makeHass({});
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.idle')).not.to.be.null;
  });

  // ── _renderConsumables: ok branch ─────────────────────────────────────────

  it('renders consumable-ok when state matches ok_when', async () => {
    const el = makeEl();
    el.config = {
      cycles: [],
      consumables: [{ entity: 'sensor.filter', name: 'Filter', ok_when: 'clean' }],
    };
    el.hass = makeHass({
      'sensor.filter': makeMockEntity({ entity_id: 'sensor.filter', state: 'clean' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.consumable-ok')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.consumable-warn')).to.be.null;
  });

  // ── _renderConsumables: warn branch ──────────────────────────────────────

  it('renders consumable-warn when state does not match ok_when', async () => {
    const el = makeEl();
    el.config = {
      cycles: [],
      consumables: [{ entity: 'sensor.filter', name: 'Filter', ok_when: 'clean' }],
    };
    el.hass = makeHass({
      'sensor.filter': makeMockEntity({ entity_id: 'sensor.filter', state: 'dirty' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.consumable-warn')).not.to.be.null;
  });

  // ── config.icon override ──────────────────────────────────────────────────

  it('uses config.icon for section title when provided', async () => {
    const el = makeEl();
    el.config = {
      icon: 'mdi:robot-vacuum',
      cycles: [{ entity: 'binary_sensor.washer', name: 'Washer', icon: 'mdi:washing-machine' }],
    };
    el.hass = makeHass({
      'binary_sensor.washer': makeMockEntity({ entity_id: 'binary_sensor.washer', state: 'off' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:robot-vacuum');
  });
});
