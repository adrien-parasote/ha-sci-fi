// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { vehicleStyles } from '../../../src/cards/vehicles/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('vehicles styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: styles.ts exports an empty css`` or renames a class the card renders
  it('TC-BTG-U-29: vehicleStyles is a non-empty CSSResult styling :host and two classes of the rendered card', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({ type: 'custom:sci-fi-vehicles', vehicles: [{ id: 'v1', name: 'Tesla', battery_level: 'sensor.t' }] });
    el.hass = makeMockHass({
      states: { 'sensor.t': makeMockEntity({ entity_id: 'sensor.t', state: '1' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(vehicleStyles).toBeInstanceOf(CSSResult);
    const css = vehicleStyles.cssText;
    expect(css.replace(/\s/g, '')).not.toBe('');
    expect(css).toContain(':host');

    // Two class names read from the rendered shadow root, never typed here.
    const classes = Array.from(el.shadowRoot!.querySelectorAll('[class]'))
      .flatMap(node => Array.from(node.classList));
    const picked = Array.from(new Set(classes)).slice(0, 2);
    expect(picked.length).toBe(2);
    for (const cls of picked) {
      expect(css, `.${cls} must be styled`).toMatch(new RegExp(`\\.${cls}(?![\\w-])`));
    }
  });
});
