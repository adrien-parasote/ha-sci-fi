/**
 * Editor labels for the sci-fi-lights card.
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

export function lightsLabels(): Record<string, string> {
  return {
    'section-title-home-selection': msg('Display selection'),
    'section-title-entity-light-custom': msg('Light entities customization'),
    'input-floor-id': msg('First floor to render'),
    'input-area-id': msg('First area to render'),
    'action-add-custom-entity': msg('Add custom entity'),
  };
}

export function lightsSectionIcons(): Record<string, string> {
  return {
    'section-title-home-selection':      'mdi:home-search-outline',
    'section-title-entity-light-custom': 'mdi:selection-ellipse-arrow-inside',
  };
}
