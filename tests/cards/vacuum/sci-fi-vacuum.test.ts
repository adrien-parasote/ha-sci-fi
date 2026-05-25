/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVacuumCard } from '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEl(): SciFiVacuumCard {
  return document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
}

function setConfig(el: SciFiVacuumCard, cfg: object): void {
  (el as any).setConfig(cfg);
}

function clickSfButton(el: SciFiVacuumCard, selector: string): void {
  const btn = el.shadowRoot!.querySelector(selector) as HTMLElement | null;
  btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('sci-fi-vacuum', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── Static tests (TC-1501, TC-1502) ─────────────────────────────────────

  it('TC-1501 — provides getConfigElement', () => {
    const el = SciFiVacuumCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vacuum-editor');
  });

  it('TC-1502 — provides getStubConfig', () => {
    const config = SciFiVacuumCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vacuum');
    // ADR-005: entity (not entity_id)
    expect(config.vacuums[0]!.entity).to.equal('vacuum.robot');
  });

  // ── TC-1503 — no hass ───────────────────────────────────────────────────

  it('TC-1503 — renders gracefully without hass', async () => {
    const el = makeEl();
    document.body.appendChild(el);
    setConfig(el, SciFiVacuumCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  // ── TC-1504 — empty vacuums list ────────────────────────────────────────

  it('TC-1504 — renders empty card when no vacuums configured', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [] });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    // No .container, or no .header — layout not rendered
    expect(el.shadowRoot!.querySelector('.header')).to.be.null;
  });

  // ── TC-1505 — header shows vacuum name ──────────────────────────────────

  it('TC-1505 — header shows vacuum friendly_name', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked', attributes: { friendly_name: 'Robot 1' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const name = el.shadowRoot!.querySelector('.header .name');
    expect(name?.textContent).to.include('Robot 1');
  });

  // ── TC-1506 — header shows fan speed ────────────────────────────────────

  it('TC-1506 — header shows fan speed from entity attributes', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning', attributes: { fan_speed: 'Standard' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const infoH = el.shadowRoot!.querySelector('.header .infoH');
    expect(infoH?.textContent).to.include('Standard');
  });

  // ── TC-1507 — sub-header DOCKED class ───────────────────────────────────

  it('TC-1507 — sub-header sf-icon has class DOCKED for docked state', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('.sub-header sf-icon');
    expect(icon?.className).to.include('DOCKED');
  });

  // ── TC-1508 — sub-header CLEAN class ────────────────────────────────────

  it('TC-1508 — sub-header sf-icon has class CLEAN for cleaning state', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('.sub-header sf-icon');
    expect(icon?.className).to.include('CLEAN');
  });

  // ── TC-1509 — sub-header ALERT class ────────────────────────────────────

  it('TC-1509 — sub-header sf-icon has class ALERT for error state', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'error' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('.sub-header sf-icon');
    expect(icon?.className).to.include('ALERT');
  });

  // ── TC-1510 — info renders current_clean_area ───────────────────────────

  it('TC-1510 — info renders current_clean_area sensor', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', sensors: { current_clean_area: 'sensor.area' } }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }),
        'sensor.area': makeMockEntity({ entity_id: 'sensor.area', state: '18', attributes: { unit_of_measurement: 'm²' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const sensors = el.shadowRoot!.querySelectorAll('.info .sensor');
    expect(sensors.length).to.be.greaterThan(0);
    expect(el.shadowRoot!.textContent).to.include('18');
  });

  // ── TC-1511 — info absent when no info sensors ──────────────────────────

  it('TC-1511 — info section absent when no info sensors configured', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', sensors: { battery: 'sensor.bat' } }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }),
        'sensor.bat': makeMockEntity({ entity_id: 'sensor.bat', state: '80' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const info = el.shadowRoot!.querySelector('.info');
    expect(info).to.be.null;
  });

  // ── TC-1512 — map image rendered ────────────────────────────────────────

  it('TC-1512 — map image rendered when map entity present', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', sensors: { map: 'camera.map' } }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }),
        'camera.map': makeMockEntity({
          entity_id: 'camera.map',
          state: 'idle',
          attributes: { entity_picture: '/api/camera/map' },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('.map .image') as HTMLImageElement | null;
    expect(img).not.to.be.null;
    expect(img?.getAttribute('src')).to.equal('/api/camera/map');
  });

  // ── TC-1513 — map fallback text ─────────────────────────────────────────

  it('TC-1513 — map fallback text rendered when no map sensor configured', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const mapContent = el.shadowRoot!.querySelector('.map .map-content');
    expect(mapContent).not.to.be.null;
    expect(mapContent?.textContent).to.include('No map defined');
  });

  // ── TC-1514 — actions: 4 sf-buttons rendered (set_fan_speed is header-only) ────

  it('TC-1514 — actions: 4 sf-button in .actions .default when all enabled', async () => {
    const el = makeEl();
    // set_fan_speed is handled by the fan icon in the header, not the action bar
    // → only start, pause, stop, return_to_base appear (4 buttons)
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked', attributes: { fan_speed: 'Standard', fan_speed_list: ['Silent', 'Standard', 'Strong'] } }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.actions .default sf-button');
    expect(btns.length).to.equal(4);
  });

  // ── TC-1515 — actions: disabled action not rendered ─────────────────

  it('TC-1515 — actions: 3 sf-button when start disabled', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', start: false }],
    });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.actions .default sf-button');
    expect(btns.length).to.equal(3);
  });

  // ── TC-1516 — action sf-button click calls vacuum service ───────────────

  it('TC-1516 — action sf-button click calls vacuum service', async () => {
    const el = makeEl();
    const mockCallService = vi.fn().mockResolvedValue(undefined);
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', pause: false, stop: false, return_to_base: false, set_fan_speed: false }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Click first sf-button (start)
    const btn = el.shadowRoot!.querySelector('.actions .default sf-button') as HTMLElement | null;
    btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'start', { entity_id: 'vacuum.bot' });
  });

  // ── TC-1517 — shortcuts: sf-button per shortcut rendered ────────────────

  it('TC-1517 — shortcuts: sf-button per shortcut description rendered', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        shortcuts: {
          service: 'vacuum.send_command',
          command: 'app_segment_clean',
          description: [
            { name: 'Salon', segments: [16] },
            { name: 'Cuisine', icon: 'mdi:chef-hat', segments: [17, 18] },
          ],
        },
      }],
    });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.actions .shortcuts sf-button');
    expect(btns.length).to.equal(2);
  });

  // ── TC-1518 — shortcut sf-button click calls shortcut service ───────────

  it('TC-1518 — shortcut sf-button click calls shortcut service', async () => {
    const el = makeEl();
    const mockCallService = vi.fn().mockResolvedValue(undefined);
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        // Disable default actions so only shortcut buttons are in .shortcuts
        start: false, pause: false, stop: false, return_to_base: false, set_fan_speed: false,
        shortcuts: {
          service: 'vacuum.send_command',
          command: 'app_segment_clean',
          description: [{ name: 'Salon', segments: [16] }],
        },
      }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.actions .shortcuts sf-button') as HTMLElement | null;
    btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'send_command', {
      entity_id: 'vacuum.bot',
      command: 'app_segment_clean',
      params: [{ segments: [16] }],
    });
  });

  // ── TC-1519 — devices bar absent for single vacuum ───────────────────────

  it('TC-1519 — devices bar absent for single vacuum', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.devices')).to.be.null;
  });

  // ── TC-1520 — devices bar present for multiple vacuums ───────────────────

  it('TC-1520 — devices bar present with 2 dots for 2 vacuums', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.v1' }, { entity: 'vacuum.v2' }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.v1': makeMockEntity({ entity_id: 'vacuum.v1', state: 'docked' }),
        'vacuum.v2': makeMockEntity({ entity_id: 'vacuum.v2', state: 'cleaning' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const devices = el.shadowRoot!.querySelector('.devices');
    expect(devices).not.to.be.null;
    const dots = el.shadowRoot!.querySelectorAll('.devices .number > div');
    expect(dots.length).to.equal(2);
  });

  // ── TC-1521 — prev navigation wraps ─────────────────────────────────────

  it('TC-1521 — prev navigation wraps from 0 to last', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.v1' }, { entity: 'vacuum.v2' }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.v1': makeMockEntity({ entity_id: 'vacuum.v1', state: 'docked' }),
        'vacuum.v2': makeMockEntity({ entity_id: 'vacuum.v2', state: 'cleaning' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // At index 0, click chevron-left
    const prevBtn = el.shadowRoot!.querySelector('.devices sf-button[icon="mdi:chevron-left"]') as HTMLElement | null;
    prevBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;

    // Should wrap to index 1
    const activeDot = el.shadowRoot!.querySelector('.devices .number > div.active');
    const dots = el.shadowRoot!.querySelectorAll('.devices .number > div');
    expect(Array.from(dots).indexOf(activeDot!)).to.equal(1);
  });

  // ── TC-1522 — next navigation wraps ─────────────────────────────────────

  it('TC-1522 — next navigation wraps from last to 0', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.v1' }, { entity: 'vacuum.v2' }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.v1': makeMockEntity({ entity_id: 'vacuum.v1', state: 'docked' }),
        'vacuum.v2': makeMockEntity({ entity_id: 'vacuum.v2', state: 'cleaning' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Go to index 1 first via next
    const nextBtn = el.shadowRoot!.querySelector('.devices sf-button[icon="mdi:chevron-right"]') as HTMLElement | null;
    nextBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    // _vacuum_selected_id should now be 1
    expect((el as any)._vacuum_selected_id).to.equal(1);

    // Now click next again — should wrap to 0
    nextBtn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    // _vacuum_selected_id should wrap to 0
    expect((el as any)._vacuum_selected_id).to.equal(0);
  });

  // ── TC-1523 — toast success ──────────────────────────────────────────────

  it('TC-1523 — action sf-button triggers callService (toast feedback path)', async () => {
    const el = makeEl();
    const mockCallService = vi.fn().mockResolvedValue(undefined);
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', pause: false, stop: false, return_to_base: false, set_fan_speed: false }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.actions .default sf-button') as HTMLElement | null;
    btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;

    // callService must have been called with correct vacuum service
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'start', { entity_id: 'vacuum.bot' });
  });

  // ── TC-1524 — toast error ────────────────────────────────────────────────

  it('TC-1524 — ignores shortcut click when service is malformed', async () => {
    const el = makeEl();
    const mockCallService = vi.fn();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        shortcuts: {
          service: 'invalidsyntax', // no dot → split gives no service
          command: 'app_segment_clean',
          description: [{ name: 'Salon', segments: [16] }],
        },
      }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.actions .shortcuts sf-button') as HTMLElement | null;
    btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    expect(mockCallService).not.toHaveBeenCalled();
  });

  // ── IT-1501 — customElements registration ───────────────────────────────

  it('IT-1501 — card registers in customElements', () => {
    expect(customElements.get('sci-fi-vacuum')).to.exist;
  });

  // ── IT-1502 — full render structure ─────────────────────────────────────

  it('IT-1502 — full render: header + sub-header + map + actions all present', async () => {
    const el = makeEl();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        sensors: { map: 'camera.map' },
        shortcuts: { service: 'vacuum.send_command', command: 'clean', description: [{ name: 'Salon', segments: [1] }] },
      }],
    });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning', attributes: { fan_speed: 'Standard' } }),
        'camera.map': makeMockEntity({ entity_id: 'camera.map', state: 'idle', attributes: { entity_picture: '/api/map' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.header')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.sub-header')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.map')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.actions')).not.to.be.null;
  });

  // ── IT-1503 — no inline css` in sci-fi-vacuum.ts ────────────────────────

  it('IT-1503 — vacuumStyles imported from styles.ts (styles object exists on class)', async () => {
    // If styles.ts is correctly imported and vacuumStyles applied, the card
    // should have more than 1 CSSResult in its styles array (sciFiCommonStyles + vacuumStyles)
    const styles = (SciFiVacuumCard as any).styles;
    expect(Array.isArray(styles)).to.be.true;
    expect(styles.length).to.be.greaterThan(1);
  });
});
