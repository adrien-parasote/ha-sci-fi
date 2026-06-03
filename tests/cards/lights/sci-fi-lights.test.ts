 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/lights/sci-fi-lights.js';
import { SciFiLightsCard } from '../../../src/cards/lights/sci-fi-lights.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

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

  afterEach(() => {
    document.body.replaceChildren();
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

  it('renders empty message if no floors exist', async () => {
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

