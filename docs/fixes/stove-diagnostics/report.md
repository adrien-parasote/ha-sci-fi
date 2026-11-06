# Fix lot — stove-diagnostics

1 observation(s): 1 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-06T10:17:35Z

## O1 — Stove card diagnostics (stove-diagnostics FR-8): with the door open (or an alert/error) the information shows twice, as the badge icon at the top right of the illustration and as the status line in the middle. Seen by Adrien in the workbench 2026-11-06. Expected: only the middle line; the top-right badge is removed.

Bead: ha-sci-fi-km1q.1
Test: `npx vitest run tests/cards/stove/sci-fi-stove-diagnostics.test.ts -t test_O1_` — green 2026-11-06T10:17:00Z
