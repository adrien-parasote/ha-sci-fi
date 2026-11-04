// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { fireHassAction } from '../../src/utils/action.js';
import { SciFiHexaTilesCard } from '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { SciFiClimatesCard } from '../../src/cards/climates/sci-fi-climates.js';
import { SciFiPlugsCard } from '../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiStoveCard } from '../../src/cards/stove/sci-fi-stove.js';
import { SciFiVacuumCard } from '../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVehiclesCard } from '../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiWeatherCard } from '../../src/cards/weather/sci-fi-weather.js';
import { SciFiLightsCard } from '../../src/cards/lights/sci-fi-lights.js';

describe('remediation utils', () => {
  it('TC-111: fireHassAction dispatches native CustomEvent', () => {
    const element = document.createElement('div');
    const config = { entity: 'light.living_room', tap_action: { action: 'toggle' } };
    const spy = vi.fn();
    element.addEventListener('hass-action', spy);

    fireHassAction(element, config, 'tap');

    expect(spy).toHaveBeenCalledOnce();
    const event = spy.mock.calls[0]![0] as CustomEvent;
    expect(event.detail.config).toEqual(config);
    expect(event.detail.action).toBe('tap');
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);

    // Type-level pin: tap_action is an ActionConfig, a bare string is refused by tsc.
    const rejected = () => {
      // @ts-expect-error tap_action must be an ActionConfig
      fireHassAction(element, { tap_action: 'toggle' }, 'tap');
    };
    void rejected;
  });

  it('TC-112: getCardSize() returns specific values per card class and handles guard clauses', () => {
    const cases = [
      { CardClass: SciFiHexaTilesCard, type: 'custom:sci-fi-hexa-tiles', size: 6 },
      { CardClass: SciFiClimatesCard, type: 'custom:sci-fi-climates', size: 5 },
      { CardClass: SciFiPlugsCard, type: 'custom:sci-fi-plugs', size: 5 },
      // the stove card refuses a config without entity (fix lot stove-bridge O2)
      { CardClass: SciFiStoveCard, type: 'custom:sci-fi-stove', size: 4, entity: 'climate.poele' },
      { CardClass: SciFiVacuumCard, type: 'custom:sci-fi-vacuum', size: 6 },
      { CardClass: SciFiVehiclesCard, type: 'custom:sci-fi-vehicles', size: 5 },
      { CardClass: SciFiWeatherCard, type: 'custom:sci-fi-weather', size: 4 },
      { CardClass: SciFiLightsCard, type: 'custom:sci-fi-lights', size: 5 },
    ];

    for (const { CardClass, type, size, entity } of cases as Array<(typeof cases)[number] & { entity?: string }>) {
      const card = new CardClass();
      
      // 1. Guard clause: returns default 3 when config is not yet set
      expect(card.getCardSize()).toBe(3);

      // 2. Returns correct overridden size after setConfig
      card.setConfig((entity ? { type, entity } : { type }) as any);
      expect(card.getCardSize()).toBe(size);
    }
  });
});
