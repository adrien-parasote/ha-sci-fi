/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sci-fi-bridge-editor
 * Spec: docs/specs/cards/bridge.md §Editor
 *
 * Covers: setConfig, render, Persons, Alerts, Access, Automations,
 *         Appliances, Sections enable/disable, Actions.
 * Target: ≥ 80% lines on sci-fi-bridge-editor.ts
 */

// ── Stubs for unknown custom elements (must appear before component import) ────

const STUB_ELEMENTS = [
  'sf-editor-dropdown-icon',
  'sf-editor-accordion',
  'sf-editor-input',
  'sf-editor-dropdown',
  'sf-editor-dropdown-entity',
  'sf-icon',
  'sf-button',
];
for (const tag of STUB_ELEMENTS) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends HTMLElement {});
  }
}

// ── Imports ────────────────────────────────────────────────────────────────────

import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/cards/bridge/sci-fi-bridge-editor.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeEditorEl(): any {
  const el = document.createElement('sci-fi-bridge-editor') as any;
  return el;
}

function makeEditorHass() {
  return makeMockHass({
    states: {
      'person.adrien': makeMockEntity({ entity_id: 'person.adrien', state: 'home', attributes: { friendly_name: 'Adrien' } }),
      'person.virginie': makeMockEntity({ entity_id: 'person.virginie', state: 'not_home', attributes: { friendly_name: 'Virginie' } }),
      'binary_sensor.smoke_salon': makeMockEntity({ entity_id: 'binary_sensor.smoke_salon', state: 'off' }),
      'binary_sensor.people_at_home': makeMockEntity({ entity_id: 'binary_sensor.people_at_home', state: 'on' }),
      'switch.sirene': makeMockEntity({ entity_id: 'switch.sirene', state: 'off' }),
      'cover.porte_garage': makeMockEntity({ entity_id: 'cover.porte_garage', state: 'closed' }),
      'lock.porte_garage': makeMockEntity({ entity_id: 'lock.porte_garage', state: 'locked' }),
      'automation.nuit': makeMockEntity({ entity_id: 'automation.nuit', state: 'off' }),
      'input_number.tempo': makeMockEntity({ entity_id: 'input_number.tempo', state: '10' }),
      'binary_sensor.lave_linge': makeMockEntity({ entity_id: 'binary_sensor.lave_linge', state: 'off' }),
      'binary_sensor.rinse_aid': makeMockEntity({ entity_id: 'binary_sensor.rinse_aid', state: 'off' }),
      'sensor.pellet': makeMockEntity({ entity_id: 'sensor.pellet', state: '75' }),
      'counter.stock': makeMockEntity({ entity_id: 'counter.stock', state: '5' }),
      'input_button.call_kids': makeMockEntity({ entity_id: 'input_button.call_kids', state: 'unknown' }),
    },
  });
}

