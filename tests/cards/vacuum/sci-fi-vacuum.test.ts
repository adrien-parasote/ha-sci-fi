/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';

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
    // ADR-005: entity (not entity_id)
    expect(config.vacuums[0]!.entity).to.equal('vacuum.robot');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiVacuumCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty message if no vacuums configured', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    (el as any).setConfig({ type: 'custom:sci-fi-vacuum', vacuums: [] });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Aucun aspirateur configuré');
  });

  it('renders tabs for multiple vacuums and handles tab switching', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [
        { entity: 'vacuum.v1' },
        { entity: 'vacuum.v2' }
      ]
    });

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

  it('renders vacuum status, sensors and map', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    // ADR-005: entity (not entity_id), mop_intensite (not mop_intensity)
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      header_message: 'Vacuum Status',
      vacuums: [{
        entity: 'vacuum.bot',
        sensors: {
          battery: 'sensor.bat',
          current_clean_area: 'sensor.area',
          map: 'camera.map'
        }
      }]
    });

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
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        start: false,
        pause: false,
        stop: false,
        return_to_base: false,
        set_fan_speed: false
      }]
    });

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
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{ entity: 'vacuum.bot' }]
    });

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

  it('renders shortcuts section with buttons', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    const mockCallService = vi.fn();
    // ADR-005: shortcuts preserved
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        shortcuts: {
          service: 'vacuum.send_command',
          command: 'app_segment_clean',
          description: [
            { name: 'Salon', segments: [16] },
            { name: 'Cuisine', icon: 'mdi:chef-hat', segments: [17, 18] }
          ]
        }
      }]
    });

    el.hass = makeMockHass({ callService: mockCallService });
    document.body.appendChild(el);
    await el.updateComplete;

    const shortcuts = el.shadowRoot!.querySelector('.shortcuts');
    expect(shortcuts).not.to.be.null;

    const btns = el.shadowRoot!.querySelectorAll('.shortcut-btn');
    expect(btns.length).to.equal(2);
    expect(btns[0]!.textContent).to.include('Salon');
    expect(btns[1]!.textContent).to.include('Cuisine');

    (btns[0] as HTMLElement).click();
    expect(mockCallService).toHaveBeenCalledWith('vacuum', 'send_command', {
      entity_id: 'vacuum.bot',
      command: 'app_segment_clean',
      params: [16],
    });
  });

  it('renders mop_intensite sensor when configured', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    // Branch coverage: L214-215 — mop_intensite sensor in .sensors-row
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        sensors: {
          mop_intensite: 'sensor.mop_intensity'
        }
      }]
    });

    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }),
        'sensor.mop_intensity': makeMockEntity({ entity_id: 'sensor.mop_intensity', state: 'élevé' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('💧 élevé');
  });

  it('ignores shortcut click when service is malformed', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    const mockCallService = vi.fn();
    // Branch coverage: L279-283 — _callShortcut() early return if domain or service is falsy
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        shortcuts: {
          service: 'invalidsyntax', // no dot separator → split gives ['invalidsyntax'] → service is undefined
          command: 'app_segment_clean',
          description: [{ name: 'Salon', segments: [16] }]
        }
      }]
    });

    el.hass = makeMockHass({ callService: mockCallService });
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.shortcut-btn') as HTMLElement;
    btn.click();
    // callService must NOT have been called due to early return
    expect(mockCallService).not.toHaveBeenCalled();
  });

  it('renders current_clean_duration sensor', async () => {
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    // Branch coverage: L195 — current_clean_duration sensor rendered in .sensors-row
    (el as any).setConfig({
      type: 'custom:sci-fi-vacuum',
      vacuums: [{
        entity: 'vacuum.bot',
        sensors: {
          current_clean_duration: 'sensor.duration'
        }
      }]
    });

    el.hass = makeMockHass({
      states: {
        'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'cleaning' }),
        'sensor.duration': makeMockEntity({ entity_id: 'sensor.duration', state: '42' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('⏱ 42');
  });
});
