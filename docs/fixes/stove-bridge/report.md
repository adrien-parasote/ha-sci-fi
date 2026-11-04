# Fix lot — stove-bridge

6 observation(s): 5 fixed, 0 escalated, 1 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-04T20:43:47Z

## O1 — [ha-sci-fi-15v] stove/bridge : la meme entite de pellets est lue en pourcentage d un cote et en ratio de l autre — DÉCISION utilisateur : aligner la carte stove sur le bridge (valeur <= 1 lue comme ratio)

Bead: ha-sci-fi-lv6l.1
Test: `npx vitest run tests/fixes/stove-bridge/O1.test.ts` — green 2026-11-04T20:43:34Z

## O2 — [ha-sci-fi-bnf] stove : une config sans `entity` est acceptee — la spec prescrit la carte d'erreur, trancher si setConfig doit refuser — DÉCISION utilisateur : option 2, setConfig refuse une config sans entity (spec stove amendée)

Bead: ha-sci-fi-lv6l.2
Test: `npx vitest run tests/fixes/stove-bridge/O2.test.ts` — green 2026-11-04T20:43:34Z

## O3 — [ha-sci-fi-e9r] 10_card_editors.md:727 prescrit pour l editeur stove un etat _climates et aucun champ entity — l editeur livre n a ni l un ni l autre

Bead: ha-sci-fi-lv6l.3
Test: `npx vitest run tests/fixes/stove-bridge/O3.test.ts` — green 2026-11-04T20:43:35Z

## O4 — [ha-sci-fi-jex] workbench : les fixtures du poêle sont restées sur l'intégration HACS

Bead: ha-sci-fi-lv6l.4
Test: `npx vitest run tests/fixes/stove-bridge/O4.test.ts` — green 2026-11-04T20:43:36Z

## O5 — [ha-sci-fi-prw] bridge-validate : running_states n'est pas vérifié comme tableau de chaînes

Bead: ha-sci-fi-lv6l.5
Test: `npx vitest run tests/fixes/stove-bridge/O5.test.ts` — green 2026-11-04T20:43:36Z

## O6 — [ha-sci-fi-zur] Carte bridge : garde sur .entity quand un élément de config n'a pas d'entity

Bead: ha-sci-fi-lv6l.6
UNREPRODUCED — sf-bridge-actions.ts:69/:98 et sf-bridge-appliances.ts:21 ne sont jamais atteints sans entity : sci-fi-bridge.setConfig appelle validateBridgeConfig, dont firstBadElement refuse tout element de actions.items et appliances.cycles sans entity string ('<path>[i].entity: expected a string', FR-8 de bridge-error-matrix, TC-BEM-U-12). Aucun chemin de la carte ne dereference un entity absent.
