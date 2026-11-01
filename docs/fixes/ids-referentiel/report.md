# Fix lot — ids-referentiel

16 observation(s): 16 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npm test` — green 2026-11-01T11:18:10Z

## O1 — O1 docs/specs/05_cards.md porte F-CARD-01 a F-CARD-08 pour 11 cartes livrees (sonde : ls -d src/cards/*/ rend bridge climates hexa-tiles lights plugs stove tv vacuum vehicles water weather). Le §YAML Config Contracts (l.36, titre « ADR-005 — Source de verite ») porte 8 sous-sections ### sci-fi-* pour les memes 8 cartes. bridge, tv et water n'ont ni id, ni sous-section de contrat. Or les ONZE src/cards/*/config.ts portent en ligne 4 « Source of truth: docs/specs/05_cards.md § YAML Config Contracts » : trois cartes designent comme leur source de verite une section qui ne les mentionne pas. Attendu : les 11 cartes ont leur ligne F-CARD et leur sous-section de contrat. Rapporte par le retrocheck du 2026-10-31 (bead ha-sci-fi-s5f).

Bead: ha-sci-fi-g1l.1
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t ''` — green 2026-11-01T11:17:54Z

## O2 — O2 docs/specs/05_cards.md ne lie que 8 des 11 specs de carte (sonde : grep -onE 'cards/[a-z_-]+\.md' rend climates, hexa-tiles, lights, plugs, stove, vacuum, vehicles, weather). bridge.md, tv.md et water.md ne sont atteignables depuis le registre des cartes par aucun chemin. Attendu : le registre lie les 11 specs. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.2
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O1 —'` — green 2026-11-01T11:17:54Z

## O3 — O3 docs/MASTER.md annonce quatre plages d'ids que les specs ne definissent pas : l.17 « F-CARD-01 to 11 » contre F-CARD-01..08, l.20 « F-EDIT-01 to 11 » contre F-EDITOR-01..18 (le prefixe lui-meme est faux), l.21 « F-GUIDE-01 to 04 » contre F-REMED-01..08 (prefixe et plage faux). Et l.24 « Coverage: 100% — no orphan feature » plus l.100 « Blueprint Coverage Matrix complete (0 orphan feature) » sont contredits par ses propres lignes. Attendu : les plages et les prefixes de MASTER.md sont ceux des specs, et son affirmation de couverture est vraie ou retiree. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.3
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O2 / O16'` — green 2026-11-01T11:17:55Z

## O4 — O4 docs/specs/06_entry_migration.md:56 porte « Lovelace Cards (8) | Spec 05 | Cards compiled and registered » alors que 11 cartes sont livrees et enregistrees. Attendu : 11. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.4
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O3 —'` — green 2026-11-01T11:17:55Z

## O5 — O5 docs/specs/10_card_editors.md ne porte pas de ligne F-EDITOR pour trois editeurs livres : sci-fi-bridge-editor, sci-fi-tv-editor et sci-fi-water-management-editor (sonde : comparaison des noms entre les lignes F-EDITOR de la spec et ls src/cards/*/*-editor.ts ; temoin positif : les huit autres editeurs de carte sont bien nommes). Ce sont les trois memes cartes que O1. Attendu : les 11 editeurs ont leur id. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.5
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O4 —'` — green 2026-11-01T11:17:56Z

## O6 — O6 src/components/editor-inputs/sf-editor-action.ts et sf-editor-source-list.ts sont livres et testes (tests/components/editor-inputs/ porte un fichier pour chacun) et docs/specs/10_card_editors.md ne les mentionne nulle part — 0 occurrence, ni en liste de features, ni dans le File Tree, ni en Public Interface. Temoin positif : la meme spec nomme les neuf autres composants sf-editor-*. Attendu : les deux composants figurent dans les trois listes. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.6
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O5 / O6'` — green 2026-11-01T11:17:57Z

## O7 — O7 docs/specs/06_entry_migration.md:62 declare syncHALocale en Public Interface (« Base class | Reactively maps language states to card locales ») et l.86 lui attache TC-601. Le symbole est absent de src/ (sonde : git grep -n syncHALocale -- src/ rend 0 ligne ; temoin positif : le meme grep trouve le symbole dans la spec). Attendu : l'interface publique ne nomme que des symboles existants. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.7
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O6 —'` — green 2026-11-01T11:17:57Z

## O8 — O8 La reecriture de F-MIGR-01 n'est pas portee jusqu'au bout. La spec 06 declare la migration jamais necessaire sous ADR-005 (« ⬜ not delivered »), mais son anti-pattern 4 prescrit encore « Parse and migrate YAML fields in the setter », sa matrice d'erreurs garde une ligne « Legacy Config Error | Migration parser failure », et la spec 10 exige que l'editeur bloque sur config.version. Aucun code migrat*, aucun config.version sous src/. Attendu : les quatre endroits disent la meme chose, celle d'ADR-005. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.8
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O7 —'` — green 2026-11-01T11:17:58Z

