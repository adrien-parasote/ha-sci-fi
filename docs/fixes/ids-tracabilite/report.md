# Fix lot — ids-tracabilite

7 observation(s): 6 fixed, 1 escalated, 0 UNREPRODUCED.

Whole suite: `npm test` — green 2026-11-01T13:36:58Z

## O1 — Aucune des 17 tables `## Blueprint Coverage` de `docs/specs/` ne porte de colonne `Covers` : les 145 lignes F ne sont tracées que vers des sections de spec, jamais vers des cas de test, donc la traçabilité exigence → test n'existe dans aucune spec. Mesuré : `grep -rlE '\| *Covers *\|' docs/specs/` → 0 fichier ; témoin positif `## Test Case Specifications` → 10 specs cartes. Attendu : chaque ligne F porte les ids TC/IT qui la couvrent, ou une marque explicite d'absence de couverture. Rapporté par le retrocheck du 2026-10-31 (bead ha-sci-fi-zv1), arbitrage utilisateur du 2026-11-01 : garder le schéma maison F-<CARTE>-NN et le rendre traçable, pas de rétrofit FR-NN.

Bead: ha-sci-fi-p6v.1
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O1:"` — green 2026-11-01T13:36:48Z

## O2 — `docs/specs/cards/water.md` est typée `> Document type: Implementation` et n'a aucune table `## Blueprint Coverage` : ses exigences ne sont listées nulle part. Mesuré : `grep -c '^## .*Blueprint Coverage' docs/specs/cards/water.md` → 0, alors que les 6 autres specs cartes d'implémentation en portent une. Attendu : une table Blueprint Coverage pour water.md, avec sa colonne Covers.

Bead: ha-sci-fi-p6v.2
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O2:"` — green 2026-11-01T13:36:49Z

## O3 — `docs/specs/cards/weather.md` ne déclare aucun type de document, alors que `climates.md` et `lights.md` — annexes de contrat YAML du même genre, dont la spec d'implémentation vit dans `05_cards.md` — portent `> Document Type: Reference` en tête. Mesuré : `head -3` des trois fichiers. Conséquence : weather.md se lit comme une spec d'implémentation incomplète, et le retrocheck lui a reproché une table Blueprint manquante qu'elle ne doit pas porter. Attendu : weather.md typée Reference comme ses deux sœurs.

Bead: ha-sci-fi-p6v.3
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O3"` — green 2026-11-01T13:36:50Z

## O4 — La règle qui décide quelles specs portent une table Blueprint Coverage n'est écrite nulle part : les specs l'appliquent de fait — une spec `Reference` porte des contrats YAML, pas des exigences, et son exigence vit dans `05_cards.md` (F-CARD-02/03/05) — mais rien ne l'énonce et rien ne la tient. Mesuré : `grep -rn 'Blueprint Coverage' docs/MASTER.md docs/specs/00*.md` → aucune définition de la règle. Conséquence mesurée : le retrocheck du 2026-10-31 a compté 4 tables manquantes là où une seule l'est vraiment. Attendu : la règle énoncée dans MASTER.md et tenue par une garde.

Bead: ha-sci-fi-p6v.4
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O4"` — green 2026-11-01T13:36:50Z

## O5 — 30 des 56 pointeurs `This spec § X` des tables Blueprint visent une section qui n'existe pas dans le fichier : 22 absences franches (ex. `docs/specs/cards/vacuum.md` F-VAC-D01 → `§ Header`, aucun titre `Header` ; `water_history.md` F-WATER-HIST-01 → `§ Visual Design`, absent) et 8 quasi-correspondances (`§ Constants` quand le titre est `## Constants — plug_const.ts`). Mesuré par comparaison des pointeurs aux titres `^#{2,6}` de chaque fichier ; témoin positif : 48 pointeurs résolvent. Attendu : chaque pointeur nomme un titre existant, exactement.

Bead: ha-sci-fi-p6v.5
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O5:"` — green 2026-11-01T13:36:51Z

## O6 — Trois lignes Blueprint portent `✅` pour du code qui n'existe pas. Mesuré : F-INFRA-03 « ✅ Vite dev server » — aucun `vite.config*` dans le dépôt, `npm run dev` est `rollup -c --watch` ; F-INFRA-06 « ✅ `.devcontainer/` » — répertoire absent ; F-COMP-03 « ✅ `sf-accordion`, `sf-tabs`, `sf-toggle-switch` » — seul `sf-toggle-switch` existe sous ce nom, l'accordéon est `sf-editor-accordion`, et aucun composant `sf-tabs` n'existe (témoin positif : `grep -rlin tabs src/` ne sort que des classes CSS dans `sci-fi-vacuum-editor.ts` et `editor-common.ts`, quand `accordion` sort 3 composants). Attendu : chaque cellule dit l'état mesuré, et `⬜ not delivered` là où rien n'est livré.

Bead: ha-sci-fi-p6v.6
Test: `npx vitest run tests/specs/blueprint-traceability.test.ts -t "O6:"` — green 2026-11-01T13:36:52Z

## O7 — Deux specs cartes se partagent le meme espace d ids de cas de test : docs/specs/cards/tv.md emploie TC-701 a TC-715 et IT-701 a IT-704, docs/specs/cards/hexa-tiles.md emploie TC-701 a TC-709 et IT-701 a IT-703. Mesure : les deux fichiers sortent les memes ids (grep -oE "(TC|IT)-70[0-9]"), et aucun autre couple de specs ne collisionne (temoin positif : les autres cartes emploient des plages distinctes, 1101+ pour stove, 1301+ pour plugs). Consequence : une colonne Covers qui dit TC-701 est ambigue entre deux specs, et la tracabilite que ce lot installe est fausse la ou elle collisionne. Attendu : un espace d ids propre par spec, et les cas de tv.md renumerotes puisque hexa-tiles.md est la plus ancienne des deux.

Bead: ha-sci-fi-p6v.7
ESCALATED → ha-sci-fi-cft (adds a capability, or past a ceiling)
