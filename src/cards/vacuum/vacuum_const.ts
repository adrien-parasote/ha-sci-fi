/**
 * vacuum_const.ts — Constants for sci-fi-vacuum card.
 * Ported from main:src/helpers/entities/vacuum/vacuum_const.js
 */

export const VACUUM_STATE_CLEANING    = 'cleaning';
export const VACUUM_STATE_DOCKED      = 'docked';
export const VACUUM_STATE_ERROR       = 'error';
export const VACUUM_STATE_IDLE        = 'idle';
export const VACUUM_STATE_PAUSE       = 'paused';
export const VACUUM_STATE_RETURNING   = 'returning';
export const VACUUM_STATE_UNAVAILABLE = 'unavailable';
export const VACUUM_STATE_UNKNOWN     = 'unknown';

export const VACUUM_ACTIVITY_CLEAN     = 'CLEAN';
export const VACUUM_ACTIVITY_RETURNING = 'RETURNING';
export const VACUUM_ACTIVITY_IDLE      = 'IDLE';
export const VACUUM_ACTIVITY_DOCKED    = 'DOCKED';
export const VACUUM_ACTIVITY_ALERT     = 'ALERT';

export const VACUUM_ACTIVITY_STATE: Record<string, string> = {
  [VACUUM_STATE_CLEANING]:    VACUUM_ACTIVITY_CLEAN,
  [VACUUM_STATE_DOCKED]:      VACUUM_ACTIVITY_DOCKED,
  [VACUUM_STATE_ERROR]:       VACUUM_ACTIVITY_ALERT,
  [VACUUM_STATE_IDLE]:        VACUUM_ACTIVITY_IDLE,
  [VACUUM_STATE_PAUSE]:       VACUUM_ACTIVITY_IDLE,
  [VACUUM_STATE_RETURNING]:   VACUUM_ACTIVITY_RETURNING,
  [VACUUM_STATE_UNAVAILABLE]: VACUUM_ACTIVITY_ALERT,
  [VACUUM_STATE_UNKNOWN]:     VACUUM_ACTIVITY_ALERT,
};

export const VACUUM_ICONS: Record<string, string> = {
  [VACUUM_STATE_CLEANING]:    'mdi:robot-vacuum',
  [VACUUM_STATE_DOCKED]:      'sci:vacuum-docked',
  [VACUUM_STATE_ERROR]:       'mdi:robot-vacuum-alert',
  [VACUUM_STATE_IDLE]:        'sci:vacuum-sleep',
  [VACUUM_STATE_PAUSE]:       'sci:vacuum-sleep',
  [VACUUM_STATE_RETURNING]:   'mdi:robot-vacuum',
  [VACUUM_STATE_UNAVAILABLE]: 'mdi:robot-vacuum-off',
  [VACUUM_STATE_UNKNOWN]:     'mdi:robot-vacuum-off',
};

export const VACUUM_ACTION_START           = 'start';
export const VACUUM_ACTION_PAUSE           = 'pause';
export const VACUUM_ACTION_STOP            = 'stop';
export const VACUUM_ACTION_RETURN_TO_BASE  = 'return_to_base';
export const VACUUM_ACTION_SET_FAN_SPEED   = 'set_fan_speed';

export const VACUUM_ACTIONS_ICONS: Record<string, string> = {
  [VACUUM_ACTION_START]:           'mdi:play-circle-outline',
  [VACUUM_ACTION_PAUSE]:           'mdi:pause-circle-outline',
  [VACUUM_ACTION_STOP]:            'mdi:stop-circle-outline',
  [VACUUM_ACTION_RETURN_TO_BASE]:  'mdi:home-import-outline',
  [VACUUM_ACTION_SET_FAN_SPEED]:   'mdi:fan',
};

export const VACUUM_ACTION_KEYS = [
  VACUUM_ACTION_START,
  VACUUM_ACTION_PAUSE,
  VACUUM_ACTION_STOP,
  VACUUM_ACTION_RETURN_TO_BASE,
  VACUUM_ACTION_SET_FAN_SPEED,
] as const;
