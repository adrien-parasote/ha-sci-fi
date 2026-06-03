 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';

import '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';
import { makeMockHass, makeMockEntity, makeMockEntityEntry } from '../../fixtures/mock-hass.js';

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

  it('respects excluded_entity_ids config', async () => {
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
});


