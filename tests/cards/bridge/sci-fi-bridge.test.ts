/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sci-fi-bridge (F-BR-14)
 * Spec: docs/specs/cards/bridge.md
 *
 * TDD RED: written before implementation. All tests fail initially.
 * GREEN: pass once src/cards/bridge/sci-fi-bridge.ts is implemented.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/bridge/sci-fi-bridge.js';
import { SciFiBridgeCard } from '../../../src/cards/bridge/sci-fi-bridge.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// ── Shared stubs ───────────────────────────────────────────────────────────────

// Stub sf-toast (used by SciFiBaseCard)
if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

// Full config for integration tests
const FULL_CONFIG = {
  type: 'custom:sci-fi-bridge',
  persons: [
    { entity: 'person.adrien' },
    { entity: 'person.virginie' },
  ],
  alerts: {
    smoke: [
      { entity: 'binary_sensor.smoke_salon', name: 'Salon' },
    ],
    smoke_switch: 'switch.smoke_detector_switch',
    toggles: [
      { entity: 'automation.alerte_intrusion', name: 'Intrusion' },
    ],
    occupancy: 'binary_sensor.people_at_home',
  },
  access: {
    items: [
      { entity: 'cover.porte_garage', name: 'Garage', lock: 'lock.porte_garage' },
    ],
  },
  automations: {
    items: [
      { entity: 'automation.nuit_extinction', name: 'Nuit', type: 'toggle' as const },
      { entity: 'input_number.temporisation', name: 'Tempo', type: 'slider' as const, min: 0, max: 60, step: 5, unit: 'min' },
    ],
  },
  appliances: {
    cycles: [{ entity: 'binary_sensor.cycle_lave_linge', name: 'Lave-linge', icon: 'mdi:washing-machine' }],
    consumables: [{ entity: 'binary_sensor.rinse_aid', name: 'Liquide', ok_when: 'off' as const }],
  },
  stove: {
    pellet_quantity: 'sensor.pellet_quantity',
    pellet_stock: 'counter.pellet_stock',
    status: 'binary_sensor.stove_status',
    low_threshold: 0.3,
  },
  vehicle: {
    power_sensor: 'sensor.mureva_evlink_power',
  },
  call_kids: {
    entity: 'input_button.call_kids',
    name: 'Appeler',
    icon: 'mdi:bullhorn',
  },
};

