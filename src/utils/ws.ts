import type { HomeAssistantExt } from '../types/ha.js';

/**
 * One WebSocket call through `hass.callWS` when the host provides it, else
 * through the connection it wraps.
 */
export function callWS<T>(hass: HomeAssistantExt, message: Record<string, unknown>): Promise<T> {
  if (hass.callWS) return hass.callWS<T>(message);
  return hass.connection.sendMessagePromise<T>(message);
}
