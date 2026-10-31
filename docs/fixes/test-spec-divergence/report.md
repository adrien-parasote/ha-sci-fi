# Fix lot — test-spec-divergence

16 observation(s): 15 fixed, 0 escalated, 1 UNREPRODUCED.

Whole suite: `npm test` — green 2026-10-31T18:53:25Z

## O1 — bridge U-12 asserte `.ring-other` en cyan ; la spec exige du jaune `--sf-warning`. Le test entérine le mapping de zones divergent au lieu de le détecter. Attendu : trancher qui a raison, puis l'assertion porte sur la couleur retenue. Relevé par le retrocheck du 2026-10-31 (bead ha-sci-fi-ae0).

Bead: ha-sci-fi-ajb.1
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-crew.test.ts -t "TC-BRIDGE-U-12"` — green 2026-10-31T18:53:08Z

## O2 — bridge U-11 asserte `.ring-home` ; la spec attend `.crew-zone-pill`, élément qui n'existe pas dans le code. Attendu : la spec cède ou l'élément est créé, et l'assertion porte sur le retenu.

Bead: ha-sci-fi-ajb.2
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-crew.test.ts -t "TC-BRIDGE-U-11"` — green 2026-10-31T18:53:09Z

## O3 — bridge U-19 asserte « defaulting to sci:stove » alors que la spec dit `mdi:fire`, et son propre input de test est `mdi:campfire`. Attendu : arbitrage, puis une assertion cohérente avec son input.

Bead: ha-sci-fi-ajb.3
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-stove.test.ts -t "TC-BRIDGE-U-19"` — green 2026-10-31T18:53:10Z

## O4 — bridge U-24 asserte les props des widgets ; la spec attend `.pellet-progress` en `--sf-error`, élément inexistant. Attendu : arbitrage, puis assertion sur le comportement retenu.

Bead: ha-sci-fi-ajb.4
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-stove.test.ts -t "TC-BRIDGE-U-24"` — green 2026-10-31T18:53:10Z

## O5 — bridge U-25 et U-26 assertent l'icône `sci:landspeeder` ; la spec attend les libellés d'état « Non connectée » et « En charge ». Attendu : arbitrage, puis assertion sur les libellés ou sur l'icône retenue.

Bead: ha-sci-fi-ajb.5
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-vehicle.test.ts -t "TC-BRIDGE-U-2"` — green 2026-10-31T18:53:11Z

## O6 — bridge U-21 n'asserte pas le texte « En cours » que la spec exige : couverture partielle sous un id de TC qui promet plus. Attendu : l'assertion couvre ce que son TC annonce.

Bead: ha-sci-fi-ajb.6
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-appliances.test.ts -t "TC-BRIDGE-U-21"` — green 2026-10-31T18:53:12Z

## O7 — bridge U-29 asserte la classe `disabled` sans sa valeur : 0.3 dans le code contre 0.4 exigé par la spec. Attendu : arbitrage sur la valeur, puis assertion sur la valeur et non la seule classe.

Bead: ha-sci-fi-ajb.7
Test: `npx vitest run tests/cards/bridge/sections/sf-bridge-access.test.ts -t "TC-BRIDGE-U-29"` — green 2026-10-31T18:53:13Z

## O8 — tv TC-739 documente le bug du mute au lieu de l'attraper : un commentaire « volume_mute is not in D_PAD_KEYS so commandString is undefined » puis un simple `expect(callServiceMock).toHaveBeenCalled()`. Attendu : le test attrape le défaut, ou le défaut est corrigé et le test le pin.

Bead: ha-sci-fi-ajb.8
UNREPRODUCED — defaut absent de l'arbre : deja corrige par 00367e0 (lot p1-runtime-defects). TC-739 supprime, volume_mute hors de D_PAD_KEYS par conception (docs/specs/cards/tv.md:97-101), _handleMuteClick appelle media_player.volume_mute (src/cards/tv/sci-fi-tv.ts:478-500). Le test qui le remplace asserte l'appel complet (tests/cards/tv/sci-fi-tv.test.ts:816). Aucun TC-739 n'a jamais existe dans docs/specs/cards/tv.md.

