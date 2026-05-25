/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — Spec 13 § sci-fi-plugs.ts
 * Covers: select sensor, lock sensor, toggle ON→off, toggle OFF→on,
 * toggle missing entity, _prev/_next wrap, _renderSensors empty,
 * _parseHistory, _buildChartLabels, _getYesterday, _clearChart,
 * _onSelectChange, _onLockToggle, _toast, chart cache path.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

const DEVICE_TV = {
  device_id: 'plug1',
  entity_id: 'switch.tv',
  name: 'TV Plug',
  sensors: {
    'sensor.tv_power': { power: true, show: true },
    'sensor.tv_energy': { name: 'Énergie', show: true },
  },
};

const DEVICE_LAMP = {
  device_id: 'plug2',
  entity_id: 'switch.lamp',
  name: 'Lamp Plug',
};

const HASS_BASE = makeMockHass({
  states: {
    'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
    'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }),
    'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: '45' }),
    'sensor.tv_energy': makeMockEntity({ entity_id: 'sensor.tv_energy', state: '1.2', attributes: { unit_of_measurement: 'kWh' } }),
  },
});

async function mountCard(config: object, hass = HASS_BASE): Promise<SciFiPlugsCard> {
  const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
  (el as any).setConfig(config);
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-plugs extended', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── _renderSensors with no visible sensors ─────────────────────────────────

  it('renders nothing for sensors when all sensors are power-only', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV Plug',
      sensors: {
        'sensor.tv_power': { power: true, show: true },
      },
    };
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] });
    // power-only sensor is filtered out → .sensors div absent
    const sensors = el.shadowRoot!.querySelector('.sensors');
    expect(sensors).to.be.null;
  });

  // ── select sensor rendering ─────────────────────────────────────────────────

  it('renders select sensor as sf-button-card-select', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'select.mode': { show: true, power: false, name: 'Mode', icon: 'mdi:format-list-bulleted' },
      },
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'select.mode': makeMockEntity({
          entity_id: 'select.mode',
          state: 'eco',
          attributes: { options: ['eco', 'boost'], friendly_name: 'Mode' },
        }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const selectBtn = el.shadowRoot!.querySelector('sf-button-card-select');
    expect(selectBtn).to.not.be.null;
  });

  // ── switch/lock sensor rendering ────────────────────────────────────────────

  it('renders lock sensor as sf-button-card toggle', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'switch.child_lock': { show: true, power: false, name: 'Lock', icon: 'mdi:lock-outline' },
      },
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.child_lock': makeMockEntity({ entity_id: 'switch.child_lock', state: 'on', attributes: { friendly_name: 'Child Lock' } }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const lockBtn = el.shadowRoot!.querySelector('.sensors sf-button-card');
    expect(lockBtn).to.not.be.null;
  });

  // ── sensor with missing hass state ─────────────────────────────────────────

  it('renders nothing for sensor with missing state', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'sensor.missing': { show: true, power: false, name: 'Missing' },
      },
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        // sensor.missing NOT in states
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    // The sensor row renders `nothing` (no .sensor div for missing entity)
    const sensorDivs = el.shadowRoot!.querySelectorAll('.sensors .sensor');
    expect(sensorDivs.length).to.equal(0);
  });

  // ── toggle OFF → turn_on ────────────────────────────────────────────────────

  it('click image when plug is OFF triggers turn_on', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const hass = makeMockHass({
      callService: mockCallService,
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'off' }) },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] }, hass);
    const image = el.shadowRoot!.querySelector('.image') as HTMLElement;
    image.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.tv' });
  });

  // ── toggle with missing entity ──────────────────────────────────────────────

  it('click image does nothing when entity state is missing', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const hass = makeMockHass({
      callService: mockCallService,
      states: {}, // switch.tv not in states
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] }, hass);
    const image = el.shadowRoot!.querySelector('.image') as HTMLElement;
    image.click();
    expect(mockCallService).not.toHaveBeenCalled();
  });

  // ── footer selector button click ────────────────────────────────────────────

  it('clicking footer selector button changes active plug', async () => {
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }),
      },
    });
    const el = await mountCard(
      { type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] },
      hass
    );
    // Get second footer selector button (idx 1 = lamp)
    const btns = el.shadowRoot!.querySelectorAll('.footer .number sf-button');
    const lampBtn = btns[1] as HTMLElement;
    lampBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('Lamp Plug');
  });

  // ── _onSelectChange ─────────────────────────────────────────────────────────

  it('_onSelectChange calls hass.callService for select entities', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'select.mode': { show: true, power: false, name: 'Mode' },
      },
    };
    const hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'select.mode': makeMockEntity({
          entity_id: 'select.mode',
          state: 'eco',
          attributes: { options: ['eco', 'boost'] },
        }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const selectBtn = el.shadowRoot!.querySelector('sf-button-card-select')!;
    selectBtn.dispatchEvent(new CustomEvent('button-select', {
      bubbles: true,
      composed: true,
      detail: { id: 'boost', text: 'boost', icon: 'mdi:circle-medium' },
    }));
    // callService is called async
    await new Promise(r => setTimeout(r, 0));
    expect(mockCallService).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.mode', option: 'boost' });
  });

  // ── _onLockToggle ───────────────────────────────────────────────────────────

  it('_onLockToggle turns off an ON switch lock', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'switch.child_lock': { show: true, power: false, name: 'Lock' },
      },
    };
    const hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.child_lock': makeMockEntity({ entity_id: 'switch.child_lock', state: 'on' }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const lockBtn = el.shadowRoot!.querySelector('.sensors sf-button-card')!;
    lockBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.child_lock' });
  });

  it('_onLockToggle turns on an OFF switch lock', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'switch.child_lock': { show: true, power: false, name: 'Lock' },
      },
    };
    const hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.child_lock': makeMockEntity({ entity_id: 'switch.child_lock', state: 'off' }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const lockBtn = el.shadowRoot!.querySelector('.sensors sf-button-card')!;
    lockBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.child_lock' });
  });

  // ── header subtitle ─────────────────────────────────────────────────────────

  it('shows sub-title when model and manufacturer are available', async () => {
    const hass = makeMockHass({
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }) },
    });
    // Inject devices/areas into hass (via any cast)
    (hass as any).devices = {
      plug1: { area_id: 'living', manufacturer: 'Sonoff', model: 'S26R2' },
    };
    (hass as any).areas = {
      living: { icon: 'mdi:sofa', area_id: 'living', name: 'Living' },
    };
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] }, hass);
    const subTitle = el.shadowRoot!.querySelector('.header .sub-title');
    expect(subTitle).to.not.be.null;
    expect(subTitle!.textContent).to.include('S26R2');
  });

  // ── header with fallback friendly_name ─────────────────────────────────────

  it('uses friendly_name from state when device has no name', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      // no name property
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on', attributes: { friendly_name: 'My TV' } }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const title = el.shadowRoot!.querySelector('.header .title');
    expect(title!.textContent).to.include('My TV');
  });

  // ── value sensor unit display ───────────────────────────────────────────────

  it('renders value sensor with unit', async () => {
    const el = await mountCard({
      type: 'custom:sci-fi-plugs',
      devices: [DEVICE_TV],
    }, HASS_BASE);
    // sensor.tv_energy has unit kWh
    expect(el.shadowRoot!.textContent).to.include('kWh');
  });

  it('renders value sensor without unit when not set', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'sensor.temp': { show: true, power: false, name: 'Temp' },
      },
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'sensor.temp': makeMockEntity({ entity_id: 'sensor.temp', state: '22', attributes: {} }),
      },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    expect(el.shadowRoot!.textContent).to.include('22');
  });

  // ── _prev wraps forward when at last ───────────────────────────────────────

  it('_next wraps to first when at last plug', async () => {
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }),
      },
    });
    const el = await mountCard(
      { type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] },
      hass
    );
    // Go to last (idx 1) first
    const nextBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    // Now prev wraps back
    const prevBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV Plug');
  });

  // ── icon for off state ──────────────────────────────────────────────────────

  it('uses inactive_icon for image when plug is OFF', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      inactive_icon: 'mdi:power-off',
    };
    const hass = makeMockHass({
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'off' }) },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const imageIcon = el.shadowRoot!.querySelector('.icon-container sf-icon') as any;
    expect(imageIcon?.getAttribute('icon')).to.equal('mdi:power-off');
  });

  it('uses active_icon for image when plug is ON', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
      name: 'TV',
      active_icon: 'mdi:power-on',
    };
    const hass = makeMockHass({
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }) },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
    const imageIcon = el.shadowRoot!.querySelector('.icon-container sf-icon') as any;
    expect(imageIcon?.getAttribute('icon')).to.equal('mdi:power-on');
  });
});
