/**
 * bridge-toast.ts — Toast bridge adapter for all bridge sections
 *
 * Bridge sections live in Shadow DOM and cannot directly call the parent's sf-toast.
 * Instead, they dispatch a `bridge-toast` CustomEvent that bubbles up to the
 * sci-fi-bridge root card, which forwards it to its embedded <sf-toast>.
 *
 * Usage: bridgeToast(hostElement, 'Section activated', false);
 *   - element: any HTMLElement in the section (used as dispatch origin)
 *   - message: the toast text
 *   - error:   true = error, false = success (default)
 */

export function bridgeToast(element: Element, message: string, error = false): void {
  element.dispatchEvent(
    new CustomEvent('bridge-toast', {
      bubbles:  true,
      composed: true, // cross Shadow DOM boundary
      detail:   { message, error },
    })
  );
}
