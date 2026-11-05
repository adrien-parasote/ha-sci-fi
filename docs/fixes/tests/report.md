# Fix lot — tests

4 observation(s): 4 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-05T05:58:36Z

## O1 — ha-sci-fi-2t4: the TC-306 guard (tests/utils/base-card.test.ts) misses an arrow-field willUpdate override and an intermediate SciFiBaseCard subclass; expected: an AST check catches both

Bead: ha-sci-fi-dii8.1
Test: `npx vitest run tests/utils/base-card.test.ts` — green 2026-11-05T05:58:21Z

## O2 — ha-sci-fi-knps: mutating DOMAIN.NUMBER, DOMAIN.COUNTER or DOMAIN.VALVE turns no test red; expected: a behaviour test per key

Bead: ha-sci-fi-dii8.2
Test: `npx vitest run tests/fixes/tests/O2.test.ts` — green 2026-11-05T05:58:21Z

## O3 — ha-sci-fi-z0l: the vacuum test titled TC-VACUUM-U-1524 asserts a malformed service, not the error toast of F-VAC-D07; expected: a real toast-error test

Bead: ha-sci-fi-dii8.3
Test: `npx vitest run tests/cards/vacuum/sci-fi-vacuum.test.ts` — green 2026-11-05T05:58:22Z

## O4 — ha-sci-fi-468: no test sees xliff/fr.xlf ids missing from src/locales/locales/fr.js after a forgotten localize-build; expected: an id parity test

Bead: ha-sci-fi-dii8.4
Test: `npx vitest run tests/i18n/catalogue.test.ts` — green 2026-11-05T05:58:24Z
