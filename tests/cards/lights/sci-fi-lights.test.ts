 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/lights/sci-fi-lights.js';
import { SciFiLightsCard } from '../../../src/cards/lights/sci-fi-lights.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

describe('sci-fi-lights', () => {
  it('provides getConfigElement', () => {
    const el = SciFiLightsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-lights-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiLightsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-lights');
  });

  afterEach(async () => {
    document.body.replaceChildren();
    await setLocale('fr');
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiLightsCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('returns card size of 5', () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig(SciFiLightsCard.getStubConfig());
    expect(el.getCardSize()).to.equal(5);
  });

  it('TC-I18N-U-15 renders empty message if no floors exist', async () => {
    await setLocale('fr');
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig(SciFiLightsCard.getStubConfig());
    el.hass = makeMockHass({ floors: {} });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Aucun étage configuré');
  });

  it('renders floors, areas, and lights with interactions', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-lights',
      header_message: 'House Lights',
      // ADR-005: ignored_entities (not ignored_entity_ids)
      ignored_entities: ['light.ignored'],
      // ADR-005: custom_entities (not entity_overrides)
      custom_entities: {
        'light.salon': { name: 'Salon Custom', icon_on: 'mdi:lamp-on', icon_off: 'mdi:lamp-off' }
      }
} as unknown as unknown as any);

    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 }),
        'first': makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
      },
      areas: {
        'living': makeMockArea({ area_id: 'living', name: 'Living Room', floor_id: 'ground' }),
        'kitchen': makeMockArea({ area_id: 'kitchen', name: 'Kitchen', floor_id: 'ground' }),
        'bed': makeMockArea({ area_id: 'bed', name: 'Bedroom', floor_id: 'first' }),
      },
      entities: {
        'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', area_id: 'living', domain: 'light' }),
        'light.cuisine': makeMockEntityEntry({ entity_id: 'light.cuisine', area_id: 'kitchen', domain: 'light' }),
        'light.chambre': makeMockEntityEntry({ entity_id: 'light.chambre', area_id: 'bed', domain: 'light' }),
        'light.ignored': makeMockEntityEntry({ entity_id: 'light.ignored', area_id: 'living', domain: 'light' }),
      },
      states: {
        'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
        'light.cuisine': makeMockEntity({ entity_id: 'light.cuisine', state: 'off', attributes: { friendly_name: undefined } }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Check header
    expect(el.shadowRoot!.textContent).to.include('House Lights');

    // Default selection: ground floor -> living area
    // Floor hexagons use class 'floor-hexa' and data-selected attribute
    let floorHexas = el.shadowRoot!.querySelectorAll('.floor-hexa');
    expect(floorHexas.length).to.equal(2);
    expect(floorHexas[0]!.getAttribute('data-selected')).to.equal('true');

    // Area hexagons use class 'area-hexa' and data-selected attribute
    let areaHexas = el.shadowRoot!.querySelectorAll('.area-hexa');
    expect(areaHexas.length).to.equal(2); // Living Room, Kitchen
    expect(areaHexas[0]!.getAttribute('data-selected')).to.equal('true');

    // Lights use class 'light-btn'
    let lightBtns = el.shadowRoot!.querySelectorAll('.light-btn');
    expect(lightBtns.length).to.equal(1); // ignored is excluded via ignored_entities
    expect(lightBtns[0]!.textContent).to.include('Salon Custom'); // custom_entities override applied

    // Verify custom icons: light is on → icon_on = 'mdi:lamp-on', button has no 'light-off' class
    const icon = lightBtns[0]!.querySelector('sf-icon') as unknown as any;
    expect(icon.icon).to.equal('mdi:lamp-on');
    expect(lightBtns[0]!.classList.contains('light-off')).to.be.false;

    // Click on Kitchen area
    (areaHexas[1] as HTMLElement).click();
    await el.updateComplete;
    areaHexas = el.shadowRoot!.querySelectorAll('.area-hexa');
    expect(areaHexas[1]!.getAttribute('data-selected')).to.equal('true');

    lightBtns = el.shadowRoot!.querySelectorAll('.light-btn');
    expect(lightBtns.length).to.equal(1);
    expect(lightBtns[0]!.textContent).to.include('light.cuisine'); // fallback name
    expect((lightBtns[0]!.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:lightbulb-outline'); // default off icon

    // Click on First floor
    floorHexas = el.shadowRoot!.querySelectorAll('.floor-hexa');
    (floorHexas[1] as HTMLElement).click();
    await el.updateComplete;

    // Clicking a floor resets active area to null, which auto-selects the first area of that floor.
    areaHexas = el.shadowRoot!.querySelectorAll('.area-hexa');
    expect(areaHexas.length).to.equal(1); // Bedroom
    expect(areaHexas[0]!.getAttribute('data-selected')).to.equal('true');

    // Check lights in bedroom
    lightBtns = el.shadowRoot!.querySelectorAll('.light-btn');
    expect(lightBtns.length).to.equal(1);
    expect(lightBtns[0]!.textContent).to.include('light.chambre');
  });

  it('respects first_floor_to_render and first_area_to_render', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-lights',
      first_floor_to_render: 'first',
      first_area_to_render: 'bed',
    } as unknown as unknown as any);
    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', level: 0 }),
        'first': makeMockFloor({ floor_id: 'first', level: 1 }),
      },
      areas: {
        'bed': makeMockArea({ area_id: 'bed', floor_id: 'first' }),
      }
} as unknown as unknown as any);
    document.body.appendChild(el);
    await el.updateComplete;

    // Floor hexagons — 'first' floor (level 1) is index 1 and should be selected
    const floorHexas = el.shadowRoot!.querySelectorAll('.floor-hexa');
    expect(floorHexas[1]!.getAttribute('data-selected')).to.equal('true');
  });

  it('ignores same floor selection', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig(SciFiLightsCard.getStubConfig());
    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.floor-hexa') as HTMLElement;
    btn.click();
    await el.updateComplete;
    // Coverage for early return in _selectFloor
    expect(btn.getAttribute('data-selected')).to.equal('true');
  });

  it('uses default icon_on (mdi:lightbulb-on-outline) when no custom_entities override', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    // Branch coverage: icon_on fallback chain — no override, no haIcon, no default_icon_on config
    (el as any).setConfig({ type: 'custom:sci-fi-lights' });

    el.hass = makeMockHass({
      floors: { 'g': makeMockFloor({ floor_id: 'g', level: 0 }) },
      areas: { 'a': makeMockArea({ area_id: 'a', floor_id: 'g' }) },
      entities: {
        'light.on_no_override': makeMockEntityEntry({ entity_id: 'light.on_no_override', area_id: 'a', domain: 'light' })
      },
      states: {
        'light.on_no_override': makeMockEntity({
          entity_id: 'light.on_no_override',
          state: 'on',
          attributes: { friendly_name: 'Living' }
        })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('.light-btn sf-icon') as unknown as any;
    // No custom_entities, no default_icon_on config → falls back to 'mdi:lightbulb-on-outline'
    expect(icon.icon).to.equal('mdi:lightbulb-on-outline');
  });

  it('handles light, area, floor, and global power toggle interactions', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-lights'
    });

    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    el.hass = makeMockHass({
      callService: callServiceMock,
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 }),
      },
      areas: {
        'living': makeMockArea({ area_id: 'living', name: 'Living Room', floor_id: 'ground' }),
      },
      entities: {
        'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', area_id: 'living', domain: 'light' }),
      },
      states: {
        'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // 1. Individual Light Button toggle (currently ON -> should trigger turn_off)
    const lightBtn = el.shadowRoot!.querySelector('.light-btn') as HTMLElement;
    expect(lightBtn).to.exist;
    lightBtn.click();
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenLastCalledWith('light', 'turn_off', { entity_id: 'light.salon' });
    // Toast shown for individual light toggle
    const toast = el.shadowRoot!.querySelector('sf-toast') as any;
    expect(toast).to.exist;

    // 2. Area Power toggle (currently ON -> should trigger turn_off)
    const areaPowerBtn = el.shadowRoot!.querySelector('.area-title .power-btn') as HTMLElement;
    expect(areaPowerBtn).to.exist;
    areaPowerBtn.click();
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenLastCalledWith('light', 'turn_off', { entity_id: ['light.salon'] });

    // 3. Floor Power toggle (currently ON -> should trigger turn_off)
    const floorPowerBtn = el.shadowRoot!.querySelector('.floor-title .power-btn') as HTMLElement;
    expect(floorPowerBtn).to.exist;
    floorPowerBtn.click();
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenLastCalledWith('light', 'turn_off', { entity_id: ['light.salon'] });

    // 4. Global Power toggle (currently ON -> should trigger turn_off)
    const globalPowerBtn = el.shadowRoot!.querySelector('.header-power') as HTMLElement;
    expect(globalPowerBtn).to.exist;
    globalPowerBtn.click();
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenLastCalledWith('light', 'turn_off', { entity_id: ['light.salon'] });
  });

  it('handles card-level tap_action when header text is clicked', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-lights',
      header_message: 'House Lights Custom',
      tap_action: {
        action: 'navigate',
        navigation_path: '/lovelace/home'
      }
    });

    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    const headerText = el.shadowRoot!.querySelector('.header-text') as HTMLElement;
    expect(headerText).to.exist;
    expect(headerText.style.cursor).to.equal('pointer');

    const spy = vi.fn();
    el.addEventListener('hass-action', spy);

    headerText.click();

    expect(spy).toHaveBeenCalledOnce();
    const event = spy.mock.calls[0]![0] as CustomEvent;
    expect(event.detail.action).toBe('tap');
    expect(event.detail.config.tap_action.action).toBe('navigate');
    expect(event.detail.config.tap_action.navigation_path).toBe('/lovelace/home');
  });
});


