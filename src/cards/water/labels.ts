/**
 * Editor labels for the sci-fi-water-management card.
 *
 * ADR-017: card-specific labels live next to the editor that consumes them.
 * Returned from a function, not a const: msg() must re-resolve on every
 * lookup so labels follow a locale change.
 */

import { msg } from '@lit/localize';

export function waterLabels(): Record<string, string> {
  return {
    'input-header-message': msg('Header message (optional)'),
    'input-filter-label': msg('HA filter label (e.g. water)'),
    'input-default-floor': msg('Default floor (Floor ID)'),
    'input-default-icon': msg('Default icon'),
    'section-title-visibility': msg('Visibility'),
    'text-no-device': msg('Automations / No device'),
  };
}
