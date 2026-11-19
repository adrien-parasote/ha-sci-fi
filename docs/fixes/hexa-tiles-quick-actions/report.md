# Fix lot — hexa-tiles-quick-actions

1 observation(s): 1 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-19T17:09:36Z

## O1 — Done: in the workbench, clicked '↺ Recharger carte' after the page loaded. Seen: console error 'NotSupportedError: Failed to execute define on CustomElementRegistry: the name "sf-icon" has already been used with this registry' (reloadCard removes the bundle <script> and appends a fresh one, which re-runs every customElements.define). Expected: the button reloads the card on the rebuilt bundle with no error, staying on the selected card and scenario. By: the agent at the workbench, 2026-11-19, reported to the user, who asked for the fix.

Bead: ha-sci-fi-b92r.1
Test: `npx vitest run tests/dev/reload-card.test.ts tests/dev/bundle-loader.test.ts` — green 2026-11-19T17:09:21Z
