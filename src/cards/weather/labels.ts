/**
 * Editor labels for the sci-fi-weather card.
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

export function weatherLabels(): Record<string, string> {
  return {
    'section-title-chart': msg('Chart'),
    'section-title-alert': msg('Alert'),
    'input-daily-forecast-number': msg('Forecast number of days'),
    'input-chart-first-focus-data': msg('First data targeted on the chart'),
  };
}

export function weatherSectionIcons(): Record<string, string> {
  return {
    'section-title-chart':               'mdi:chart-bell-curve',
    'section-title-alert':               'mdi:alert',
  };
}
