# Fix lot — stove-wear-counters

2 observation(s): 2 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-06T09:44:52Z

## O1 — Stove card wear panel (stove-wear-counters FR-6): the collapsible 'Wear' accordion at the bottom of the card is ugly and holds statistics, not live state. Seen by Adrien on his live HA 2026-11-06. Expected: a stats view opened by a tap on a small icon of the card, nothing in the bottom panel.

Bead: ha-sci-fi-rxjw.1
Test: `npx vitest run tests/cards/stove/sci-fi-stove-wear-counters.test.ts -t test_O1_` — green 2026-11-06T09:44:32Z

## O2 — Stove card wear counters (stove-wear-counters FR-7): the heating time shows the raw 104.483333333333 h. Seen by Adrien on his live HA 2026-11-06. Expected: numeric values rounded to one decimal (104.5 h); counts stay integers.

Bead: ha-sci-fi-rxjw.2
Test: `npx vitest run tests/cards/stove/sci-fi-stove-wear-counters.test.ts -t test_O2_` — green 2026-11-06T09:44:34Z
