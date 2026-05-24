/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';

import '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';
import { makeMockHass, makeMockEntity, makeMockEntityEntry } from '../../fixtures/mock-hass.js';

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

    const mockCallService = vi.fn();
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

    const tiles = el.shadowRoot!.querySelectorAll('.climate-tile');
    expect(tiles.length).to.equal(3);

    // Salon (Heat)
    const salonTile = tiles[0] as HTMLElement;
    expect(salonTile.getAttribute('data-active')).to.equal('true');
    expect(salonTile.querySelector('.climate-name')!.textContent).to.equal('Salon');
    expect(salonTile.querySelector('.climate-temp')!.textContent).to.equal('21.5°');
    expect(salonTile.querySelector('.climate-state')!.textContent).to.include('heat');
    expect(salonTile.querySelector('.climate-state')!.textContent).to.include('→ 22°');

    // Chambre (Off, null temp)
    const chambreTile = tiles[1] as HTMLElement;
    expect(chambreTile.getAttribute('data-active')).to.equal('false');
    expect(chambreTile.querySelector('.climate-name')!.textContent).to.equal('climate.chambre');
    expect(chambreTile.querySelector('.climate-temp')!.textContent).to.equal('--');
    expect(chambreTile.querySelector('.climate-state')!.textContent).to.include('off');
    expect(chambreTile.querySelector('.climate-state')!.textContent).not.to.include('→');

    // SDB (Unknown state)
    const sdbTile = tiles[2] as HTMLElement;
    expect(sdbTile.getAttribute('data-active')).to.equal('true'); // state is unknown, which is !== 'off'
    expect(sdbTile.querySelector('.climate-state')!.textContent).to.include('unknown');

    // Test toggle click on heat
    salonTile.click();
    expect(mockCallService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { entity_id: 'climate.salon', hvac_mode: 'off' });

    // Test toggle click on off
    chambreTile.click();
    expect(mockCallService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { entity_id: 'climate.chambre', hvac_mode: 'heat' });
  });

  it('renders header with winter season icon', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig({ type: 'custom:sci-fi-climates', header: { display: true }, header_message: 'Winter Mode' } as unknown as unknown as any);
    el.hass = makeMockHass({ states: { 'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'winter' }) } });
    document.body.appendChild(el);
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    // ADR-005: default icon_winter_state = 'mdi:thermometer-chevron-up'
    expect(icon?.icon).to.equal('mdi:thermometer-chevron-up');
    expect(el.shadowRoot!.textContent).to.include('Winter Mode');
  });

  it('renders header with summer season icon', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig({ type: 'custom:sci-fi-climates', header: { display: true } } as unknown as unknown as any);
    el.hass = makeMockHass({ states: { 'sensor.season': makeMockEntity({ entity_id: 'sensor.season', state: 'summer' }) } });
    document.body.appendChild(el);
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    // ADR-005: default icon_summer_state = 'mdi:thermometer-chevron-down'
    expect(icon?.icon).to.equal('mdi:thermometer-chevron-down');
  });

  it('respects excluded_entity_ids config', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    // ADR-005: entities_to_exclude (not excluded_entity_ids)
    (el as any).setConfig({ type: 'custom:sci-fi-climates', header: { display: false }, entities_to_exclude: ['climate.hidden'] });
    el.hass = makeMockHass({
      entities: {
        'climate.shown': makeMockEntityEntry({ entity_id: 'climate.shown', domain: 'climate' }),
        'climate.hidden': makeMockEntityEntry({ entity_id: 'climate.hidden', domain: 'climate' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tiles = el.shadowRoot!.querySelectorAll('.climate-tile');
    expect(tiles.length).to.equal(1);
    expect(tiles[0]!.querySelector('.climate-name')!.textContent).to.include('climate.shown');
  });

  it('renders "Aucun radiateur" message when no climates exist', async () => {
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    // Branch coverage: climates.length === 0 → early return with message (L94)
    el.setConfig(SciFiClimatesCard.getStubConfig());
    el.hass = makeMockHass({
      entities: {
        // No climate entities — only other domains
        'light.salon': { entity_id: 'light.salon', area_id: 'living_room', device_id: null,
          disabled_by: null, domain: 'light', platform: 'hue', labels: [] },
      },
      states: {}
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Aucun radiateur configuré');
    const tiles = el.shadowRoot!.querySelectorAll('.climate-tile');
    expect(tiles.length).to.equal(0);
  });
});
