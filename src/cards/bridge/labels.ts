/**
 * Editor labels for the sci-fi-bridge card.
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

export function bridgeLabels(): Record<string, string> {
  return {
    'section-title-crew': msg('Crew'),
    'section-title-alerts': msg('Alerts'),
    'section-title-access': msg('Access'),
    'section-title-automations': msg('Automations'),
    'section-title-appliances': msg('Appliances'),
    'section-title-stove': msg('Stove'),
    'section-title-action': msg('Action'),
    'section-title-actions': msg('Actions'),
    'action-enable-section': msg('Enable section'),
    'action-disable': msg('Disable'),
    'action-remove': msg('Remove'),
    'action-add-smoke': msg('Smoke'),
    'action-add-toggle': msg('Toggle'),
    'action-add-appliance': msg('Appliance'),
    'action-add-consumable': msg('Consumable'),
    'input-icon-section': msg('Section icon'),
    'input-smoke-sensors': msg('Smoke sensors'),
    'input-binary-sensor-entity': msg('binary_sensor entity'),
    'input-icon-optional': msg('Icon (opt.)'),
    'input-siren-switch': msg('Siren switch (optional)'),
    'input-alert-toggles': msg('Alert toggles'),
    'input-occupancy-entity': msg('Occupancy entity (opt.)'),
    'input-cover-entity': msg('Cover entity'),
    'input-lock-optional': msg('Lock (optional)'),
    'input-action-entity': msg('Entity (input_button / script / automation)'),
    'input-color-optional': msg('Color (opt.)'),
    'input-type': msg('Type'),
    'input-min': msg('Min'),
    'input-max': msg('Max'),
    'input-step': msg('Step'),
    'input-unit': msg('Unit'),
    'input-appliances': msg('Appliances'),
    'input-consumables': msg('Consumables (optional)'),
    'input-power-sensor': msg('Power sensor (W)'),
    'input-pellet-qty-sensor': msg('Pellet quantity sensor'),
    'input-status-sensor': msg('ON/OFF status sensor'),
    'input-bag-counter': msg('Bag stock counter'),
    'input-pellet-low-threshold': msg('Pellet low threshold (0.0–1.0)'),
    'input-ok-when': msg('OK when'),
  };
}