// Mock hass states for full config
function makeFullHass(overrides: Record<string, any> = {}) {
  return makeMockHass({
    states: {
      'person.adrien': makeMockEntity({ entity_id: 'person.adrien', state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: '/local/avatars/adrien.jpg' } }),
      'person.virginie': makeMockEntity({ entity_id: 'person.virginie', state: 'not_home', attributes: { friendly_name: 'Virginie', entity_picture: null } }),
      'binary_sensor.smoke_salon': makeMockEntity({ entity_id: 'binary_sensor.smoke_salon', state: 'off' }),
      'switch.smoke_detector_switch': makeMockEntity({ entity_id: 'switch.smoke_detector_switch', state: 'on' }),
      'automation.alerte_intrusion': makeMockEntity({ entity_id: 'automation.alerte_intrusion', state: 'off', attributes: { friendly_name: 'Intrusion' } }),
      'binary_sensor.people_at_home': makeMockEntity({ entity_id: 'binary_sensor.people_at_home', state: 'on' }),
      'cover.porte_garage': makeMockEntity({ entity_id: 'cover.porte_garage', state: 'closed', attributes: { friendly_name: 'Porte Garage' } }),
      'lock.porte_garage': makeMockEntity({ entity_id: 'lock.porte_garage', state: 'locked' }),
      'automation.nuit_extinction': makeMockEntity({ entity_id: 'automation.nuit_extinction', state: 'off' }),
      'input_number.temporisation': makeMockEntity({ entity_id: 'input_number.temporisation', state: '10', attributes: { min: 0, max: 60, step: 5 } }),
      'binary_sensor.cycle_lave_linge': makeMockEntity({ entity_id: 'binary_sensor.cycle_lave_linge', state: 'off' }),
      'binary_sensor.rinse_aid': makeMockEntity({ entity_id: 'binary_sensor.rinse_aid', state: 'off' }),
      'sensor.pellet_quantity': makeMockEntity({ entity_id: 'sensor.pellet_quantity', state: '75' }),
      'counter.pellet_stock': makeMockEntity({ entity_id: 'counter.pellet_stock', state: '5' }),
      'binary_sensor.stove_status': makeMockEntity({ entity_id: 'binary_sensor.stove_status', state: 'off' }),
      'sensor.mureva_evlink_power': makeMockEntity({ entity_id: 'sensor.mureva_evlink_power', state: '0', attributes: { unit_of_measurement: 'W' } }),
      'input_button.call_kids': makeMockEntity({ entity_id: 'input_button.call_kids', state: 'unknown' }),
      ...overrides,
    },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('sci-fi-bridge', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Card registration ────────────────────────────────────────────────────────

  it('provides getConfigElement → sci-fi-bridge-editor', () => {
    const el = SciFiBridgeCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-bridge-editor');
  });

  it('provides getStubConfig with type custom:sci-fi-bridge', () => {
    const config = SciFiBridgeCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-bridge');
  });

  // ── getRelevantEntities ──────────────────────────────────────────────────────

  it('getRelevantEntities returns [] when config is empty {}', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    const ids = (el as any).getRelevantEntities();
    expect(ids).to.deep.equal([]);
  });

  it('getRelevantEntities returns all entity_ids from full config (deduped)', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig(FULL_CONFIG);
    const ids: string[] = (el as any).getRelevantEntities();
    // Must include entities from every section
    expect(ids).to.include('person.adrien');
    expect(ids).to.include('person.virginie');
    expect(ids).to.include('binary_sensor.smoke_salon');
    expect(ids).to.include('switch.smoke_detector_switch');
    expect(ids).to.include('automation.alerte_intrusion');
    expect(ids).to.include('binary_sensor.people_at_home');
    expect(ids).to.include('cover.porte_garage');
    expect(ids).to.include('lock.porte_garage');
    expect(ids).to.include('automation.nuit_extinction');
    expect(ids).to.include('input_number.temporisation');
    expect(ids).to.include('binary_sensor.cycle_lave_linge');
    expect(ids).to.include('binary_sensor.rinse_aid');
    expect(ids).to.include('sensor.pellet_quantity');
    expect(ids).to.include('counter.pellet_stock');
    expect(ids).to.include('binary_sensor.stove_status');
    expect(ids).to.include('sensor.mureva_evlink_power');
    expect(ids).to.include('input_button.call_kids');
    // No duplicates
    expect(ids.length).to.equal(new Set(ids).size);
  });

  it('getRelevantEntities with persons only → returns person entities', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge', persons: [{ entity: 'person.adrien' }] });
    const ids: string[] = (el as any).getRelevantEntities();
    expect(ids).to.deep.equal(['person.adrien']);
  });

  it('getRelevantEntities iterates access.items (not top-level access array)', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      access: { items: [{ entity: 'cover.porte_garage', name: 'Garage', lock: 'lock.porte_garage' }] },
    });
    const ids: string[] = (el as any).getRelevantEntities();
    expect(ids).to.include('cover.porte_garage');
    expect(ids).to.include('lock.porte_garage');
  });

  it('getRelevantEntities iterates automations.items (not top-level automations array)', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
    });
    const ids: string[] = (el as any).getRelevantEntities();
    expect(ids).to.include('automation.nuit');
  });

  // ── Optional sections rendering ──────────────────────────────────────────────

  it('renders nothing when hass is not set', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent?.trim()).to.equal('');
  });

  it('does NOT render sf-bridge-crew when persons is absent', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-crew')).to.be.null;
  });

  it('renders sf-bridge-crew when persons is present', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge', persons: [{ entity: 'person.adrien' }] });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-crew')).not.to.be.null;
  });

  it('does NOT render sf-bridge-alerts when alerts is absent', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-alerts')).to.be.null;
  });

  it('renders sf-bridge-alerts when alerts is present', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge', alerts: { smoke: [{ entity: 'binary_sensor.smoke_salon', name: 'Salon' }] } });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-alerts')).not.to.be.null;
  });

  it('does NOT render sf-bridge-automations when automations.items is empty', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge', automations: { items: [] } });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-automations')).to.be.null;
  });

  it('renders sf-bridge-automations when automations.items has entries', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
    });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-automations')).not.to.be.null;
  });

  it('does NOT render sf-bridge-access when access.items is empty', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge', access: { items: [] } });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-access')).to.be.null;
  });

  it('renders sf-bridge-access when access.items has entries', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      access: { items: [{ entity: 'cover.porte_garage', name: 'Garage' }] },
    });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-access')).not.to.be.null;
  });

  it('does NOT render sf-bridge-stove when stove is absent', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-stove')).to.be.null;
  });

  it('renders sf-bridge-stove when stove is present', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      stove: { pellet_quantity: 'sensor.pellet_quantity', pellet_stock: 'counter.pellet_stock', status: 'binary_sensor.stove_status' },
    });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-stove')).not.to.be.null;
  });

  it('does NOT render sf-bridge-vehicle when vehicle is absent', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-vehicle')).to.be.null;
  });

  it('renders sf-bridge-vehicle when vehicle is present', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      vehicle: { power_sensor: 'sensor.mureva_evlink_power' },
    });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-vehicle')).not.to.be.null;
  });

  it('does NOT render sf-bridge-call-kids when call_kids is absent', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-call-kids')).to.be.null;
  });

  it('renders sf-bridge-call-kids when call_kids is present', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      call_kids: { entity: 'input_button.call_kids', name: 'Appeler' },
    });
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-bridge-call-kids')).not.to.be.null;
  });

  // ── Full render ───────────────────────────────────────────────────────────────

  it('renders .bridge-grid with all 8 sections for full config', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig(FULL_CONFIG);
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const grid = el.shadowRoot!.querySelector('.bridge-grid');
    expect(grid).not.to.be.null;
    // All 8 section components rendered
    expect(el.shadowRoot!.querySelector('sf-bridge-crew')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-alerts')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-automations')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-access')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-appliances')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-stove')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-vehicle')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-bridge-call-kids')).not.to.be.null;
  });

  it('sf-bridge-crew and sf-bridge-call-kids have class full-width', async () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig(FULL_CONFIG);
    el.hass = makeFullHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const crew = el.shadowRoot!.querySelector('sf-bridge-crew');
    const callKids = el.shadowRoot!.querySelector('sf-bridge-call-kids');
    expect(crew?.classList.contains('full-width')).to.be.true;
    expect(callKids?.classList.contains('full-width')).to.be.true;
  });

  // ── getCardSize ───────────────────────────────────────────────────────────────

  it('getCardSize returns a number > 0', () => {
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({ type: 'custom:sci-fi-bridge' });
    expect(el.getCardSize()).to.be.greaterThan(0);
  });

  // ── Automation callService ────────────────────────────────────────────────────

  it('sf-bridge-automations toggle calls automation service', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-bridge') as SciFiBridgeCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-bridge',
      automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
    });
    el.hass = makeFullHass({ callService: callServiceMock });
    document.body.appendChild(el);
    await el.updateComplete;
    // Component must be present
    const automationsEl = el.shadowRoot!.querySelector('sf-bridge-automations');
    expect(automationsEl).not.to.be.null;
  });
});
