---
spec: docs/specs/stove-power-level/spec.md
sources:
  - src/cards/stove/config.ts
  - src/cards/stove/sci-fi-stove.ts
  - src/cards/stove/sci-fi-stove-editor.ts
  - src/cards/stove/labels.ts
  - src/components/sf-wheel.ts
  - src/components/sf-toast.ts
  - src/types/domains.ts
  - docs/specs/cards/stove.md
---

# Stove Power Level — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-ve4.1` (enfant de `ha-sci-fi-ve4`). L'intégration core `fumis` expose le niveau de puissance du poêle comme une entité `number.*_power_level` ; la carte `sci-fi-stove` ne sait aujourd'hui ni le lire ni l'écrire. Ce lot ajoute un champ racine optionnel `number_power_level`, une molette `sf-wheel` dans la barre inférieure qui appelle `<domaine>.set_value`, et l'entrée correspondante dans l'éditeur. Décisions utilisateur du 2026-11-05 (session attended, contraignantes) : champ racine placé comme `switch_eco_mode` (ADR-005 « ask first » : demandé, approuvé) ; contrôle `sf-wheel` dans `.bottom` comme la température ; bornes lues sur `min`/`max`/`step` de l'entité, repli 1/5/1 ; au plus 50 items ; pas fractionnaires pris en charge ; entité `unavailable` ou `unknown` → molette rendue mais désactivée ; poêle à l'arrêt (hvac `off`) → toujours réglable ; domaines `number` et `input_number` acceptés ; le dernier choix gagne, un seul appel après 400 ms sans changement. Le lot `ve4.2` ajoutera `number_fan_speed` sur le même modèle — hors de ce lot.

Critère d'acceptation du bead `ve4` : champ optionnel et déclaré dans `getRelevantEntities` ; une config sans lui rend **exactement** comme avant ; l'éditeur l'expose.

Comportement réel de `sf-wheel` (`src/components/sf-wheel.ts:159-185`, lu le 2026-11-05) : un clic sur une flèche calcule l'item suivant à partir de `selectedId` et émet `wheel-change` avec cet item en `detail` ; le composant ne modifie **jamais** `selectedId` lui-même. Sans retour du parent, la molette reste sur l'ancienne valeur, et le clic suivant repart du même point. Quand aucun item ne correspond à `selectedId`, elle affiche le premier item (`sf-wheel.ts:141-143`). La sélection optimiste est donc portée par la carte (FR-8).

## Requirements

