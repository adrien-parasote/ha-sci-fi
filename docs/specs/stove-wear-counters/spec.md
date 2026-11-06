---
spec: docs/specs/stove-wear-counters/spec.md
sources:
  - src/cards/stove/config.ts
  - src/cards/stove/sci-fi-stove.ts
  - src/cards/stove/sci-fi-stove-editor.ts
  - src/cards/stove/labels.ts
  - src/cards/stove/styles.ts
  - src/cards/stove/diagnostics.ts
  - src/cards/water/sci-fi-water-management.ts
  - docs/specs/stove-diagnostics/spec.md
  - docs/specs/cards/stove.md
---

# Stove Wear Counters — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-ve4.4` (dernier enfant de `ha-sci-fi-ve4`). L'intégration core `fumis` expose cinq compteurs d'usure, tous des `sensor` en `state_class: total_increasing` : temps de chauffe, combustible consommé, allumages, ratés d'allumage, surchauffes. Ce lot les affiche sur la carte poêle, dans une vue « Usure » ouverte par une icône de l'en-tête.

Décisions utilisateur du 2026-11-05 (session attended, contraignantes) :
- D1 (amendé 2026-11-06, lot fix `stove-wear-counters`, décision utilisateur) une **vue « Usure »** ouverte par un tap sur une petite icône `button.wear-toggle` de l'en-tête de la carte, **fermée par défaut** ; ouverte, elle remplace le contenu et la barre inférieure de la carte ; plus aucune section au bas de la carte (l'accordéon du 2026-11-05 est retiré : ce sont des statistiques, pas un état à surveiller). Elle liste valeur + unité de chaque compteur configuré (FR-5, FR-6).
- D2 valeurs formatées par HA (`hass.formatEntityState`), avec le repli try/brut déjà utilisé par les diagnostics — **réutilisé, pas copié** (FR-3, FR-7).
- D3 aucun graphe (Anti-pattern 3).
- D4 champs optionnels, déclarés dans `getRelevantEntities()`, exposés dans l'éditeur ; une config sans eux rend **exactement** comme avant (FR-0, FR-4).
- D5 (revue adversariale, F-04) un compteur **configuré** dont l'entité est absente, `unavailable` / `unknown`, hors domaine `sensor.` ou d'id mal formé garde sa ligne, de valeur « — » (jamais omise) ; le bouton et la vue sont rendus dès qu'au moins un compteur est configuré ; aucune config de compteur → ni bouton ni vue (rendu d'avant le lot).
- D6 (revue adversariale, F-14) aucune aide de domaine dans l'éditeur : texte libre, comme les lots précédents (AR-2).

Règles reprises du précédent `stove-diagnostics` ([spec](../stove-diagnostics/spec.md), revue `docs/adversarial-review/stove-diagnostics.md`) : champs sous `sensors` (capteurs lus, jamais pilotés) ; champ non-chaîne ou blanc = absent (`configuredId`) ; lecture par propriété propre et garde de domaine (`readDiagnostic`) ; texte plafonné par `capText` (200) ; texte jamais HTML ; icône `aria-hidden`.

## Requirements

