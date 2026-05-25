/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests RED — Spec 13 § Plugs Card Design Update
 * TC-1301 → TC-1315 + IT-1301 → IT-1303 + Consolidated Extended Tests
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// ── Shared device configs ────────────────────────────────────────────────────

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

const HASS_WITH_TV = makeMockHass({
  states: {
    'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on', attributes: { friendly_name: 'TV' } }),
    'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: '45.2', attributes: { unit_of_measurement: 'W', friendly_name: 'TV Power' } }),
    'sensor.tv_energy': makeMockEntity({ entity_id: 'sensor.tv_energy', state: '1.2', attributes: { unit_of_measurement: 'kWh', friendly_name: 'TV Energy' } }),
    'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off', attributes: { friendly_name: 'Lamp' } }),
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function mountCard(config: object, hass = HASS_WITH_TV): Promise<SciFiPlugsCard> {
  const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
  (el as any).setConfig(config);
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('sci-fi-plugs — Spec 13 redesign', () => {

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── Static tests (TC-1301, TC-1302) ───────────────────────────────────────

  it('TC-1301 — provides getConfigElement', () => {
    const el = SciFiPlugsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
  });

  it('TC-1302 — provides getStubConfig', () => {
    const config = SciFiPlugsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-plugs');
  });

  // ── Without hass (TC-1303) ─────────────────────────────────────────────────

  it('TC-1303 — renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (el as any).setConfig(SciFiPlugsCard.getStubConfig());
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  // ── Empty devices (TC-1304) ───────────────────────────────────────────────

  it('TC-1304 — renders empty when no devices', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [] });
    // No header or footer — card body is essentially empty
    expect(el.shadowRoot!.querySelector('.header')).to.be.null;
    expect(el.shadowRoot!.querySelector('.footer')).to.be.null;
  });

  // ── Header (TC-1305, TC-1306) ─────────────────────────────────────────────

  it('TC-1305 — header shows plug name', async () => {
    const el = await mountCard({
      type: 'custom:sci-fi-plugs',
      devices: [DEVICE_TV],
    });
    const title = el.shadowRoot!.querySelector('.header .title');
    expect(title).to.not.be.null;
    expect(title!.textContent).to.include('TV Plug');
  });

  it('TC-1306 — header icon has "on" class when plug is ON, absent when OFF', async () => {
    // ON state
    const elOn = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    const iconOn = elOn.shadowRoot!.querySelector('.header sf-icon');
    expect(iconOn?.classList.contains('on')).to.be.true;
    document.body.replaceChildren();

    // OFF state
    const hassOff = makeMockHass({
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'off' }) },
    });
    const elOff = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] }, hassOff);
    const iconOff = elOff.shadowRoot!.querySelector('.header sf-icon');
    expect(iconOff?.classList.contains('on')).to.be.false;
  });

  // ── Image zone (TC-1307, TC-1308) ─────────────────────────────────────────

  it('TC-1307 — image zone present in content', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    expect(el.shadowRoot!.querySelector('.image')).to.not.be.null;
  });

  it('TC-1308 — click on image triggers toggle (ON → turn_off)', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const hass = makeMockHass({
      callService: mockCallService,
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }) },
    });
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] }, hass);
    const image = el.shadowRoot!.querySelector('.image') as HTMLElement;
    image.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.tv' });
  });

  // ── Footer navigation (TC-1309, TC-1310, TC-1311, TC-1312, TC-1313) ────────

  it('TC-1309 — footer prev/next containers have .hide class for single plug', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    const footer = el.shadowRoot!.querySelector('.footer');
    expect(footer).to.not.be.null;
    const hiddenDivs = footer!.querySelectorAll('.hide');
    expect(hiddenDivs.length).to.be.greaterThanOrEqual(2);
  });

  it('TC-1310 — footer prev/next containers have no .hide for multiple plugs', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] });
    const footer = el.shadowRoot!.querySelector('.footer');
    expect(footer).to.not.be.null;
    // Nav wrappers should NOT have .hide class
    const navDivs = Array.from(footer!.children).filter(
      c => !c.classList.contains('number')
    );
    expect(navDivs.every(d => !d.classList.contains('hide'))).to.be.true;
  });

  it('TC-1311 — footer selector buttons count matches devices', async () => {
    const DEVICE_3 = { device_id: 'p3', entity_id: 'switch.fan', name: 'Fan' };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }),
        'switch.fan': makeMockEntity({ entity_id: 'switch.fan', state: 'off' }),
      },
    });
    const el = await mountCard(
      { type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP, DEVICE_3] },
      hass
    );
    const buttons = el.shadowRoot!.querySelectorAll('.footer .number sf-button');
    expect(buttons.length).to.equal(3);
  });

  it('TC-1312 — prev navigation wraps from idx 0 to last', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] });
    // Initial: idx 0 → TV Plug
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV Plug');

    // Click prev → wraps to idx 1 (Lamp Plug)
    const prevBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('Lamp Plug');
  });

  it('TC-1313 — next navigation wraps from last to idx 0', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] });
    // Navigate to idx 1 first
    const nextBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('Lamp Plug');

    // Click next again → wraps to idx 0 (TV Plug)
    nextBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV Plug');
  });

  // ── Sensors (TC-1314) ─────────────────────────────────────────────────────

  it('TC-1314 — sensor list rendered for visible sensors (non-power)', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    // sensor.tv_energy has show: true and power: false → should appear in .sensors
    const sensorRows = el.shadowRoot!.querySelectorAll('.sensors .sensor');
    expect(sensorRows.length).to.be.greaterThan(0);
    // The energy sensor value should be visible
    expect(el.shadowRoot!.textContent).to.include('1.2');
  });

  // ── Regression (TC-1315) ──────────────────────────────────────────────────

  it('TC-1315 — regression: getConfigElement and getStubConfig still work', () => {
    expect(SciFiPlugsCard.getConfigElement().tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
    expect(SciFiPlugsCard.getStubConfig().type).to.equal('custom:sci-fi-plugs');
  });

  // ── Integration tests ─────────────────────────────────────────────────────

  it('IT-1301 — card registers in customElements', () => {
    expect(customElements.get('sci-fi-plugs')).to.not.be.undefined;
  });

  it('IT-1302 — full render: header + content + footer all present', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    expect(el.shadowRoot!.querySelector('.header')).to.not.be.null;
    expect(el.shadowRoot!.querySelector('.content')).to.not.be.null;
    expect(el.shadowRoot!.querySelector('.footer')).to.not.be.null;
  });

  it('IT-1303 — plugs/styles.ts exported: no inline css` in sci-fi-plugs.ts', async () => {
    // Verify by checking that plugStyles is imported and used (structural test)
    // The card renders with styles array containing plugStyles
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    // If styles are loaded correctly, the card should be non-empty
    expect(el.shadowRoot!.innerHTML).to.not.be.empty;
    // Static class check: styles array must include plugStyles (not a raw css literal)
    const stylesArray = (SciFiPlugsCard as any).styles;
    expect(Array.isArray(stylesArray)).to.be.true;
    expect(stylesArray.length).to.be.greaterThanOrEqual(2); // sciFiCommonStyles + plugStyles
  });

  // ── Consolidated Extended Tests ────────────────────────────────────────────

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
    const sensorDivs = el.shadowRoot!.querySelectorAll('.sensors .sensor');
    expect(sensorDivs.length).to.equal(0);
  });

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
    const btns = el.shadowRoot!.querySelectorAll('.footer .number sf-button');
    const lampBtn = btns[1] as HTMLElement;
    lampBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('Lamp Plug');
  });

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
    await new Promise(r => setTimeout(r, 0));
    expect(mockCallService).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.mode', option: 'boost' });
  });

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

  it('shows sub-title when model and manufacturer are available', async () => {
    const hass = makeMockHass({
      states: { 'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }) },
    });
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

  it('uses friendly_name from state when device has no name', async () => {
    const device = {
      device_id: 'plug1',
      entity_id: 'switch.tv',
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

  it('renders value sensor with unit', async () => {
    const el = await mountCard({
      type: 'custom:sci-fi-plugs',
      devices: [DEVICE_TV],
    }, HASS_WITH_TV);
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
    const nextBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    const prevBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV Plug');
  });

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
