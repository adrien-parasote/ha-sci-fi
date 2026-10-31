/**
 * bridge-call.ts — the one way a bridge section calls a Home Assistant service.
 *
 * Every section used to write `void this.hass.callService(...)` and then emit
 * its success toast on the next line, synchronously. Two consequences, both
 * forbidden by bridge.md:
 *
 *   - the toast announced success BEFORE the call had resolved, so a failed
 *     service call still told the user it had worked;
 *   - no `.catch()` anywhere in the module, so a rejection was swallowed by
 *     `void` (or, in sf-bridge-actions, surfaced as an unhandled rejection
 *     because a `.finally()` without a `.catch()` re-throws).
 *
 * The behaviour on failure is the spec's, not an invention: AP#6 says
 * "Toujours `.catch((e) => console.error(...))` … ne pas exposer l'erreur à
 * l'utilisateur", and the Error Handling Matrix row for a failed `callService`
 * says "Aucun message visible — log console". So a rejection logs and stays
 * silent; only a resolved call produces a toast.
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { bridgeToast } from './bridge-toast.js';

export interface BridgeCallOptions {
  /** Ran once the call settles, with its outcome — for per-entity loading state. */
  readonly after?: (succeeded: boolean) => void;
}

/**
 * Calls a service and announces it only if it worked. Never rejects: callers
 * are `@click` handlers, and a rejecting handler is an unhandled rejection.
 */
export async function bridgeCall(
  element: Element,
  hass: HomeAssistantExt,
  domain: string,
  service: string,
  data: Record<string, unknown>,
  successMessage: string,
  options: BridgeCallOptions = {}
): Promise<void> {
  try {
    await hass.callService(domain, service, data);
    bridgeToast(element, successMessage, false);
    options.after?.(true);
  } catch (err) {
    console.error('[sf-bridge] callService error:', err);
    options.after?.(false);
  }
}