- **FR-1**: `SciFiStoveConfig` (`src/cards/stove/config.ts`) gagne le champ racine optionnel `readonly number_power_level?: string;`, déclaré juste après `switch_eco_mode`. Aucun autre champ n'est modifié (ADR-005).
- **FR-2**: `getRelevantEntities()` de `sci-fi-stove` ajoute `config.number_power_level` à l'ensemble quand il est renseigné, comme `switch_eco_mode`. Absent, l'ensemble est identique à aujourd'hui.
- **FR-3**: quand `config.number_power_level` n'est pas renseigné, le rendu de `.bottom` est identique octet pour octet à celui d'avant ce lot : mêmes enfants, même ordre, aucun `sf-wheel` supplémentaire.
- **FR-4**: quand `config.number_power_level` est renseigné, présent dans `hass.states` **et** d'un domaine accepté (FR-12), `.bottom` rend un second `sf-wheel` portant la classe `power-level`, placé après la molette de température et avant le contrôle éco. Son attribut `text` est `msg('Power')` (fr `Puissance`).
- **FR-5**: **Valeur numérique.** Partout dans ce lot, une valeur brute `raw` est *numérique* si et seulement si (`typeof raw === 'number'`, ou `typeof raw === 'string'` et `raw.trim() !== ''`) **et** `Number.isFinite(Number(raw))`. `null`, `undefined`, `''`, `'  '`, `'3abc'`, `NaN`, `Infinity`, un booléen, un tableau ne sont pas numériques ; `'5'` et `5` le sont. `parseFloat` n'est jamais utilisé.
- **FR-5.1**: **Bornes.** `min`, `max`, `step` sont lus sur `attributes.min`, `attributes.max`, `attributes.step` de l'entité. Chaque borne non numérique (FR-5) prend son repli **indépendamment des autres** : `min` 1, `max` 5, `step` 1. Le trio résultant est ensuite remplacé en entier par 1/5/1 si `step ≤ 0`, si `min > max` (ainsi `{ min: 7 }` seul donne 1/5/1), ou si le nombre d'items `n` (FR-5.2) dépasse 50.
- **FR-5.2**: **Items.** `n = Math.floor((max − min) / step + 1e-9) + 1`. `d` = nombre de décimales du trio : `d = max(dec(min), dec(step))`, où `dec(x)` est le plus petit entier `j` de 0 à 10 tel que `Math.abs(x·10^j − Math.round(x·10^j)) < 1e-9` (10 si aucun). Pour `k = 0 … n−1`, `v_k = Number((min + k·step).toFixed(d))` et l'item est `{ id: String(k), text: v_k.toFixed(d) }`. L'`id` est l'**index entier** du pas, jamais la valeur : `0.1 + 0.2` ne peut plus produire un id `0.30000000000000004`. Exemples : 1/5/1 → ids `'0'…'4'`, textes `'1'…'5'` ; 0/1/0.1 → 11 items, textes `'0.0'…'1.0'`, `v_3 === 0.3`.
- **FR-6**: **Sélection.** Hors sélection en attente (FR-8), `.selectedId` est lié par propriété à `String(k*)` où, l'état `s` étant numérique (FR-5), `k* = Math.round((Number(s) − min) / step)` borné à `[0, n−1]`. `Math.round` arrondit la demie vers le haut (`2.5` au pas 1 depuis 1 → index 2, valeur 3) (agent's call). La correspondance est donc **numérique** : `'3.0'`, `'3'` et `3` sélectionnent le même item. Un état hors bornes ou hors grille sélectionne l'item le plus proche — `7` avec max 5 affiche 5, `0` avec min 1 affiche 1, `2.4` au pas 1 affiche 2 (agent's call : borner l'affichage plutôt que ne rien sélectionner, car `sf-wheel` afficherait alors le premier item, ce qui ment ; HA reste la source de vérité et la valeur réelle n'est jamais réécrite). Un état non numérique donne `selectedId` `null`.
- **FR-7**: **Désactivation.** La molette est rendue avec `disabled` `true` quand l'état de l'entité est `unavailable` ou `unknown` (décision utilisateur 2026-11-05, les deux états), ou n'est pas numérique au sens de FR-5 (agent's call : une valeur illisible ne doit pas offrir de flèches qui partiraient d'un item arbitraire) ; sinon `disabled` est `false`. L'état du `climate` (y compris `hvac` `off`) n'entre pas dans ce calcul : poêle à l'arrêt, la molette reste réglable.
- **FR-8**: **Écriture : le dernier choix gagne.** Un `wheel-change` lit `k = Number(e.detail.id)` ; si `k` n'est pas un entier de `[0, n−1]`, rien ne se passe. Sinon la carte mémorise `k` dans un état réactif `_powerPendingIndex` — la molette affiche aussitôt `selectedId = String(k)` — et (re)lance un minuteur unique de 400 ms ; chaque nouveau `wheel-change` remplace `k` et relance le minuteur. À l'échéance, et seulement si l'entité est encore présente et non désactivée (FR-7), la carte fait **un seul** appel `this.hass.callService(<domaine>, 'set_value', { entity_id: config.number_power_level, value: v_k })`, `v_k` étant recalculé par FR-5.2 sur les bornes courantes, puis **un seul** toast : succès → `sf-toast` `msg('Power level changed')` ; échec → `sf-toast` en erreur portant `err.message` (ou `String(err)` si le rejet n'est pas une `Error`) — motif `then(toast).catch(toast)` des autres contrôles. Sinon (entité disparue ou désactivée à l'échéance), aucun appel et `_powerPendingIndex` repasse à `null`. Après l'appel, la première affectation suivante de `hass` remet `_powerPendingIndex` à `null` : l'état de HA reprend la main, qu'il ait pris la nouvelle valeur ou non. `disconnectedCallback` annule le minuteur sans appel. Automate exact (agent's call) : **repos** (`_powerPendingIndex` `null`) → `wheel-change` valide → **attente** (`_powerCallSent` `false`, minuteur relancé ; un `wheel-change` en **attente** ou en **envoyé** ramène en **attente** et remet `_powerCallSent` à `false`) ; en **attente**, une affectation de `hass` ne change rien sauf si l'entité devient absente, d'un domaine refusé ou désactivée (FR-7, FR-12) : minuteur annulé, retour au **repos** ; à l'échéance, si l'entité est absente, désactivée ou si `k ≥ n` sur les bornes courantes (pas de bornage), retour au **repos** sans appel, sinon `callService` est appelé de façon synchrone et l'état passe à **envoyé** (`_powerCallSent` `true`) ; en **envoyé**, la première affectation de `hass` ramène au **repos**, que la promesse soit réglée ou non, résolue ou rejetée. Le toast suit le règlement de la promesse, indépendamment de l'automate. Le `sf-toast` est obtenu comme pour les autres contrôles, par `this.shadowRoot?.querySelector('sf-toast')` et `addMessage(text, error)` (`src/cards/stove/sci-fi-stove.ts:507-508`). Le domaine passe par `DOMAIN.NUMBER` ou `DOMAIN.INPUT_NUMBER`, jamais par un littéral (garde `tests/types/domain-literals.test.ts`).
- **FR-8.1**: **Message d'erreur affiché comme texte.** Le message passé à `sf-toast.addMessage` est rendu par une liaison de texte Lit (`<div class="toast-body">${message}</div>`, `src/components/sf-toast.ts:125`) ; ce lot n'introduit ni `unsafeHTML` ni `innerHTML` : un message `<b>x</b>` s'affiche littéralement.
- **FR-9**: l'éditeur `sci-fi-stove-editor.ts` rend `this._renderInput('number_power_level', 'entity', 'input-number-power-level', 'mdi:fire', config.number_power_level ?? '')` juste après la ligne `switch_eco_mode`. `labels.ts` mappe `'input-number-power-level'` sur `msg('Power level number')`. L'éditeur n'a pas de sélecteur d'entités filtrable — `sf-editor-input` est un champ texte libre (`src/components/editor-inputs/sf-editor-input.ts`) — le filtre de domaine de la décision utilisateur est donc appliqué par la carte, FR-12 (agent's call : ajouter un sélecteur à l'éditeur sortirait du lot).
- **FR-10**: quatre chaînes source nouvelles — `Power` (fr `Puissance`), `Power level changed` (fr `Puissance modifiée`), `Power level number` (fr `Entité niveau de puissance`), `Power level unavailable` (fr `Puissance indisponible`) — avec leurs unités `xliff/fr.xlf` et `src/locales/locales/fr.js` régénéré (`npm run localize-extract`, `npm run localize-build`).
- **FR-11**: [stove.md](../cards/stove.md) documente ce comportement : ligne Blueprint `F-STOVE-D09`, section « Niveau de puissance — `number_power_level` », ligne de la table des contrôles de la barre inférieure, sélecteur gelé `sf-wheel.power-level`, ligne de l'Error Handling Matrix et anti-pattern 9.
- **FR-12**: **Garde de présence et de domaine.** Le domaine est le préfixe de `config.number_power_level` avant le premier `.`. Aucune molette de puissance n'est rendue, et aucun appel n'est jamais fait, quand l'entité est absente de `hass.states` (même garde que `_renderEcoControl` pour `switch_eco_mode`) ou quand son domaine n'est ni `DOMAIN.NUMBER` ni `DOMAIN.INPUT_NUMBER` (décision utilisateur 2026-11-05). L'appel de FR-8 utilise le domaine de l'entité elle-même : `number.set_value` pour `number.*`, `input_number.set_value` pour `input_number.*`.
- **FR-13**: **Nom accessible.** Le `sf-wheel.power-level` porte toujours l'attribut `aria-label` égal à `msg('Power')` (fr `Puissance`). Quand il est désactivé (FR-7), il porte en plus `title` égal à `msg('Power level unavailable')` (fr `Puissance indisponible`) ; actif, il n'a pas d'attribut `title`. Le comportement clavier est celui de `sf-wheel`, inchangé par ce lot.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Les entités `number.*_power_level` (core fumis) et `input_number.*` exposent `min`, `max`, `step` en attributs (standard des deux plateformes) ; si non, le repli par borne de FR-5.1 s'applique et la molette reste utilisable | Low | SHOW — contrat des entités `number` / `input_number` de HA | TC-SPL-U-1117, TC-SPL-U-1118 |
| 2 | Une entité configurée mais absente de `hass.states` est traitée comme non configurée (pas de molette), comme `switch_eco_mode` (`sci-fi-stove.ts`, garde de `_renderEcoControl`) ; `unavailable` est un état présent, donc rendu désactivé | Medium | TELL — décision 4 de l'utilisateur pour `unavailable` ; choix de l'agent pour « absente » | TC-SPL-U-1120 |
| 3 | `sf-wheel` porte déjà une propriété booléenne `disabled` (`src/components/sf-wheel.ts:104`) | Low | SHOW — code | TC-SPL-U-1119 |
| 4 | L'entité est écrite directement par `config.number_power_level`, sans le repli `attributes.entity_id` du `climate` | Low | SHOW — ce repli concerne l'entité `climate` seule | TC-SPL-U-1121 (mock divergent) |
| 5 | `sf-wheel` ne modifie jamais `selectedId` et calcule l'item suivant à partir de lui (`src/components/sf-wheel.ts:159-185`) | Low | SHOW — code | TC-SPL-U-1130 |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Désactiver la molette quand le poêle est `off` | `disabled` ne dépend que de l'état de l'entité, FR-7 |
| 2 | Écrire `'number'` ou `'input_number'` en littéral dans `callService` | `DOMAIN.NUMBER` / `DOMAIN.INPUT_NUMBER`, FR-8, FR-12 |
| 3 | Utiliser la valeur (`String(v)`) comme `id` d'item, ou comparer l'état par chaîne | `id` = index entier, comparaison numérique, FR-5.2, FR-6 |
| 4 | Rendre une molette (même désactivée) quand le champ n'est pas configuré | rien de nouveau dans `.bottom`, FR-3 |
| 5 | Un `callService` par clic de flèche | un seul appel après 400 ms sans changement, FR-8 |
| 6 | Générer les items sans plafond | au-delà de 50 items, trio 1/5/1, FR-5.1 |
| 7 | Rendre le message d'erreur par `unsafeHTML` | liaison de texte, FR-8.1 |

## Test Case Specifications

Les tests vivent dans `tests/cards/stove/sci-fi-stove-power-level.test.ts` (carte) et `tests/cards/stove/sci-fi-stove-editor.test.ts` (éditeur) et citent ces ids dans leurs titres. `hass` est un mock dont `callService` est un `vi.fn` résolu ou rejeté selon le cas ; les cas d'écriture utilisent `vi.useFakeTimers()` et avancent le temps par `vi.advanceTimersByTimeAsync`. « Toast » = l'espion posé sur `addMessage` du `sf-toast` du shadow DOM, appelé `(texte, error)`. L'identifiant TC-SPL-U-1122 est retiré (doublon de la garde des littéraux, désormais vérifiée par TC-SPL-U-1121 et TC-SPL-U-1128) et n'est pas réutilisé.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SPL-U-1116 | config sans `number_power_level`, `climate` en `heat` ; `innerHTML` de `.bottom` normalisé (commentaires Lit retirés) comparé au snapshot `tests/cards/stove/__snapshots__/sci-fi-stove-power-level.test.ts.snap`, enregistré sur le code d'avant ce lot — premier geste du BUILD, avant toute écriture de source — puis commité avec le test ; normalisation : retrait des commentaires `<!--…-->` et des espaces entre balises (agent's call) ; `getRelevantEntities()` | FR-2, FR-3 | `innerHTML` égal au snapshot ; un seul `sf-wheel` ; `getRelevantEntities()` ne contient aucun id `number.` ni `input_number.` |
| TC-SPL-U-1117 | `number_power_level: 'number.stove_power_level'`, état `'3'`, attributs `{ min: 1, max: 5, step: 1 }` | FR-1, FR-2, FR-4, FR-5.2, FR-6 | `sf-wheel.power-level` présent, après la molette de température, avant le contrôle éco ; ids `['0','1','2','3','4']`, textes `['1','2','3','4','5']` ; `selectedId` `'2'` ; `text` `Power` ; `getRelevantEntities()` contient l'id |
| TC-SPL-U-1118 | état `'3.0'` ; attributs successivement : absents ; `{ min: 2, max: 10, step: 2 }` ; `{ min: 2 }` ; `{ min: '2', max: null, step: '' }` ; `{ max: Infinity, step: NaN }` ; `{ min: '3abc' }` ; `{ min: 5, max: 1, step: 1 }` ; `{ step: 0 }` ; `{ step: -1 }` | FR-5, FR-5.1, FR-6 | textes `1..5`, `selectedId` `'2'` ; puis `['2','4','6','8','10']` ; puis `2..5` ; puis `2..5` ; puis `1..5` ; puis `1..5` ; puis `1..5` ; puis `1..5` ; puis `1..5` |
| TC-SPL-U-1119 | état `'unavailable'`, puis `'unknown'`, puis `''`, puis `'abc'`, puis `'2'` avec `climate` en `off` | FR-7, FR-13 | `disabled` `true` ×4 avec `title` `Power level unavailable`, puis `disabled` `false` sans attribut `title` |
| TC-SPL-U-1120 | `number_power_level` configuré, entité absente de `hass.states` | FR-12 | aucun `sf-wheel.power-level` |
| TC-SPL-U-1121 | 1/5/1, état `'2'`, `climate` dont `attributes.entity_id` vaut `'number.other'` (mock divergent) ; `wheel-change` `detail.id = '3'`, temps avancé de 400 ms, `callService` résolu ; puis même scénario rejeté avec `Error('boom')` ; puis rejeté avec la chaîne `'nope'` ; puis `detail.id` `'x'`, `'-1'`, `'1.5'`, `'5'` ; lire la source `sci-fi-stove.ts` | FR-8, FR-12 | un appel `callService('number', 'set_value', { entity_id: 'number.stove_power_level', value: 4 })` ; toast `('Power level changed', false)` ; toast `('boom', true)` ; toast `('nope', true)` ; aucun appel ni toast pour les quatre ids invalides ; la source contient `DOMAIN.NUMBER` et `DOMAIN.INPUT_NUMBER`, `tests/types/domain-literals.test.ts` vert |
| TC-SPL-U-1123 | éditeur monté avec une config portant `number_power_level` | FR-9 | une entrée `input-number-power-level` rendue juste après `input-switch-eco-mode`, valeur `number.stove_power_level`, libellé `Power level number` ; un changement émet `config-changed` avec `number_power_level` mis à jour |
| TC-SPL-U-1124 | lire `xliff/fr.xlf` et `src/locales/locales/fr.js` | FR-10 | une unité et une entrée pour chacune des quatre chaînes, en `Puissance`, `Puissance modifiée`, `Entité niveau de puissance`, `Puissance indisponible` |
| TC-SPL-U-1125 | lire `docs/specs/cards/stove.md` | FR-11 | contient `F-STOVE-D09`, `number_power_level`, `sf-wheel.power-level`, `input_number` et `set_value` |
| TC-SPL-U-1126 | attributs `{ min: 0, max: 1, step: 0.1 }`, état `'0.3'` ; puis `{ min: 0.5, max: 2, step: 0.25 }`, état `'1.25'` ; `wheel-change` `detail.id = '3'` sur le premier, 400 ms | FR-5.2, FR-6, FR-8 | 11 items, textes `'0.0'…'1.0'`, `selectedId` `'3'` ; puis 7 items, textes `'0.50','0.75','1.00','1.25','1.50','1.75','2.00'`, `selectedId` `'3'` ; appel avec `value` strictement égal (`===`) à `0.3` |
| TC-SPL-U-1127 | molette active puis désactivée | FR-13 | attribut `aria-label` `Power` dans les deux cas |
| TC-SPL-U-1128 | `number_power_level: 'input_number.stove_power'`, 1/5/1, état `'1'`, `wheel-change` `'1'`, 400 ms ; puis `'switch.stove'` présent dans `hass` avec un état `'on'` | FR-4, FR-8, FR-12 | molette rendue, appel `callService('input_number', 'set_value', { entity_id: 'input_number.stove_power', value: 2 })` ; pour `switch.stove` aucun `sf-wheel.power-level` et aucun appel |
| TC-SPL-U-1129 | attributs `{ min: 1, max: 50, step: 1 }` ; `{ min: 1, max: 51, step: 1 }` ; `{ min: 0, max: 1e9, step: 1 }` ; `{ min: 0, max: 1, step: 1e-6 }` | FR-5.1 | 50 items ; puis textes `1..5` (5 items) ; puis `1..5` ; puis `1..5` ; rendu en moins de 100 ms dans chaque cas |
| TC-SPL-U-1130 | 1/5/1, état `'1'` ; `wheel-change` `'1'` à t=0, `'2'` à t=100 ms, `'3'` à t=200 ms ; avancer à t=599 ms, puis t=600 ms ; puis réaffecter `hass` avec l'état `'4'` ; puis rejouer un `wheel-change` `'2'` et réaffecter `hass` avec l'état `'1'` avant 400 ms | FR-8 | `selectedId` `'3'` dès t=200 ms ; aucun appel à t=599 ms ; exactement un appel, `value: 4`, et un seul toast à t=600 ms ; après la réaffectation, `selectedId` `'3'` (état `'4'`, `_powerPendingIndex` `null`) ; dans le dernier cas `selectedId` reste `'2'` jusqu'à l'appel (une affectation de `hass` avant l'appel ne libère pas la sélection en attente) |
| TC-SPL-U-1131 | 1/5/1, état `'7'`, puis `'0'`, puis `'2.4'`, puis `3` (nombre) | FR-6 | `selectedId` `'4'`, puis `'0'`, puis `'1'`, puis `'2'` ; `disabled` `false` dans les quatre cas |
| TC-SPL-U-1132 | `callService` rejeté avec `Error('<b>x</b>')`, 400 ms | FR-8.1 | toast `('<b>x</b>', true)` ; dans le `sf-toast` réel, `.toast-body` a pour `textContent` `<b>x</b>` et ne contient aucun élément `b` |
| TC-SPL-U-1133 | `wheel-change` `'3'` puis retrait de la carte du DOM avant 400 ms ; autre carte : `wheel-change` `'3'` puis `hass` réaffecté avec l'entité `unavailable` avant 400 ms | FR-8 | aucun appel dans les deux cas, même après 1000 ms ; dans le second, `selectedId` revient à `null` et `disabled` `true` |
| IT-SPL-I-1104 | élément réel `sci-fi-stove` créé par `document.createElement`, ajouté à `document.body`, `setConfig` puis `hass` (climate `off`, `number.stove_power_level` à `'2'`, `{ min: 1, max: 5, step: 1 }`) ; `wheel-change` `detail.id = '4'` émis sur `sf-wheel.power-level` du shadow DOM, 400 ms | FR-4, FR-7, FR-8 | molette non désactivée ; un appel `number` / `set_value` avec `value: 5` ; le `.toast-body` du `sf-toast` réel a pour texte `Power level changed` et n'est pas en variante erreur |
| IT-SPL-I-1105 | même élément réel, `hass` réassigné avec l'entité passée à `unavailable` | FR-7, FR-13 | `sf-wheel.power-level` toujours présent, `disabled` `true`, `title` `Power level unavailable` |
| IT-SPL-I-1106 | élément réel `sci-fi-stove` monté comme IT-SPL-I-1104 mais avec une config **sans** `number_power_level`, puis la même config avec le champ pointant une entité absente de `hass` | FR-3, FR-12 | dans les deux cas un seul `sf-wheel` dans `.bottom` du shadow DOM, aucun `sf-wheel.power-level` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| `set_value` rejeté | un `sf-toast` en erreur, message du service rendu comme texte | sélection en attente libérée à la prochaine affectation de `hass` : l'état de HA s'affiche | aucun |
| entité `unavailable` / `unknown` / état non numérique | molette rendue désactivée, `title` `Power level unavailable` | — | aucun |
| entité configurée absente de `hass`, ou d'un domaine autre que `number` / `input_number` | pas de molette, aucun appel | — | aucun |
| borne absente ou non numérique | la borne prend son repli | 1 / 5 / 1 | aucun |
| trio incohérent ou plus de 50 items | items calculés sur le trio de repli | 1/5/1 | aucun |
| état numérique hors bornes ou hors grille | l'item le plus proche est affiché | — | aucun |
| `wheel-change` d'id invalide | ignoré | — | aucun |
| entité devenue indisponible ou carte retirée pendant les 400 ms | aucun appel | — | aucun |

## Builder Calls

- Classe `power-level` sur le `sf-wheel` (*mine*) : seule façon de distinguer les deux molettes sans dépendre de l'ordre.
- Méthodes `_renderPowerLevel(): TemplateResult | typeof nothing`, `_powerLevelItems(attrs)` et `_onPowerLevelChange(e)` (*mine*) ; le minuteur est un champ privé `_powerTimer: ReturnType<typeof setTimeout> | undefined`, et un drapeau `_powerCallSent` distingue « en attente du minuteur » de « appel parti, attendre `hass` » (agent's call).
- Icône éditeur `mdi:fire` (*mine*).
- Libellés d'items sans unité : le niveau de puissance n'a pas d'unité (agent's call).
- Délai de 400 ms en constante nommée `POWER_DEBOUNCE_MS` (agent's call ; la valeur est la décision utilisateur).
- Plafond de 50 items en constante nommée `POWER_MAX_ITEMS` (décision utilisateur).

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `SciFiStoveConfig` | configs YAML des dashboards Lovelace |
| `FR-4` | code — `SciFiStoveCard._renderBottom` | dashboards via `sci-fi-stove` |
| `FR-8` | code — `_onPowerLevelChange` | intégration core `fumis` via `number.set_value`, helpers `input_number` |
| `FR-9` | code — `sci-fi-stove-editor.ts`, `labels.ts` | éditeur visuel Lovelace |
| `FR-11` | docs — `stove.md` | lecteurs de la spec de carte |

## References

- [stove.md](../cards/stove.md)
