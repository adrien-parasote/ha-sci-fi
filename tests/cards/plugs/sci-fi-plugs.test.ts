/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-plugs', () => {
  it('provides getConfigElement', () => {
    const el = SciFiPlugsCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-plugs-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiPlugsCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-plugs');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiPlugsCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty when no devices config', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (el as any).setConfig({ type: 'custom:sci-fi-plugs' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.plug-tile').length).to.equal(0);
  });

  it('renders plugs and handles toggle clicks', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    const mockCallService = vi.fn();

    // ADR-005: sensors = Record<entityId, SciFiPlugSensorEntry> (not {power: string, energy: string})
    (el as any).setConfig({
      type: 'custom:sci-fi-plugs',
      header_message: 'Smart Plugs',
      devices: [
        {
          device_id: 'plug1',
          entity_id: 'switch.tv',
          name: 'TV Plug',
          // ADR-005: sensors = Record<entityId, entry>
          sensors: {
            'sensor.tv_power': { power: true, show: true },
            'sensor.tv_energy': { name: 'Énergie', show: true }
          }
        },
        {
          device_id: 'plug2',
          entity_id: 'switch.unknown',
          // no sensors
        }
      ]
    });

    el.hass = makeMockHass({
      callService: mockCallService,
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
        'sensor.tv_power': makeMockEntity({
          entity_id: 'sensor.tv_power', state: '45.2',
          attributes: { unit_of_measurement: 'W', friendly_name: 'TV Power' }
        }),
        'sensor.tv_energy': makeMockEntity({
          entity_id: 'sensor.tv_energy', state: '1.2',
          attributes: { unit_of_measurement: 'kWh', friendly_name: 'TV Energy' }
        }),
        'switch.unknown': makeMockEntity({ entity_id: 'switch.unknown', state: 'off', attributes: { friendly_name: 'Unknown Plug' } })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Smart Plugs');

    const tiles = el.shadowRoot!.querySelectorAll('.plug-tile');
    expect(tiles.length).to.equal(2);

    // TV Plug - ON
    const tvTile = tiles[0] as HTMLElement;
    expect(tvTile.getAttribute('data-on')).to.equal('true');
    expect(tvTile.querySelector('.plug-name')!.textContent).to.equal('TV Plug');
    // ADR-005: power sensor shows in .plug-power (main power display)
    expect(tvTile.querySelector('.plug-power')!.textContent).to.include('45.2 W');
    // Energy sensor in sensors list
    const sensorsRows = tvTile.querySelectorAll('.sensor-row');
    expect(sensorsRows.length).to.be.greaterThan(0);
    expect((tvTile.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:power-plug'); // default active

    const btn1 = tvTile.querySelector('.plug-btn') as HTMLElement;
    expect(btn1.textContent).to.equal('Éteindre');
    btn1.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.tv' });

    // Unknown Plug - OFF
    const unknownTile = tiles[1] as HTMLElement;
    expect(unknownTile.getAttribute('data-on')).to.equal('false');
    expect(unknownTile.querySelector('.plug-name')!.textContent).to.equal('Unknown Plug');
    // ADR-005: no sensors → no .plug-power
    expect(unknownTile.querySelector('.plug-power')).to.be.null;
    expect((unknownTile.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:power-plug-off');

    const btn2 = unknownTile.querySelector('.plug-btn') as HTMLElement;
    expect(btn2.textContent).to.equal('Allumer');
    btn2.click();
    expect(mockCallService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.unknown' });
  });

  it('renders custom icons for active/inactive states', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-plugs',
      devices: [{
        device_id: 'p1',
        entity_id: 'switch.lamp',
        active_icon: 'mdi:lamp',
        inactive_icon: 'mdi:lamp-outline',
      }]
    });

    // OFF state
    el.hass = makeMockHass({
      states: { 'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }) }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect((el.shadowRoot!.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:lamp-outline');

    // ON state
    el.hass = makeMockHass({
      states: { 'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'on' }) }
    });
    await el.updateComplete;
    expect((el.shadowRoot!.querySelector('sf-icon') as unknown as any).icon).to.equal('mdi:lamp');
  });

  it('falls back to entity_id as name when neither device.name nor friendly_name exist (L114)', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    // Branch coverage: name = device.name ?? friendlyName ?? entity_id
    // This test exercises the entity_id fallback (third branch)
    (el as any).setConfig({
      type: 'custom:sci-fi-plugs',
      devices: [{ device_id: 'p1', entity_id: 'switch.noname' }]
    });

    el.hass = makeMockHass({
      states: {
        'switch.noname': makeMockEntity({
          entity_id: 'switch.noname',
          state: 'on',
          attributes: {} // no friendly_name
        })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const tile = el.shadowRoot!.querySelector('.plug-tile');
    expect(tile?.querySelector('.plug-name')?.textContent).to.equal('switch.noname');
  });

  it('renders sensor row with unit fallback and label fallback (L146-147, L150)', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    // Branch coverage: label = entry.name ?? friendlyName ?? entityId; unit = undefined → no unit appended
    (el as any).setConfig({
      type: 'custom:sci-fi-plugs',
      devices: [{
        device_id: 'p1',
        entity_id: 'switch.x',
        sensors: {
          'sensor.raw': { show: true } // no entry.name → label fallback to friendlyName or entityId
        }
      }]
    });

    el.hass = makeMockHass({
      states: {
        'switch.x': makeMockEntity({ entity_id: 'switch.x', state: 'on' }),
        'sensor.raw': makeMockEntity({
          entity_id: 'sensor.raw',
          state: '42',
          attributes: {} // no unit_of_measurement, no friendly_name → entityId as label
        })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Label falls back to entityId, no unit appended
    expect(el.shadowRoot!.textContent).to.include('sensor.raw');
    expect(el.shadowRoot!.textContent).to.include('42');
  });
});
