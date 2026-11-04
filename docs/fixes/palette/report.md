# Fix lot — palette

11 observation(s): 10 fixed, 1 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-04T20:10:13Z

## O1 — [ha-sci-fi-03i] palette vacuum: replis qui derivent (--sf-bg black, --sf-radius 8px, --sf-font-size-*)

Bead: ha-sci-fi-hb5c.1
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O1_` — green 2026-11-04T20:09:58Z

## O2 — [ha-sci-fi-3z0j] palette tv: --sf-glow-cyan/red/navy/cyan-active, --sf-bg-active, --sf-telemetry-border non declares (47 sites)

Bead: ha-sci-fi-hb5c.2
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O2_` — green 2026-11-04T20:09:58Z

## O3 — [ha-sci-fi-7ge9] palette hexa-tiles: --sf-orange(-dim), --sf-success/warning/error-dim, --sf-tile-active/inactive-bg non declares + replis text-disabled 0.4 et text-primary #ffffff

Bead: ha-sci-fi-hb5c.3
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O3_` — green 2026-11-04T20:09:59Z

## O4 — [ha-sci-fi-gmvv] palette weather: replis text-primary et fantomes --primary-bg-color / --secondary-bg-color (vraie variable HA: --secondary-background-color)

Bead: ha-sci-fi-hb5c.4
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O4_` — green 2026-11-04T20:10:00Z

## O5 — [ha-sci-fi-rhd] palette climates: --sf-season-blue/green/orange/yellow non declares

Bead: ha-sci-fi-hb5c.5
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O5_` — green 2026-11-04T20:10:00Z

## O6 — [ha-sci-fi-td4b] palette water: --sf-font-body et --sf-font-mono non declares (repli monospace)

Bead: ha-sci-fi-hb5c.6
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O6_` — green 2026-11-04T20:10:01Z

## O7 — [ha-sci-fi-xi7] palette stove: replis qui derivent (--sf-text-secondary #b0bec5/#7ca8c9) et fantome --secondary-bg-color

Bead: ha-sci-fi-hb5c.7
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O7_` — green 2026-11-04T20:10:02Z

## O8 — [ha-sci-fi-yj6] palette bridge: --sf-text, --sf-font, --sf-glow-cyan non declares + replis qui derivent (text-disabled #555/#666/#777, radius 8px, spacing-md 12px)

Bead: ha-sci-fi-hb5c.8
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O8_` — green 2026-11-04T20:10:02Z

## O9 — [ha-sci-fi-3oe0] hexa-tiles styles: fallback #ff4d6d of the red alert stroke is dead code (--sf-error always defined)

Bead: ha-sci-fi-hb5c.9
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O9_` — green 2026-11-04T20:10:03Z

## O10 — [ha-sci-fi-0z0] socle: les 11 composants d'editor-inputs sont hors de toute famille de tokens

Bead: ha-sci-fi-hb5c.10
ESCALATED → ha-sci-fi-29mt (adds a capability, or past a ceiling)

## O11 — [ha-sci-fi-x6e] palette: --sf-font-size-* use rem but HA sets 24px on :root, so 0.75rem renders 18px — DÉCISION (déléguée par l'utilisateur) : passer en px 12/14/16/20

Bead: ha-sci-fi-hb5c.11
Test: `npx vitest run tests/styles/palette-lot.test.ts -t test_O11_` — green 2026-11-04T20:10:04Z
