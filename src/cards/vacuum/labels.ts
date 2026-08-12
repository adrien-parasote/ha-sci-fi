/**
 * Editor labels for the sci-fi-vacuum card.
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

export function vacuumLabels(): Record<string, string> {
  return {
    'section-title-sensor': msg('Sensors'),
    'section-title-default-actions': msg('Default actions display'),
    'section-title-shortcuts': msg('Shortcuts'),
    'section-title-segments': msg('Segments'),
    'text-switch-action-start': msg('Start?'),
    'text-switch-action-pause': msg('Pause?'),
    'text-switch-action-stop': msg('Stop?'),
    'text-switch-action-return-to-base': msg('Return to base?'),
    'text-switch-action-set-fan-speed': msg('Set fan speed?'),
    'input-map': msg('Map'),
    'input-service': msg('Service to call'),
    'input-segment': msg('Segment'),
    'input-current-clean-area': msg('Current clean area'),
    'input-current-clean-duration': msg('Current clean duration'),
    'input-battery': msg('Battery'),
    'input-mop-intensite': msg('Mop intensite'),
    'input-command': msg('Command'),
    'action-add-segment': msg('Add segment'),
    'action-add-shortcut': msg('Add shortcut'),
    'action-delete-shortcut': msg('Delete shortcut'),
    'action-edit-shortcut': msg('Edit shortcut'),
    'input-vacuum-entity': msg('Vacuum entity'),
    'text-no-vacuum': msg('No vacuum configured.'),
  };
}

export function vacuumSectionIcons(): Record<string, string> {
  return {
    'section-title-sensor':              'mdi:sine-wave',
    'section-title-default-actions':     'mdi:gesture-tap',
    'section-title-shortcuts':           'mdi:lightning-bolt-outline',
    'section-title-segments':            'mdi:floor-plan',
  };
}
