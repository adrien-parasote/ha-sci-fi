---
spec: docs/specs/stove-pellet-cost/spec.md
sources:
  - src/cards/stove/config.ts
  - src/cards/stove/sci-fi-stove.ts
  - src/cards/stove/sci-fi-stove-editor.ts
  - src/cards/stove/labels.ts
  - docs/specs/cards/stove.md
---

# Stove Pellet Cost — Implementation Spec

Document Type: implementation

## Overview

Demande utilisateur du 2026-11-06 (session attended) : afficher dans la zone haute de la carte `sci-fi-stove`, à côté de la jauge de granulés et du stock de sacs, le **coût des pellets consommés** en euros, avec une icône d'argent. La carte ne calcule rien : elle affiche l'état d'une entité numérique que l'utilisateur tient à jour dans Home Assistant — chez lui `input_number.pellet_cout_saison` / `input_number.pellet_cout_total`, alimentés par une automation qui ajoute `sacs en moins × prix du sac` à chaque baisse de `counter.pellet_stock` (SHOW — `ha_config_get_automation automation.pellet_cout`, créée le 2026-11-06). Ce lot ajoute le champ racine optionnel `pellet_cost`, une cellule `div.pellet-cost` dans `.quantities`, l'entrée éditeur et la documentation de mise en place des helpers (comme celle du compteur de stock), dont l'automation de stock existante corrigée : c'est le YAML que l'utilisateur copie qui fait la comptabilité, il doit être juste tel qu'écrit.

## Requirements

