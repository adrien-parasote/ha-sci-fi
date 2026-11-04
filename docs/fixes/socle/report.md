# Fix lot — socle

5 observation(s): 4 fixed, 1 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-04T20:27:01Z

## O1 — [ha-sci-fi-14z] bridgeConfigMetadata est un export mort : aucun consommateur dans src, tests ni dev

Bead: ha-sci-fi-oyir.1
ESCALATED → ha-sci-fi-14z (adds a capability, or past a ceiling)

## O2 — [ha-sci-fi-u9a] socle: six exports de src/selectors n'ont aucun appelant

Bead: ha-sci-fi-oyir.2
Test: `npx vitest run tests/fixes/socle/O2.test.ts` — green 2026-11-04T20:26:46Z

## O3 — [ha-sci-fi-kw1] socle: HassEntityEntry.domain est obligatoire pour un champ que HA n'envoie pas

Bead: ha-sci-fi-oyir.3
Test: `npx vitest run tests/fixes/socle/O3.test.ts` — green 2026-11-04T20:26:47Z

## O4 — [ha-sci-fi-djb] socle: isClimateActive dit heating et rend pas-eteint

Bead: ha-sci-fi-oyir.4
Test: `npx vitest run tests/fixes/socle/O4.test.ts` — green 2026-11-04T20:26:48Z

## O5 — [ha-sci-fi-4syw] socle: constante d'identifiants d'entite complets (sun.sun, stubs) — suite de domain-constants

Bead: ha-sci-fi-oyir.5
Test: `npx vitest run tests/fixes/socle/O5.test.ts` — green 2026-11-04T20:26:49Z
