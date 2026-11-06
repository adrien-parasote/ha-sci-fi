/**
 * Editor labels for the sci-fi-stove card.
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

export function stoveLabels(): Record<string, string> {
  return {
    'section-title-config': msg('Configuration'),
    'input-stove-entity': msg('Stove entity'),
    'input-storage-counter': msg('Storage counter'),
    'input-pellet-cost': msg('Pellet cost'),
    'input-switch-eco-mode': msg('Eco mode switch'),
    'input-number-power-level': msg('Power level number'),
    'input-number-fan-speed': msg('Fan speed number'),
    'input-threshold': msg('Threshold'),
    'input-stove-combustion-chamber': msg('Stove combustion chamber'),
    'input-room-temperature': msg('Room temperature'),
    'input-stove-pressure': msg('Stove pressure'),
    'input-stove-fan-speed': msg('Stove fans speed'),
    'input-stove-power-rendered': msg('Stove power rendered'),
    'input-stove-power-consume': msg('Stove power consumed'),
    'input-stove-status': msg('Stove status'),
    'input-stove-door': msg('Stove door'),
    'input-stove-alert': msg('Stove alert'),
    'input-stove-error': msg('Stove error'),
    'input-stove-heating-time': msg('Heating time'),
    'input-stove-fuel-used': msg('Fuel used'),
    'input-stove-igniter-starts': msg('Igniter starts'),
    'input-stove-misfires': msg('Misfires'),
    'input-stove-overheatings': msg('Overheatings'),
    'input-stove-time-to-service': msg('Stove time to service'),
    'input-pellet-quantity': msg('Stove pellet quantity'),
    'input-pellet-quantity-threshold': msg('Pellet quantity threshold'),
  };
}

export function stoveSectionIcons(): Record<string, string> {
  return {
    'section-title-config':              'mdi:selection-ellipse-arrow-inside',
  };
}
