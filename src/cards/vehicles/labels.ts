/**
 * Editor labels for the sci-fi-vehicles card.
 *
 * ADR-017: these used to sit in SciFiBaseEditor.getLabel(), a 189-line
 * dictionary holding the vocabulary of all 11 editors. They now live next to
 * the editor that consumes them. Keys with two or more consumers stay in the
 * shared kernel (see sharedEditorLabels in src/utils/base-editor.ts).
 *
 * Returned from a function, not a const: msg() must re-resolve on every
 * lookup so labels follow a locale change.
 */

import { msg } from '@lit/localize';

export function vehiclesLabels(): Record<string, string> {
  return {
    'input-location': msg('Location'),
    'input-location-last-activity': msg('Location last activity'),
    'input-mileage': msg('Mileage'),
    'input-lock-status': msg('Lock status'),
    'input-fuel-autonomy': msg('Fuel autonomy'),
    'input-fuel-quantity': msg('Fuel quantity'),
    'input-battery-autonomy': msg('Battery autonomy'),
    'input-battery-level': msg('Battery level'),
    'input-charging-state': msg('Charging'),
    'input-plug-state': msg('Plug state'),
    'input-remainting-charging-time': msg('Remaining charging time'),
    'action-add-vehicle': msg('Add vehicle'),
  };
}
