/**
 * vehicle_const.ts — Vehicle card constants
 * Ported from main:src/helpers/entities/vehicle/vehicle_const.js
 * Spec 12 § Constants
 */

// ── Renault HA service ────────────────────────────────────────────────────────
export const HASS_RENAULT_SERVICE = 'renault';
export const HASS_RENAULT_SERVICE_ACTION_START_AC = 'ac_start';
export const HASS_RENAULT_SERVICE_ACTION_STOP_AC = 'ac_cancel';

// ── Generic sensor states ─────────────────────────────────────────────────────
export const VEHICLE_SENSOR_ON_STATE = 'on';
export const VEHICLE_SENSOR_UNAVAILABLE_STATE = 'unavailable';

// ── Charge states ─────────────────────────────────────────────────────────────
export const VEHICLE_CHARGE_STATES_NOT_IN_CHARGE = 'not_in_charge';
export const VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE = 'waiting_for_a_planned_charge';
export const VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE = 'waiting_for_current_charge';
export const VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS = 'charge_in_progress';
export const VEHICLE_CHARGE_STATES_CHARGE_ENDED = 'charge_ended';
export const VEHICLE_CHARGE_STATES_CHARGE_ERROR = 'charge_error';
export const VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED = 'energy_flap_opened';
export const VEHICLE_CHARGE_STATES_UNAVAILABLE = 'unavailable';

// ── Plug states ───────────────────────────────────────────────────────────────
export const VEHICLE_PLUG_STATES_UNPLUGGED = 'unplugged';
export const VEHICLE_PLUG_STATES_PLUGGED = 'plugged';
export const VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE = 'plugged_waiting_for_charge';
export const VEHICLE_PLUG_STATES_ERROR = 'plug_error';
export const VEHICLE_PLUG_STATES_UNKNOWN = 'plug_unknown';
export const VEHICLE_PLUG_UNAVAILABLE = 'unavailable';

// ── Charge state → icon map ───────────────────────────────────────────────────
export const CHARGE_STATE_ICONS: Readonly<Record<string, string>> = {
  [VEHICLE_CHARGE_STATES_NOT_IN_CHARGE]:            'mdi:battery-off',
  [VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE]:   'mdi:battery-clock',
  [VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE]:   'mdi:battery-clock',
  [VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS]:       'mdi:battery-charging-medium',
  [VEHICLE_CHARGE_STATES_CHARGE_ENDED]:             'mdi:battery-check',
  [VEHICLE_CHARGE_STATES_CHARGE_ERROR]:             'mdi:battery-alert-variant',
  [VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED]:       'mdi:battery-unknown',
  [VEHICLE_CHARGE_STATES_UNAVAILABLE]:              'mdi:battery-unknown',
};

// ── Plug state → icon map ─────────────────────────────────────────────────────
export const PLUG_STATE_ICONS: Readonly<Record<string, string>> = {
  [VEHICLE_PLUG_STATES_UNPLUGGED]:                     'sci:landspeeder-plugged-off',
  [VEHICLE_PLUG_STATES_PLUGGED]:                       'sci:landspeeder-plugged',
  [VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE]:    'sci:landspeeder-plugged-clock',
  [VEHICLE_PLUG_STATES_ERROR]:                         'sci:landspeeder-error-plug',
  [VEHICLE_PLUG_STATES_UNKNOWN]:                       'sci:landspeeder-unknown-plug',
  [VEHICLE_PLUG_UNAVAILABLE]:                          'sci:landspeeder-unknown-plug',
};
