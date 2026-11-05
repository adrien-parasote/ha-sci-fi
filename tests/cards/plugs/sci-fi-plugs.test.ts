 
// @vitest-environment happy-dom
/**
 * Tests RED — Spec 13 § Plugs Card Design Update
 * TC-PLUGS-U-1301 → TC-PLUGS-U-1315 + IT-PLUGS-I-1301 → IT-PLUGS-I-1303 + Consolidated Extended Tests
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { readFileSync } from 'node:fs';
import { blankComments } from '../../helpers/blank-comments.js';
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

  // ── Static tests (TC-PLUGS-U-1301, TC-PLUGS-U-1302) ───────────────────────────────────────

  it('TC-PLUGS-U-1301 — provides getConfigElement', () => {
    const el = SciFiPlugsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
  });

  it('TC-PLUGS-U-1302 — provides getStubConfig', () => {
    const config = SciFiPlugsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-plugs');
  });

  // ── Without hass (TC-PLUGS-U-1303) ─────────────────────────────────────────────────

  it('TC-PLUGS-U-1303 — renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (el as any).setConfig(SciFiPlugsCard.getStubConfig());
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  // ── Empty devices (TC-PLUGS-U-1304) ───────────────────────────────────────────────

  it('TC-PLUGS-U-1304 — renders empty when no devices', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [] });
    // No header or footer — card body is essentially empty
    expect(el.shadowRoot!.querySelector('.header')).to.be.null;
    expect(el.shadowRoot!.querySelector('.footer')).to.be.null;
  });

  // ── Header (TC-PLUGS-U-1305, TC-PLUGS-U-1306) ─────────────────────────────────────────────

  it('TC-PLUGS-U-1305 — header shows plug name', async () => {
    const el = await mountCard({
      type: 'custom:sci-fi-plugs',
      devices: [DEVICE_TV],
    });
    const title = el.shadowRoot!.querySelector('.header .title');
    expect(title).to.not.be.null;
    expect(title!.textContent).to.include('TV Plug');
  });

  it('TC-PLUGS-U-1306 — header icon has "on" class when plug is ON, absent when OFF', async () => {
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

  // ── Image zone (TC-PLUGS-U-1307, TC-PLUGS-U-1308) ─────────────────────────────────────────

  it('TC-PLUGS-U-1307 — image zone present in content', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    expect(el.shadowRoot!.querySelector('.image')).to.not.be.null;
  });

  it('TC-PLUGS-U-1308 — click on image triggers toggle (ON → turn_off)', async () => {
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

  // ── Footer navigation (TC-PLUGS-U-1309, TC-PLUGS-U-1310, TC-PLUGS-U-1311, TC-PLUGS-U-1312, TC-PLUGS-U-1313) ────────

  it('TC-PLUGS-U-1309 — footer prev/next containers have .hide class for single plug', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    const footer = el.shadowRoot!.querySelector('.footer');
    expect(footer).to.not.be.null;
    const hiddenDivs = footer!.querySelectorAll('.hide');
    expect(hiddenDivs.length).to.be.greaterThanOrEqual(2);
  });

  it('TC-PLUGS-U-1310 — footer prev/next containers have no .hide for multiple plugs', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] });
    const footer = el.shadowRoot!.querySelector('.footer');
    expect(footer).to.not.be.null;
    // Nav wrappers should NOT have .hide class
    const navDivs = Array.from(footer!.children).filter(
      c => !c.classList.contains('number')
    );
    expect(navDivs.every(d => !d.classList.contains('hide'))).to.be.true;
  });

  it('TC-PLUGS-U-1311 — footer selector buttons count matches devices', async () => {
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

  it('TC-PLUGS-U-1312 — prev navigation wraps from idx 0 to last', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] });
    // Initial: idx 0 → TV Plug
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV Plug');

    // Click prev → wraps to idx 1 (Lamp Plug)
    const prevBtn = el.shadowRoot!.querySelector('.footer sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    prevBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')!.textContent).to.include('Lamp Plug');
  });

  it('TC-PLUGS-U-1313 — next navigation wraps from last to idx 0', async () => {
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

  // ── Sensors (TC-PLUGS-U-1314) ─────────────────────────────────────────────────────

  it('TC-PLUGS-U-1314, TC-505 — sensor list rendered for visible sensors (non-power)', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    // sensor.tv_energy has show: true and power: false → should appear in .sensors
    const sensorRows = el.shadowRoot!.querySelectorAll('.sensors .sensor');
    expect(sensorRows.length).to.be.greaterThan(0);
    // The energy sensor value should be visible
    expect(el.shadowRoot!.textContent).to.include('1.2');
  });

  // ── Regression (TC-PLUGS-U-1315) ──────────────────────────────────────────────────

  it('TC-PLUGS-U-1315 — regression: getConfigElement and getStubConfig still work', () => {
    expect(SciFiPlugsCard.getConfigElement().tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
    expect(SciFiPlugsCard.getStubConfig().type).to.equal('custom:sci-fi-plugs');
  });

  // ── Integration tests ─────────────────────────────────────────────────────

  it('IT-PLUGS-I-1301 — card registers in customElements', () => {
    expect(customElements.get('sci-fi-plugs')).to.not.be.undefined;
  });

  it('IT-PLUGS-I-1302 — full render: header + content + footer all present', async () => {
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    expect(el.shadowRoot!.querySelector('.header')).to.not.be.null;
    expect(el.shadowRoot!.querySelector('.content')).to.not.be.null;
    expect(el.shadowRoot!.querySelector('.footer')).to.not.be.null;
  });

  // Mutant: an inline css`` block added to sci-fi-plugs.ts
  it('TC-BTG-U-15: IT-PLUGS-I-1303 — plugs/styles.ts exported: no inline css` in sci-fi-plugs.ts', async () => {
    // Source scan (stated exception): comments blanked, css tagged templates counted.
    const source = blankComments(readFileSync('src/cards/plugs/sci-fi-plugs.ts', 'utf8'));
    expect(source.match(/css`/g) ?? []).toHaveLength(0);

    // Class-level check: the card's styles array carries plugStyles next to the common sheet.
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
    expect(el.shadowRoot!.innerHTML).to.not.be.empty;
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
    // switch.tv is absent but the lamp exists: partial absence keeps the card (config-error-card FR-10)
    const states = { ...hass.states, 'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'on' }) };
    const el = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV, DEVICE_LAMP] }, { ...hass, states });
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

// ── Private chart method unit tests ─────────────────────────────────────────

describe('sci-fi-plugs — Chart Private Methods', () => {
  let el: SciFiPlugsCard;

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  async function mountPlugWithPowerSensor(): Promise<SciFiPlugsCard> {
    const device = {
      device_id: 'p1',
      entity_id: 'switch.tv',
      name: 'TV',
      sensors: {
        'sensor.tv_power': { power: true, show: true },
      },
    };
    const hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: '45', attributes: { unit_of_measurement: 'W' } }),
      },
    });
    const card = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (card as any).setConfig({ type: 'custom:sci-fi-plugs', devices: [device] });
    card.hass = hass;
    document.body.appendChild(card);
    await card.updateComplete;
    el = card;
    return card;
  }

  // ── _parseHistory (lines 426-437) ─────────────────────────────────────────

  // FR-8 (plugs-history-states): a non-finite state is dropped, never mapped to 0.
  it('_parseHistory keeps every finite point and drops non-finite ones', async () => {
    await mountPlugWithPowerSensor();
    const now = new Date();
    const t1 = new Date(now.getTime() + 60000).toISOString();
    const t2 = new Date(now.getTime() + 120000).toISOString();
    const raw = [
      { last_changed: now.toISOString(), state: '10' },
      { last_changed: t1, state: '20.5' },
      { last_changed: t2, state: 'unavailable' },
    ];
    const vals = Object.values((el as any)._parseHistory(raw) as Record<string, number>);
    expect(vals).to.deep.equal([10, 20.5]);
  });

  it('_parseHistory keeps max value for duplicate timestamp buckets (line 435)', async () => {
    await mountPlugWithPowerSensor();
    const t = '2026-06-02T10:00:00.000Z';
    const raw = [
      { last_changed: t, state: '30' },
      { last_changed: t, state: '50' }, // same bucket → should keep 50
    ];
    const result = (el as any)._parseHistory(raw) as Record<string, number>;
    const vals = Object.values(result);
    expect(vals).to.include(50);
    expect(vals).not.to.include(30); // 30 is overwritten
  });

  // ── _buildChartDatasets (lines 440-452) ───────────────────────────────────

  it('_buildChartDatasets wraps data in a dataset array', async () => {
    await mountPlugWithPowerSensor();
    const datasets = (el as any)._buildChartDatasets([10, 20, 30]) as any[];
    expect(datasets).to.have.length(1);
    expect(datasets[0].data).to.deep.equal([10, 20, 30]);
    expect(datasets[0].fill).to.be.true;
  });

  // ── _buildChartLabels (lines 454-460) ─────────────────────────────────────

  it('_buildChartLabels: midnight → date only (line 457)', async () => {
    await mountPlugWithPowerSensor();
    // Create a local midnight by setting hours=0 in local time (not UTC)
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const midnight = d.toISOString();
    const labels = (el as any)._buildChartLabels([midnight]) as string[];
    // Midnight (local 00:00) → toLocaleDateString() only (no time appended)
    expect(labels[0]).to.equal(d.toLocaleDateString());
  });

  it('_buildChartLabels: non-midnight → date+time (line 458)', async () => {
    await mountPlugWithPowerSensor();
    const nonMidnight = new Date('2026-06-02T10:30:00.000Z').toISOString();
    const labels = (el as any)._buildChartLabels([nonMidnight]) as string[];
    // Non-midnight → includes '-' separator between date and time
    expect(labels[0]).to.include('-');
  });

  // ── History attempt record (FR-13: migrated from the removed per-index cache) ──

  it('_loadPowerChart records an empty attempt on empty history', async () => {
    const card = await mountPlugWithPowerSensor();
    (card as any).hass.callApi = vi.fn().mockResolvedValue([[]]);
    (card as any)._historyAttempts = new Map();
    await card.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    await card.updateComplete;
    expect((card as any)._historyAttempts.get('sensor.tv_power').status).to.equal('empty');
  });

  it('_loadPowerChart renders the error state, not a toast, on callApi error', async () => {
    const card = await mountPlugWithPowerSensor();
    const toastSpy = vi.spyOn(card as any, '_toast');
    (card as any).hass.callApi = vi.fn().mockRejectedValue(new Error('api error'));
    (card as any)._historyAttempts = new Map();
    await card.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('.history-error')).to.exist;
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('replays a seeded loaded attempt without calling callApi', async () => {
    const card = await mountPlugWithPowerSensor();
    const callApi = vi.fn();
    (card as any).hass.callApi = callApi;
    const drawSpy = vi.spyOn(card as any, '_drawChart');
    (card as any)._historyAttempts = new Map([
      ['sensor.tv_power', { status: 'loaded', token: 999, datasets: [{ data: [5, 10] }], labels: ['a', 'b'] }],
    ]);
    await card.updateComplete;
    expect(drawSpy).toHaveBeenCalledWith([{ data: [5, 10] }], ['a', 'b']);
    expect(callApi).not.toHaveBeenCalled();
  });

  // ── O5: edge cases plugs.md § Adversarial Fixes already demanded ──────────

  // TC-BTG-U-18 (audit, no new test): the four O5 mutants — no state class on the cable, no willUpdate bound,
  // _historyStart date-only, unavailable still clickable — each turn this suite red (checked on a scratch copy).
  describe('O5 — unavailable, animation and history window (regression)', () => {

    // plugs.md § Adversarial Fixes 1.
    it('renders an offline state and refuses to toggle an unavailable plug', async () => {
      const callService = vi.fn();
      const hass = makeMockHass({
        callService,
        states: {
          'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'unavailable', attributes: { friendly_name: 'Lamp' } }),
        },
      });
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_LAMP] }, hass);

      expect(card.shadowRoot!.querySelector('.offline-tag'), 'an offline marker must render').to.exist;
      (card.shadowRoot!.querySelector('.image') as HTMLElement).click();
      expect(callService).not.toHaveBeenCalled();
    });

    it('treats unknown like unavailable', async () => {
      const hass = makeMockHass({
        states: {
          'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'unknown', attributes: { friendly_name: 'Lamp' } }),
        },
      });
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_LAMP] }, hass);
      expect(card.shadowRoot!.querySelector('.offline-tag')).to.exist;
    });

    // Review round 1 (LOW): "disable interaction buttons" is plural — the
    // child-lock toggle and the select dropdown stayed live on an offline plug.
    it('disables the child-lock and select controls of an unavailable plug', async () => {
      const onLock = vi.fn();
      const device = {
        device_id: 'p1',
        entity_id: 'switch.lamp',
        name: 'Lamp',
        sensors: {
          'switch.lamp_child_lock': { name: 'Child lock', show: true },
          'select.lamp_memory': { name: 'Memory', show: true },
        },
      };
      const hass = makeMockHass({
        states: {
          'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'unavailable' }),
          'switch.lamp_child_lock': makeMockEntity({ entity_id: 'switch.lamp_child_lock', state: 'off' }),
          'select.lamp_memory': makeMockEntity({
            entity_id: 'select.lamp_memory',
            state: 'on',
            attributes: { options: ['on', 'off'] },
          }),
        },
      });
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);
      (card as any)._onLockToggle = onLock;

      const lockBtn = card.shadowRoot!.querySelector('.sensors sf-button-card') as any;
      const select = card.shadowRoot!.querySelector('.sensors sf-button-card-select') as any;
      expect(lockBtn, 'the child-lock control must render').to.exist;
      expect(select, 'the select control must render').to.exist;
      expect(lockBtn.hasAttribute('disabled')).to.be.true;
      expect(select.hasAttribute('disabled')).to.be.true;
      expect(select.items, 'an offline plug offers no options to pick').to.deep.equal([]);

      lockBtn.dispatchEvent(new CustomEvent('button-click'));
      expect(onLock).not.toHaveBeenCalled();
    });

    it('does not mark a reachable plug offline', async () => {
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
      expect(card.shadowRoot!.querySelector('.offline-tag')).to.be.null;
    });

    // plugs.md:522 — both cable containers carry the state class; only `.off`
    // stops the animation, so the left one animated on a plug that was off.
    it('marks both cable containers off when the plug is off', async () => {
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_LAMP] });
      const containers = card.shadowRoot!.querySelectorAll('.image .cirle-container');
      expect(containers.length).to.equal(2);
      for (const c of containers) {
        expect(c.classList.contains('off'), `${c.className} must be off`).to.be.true;
      }
    });

    // Review round 1: the `isUnavailable` arm of cableClass had no probe — its
    // mutant survived. An unreachable plug must not animate its cables either,
    // whatever its last known state said.
    it('stops both cable animations when the plug is unavailable', async () => {
      const hass = makeMockHass({
        states: {
          'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'unavailable', attributes: { friendly_name: 'Lamp' } }),
        },
      });
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_LAMP] }, hass);
      const containers = card.shadowRoot!.querySelectorAll('.image .cirle-container');
      expect(containers.length).to.equal(2);
      for (const c of containers) {
        expect(c.classList.contains('off'), `${c.className} must be off`).to.be.true;
      }
    });

    it('leaves both cable containers animated when the plug is on', async () => {
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
      const containers = card.shadowRoot!.querySelectorAll('.image .cirle-container');
      expect(containers.length).to.equal(2);
      for (const c of containers) {
        expect(c.classList.contains('off')).to.be.false;
      }
    });

    // F-PLG-D04: a bare YYYY-MM-DD means midnight yesterday, so the window was
    // 24 to 48 hours wide depending on the time of day — never 24 rolling hours.
    it('asks history for a rolling 24-hour window, not midnight yesterday', async () => {
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
      const start = new Date((card as any)._historyStart());
      const elapsedHours = (Date.now() - start.getTime()) / 3_600_000;
      expect(elapsedHours).to.be.greaterThan(23.9);
      expect(elapsedHours).to.be.lessThan(24.1);
    });

    // P21: shortening `devices` in the editor left the index out of bounds and
    // _renderHeader dereferenced undefined.
    it('clamps the selected plug when the device list shrinks', async () => {
      const card = await mountCard({
        type: 'custom:sci-fi-plugs',
        devices: [DEVICE_TV, DEVICE_LAMP],
      });
      (card as any)._selected_plug_id = 1;
      await card.updateComplete;

      (card as any).setConfig({ type: 'custom:sci-fi-plugs', devices: [DEVICE_TV] });
      card.requestUpdate();
      await card.updateComplete;

      expect((card as any)._selected_plug_id).to.equal(0);
      expect(card.shadowRoot!.querySelector('.sf-error-card')).to.be.null;
      expect(card.shadowRoot!.querySelector('.header .title')!.textContent).to.include('TV');
    });

    // Review round 3 (LOW): `?disabled` is inert on both components, so the
    // class on the wrapper is what makes the control unclickable and dimmed.
    it('marks the offline controls inert, not merely disabled', async () => {
      const device = {
        device_id: 'p1',
        entity_id: 'switch.lamp',
        name: 'Lamp',
        sensors: { 'switch.lamp_child_lock': { name: 'Child lock', show: true } },
      };
      const hass = makeMockHass({
        states: {
          'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'unavailable' }),
          'switch.lamp_child_lock': makeMockEntity({ entity_id: 'switch.lamp_child_lock', state: 'off' }),
        },
      });
      const card = await mountCard({ type: 'custom:sci-fi-plugs', devices: [device] }, hass);

      const wrapper = card.shadowRoot!.querySelector('.sensors .sensor');
      expect(wrapper, 'the control must render').to.exist;
      expect(wrapper!.classList.contains('inert')).to.be.true;
    });

  });
});
