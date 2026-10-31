// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/cards/vehicles/sf-landspeeder.js';
import { SciFiLandspeeder } from '../../../src/cards/vehicles/sf-landspeeder.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sf-landspeeder', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is registered in customElements', () => {
    expect(customElements.get('sf-landspeeder')).to.not.be.undefined;
  });

  it('can be mounted and renders content', async () => {
    const el = document.createElement('sf-landspeeder') as SciFiLandspeeder;
    // Set minimal mock vehicle config
    el.vehicle = { id: 'v1', name: 'Speeder 1' } as any;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot).not.to.be.null;
  });

  /**
   * O6 — this component carries F-VEH-D03, D04, D07 and D08, and the two tests
   * above never set `hass`, so no panel, colour, icon or link was ever asserted.
   * These do set it.
   */
  describe('O6 — panels without their sensor (regression)', () => {
    const mount = async (
      vehicle: Record<string, unknown>,
      states: Record<string, unknown> = {}
    ) => {
      const el = document.createElement('sf-landspeeder') as SciFiLandspeeder;
      el.vehicle = { id: 'v1', name: 'Speeder 1', ...vehicle } as any;
      el.hass = makeMockHass({ states: states as any });
      document.body.appendChild(el);
      await el.updateComplete;
      return el;
    };

    // AP#8: a panel whose sensor is not configured is not rendered. Painting
    // the lock panel anyway made `state === 'locked'` false, so a vehicle with
    // NO lock sensor looked exactly like one standing unlocked — in orange.
    it('renders no lock panel when the vehicle has no lock sensor', async () => {
      const el = await mount({});
      expect(el.shadowRoot!.querySelector('.lock')).to.be.null;
    });

    it('renders the lock panel locked when the sensor says locked', async () => {
      const el = await mount(
        { lock_status: 'binary_sensor.v1_lock' },
        { 'binary_sensor.v1_lock': makeMockEntity({ entity_id: 'binary_sensor.v1_lock', state: 'locked' }) }
      );
      const lock = el.shadowRoot!.querySelector('.lock');
      expect(lock).not.to.be.null;
      expect(lock!.querySelector('.orange'), 'a locked vehicle is not orange').to.be.null;
    });

    it('renders the lock panel orange when the sensor says unlocked', async () => {
      const el = await mount(
        { lock_status: 'binary_sensor.v1_lock' },
        { 'binary_sensor.v1_lock': makeMockEntity({ entity_id: 'binary_sensor.v1_lock', state: 'unlocked' }) }
      );
      expect(el.shadowRoot!.querySelector('.lock .orange')).not.to.be.null;
    });

    // Same rule, and the fuel panel printed '--' where the spec says nothing.
    it('renders no fuel panel when the vehicle has neither fuel sensor', async () => {
      const el = await mount({ battery_level: 'sensor.v1_battery' }, {
        'sensor.v1_battery': makeMockEntity({ entity_id: 'sensor.v1_battery', state: '75' }),
      });
      expect(el.shadowRoot!.querySelector('.fuel')).to.be.null;
    });

    it('renders the fuel panel when at least one fuel sensor is configured', async () => {
      const el = await mount(
        { fuel_quantity: 'sensor.v1_fuel' },
        { 'sensor.v1_fuel': makeMockEntity({ entity_id: 'sensor.v1_fuel', state: '42', attributes: { unit_of_measurement: 'L' } }) }
      );
      const fuel = el.shadowRoot!.querySelector('.fuel');
      expect(fuel).not.to.be.null;
      expect(fuel!.textContent).to.include('42');
    });

    // VE-01 / AP#3: the thresholds apply to the ROUNDED level, so the colour
    // agrees with the battery icon. 19.6 rounds to 20 → orange, not red.
    it.each([
      ['19.6', 'orange'], // → 20, and the icon says 20
      ['15', 'orange'],   // → 20 (Math.round(1.5) = 2)
      ['14', 'red'],      // → 10
      ['54', 'orange'],   // → 50
      ['55.4', 'green'],  // → 60
      ['57', 'green'],    // → 60
      ['75', 'green'],
    ])('paints battery %s as %s', async (state, expected) => {
      const el = await mount(
        { battery_level: 'sensor.v1_battery' },
        { 'sensor.v1_battery': makeMockEntity({ entity_id: 'sensor.v1_battery', state: state as string }) }
      );
      const battery = el.shadowRoot!.querySelector('.battery');
      expect(battery, 'the battery panel must render').not.to.be.null;
      expect(battery!.classList.contains(expected as string), `classes: ${battery!.className}`).to.be.true;
    });

    // VE-17: `<?xml …?>` inside an html`` template is parsed as a bogus comment
    // node on every render.
    it('emits no processing-instruction node in the landspeeder svg', async () => {
      const el = await mount({});
      const html = el.shadowRoot!.innerHTML;
      expect(html).to.not.include('<?xml');
      expect(html).to.not.include('<!--?xml');
    });
  });
});
