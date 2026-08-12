/**
 * Editor labels for the sci-fi-plugs card.
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

export function plugsLabels(): Record<string, string> {
  return {
    'section-title-plug': msg('Plugs'),
    'input-energy': msg('Energy'),
    'input-power': msg('Power'),
    'action-add-device': msg('Add device'),
    'input-switch-entity': msg('Switch entity'),
  };
}

export function plugsSectionIcons(): Record<string, string> {
  return {
    'section-title-plug':                'mdi:tune-vertical-variant',
  };
}
