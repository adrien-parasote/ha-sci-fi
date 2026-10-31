# Fix lot — stove-config-surface

7 observation(s): 7 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-10-31T21:45:21Z

## O1 — Les deux libelles de puissance sont inverses dans l editeur du poele. STOVE_SENSOR_FIELDS mappe `sensor_actual_power` sur la cle `input-stove-power-consume` (src/cards/stove/sci-fi-stove-editor.ts:24) et `sensor_power` sur `input-stove-power-rendered` (:29), alors que la carte rend `actual_power` sous `msg('Render')` et `power` sous `msg('Consume')` (src/cards/stove/sci-fi-stove.ts:317-318), ce dont docs/cards/stove.md est d accord. Attendu : l editeur etiquette chaque champ comme la carte le rend, pour que l utilisateur qui configure par l UI ne remplisse plus le mauvais champ. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-28).

Bead: ha-sci-fi-8lt.1
Test: `npx vitest run tests/cards/stove/sci-fi-stove-editor.test.ts -t 'O1 —'` — green 2026-10-31T21:45:10Z

## O2 — `pellet_quantity_threshold` a quatre valeurs par defaut differentes selon ou on regarde : la table d options de docs/cards/stove.md:71 dit 0.5, l exemple YAML du meme fichier (:59) dit 0.4, la carte prend 0.1 (src/cards/stove/sci-fi-stove.ts:182) et le curseur de l editeur affiche 0.2 (src/cards/stove/sci-fi-stove-editor.ts:123). Attendu, tranche par l utilisateur : 0.1 partout, la valeur que vit tout tableau de bord deja livre — l aligner ailleurs ne change le comportement de personne. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-29).

Bead: ha-sci-fi-8lt.2
Test: `npx vitest run tests/cards/stove/sci-fi-stove-editor.test.ts -t 'O2'` — green 2026-10-31T21:45:11Z

## O3 — `storage_counter_threshold` diverge de la meme facon : docs/cards/stove.md:73 dit 0.1 en table et :61 dit 0.07 en exemple, la carte prend 0.1 (src/cards/stove/sci-fi-stove.ts:198) et le meme curseur d editeur affiche 0.2 (src/cards/stove/sci-fi-stove-editor.ts:123). Attendu : 0.1 partout, comme pour le seuil pellet. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-29).

Bead: ha-sci-fi-8lt.3
Test: `npx vitest run tests/cards/stove/sci-fi-stove-editor.test.ts -t 'O3'` — green 2026-10-31T21:45:12Z

## O4 — Le champ de l entite principale du poele est etiquete avec la cle de libelle du capteur de statut. src/cards/stove/sci-fi-stove-editor.ts:81 passe `input-stove-status` comme cle au champ `entity`, la meme cle que :30 donne a `sensor_status` : le champ de l entite climate s affiche donc sous le libelle du capteur de statut. Attendu : une cle de libelle propre au champ `entity`, distincte de celle du capteur. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-30).

Bead: ha-sci-fi-8lt.4
Test: `npx vitest run tests/cards/stove/sci-fi-stove-editor.test.ts -t 'O4 —'` — green 2026-10-31T21:45:12Z

## O5 — Quatre toasts de la barre inferieure du poele sont des litteraux francais en dur, hors du circuit msg() : src/cards/stove/sci-fi-stove.ts:455 « Mode HVAC modifie », :464 « Temperature modifiee », :472 « Mode eco modifie », :480 « Preset modifie ». La correction C12 de la spec avait justement passe les cles de cette barre en msg() anglais pour que lit-localize les resolve. Attendu : les quatre messages passent par msg(), avec leur trans-unit dans xliff/fr.xlf et leur template dans src/locales/fr.js. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-27, et bead ha-sci-fi-dp3).

Bead: ha-sci-fi-8lt.5
Test: `npx vitest run tests/cards/stove/sci-fi-stove.test.ts -t 'O5 —'` — green 2026-10-31T21:45:13Z

## O6 — Le contrat de champs capteur de l editeur du poele n est teste par rien. tests/cards/stove/sci-fi-stove-editor.test.ts epingle `room_temperature` (:52,56), `threshold` (:71,75) et `custom_field` (:90,94) — trois cles absentes de SciFiStoveSensors et de SciFiStoveConfig — et aucun test n asserte que les vraies cles capteur sont rendues ni emises. Le contrat ADR-005 de cette carte est donc non teste, et c est ce qui a laisse passer les trois constats ci-dessus. Attendu : un test qui asserte le rendu et l emission des vraies cles. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-4h4, constat ST-31).

Bead: ha-sci-fi-8lt.6
Test: `npx vitest run tests/cards/stove/sci-fi-stove-editor.test.ts -t 'O6 —'` — green 2026-10-31T21:45:14Z

## O7 — Le defaut d icone du poele diverge entre la carte du bridge et son editeur. L editeur affiche `mdi:fire` comme valeur par defaut du champ icone (src/cards/bridge/sci-fi-bridge-editor.ts:729 sur l accordeon et :734 sur le champ) alors que la section rend `sci:stove` quand le champ est vide (src/cards/bridge/sections/sf-bridge-stove.ts:58). Un utilisateur ouvre l editeur, voit mdi:fire, ne touche a rien, et sa carte affiche sci:stove. Le lot fix test-spec-divergence a tranche en faveur de `sci:stove` et amende TC-BRIDGE-U-19 en ce sens. Attendu : l editeur sur `sci:stove` aux deux endroits. Rapporte par le lot fix test-spec-divergence (bead ha-sci-fi-gxd).

Bead: ha-sci-fi-8lt.7
Test: `npx vitest run tests/cards/bridge/sci-fi-bridge-editor.test.ts -t 'O7 —'` — green 2026-10-31T21:45:15Z
