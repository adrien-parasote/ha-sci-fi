/**
 * plug_const.ts — Plugs card constants
 * Ported from main:src/helpers/entities/plug/plug_const.js
 * and main:src/cards/plugs/const.js
 */

import { DOMAIN } from '../../types/domains.js';

// ── Switch service ────────────────────────────────────────────────────────────

export const PLUG_STATE_ON = 'on';

export const HASS_PLUG_SERVICE = DOMAIN.SWITCH;
export const HASS_PLUG_SERVICE_ACTION_TURN_ON = 'turn_on';
export const HASS_PLUG_SERVICE_ACTION_TURN_OFF = 'turn_off';

// ── Chart colors ──────────────────────────────────────────────────────────────

export const CHART_BG_COLOR = 'rgba(105, 211, 251, 0.5)';
export const CHART_BORDER_COLOR = 'rgb(102, 156, 210)';
