 
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVacuumCard } from '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { blankComments } from '../../helpers/blank-comments.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEl(): SciFiVacuumCard {
  return document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
}

function setConfig(el: SciFiVacuumCard, cfg: object): void {
  (el as any).setConfig(cfg);
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('sci-fi-vacuum', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── Static tests (TC-VACUUM-U-1501, TC-VACUUM-U-1502) ─────────────────────────────────────

  it('TC-VACUUM-U-1501 — provides getConfigElement', () => {
    const el = SciFiVacuumCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vacuum-editor');
  });

  it('TC-VACUUM-U-1502 — provides getStubConfig', () => {
    const config = SciFiVacuumCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vacuum');
    // ADR-005: entity (not entity_id)
    expect(config.vacuums[0]!.entity).to.equal('vacuum.robot');
  });

  // ── TC-VACUUM-U-1503 — no hass ───────────────────────────────────────────────────

  it('TC-VACUUM-U-1503 — renders gracefully without hass', async () => {
    const el = makeEl();
    document.body.appendChild(el);
    setConfig(el, SciFiVacuumCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  // ── TC-VACUUM-U-1504 — empty vacuums list ────────────────────────────────────────

  it('TC-VACUUM-U-1504 — renders empty card when no vacuums configured', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [] });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    // No .container, or no .header — layout not rendered
    expect(el.shadowRoot!.querySelector('.header')).to.be.null;
  });

  // ── TC-VACUUM-U-1505 — header shows vacuum name ──────────────────────────────────

  it('TC-VACUUM-U-1505 — header shows vacuum friendly_name', async () => {
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

  // ── TC-VACUUM-U-1506 — header shows fan speed ────────────────────────────────────

  it('TC-VACUUM-U-1506 — header shows fan speed from entity attributes', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning', attributes: { fan_speed: 'Standard' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const select = el.shadowRoot!.querySelector('.header .infoH sf-dropdown');
    expect(select?.getAttribute('text')).to.equal('Standard');
  });

  // ── TC-VACUUM-U-1507 — sub-header DOCKED class ───────────────────────────────────

  it('TC-VACUUM-U-1507 — sub-header sf-icon has class DOCKED for docked state', async () => {
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

  // ── TC-VACUUM-U-1508 — sub-header CLEAN class ────────────────────────────────────

  it('TC-VACUUM-U-1508 — sub-header sf-icon has class CLEAN for cleaning state', async () => {
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

  // ── TC-VACUUM-U-1509 — sub-header ALERT class ────────────────────────────────────

  it('TC-VACUUM-U-1509 — sub-header sf-icon has class ALERT for error state', async () => {
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

  // ── TC-VACUUM-U-1510 — info renders current_clean_area ───────────────────────────

  it('TC-VACUUM-U-1510 — info renders current_clean_area sensor', async () => {
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

  // ── TC-VACUUM-U-1511 — info absent when no info sensors ──────────────────────────

  it('TC-VACUUM-U-1511 — info section absent when no info sensors configured', async () => {
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

  // ── TC-VACUUM-U-1512 — map image rendered ────────────────────────────────────────

  it('TC-VACUUM-U-1512 — map image rendered when map entity present', async () => {
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

  // ── TC-VACUUM-U-1513 — map fallback text ─────────────────────────────────────────

  it('TC-VACUUM-U-1513 — map fallback text rendered when no map sensor configured', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    const hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    (hass as any).locale = { language: 'en' };
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    const mapContent = el.shadowRoot!.querySelector('.map .map-content');
    expect(mapContent).not.to.be.null;
    expect(mapContent?.textContent).to.include('No map defined');
  });

  // ── TC-VACUUM-U-1514 — actions: 4 sf-buttons rendered (set_fan_speed is header-only) ────

  it('TC-VACUUM-U-1514 — actions: 4 sf-button in .actions .default when all enabled', async () => {
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

  // ── TC-VACUUM-U-1515 — actions: disabled action not rendered ─────────────────

  it('TC-VACUUM-U-1515 — actions: 3 sf-button when start disabled', async () => {
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

  // ── TC-VACUUM-U-1516 — action sf-button click calls vacuum service ───────────────

  it('TC-VACUUM-U-1516 — action sf-button click calls vacuum service', async () => {
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

  // ── TC-VACUUM-U-1517 — shortcuts: sf-button per shortcut rendered ────────────────

  it('TC-VACUUM-U-1517 — shortcuts: sf-button per shortcut description rendered', async () => {
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

  // ── TC-VACUUM-U-1518 — shortcut sf-button click calls shortcut service ───────────

  it('TC-VACUUM-U-1518 — shortcut sf-button click calls shortcut service', async () => {
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

  // ── TC-VACUUM-U-1519 — devices bar absent for single vacuum ───────────────────────

  it('TC-VACUUM-U-1519 — devices bar absent for single vacuum', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.devices')).to.be.null;
  });

  // ── TC-VACUUM-U-1520 — devices bar present for multiple vacuums ───────────────────

  it('TC-VACUUM-U-1520 — devices bar present with 2 dots for 2 vacuums', async () => {
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

  // ── TC-VACUUM-U-1521 — prev navigation wraps ─────────────────────────────────────

  it('TC-VACUUM-U-1521 — prev navigation wraps from 0 to last', async () => {
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

  // ── TC-VACUUM-U-1522 — next navigation wraps ─────────────────────────────────────

  it('TC-VACUUM-U-1522 — next navigation wraps from last to 0', async () => {
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

  // ── TC-VACUUM-U-1523 — toast success ──────────────────────────────────────────────

  it('TC-VACUUM-U-1523 — action sf-button triggers callService (toast feedback path)', async () => {
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

  // ── TC-VACUUM-U-1524 — malformed shortcut service ─────────────────────────────────

  it('TC-VACUUM-U-1524 — ignores shortcut click when service is malformed', async () => {
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

  // ── IT-VACUUM-I-1501 — customElements registration ───────────────────────────────

  it('IT-VACUUM-I-1501 — card registers in customElements', () => {
    expect(customElements.get('sci-fi-vacuum')).to.exist;
  });

  // ── IT-VACUUM-I-1502 — full render structure ─────────────────────────────────────

  it('IT-VACUUM-I-1502 — full render: header + sub-header + map + actions all present', async () => {
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

  // Mutant: add an inline css` block to sci-fi-vacuum.ts (or drop vacuumStyles from the class)
  it('TC-BTG-U-32 IT-VACUUM-I-1503 — no inline css template in sci-fi-vacuum.ts (comments blanked), vacuumStyles applied', async () => {
    // Exception stated by the spec (FR-6): a read of the card's main source file.
    const srcPath = resolve(process.cwd(), 'src/cards/vacuum/sci-fi-vacuum.ts');
    const code = blankComments(readFileSync(srcPath, 'utf8'));
    expect((code.match(/css`/g) ?? []).length).to.equal(0);
    // Class-level check kept: sciFiCommonStyles + vacuumStyles
    const styles = (SciFiVacuumCard as any).styles;
    expect(Array.isArray(styles)).to.be.true;
    expect(styles.length).to.be.greaterThan(1);
  });

  // ── TC-VACUUM-U-1525 — sf-dropdown present in header ──────────────────

  it('TC-VACUUM-U-1525 — sf-dropdown present in header when fan_speed_list non-empty', async () => {
    const el = makeEl();
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({
          entity_id: 'vacuum.bot',
          state: 'docked',
          attributes: {
            fan_speed: 'quiet',
            fan_speed_list: ['quiet', 'turbo'],
          },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const select = el.shadowRoot!.querySelector('.header sf-dropdown') as any;
    expect(select).not.to.be.null;
    expect(select.items.length).to.equal(2);
    // Active item has accent color
    const activeItem = select.items.find((i: any) => i.id === 'quiet');
    expect(activeItem.color).to.equal('var(--sf-accent-on, #00ff9d)');
  });

  // ── TC-VACUUM-U-1526 — Fan speed dropdown selection calls set_fan_speed service ──

  it('TC-VACUUM-U-1526 — Fan speed dropdown selection calls set_fan_speed service', async () => {
    const el = makeEl();
    const mockCallService = vi.fn().mockResolvedValue(undefined);
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: {
        'vacuum.bot': makeMockEntity({
          entity_id: 'vacuum.bot',
          state: 'cleaning',
          attributes: { fan_speed: 'balanced', fan_speed_list: ['silent', 'balanced', 'turbo'] },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const select = el.shadowRoot!.querySelector('.header sf-dropdown') as any;
    select?.dispatchEvent(new CustomEvent('dropdown-select', { detail: { id: 'turbo' } }));

    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'set_fan_speed', {
      entity_id: 'vacuum.bot',
      fan_speed: 'turbo',
    });
  });

  // ── F-VAC-D07 — error toast on callService rejection ──────────────────────

  it('test_O3_callAction_shows_error_toast_on_callService_rejection', async () => {
    const el = makeEl();
    const mockCallService = vi.fn().mockRejectedValue(new Error('service failed'));
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot', pause: false, stop: false, return_to_base: false }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const addMessage = vi.spyOn(el.shadowRoot!.querySelector('sf-toast') as any, 'addMessage');
    const btn = el.shadowRoot!.querySelector('.actions .default sf-button') as HTMLElement | null;
    btn?.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    // Flush microtask queue to let the rejected promise propagate
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockCallService).toHaveBeenCalled();
    // F-VAC-D07: the rejection reaches the toast as an error, with its message
    const body = el.shadowRoot!.querySelector('sf-toast')!.shadowRoot!.querySelector('.toast-body');
    expect(body?.textContent).toBe('service failed');
    expect(addMessage).toHaveBeenCalledWith('service failed', true);
  });

  // ── TC-VACUUM-U-1534 — _callShortcut: no sc.service → early return ────────────────

  it('TC-VACUUM-U-1534 — _callShortcut ignores click when shortcuts.service is absent', async () => {
    const el = makeEl();
    const mockCallService = vi.fn();
    setConfig(el, {
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        shortcuts: {
          // no service
          command: 'app_segment_clean',
          description: [{ name: 'Salon', segments: [16] }],
        } as any,
      }],
    });
    el.hass = makeMockHass({
      callService: mockCallService,
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    (el as any)._callShortcut(
      { entity: 'vacuum.bot', shortcuts: { command: 'clean', description: [{ segments: [1] }] } },
      0
    );
    expect(mockCallService).not.toHaveBeenCalled();
  });

  // ── TC-VACUUM-U-1535 — willUpdate: resets selected id if > vacuums length ──────────

  it('TC-VACUUM-U-1535 — willUpdate resets _vacuum_selected_id when vacuums list shrinks', async () => {
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

    // Navigate to last vacuum
    (el as any)._vacuum_selected_id = 1;

    // Shrink config to 1 vacuum
    setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.v1' }] });
    await el.updateComplete;

    // Should reset to 0
    expect((el as any)._vacuum_selected_id).to.equal(0);
  });
});

// ─── Header battery / mop blocks (TC-BTG-U-06, -07) and text rendering (TC-BTG-U-34) ───

async function mountHeader(
  sensors: Record<string, string>,
  extra: Record<string, ReturnType<typeof makeMockEntity>>,
  vacuumAttrs: Record<string, unknown> = {},
): Promise<SciFiVacuumCard> {
  const el = makeEl();
  setConfig(el, { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot', sensors }] });
  el.hass = makeMockHass({
    states: {
      'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked', attributes: vacuumAttrs }),
      ...extra,
    },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function battery(state: string, attributes: Record<string, unknown> = {}) {
  return { 'sensor.bat': makeMockEntity({ entity_id: 'sensor.bat', state, attributes }) };
}

function mop(state: string, attributes: Record<string, unknown> = {}) {
  return { 'sensor.mop': makeMockEntity({ entity_id: 'sensor.mop', state, attributes }) };
}

/** icon + text div of the header block whose icon has the given default/explicit icon name */
function block(el: SciFiVacuumCard, iconName: string) {
  const icon = el.shadowRoot!.querySelector(`.header .infoH sf-icon[icon="${iconName}"]`);
  return { icon, text: icon?.nextElementSibling ?? null };
}

describe('sci-fi-vacuum header battery and mop', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: `< 20` -> `<= 20`; `< 30` -> `<= 30`; swap the classes; drop the NaN guard
  it('TC-BTG-U-06 — battery: class thresholds, text with unit (unavailable% observed wart), icon, absent cases — TC-VACUUM-U-1537', async () => {
    const cases: Array<[string, string]> = [
      ['19.9', 'battery-critical'],
      ['20', 'battery-warn'],
      ['29.9', 'battery-warn'],
      ['30', ''],
      ['unavailable', ''],
      ['unknown', ''],
    ];
    for (const [state, cls] of cases) {
      const cel = await mountHeader({ battery: 'sensor.bat' }, battery(state));
      const { icon, text } = block(cel, 'mdi:battery');
      expect(icon, state).not.to.be.null;
      // The class is on both the sf-icon and the text div
      for (const node of [icon!, text!]) {
        expect(node.classList.contains('battery-critical'), state).to.equal(cls === 'battery-critical');
        expect(node.classList.contains('battery-warn'), state).to.equal(cls === 'battery-warn');
      }
      document.body.replaceChildren();
    }

    // Text: state + unit with no space (mutant: drop the unit; add a space). unavailable% is an observed wart.
    let el: SciFiVacuumCard;
    document.body.replaceChildren();
    el = await mountHeader({ battery: 'sensor.bat' }, battery('45', { unit_of_measurement: '%' }));
    expect(block(el, 'mdi:battery').text!.textContent).to.equal('45%');
    document.body.replaceChildren();

    el = await mountHeader({ battery: 'sensor.bat' }, battery('45'));
    expect(block(el, 'mdi:battery').text!.textContent).to.equal('45');
    document.body.replaceChildren();

    // Observed wart, pinned as is (no src change): the unit is appended even for a non-numeric state
    el = await mountHeader({ battery: 'sensor.bat' }, battery('unavailable', { unit_of_measurement: '%' }));
    expect(block(el, 'mdi:battery').text!.textContent).to.equal('unavailable%');

    // Icon: entity icon attribute, else mdi:battery (mutant: replace the default icon / ignore the entity icon)
    el = await mountHeader({ battery: 'sensor.bat' }, battery('50', { icon: 'mdi:battery-50' }));
    expect(block(el, 'mdi:battery-50').icon).not.to.be.null;
    expect(block(el, 'mdi:battery').icon).to.be.null;
    document.body.replaceChildren();
    el = await mountHeader({ battery: 'sensor.bat' }, battery('50'));
    expect(block(el, 'mdi:battery').icon).not.to.be.null;

    // Absent when the sensor is unset or the entity is missing (mutant: render the block anyway)
    document.body.replaceChildren();
    el = await mountHeader({}, battery('50'));
    expect(el.shadowRoot!.querySelectorAll('.header .infoH sf-icon').length).to.equal(0);
    document.body.replaceChildren();
    el = await mountHeader({ battery: 'sensor.bat' }, {});
    expect(el.shadowRoot!.querySelectorAll('.header .infoH sf-icon').length).to.equal(0);
    expect(el.shadowRoot!.querySelector('.header .infoH')).not.to.be.null;
  });

  // Mutant: swap with the battery default icon; append the unit; add a threshold class
  it('TC-BTG-U-07 — mop block: default icon mdi:water-opacity, text is the state alone, no class, absent cases — TC-VACUUM-U-1538', async () => {
    let el = await mountHeader({ mop_intensite: 'sensor.mop' }, mop('2', { unit_of_measurement: '%' }));
    const m = block(el, 'mdi:water-opacity');
    expect(m.icon).not.to.be.null;
    expect(block(el, 'mdi:battery').icon).to.be.null;
    expect(m.text!.textContent).to.equal('2');
    expect(m.icon!.className).to.equal('');
    expect(m.text!.className).to.equal('');
    document.body.replaceChildren();

    el = await mountHeader({ mop_intensite: 'sensor.mop' }, mop('10', { icon: 'mdi:water' }));
    expect(block(el, 'mdi:water').icon).not.to.be.null;
    expect(block(el, 'mdi:water-opacity').icon).to.be.null;

    // Absent when the sensor is unset or the entity is missing (mutant: render the mop block anyway)
    document.body.replaceChildren();
    el = await mountHeader({}, mop('2'));
    expect(el.shadowRoot!.querySelectorAll('.header .infoH sf-icon').length).to.equal(0);
    document.body.replaceChildren();
    el = await mountHeader({ mop_intensite: 'sensor.mop' }, {});
    expect(el.shadowRoot!.querySelectorAll('.header .infoH sf-icon').length).to.equal(0);
  });

  // Mutant: render the name or the unit through unsafeHTML
  it('TC-BTG-U-34 — friendly name and battery unit reach the DOM as text, never as markup', async () => {
    // Benign marker first: both fields reach the DOM in this state
    let el = await mountHeader(
      { battery: 'sensor.bat' },
      battery('45', { unit_of_measurement: 'UNITMARK' }),
      { friendly_name: 'NAMEMARK' },
    );
    expect(el.shadowRoot!.querySelector('.header .name')!.textContent).to.include('NAMEMARK');
    expect(block(el, 'mdi:battery').text!.textContent).to.equal('45UNITMARK');
    document.body.replaceChildren();

    const hostile = '<img src=x onerror=alert(1)>';
    el = await mountHeader(
      { battery: 'sensor.bat' },
      battery('45', { unit_of_measurement: hostile }),
      { friendly_name: hostile },
    );
    const root = el.shadowRoot!;
    expect(root.querySelectorAll('img').length).to.equal(0);
    expect(root.querySelector('.header .name')!.textContent).to.equal(hostile);
    expect(block(el, 'mdi:battery').text!.textContent).to.equal('45' + hostile);
  });
});