## O9 — O9 docs/specs/11_guidelines_remediation.md:20 (F-REMED-08) exige « HACS "type": "plugin" » et l.174 (TC-115) dit que hacs.json porte les cles plugin requises. Mesure : hacs.json porte name, render_readme, filename — pas de cle type — et tests/sci-fi.test.ts asserte expect(hacsJson).to.not.have.property('type'), titre « HACS 2.0 schema (no type field) ». La spec et sa propre preuve exigent l'inverse ; c'est la spec qui est perimee (HACS 2.0 a retire la cle). Attendu : F-REMED-08 et TC-115 disent l'absence de type. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.9
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O8 —'` — green 2026-11-01T11:17:59Z

## O10 — O10 docs/specs/05_cards.md:251 (IT-501) dit « 8 cartes s'enregistrent » et « Load 'sci-fi.min.js' ». Le test importe src/sci-fi.js, asserte 11, et declare la ligne de spec perimee dans son propre commentaire. Attendu : 11 cartes, et le chemin que le test charge. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.10
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O9 —'` — green 2026-11-01T11:17:59Z

## O11 — O11 docs/specs/06_entry_migration.md:97 (IT-601) est le seul des quatre ids IT-501/601/602/603 sans bloc it() : il n'apparait dans tests/ que dans un commentaire (tests/sci-fi.test.ts:71). Sonde : grep -hE "it\('.*<id>" -- tests/ rend 1 pour IT-501, IT-602 et IT-603, et 0 pour IT-601. Attendu : IT-601 porte un test, ou la ligne dit ce qui le couvre. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.11
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O10 —'` — green 2026-11-01T11:18:00Z

## O12 — O12 docs/specs/06_entry_migration.md:99 (IT-603) demande l'icone « sf:radiator ». Seul le namespace « sci » est enregistre aupres de window.customIconsets (src/components/sf-icon/sf-iconset.ts:63 ; sci-fi.ts:34 le dit en commentaire). Un namespace « sf » n'est enregistre nulle part, donc le cas est inatteignable par construction. Attendu : le cas nomme une icone du namespace reellement enregistre. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.12
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O11 —'` — green 2026-11-01T11:18:01Z

## O13 — O13 docs/specs/06_entry_migration.md:17 (F-GIT-01) annonce « Branch v2 isolation setup | ✅ Git setup ». Mesure : git branch -a --list '*v2*' rend 0 branche, locale comme distante. Attendu : la ligne dit l'etat reel, ou disparait. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.13
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O12 —'` — green 2026-11-01T11:18:01Z

## O14 — O14 docs/specs/10_card_editors.md:271 affirme que TC-1017 et TC-1018 « together read all 179 keys ». Mesure : 177 cles distinctes — 32 dans le noyau partage (src/utils/base-editor.ts) et 145 sur les dix dictionnaires src/cards/*/labels.ts (bridge 39, climates 25, vacuum 23, stove 15, vehicles 13, hexa-tiles 9, tv 7, lights 5, plugs 5, weather 4). Temoin positif : la sonde rend bien les cinq cles de plugs. Le bead annoncait 174 : faux aussi. Attendu : le nombre mesure, ou une formulation qui ne se perime pas a chaque cle ajoutee. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.14
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O13 —'` — green 2026-11-01T11:18:02Z

## O15 — O15 docs/specs/10_card_editors.md §sci-fi-plugs-editor porte trois prescriptions que l'editeur livre ne tient pas : (1) un <sf-editor-dropdown> pour device_id — l'editeur n'en rend aucun et ne met jamais device_id a jour (les seuls champs mis a jour sont entity_id, name, active_icon, inactive_icon) ; (2) « State loaded: _devices from Object.values(hass.devices).filter(d => d.entry_type !== 'service') » — hass.devices et entry_type ont 0 occurrence dans l'editeur ; (3) des champs power_entity et energy_entity — 0 occurrence, et le §Sensor Mapping Logic de la MEME section decrit correctement ce que le code fait (un record sensors clefe par entity_id, _updateSensor(index, isPower, entityId)), donc la section se contredit elle-meme. Temoin positif : les deux dropdowns Power et Energy existent bien, avec les cles input-power et input-energy. Attendu : les trois prescriptions decrivent l'editeur livre. Rapporte par le retrocheck du 2026-10-31.

Bead: ha-sci-fi-g1l.15
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O14 —'` — green 2026-11-01T11:18:03Z

## O16 — O16 docs/specs/cards/water_history.md n'est lie par aucune spec ni aucune documentation : les seuls .md qui le nomment sont six rapports de revue sous docs/reviews/test-spec-divergence/. Temoin positif : la meme sonde rend 7 fichiers pour cards/tv.md et 27 pour cards/bridge.md. En revanche le bead annonce aussi water.md a zero lien entrant, et c'est FAUX : water.md recoit quatre liens, depuis docs/specs/cards/bridge.md:1534 et trois lignes de water_history.md. Attendu : water_history.md est atteignable depuis le registre ou depuis water.md ; et le constat sur water.md est corrige.

Bead: ha-sci-fi-g1l.16
Test: `npx vitest run tests/specs/transverse-registries.test.ts -t 'O15 —'` — green 2026-11-01T11:18:03Z
