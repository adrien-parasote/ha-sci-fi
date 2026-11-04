/**
 * @vitest-environment happy-dom
 *
 * Fix lot ui, O1 (bead ha-sci-fi-rskp.1 / ha-sci-fi-33v): the empty state of
 * climates and vehicles is styled — `.empty-message` has a rule in each card's
 * resolved stylesheet.
 */
import { describe, it, expect } from 'vitest';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import type { CSSResultGroup } from 'lit';

function cssText(styles: CSSResultGroup | undefined): string {
  if (!styles) return '';
  if (Array.isArray(styles)) return styles.map(s => cssText(s as CSSResultGroup)).join('\n');
  return (styles as { cssText: string }).cssText;
}

describe('O1', () => {
  it('test_O1_empty_message_is_styled_in_climates_and_vehicles', () => {
    for (const card of [SciFiClimatesCard, SciFiVehiclesCard]) {
      const text = cssText(card.styles);
      const rule = /\.empty-message\s*\{([^}]*)\}/.exec(text);
      expect(rule, card.name).not.toBeNull();
      expect(rule![1]).toMatch(/color:\s*var\(--sf-text-secondary\)/);
      expect(rule![1]).toMatch(/justify-content:\s*center/);
    }
  });
});
