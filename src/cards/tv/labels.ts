/**
 * Editor labels for the sci-fi-tv card.
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

export function tvLabels(): Record<string, string> {
  return {
    'section-title-tv': msg('TV Remote'),
    'section-title-device-settings': msg('Device settings'),
    'section-title-media-sources': msg('Media sources'),
    'input-media-player-entity': msg('Media Player entity'),
    'input-quadrant-name': msg('Quadrant name'),
    'input-remote-entity': msg('Remote entity'),
    'input-media-sources': msg('Quick-Select sources (Press Enter to add)'),
  };
}

export function tvSectionIcons(): Record<string, string> {
  return {
    'section-title-tv':                  'mdi:television',
  };
}
