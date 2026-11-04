 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';
import { makeMockHass, makeMockEntity, makeMockEntityEntry, makeMockFloor, makeMockArea } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

describe('sci-fi-climates', () => {
  it('provides getConfigElement', () => {
    const el = SciFiClimatesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-climates-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiClimatesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-climates');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    document.body.appendChild(el);
    el.setConfig(SciFiClimatesCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders climate tiles with various states', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());

    const mockCallService = vi.fn().mockResolvedValue({} as any);
    el.hass = makeMockHass({
      callService: mockCallService,
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
        'climate.chambre': makeMockEntityEntry({ entity_id: 'climate.chambre', domain: 'climate' }),
        'climate.sdb': makeMockEntityEntry({ entity_id: 'climate.sdb', domain: 'climate' }),
      },
      states: {
        'climate.salon': makeMockEntity({
          entity_id: 'climate.salon',
          state: 'heat',
          attributes: { friendly_name: 'Salon', current_temperature: 21.5, temperature: 22 }
        }),
        'climate.chambre': makeMockEntity({
          entity_id: 'climate.chambre',
          state: 'off',
          attributes: { current_temperature: null, temperature: null } // testing fallback --
        }),
        'climate.sdb': makeMockEntity({
          entity_id: 'climate.sdb',
          state: 'unknown',
          attributes: {}
        }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const radiators = el.shadowRoot!.querySelectorAll('sf-radiator');
    expect(radiators.length).to.equal(3);

    // Salon (Heat)
    const salonRadiator = radiators[0] as any;
    expect(salonRadiator.climateEntity.entity_id).to.equal('climate.salon');
    expect(salonRadiator.climateEntity.state).to.equal('heat');
    expect(salonRadiator.climateEntity.attributes.friendly_name).to.equal('Salon');

    // Chambre (Off, null temp)
    const chambreRadiator = radiators[1] as any;
    expect(chambreRadiator.climateEntity.entity_id).to.equal('climate.chambre');
    expect(chambreRadiator.climateEntity.state).to.equal('off');

    // SDB (Unknown state)
    const sdbRadiator = radiators[2] as any;
    expect(sdbRadiator.climateEntity.entity_id).to.equal('climate.sdb');
    expect(sdbRadiator.climateEntity.state).to.equal('unknown');

    // Test toggle / event triggers on set_temperature
    salonRadiator.dispatchEvent(new CustomEvent('change-temperature', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.salon', temperature: 22 }
    }));
    expect(mockCallService).toHaveBeenCalledWith('climate', 'set_temperature', { entity_id: 'climate.salon', temperature: 22 });

    // Test change-hvac-mode
    chambreRadiator.dispatchEvent(new CustomEvent('change-hvac-mode', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.chambre', mode: 'heat' }
    }));
    expect(mockCallService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { entity_id: 'climate.chambre', hvac_mode: 'heat' });

    // Test change-preset-mode
    salonRadiator.dispatchEvent(new CustomEvent('change-preset-mode', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.salon', mode: 'eco' }
    }));
    expect(mockCallService).toHaveBeenCalledWith('climate', 'set_preset_mode', { entity_id: 'climate.salon', preset_mode: 'eco' });

    // Test rejection/error toast handling
    const mockCallServiceReject = vi.fn().mockRejectedValue(new Error('Service failed'));
    el.hass.callService = mockCallServiceReject;

    salonRadiator.dispatchEvent(new CustomEvent('change-temperature', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.salon', temperature: 24 }
    }));

    chambreRadiator.dispatchEvent(new CustomEvent('change-hvac-mode', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.chambre', mode: 'heat' }
    }));

    salonRadiator.dispatchEvent(new CustomEvent('change-preset-mode', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.salon', mode: 'eco' }
    }));

    await new Promise(r => setTimeout(r, 10)); // Flush promises
  });

  it('renders header with winter season icon', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig({
      type: 'custom:sci-fi-climates',
      header: {
        display: true,
        icon_winter_state: 'mdi:thermometer-chevron-up',
        message_winter_state: 'Winter Mode'
      }
    } as any);
    el.hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
      },
      states: {
        'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'winter' }),
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'off' }) // not active
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('.actions sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('mdi:thermometer-chevron-up');
    expect(el.shadowRoot!.textContent).to.include('Winter Mode');
  });

  it('renders header with summer season icon', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig({
      type: 'custom:sci-fi-climates',
      header: {
        display: true,
        icon_summer_state: 'mdi:thermometer-chevron-down',
        message_summer_state: 'Summer Mode'
      }
    } as any);
    el.hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
      },
      states: {
        'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'summer' }),
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat' }) // active
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('.actions sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('mdi:thermometer-chevron-down');
  });

  it('TC-CLIMATES-U-002: respects entities_to_exclude config', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    (el as any).setConfig({ type: 'custom:sci-fi-climates', header: { display: false }, entities_to_exclude: ['climate.hidden'] });
    el.hass = makeMockHass({
      entities: {
        'climate.shown': makeMockEntityEntry({ entity_id: 'climate.shown', domain: 'climate' }),
        'climate.hidden': makeMockEntityEntry({ entity_id: 'climate.hidden', domain: 'climate' }),
      },
      states: {
        'climate.shown': makeMockEntity({ entity_id: 'climate.shown', state: 'heat' }),
        'climate.hidden': makeMockEntity({ entity_id: 'climate.hidden', state: 'heat' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const radiators = el.shadowRoot!.querySelectorAll('sf-radiator');
    expect(radiators.length).to.equal(1);
    expect(radiators[0]!.id).to.equal('climate.shown');
  });

  it('renders "Aucun radiateur" message when no climates exist', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());
    el.hass = makeMockHass({
      entities: {
        'light.salon': { entity_id: 'light.salon', area_id: 'living_room', device_id: null,
          disabled_by: null, domain: 'light', platform: 'hue', labels: [] },
      },
      states: {}
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Aucun radiateur configuré');
    const radiators = el.shadowRoot!.querySelectorAll('sf-radiator');
    expect(radiators.length).to.equal(0);
  });

  it('handles floor and area selection hexagon clicks and warns when sf-toast is missing', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());

    el.hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', area_id: 'living_room', domain: 'climate' }),
        'climate.chambre': makeMockEntityEntry({ entity_id: 'climate.chambre', area_id: 'bedroom', domain: 'climate' }),
      },
      states: {
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat', attributes: { current_temperature: 21.5 } }),
        'climate.chambre': makeMockEntity({ entity_id: 'climate.chambre', state: 'off', attributes: { current_temperature: 18.0 } }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Test console.warn when toast is missing first (on default selected ground floor / living_room area)
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const toast = el.shadowRoot!.querySelector('sf-toast')!;
    toast.remove();

    const salonRadiator = el.shadowRoot!.querySelector('sf-radiator') as any;
    expect(salonRadiator).to.exist;
    salonRadiator.dispatchEvent(new CustomEvent('change-temperature', {
      bubbles: true,
      composed: true,
      detail: { id: 'climate.salon', temperature: 24 }
    }));

    await new Promise(r => setTimeout(r, 10));

    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();

    // Now test floor and area selections
    expect((el as any)._active_floor_id).to.equal('ground');

    const floorsRow = el.shadowRoot!.querySelector('.floors sf-hexa-row')!;
    floorsRow.dispatchEvent(new CustomEvent('cell-selected', {
      detail: { cell: { id: 'first' } }
    }));
    await el.updateComplete;

    expect((el as any)._active_floor_id).to.equal('first');
    expect((el as any)._active_area_id).to.equal('bedroom');

    floorsRow.dispatchEvent(new CustomEvent('cell-selected', {
      detail: { cell: { id: 'ground' } }
    }));
    await el.updateComplete;
    expect((el as any)._active_floor_id).to.equal('ground');
    expect((el as any)._active_area_id).to.equal('living_room');
  });

  // IT-112: Climates card is wrapped in ha-card
  it('IT-112: renders climates card wrapped in ha-card element', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());
    el.hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', area_id: 'living_room', domain: 'climate' }),
      },
      states: {
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat', attributes: { current_temperature: 21.5 } }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const haCard = el.shadowRoot!.querySelector('ha-card');
    expect(haCard).to.exist;
    expect(haCard!.querySelector('.container')).to.exist;
  });

  it('IT-113: season colours fall back to hex literals, and no season class renders without sensor.season', async () => {
    // The fallback IS the CSS custom-property default: var(--sf-season-blue, #acd5f3).
    // Drop the hex and a theme without --sf-season-* silently renders an uncoloured icon.
    const css = fs.readFileSync(
      path.resolve(__dirname, '../../../src/cards/climates/styles.ts'),
      'utf8',
    );
    for (const tone of ['blue', 'green', 'yellow', 'orange']) {
      expect(css, `--sf-season-${tone} must keep a hex fallback`)
        .toMatch(new RegExp(`--sf-season-${tone},\\s*#[0-9a-fA-F]{3,6}`));
    }

    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());
    el.hass = makeMockHass({
      entities: { 'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }) },
      states: {
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat', attributes: { friendly_name: 'Salon', current_temperature: 21, temperature: 22 } }),
      }, // no sensor.season
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const season = el.shadowRoot!.querySelector('.season')!;
    expect(season.className.trim()).toBe('season');
    expect(season.querySelector('sf-icon')).toBeNull();
  });

  it('TC-504: forwards custom state_icons to every radiator tile', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig({
      ...SciFiClimatesCard.getStubConfig(),
      state_icons: { heat: 'mdi:fire' },
    } as any);
    el.hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
      },
      states: {
        'climate.salon': makeMockEntity({
          entity_id: 'climate.salon',
          state: 'heat',
          attributes: { friendly_name: 'Salon', current_temperature: 21.5, temperature: 22 },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const radiator = el.shadowRoot!.querySelector('sf-radiator') as any;
    expect(radiator, 'a radiator tile must be rendered').to.exist;
    expect(radiator.cardStyles.state.icons.heat).to.equal('mdi:fire');
  });

  // ── O4: the header reads sensor.season, so it must be a relevant entity ───

  it('O4: lists sensor.season among its relevant entities', async () => {
    const el = document.createElement('sci-fi-climates') as any;
    el.setConfig({ type: 'custom:sci-fi-climates' });
    el.hass = makeMockHass({
      states: {
        'climate.salon': makeMockEntity({
          entity_id: 'climate.salon',
          state: 'heat',
          attributes: { friendly_name: 'Salon', current_temperature: 21, temperature: 22 },
        }),
        'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'winter' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Without it, shouldUpdate suppresses the repaint and the header keeps the
    // previous season's icon until some climate entity happens to change.
    expect(el.getRelevantEntities()).to.include('sensor.season');
  });

  /**
   * Review round 3: the guard that preserves base-card's repaint escape had no
   * probe and its mutant survived. With no climate entity there is nothing to
   * watch, and an EMPTY list is what base-card reads as "repaint on every hass
   * change" — adding the season unconditionally retired that escape, so
   * deleting the last climate entity left a stale radiator on screen.
   */
  it('O4: returns no relevant entity at all when no climate exists', async () => {
    const el = document.createElement('sci-fi-climates') as any;
    el.setConfig({ type: 'custom:sci-fi-climates' });
    el.hass = makeMockHass({
      states: {
        'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'winter' }),
        'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(
      el.getRelevantEntities(),
      'an empty list is the repaint-on-everything escape — the season must not fill it'
    ).to.deep.equal([]);
  });
});



// ─── climates-floor-fallback (bead ha-sci-fi-r9a) ─────────────────────────────

describe('climates floor/area fallback', () => {
  const root = path.resolve(__dirname, '../../..');
  const read = (rel: string): string => fs.readFileSync(path.join(root, rel), 'utf8');

  const floor = (id: string, name: string, level: number) =>
    makeMockFloor({ floor_id: id, name, level });
  const area = (id: string, name: string, floorId: string | null) =>
    makeMockArea({ area_id: id, name, floor_id: floorId });
  const rad = (id: string, areaId: string | null) =>
    makeMockEntityEntry({ entity_id: id, area_id: areaId, domain: 'climate' });
  const heat = (id: string) =>
    makeMockEntity({ entity_id: id, state: 'heat', attributes: { friendly_name: id, current_temperature: 20 } });

  type Spec = {
    floors: Record<string, any>;
    areas: Record<string, any>;
    radAreaId: string | null;
  };

  const build = (s: Spec) =>
    makeMockHass({
      floors: s.floors,
      areas: s.areas,
      entities: { 'climate.r1': rad('climate.r1', s.radAreaId) },
      states: { 'climate.r1': heat('climate.r1') },
    });

  // A: radiator in unfloored `salon`, floor `ground` holds only `cave`
  const scenarioA = (order: 'salon' | 'cave' = 'salon', radAreaId: string | null = 'salon'): Spec => ({
    floors: { ground: floor('ground', 'Ground', 0) },
    areas:
      order === 'salon'
        ? { salon: area('salon', 'Salon', null), cave: area('cave', 'Cave', 'ground') }
        : { cave: area('cave', 'Cave', 'ground'), salon: area('salon', 'Salon', null) },
    radAreaId,
  });
  const scenarioB: Spec = {
    floors: {},
    areas: { salon: area('salon', 'Salon', null) },
    radAreaId: 'salon',
  };
  const scenarioC: Spec = {
    floors: { ground: floor('ground', 'Ground', 0) },
    areas: { cave: area('cave', 'Cave', 'ground') },
    radAreaId: null,
  };
  const scenarioD: Spec = {
    floors: { ground: floor('ground', 'Ground', 0) },
    areas: { salon: area('salon', 'Salon', 'ground') },
    radAreaId: 'salon',
  };
  const scenarioE: Spec = {
    floors: { ground: floor('ground', 'Ground', 0) },
    areas: { garage: area('garage', 'Garage', null), salon: area('salon', 'Salon', 'ground') },
    radAreaId: 'salon',
  };
  const scenarioF = (radAreaId: string | null = 'salon'): Spec => ({
    floors: { rdc: floor('rdc', 'Rdc', 0), up: floor('up', 'Up', 1) },
    areas: { hall: area('hall', 'Hall', 'rdc'), salon: area('salon', 'Salon', radAreaId === 'salon' ? null : 'up') },
    radAreaId,
  });

  const mount = async (hass: any, config: Record<string, unknown> = { type: 'custom:sci-fi-climates' }) => {
    const el = document.createElement('sci-fi-climates') as any;
    el.setConfig(config);
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  };
  const squash = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
  const floorText = (el: any) => squash(el.shadowRoot.querySelector('.floor-content')?.textContent);
  const areaTitle = (el: any) => squash(el.shadowRoot.querySelector('.area-content .title')?.textContent);
  const radiators = (el: any) => el.shadowRoot.querySelectorAll('sf-radiator').length;
  const cells = (el: any, row: '.floors' | '.area-list') =>
    (el.shadowRoot.querySelector(`${row} sf-hexa-row`) as any).cells as unknown[];
  const snapshot = (el: any) => ({
    floor: floorText(el),
    area: areaTitle(el),
    radiators: radiators(el),
    f: el._active_floor_id,
    a: el._active_area_id,
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('TC-CFF-U-01: scenario A falls back to the first floor', async () => {
    const el = await mount(build(scenarioA()));
    expect(el._active_floor_id).to.equal('ground');
    expect(floorText(el)).to.equal('Ground - Off');
    expect(cells(el, '.floors')).to.have.length(0);
  });

  it('TC-CFF-U-02: the area fallback takes the first area of the registry', async () => {
    const salonFirst = await mount(build(scenarioA('salon')));
    expect(salonFirst._active_area_id).to.equal('salon');
    expect(areaTitle(salonFirst)).to.equal('Salon');
    expect(radiators(salonFirst)).to.equal(1);
    expect(cells(salonFirst, '.area-list')).to.have.length(0);
    document.body.replaceChildren();

    const caveFirst = await mount(build(scenarioA('cave')));
    expect(caveFirst._active_area_id).to.equal('cave');
    expect(areaTitle(caveFirst)).to.equal('Cave');
    expect(radiators(caveFirst)).to.equal(0);
    document.body.replaceChildren();

    const integerLike = await mount(
      build({
        floors: { ground: floor('ground', 'Ground', 0) },
        areas: { salon: area('salon', 'Salon', null), 1: area('1', 'Un', null) },
        radAreaId: 'salon',
      })
    );
    expect(integerLike._active_area_id).to.equal('1');
    expect(areaTitle(integerLike)).to.equal('Un');
  });

  it('TC-CFF-U-03: a floor holding a radiator wins, a user selection is kept', async () => {
    const d = await mount(build(scenarioD));
    expect(d._active_floor_id).to.equal('ground');
    expect(d._active_area_id).to.equal('salon');
    expect(floorText(d)).to.equal('Ground - 20°C');
    expect(radiators(d)).to.equal(1);
    document.body.replaceChildren();

    const e = await mount(build(scenarioE));
    expect(e._active_floor_id).to.equal('ground');
    expect(e._active_area_id).to.equal('salon');
    expect(floorText(e)).to.equal('Ground - 20°C');
    expect(radiators(e)).to.equal(1);
    expect(e._active_area_id).to.not.equal('garage');
    document.body.replaceChildren();

    const hass = makeMockHass({
      floors: { ground: floor('ground', 'Ground', 0), up: floor('up', 'Up', 1) },
      areas: { salon: area('salon', 'Salon', 'ground'), bed: area('bed', 'Bed', 'up') },
      entities: { 'climate.r1': rad('climate.r1', 'salon'), 'climate.r2': rad('climate.r2', 'bed') },
      states: { 'climate.r1': heat('climate.r1'), 'climate.r2': heat('climate.r2') },
    });
    const two = await mount(hass);
    const row = two.shadowRoot.querySelector('.floors sf-hexa-row');
    await row.updateComplete;
    const tiles = row.shadowRoot.querySelectorAll('sf-hexa-tile');
    expect(tiles.length).to.equal(2);
    (tiles[1] as HTMLElement).click();
    await two.updateComplete;
    two.hass = { ...hass };
    await two.updateComplete;
    expect(two._active_floor_id).to.equal('up');
    expect(two._active_area_id).to.equal('bed');
  });

  it('TC-CFF-U-04: measured outcomes of scenarios B, C and F are pinned', async () => {
    const b = await mount(build(scenarioB));
    const bFloor = b.shadowRoot.querySelector('.floor-content');
    expect(bFloor).to.not.equal(null);
    expect(bFloor.children.length).to.equal(0);
    expect(squash(bFloor.textContent)).to.equal('');
    expect(b.shadowRoot.querySelector('.area-content')).to.equal(null);
    expect(radiators(b)).to.equal(0);
    document.body.replaceChildren();

    const c = await mount(build(scenarioC));
    expect(floorText(c)).to.equal('Ground - Off');
    expect(areaTitle(c)).to.equal('Cave');
    expect(radiators(c)).to.equal(0);
    document.body.replaceChildren();

    const f = await mount(build(scenarioF()));
    expect(floorText(f)).to.equal('Rdc - Off');
    expect(areaTitle(f)).to.equal('Hall');
    expect(radiators(f)).to.equal(0);
  });

  it('TC-CFF-U-05: filter_by is not a config key', async () => {
    for (const value of ['floor', 'area', 'bogus']) {
      for (const spec of [scenarioA(), scenarioD]) {
        const without = await mount(build(spec));
        const expected = snapshot(without);
        document.body.replaceChildren();
        const withKey = await mount(build(spec), { type: 'custom:sci-fi-climates', filter_by: value });
        expect(snapshot(withKey)).to.deep.equal(expected);
        document.body.replaceChildren();
      }
    }
    const walk = (dir: string): string[] =>
      fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
      );
    for (const rel of walk('src')) expect(read(rel), rel).to.not.include('filter_by');
    const src = read('src/cards/climates/sci-fi-climates.ts');
    expect(src).to.not.match(/this\.config\s+as\s+any/);
    expect(src).to.not.match(/\(\s*this\.config\s+as\s+any\s*\)/);
    for (const rel of [
      'src/cards/climates/config.ts',
      'src/cards/climates/sci-fi-climates-editor.ts',
      'docs/specs/05_cards.md',
    ]) {
      expect(read(rel), rel).to.not.include('filter_by');
    }
    expect(JSON.stringify(SciFiClimatesCard.getStubConfig())).to.not.include('filter_by');
  });

  it('TC-CFF-U-06: climates.md states the selection and the fallback', () => {
    const doc = read('docs/specs/cards/climates.md');
    expect(doc).to.match(/^#{2,3} Floor and area selection$/m);
    for (const word of ['first floor', 'first area', 'getAreas']) expect(doc).to.include(word);
    expect(doc).to.match(/^\|\s*Radiators in areas with no floor\s*\|/m);
    expect(doc).to.not.include('filter_by');
    expect(doc).to.not.include('TC-CFF-');
  });

  it('TC-CFF-U-07: no msg() source is added', async () => {
    const el = await mount(build(scenarioA()));
    expect(radiators(el)).to.equal(1);
    const src = read('src/cards/climates/sci-fi-climates.ts');
    const sources = [...src.matchAll(/msg\(\s*(['"`])([^'"`]*)\1/g)].map(m => m[2]).sort();
    expect(sources).to.deep.equal(
      [
        'No radiator configured',
        'Summer time',
        'Winter is coming',
        'Mode applied',
        'Temperature changed',
        'HVAC mode changed',
        'Preset changed',
      ].sort()
    );
  });

  it('TC-CFF-U-08: a nullish first registry element selects nothing and does not throw', async () => {
    // base-card turns a render exception into an error card + console.error: assert on those, not on a throw.
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const a = scenarioA();
    const el = await mount(
      build({ ...a, floors: { ghost: undefined, ...a.floors } as any, areas: { ghost: undefined, ...a.areas } as any })
    );
    expect(errors).not.toHaveBeenCalled();
    expect(el._renderError).to.equal(null);
    expect(el._active_floor_id).to.equal('ground');
    expect(el._active_area_id).to.equal(null);
    expect(el.shadowRoot.querySelector('.area-content')).to.equal(null);
    document.body.replaceChildren();

    const noFloored = await mount(
      build({
        floors: { ground: floor('ground', 'Ground', 0) },
        areas: { ghost: undefined, cave: area('cave', 'Cave', 'ground') } as any,
        radAreaId: null,
      })
    );
    expect(errors).not.toHaveBeenCalled();
    expect(noFloored._active_area_id).to.equal(null);
    document.body.replaceChildren();

    const nullFloor = await mount(
      build({ ...a, floors: { ghost: null, ...a.floors } as any, areas: { ghost: null, ...a.areas } as any })
    );
    expect(errors).not.toHaveBeenCalled();
    expect(nullFloor._renderError).to.equal(null);
    expect(nullFloor._active_floor_id).to.equal('ground');
  });

  it('IT-CFF-I-04: the fallback floor is kept when the area moves to another floor', async () => {
    const el = await mount(build(scenarioF()));
    expect(floorText(el)).to.equal('Rdc - Off');
    expect(areaTitle(el)).to.equal('Hall');
    el.hass = build({
      ...scenarioF(),
      areas: { hall: area('hall', 'Hall', 'rdc'), salon: area('salon', 'Salon', 'up') },
    });
    await el.updateComplete;
    expect(floorText(el)).to.equal('Rdc - Off');
    expect(areaTitle(el)).to.equal('Hall');
    expect(radiators(el)).to.equal(0);
  });

  it('IT-CFF-I-01: the radiator area later assigned to the fallback floor shows up', async () => {
    const el = await mount(build(scenarioA()));
    expect(floorText(el)).to.equal('Ground - Off');
    expect(areaTitle(el)).to.equal('Salon');
    expect(radiators(el)).to.equal(1);
    el.hass = build({
      ...scenarioA(),
      areas: { salon: area('salon', 'Salon', 'ground'), cave: area('cave', 'Cave', 'ground') },
    });
    await el.updateComplete;
    expect(cells(el, '.floors').map((c: any) => c.id)).to.deep.equal(['ground']);
    expect(floorText(el)).to.equal('Ground - 20°C');
    expect(cells(el, '.area-list').map((c: any) => c.id)).to.deep.equal(['salon']);
    expect(radiators(el)).to.equal(1);
  });

  it('IT-CFF-I-02: repeated hass replacements are stable and silent', async () => {
    const spies = (['warn', 'error', 'log'] as const).map(k => vi.spyOn(console, k).mockImplementation(() => {}));
    const el = await mount(build(scenarioA()));
    const first = snapshot(el);
    for (let i = 0; i < 3; i++) {
      el.hass = build(scenarioA());
      await el.updateComplete;
      expect(snapshot(el)).to.deep.equal(first);
    }
    for (const s of spies) expect(s).not.toHaveBeenCalled();
  });

  it('IT-CFF-I-03: excluding the only radiator empties the card', async () => {
    const el = await mount(build(scenarioA()));
    expect(radiators(el)).to.equal(1);
    el.setConfig({ type: 'custom:sci-fi-climates', entities_to_exclude: ['climate.r1'] });
    await el.updateComplete;
    expect(squash(el.shadowRoot.querySelector('.empty-message')?.textContent)).to.equal('Aucun radiateur configuré');
    expect(el.shadowRoot.querySelector('.floor-content')).to.equal(null);
    expect(el.shadowRoot.querySelector('.area-content')).to.equal(null);
  });
});

// ─── behavioural-test-gaps (famille D) : lignes TC-CLIMATES-U-001/003/004, IT-CLIMATES-I-001/003 ───

describe('climates behavioural gaps', () => {
  const climateEntry = (id: string, areaId = 'living_room') =>
    makeMockEntityEntry({ entity_id: id, area_id: areaId, domain: 'climate' });

  const mountCard = async (config: Record<string, unknown>, hass: any) => {
    const el = document.createElement('sci-fi-climates') as any;
    el.setConfig(config);
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  };

  const modeButton = async (el: any, index: number) => {
    const radiator = el.shadowRoot.querySelectorAll('sf-radiator')[index];
    await radiator.updateComplete;
    return radiator.shadowRoot.querySelector('sf-button-card-select[title="Mode"]') as any;
  };

  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: render() reads an optional key unguarded (config.header.display with no header) and throws.
  it('TC-BTG-U-08 TC-CLIMATES-U-001: renders with the minimal config (type only)', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = await mountCard(
      { type: 'custom:sci-fi-climates' },
      makeMockHass({
        entities: { 'climate.salon': climateEntry('climate.salon') },
        states: {
          'climate.salon': makeMockEntity({
            entity_id: 'climate.salon',
            state: 'heat',
            attributes: { friendly_name: 'Salon', current_temperature: 21.5, temperature: 22 },
          }),
        },
      })
    );
    expect(errors).not.toHaveBeenCalled();
    expect(el._renderError).to.equal(null);
    expect(el.shadowRoot.querySelector('ha-card')).to.not.equal(null);
    expect(el.shadowRoot.querySelectorAll('sf-radiator').length).to.equal(1);
    errors.mockRestore();
  });

  // Mutant: the state_icons / state_colors override is ignored, or applied to every state.
  it('TC-BTG-U-09 TC-CLIMATES-U-003 TC-CLIMATES-U-004: state_icons.heat and state_colors.heat apply to the heat tile only', async () => {
    const el = await mountCard(
      {
        type: 'custom:sci-fi-climates',
        header: { display: false },
        state_icons: { heat: 'mdi:fire' },
        state_colors: { heat: '#ff0000' },
      },
      makeMockHass({
        entities: {
          'climate.hot': climateEntry('climate.hot'),
          'climate.cold': climateEntry('climate.cold'),
        },
        states: {
          'climate.hot': makeMockEntity({
            entity_id: 'climate.hot',
            state: 'heat',
            attributes: { friendly_name: 'Hot', current_temperature: 21, temperature: 22, hvac_modes: ['off', 'heat'] },
          }),
          'climate.cold': makeMockEntity({
            entity_id: 'climate.cold',
            state: 'off',
            attributes: { friendly_name: 'Cold', current_temperature: 17, temperature: 17, hvac_modes: ['off', 'heat'] },
          }),
        },
      })
    );
    const hot = await modeButton(el, 0);
    const cold = await modeButton(el, 1);
    expect(hot.icon).to.equal('mdi:fire');
    expect(hot.getAttribute('style')).to.include('#ff0000');
    expect(cold.icon).to.not.equal('mdi:fire');
    expect(cold.getAttribute('style')).to.not.include('#ff0000');
  });

  // Mutant: shouldUpdate (base-card) returns false on a hass change (stale DOM), or the radiator keeps a cached entity.
  it('IT-BTG-I-04 IT-CLIMATES-I-001 IT-CLIMATES-I-003: a second hass updates the temperature, the mode icon and its colour in the DOM', async () => {
    const config = {
      type: 'custom:sci-fi-climates',
      header: { display: false },
      state_icons: { off: 'mdi:power', heat: 'mdi:fire' },
      state_colors: { off: '#111111', heat: '#ff0000' },
    };
    const hassWith = (state: string, temp: number) =>
      makeMockHass({
        entities: { 'climate.salon': climateEntry('climate.salon') },
        states: {
          'climate.salon': makeMockEntity({
            entity_id: 'climate.salon',
            state,
            attributes: { friendly_name: 'Salon', current_temperature: temp, temperature: 22, hvac_modes: ['off', 'heat'] },
          }),
        },
      });
    const el = await mountCard(config, hassWith('off', 18.5));
    const radiator = el.shadowRoot.querySelector('sf-radiator') as any;
    await radiator.updateComplete;
    expect(radiator.shadowRoot.querySelector('.radical').textContent.trim()).to.equal('18');
    expect(radiator.shadowRoot.querySelector('.decimal').textContent).to.include('.5');
    const before = await modeButton(el, 0);
    expect(before.icon).to.equal('mdi:power');
    expect(before.getAttribute('style')).to.include('#111111');

    el.hass = hassWith('heat', 23.5);
    await el.updateComplete;
    await radiator.updateComplete;

    expect(radiator.shadowRoot.querySelector('.radical').textContent.trim()).to.equal('23');
    expect(radiator.shadowRoot.querySelector('.decimal').textContent).to.include('.5');
    const after = await modeButton(el, 0);
    expect(after.icon).to.equal('mdi:fire');
    expect(after.getAttribute('style')).to.include('#ff0000');
  });
});