## O9 — water_history TC-005 recalcule l'algorithme de l'implémentation pour vérifier le format d'horodatage, donc il ne peut pas détecter que la spec attend `[08:26]` quand le code rend `DD/MM HH:MM`. Attendu : assertion sur un format littéral attendu.

Bead: ha-sci-fi-ajb.9
Test: `npx vitest run tests/cards/water/sci-fi-water-management.test.ts -t "TC-1205"` — green 2026-10-31T18:53:13Z

## O10 — water_history TC-003 et TC-004 enveloppent leur assertion dans `if (htmlOutput)` et appellent `_renderHistoryLogs()` sans argument, donc l'état vide se rend toujours : vacuité structurelle, les deux tests ne peuvent pas échouer. Attendu : appel avec argument et assertion inconditionnelle.

Bead: ha-sci-fi-ajb.10
Test: `npx vitest run tests/cards/water/sci-fi-water-management.test.ts -t "TC-1203"` — green 2026-10-31T18:53:14Z

## O11 — climates : le test est titré « respects excluded_entity_ids config », le nom de champ que l'AP#3 interdit, alors que son corps utilise correctement `entities_to_exclude`. Le titre réintroduit le nom banni dans le vocabulaire du dépôt. Attendu : titre aligné sur le champ réel.

Bead: ha-sci-fi-ajb.11
Test: `npx vitest run tests/cards/climates/sci-fi-climates.test.ts -t "TC-002"` — green 2026-10-31T18:53:15Z

## O12 — socle TC-306 écrit lui-même une sous-classe conforme puis asserte son propre drapeau : il ne peut pas détecter une sous-classe qui omet `super`. Attendu : le test exerce une sous-classe fautive et échoue sur elle.

Bead: ha-sci-fi-ajb.12
Test: `npx vitest run tests/utils/base-card.test.ts -t "TC-306"` — green 2026-10-31T18:53:16Z

## O13 — socle TC-303 n'asserte jamais l'appel à `setLocale`, qui est pourtant son objet. Attendu : l'assertion porte sur cet appel.

Bead: ha-sci-fi-ajb.13
Test: `npx vitest run tests/utils/base-card.test.ts -t "TC-303"` — green 2026-10-31T18:53:17Z

## O14 — socle TC-408 a une structure `if (typeof result === 'object') … else expect(result).toBe('')` qui passe sur les deux branches : une régression vers `''` resterait verte. Attendu : une seule branche attendue, assertion inconditionnelle.

Bead: ha-sci-fi-ajb.14
Test: `npx vitest run tests/components/sf-icon/sf-iconset.test.ts -t "TC-408"` — green 2026-10-31T18:53:17Z

## O15 — socle IT-201 : la spec exige des références identiques, le code et le test assertent explicitement l'inverse (`expect(floors1).not.toBe(floors2)`, commentaire « Immutability verification »). Code et test sont d'accord contre la spec. Attendu : trancher, puis spec et test alignés sur le retenu.

Bead: ha-sci-fi-ajb.15
Test: `npx vitest run tests/selectors/house.test.ts -t "IT-201"` — green 2026-10-31T18:53:18Z

## O16 — hexa-tiles IT-702 asserte `box-shadow: 0 0 \d+px var(--sf-primary`, dont l'unique correspondance dans la feuille est `.avatar` : le test nommé « les tuiles actives portent un halo de bordure » est vert sur l'avatar, car aucune règle `.hexa-tile[data-active="true"]` ne déclare de box-shadow. Attendu : l'assertion cible la tuile active, et la règle CSS existe ou la spec cède.

Bead: ha-sci-fi-ajb.16
Test: `npx vitest run tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts -t "IT-702"` — green 2026-10-31T18:53:19Z
