/**
 * Editor labels for the sci-fi-climates card.
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

export function climatesLabels(): Record<string, string> {
  return {
    'section-title-state': msg('State'),
    'section-title-mode': msg('Mode'),
    'text-switch-climate-global-turn-on_off': msg('Display global turn on/off button ?'),
    'input-message-header-section-winter': msg('Winter period message'),
    'input-icon-header-section-winter': msg('Winter period icon'),
    'input-message-header-section-summer': msg('Summer period message'),
    'input-icon-header-section-summer': msg('Summer period icon'),
    'input-icon-auto': msg('Icon auto'),
    'input-icon-off': msg('Icon off'),
    'input-icon-heat': msg('Icon heat'),
    'input-icon-frost_protection': msg('Icon frost protection'),
    'input-icon-eco': msg('Icon eco'),
    'input-icon-comfort': msg('Icon comfort'),
    'input-icon-comfort-1': msg('Icon comfort-1'),
    'input-icon-comfort-2': msg('Icon comfort-2'),
    'input-icon-boost': msg('Icon boost'),
    'input-color-auto': msg('Auto icon color'),
    'input-color-off': msg('Off icon color'),
    'input-color-heat': msg('Heat icon color'),
    'input-color-frost_protection': msg('Frost protection icon color'),
    'input-color-eco': msg('Eco icon color'),
    'input-color-comfort': msg('Comfort icon color'),
    'input-color-comfort-1': msg('Comfort-1 icon color'),
    'input-color-comfort-2': msg('Comfort-2 icon color'),
    'input-color-boost': msg('Boost icon color'),
  };
}

export function climatesSectionIcons(): Record<string, string> {
  return {
    'section-title-state':               'mdi:state-machine',
    'section-title-mode':                'mdi:state-machine',
  };
}
