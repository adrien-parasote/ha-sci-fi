# Fix lot — vague-2

3 observation(s): 3 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-05T07:46:41Z

## O1 — ha-sci-fi-dcgo: weather, lights and water render WEATHER_ICON_SET templates straight into their shadow DOM, bypassing sf-icon, so two animated weather icons of one card share SVG ids; expected: each goes through sf-icon, which scopes its ids

Bead: ha-sci-fi-1zil.1
Test: `npx vitest run tests/fixes/vague-2/O1.test.ts tests/cards/weather tests/cards/lights tests/cards/water` — green 2026-11-05T07:46:23Z

## O2 — ha-sci-fi-ckw: src/utils/toast.ts (showToast) has no caller, only its own test; <sf-toast> is the one toast mechanism; expected: the dead module and its test removed, spec 03 § Les deux toasts amended

Bead: ha-sci-fi-1zil.2
Test: `npx vitest run tests/specs/socle-contract.test.ts` — green 2026-11-05T07:46:24Z

## O3 — tests/fixes/vague-1/O5.test.ts:19 fails tsc --noEmit (entity not in SciFiBaseConfig), left by lot vague-1; expected: the test typechecks

Bead: ha-sci-fi-1zil.3
Test: `npx tsc --noEmit -p .` — green 2026-11-05T07:46:26Z