- **FR-1**: `SciFiStoveConfig` (`src/cards/stove/config.ts`) gagne `readonly pellet_cost?: string;`, déclaré juste après `storage_counter_threshold`. Aucun autre champ n'est modifié (ADR-005).
- **FR-2**: `getRelevantEntities()` ajoute `config.pellet_cost` quand il est renseigné. Absent, l'ensemble est identique à aujourd'hui.
- **FR-3**: sans `config.pellet_cost`, le markup de `.quantities` est identique à celui d'avant ce lot : aucun `div.pellet-cost`. (La règle CSS `flex-wrap` de FR-8 ne change le placement que quand la rangée déborde.)
- **FR-4**: avec `config.pellet_cost` présent dans `hass.states` et un état lisible (FR-5), `.quantities` rend, **après** la jauge de stock (`sf-stack-bar`) quand elle est rendue, sinon en dernier, un `div.pellet-cost` contenant dans cet ordre un `sf-icon` d'icône `mdi:cash` (`aria-hidden="true"`) puis un `div.text` dont le texte est `` `${msg('Cost')} (${montant})` `` — fr `Coût (26,00 €)`, même forme que `Stock (68)` de `sf-stack-bar`.
- **FR-4.1**: **Formatage du montant.** `montant` = `formatPelletCost(value, unit, language)` exporté par `src/cards/stove/pellet-cost.ts` : `new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)`, suivi d'une espace et de l'unité retenue (FR-4.2), sans espace finale quand aucune unité n'est retenue. `unit` = `attributes.unit_of_measurement` de l'entité ; `language` = `hass.locale.language`, à défaut `hass.language`, à défaut `'en'`. `-0` est formaté comme `0`. Les montants négatifs sont formatés avec leur signe (la carte affiche l'état, elle ne le corrige pas). Exemples : `(26, '€', 'fr')` → `26,00 €` (espace insécable du format fr incluse) ; `(1234.5, '€', 'en')` → `1,234.50 €` ; `(0, undefined, 'fr')` → `0,00` ; `(-3.456, '€', 'en')` → `-3.46 €` ; `(-0, '€', 'en')` → `0.00 €`.
- **FR-4.2**: **`formatPelletCost` ne lève jamais.** Signature `formatPelletCost(value: number, unit: unknown, language: unknown): string`. (a) `language` qui n'est pas une chaîne non vide, ou que `Intl.NumberFormat` rejette (`RangeError` : `'fr_FR'`, `''`, `'zz_ZZ'` — SHOW, Node 22, 2026-11-06), → le format est construit avec `'en'` (un `try/catch` autour du constructeur, puis `'en'`). (b) `unit` qui n'est pas une chaîne (nombre, objet, tableau, `null`) → aucune unité. (c) `unit` chaîne → retenue après `trim` si elle fait de 1 à 8 caractères ; vide ou plus longue que 8 → aucune unité.
- **FR-4.3**: le montant et l'unité sont insérés dans le template Lit par interpolation de texte (`${…}` en position de contenu) ; ni `unsafeHTML`, ni `innerHTML`, ni `.innerHTML=` dans le rendu de la cellule.
- **FR-5**: avec `config.pellet_cost` renseigné mais l'entité absente de `hass.states`, ou d'état `unavailable`, `unknown`, vide ou blanc après `trim`, non numérique (`'abc'`, `'NaN'`, `'Infinity'`), ou de valeur absolue `≥ 1e9` (`'1e300'`), **aucun** `div.pellet-cost` n'est rendu (même règle que la jauge de granulés sur état non numérique) ; les autres jauges sont inchangées.
- **FR-6**: l'éditeur rend `this._renderInput('pellet_cost', 'entity', 'input-pellet-cost', 'mdi:cash', config.pellet_cost ?? '')` juste après la ligne `storage_counter` ; `labels.ts` mappe `'input-pellet-cost'` sur `msg('Pellet cost')` (fr `Coût des pellets`).
- **FR-7**: deux chaînes source nouvelles — `Cost` (`Coût`) et `Pellet cost` (`Coût des pellets`) — avec leurs unités `xliff/fr.xlf` et `src/locales/locales/fr.js` régénéré (`npm run localize-extract`, `npm run localize-build`).
- **FR-8**: `src/cards/stove/styles.ts` : la règle existante `.content .info .e.bottom-path .quantities` (celle qui porte `column-gap: 20px`) gagne `flex-wrap: wrap` et `row-gap: 10px`. Une règle `.content .info .e.bottom-path .quantities .pellet-cost` : `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: flex-end`, `gap: 5px`, `min-width: 0`, `font-size: var(--sf-text-sm, 12px)`, `color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6))` ; `.pellet-cost .text` porte `white-space: nowrap` ; `.pellet-cost sf-icon` porte `--icon-color: var(--primary-light-color, #6ecbf5)`, `width: 40px`, `height: 40px`.
- **FR-9**: [docs/cards/stove.md](../../cards/stove.md) documente la clé : `pellet_cost` dans l'exemple YAML « Full » et la table Options (`String`, « Numeric entity holding the pellet cost (e.g. an `input_number`), shown next to the stock »). Une section `## Pellet cost` décrit la mise en place, en anglais comme le reste du fichier :
  - **FR-9.1** — deux helpers : `input_number.pellet_bag_price` (prix d'un sac, step 0.01, unité `€`) et `input_number.pellet_cost` (min 0, max 100000, step 0.01, **unit of measurement `€`** — sans unité, la carte affiche le montant seul), créés par Settings → Devices & services → Helpers → Number.
  - **FR-9.2** — l'automation de coût, exactement ce YAML (garde `not_from`/`not_to`, deux états numériques, baisse stricte, `mode: queued` pour que deux baisses rapprochées ne perdent pas de mise à jour) :
    ```yaml
    alias: Pellet cost
    triggers:
      - trigger: state
        entity_id: counter.pellet_stock
        not_from: [unavailable, unknown]
        not_to: [unavailable, unknown]
    conditions:
      - condition: template
        value_template: >
          {{ trigger.from_state.state | is_number
             and trigger.to_state.state | is_number
             and trigger.from_state.state | int > trigger.to_state.state | int }}
    actions:
      - variables:
          bags: "{{ trigger.from_state.state | int - trigger.to_state.state | int }}"
      - action: input_number.set_value
        target:
          entity_id: input_number.pellet_cost
        data:
          value: >
            {{ states('input_number.pellet_cost') | float(0)
               + bags * states('input_number.pellet_bag_price') | float(0) }}
    mode: queued
    ```
  - **FR-9.3** — trois notes sous le YAML : (a) *price change* — « the cost is booked at the price in force when the stock drops; changing the bag price only affects bags consumed afterwards » ; (b) *manual correction* — « any downward change of `counter.pellet_stock` is billed, a manual correction included: turn the `Pellet cost` automation off before correcting the stock, then back on » ; une hausse (réassort) ne coûte rien ; (c) *season or total* — pour un coût par saison d'octobre à octobre, un second helper remis à zéro par une automation `trigger: time` à `00:00:00` avec la condition `{{ now().month == 10 and now().day == 1 }}` ; la carte affiche une seule entité, la saison est recommandée. Le helper de saison s'appelle `input_number.pellet_cost_season` ; le YAML de FR-9.2 reste tel quel, et la doc montre à part l'action à ajouter en fin de ses `actions` pour alimenter aussi la saison, exactement :
    ```yaml
      - action: input_number.set_value
        target:
          entity_id: input_number.pellet_cost_season
        data:
          value: >
            {{ states('input_number.pellet_cost_season') | float(0)
               + bags * states('input_number.pellet_bag_price') | float(0) }}
    ```
    La remise à zéro est exactement (agent's call : la doc publie un YAML complet, comme FR-9.2) :
    ```yaml
    alias: Pellet cost new season
    triggers:
      - trigger: time
        at: "00:00:00"
    conditions:
      - condition: template
        value_template: "{{ now().month == 10 and now().day == 1 }}"
    actions:
      - action: input_number.set_value
        target:
          entity_id: input_number.pellet_cost_season
        data:
          value: 0
    mode: single
    ```
  - **FR-9.4** — une ligne *Troubleshooting* : « no cost cell on the card: check the entity id in Developer tools → States, and that its state is a number below 1e9 (`unavailable`, `unknown` or text hide the cell) ».
  - **FR-9.5** — la section existante `## Pellet storage counter automation` est corrigée : son exemple déclenche sur toute transition d'état, si bien qu'un passage `unavailable` → `100` décrémente un sac fantôme que l'automation de coût facturerait. Le nouvel exemple, exactement :
    ```yaml
    alias: Pellet stock management
    triggers:
      - trigger: numeric_state
        entity_id: sensor.stove_pellet_quantity
        above: 99
        for: "00:02:00"
    conditions:
      - condition: template
        value_template: "{{ trigger.from_state.state | is_number }}"
    actions:
      - action: counter.decrement
        target:
          entity_id: counter.pellet_stock
    mode: single
    ```
- **FR-10**: [docs/specs/cards/stove.md](../cards/stove.md) gagne la ligne Blueprint `F-STOVE-D13` (coût des pellets : champ racine optionnel `pellet_cost`, cellule `div.pellet-cost` après le stock ; absent, la carte rend exactement comme avant) et le sélecteur gelé `div.pellet-cost` dans § Test Selectors — Frozen Contract.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | L'utilisateur tient le coût à jour dans HA (helper + automation) ; la carte ne fait qu'afficher | Low | TELL — énoncé utilisateur 2026-11-06 « dans la configuration tu pointes vers notre variable de cost » | TC-SPC-U-01 |
| 2 | `Intl.NumberFormat` est disponible dans les navigateurs du frontend HA et dans happy-dom, et lève `RangeError` sur une balise mal formée | Low | SHOW — `Intl.NumberFormat('fr', {minimumFractionDigits:2}).format(26)` → `26,00` ; `new Intl.NumberFormat('fr_FR')` → `RangeError: Invalid language tag` sous Node 22 | TC-SPC-U-02, TC-SPC-U-12 |
| 3 | L'icône `mdi:cash` est résolue par `sf-icon` via le registre MDI de HA, comme `mdi:lightning-bolt` des cellules de puissance | Low | SHOW — `_renderPower` utilise `sf-icon icon="mdi:lightning-bolt"` | TC-SPC-U-01 |
| 4 | Une seule entité est affichée ; saison ou total est le choix de l'utilisateur dans sa config, la doc recommande la saison | Low | agent's call — une clé, une entité, comme `storage_counter` | TC-SPC-U-05, TC-SPC-U-09 |
| 5 | Le déclencheur `numeric_state above: 99 for: 2 min` avec la garde `from_state` numérique ne décrémente pas sur un retour d'`unavailable` | Low | SHOW — automation `incrementation_sacs_pellet` de l'utilisateur, corrigée et observée le 2026-11-06 | TC-SPC-U-10 |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Calculer le coût dans la carte à partir du stock et d'un prix | afficher l'état de l'entité `pellet_cost`, FR-4 |
| 2 | Afficher `NaN`, `unavailable` ou `0,00` pour une entité illisible | aucune cellule, FR-5 |
| 3 | Concaténer l'état brut (`26.0 €`) | `formatPelletCost`, deux décimales à la locale de HA, FR-4.1 |
| 4 | Laisser un attribut ou une locale de `hass` atteindre une API qui lève pendant le rendu | `formatPelletCost` ne lève jamais, FR-4.2 |
| 5 | Documenter un déclencheur `state` nu sur un capteur ou un compteur qui passe par `unavailable` | garde `not_from`/`not_to` + états numériques, FR-9.2, FR-9.5 |

## Test Case Specifications

Les tests vivent dans `tests/cards/stove/sci-fi-stove-pellet-cost.test.ts` (carte, `formatPelletCost`, lectures de fichiers) et `tests/cards/stove/sci-fi-stove-editor.test.ts` (éditeur), mêmes conventions que `sci-fi-stove-wear-counters.test.ts` (`makeMockHass`, `makeMockEntity`, `setLocale`).

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SPC-U-01 | locale `fr` ; `storage_counter: 'counter.pellet_stock'` (état `'68'`, `maximum` 100) et `pellet_cost: 'input_number.pellet_cout_saison'` (état `'26.0'`, `unit_of_measurement` `'€'`) ; `getRelevantEntities()` | FR-1, FR-2, FR-4 | `.quantities` a pour enfants, dans l'ordre, `sf-stack-bar` puis `div.pellet-cost` ; celui-ci contient un `sf-icon` `icon="mdi:cash"` `aria-hidden="true"` puis `div.text` de texte `Coût (26,00 €)` (espace insécable normalisée) ; `getRelevantEntities()` contient `input_number.pellet_cout_saison` |
| TC-SPC-U-02 | `formatPelletCost(26, '€', 'fr')`, `(1234.5, '€', 'en')`, `(0, undefined, 'fr')`, `(-3.456, '€', 'en')`, `(5, '  ', 'en')`, `(-0, '€', 'en')` | FR-4.1 | `26,00 €` ; `1,234.50 €` ; `0,00` ; `-3.46 €` ; `5.00` ; `0.00 €` (espaces normalisées pour le fr) |
| TC-SPC-U-03 | `pellet_cost` configuré : entité absente de `hass` ; puis états `'unavailable'`, `'unknown'`, `''`, `'  '`, `'abc'`, `'NaN'`, `'Infinity'`, `'1e300'`, `'-1e9'` | FR-5 | aucun `div.pellet-cost` dans chaque cas ; `sf-stack-bar` toujours rendu ; `'999999999'` rend la cellule |
| TC-SPC-U-04 | config sans `pellet_cost`, avec `storage_counter` et `sensors.sensor_pellet_quantity` ; `innerHTML` normalisé de `.quantities` comparé à un snapshot enregistré sur le code d'avant ce lot — premier geste du BUILD ; `getRelevantEntities()` | FR-2, FR-3 | égal au snapshot ; aucun `div.pellet-cost` ; `getRelevantEntities()` identique à l'ensemble d'avant (sans id `pellet_cost`) |
| TC-SPC-U-05 | `pellet_cost` configuré, état `'19.5'`, sans `storage_counter` ; puis `hass.locale` absent et `hass.language` `'en'` | FR-4, FR-4.1 | `div.pellet-cost` est le dernier enfant de `.quantities` ; texte `Coût (19,50 €)` ; puis `Coût (19.50 €)` |
| TC-SPC-U-06 | éditeur monté avec `pellet_cost: 'input_number.pellet_cout_saison'` | FR-6 | entrée `input-pellet-cost` juste après `input-storage-counter`, valeur `input_number.pellet_cout_saison`, libellé `Coût des pellets` ; un changement émet `config-changed` avec `pellet_cost` |
| TC-SPC-U-07 | lire `src/cards/stove/styles.ts` | FR-8 | la règle `.quantities` qui porte `column-gap: 20px` contient `flex-wrap: wrap` ; `.quantities .pellet-cost` contient `flex-direction: column` et `min-width: 0` ; `.pellet-cost .text` contient `white-space: nowrap` |
| TC-SPC-U-08 | lire `xliff/fr.xlf` et `src/locales/locales/fr.js` | FR-7 | une unité et une entrée pour `Cost` → `Coût` et pour `Pellet cost` → `Coût des pellets` |
| TC-SPC-U-09 | lire `docs/cards/stove.md`, section `## Pellet cost` | FR-9, FR-9.1, FR-9.2, FR-9.3, FR-9.4 | le fichier contient `pellet_cost` dans l'exemple « Full » et la table Options ; la section contient `input_number.pellet_bag_price`, `input_number.pellet_cost`, `counter.pellet_stock`, `not_from: [unavailable, unknown]`, `trigger.from_state.state \| int > trigger.to_state.state \| int`, `mode: queued`, `price in force`, `manual correction`, `now().month == 10`, `Troubleshooting` |
| TC-SPC-U-10 | lire `docs/cards/stove.md`, section `## Pellet storage counter automation` | FR-9.5 | contient `trigger: numeric_state`, `for: "00:02:00"` et `trigger.from_state.state \| is_number` ; ne contient plus `trigger: state` |
| TC-SPC-U-11 | lire `docs/specs/cards/stove.md` | FR-10 | contient `F-STOVE-D13` et `div.pellet-cost` |
| TC-SPC-U-12 | `formatPelletCost(26, '€', l)` pour `l` ∈ `'fr_FR'`, `''`, `'zz_ZZ'`, `undefined`, `42` ; `formatPelletCost(26, u, 'en')` pour `u` ∈ `42`, `{}`, `['€']`, `null`, `'EUR / sac'` ; carte rendue avec `hass.locale.language` `'fr_FR'` et `unit_of_measurement` `42` | FR-4.2 | aucune exception ; `26.00 €` pour chaque `l` ; `26.00` pour chaque `u` ; la carte rend `div.pellet-cost` de texte `Cost (26.00)` (amendé en BUILD le 2026-11-06 : `SciFiBaseCard.set hass` ne reconnaît que `fr` / `fr-*` et bascule le catalogue sur `en` pour `'fr_FR'` — comportement antérieur au lot, SHOW : le test rendait `Cost (26.00)`) |
| TC-SPC-U-13 | locale `en` ; `pellet_cost` d'état `'26'` et `unit_of_measurement` `'<b>€</b>'` (8 caractères, donc retenue par FR-4.2) | FR-4.3 | `div.pellet-cost` ne contient aucun élément `b` ; `.text` a pour texte `Cost (26.00 <b>€</b>)` en locale `en` |
| IT-SPC-I-01 | élément réel `sci-fi-stove` (`document.createElement`, `document.body`), locale `fr`, `setConfig` avec `storage_counter` et `pellet_cost`, puis `hass` (états `'68'` et `'26'`, `€`) | FR-4, FR-4.1 | dans le shadow DOM, `div.pellet-cost .text` a pour texte `Coût (26,00 €)` ; `sf-icon` présent |
| IT-SPC-I-02 | même élément, `hass` réassigné avec `pellet_cost` à `'32.5'` puis `'unavailable'` | FR-4, FR-5 | texte `Coût (32,50 €)` ; puis plus de `div.pellet-cost`, `sf-stack-bar` toujours là |
| IT-SPC-I-03 | élément réel avec `pellet_cost` configuré et présent ; puis `setConfig` sans `pellet_cost` | FR-3, FR-4 | une `div.pellet-cost` ; puis aucune |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| entité `pellet_cost` absente de `hass.states` (renommée, supprimée) | pas de cellule (FR-5) | les autres jauges ; la doc dit quoi vérifier (FR-9.4) | aucun |
| état `unavailable` / `unknown` / vide / blanc / non numérique / non fini / `≥ 1e9` en valeur absolue | pas de cellule (FR-5) | — | aucun |
| `unit_of_measurement` absent, blanc, non chaîne ou de plus de 8 caractères | montant sans unité (FR-4.2) | — | aucun |
| `hass.locale` absent | `hass.language`, sinon `'en'` (FR-4.1) | — | aucun |
| langue que `Intl.NumberFormat` rejette (`RangeError`) ou non chaîne | format `'en'` (FR-4.2) | — | aucun |
| unité contenant du markup | rendue comme texte (FR-4.3) | — | aucun |

## Builder Calls

- Nom du module `src/cards/stove/pellet-cost.ts` et de sa fonction `formatPelletCost(value: number, unit: unknown, language: unknown): string` (*mine*, gelés) — même découpage que `state-label.ts` et `wear-counters.ts`, helpers purs testés directement.
- La lecture de l'état (FR-5 : `trim`, `Number`, fini, `< 1e9`) vit dans la carte (`_renderPelletCost`), pas dans `formatPelletCost` (*mine*).
- Icône `mdi:cash`, classe `pellet-cost`, libellé `Cost` (*mine*) ; l'utilisateur a demandé « une icône thune et le prix ».
- Plafond d'unité à 8 caractères et de montant à `1e9` (*mine*) : un coût de pellets domestique tient sous 100000 (le `max` du helper documenté) et une unité monétaire tient en 8 caractères (`€`, `EUR`, `CHF`, `euros`).
- TC-SPC-U-04 enregistre son snapshot dans `tests/cards/stove/__snapshots__/sci-fi-stove-pellet-cost.test.ts.snap` sur le code d'avant ce lot, avant toute écriture source (agent's call).
- Les comparaisons de texte remplacent les espaces insécables (` `, ` `) par une espace avant d'asserter (agent's call : le format fr de `Intl` en produit).

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `SciFiStoveConfig` | configs YAML des dashboards Lovelace |
| `FR-4.1` | code — `formatPelletCost` | `SciFiStoveCard._renderPelletCost` |
| `FR-6` | code — `sci-fi-stove-editor.ts`, `labels.ts` | éditeur visuel Lovelace |
| `FR-9` | doc — `docs/cards/stove.md` | l'utilisateur qui copie le YAML dans HA |

## References

- [stove.md](../cards/stove.md) § Test Selectors — Frozen Contract
- [stove-wear-counters spec](../stove-wear-counters/spec.md) (conventions de test)
