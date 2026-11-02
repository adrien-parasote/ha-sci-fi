import type { ActionConfig } from '../types/config.js';

/**
 * Dispatches a native Home Assistant Lovelace action event up the DOM tree.
 * The HA frontend intercepts this event and handles tap/hold/double_tap actions.
 */
export function fireHassAction(
  element: HTMLElement,
  config: {
    entity?: string;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
  },
  action: 'tap' | 'hold' | 'double_tap'
): void {
  const event = new CustomEvent('hass-action', {
    detail: {
      config,
      action,
    },
    bubbles: true,
    composed: true,
  });
  element.dispatchEvent(event);
}
