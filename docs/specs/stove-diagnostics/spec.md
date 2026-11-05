---
spec: docs/specs/stove-diagnostics/spec.md
sources:
  - src/cards/stove/config.ts
  - src/cards/stove/sci-fi-stove.ts
  - src/cards/stove/sci-fi-stove-editor.ts
  - src/cards/stove/labels.ts
  - src/cards/stove/styles.ts
  - src/types/ha.ts
  - docs/specs/stove-fan-speed/spec.md
  - docs/specs/cards/stove.md
---

# Stove Diagnostics — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-ve4.3` (enfant de `ha-sci-fi-ve4`). L'intégration core `fumis` expose trois diagnostics : `binary_sensor.*_door` (porte), `sensor.*_alert` (enum traduit : `none`, porte ouverte, combustible bas, entretien dû, température des fumées, pile faible, capteur de vitesse, capteur de débit d'air) et `sensor.*_error` (enum traduit `none`, E101..E115, code brut dans l'attribut `code`). Ce lot les affiche sur la carte poêle, seulement quand quelque chose ne va pas.

Décisions utilisateur du 2026-11-05 (session attended, contraignantes) :
- D1 placement : une **icône** sur l'illustration du poêle **et** une **ligne de texte** dans la zone de statut, seulement quand un diagnostic est actif (FR-6, FR-8).
- D2 erreur affichée comme « <état traduit par HA> (E101) » (FR-7).
- D3 porte fermée, alerte `none`, erreur `none` → rien n'est rendu, aucune ligne « pas d'alerte » (FR-4, FR-5).
- D4 d'abord scinder `src/cards/stove/sci-fi-stove.ts` (797 lignes, limite 800 — SHOW `wc -l src/cards/stove/sci-fi-stove.ts` → 797, lu le 2026-11-05) : déplacement pur du mécanisme des molettes de nombre vers `src/cards/stove/number-wheel.ts`, comportement inchangé ; TC-SFS-U-1107 lit le nouveau module (FR-1, FR-2).
- D5 (revue adversariale, F-04) : **un seul** badge, dont l'icône et la couleur suivent le diagnostic actif le plus grave (erreur > alerte > porte) ; quand l'alerte vaut `door_open` et que la porte est ouverte, **une seule** ligne (fusion) (FR-8, FR-13).
- D6 (F-02/F-06) : ligne tronquée visuellement par ellipsis CSS sur une ligne ; texte complet dans `title` / `aria-label`, plafonné à 200 caractères (FR-14).
- D7 (F-05) : la zone des diagnostics est `role="status"` `aria-live="polite"` ; une icône en plus de la couleur ; badge de 24 px au coin haut-droit de l'illustration (FR-6, FR-8).
- D8 (F-11) : l'éditeur reste en texte libre (comme ve4.1/ve4.2) ; c'est la **carte** qui ignore un domaine inattendu (porte `binary_sensor`, alerte/erreur `sensor`) (FR-5).

## Requirements