- **FR-0**: **Snapshot de référence, avant tout changement de `src/`.** Premier geste du BUILD : le test `TC-SWC-U-00: pre-lot container` de `tests/cards/stove/sci-fi-stove-wear-counters.test.ts` (dans un `describe('sci-fi-stove — wear counters')`) appelle `expect(normalized).toMatchSnapshot('pre-lot container')` sur le `innerHTML` normalisé (normalisation B-1 de la spec diagnostics : commentaires Lit retirés, blancs réduits, `trim()`) de `.container` d'une carte configurée sans les cinq champs. Le `.snap` est `tests/cards/stove/__snapshots__/sci-fi-stove-wear-counters.test.ts.snap`, sa clé `sci-fi-stove — wear counters > TC-SWC-U-00: pre-lot container > pre-lot container 1`. Une aide de test `preLotContainer()` lit ce fichier par `fs` et extrait la valeur de cette clé par l'expression `/pre-lot container 1`\] = `"([\s\S]*)"`;/` (même forme que `preLotContent` des diagnostics) ; la normalisation B-1 est une fonction locale du fichier de test, `markup.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim()`, recopiée de `tests/cards/stove/sci-fi-stove-diagnostics.test.ts:34` (fichier de test non modifié, FR-1) ; le fichier de test existe dès le premier geste et ses autres tests échouent jusqu'au code du lot (TDD) ; elle lève `pre-lot snapshot missing` si le fichier ou la clé manque. Le `.snap` n'est jamais réécrit (jamais `-u`) et est committé avant le premier commit touchant `src/` (ordre vérifié par `git log` en VERIFY, hors test).
- **FR-1**: **Aide de libellé d'état partagée (déplacement).** Raison : la règle « une seule copie » (D2) — le repli try/brut existe déjà dans `_stateLabel` et le compteur en a besoin ; le plafond de lignes (FR-12) n'est pas la raison. La méthode privée `_stateLabel` de `SciFiStoveCard` quitte la carte pour `src/cards/stove/state-label.ts`, qui exporte :
  ```typescript
  export function formattedState(hass: HomeAssistantExt, entity: HassEntity): string | undefined;
  export function rawState(entity: HassEntity): string;
  export function stateLabel(hass: HomeAssistantExt, entity: HassEntity): string;
  ```
  `formattedState` : si `hass.formatEntityState` est une fonction, l'appelle avec le seul objet d'état dans un `try` ; renvoie le résultat s'il est une chaîne non vide après `trim()`, sinon (lève, non-chaîne, vide, fonction absente) `undefined` ; rien n'est journalisé. `rawState` : `String(entity.state).trim()` avec tous les `_` remplacés par des espaces (inchangé : c'est le comportement des diagnostics ; un compteur numérique n'a pas de `_`). `stateLabel` = `formattedState(...) ?? rawState(...)` — comportement identique à l'ancien `_stateLabel`. La carte appelle `stateLabel(this.hass, …)` pour l'alerte et l'erreur ; `_stateLabel` n'existe plus dans `sci-fi-stove.ts` ; la suite `tests/cards/stove/sci-fi-stove-diagnostics.test.ts` reste verte sans modification.
- **FR-2**: `SciFiStoveSensors` (`src/cards/stove/config.ts`) gagne, après `sensor_error`, `readonly sensor_heating_time?: string;`, `readonly sensor_fuel_used?: string;`, `readonly sensor_igniter_starts?: string;`, `readonly sensor_misfires?: string;`, `readonly sensor_overheatings?: string;` (sous `sensors`, comme les diagnostics). Chaque valeur passe par `configuredId` (`src/cards/stove/diagnostics.ts`) : non-chaîne ou blanche → **non configurée** (aucune ligne, absente de `getRelevantEntities()`), sinon **configurée**, id `trim()`é.
- **FR-2.1**: **Garde de forme de l'id.** Un id configuré est **bien formé** ssi sa longueur est ≤ 255 et il vérifie `/^[a-z0-9_]+\.[a-z0-9_]+$/`. Un id configuré mal formé (trop long, majuscules, espaces, balisage…) n'est jamais lu dans `hass.states` ni ajouté à `getRelevantEntities()` ; sa ligne est rendue avec « — » (FR-5). Aucune exception, rien journalisé.
- **FR-3**: **Module du rendu.** `src/cards/stove/wear-counters.ts` porte tout ce qui est propre aux compteurs (le bouton et la vue de FR-6, aucun import d'accordéon depuis l'amendement du 2026-11-06) :
  ```typescript
  export type WearCounterKey = 'sensor_heating_time' | 'sensor_fuel_used' | 'sensor_igniter_starts' | 'sensor_misfires' | 'sensor_overheatings';
  export interface WearCounterSpec { readonly key: WearCounterKey; readonly icon: string; readonly label: () => string; }
  export interface WearCounterRow { readonly key: WearCounterKey; readonly icon: string; readonly label: string; readonly value: string; readonly fullValue: string; }
  export const WEAR_COUNTERS: readonly WearCounterSpec[];
  export const WEAR_MISSING = '—';
  export function wearEntityIds(sensors: SciFiStoveSensors): string[];
  export function wearRows(hass: HomeAssistantExt, sensors: SciFiStoveSensors): WearCounterRow[];
  export function wearValue(hass: HomeAssistantExt, entity: HassEntity): string;
  export function renderWearCounters(rows: readonly WearCounterRow[], open: boolean, onToggle: (open: boolean) => void, connection: HomeAssistantExt['connection']): TemplateResult | typeof nothing;
  ```
  `connection` (amendement BUILD) est passé à chaque `sf-icon` de ligne (`.connection`), comme les autres icônes de la carte : sans lui, `sf-icon` ne charge pas l'icône MDI et journalise `console.warn` (contraire à TC-SWC-U-06).
  `WEAR_COUNTERS`, dans cet ordre : `sensor_heating_time` `mdi:timer-outline` `msg('Heating time')` ; `sensor_fuel_used` `mdi:fuel` `msg('Fuel used')` ; `sensor_igniter_starts` `mdi:fire` `msg('Igniter starts')` ; `sensor_misfires` `mdi:fire-alert` `msg('Misfires')` ; `sensor_overheatings` `mdi:thermometer-alert` `msg('Overheatings')`. `wearEntityIds` rend, dans cet ordre, les ids configurés **et bien formés** (FR-2, FR-2.1). `wearValue` réutilise `formattedState` et `rawState` de FR-1 (aucune copie du `try`).
- **FR-4**: **`getRelevantEntities()`** ajoute chaque id de `wearEntityIds(this.config.sensors ?? {})` ; sans champ configuré bien formé, l'ensemble est identique à aujourd'hui.
- **FR-5**: **Lignes rendues.** `wearRows` rend une ligne par compteur **configuré** (FR-2) de `WEAR_COUNTERS`, dans cet ordre ; un compteur non configuré n'a pas de ligne. La ligne a une valeur **lisible** ssi : l'id est bien formé (FR-2.1), `readDiagnostic(hass.states, id, 'sensor.')` rend une entité (propriété propre, domaine `sensor.`), et son état est une chaîne dont `trim()` est non vide et dont la forme en minuscules n'est ni `unavailable` ni `unknown`. Lisible → `fullValue = wearValue(hass, entity)` ; sinon `fullValue = WEAR_MISSING` (`—`). Dans tous les cas `value = capText(fullValue)` (`diagnostics.ts`, 200 caractères, 199 + `…` au-delà). Rien journalisé. Exemple : `fuel_used` `'unavailable'` et les quatre autres valides → 5 lignes, `fuel_used` de valeur `—`.
- **FR-6**: **Bouton et vue « Usure » (amendé 2026-11-06).** `renderWearToggle(rows, open, onToggle, connection)` rend `nothing` quand `rows` est vide (aucun compteur configuré) ; sinon un `button.wear-toggle` (`type="button"`, `aria-label` = `msg('Wear')` (fr `Usure`), `aria-expanded` = `open`) contenant un `sf-icon` `aria-hidden="true"` d'icône `mdi:wrench-clock` (fermée) ou `mdi:close` (ouverte), dont le `click` appelle `onToggle(!open)`. La carte le rend dans `.header`, après le nom : `<div class="header">${name}${toggle}</div>`. `renderWearView(rows, connection)` rend un `div.wear-view` (`role="region"`, `aria-label` = `msg('Wear')`) contenant, par ligne, un `div` de classes `wear-counter <clé sans préfixe sensor_>` (ex. `wear-counter heating_time`) avec un `sf-icon` (icône de la ligne, `aria-hidden="true"`), un `span.wear-label` (libellé, `title` = le libellé) puis un `span.wear-value` (texte `value`, `title` = `fullValue`, FR-7). Dans `renderCard()`, quand `_wearOpen` est vrai **et** que `rows` n'est pas vide, `.container` contient l'en-tête puis `div.wear-view` à la place de `.content` et `.bottom` ; sinon le rendu est celui d'avant le lot (la branche « entité introuvable » ne change pas). Sans compteur configuré, ni bouton ni vue : le snapshot FR-0 tient. L'accordéon `sf-editor-accordion.wear-counters` du lot initial n'existe plus.
- **FR-7**: **Valeur (amendé 2026-11-06 : arrondi, décision utilisateur D7).** Précondition : `wearValue(hass, entity)` n'est appelée que sur une entité à valeur lisible (FR-5) ; sur une autre, son résultat n'est pas spécifié et `wearRows` ne l'appelle pas. Quand l'état brut est **numérique** (`trim()` de la forme décimale `/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/` — donc ni `0x10` ni `0b11` — et `Number.isFinite(Number(raw))`), la valeur est ce nombre **arrondi à une décimale au plus** (`Number(n.toFixed(1))`, donc `104.483333` → `104.5`, `12.0` → `12`, `35` → `35`), suivi, quand `entity.attributes` a la **propriété propre** (`Object.hasOwn`) `unit_of_measurement` de valeur chaîne non blanche, d'une espace insécable U+00A0 et de cette unité `trim()`ée ; le formateur de HA n'est pas appelé pour un état numérique (il rendait l'état brut non arrondi, D2 amendé). Pour un état non numérique (énumération) : `formattedState(hass, entity)` quand il rend une chaîne (affichée telle quelle, quelle qu'elle soit : HA est la source du texte), sinon `rawState(entity)` suivi de l'unité comme ci-dessus. Exemples : état `'1234'`, unité `'h'` → `1234 h` ; `'104.483333'`, `'h'` → `104.5 h` ; `'12.5'`, sans unité → `12.5` ; `'on'`, formateur → `'Allumé'` → `Allumé`. Libellé et valeur sont des liaisons de texte Lit, jamais du HTML.
- **FR-8**: **État d'ouverture.** Agent's call : `@state() private _wearOpen = false` sur l'instance de la carte, mis à jour par `onToggle` ; non persisté (ni `localStorage`, ni config) ; un nouvel élément démarre fermé, y compris quand Lovelace recrée la carte (changement de vue, édition du tableau de bord) — limite acceptée AR-1 ; une réassignation de `hass` ne le remet pas à `false`. Si la config perd tous ses compteurs alors que la vue est ouverte, la carte rend son contenu normal (la vue n'est rendue que si `rows` n'est pas vide) et `setConfig` remet `_wearOpen` à `false` : un compteur ajouté ensuite démarre fermé.
- **FR-9**: **Styles** (`src/cards/stove/styles.ts`) : `.header` en `position: relative` et `padding: 5px 32px` (la place du bouton, de chaque côté pour garder le nom centré) ; `.wear-toggle` en `position: absolute`, `right: 4px`, `top: 50%`, `transform: translateY(-50%)`, `background: none`, `border: none`, `color: inherit`, `cursor: pointer`, `padding: 0`, `line-height: 0`, `--icon-width: 16px`, `--icon-height: 16px` ; `.wear-view` en `padding: 8px 12px` ; `.wear-counter` en `display: flex`, `align-items: center`, `gap: 8px` ; `.wear-label` en `flex: 1`, `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap` ; `.wear-value` en `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `max-width: 50%`. Le texte tronqué à l'écran reste lisible en entier par le `title` (FR-6).
- **FR-10**: **Éditeur.** `STOVE_SENSOR_FIELDS` (`src/cards/stove/sci-fi-stove-editor.ts`) gagne, juste après `sensor_error` et dans l'ordre de FR-3, `['sensor_heating_time', 'input-stove-heating-time', 'mdi:timer-outline']`, `['sensor_fuel_used', 'input-stove-fuel-used', 'mdi:fuel']`, `['sensor_igniter_starts', 'input-stove-igniter-starts', 'mdi:fire']`, `['sensor_misfires', 'input-stove-misfires', 'mdi:fire-alert']`, `['sensor_overheatings', 'input-stove-overheatings', 'mdi:thermometer-alert']` ; `labels.ts` mappe ces clés sur `msg('Heating time')`, `msg('Fuel used')`, `msg('Igniter starts')`, `msg('Misfires')`, `msg('Overheatings')`. Texte libre, sans filtre ni aide de domaine (D6, AR-2) ; sur la carte, un domaine inattendu donne une ligne `—` (FR-5), visible.
- **FR-11**: six chaînes source nouvelles — `Wear` (`Usure`), `Heating time` (`Temps de chauffe`), `Fuel used` (`Combustible consommé`), `Igniter starts` (`Allumages`), `Misfires` (`Ratés d'allumage`), `Overheatings` (`Surchauffes`) — avec leurs unités dans `xliff/fr.xlf` et `src/locales/locales/fr.js` régénéré (`npm run localize-extract`, `npm run localize-build`).
- **FR-12**: **Plafond de lignes.** SHOW — `wc -l src/cards/stove/sci-fi-stove.ts` → 775 (2026-11-05). Arithmétique, sur ce fichier : FR-1 retire `_stateLabel` avec son commentaire et la ligne vide qui suit (lignes 353-366, **14 lignes**) ; ajouts estimés : import de `state-label.ts` (1), import de `wear-counters.ts` (1), `getRelevantEntities()` (2), `@state() _wearOpen` avec son commentaire (2), appel de `renderWearCounters` dans `.container` (4) — **10 lignes** ; attendu ≈ 775 − 14 + 10 = **771**. Plafond, avec marge sur l'estimation : **à la fin du lot** (dernier geste du BUILD, et à nouveau en VERIFY), `sci-fi-stove.ts` compte au plus 790 lignes. Au-delà, le surplus part dans `wear-counters.ts`, jamais en relevant le plafond.
- **FR-13**: [stove.md](../cards/stove.md) documente ce comportement : ligne Blueprint `F-STOVE-D12`, section `### Usure — compteurs fumis` (dont : ligne « — » d'un compteur configuré illisible, état ouvert perdu à la recréation de la carte), sélecteurs gelés `button.wear-toggle`, `div.wear-view`, `.wear-counter`, `.wear-value`, lignes de l'Error Handling Matrix (compteur indisponible ou mal configuré, formateur absent/en échec).

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Les cinq compteurs fumis sont des `sensor.*` numériques `total_increasing` dont `formatEntityState` rend valeur + unité | Low | TELL — énoncé utilisateur 2026-11-05 ; CITED — API frontend HA `hass.formatEntityState` | TC-SWC-U-04 ; recette sur l'instance réelle |
| 2 | (retirée 2026-11-06 : l'accordéon de face de carte n'est plus utilisé par ce lot) | — | — | — |
| 3 | (retirée 2026-11-06 : plus de composant repliable) | — | — | — |
| 4 | `_stateLabel` est la seule copie du repli try/brut | Low | SHOW — `grep -rn formatEntityState src` → `src/types/ha.ts` et `sci-fi-stove.ts` `_stateLabel` (2026-11-05) | TC-SWC-U-01 |
| 5 | Le bouton `button.wear-toggle` est un `<button>` natif, donc focalisable et activé par Entrée et Espace, et expose son état par `aria-expanded` | Low | SHOW — élément natif, aucun composant partagé n'est touché | IT-SWC-I-04 |

## Accepted Risks

| # | Risk | Decision | Evidence |
|---|------|----------|----------|
| AR-1 | L'état ouvert de la vue est perdu quand Lovelace recrée l'élément (changement de vue, édition) | accepté, agent's call (FR-8 : état d'instance, non persisté, D1 « fermée par défaut ») ; documenté dans stove.md | IT-SWC-I-03 (le nouvel élément démarre replié) ; TC-SWC-U-08 (mention dans stove.md) |
| AR-2 | L'éditeur n'aide pas au choix de domaine : un `binary_sensor.x` est accepté | accepté, décision utilisateur 2026-11-05 (D6) ; la carte rend alors une ligne `—`, visible (D5) | TC-SWC-U-06 |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Copier le `try` de `_stateLabel` dans `wear-counters.ts` | aide partagée `state-label.ts`, FR-1, FR-7 |
| 2 | Vue ouverte par défaut, ou état persisté | fermée, état d'instance, FR-8 |
| 3 | Graphe, historique, ou appel `history` | valeur courante seule (D3) |
| 4 | Omettre la ligne d'un compteur configuré illisible, ou rendre la section sans compteur configuré | ligne `—`, section omise sans configuration, FR-5, FR-6 |
| 5 | Ajouter le rendu dans `sci-fi-stove.ts` jusqu'à dépasser 790 lignes | module `wear-counters.ts`, FR-3, FR-12 |
| 6 | Régénérer le snapshot `pre-lot container` avec `-u` | snapshot pris avant le lot, FR-0 |
| 7 | Lire `hass.states` avec un id non borné | garde de forme FR-2.1 |

