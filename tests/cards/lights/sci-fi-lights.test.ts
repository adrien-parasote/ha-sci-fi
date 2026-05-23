/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../../src/cards/lights/sci-fi-lights.js';
import { SciFiLightsCard } from '../../../src/cards/lights/sci-fi-lights.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

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
    document.body.innerHTML = '';
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    document.body.appendChild(el);
    el.setConfig(SciFiLightsCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('returns card size of 4', () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    expect(el.getCardSize()).to.equal(4);
  });

  it('renders empty message if no floors exist', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    el.setConfig(SciFiLightsCard.getStubConfig());
    el.hass = makeMockHass({ floors: {} });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Aucun étage configuré');
  });

  it('renders floors, areas, and lights with interactions', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    el.setConfig({
      type: 'custom:sci-fi-lights',
      header_message: 'House Lights',
      ignored_entity_ids: ['light.ignored'],
      entity_overrides: {
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
    let floorBtns = el.shadowRoot!.querySelectorAll('.floor-btn');
    expect(floorBtns.length).to.equal(2);
    expect(floorBtns[0]!.getAttribute('aria-selected')).to.equal('true');

    let areaTiles = el.shadowRoot!.querySelectorAll('.area-tile');
    expect(areaTiles.length).to.equal(2); // Living Room, Kitchen
    expect(areaTiles[0]!.getAttribute('aria-pressed')).to.equal('true');

    // Lights in living room
    let lightRows = el.shadowRoot!.querySelectorAll('.light-row');
    expect(lightRows.length).to.equal(1); // ignored is excluded
    expect(lightRows[0]!.textContent).to.include('Salon Custom');

    // Verify custom icons and states
    const icon = lightRows[0]!.querySelector('sf-icon') as unknown as any;
    expect(icon.icon).to.equal('mdi:lamp-on');
    expect(lightRows[0]!.querySelector('.light-name')!.classList.contains('sf-state-on')).to.be.true;

    // Click on Kitchen area
    (areaTiles[1] as HTMLElement).click();
    await el.updateComplete;
    areaTiles = el.shadowRoot!.querySelectorAll('.area-tile');
    expect(areaTiles[1]!.getAttribute('aria-pressed')).to.equal('true');

    lightRows = el.shadowRoot!.querySelectorAll('.light-row');
    expect(lightRows.length).to.equal(1);
    expect(lightRows[0]!.textContent).to.include('light.cuisine'); // fallback name
    expect((lightRows[0]!.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:lightbulb-outline'); // default off icon

    // Click on First floor
    floorBtns = el.shadowRoot!.querySelectorAll('.floor-btn');
    (floorBtns[1] as HTMLElement).click();
    await el.updateComplete;

    // Wait, clicking a floor resets active area to null, which auto-selects the first area of that floor.
    areaTiles = el.shadowRoot!.querySelectorAll('.area-tile');
    expect(areaTiles.length).to.equal(1); // Bedroom
    expect(areaTiles[0]!.getAttribute('aria-pressed')).to.equal('true');

    // Check lights in bedroom
    lightRows = el.shadowRoot!.querySelectorAll('.light-row');
    expect(lightRows.length).to.equal(1);
    expect(lightRows[0]!.textContent).to.include('light.chambre');
  });

  it('respects first_floor_to_render and first_area_to_render', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    el.setConfig({
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

    const floorBtns = el.shadowRoot!.querySelectorAll('.floor-btn');
    expect(floorBtns[1]!.getAttribute('aria-selected')).to.equal('true');
  });

  it('ignores same floor selection', async () => {
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    el.setConfig(SciFiLightsCard.getStubConfig());
    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.floor-btn') as HTMLElement;
    btn.click();
    await el.updateComplete;
    // Coverage for early return in _selectFloor
    expect(btn.getAttribute('aria-selected')).to.equal('true');
  });
});
