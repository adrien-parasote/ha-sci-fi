# Fix lot — stove-pellet-cost

1 observation(s): 1 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-06T21:39:29Z

## O1 — Done: opened the stove card in the workbench at phone width with pellet_cost set. Seen: the cost cell wraps onto a second row under the gauges and overlaps the sensor list (Temps avant entretien); the icon floats alone. Expected: a third tight column to the right of the stock, no wrap — icon 24px bottom-aligned, 'Coût' then the amount on two lines. Reported by the user, 2026-11-06.

Bead: ha-sci-fi-6wtk.1
Test: `npx vitest run tests/cards/stove/sci-fi-stove-pellet-cost.test.ts -t test_O1` — green 2026-11-06T21:39:12Z
