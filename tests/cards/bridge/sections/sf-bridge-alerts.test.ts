 
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-alerts
 * Covers: render guards, _renderSmoke (length 0 = nothing), _renderToggles (nothing),
 *         _renderOccupancy (nothing), smoke isActive branch, toggle isOn branch,
 *         occupancy isOccupied branch, _toggle (turn_on/turn_off), custom icons.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-alerts.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
for (const tag of ['sf-icon']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

vi.mock('../../../../src/cards/bridge/bridge-toast.js', () => ({
  bridgeToast: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-alerts') as any;
}

function makeHass(extra: Record<string, any> = {}, callService?: any) {
  return makeMockHass({
    states: {
      'binary_sensor.smoke': makeMockEntity({ entity_id: 'binary_sensor.smoke', state: 'off' }),
      'switch.gate': makeMockEntity({ entity_id: 'switch.gate', state: 'off' }),
      'binary_sensor.presence': makeMockEntity({ entity_id: 'binary_sensor.presence', state: 'off' }),
      ...extra,
    },
    callService,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-alerts', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ──────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { smoke: [], toggles: [] };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config is not set', async () => {
    const el = makeEl();
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── _renderSmoke: nothing branch (no smoke config) ────────────────────────

  it('does NOT render smoke row when smoke is empty', async () => {
    const el = makeEl();
    el.config = { smoke: [] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.alerts-smoke-row')).to.be.null;
  });

  // ── _renderSmoke: smoke-ok state ──────────────────────────────────────────

  it('renders smoke-ok chip when smoke sensor state is off', async () => {
    const el = makeEl();
    el.config = { smoke: [{ entity: 'binary_sensor.smoke', name: 'Smoke Detector' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.smoke-ok')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.smoke-active')).to.be.null;
  });

  // ── _renderSmoke: smoke-active state ─────────────────────────────────────

  it('renders smoke-active chip when smoke sensor state is on', async () => {
    const el = makeEl();
    el.config = { smoke: [{ entity: 'binary_sensor.smoke', name: 'Smoke Detector' }] };
    el.hass = makeHass({
      'binary_sensor.smoke': makeMockEntity({ entity_id: 'binary_sensor.smoke', state: 'on' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.smoke-active')).not.to.be.null;
  });

  // ── _renderSmoke: custom icon ─────────────────────────────────────────────

  it('uses custom smoke icon when provided', async () => {
    const el = makeEl();
    el.config = { smoke: [{ entity: 'binary_sensor.smoke', name: 'Smoke', icon: 'mdi:fire' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const smokeIcon = el.shadowRoot!.querySelector('.smoke-chip sf-icon');
    expect(smokeIcon?.getAttribute('icon')).to.equal('mdi:fire');
  });

  // ── _renderToggles: nothing branch ────────────────────────────────────────

  it('does NOT render toggles row when toggles is empty', async () => {
    const el = makeEl();
    el.config = { toggles: [] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.alerts-toggles-row')).to.be.null;
  });

  // ── _renderToggles: toggle-off state ─────────────────────────────────────

  it('renders toggle-off class when toggle state is off', async () => {
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.toggle-off')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.toggle-on')).to.be.null;
  });

  // ── _renderToggles: toggle-on state ──────────────────────────────────────

  it('renders toggle-on class when toggle state is on', async () => {
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass({
      'switch.gate': makeMockEntity({ entity_id: 'switch.gate', state: 'on' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.toggle-on')).not.to.be.null;
  });

  // ── _renderToggles: toggle state is "enabled" ────────────────────────────

  it('treats "enabled" as on state for toggle', async () => {
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass({
      'switch.gate': makeMockEntity({ entity_id: 'switch.gate', state: 'enabled' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.toggle-on')).not.to.be.null;
  });

  // ── _renderOccupancy: nothing branch ─────────────────────────────────────

  it('does NOT render occupancy badge when occupancy is not configured', async () => {
    const el = makeEl();
    el.config = {};
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.occupancy-badge')).to.be.null;
  });

  // ── _renderOccupancy: empty state ────────────────────────────────────────

  it('renders occupancy badge in "empty" state when sensor is off', async () => {
    const el = makeEl();
    el.config = { occupancy: 'binary_sensor.presence' };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.occupancy-badge')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.empty')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.occupied')).to.be.null;
  });

  // ── _renderOccupancy: occupied state ─────────────────────────────────────

  it('renders occupancy badge in "occupied" state when sensor is on', async () => {
    const el = makeEl();
    el.config = { occupancy: 'binary_sensor.presence' };
    el.hass = makeHass({
      'binary_sensor.presence': makeMockEntity({ entity_id: 'binary_sensor.presence', state: 'on' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.occupied')).not.to.be.null;
  });

  // ── _toggle: calls turn_off when toggle is on ─────────────────────────────

  it('_toggle calls callService turn_off when toggle is on', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass(
      { 'switch.gate': makeMockEntity({ entity_id: 'switch.gate', state: 'on' }) },
      callService
    );
    document.body.appendChild(el);
    await el.updateComplete;

    (el.shadowRoot!.querySelector('.sf-toggle') as HTMLButtonElement)?.click();
    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.gate' });
  });

  // ── _toggle: calls turn_on when toggle is off ─────────────────────────────

  it('_toggle calls callService turn_on when toggle is off', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass({}, callService);
    document.body.appendChild(el);
    await el.updateComplete;

    (el.shadowRoot!.querySelector('.sf-toggle') as HTMLButtonElement)?.click();
    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.gate' });
  });

  // ── config.icon override ──────────────────────────────────────────────────

  it('uses config.icon for section title when provided', async () => {
    const el = makeEl();
    el.config = { icon: 'mdi:alarm-bell', smoke: [{ entity: 'binary_sensor.smoke', name: 'Smoke' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:alarm-bell');
  });

  // ── toggleDefaultIcon: per domain ─────────────────────────────────────────

  it('uses mdi:robot icon for automation toggle by default', async () => {
    const el = makeEl();
    el.config = { toggles: [{ entity: 'automation.nuit', name: 'Night' }] };
    el.hass = makeHass({
      'automation.nuit': makeMockEntity({ entity_id: 'automation.nuit', state: 'off' }),
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.toggle-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:robot');
  });

  it('uses mdi:power-plug for switch domain by default', async () => {
    const el = makeEl();
    el.config = { toggles: [{ entity: 'switch.gate', name: 'Gate' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const rowIcon = el.shadowRoot!.querySelector('.toggle-row sf-icon');
    expect(rowIcon?.getAttribute('icon')).to.equal('mdi:power-plug');
  });
});
