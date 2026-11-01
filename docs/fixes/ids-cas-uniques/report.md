# Fix lot — ids-cas-uniques

2 observation(s): 2 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npm test` — green 2026-11-01T18:35:43Z

## O1 — 20 ids de cas de test collisionnent entre 7 specs cartes : climates.md, lights.md, water.md, water_history.md et weather.md declarent toutes TC-001 a TC-005 et IT-001 a IT-003 ; hexa-tiles.md et tv.md declarent toutes deux TC-701 a TC-709 et IT-701 a IT-703. Mesure du 2026-11-01 (bead ha-sci-fi-cft) : 286 lignes d'id declarees dans docs/specs, 242 ids distincts, 44 lignes en double. Attendu : un espace d'ids unique par spec, obtenu par un prefixe derive du nom de fichier, sur le modele de bridge.md qui porte deja TC-BRIDGE-U-NN et IT-BRIDGE-I-NN. Vu par la mesure du lot fix ids-tracabilite ; la collision mord des qu'une spec, un rapport ou une revue cite TC-701 sans nommer le fichier.

Bead: ha-sci-fi-xtg.1
Test: `npx vitest run tests/specs/ids-cas-uniques.test.ts -t "l’unicité"` — green 2026-11-01T18:35:36Z

## O2 — Les onze specs cartes autres que bridge.md ne portent aucun prefixe : rien dans l'arbre n'empeche la prochaine spec carte de repartir a TC-001 et de recollisionner. Attendu : la regle de nommage est derivee mecaniquement du nom de fichier et verifiee par un garde, pas tenue a la main.

Bead: ha-sci-fi-xtg.2
Test: `npx vitest run tests/specs/ids-cas-uniques.test.ts -t "la forme qui empêche la rechute"` — green 2026-11-01T18:35:37Z
