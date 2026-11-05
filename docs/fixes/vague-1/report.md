# Fix lot — vague-1

5 observation(s): 5 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-05T07:28:56Z

## O1 — ha-sci-fi-nu33: docs/specs/climates-floor-fallback/spec.md cites getFirstFloor (removed); expected: cites allFloors[0]?.floor_id as sci-fi-climates.ts does

Bead: ha-sci-fi-cnqg.1
Test: `npx vitest run tests/fixes/vague-1/O1.test.ts` — green 2026-11-05T07:28:42Z

## O2 — ha-sci-fi-doi3: tv.md and hexa-tiles.md are both titled Spec 07; expected: unique spec numbers

Bead: ha-sci-fi-cnqg.2
Test: `npx vitest run tests/docs/spec-numbering.test.ts tests/specs/delivered-design.test.ts` — green 2026-11-05T07:28:42Z

## O3 — ha-sci-fi-14z: bridgeConfigMetadata is a dead export; expected: removed, 05_cards.md AP#4 amended

Bead: ha-sci-fi-cnqg.3
Test: `npx vitest run tests/fixes/vague-1/O3.test.ts tests/specs/bridge-spec-structure.test.ts` — green 2026-11-05T07:28:43Z

## O4 — ha-sci-fi-1wp2: the pellet stock falls back to 100 (stove) and 20 (bridge) when the counter is absent; expected: 100 on both cards (user decision 2026-11-05, replacing 0 of 2026-11-04: a max of 0 divides by zero in sf-stack-bar)

Bead: ha-sci-fi-cnqg.4
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-stove.test.ts` — green 2026-11-05T07:28:44Z

## O5 — ha-sci-fi-iu8m: the stove editor entity field is free text; expected: a dropdown limited to climate.* entities (user decision 2026-11-04, 10_card_editors.md amended)

Bead: ha-sci-fi-cnqg.5
Test: `npx vitest run tests/fixes/vague-1/O5.test.ts tests/cards/stove/sci-fi-stove-editor.test.ts` — green 2026-11-05T07:28:45Z