## Test Case Specifications

Tests dans `tests/cards/stove/sci-fi-stove-wear-counters.test.ts` (carte et module), `tests/cards/stove/sci-fi-stove-editor.test.ts` (éditeur) ; mêmes conventions que la spec diagnostics (mock `hass`, `formatEntityState` en `vi.fn`). « Égal au snapshot FR-0 » = égal à `preLotContainer()`.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SWC-U-00 | sur le code d'avant le lot, config sans les cinq champs ; `toMatchSnapshot('pre-lot container')` sur `.container` normalisé ; puis `preLotContainer()` | FR-0 | le test passe ; le fichier `.snap` existe et contient la clé `sci-fi-stove — wear counters > TC-SWC-U-00: pre-lot container > pre-lot container 1` ; `preLotContainer()` rend une chaîne non vide égale au `.container` normalisé courant |
| TC-SWC-U-01 | importer `state-label.ts` ; lire la source de `sci-fi-stove.ts` ; `formatEntityState` → `'Low fuel'`, puis qui lève, puis → `42`, puis `'  '`, puis absent, état `'low_fuel'` | FR-1 | `formattedState` → `'Low fuel'`, puis `undefined` ×4 ; `stateLabel` → `'Low fuel'` puis `'low fuel'` ×4 ; `formatEntityState` appelé avec le seul objet d'état ; aucune exception, aucun `console.error` ; `sci-fi-stove.ts` ne contient ni `_stateLabel` ni `formatEntityState` et contient `from './state-label` |
| TC-SWC-U-02 | config sans les cinq champs ; puis `sensor_heating_time: 42`, `sensor_fuel_used: ['x']`, `sensor_misfires: '  '` ; `.container` normalisé et `getRelevantEntities()` | FR-2, FR-4, FR-6 | égal au snapshot FR-0 dans les deux cas ; aucun `button.wear-toggle` ni `div.wear-view` ; `getRelevantEntities()` sans `42` ni id de compteur |
| TC-SWC-U-03 | les cinq champs (`' sensor.stove_heating_time '` avec espaces pour le premier) ; `getRelevantEntities()` ; puis tous `'unavailable'`, `'UNKNOWN'`, `''`, `'   '`, absents de `hass`, ou présents seulement sur le prototype de `hass.states` ; vue ouverte | FR-2, FR-4, FR-5, FR-6 | `getRelevantEntities()` contient les cinq ids `trim()`és ; dans chaque cas d'état, `div.wear-view` rendu avec 5 `.wear-counter` dans l'ordre de FR-3, chaque `.wear-value` de texte `—` et de `title` `—` ; aucune exception |
| TC-SWC-U-04 | cinq compteurs valides, états `'104.483333'` (unité `h`), `'56.7'` (`kg`), `'890'`, `'12'`, `'3'` ; vue ouverte ; puis `fuel_used` `'unavailable'` ; puis seul `sensor_misfires` configuré | FR-3, FR-5, FR-6, FR-7 | `button.wear-toggle` dans `.header`, `aria-label` `Wear`, `aria-expanded` `true`, icône `mdi:close` ; `div.wear-view` à la place de `.content` et `.bottom` ; 5 `.wear-counter` dans l'ordre `heating_time`, `fuel_used`, `igniter_starts`, `misfires`, `overheatings`, libellés `Heating time`…`Overheatings` (`title` des `.wear-label` identiques), `.wear-value` `104.5 h`, `56.7 kg`, `890`, `12`, `3`, `sf-icon` `aria-hidden` `true` aux icônes de FR-3 ; puis 5 lignes, `.wear-counter.fuel_used .wear-value` `—` ; puis une seule ligne `misfires`, vue rendue |
| TC-SWC-U-05 | `wearValue` : état `'1234'` unité `'h'` ; `'12.5'` sans unité ; `'104.483333'` unité `'h'` ; `'12.0'` ; `'0.04'` ; unité `'  '` ; unité `42` ; unité `'h'` seulement sur le prototype de `attributes` ; état non numérique `'on'` avec formateur → `'<b>x</b>'` ; formateur → chaîne de 500 `x` | FR-7, FR-5, FR-6 | `1234 h` (U+00A0, pas d'espace U+0020), `12.5`, `104.5 h`, `12`, `0`, `12.5`, `12.5`, `12.5` ; rendu : `.wear-value` de texte littéral `<b>x</b>`, aucun élément `b` ; 500 `x` : texte de `.wear-value` de 200 caractères finissant par `…`, `title` des 500 `x` |
| TC-SWC-U-06 | `heating_time` `'sensor.x'` ok, `fuel_used: 'binary_sensor.x'`, `misfires: 'switch.x'`, `igniter_starts` = `'sensor.' + 'a'.repeat(300)`, `overheatings: 'sensor.X <b>'` ; `getRelevantEntities()` | FR-2.1, FR-4, FR-5 | 5 lignes ; `heating_time` valeur lue, les quatre autres `—` ; `getRelevantEntities()` contient `sensor.x`, `binary_sensor.x`, `switch.x`, ni l'id de 307 caractères ni `sensor.X <b>` ; aucune exception, aucun `console.warn` / `console.error` |
| TC-SWC-U-07 | éditeur monté avec les cinq champs | FR-10 | entrées `input-stove-heating-time`, `input-stove-fuel-used`, `input-stove-igniter-starts`, `input-stove-misfires`, `input-stove-overheatings` juste après `input-stove-error`, dans cet ordre, libellés `Heating time`…`Overheatings` ; un changement émet `config-changed` avec `sensors.sensor_misfires` |
| TC-SWC-U-08 | règles rendues : `cssText` des feuilles de `SciFiStoveCard.styles` (les styles réellement adoptés par la carte), parsées en règles par sélecteur ; lire `xliff/fr.xlf`, `src/locales/locales/fr.js`, `docs/specs/cards/stove.md` | FR-9, FR-11, FR-13 | les règles `.wear-toggle`, `.wear-view`, `.wear-counter`, `.wear-label`, `.wear-value` portent chacune les déclarations de FR-9 ; une unité et une entrée par chaîne de FR-11 avec sa traduction ; `stove.md` contient `F-STOVE-D12`, `### Usure — compteurs fumis`, `button.wear-toggle`, `div.wear-view`, `.wear-value`, `« — »`, `recrée`, et une ligne de matrice `compteur d'usure` |
| TC-SWC-U-09 | fin de lot : `sci-fi-stove.ts` lu via `fs` | FR-12 | ≤ 790 lignes |
| IT-SWC-I-01 | élément réel `sci-fi-stove` dans `document.body`, cinq compteurs ; cliquer `button.wear-toggle` | FR-6, FR-8 | avant clic : `_wearOpen` faux, `aria-expanded` `false`, aucun `div.wear-view`, `.content` présent ; après : `_wearOpen` vrai, `aria-expanded` `true`, `div.wear-view` rendu, ni `.content` ni `.bottom` ; second clic : retour à l'état d'avant |
| IT-SWC-I-02 | même élément, vue ouverte, `hass` réassigné avec `heating_time` `'1300'` (unité `h`) | FR-7, FR-8 | vue toujours ouverte ; `.wear-value` `1300 h` |
| IT-SWC-I-03 | élément réel avec diagnostics (erreur `'e101'` `code: 'E101'`), puissance et compteurs ; vue fermée puis ouverte ; nouvel élément créé ensuite avec la même config | FR-1, FR-6, FR-8 | fermée : `.diagnostic.error .diagnostic-text` `Ignition failure (E101)` (FR-1 sans régression) et molette `sf-wheel.power-level` rendues ; ouverte : `div.wear-view` rendu à leur place ; le nouvel élément démarre fermé (AR-1) |
| IT-SWC-I-04 | élément réel, cinq compteurs ; `button.wear-toggle` : `focus()` puis `click()` (l'action que déclenche Entrée ou Espace sur un bouton natif) | FR-6, FR-8 | le bouton est un `<button>`, n'est pas `disabled`, `tabIndex` ≥ 0 ; après `focus()`, `shadowRoot.activeElement` est le bouton ; après `click()`, `_wearOpen` vrai et `aria-expanded` `true` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| champ de compteur non-chaîne ou blanc | non configuré, aucune ligne (FR-2) | — | aucun |
| id configuré mal formé (> 255, hors `/^[a-z0-9_]+\.[a-z0-9_]+$/`) | jamais lu ni déclaré ; ligne `—` (FR-2.1) | — | aucun |
| entité de compteur absente (propriété propre) | ligne `—` (FR-5) | — | aucun |
| état `unavailable` / `unknown` (toute casse), vide, non-chaîne | ligne `—` (FR-5) | — | aucun |
| domaine inattendu (hors `sensor.`) | ligne `—` (FR-5) | — | aucun |
| aucun compteur configuré | ni bouton ni vue (FR-6) | rendu d'avant le lot | aucun |
| `formatEntityState` absent, lève, non-chaîne, vide | état brut + U+00A0 + unité (FR-7) | — | aucun |
| `unit_of_measurement` absent, non-chaîne, blanc ou hérité | état brut seul (FR-7) | — | aucun |
| texte avec balisage | rendu comme texte (FR-7) | — | aucun |
| valeur très longue | `capText` à 200, ellipsis CSS, texte entier en `title` (FR-5, FR-6, FR-9) | — | aucun |

## Builder Calls

- Bouton et vue : un `<button>` natif et un `div` dans `wear-counters.ts` (agent's call, décision utilisateur D1 amendée 2026-11-06) ; aucun accordéon, aucun composant partagé modifié.
- État d'ouverture par instance, non persisté (agent's call, FR-8, AR-1).
- Compteur configuré illisible rendu « — » (décision utilisateur D5, FR-5).
- Garde d'id à 255 caractères et `/^[a-z0-9_]+\.[a-z0-9_]+$/` (agent's call, FR-2.1 : forme des entity_id HA).
- Plafond des valeurs par `capText` existant (200) plutôt qu'un nouveau plafond (agent's call, FR-5).
- Icônes de FR-3 et `mdi:wrench-clock` (agent's call).
- Plafond de fin de lot 790 lignes (agent's call, FR-12).

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `state-label.ts` | `SciFiStoveCard`, `wear-counters.ts` |
| `FR-2` | code — `SciFiStoveSensors` | configs YAML Lovelace |
| `FR-3` | code — `wear-counters.ts` | `SciFiStoveCard._renderContent`/`renderCard` |
| `FR-10` | code — `sci-fi-stove-editor.ts`, `labels.ts` | éditeur visuel Lovelace |

## References

- [stove-diagnostics spec](../stove-diagnostics/spec.md) § Requirements
- [stove.md](../cards/stove.md) § Usure — compteurs fumis