// ─── behavioural-test-gaps (famille D) : TC-LIGHTS-U-001..005, IT-LIGHTS-I-001/002 ───

describe('lights behavioural gaps', () => {
  const light = (id: string, areaId: string) =>
    makeMockEntityEntry({ entity_id: id, area_id: areaId, domain: 'light' });

  const mountCard = async (config: Record<string, unknown>, hass: any) => {
    const el = document.createElement('sci-fi-lights') as any;
    el.setConfig({ type: 'custom:sci-fi-lights', ...config });
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  };

  afterEach(async () => {
    document.body.replaceChildren();
    await setLocale('fr');
  });

  // Mutant: the empty state is not rendered (the grid is rendered anyway).
  it('TC-BTG-U-10 TC-LIGHTS-U-001: every light ignored, or a floor with no lights, renders the empty state', async () => {
    await setLocale('fr');
    const el = await mountCard(
      { ignored_entities: ['light.salon'] },
      makeMockHass({
        floors: { ground: makeMockFloor({ floor_id: 'ground', name: 'Ground', level: 0 }) },
        areas: { living: makeMockArea({ area_id: 'living', name: 'Living', floor_id: 'ground' }) },
        entities: { 'light.salon': light('light.salon', 'living') },
        states: { 'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }) },
      })
    );
    const empty = el.shadowRoot.querySelector('.areas-section .empty-state');
    expect(empty).to.not.equal(null);
    expect(empty.textContent.trim()).to.equal('Aucune lumière configurée pour cet étage');
    expect(el.shadowRoot.querySelector('.area-list')).to.equal(null);
    expect(el.shadowRoot.querySelectorAll('.light-btn').length).to.equal(0);
    document.body.replaceChildren();

    // Floor with no light entity at all.
    const bare = await mountCard(
      {},
      makeMockHass({
        floors: { ground: makeMockFloor({ floor_id: 'ground', name: 'Ground', level: 0 }) },
        areas: { living: makeMockArea({ area_id: 'living', name: 'Living', floor_id: 'ground' }) },
      })
    );
    expect(bare.shadowRoot.querySelector('.areas-section .empty-state')).to.not.equal(null);
    expect(bare.shadowRoot.querySelectorAll('.light-btn').length).to.equal(0);
  });

  // Mutant: the floor is selected by light count (the floor with lights wins over the configured one).
  it('TC-BTG-U-11 TC-LIGHTS-U-002: first_floor_to_render resolves by id even when that floor holds no light', async () => {
    const el = await mountCard(
      { first_floor_to_render: 'rdc' },
      makeMockHass({
        floors: {
          etage: makeMockFloor({ floor_id: 'etage', name: 'Etage', level: 1 }),
          rdc: makeMockFloor({ floor_id: 'rdc', name: 'Rdc', level: 0 }),
        },
        areas: {
          hall: makeMockArea({ area_id: 'hall', name: 'Hall', floor_id: 'rdc' }),
          bed: makeMockArea({ area_id: 'bed', name: 'Bed', floor_id: 'etage' }),
        },
        entities: { 'light.chambre': light('light.chambre', 'bed') },
        states: { 'light.chambre': makeMockEntity({ entity_id: 'light.chambre', state: 'on' }) },
      })
    );
    const selected = [...el.shadowRoot.querySelectorAll('.floor-hexa')]
      .filter((f: Element) => f.getAttribute('data-selected') === 'true')
      .map((f: Element) => f.getAttribute('title'));
    expect(selected).to.deep.equal(['Rdc']);
    expect(el._activeFloorId).to.equal('rdc');
  });

  // Mutant: ignored_entities is not read, or the name / icon priority is swapped.
  it('TC-BTG-U-12 TC-LIGHTS-U-003 TC-LIGHTS-U-004: ignored_entities hides an entity, custom_entities beats friendly_name beats entity_id', async () => {
    const el = await mountCard(
      {
        ignored_entities: ['light.hidden'],
        custom_entities: {
          'light.custom': { name: 'Custom Name', icon_on: 'mdi:lamp-on', icon_off: 'mdi:lamp-off' },
          'light.custom_off': { name: 'Custom Off', icon_on: 'mdi:lamp-on', icon_off: 'mdi:lamp-off' },
        },
      },
      makeMockHass({
        floors: { ground: makeMockFloor({ floor_id: 'ground', level: 0 }) },
        areas: { living: makeMockArea({ area_id: 'living', floor_id: 'ground' }) },
        entities: {
          'light.custom': light('light.custom', 'living'),
          'light.custom_off': light('light.custom_off', 'living'),
          'light.friendly': light('light.friendly', 'living'),
          'light.bare': light('light.bare', 'living'),
          'light.hidden': light('light.hidden', 'living'),
        },
        states: {
          'light.custom': makeMockEntity({ entity_id: 'light.custom', state: 'on', attributes: { friendly_name: 'Friendly Of Custom' } }),
          'light.custom_off': makeMockEntity({ entity_id: 'light.custom_off', state: 'off', attributes: { friendly_name: 'Friendly Of Custom Off' } }),
          'light.friendly': makeMockEntity({ entity_id: 'light.friendly', state: 'on', attributes: { friendly_name: 'Friendly Name' } }),
          'light.bare': makeMockEntity({ entity_id: 'light.bare', state: 'on', attributes: { friendly_name: undefined } }),
          'light.hidden': makeMockEntity({ entity_id: 'light.hidden', state: 'on', attributes: { friendly_name: 'Hidden Light' } }),
        },
      })
    );
    const buttons = [...el.shadowRoot.querySelectorAll('.light-btn')] as HTMLElement[];
    const rendered = buttons.map(b => ({
      label: b.querySelector('.light-label')!.textContent!.trim(),
      icon: (b.querySelector('sf-icon') as any).icon,
    }));
    expect(rendered).to.deep.equal([
      { label: 'Custom Name', icon: 'mdi:lamp-on' },
      { label: 'Custom Off', icon: 'mdi:lamp-off' },
      { label: 'Friendly Name', icon: 'mdi:lightbulb-on-outline' },
      { label: 'light.bare', icon: 'mdi:lightbulb-on-outline' },
    ]);
    expect(el.shadowRoot.textContent).to.not.include('Hidden Light');
    expect(el.shadowRoot.textContent).to.not.include('light.hidden');
  });

  // Mutant: getRelevantEntities returns every domain (or forgets ignored_entities).
  it('TC-BTG-U-13 TC-LIGHTS-U-005: getRelevantEntities returns only light.* entities that are not ignored (plus sun.sun, read by the header)', async () => {
    const el = await mountCard(
      { ignored_entities: ['light.hidden'] },
      makeMockHass({
        floors: { ground: makeMockFloor({ floor_id: 'ground', level: 0 }) },
        areas: { living: makeMockArea({ area_id: 'living', floor_id: 'ground' }) },
        entities: {
          'light.a': light('light.a', 'living'),
          'light.hidden': light('light.hidden', 'living'),
        },
        states: {
          'light.a': makeMockEntity({ entity_id: 'light.a', state: 'on' }),
          'light.b': makeMockEntity({ entity_id: 'light.b', state: 'off' }),
          'light.hidden': makeMockEntity({ entity_id: 'light.hidden', state: 'on' }),
          'switch.prise': makeMockEntity({ entity_id: 'switch.prise', state: 'on' }),
          'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat' }),
          'sensor.temp': makeMockEntity({ entity_id: 'sensor.temp', state: '20' }),
        },
      })
    );
    const relevant: string[] = el.getRelevantEntities();
    expect(relevant.filter(id => id !== 'sun.sun').sort()).to.deep.equal(['light.a', 'light.b']);
    expect(relevant.every(id => id === 'sun.sun' || id.startsWith('light.'))).to.equal(true);
  });

  // Mutant: the floor click is ignored (the area list keeps the previous floor).
  it('IT-BTG-I-06 IT-LIGHTS-I-001: clicking a floor tab switches the area list to that floor', async () => {
    const el = await mountCard(
      {},
      makeMockHass({
        floors: {
          ground: makeMockFloor({ floor_id: 'ground', name: 'Ground', level: 0 }),
          first: makeMockFloor({ floor_id: 'first', name: 'First', level: 1 }),
        },
        areas: {
          living: makeMockArea({ area_id: 'living', name: 'Living', floor_id: 'ground' }),
          kitchen: makeMockArea({ area_id: 'kitchen', name: 'Kitchen', floor_id: 'ground' }),
          bed: makeMockArea({ area_id: 'bed', name: 'Bedroom', floor_id: 'first' }),
        },
        entities: {
          'light.salon': light('light.salon', 'living'),
          'light.cuisine': light('light.cuisine', 'kitchen'),
          'light.chambre': light('light.chambre', 'bed'),
        },
        states: {
          'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
          'light.cuisine': makeMockEntity({ entity_id: 'light.cuisine', state: 'off' }),
          'light.chambre': makeMockEntity({ entity_id: 'light.chambre', state: 'off' }),
        },
      })
    );
    const areaTitles = () =>
      [...el.shadowRoot.querySelectorAll('.area-hexa')].map((a: Element) => a.getAttribute('title'));
    expect(areaTitles()).to.deep.equal(['Living', 'Kitchen']);

    (el.shadowRoot.querySelectorAll('.floor-hexa')[1] as HTMLElement).click();
    await el.updateComplete;

    expect(areaTitles()).to.deep.equal(['Bedroom']);
    expect(el.shadowRoot.querySelector('.area-title')!.textContent).to.include('Bedroom');
  });

  // Mutant: no re-render on a hass change (stale light state).
  it('IT-LIGHTS-I-002: a second hass with a light turned on is reflected in the DOM', async () => {
    const hassWith = (state: string) =>
      makeMockHass({
        floors: { ground: makeMockFloor({ floor_id: 'ground', level: 0 }) },
        areas: { living: makeMockArea({ area_id: 'living', floor_id: 'ground' }) },
        entities: { 'light.salon': light('light.salon', 'living') },
        states: { 'light.salon': makeMockEntity({ entity_id: 'light.salon', state }) },
      });
    const el = await mountCard({}, hassWith('off'));
    const btn = () => el.shadowRoot.querySelector('.light-btn') as HTMLElement;
    expect(btn().classList.contains('light-off')).to.equal(true);
    expect((btn().querySelector('sf-icon') as any).icon).to.equal('mdi:lightbulb-outline');
    expect(el.shadowRoot.querySelector('.area-hexa')!.getAttribute('data-active')).to.equal('false');

    el.hass = hassWith('on');
    await el.updateComplete;

    expect(btn().classList.contains('light-off')).to.equal(false);
    expect((btn().querySelector('sf-icon') as any).icon).to.equal('mdi:lightbulb-on-outline');
    expect(el.shadowRoot.querySelector('.area-hexa')!.getAttribute('data-active')).to.equal('true');
  });
});
