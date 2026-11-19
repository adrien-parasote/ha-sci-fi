// ─── hass-action — what the HA frontend does with a card's action, played locally ─
// Spec: docs/specs/hexa-tiles-quick-actions/spec.md FR-16 (ADR-007 workbench).
//
// A card emits `hass-action`; in Home Assistant the frontend resolves it and
// calls the domain's service. The workbench has no frontend, so this module
// plays that part for `toggle` and only logs every other action.

import { log } from './console.js';

/** In Mock mode the state mutation waits, so the card's pending state can be seen. */
export const MOCK_DELAY_MS = 3000;

/** Scenario flag: the relay swallows the pulse — no mutation, the card ends on its no-change mark. */
export const MUTED_RELAY = '_muted_relay';

/** The action the gesture resolves to, read the way the frontend reads it. */
function resolvedAction(detail) {
  const config = detail?.config ?? {};
  if (detail?.action === 'hold') return config.hold_action;
  if (detail?.action === 'double_tap') return config.double_tap_action;
  return config.tap_action;
}

/** Toggle by domain: a closed cover opens, any other cover closes; `on` turns off, anything else turns on. */
function toggleService(domain, state) {
  if (domain === 'cover') return state === 'closed' ? 'open_cover' : 'close_cover';
  return state === 'on' ? 'turn_off' : 'turn_on';
}

/**
 * Handle one `hass-action` detail.
 * @param {{action: string, config: object}} detail - the event detail the card dispatched
 * @param {{hass: object, live: boolean, scenario?: object}} ctx - current hass, Live mode, current scenario
 */
export function handleHassAction(detail, { hass, live, scenario = {} }) {
  const action = resolvedAction(detail);
  const entity = detail?.config?.entity;
  if (action?.action !== 'toggle' || !entity) {
    log(`🎯 hass-action ${detail?.action ?? '?'} → ${action?.action ?? 'none'}${entity ? ` (${entity})` : ''}`, 'info');
    return;
  }
  const domain = entity.split('.')[0];
  const service = toggleService(domain, hass.states[entity]?.state);
  if (!live && scenario[MUTED_RELAY]) {
    log(`🔇 hass-action toggle ${entity} → ${domain}.${service} swallowed (muted relay)`, 'warn');
    return;
  }
  // A service HA rejects (entity unavailable, service missing) is logged, never left unhandled.
  const failed = (err) => log(`❌ hass-action toggle ${entity} → ${domain}.${service} failed: ${err?.message ?? err}`, 'error');
  // Both workbench hass objects return a promise from callService (Live: async, Mock: Promise.resolve()).
  const call = () => {
    Promise.resolve(hass.callService(domain, service, { entity_id: entity })).catch(failed);
  };
  if (live) {
    call();
    return;
  }
  log(`⏳ hass-action toggle ${entity} → ${domain}.${service} in ${MOCK_DELAY_MS / 1000} s`, 'info');
  setTimeout(call, MOCK_DELAY_MS);
}
