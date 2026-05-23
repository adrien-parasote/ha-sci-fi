/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVacuumCard } from '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-vacuum', () => {
  it('provides getConfigElement', () => {
    const el = SciFiVacuumCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vacuum-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiVacuumCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vacuum');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    document.body.appendChild(el);
    el.setConfig(SciFiVacuumCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty message if no vacuums configured', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    el.setConfig({ type: 'custom:sci-fi-vacuum', vacuums: [] } as unknown as unknown as any);
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Aucun aspirateur configuré');
  });

  it('renders tabs for multiple vacuums and handles tab switching', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    el.setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [
        { entity_id: 'vacuum.v1' },
        { entity_id: 'vacuum.v2' }
      ]
} as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'vacuum.v1': makeMockEntity({ entity_id: 'vacuum.v1', state: 'docked', attributes: { friendly_name: 'Robot 1' } }),
        'vacuum.v2': makeMockEntity({ entity_id: 'vacuum.v2', state: 'cleaning', attributes: { friendly_name: 'Robot 2' } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Check tabs
    const tabs = el.shadowRoot!.querySelectorAll('.vacuum-tab');
    expect(tabs.length).to.equal(2);
    expect(tabs[0]!.getAttribute('aria-selected')).to.equal('true');
    expect(tabs[1]!.getAttribute('aria-selected')).to.equal('false');
    expect(tabs[0]!.textContent).to.equal('Robot 1');
    expect(tabs[1]!.textContent).to.equal('Robot 2');

    // Check default vacuum state
    expect(el.shadowRoot!.textContent).to.include('docked');

    // Switch to second vacuum
    (tabs[1] as HTMLElement).click();
    await el.updateComplete;

    expect(tabs[0]!.getAttribute('aria-selected')).to.equal('false');
    expect(tabs[1]!.getAttribute('aria-selected')).to.equal('true');
    expect(el.shadowRoot!.textContent).to.include('cleaning');
  });

  it('renders vacuum details, missing sensors, and map', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    el.setConfig({
      type: 'custom:sci-fi-vacuum',
      header_message: 'Vacuum Status',
      vacuums: [{
        entity_id: 'vacuum.bot',
        sensors: {
          battery: 'sensor.bat',
          current_clean_area: 'sensor.area',
          map: 'camera.map'
        }
      }]
} as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }),
        'sensor.bat': makeMockEntity({ entity_id: 'sensor.bat', state: '85' }),
        'sensor.area': makeMockEntity({ entity_id: 'sensor.area', state: '15' }),
        'camera.map': makeMockEntity({ entity_id: 'camera.map', state: 'idle', attributes: { entity_picture: '/api/camera/map' } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Vacuum Status');
    expect(el.shadowRoot!.textContent).to.include('85%');
    expect(el.shadowRoot!.textContent).to.include('15 m²');
    const img = el.shadowRoot!.querySelector('img');
    expect(img?.getAttribute('src')).to.equal('/api/camera/map');
  });

  it('renders vacuum with disabled controls', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    el.setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity_id: 'vacuum.bot',
        start: false,
        pause: false,
        stop: false,
        return_to_base: false,
        set_fan_speed: false
      }]
} as unknown as unknown as any);

    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;

    const btns = el.shadowRoot!.querySelectorAll('.ctrl-btn');
    expect(btns.length).to.equal(0);
    const select = el.shadowRoot!.querySelector('.fan-select');
    expect(select).to.be.null;
  });

  it('handles control button clicks and fan speed select', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    const mockCallService = vi.fn();
    el.setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity_id: 'vacuum.bot' }]
} as unknown as unknown as any);

    el.hass = makeMockHass({ callService: mockCallService });
    document.body.appendChild(el);
    await el.updateComplete;

    const btns = el.shadowRoot!.querySelectorAll('.ctrl-btn');
    // Start, Pause, Stop, Base
    (btns[0] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'start', { entity_id: 'vacuum.bot' });
    
    (btns[1] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'pause', { entity_id: 'vacuum.bot' });

    (btns[2] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'stop', { entity_id: 'vacuum.bot' });

    (btns[3] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'return_to_base', { entity_id: 'vacuum.bot' });

    const select = el.shadowRoot!.querySelector('.fan-select') as HTMLSelectElement;
    select.value = 'strong';
    select.dispatchEvent(new Event('change'));
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'set_fan_speed', { entity_id: 'vacuum.bot', fan_speed: 'strong' });
  });
});
