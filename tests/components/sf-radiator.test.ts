// @vitest-environment happy-dom
import { expect, describe, it, vi, afterEach } from 'vitest';
import '../../src/components/sf-radiator.js';
import type { SciFiRadiator } from '../../src/components/sf-radiator.js';
import { makeMockEntity } from '../fixtures/mock-hass.js';

describe('sf-radiator', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully without entity', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders correctly with default attributes and states', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        min_temp: 7,
        max_temp: 30,
        preset_modes: ['none', 'frost_protection', 'eco', 'comfort', 'boost'],
        preset_mode: 'eco',
        hvac_modes: ['off', 'heat', 'cool', 'auto']
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.name')!.textContent).to.equal('Salon');
    expect(el.shadowRoot!.querySelector('.radical')!.textContent.trim()).to.equal('21');
    expect(el.shadowRoot!.querySelector('.decimal')!.textContent).to.include('.5');
  });

  it('triggers change-temperature when sf-wheel dispatches wheel-change', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        min_temp: 7,
        max_temp: 30
      }
    });

    const handler = vi.fn();
    el.addEventListener('change-temperature', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      detail: { action: 'temperature', value: 23 }
    }));

    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({
      id: 'climate.salon',
      temperature: 23
    });
  });

  it('triggers change-hvac-mode when sf-button-card-select dispatches button-select for mode', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        hvac_modes: ['heat', 'cool']
      }
    });

    const handler = vi.fn();
    el.addEventListener('change-hvac-mode', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    const selectElements = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    const modeSelect = selectElements[1]!;
    modeSelect.dispatchEvent(new CustomEvent('button-select', {
      detail: { action: 'mode', id: 'cool' }
    }));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({
      id: 'climate.salon',
      mode: 'cool'
    });
  });

  it('triggers change-preset-mode when sf-button-card-select dispatches button-select for preset', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        preset_modes: ['eco', 'comfort'],
        preset_mode: 'eco'
      }
    });

    const handler = vi.fn();
    el.addEventListener('change-preset-mode', handler);

    document.body.appendChild(el);
    await el.updateComplete;

    const selectElements = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    const presetSelect = selectElements[0]!;
    presetSelect.dispatchEvent(new CustomEvent('button-select', {
      detail: { action: 'preset', id: 'comfort' }
    }));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]!.detail).to.deep.equal({
      id: 'climate.salon',
      mode: 'comfort'
    });
  });

  it('correctly handles state_icons and mode_icons custom styles', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        preset_modes: ['eco', 'comfort'],
        preset_mode: 'comfort',
        hvac_modes: ['heat', 'cool']
      }
    });

    el.cardStyles = {
      mode: {
        icons: { comfort: 'mdi:fire' },
        colors: { comfort: '#ff0000' }
      },
      state: {
        icons: { heat: 'mdi:radiator' },
        colors: { heat: '#00ff00' }
      }
    };

    document.body.appendChild(el);
    await el.updateComplete;

    const selectElements = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    expect(selectElements.length).to.equal(2);

    const presetSelect = selectElements[0] as any;
    const modeSelect = selectElements[1] as any;

    expect(presetSelect.icon).to.equal('mdi:fire');
    expect(modeSelect.icon).to.equal('mdi:radiator');
  });

  it('correctly filters and styles preset options in auto hvac state', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'auto',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        preset_modes: ['none', 'frost_protection', 'eco', 'comfort'],
        preset_mode: 'eco',
        hvac_modes: ['heat', 'cool', 'auto']
      }
    });

    el.cardStyles = {
      mode: {
        icons: { eco: 'mdi:eco-leaf', frost_protection: 'mdi:snowflake' },
        colors: { eco: '#00ff00', frost_protection: '#0000ff' }
      }
    };

    document.body.appendChild(el);
    await el.updateComplete;

    const selectElements = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    const presetSelect = selectElements[0] as any;
    
    // Under state 'auto' and current preset 'eco' (not frost / frost_protection):
    // filter returns true only when m === 'frost_protection'
    expect(presetSelect.items.length).to.equal(1);
    expect(presetSelect.items[0].id).to.equal('frost_protection');
    expect(presetSelect.items[0].icon).to.equal('mdi:snowflake');
    expect(presetSelect.items[0].color).to.equal('#0000ff');

    // Switch preset_mode to 'frost_protection'
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'auto',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        preset_modes: ['none', 'frost_protection', 'eco', 'comfort'],
        preset_mode: 'frost_protection',
        hvac_modes: ['heat', 'cool', 'auto']
      }
    });
    await el.updateComplete;

    const presetSelect2 = el.shadowRoot!.querySelectorAll('sf-button-card-select')[0] as any;
    // Under state 'auto' and current preset 'frost_protection':
    // filter returns true only when m === 'eco' or 'comfort'
    expect(presetSelect2.items.length).to.equal(2);
    expect(presetSelect2.items.some((item: any) => item.id === 'eco')).to.be.true;
    expect(presetSelect2.items.some((item: any) => item.id === 'comfort')).to.be.true;
  });

  it('correctly maps frost preset protection custom icons', async () => {
    const el = document.createElement('sf-radiator') as SciFiRadiator;
    el.climateEntity = makeMockEntity({
      entity_id: 'climate.salon',
      state: 'heat',
      attributes: {
        friendly_name: 'Salon',
        current_temperature: 21.5,
        temperature: 22,
        preset_modes: ['eco', 'frost'],
        preset_mode: 'eco',
        hvac_modes: ['heat', 'cool']
      }
    });

    el.cardStyles = {
      mode: {
        icons: { frost_protection: 'mdi:snowflake-frost' }
      }
    };

    document.body.appendChild(el);
    await el.updateComplete;

    const presetSelect = el.shadowRoot!.querySelectorAll('sf-button-card-select')[0] as any;
    const frostItem = presetSelect.items.find((item: any) => item.id === 'frost');
    expect(frostItem).to.exist;
    expect(frostItem.icon).to.equal('mdi:snowflake-frost');
  });
});