- **FR-0**: **Snapshot de référence, avant tout déplacement.** Premier geste du BUILD, sur le code d'avant ce lot (avant FR-1) : `tests/cards/stove/sci-fi-stove-diagnostics.test.ts` enregistre le `innerHTML` normalisé de `.content` d'une carte configurée sans les trois champs (config de TC-SDG-U-02) dans le snapshot Vitest `tests/cards/stove/__snapshots__/sci-fi-stove-diagnostics.test.ts.snap`, clé `pre-lot content`. Ce fichier n'est plus réécrit ensuite (jamais `-u`) ; TC-SDG-U-02, TC-SDG-U-03 et IT-SDG-I-02 le lisent.
- **FR-1**: **Déplacement pur.** Les déclarations de niveau module du mécanisme des molettes quittent `src/cards/stove/sci-fi-stove.ts` pour `src/cards/stove/number-wheel.ts`, à l'identique et exportées : `NUMBER_DEBOUNCE_MS`, `NUMBER_MAX_ITEMS`, `NUMBER_DOMAINS`, `NumberTrio`, `NumberWheelKey`, `NumberWheelSpec`, `NUMBER_WHEELS`, `NumberPick`, `NumberPicks`, `NumberGrid`, `NumberEntity`, `isNumeric`, `decimals`, `gridOf`, `numberGrid`, `numberValue`, `isNumberDisabled` (17 noms — SHOW `grep -n "^const NUMBER\|^interface Number\|^type Number\|^function" src/cards/stove/sci-fi-stove.ts`, lignes 94–212). La carte les importe depuis `./number-wheel` ; les méthodes de classe (`_renderNumberWheel`, `_onNumberWheelChange`, `_sendNumberValue`, `_releaseNumberPick`, `_cancelNumberTimer`, `_numberDomain`, `_numberEntity`, `_numberItems`, `_numberSelectedId`, `_setNumberPick`) restent dans la carte, corps inchangés. Aucune ligne de `tests/cards/stove/sci-fi-stove-power-level.test.ts` ni de `tests/cards/stove/sci-fi-stove-fan-speed.test.ts` n'est modifiée, hors TC-SFS-U-1107 et la lecture de source de TC-SPL-U-1121 (FR-2). Preuve mécanique du déplacement (TC-SDG-U-01) : les 17 noms sont exportés par `number-wheel.ts` ; aucun n'est déclaré dans `sci-fi-stove.ts` ; `sci-fi-stove.ts` importe chacun de ceux qu'il utilise depuis `./number-wheel` ; `npx tsc --noEmit` sort à 0 ; les suites power-level, fan-speed et `sci-fi-stove.test.ts` sont vertes ; le snapshot FR-0 est égal. Ce mouvement est fait et vert **avant** toute écriture de FR-3 à FR-14.
- **FR-2**: TC-SPL-U-1121 est amendé sur sa seule lecture de source : `DOMAIN.NUMBER` et `DOMAIN.INPUT_NUMBER` sont cherchés dans `src/cards/stove/number-wheel.ts` (où `NUMBER_DOMAINS` est déplacé ; défaut de spec relevé au BUILD 2026-11-05). TC-SFS-U-1107 est amendé : il lit `src/cards/stove/number-wheel.ts`, qui contient `NumberWheelSpec` et `numberGrid` ; la source de `sci-fi-stove.ts` ne contient ni `powerGrid`, ni `function numberGrid`, ni `interface NumberWheelSpec`. Plafond chiffré : après FR-1, `wc -l src/cards/stove/sci-fi-stove.ts` vaut entre 670 et 700 (797 − 119 lignes déplacées + au plus 22 lignes d'import) ; FR-3 à FR-14 y ajoutent au plus 100 lignes ; **à la fin du lot** (dernier geste du BUILD et à nouveau en VERIFY), `sci-fi-stove.ts` compte au plus 800 lignes. Au-delà, les aides pures des diagnostics (FR-5, FR-7, FR-14) partent dans `src/cards/stove/diagnostics.ts` plutôt que d'élever le plafond.
- **FR-3**: `SciFiStoveSensors` (`src/cards/stove/config.ts`) gagne, après `sensor_time_to_service`, `readonly sensor_door?: string;`, `readonly sensor_alert?: string;`, `readonly sensor_error?: string;` (agent's call : sous `sensors`, comme `sensor_status`, parce que ce sont des capteurs lus et jamais pilotés). **Validation de type** (F-10) : un champ dont la valeur YAML n'est pas une chaîne, ou est une chaîne vide après `trim()`, est traité comme absent partout (rendu et `getRelevantEntities()`). `getRelevantEntities()` ajoute chaque champ valide, après `trim()` ; absents ou invalides, l'ensemble est identique à aujourd'hui.
- **FR-4**: **Rendu inchangé sans diagnostic actif.** Sans aucun des trois champs, ou avec les trois champs mais aucun diagnostic actif (FR-5), le `innerHTML` normalisé de `.content` est égal au snapshot FR-0 : aucune zone `.diagnostics`, aucun `.diagnostic`, aucun `.diagnostic-badge`.
- **FR-5**: **Diagnostic actif — normalisation.** L'entité est lue par recherche de propriété propre : `Object.hasOwn(hass.states, id)` (jamais `id in hass.states`). Domaine attendu (D8) : la porte n'est lue que si `id` commence par `binary_sensor.`, l'alerte et l'erreur que si `id` commence par `sensor.` ; un autre domaine → inactif, rien rendu, rien journalisé. L'état est normalisé : `typeof state === 'string'` sinon inactif ; `s = state.trim()`. La porte est active ssi `s.toLowerCase() === 'on'`. L'alerte (resp. l'erreur) est active ssi `s !== ''` et `s.toLowerCase()` n'est ni `none`, ni `unavailable`, ni `unknown` (donc `'None'`, `' none '`, `'UNAVAILABLE'` sont inactifs). Entité absente, champ invalide (FR-3), ou tout autre état → inactif (agent's call : `unavailable` / `unknown` ne sont pas un défaut du poêle).
- **FR-6**: **Zone et lignes de texte.** Quand au moins une ligne est à rendre (FR-13), `.temperatures` rend, juste après la ligne `.status`, un `div.diagnostics` portant `role="status"` et `aria-live="polite"` (D7) ; il contient, dans l'ordre porte, alerte, erreur, un `div` de classes `diagnostic <kind>` (`door`, `alert`, `error`) par ligne, contenant un `sf-icon` (`mdi:door-open`, `mdi:alert`, `mdi:alert-octagon`, `aria-hidden="true"`) puis un `div.diagnostic-text` portant le texte affiché de FR-7 et un `title` égal au texte plafonné de FR-14. L'icône distingue le genre en plus de la couleur. Aucune zone `.diagnostics` quand aucune ligne n'est à rendre.
- **FR-7**: **Textes.** Porte : `msg('Door open')` (fr `Porte ouverte`). Alerte : `stateLabel(alerte)`. Erreur : soit `label = stateLabel(erreur)` et `code` = `attributes.code` normalisé — une chaîne dont `trim()` est non vide (gardée après `trim()`), ou un nombre fini (`String(code)`) ; tout autre `code` (absent, `''`, `'  '`, `NaN`, `Infinity`, objet, booléen) est « sans code ». Sans code → `label`. Avec code : si `label.trim().toLowerCase() === code.toLowerCase()` (libellé non traduit égal au code), le texte est `code` seul, une fois ; sinon `label (code)`. `0` est un code fini, affiché `(0)`. Exemple : état `e101`, `formatEntityState` → `Échec d'allumage`, `code: 'E101'` → `Échec d'allumage (E101)` ; `formatEntityState` → `e101`, `code: 'E101'` → `E101`. Tous les textes sont rendus comme texte (liaison Lit), jamais comme HTML, dans la ligne comme dans `title` et `aria-label`.
- **FR-8**: **Badge sur l'illustration.** Quand au moins une ligne est rendue, `.content` rend juste après `sf-stove-image` **un seul** `sf-icon` de classes `diagnostic-badge <kind>`, où `<kind>` est le diagnostic actif le plus grave (`error` > `alert` > `door`, D5) et l'icône celle de ce genre en FR-6 ; `role="img"`, `title` et `aria-label` égaux aux textes plafonnés (FR-14) des lignes rendues, dans l'ordre de FR-6, joints par ` · `, le tout plafonné à 200 caractères (FR-14). Le badge n'est pas dans la zone `aria-live` : seule la zone `.diagnostics` est annoncée. `styles.ts` : `.content` en `position: relative` ; `.diagnostic-badge` en `position: absolute`, `top: 0`, `right: 0`, `--icon-size: 24px` (24 px, D7), `z-index: 1`, `pointer-events: none` (n'intercepte pas les clics de l'illustration) ; couleurs par genre : `.diagnostic.error` / `.diagnostic-badge.error` et `.diagnostic.alert` / `.diagnostic-badge.alert` prennent la couleur de `.temperature.high` ; `.diagnostic.door` / `.diagnostic-badge.door` la même (agent's call : une seule couleur d'alerte existante ; la gravité est portée par l'icône).
- **FR-9**: **Traduction par HA.** `stateLabel(entity)` : quand `hass.formatEntityState` est une fonction, l'appelle dans un `try` ; si l'appel lève, ou renvoie autre chose qu'une chaîne, ou une chaîne vide après `trim()`, repli ; sinon renvoie le résultat. Repli (et cas sans fonction) : `entity.state.trim()` avec tous les `_` remplacés par des espaces. Aucune erreur ne remonte au rendu, rien n'est journalisé. Aucun texte de l'enum fumis n'est codé en dur dans le dépôt. `HomeAssistantExt` (`src/types/ha.ts`) gagne `readonly formatEntityState?: (stateObj: HassEntity, state?: string) => string;` (SHOW — `grep -rn formatEntityState src` → aucun résultat le 2026-11-05 : le dépôt n'a pas encore d'aide, celle-ci est la première).
- **FR-10**: **Éditeur.** `STOVE_SENSOR_FIELDS` (`src/cards/stove/sci-fi-stove-editor.ts`) gagne, juste après `sensor_status`, `['sensor_door', 'input-stove-door', 'mdi:door']`, `['sensor_alert', 'input-stove-alert', 'mdi:alert']`, `['sensor_error', 'input-stove-error', 'mdi:alert-octagon']` ; `labels.ts` mappe ces clés sur `msg('Stove door')`, `msg('Stove alert')`, `msg('Stove error')`. Saisie en texte libre, sans filtre de domaine (D8) ; la carte ignore un domaine inattendu (FR-5).
- **FR-11**: quatre chaînes source nouvelles — `Door open` (`Porte ouverte`), `Stove door` (`Porte du poêle`), `Stove alert` (`Alerte du poêle`), `Stove error` (`Erreur du poêle`) — avec leurs unités `xliff/fr.xlf` et `src/locales/locales/fr.js` régénéré (`npm run localize-extract`, `npm run localize-build`). Mélange de langues (agent's call, F-11) : `Door open` suit la locale de la carte (`msg`), alerte et erreur suivent la langue de l'utilisateur HA (`formatEntityState`) ; les deux coïncident dans le cas courant, l'écart est accepté et non corrigé dans ce lot.
- **FR-12**: [stove.md](../cards/stove.md) documente ce comportement : ligne Blueprint `F-STOVE-D11`, section « Diagnostics — porte, alerte, erreur » (gravité du badge, fusion porte/alerte, troncature, zone `aria-live`, domaine ignoré), sélecteurs gelés `.diagnostics`, `.diagnostic`, `.diagnostic-text`, `sf-icon.diagnostic-badge`, lignes de l'Error Handling Matrix (entité absente/indisponible, domaine inattendu, `formatEntityState` absent/en échec, code non affichable).
- **FR-13**: **Fusion porte / alerte.** Quand la porte est active et que l'alerte est active avec `s.toLowerCase() === 'door_open'`, une seule ligne est rendue : la ligne `.diagnostic.alert` (texte `stateLabel(alerte)`, plus précis car traduit par HA) ; la ligne `.diagnostic.door` est omise (agent's call sur la ligne gardée). La gravité du badge reste `alert` (ou `error` si l'erreur est active).
- **FR-14**: **Longueur.** La ligne affiche le texte complet de FR-7, sur une seule ligne : `.diagnostic-text` en `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `min-width: 0` (le parent `.diagnostic` en `display: flex`), donc jamais de retour à la ligne ni de débordement à largeur étroite. Texte plafonné (pour `title` et `aria-label`) : si le texte dépasse 200 caractères, ses 199 premiers suivis de `…`. Pour l'erreur avec code, le plafond s'applique au libellé et jamais au code : le code (lui-même coupé à 32 caractères) est gardé en fin, `libellé-coupé… (code)`, total ≤ 200. Le `title` du badge (FR-8), jointure comprise, est plafonné de la même règle.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | L'état « rien à signaler » de `sensor.*_alert` et `sensor.*_error` est la valeur brute `none` | Medium | TELL — énoncé utilisateur 2026-11-05 et bead ve4.3 (« rien affiché quand alert/error valent none ») | TC-SDG-U-03 |
| 2 | `attributes.code` de `sensor.*_error` porte le code affichable (`E101`) ; s'il était numérique (`101`) il serait affiché tel quel, sans préfixe `E` | Medium | TELL — énoncé utilisateur (« raw code in attribute `code` ») | TC-SDG-U-05 ; vérification sur l'instance réelle à la recette |
| 3 | `hass.formatEntityState` existe sur le `hass` passé aux cartes (frontend HA ≥ 2023.9) et rend l'état traduit de l'enum ; absent ou en échec, le repli FR-9 s'applique | Low | CITED — API frontend HA `hass.formatEntityState` | TC-SDG-U-06 |
| 4 | Le déplacement FR-1 ne change aucun comportement des molettes | Low | SHOW — snapshot FR-0 enregistré avant le déplacement, suites power-level et fan-speed inchangées | TC-SDG-U-01 |
| 5 | Le dépôt n'a aucune aide de traduction d'état réutilisable : `stateLabel` est la première | Low | SHOW — `grep -rn "formatEntityState" src` → aucun résultat (2026-11-05) | TC-SDG-U-05 |
| 6 | La carte est à 797 lignes avant le lot : sans le déplacement FR-1, les diagnostics la feraient dépasser 800 | Low | SHOW — `wc -l src/cards/stove/sci-fi-stove.ts` → 797 (2026-11-05) | TC-SDG-U-01, TC-SDG-U-11 |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Coder en dur les libellés de l'enum (`low_fuel` → « Combustible bas ») | `hass.formatEntityState`, FR-9 |
| 2 | Rendre une ligne « Aucune alerte » / « Porte fermée » | rien rendu, FR-4, FR-5 |
| 3 | Modifier un corps de méthode des molettes pendant le déplacement | déplacement pur des déclarations de module, FR-1 |
| 4 | Afficher `unavailable` / `' None '` comme une alerte | inactif après normalisation, FR-5 |
| 5 | Enregistrer le snapshot de référence après le déplacement, ou le régénérer avec `-u` | snapshot pris sur le code d'avant le lot, FR-0 |
| 6 | Couper le code d'erreur pour tenir le plafond | couper le libellé, garder le code, FR-14 |
| 7 | Deux badges, ou deux lignes « porte ouverte » | un badge au genre le plus grave, fusion, FR-8, FR-13 |

## Test Case Specifications

Les tests vivent dans `tests/cards/stove/sci-fi-stove-diagnostics.test.ts` (carte) et `tests/cards/stove/sci-fi-stove-editor.test.ts` (éditeur), mêmes conventions que les specs puissance et ventilation (mock `hass`, `formatEntityState` en `vi.fn`). Le snapshot de référence est `tests/cards/stove/__snapshots__/sci-fi-stove-diagnostics.test.ts.snap`, clé `pre-lot content` (FR-0).

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SDG-U-00 | sur le code d'avant le lot (avant FR-1), config sans les trois champs ; enregistrer le `innerHTML` normalisé de `.content` | FR-0 | le fichier `.snap` existe avec la clé `pre-lot content`, horodaté avant le premier changement de `sci-fi-stove.ts` ; plus jamais réécrit |
| TC-SDG-U-01 | après FR-1 : importer `src/cards/stove/number-wheel.ts` ; lire les sources `number-wheel.ts` et `sci-fi-stove.ts` ; `npx tsc --noEmit` ; lancer power-level, fan-speed (TC-SFS-U-1107 amendé) et `sci-fi-stove.test.ts` ; comparer `.content` au snapshot FR-0 | FR-1, FR-2 | les 17 noms de FR-1 apparaissent chacun dans une déclaration `export` de `number-wheel.ts` (valeurs : `typeof` non `undefined` à l'import) ; aucun n'est déclaré (`const`/`function`/`interface`/`type`) dans `sci-fi-stove.ts` ; `sci-fi-stove.ts` contient `from './number-wheel'` ; `tsc` sort à 0 ; trois suites vertes ; snapshot égal ; `sci-fi-stove.ts` entre 670 et 700 lignes |
| TC-SDG-U-02 | config sans les trois champs ; puis `sensor_door: 42`, `sensor_alert: ['x']`, `sensor_error: '  '` ; `innerHTML` normalisé de `.content` ; `getRelevantEntities()` | FR-3, FR-4 | dans les deux cas égal au snapshot FR-0 ; aucun `.diagnostics`, `.diagnostic` ni `.diagnostic-badge` ; aucun id `*_door`, `*_alert`, `*_error` ni `42` dans `getRelevantEntities()` ; aucune exception |
| TC-SDG-U-03 | trois champs renseignés : porte `'off'`, alerte `'none'`, erreur `'none'` ; puis porte `'unavailable'`, alerte `'unknown'`, erreur `'unavailable'` ; puis alerte `' None '`, erreur `'UNKNOWN'`, porte `'OFF'` ; puis alerte `''`, erreur `'   '` ; puis entités absentes de `hass` ; puis `hass.states` dont le prototype porte les trois ids | FR-3, FR-4, FR-5 | dans tous les cas `.content` égal au snapshot FR-0 ; `getRelevantEntities()` contient les trois ids |
| TC-SDG-U-04 | porte `'on'` seule, `formatEntityState` absent ; puis porte `' ON '` | FR-5, FR-6, FR-7, FR-8 | un `div.diagnostics` juste après `.status`, `role` `status`, `aria-live` `polite`, contenant un seul `.diagnostic.door`, `sf-icon` `mdi:door-open` `aria-hidden` `true`, `.diagnostic-text` `Door open` et `title` `Door open` ; un seul `sf-icon.diagnostic-badge.door` juste après `sf-stove-image`, icône `mdi:door-open`, `title` et `aria-label` `Door open`, `role` `img`, hors de `.diagnostics` ; même rendu pour `' ON '` |
| TC-SDG-U-05 | erreur `'e101'`, `formatEntityState` → `'Ignition failure'`, `code` successivement `'E101'`, absent, `101`, `0`, `''`, `'  '`, `NaN`, `Infinity`, `{}`, `true`, `' E101 '` ; puis `formatEntityState` → `'e101'` avec `code: 'E101'` | FR-7, FR-9 | `.diagnostic.error .diagnostic-text` respectivement `Ignition failure (E101)`, `Ignition failure`, `Ignition failure (101)`, `Ignition failure (0)`, puis `Ignition failure` pour `''`, `'  '`, `NaN`, `Infinity`, `{}`, `true`, puis `Ignition failure (E101)` ; puis `E101` seul (jamais `e101 (E101)`) ; aucun texte ne contient `( )` ni `()` ; `formatEntityState` appelé avec l'objet d'état de l'erreur |
| TC-SDG-U-06 | alerte `'low_fuel'` sans `formatEntityState` ; puis `formatEntityState` → `'<b>x</b>'` ; puis `formatEntityState` qui lève ; puis qui renvoie `42` ; puis `''` ; puis `'  '` | FR-6, FR-7, FR-9 | `.diagnostic.alert .diagnostic-text` `low fuel`, `sf-icon` `mdi:alert` ; puis texte `<b>x</b>`, `title` de la ligne et `title` / `aria-label` du badge égaux à la chaîne littérale `<b>x</b>`, et aucun élément `b` dans le shadow DOM ; puis, pour lever / `42` / `''` / `'  '`, texte `low fuel`, aucune exception remontée, aucun `console.error` |
| TC-SDG-U-07 | porte `'on'`, alerte `'low_fuel'` (→ `Low fuel`), erreur `'e110'` `code: 'E110'` (→ `Flue gas`) ; puis porte `'on'` et alerte `'low_fuel'` seules ; puis porte `'on'`, alerte `'door_open'` (→ `Door open alert`), erreur `'none'` ; puis la même avec alerte `' DOOR_OPEN '` | FR-6, FR-8, FR-13 | ordre des `.diagnostic` : `door`, `alert`, `error`, tous dans `.diagnostics` ; un seul `.diagnostic-badge`, de classe `error`, icône `mdi:alert-octagon`, `title` `Door open · Low fuel · Flue gas (E110)` ; puis badge `alert`, icône `mdi:alert` ; puis une seule ligne `.diagnostic.alert` `Door open alert`, aucun `.diagnostic.door`, badge `alert` `title` `Door open alert` ; idem pour `' DOOR_OPEN '` |
| TC-SDG-U-08 | lire `src/cards/stove/styles.ts` | FR-8, FR-14 | règle `.content` avec `position: relative` ; règle `.diagnostic-badge` avec `position: absolute`, `top: 0`, `right: 0`, `--icon-size: 24px`, `z-index: 1`, `pointer-events: none` ; règles `.diagnostic.door`, `.diagnostic.alert`, `.diagnostic.error` et `.diagnostic-badge.<kind>` portant la même valeur de `color` que `.temperature.high` ; règle `.diagnostic` avec `display: flex` ; règle `.diagnostic-text` avec `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `min-width: 0` |
| TC-SDG-U-09 | éditeur monté avec `sensors.sensor_door`, `sensor_alert`, `sensor_error` | FR-10 | entrées `input-stove-door`, `input-stove-alert`, `input-stove-error` juste après `input-stove-status`, dans cet ordre, libellés `Stove door`, `Stove alert`, `Stove error` ; un changement émet `config-changed` avec `sensors.sensor_alert` ; une saisie `light.x` est acceptée telle quelle (texte libre) |
| TC-SDG-U-10 | lire `xliff/fr.xlf`, `src/locales/locales/fr.js`, `docs/specs/cards/stove.md` | FR-11, FR-12 | une unité et une entrée pour `Door open`, `Stove door`, `Stove alert`, `Stove error` en `Porte ouverte`, `Porte du poêle`, `Alerte du poêle`, `Erreur du poêle` ; `stove.md` contient la ligne Blueprint `F-STOVE-D11`, le titre `### Diagnostics — porte, alerte, erreur`, les sélecteurs `.diagnostics`, `.diagnostic-text`, `sf-icon.diagnostic-badge`, les mots `aria-live`, `door_open`, `200 caractères`, et dans l'Error Handling Matrix une ligne pour `domaine inattendu` et une pour `formatEntityState` en échec |
| TC-SDG-U-11 | à la fin du lot (après FR-3..FR-14), `wc -l src/cards/stove/sci-fi-stove.ts` lu par le test via `fs` | FR-2 | ≤ 800 lignes |
| TC-SDG-U-12 | porte `'on'` avec `sensor_door: 'sensor.stove_door'` ; alerte `'low_fuel'` avec `sensor_alert: 'binary_sensor.stove_alert'` ; erreur `'e101'` avec `sensor_error: 'switch.stove_error'` | FR-5, FR-10 | `.content` égal au snapshot FR-0, aucune exception, aucun `console.warn` / `console.error` |
| TC-SDG-U-13 | erreur, `formatEntityState` → 300 × `'a'`, `code: 'E101'` ; puis alerte → 300 × `'b'` ; puis `code` de 40 caractères `'C'` ; puis trois diagnostics de 120 caractères chacun | FR-14, FR-8 | `.diagnostic-text` porte le texte complet (300 `a` + ` (E101)`) ; son `title` fait ≤ 200 caractères et finit par `… (E101)` ; alerte : `title` = 199 `b` + `…` ; code coupé à 32 `C` en fin de `title` ; badge : `title` et `aria-label` ≤ 200 caractères finissant par `…` |
| IT-SDG-I-01 | élément réel `sci-fi-stove` (`document.createElement`, `document.body`), `setConfig` puis `hass` avec erreur `'e101'` `code: 'E101'` et `formatEntityState` | FR-6, FR-7, FR-8, FR-9 | dans le shadow DOM, `.diagnostics[role=status][aria-live=polite] .diagnostic.error .diagnostic-text` `Ignition failure (E101)` et un `sf-icon.diagnostic-badge.error` |
| IT-SDG-I-02 | même élément, `hass` réassigné avec l'erreur `'none'` | FR-4, FR-5 | plus aucun `.diagnostics`, `.diagnostic` ni `.diagnostic-badge` ; `.content` égal au snapshot FR-0 |
| IT-SDG-I-03 | élément réel avec puissance, ventilation et les trois diagnostics configurés, porte `'on'` ; `wheel-change` sur `sf-wheel.power-level`, 400 ms | FR-1, FR-6 | un appel `number` / `set_value` ; `.diagnostic.door` rendu ; les deux molettes rendues |
| IT-SDG-I-04 | élément réel, erreur au libellé de 300 caractères ; lire le texte CSS des `styles` statiques de `SciFiStoveCard` (jsdom ne calcule pas la mise en page) | FR-14 | `.diagnostic-text` rendu, texte complet ; la feuille de la carte contient la règle `.diagnostic-text` de TC-SDG-U-08 (`nowrap`, `ellipsis`) ; la largeur réelle à 200 px est vérifiée à la recette, pas en jsdom |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| entité de diagnostic absente de `hass` (propriété propre) | rien rendu (FR-5) | — | aucun |
| état `unavailable` / `unknown` / `none` (toute casse, espaces), vide ou non-chaîne | rien rendu (FR-5) | — | aucun |
| champ de config non-chaîne ou vide | traité comme absent (FR-3) | — | aucun |
| domaine inattendu (porte hors `binary_sensor.`, alerte/erreur hors `sensor.`) | rien rendu (FR-5) | — | aucun |
| `hass.formatEntityState` absent, lève, renvoie non-chaîne ou vide | état brut, `_` → espaces (FR-9) | — | aucun |
| libellé traduit égal au code | code affiché une fois (FR-7) | — | aucun |
| `attributes.code` absent, vide, blanc, non fini ou non affichable | texte traduit seul (FR-7) | — | aucun |
| texte traduit contenant du balisage | rendu comme texte, ligne, `title`, `aria-label` (FR-7) | — | aucun |
| texte très long | ellipsis CSS ; `title`/`aria-label` ≤ 200 caractères, code gardé (FR-14) | — | aucun |

## Builder Check — précisions (agent's call, 2026-11-05)

Questions d'un builder à froid, tranchées par l'agent (aucune n'est une décision utilisateur) :

- **B-1 normalisation du snapshot** (FR-0, FR-4) : « normalisé » = commentaires Lit (`<!--…-->`) retirés, blancs consécutifs réduits à un espace, `trim()` ; l'ordre des attributs n'est pas touché.
- **B-2 enregistrement** (FR-0, TC-SDG-U-00) : le test `pre-lot content` est un `toMatchSnapshot()` qui reste dans la suite et sert ensuite de comparaison ; il est lancé seul (`npx vitest run tests/cards/stove/sci-fi-stove-diagnostics.test.ts -t "pre-lot content"`) avant FR-1, et le `.snap` est committé en WIP avant tout changement de `sci-fi-stove.ts` ; « horodaté avant » se prouve par `git log` (commit du `.snap` antérieur au premier commit touchant `sci-fi-stove.ts`), pas par le test.
- **B-3 plafond de l'erreur** (FR-14) : le code est coupé à 32 caractères dans le texte plafonné seulement ; la ligne visible (`.diagnostic-text`) garde le code entier. Texte plafonné avec code, quand `label (code)` dépasse 200 : `label.slice(0, 200 − len(' (code)') − 1) + '…' + ' (code)'`.
- **B-4 badge** (FR-8, FR-14) : le badge joint les textes **déjà plafonnés** de chaque ligne par ` · `, puis applique la coupe simple (199 premiers + `…`) si la jointure dépasse 200 ; le code n'y est pas protégé. TC-SDG-U-13 : `title` du badge ≤ 200 et finit par `…`.
- **B-5 aria-label des lignes** (FR-6, FR-7) : les lignes n'ont **pas** d'`aria-label` (la zone live annonce leur texte) ; seul `.diagnostic-text` porte `title`. `aria-label` n'existe que sur le badge.
- **B-6 alerte `door_open` sans porte active** (FR-13) : la ligne alerte est rendue normalement ; la fusion ne s'applique que quand la porte est active (FR-5), donc pas quand la porte est fermée, absente ou invalide.
- **B-7** (FR-9, FR-7) : la comparaison « libellé égal au code » porte sur le résultat final de `stateLabel` (repli compris). La porte n'utilise jamais `stateLabel`.
- **B-8** (FR-9) : `formatEntityState` est appelé avec un seul argument, l'objet d'état ; TC-SDG-U-05 vérifie `toHaveBeenCalledWith(stateObj)`.
- **B-9 prototype** (TC-SDG-U-03) : le cas « prototype » construit `hass.states = Object.assign(Object.create({ [id]: {state:'on'} … }), <états de base>)` ; les autres lectures de la carte n'ont pas à changer.
- **B-10 ids** (FR-3, FR-5) : l'id `trim()`é est celui lu dans `hass.states`, contrôlé pour le domaine et rendu par `getRelevantEntities()`.
- **B-11 compte de lignes** (FR-2) : l'intervalle 670–700 est vérifié **une fois**, au geste FR-1 (commande `wc -l`, notée dans la sortie du BUILD), pas par une assertion permanente ; seule l'assertion ≤ 800 (TC-SDG-U-11) reste dans la suite.
- **B-12 preuves de TC-SDG-U-01** : l'assertion d'exports (import + `typeof` des valeurs ; regex `^(export )?(const|function|interface|type) <nom>\b` sur `sci-fi-stove.ts`, qui ne doit matcher aucun des 17 noms) est dans Vitest ; `tsc --noEmit` et les suites vertes sont prouvés par la pipeline (`npm run build`/`npm test`), pas par `execSync`.
- **B-13 mise en page** (IT-SDG-I-04) : jsdom ne mesure rien ; la preuve automatique est la règle CSS (TC-SDG-U-08, IT-SDG-I-04), la largeur étroite se vérifie à la recette.
- **B-14 position** (FR-6) : `.temperatures` est toujours rendu ; `.diagnostics` suit `.status` quand elle est rendue, sinon il est le premier enfant de `.temperatures`.
- **B-15 couleur** (FR-8, TC-SDG-U-08) : valeur littérale `#ff4444` (celle de `.temperature.high`), en `color` sur `.diagnostic-text` et `--icon-color` sur les `sf-icon` ; sélecteurs groupés autorisés ; le test cherche `#ff4444` dans les règles `.diagnostic` et `.diagnostic-badge`.

## Builder Calls

- Champs sous `sensors` et non à la racine (agent's call, FR-3).
- `unavailable` / `unknown` inactifs (agent's call, FR-5).
- Icônes `mdi:door-open`, `mdi:alert`, `mdi:alert-octagon`, `mdi:door` et couleur unique de `.temperature.high` (agent's call, FR-6, FR-8, FR-10).
- Ligne gardée à la fusion : l'alerte (agent's call, FR-13).
- Mélange de langues `msg` / `formatEntityState` accepté (agent's call, FR-11).
- Séparateur ` · ` du `title` du badge (agent's call, FR-8).
- `stateLabel` est une méthode privée de la carte ; son nom est le choix du builder.

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `number-wheel.ts` | `SciFiStoveCard` |
| `FR-3` | code — `SciFiStoveSensors` | configs YAML des dashboards Lovelace |
| `FR-5` | code — normalisation `none` / `unavailable` / `unknown`, garde de domaine | `SciFiStoveCard._renderMiddleZone`, `_renderContent` |
| `FR-10` | code — `sci-fi-stove-editor.ts`, `labels.ts` | éditeur visuel Lovelace |

## References

- [stove-fan-speed spec](../stove-fan-speed/spec.md) § Requirements
- [stove.md](../cards/stove.md) § Diagnostics — porte, alerte, erreur
