# Fix lot — stove-fumis-core

3 observation(s): 3 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-10-31T16:00:36Z

## O1 — bridge/stove : la pastille d'etat affiche « Inactive » en permanence, poele en pleine combustion compris. sf-bridge-stove decide l'etat par `status === 'on'`, or aucun capteur fumis (binary_sensor HACS ou sensor enum core) ne renvoie jamais la chaine `on`. Vu par Adrien le 2026-10-31 sur HA 2026.10.4, carte v1.3.4 ; attendu : « Active » des que le poele chauffe, « Inactive » a l'arret et au refroidissement. Bead ha-sci-fi-uvl.

Bead: ha-sci-fi-eyp.1
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-stove.test.ts -t test_O1` — green 2026-10-31T16:00:28Z

## O2 — carte stove : sept des quatorze valeurs de `sensor.*_detailed_stove_status` de l'integration core (cold_start, cold_start_off, hybrid_init, hybrid_start, wood_start, wood_combustion, wood_burning_off) tombent sur l'icone de secours `sci:stove-unknow` avec un libelle auto-formate. Vu par Adrien le 2026-10-31 ; attendu : une icone et une couleur pour chacune, le fallback reserve a une valeur future inconnue. Bead ha-sci-fi-nib.

Bead: ha-sci-fi-eyp.2
Test: `npx vitest run tests/cards/stove/sci-fi-stove.test.ts -t test_O2` — green 2026-10-31T16:00:29Z

## O3 — carte stove : le troisieme controle de la barre du bas (Preset) s'affiche mais n'ouvre aucune liste. `preset_modes` est vide sur l'integration core, qui n'annonce pas PRESET_MODE et sort le mode eco en `switch.*_eco_mode`. Mesure par Adrien le 2026-10-31 sur HA 2026.10.4 ; attendu : une bascule sur le switch eco quand il est configure, le comportement actuel si `preset_modes` est renseigne, rien du tout sinon. Bead ha-sci-fi-1qy.

Bead: ha-sci-fi-eyp.3
Test: `npx vitest run tests/cards/stove/sci-fi-stove.test.ts -t test_O3` — green 2026-10-31T16:00:30Z