/** Mount el in body, wait for Lit update, return the fired config. */
async function mountAndListen(
  el: any,
  action: (el: any) => void
): Promise<any> {
  document.body.appendChild(el);
  await el.updateComplete;

  let received: any = null;
  el.addEventListener('config-changed', (e: Event) => {
    received = (e as CustomEvent).detail.config;
  });

  action(el);

  return received;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('sci-fi-bridge-editor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── 1. setConfig + render de base ────────────────────────────────────────────

  describe('setConfig + render', () => {
    it('setConfig stores the config', () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      expect(el.config).to.deep.equal({ type: 'custom:sci-fi-bridge' });
    });

    it('renders with empty config (no crash)', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot).not.to.be.null;
    });

    it('renders with full config (no crash)', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        persons: [{ entity: 'person.adrien' }],
        alerts: {
          smoke: [{ entity: 'binary_sensor.smoke_salon', name: 'Salon' }],
          toggles: [{ entity: 'automation.nuit', name: 'Nuit' }],
          occupancy: 'binary_sensor.people_at_home',
        },
        access: { items: [{ entity: 'cover.porte_garage', name: 'Garage' }] },
        automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
        appliances: {
          cycles: [{ entity: 'binary_sensor.lave_linge', name: 'Lave-linge', icon: 'mdi:washing-machine' }],
          consumables: [{ entity: 'binary_sensor.rinse_aid', name: 'Liquide', ok_when: 'off' as const }],
        },
        stove: { pellet_quantity: 'sensor.pellet', pellet_stock: 'counter.stock', status: 'binary_sensor.smoke_salon' },
        vehicle: { power_sensor: 'sensor.pellet' },
        actions: { items: [{ entity: 'input_button.call_kids' }] },
      });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot).not.to.be.null;
    });
  });

  // ── 2. Persons (crew) ────────────────────────────────────────────────────────

  describe('Persons', () => {
    it('_togglePerson adds person and dispatches config-changed', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', persons: [] });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => {
        e._togglePerson('person.adrien');
      });

      expect(received).not.to.be.null;
      expect(received.persons).to.deep.equal([{ entity: 'person.adrien' }]);
    });

    it('_togglePerson called twice removes the person', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', persons: [] });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;

      const received: any[] = [];
      el.addEventListener('config-changed', (e: Event) => {
        received.push((e as CustomEvent).detail.config);
      });

      el._togglePerson('person.adrien');
      el._togglePerson('person.adrien');

      // Last dispatched config should have no person.adrien
      const last = received[received.length - 1];
      expect(last.persons.some((p: any) => p.entity === 'person.adrien')).to.be.false;
    });
  });

  // ── 3. Alerts ────────────────────────────────────────────────────────────────

  describe('Alerts', () => {
    it('_addSmoke dispatches config with smoke.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', alerts: { smoke: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addSmoke());

      expect(received).not.to.be.null;
      expect(received.alerts.smoke).to.have.length(1);
    });

    it('_removeSmoke(0) dispatches config without item at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        alerts: { smoke: [{ entity: 'binary_sensor.smoke_salon', name: 'Salon' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeSmoke(0));

      expect(received).not.to.be.null;
      // smoke becomes undefined when empty (or absent key)
      expect(received.alerts.smoke === undefined || received.alerts.smoke?.length === 0).to.be.true;
    });

    it('_updateSmoke(0, {entity}) dispatches config with smoke[0].entity updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        alerts: { smoke: [{ entity: 'binary_sensor.smoke_salon', name: 'Salon' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateSmoke(0, { entity: 'binary_sensor.new' })
      );

      expect(received.alerts.smoke[0].entity).to.equal('binary_sensor.new');
    });

    it('_addToggle dispatches config with toggles.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', alerts: { toggles: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addToggle());

      expect(received.alerts.toggles).to.have.length(1);
    });

    it('_removeToggle(0) dispatches config without toggle at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        alerts: { toggles: [{ entity: 'automation.nuit', name: 'Nuit' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeToggle(0));

      expect(received.alerts.toggles === undefined || received.alerts.toggles?.length === 0).to.be.true;
    });

    it('_updateToggle(0, {entity}) dispatches config with toggle[0].entity updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        alerts: { toggles: [{ entity: 'automation.nuit', name: 'Nuit' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateToggle(0, { entity: 'auto.new' })
      );

      expect(received.alerts.toggles[0].entity).to.equal('auto.new');
    });

    it('_updateAlerts dispatches config with alerts.occupancy set', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', alerts: {} });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateAlerts({ occupancy: 'binary_sensor.x' })
      );

      expect(received.alerts.occupancy).to.equal('binary_sensor.x');
    });
  });

  // ── 4. Access ────────────────────────────────────────────────────────────────

  describe('Access', () => {
    it('_addAccessItem dispatches config with access.items.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', access: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addAccessItem());

      expect(received.access.items).to.have.length(1);
    });

    it('_removeAccessItem(0) dispatches config without item at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        access: { items: [{ entity: 'cover.porte_garage', name: 'Garage' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeAccessItem(0));

      expect(received.access.items).to.have.length(0);
    });

    it('_updateAccessItem(0, {entity}) dispatches config with item[0].entity updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        access: { items: [{ entity: 'cover.porte_garage', name: 'Garage' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateAccessItem(0, { entity: 'cover.new' })
      );

      expect(received.access.items[0].entity).to.equal('cover.new');
    });
  });

  // ── 5. Automations ───────────────────────────────────────────────────────────

  describe('Automations', () => {
    it('_addAutoItem dispatches config with automations.items.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', automations: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addAutoItem());

      expect(received.automations.items).to.have.length(1);
    });

    it('_removeAutoItem(0) dispatches config without item at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeAutoItem(0));

      expect(received.automations.items).to.have.length(0);
    });

    it('_updateAutoItem(0, {entity}) dispatches config with item[0].entity updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        automations: { items: [{ entity: 'automation.nuit', name: 'Nuit', type: 'toggle' as const }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateAutoItem(0, { entity: 'auto.new' })
      );

      expect(received.automations.items[0].entity).to.equal('auto.new');
    });
  });

  // ── 6. Appliances ────────────────────────────────────────────────────────────

  describe('Appliances', () => {
    it('_addCycle dispatches config with appliances.cycles.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', appliances: { cycles: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addCycle());

      expect(received.appliances.cycles).to.have.length(1);
    });

    it('_removeCycle(0) dispatches config without cycle at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        appliances: { cycles: [{ entity: 'binary_sensor.lave_linge', name: 'Lave-linge', icon: 'mdi:washing-machine' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeCycle(0));

      expect(received.appliances.cycles).to.have.length(0);
    });

    it('_addConsumable dispatches config with appliances.consumables.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', appliances: { cycles: [], consumables: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addConsumable());

      expect(received.appliances.consumables).to.have.length(1);
    });

    it('_removeConsumable(0) dispatches config without consumable at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        appliances: {
          cycles: [],
          consumables: [{ entity: 'binary_sensor.rinse_aid', name: 'Liquide', ok_when: 'off' as const }],
        },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeConsumable(0));

      // consumables becomes undefined when empty
      expect(received.appliances.consumables === undefined || received.appliances.consumables?.length === 0).to.be.true;
    });
  });

  // ── 7. Sections enable / disable ─────────────────────────────────────────────

  describe('Section enable/disable', () => {
    it('_enableSection("alerts") dispatches config with alerts initialized', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._enableSection('alerts', {}));

      expect(received.alerts).not.to.be.undefined;
    });

    it('_disableSection("alerts") dispatches config with alerts === undefined', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', alerts: { smoke: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('alerts'));

      expect(received.alerts).to.be.undefined;
    });

    it('_enableSection("stove") dispatches config with stove initialized', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._enableSection('stove', { pellet_quantity: '', pellet_stock: '', status: '' })
      );

      expect(received.stove).not.to.be.undefined;
      expect(received.stove.pellet_quantity).to.equal('');
    });

    it('_enableSection("persons") dispatches config with persons = []', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._enableSection('persons', []));

      expect(received.persons).to.deep.equal([]);
    });

    it('_disableSection("persons") dispatches config without persons key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', persons: [] });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('persons'));

      expect(received.persons).to.be.undefined;
    });

    it('_enableSection("access") dispatches config with access.items = []', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._enableSection('access', { items: [] }));

      expect(received.access).to.deep.equal({ items: [] });
    });

    it('_disableSection("access") dispatches config without access key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', access: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('access'));

      expect(received.access).to.be.undefined;
    });
  });

  // ── 8. Actions ───────────────────────────────────────────────────────────────

  describe('Actions', () => {
    it('_addAction dispatches config with actions.items.length + 1', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', actions: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._addAction());

      expect(received.actions.items).to.have.length(1);
    });

    it('_removeAction(0) dispatches config without action at index 0', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        actions: { items: [{ entity: 'input_button.call_kids' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._removeAction(0));

      expect(received.actions.items).to.have.length(0);
    });

    it('_updateAction(0, {entity}) dispatches config with item[0].entity updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        actions: { items: [{ entity: 'input_button.call_kids' }] },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateAction(0, { entity: 'script.new' })
      );

      expect(received.actions.items[0].entity).to.equal('script.new');
    });

    it('_enableSection("actions") dispatches config with actions initialized', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._enableSection('actions', { items: [] }));

      expect(received.actions).to.deep.equal({ items: [] });
    });

    it('_disableSection("actions") dispatches config without actions key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', actions: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('actions'));

      expect(received.actions).to.be.undefined;
    });
  });

  // ── 9. Stove ─────────────────────────────────────────────────────────────────

  describe('Stove', () => {
    it('_enableSection("stove") dispatches config with stove section initialized', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._enableSection('stove', { pellet_quantity: '', pellet_stock: '', status: '' })
      );

      expect(received.stove).not.to.be.undefined;
      expect(received.stove.pellet_quantity).to.equal('');
    });

    it('_disableSection("stove") dispatches config without stove key', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        stove: { pellet_quantity: 'sensor.pellet', pellet_stock: 'counter.stock', status: 'binary_sensor.smoke_salon' },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('stove'));

      expect(received.stove).to.be.undefined;
    });

    it('renders stove section when stove is in config', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        stove: { pellet_quantity: 'sensor.pellet', pellet_stock: 'counter.stock', status: 'binary_sensor.smoke_salon' },
      });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot).not.to.be.null;
    });
  });

  // ── 10. Vehicle ───────────────────────────────────────────────────────────────

  describe('Vehicle', () => {
    it('_enableSection("vehicle") dispatches config with vehicle section initialized', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._enableSection('vehicle', { power_sensor: '' })
      );

      expect(received.vehicle).not.to.be.undefined;
      expect(received.vehicle.power_sensor).to.equal('');
    });

    it('_disableSection("vehicle") dispatches config without vehicle key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', vehicle: { power_sensor: 'sensor.pellet' } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('vehicle'));

      expect(received.vehicle).to.be.undefined;
    });

    it('renders vehicle section when vehicle is in config', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', vehicle: { power_sensor: 'sensor.pellet' } });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot).not.to.be.null;
    });
  });

  // ── 12. Appliances (additional) ───────────────────────────────────────────────

  describe('Appliances (additional)', () => {
    it('_updateCycle(0, patch) dispatches config with cycle[0] updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        appliances: {
          cycles: [{ entity: 'binary_sensor.lave_linge', name: 'Lave-linge', icon: 'mdi:washing-machine' }],
        },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateCycle(0, { entity: 'binary_sensor.new' })
      );

      expect(received.appliances.cycles[0].entity).to.equal('binary_sensor.new');
    });

    it('_updateConsumable(0, patch) dispatches config with consumable[0] updated', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        appliances: {
          cycles: [],
          consumables: [{ entity: 'binary_sensor.rinse_aid', name: 'Liquide', ok_when: 'off' as const }],
        },
      });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._updateConsumable(0, { entity: 'binary_sensor.new_consumable' })
      );

      expect(received.appliances.consumables[0].entity).to.equal('binary_sensor.new_consumable');
    });

    it('_enableSection("appliances") dispatches config with appliances section', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._enableSection('appliances', { cycles: [] })
      );

      expect(received.appliances).to.deep.equal({ cycles: [] });
    });

    it('_disableSection("appliances") dispatches config without appliances key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', appliances: { cycles: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('appliances'));

      expect(received.appliances).to.be.undefined;
    });
  });

  // ── 13. Automations (additional) ─────────────────────────────────────────────

  describe('Automations (additional)', () => {
    it('_enableSection("automations") dispatches config with automations.items = []', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge' });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) =>
        e._enableSection('automations', { items: [] })
      );

      expect(received.automations).to.deep.equal({ items: [] });
    });

    it('_disableSection("automations") dispatches config without automations key', async () => {
      const el = makeEditorEl();
      el.setConfig({ type: 'custom:sci-fi-bridge', automations: { items: [] } });
      el.hass = makeEditorHass();

      const received = await mountAndListen(el, (e) => e._disableSection('automations'));

      expect(received.automations).to.be.undefined;
    });

    it('renders slider-specific fields when item type is slider', async () => {
      const el = makeEditorEl();
      el.setConfig({
        type: 'custom:sci-fi-bridge',
        automations: {
          items: [{ entity: 'input_number.tempo', name: 'Tempo', type: 'slider' as const, min: 0, max: 60, step: 5, unit: 'min' }],
        },
      });
      el.hass = makeEditorHass();
      document.body.appendChild(el);
      await el.updateComplete;
      // No crash = success; slider fields rendered inside editor accordion
      expect(el.shadowRoot).not.to.be.null;
    });
  });
});
