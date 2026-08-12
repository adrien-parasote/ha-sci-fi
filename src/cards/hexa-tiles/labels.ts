/**
 * Editor labels for the sci-fi-hexa-tiles card.
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

export function hexaTilesLabels(): Record<string, string> {
  return {
    'section-title-tile': msg('Tile'),
    'section-title-visibility': msg('Visibility'),
    'text-switch-hexa-add-weather-tile': msg('Add weather tile ?'),
    'text-switch-hexa-standalone': msg('Standalone entity?'),
    'input-link': msg('Link'),
    'input-states-on': msg('States on'),
    'input-state-error': msg('Error state'),
    'input-entity-kind': msg('Entity kind'),
    'action-add-tile': msg('Add tile'),
  };
}

export function hexaTilesSectionIcons(): Record<string, string> {
  return {
    'section-title-tile':                'mdi:hexagon-slice-6',
    'section-title-visibility':          'mdi:eye-outline',
  };
}
