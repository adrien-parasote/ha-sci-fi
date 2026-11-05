---
spec: docs/specs/stove-fan-speed/spec.md
sources:
  - src/cards/stove/config.ts
  - src/cards/stove/sci-fi-stove.ts
  - src/cards/stove/sci-fi-stove-editor.ts
  - src/cards/stove/labels.ts
  - src/components/sf-wheel.ts
  - docs/specs/stove-power-level/spec.md
  - docs/specs/cards/stove.md
---

# Stove Fan Speed — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-ve4.2` (enfant de `ha-sci-fi-ve4`), jumeau du lot livré `stove-power-level` (`ve4.1`). L'intégration core `fumis` expose la vitesse de ventilation comme une entité `number.*_fan_speed` (0 à 5, **désactivée par défaut** côté HA : tant que l'utilisateur ne l'active pas, elle est absente de `hass.states`). Ce lot ajoute le champ racine optionnel `number_fan_speed`, une seconde molette `sf-wheel.fan-speed` dans `.bottom`, et l'entrée éditeur.

Décisions utilisateur du 2026-11-05 (session attended, contraignantes) : règles **identiques** à `ve4.1` — chaque règle de [la spec du lot puissance](../stove-power-level/spec.md) § Requirements (FR-5 à FR-8.1, FR-12, FR-13) et chaque constat résolu de sa revue s'appliquent ici tels quels, seul le trio de repli change : **0/5/1** ; champ racine `number_fan_speed` ; molette placée juste **après** la molette de puissance (ordre HVAC, température, puissance, ventilation, éco) ; la valeur 0 s'affiche « 0 » ; libellé « Ventilation » (`msg('Fan')` — aucune clé `Fan` n'existe dans `xliff/fr.xlf` ; la clé existante `Fan speed` se traduit « Vitesse du ventilateur », pas « Ventilation », elle n'est donc pas réutilisée).

**Mécanisme partagé, pas dupliqué.** La molette de puissance est aujourd'hui codée en dur pour un seul champ (`powerGrid`, `POWER_FALLBACK`, `_powerPendingIndex`, `_powerTimer`, `_renderPowerLevel`, `_onPowerLevelChange`, `_sendPowerLevel`, `_releasePowerPick` dans `src/cards/stove/sci-fi-stove.ts`, SHOW — `grep -n power src/cards/stove/sci-fi-stove.ts`, lu le 2026-11-05). Ce lot la généralise en un mécanisme paramétré par un descripteur, que les deux molettes utilisent ; `/refactor-clean` refuse les spans dupliqués, et deux copies dériveraient.

## Requirements

- **FR-1**: `SciFiStoveConfig` (`src/cards/stove/config.ts`) gagne `readonly number_fan_speed?: string;`, déclaré juste après `number_power_level`. Aucun autre champ n'est modifié (ADR-005).
- **FR-2**: `getRelevantEntities()` ajoute `config.number_fan_speed` quand il est renseigné, comme `number_power_level`. Absent, l'ensemble est identique à aujourd'hui.
- **FR-3**: sans `config.number_fan_speed`, le rendu de `.bottom` est identique à celui d'avant ce lot, avec ou sans `number_power_level` : aucun `sf-wheel.fan-speed`, la molette de puissance inchangée.
- **FR-4**: avec `config.number_fan_speed` présent dans `hass.states` et d'un domaine `DOMAIN.NUMBER` ou `DOMAIN.INPUT_NUMBER`, `.bottom` rend un `sf-wheel` de classe `fan-speed`, placé après `sf-wheel.power-level` quand celle-ci est rendue (sinon après la molette de température) et avant le contrôle éco. Son `text` et son `aria-label` sont `msg('Fan')` (fr `Ventilation`) ; désactivée, elle porte `title` `msg('Fan speed unavailable')` (fr `Ventilation indisponible`), active elle n'a pas de `title`. Les items sont les nombres seuls, sans unité ; le nom accessible est celui de FR-13 de stove-power-level (`aria-label` toujours posé, actif comme désactivé), l'annonce de l'item courant est celle de `sf-wheel`, inchangée (F-12).
- **FR-4.1**: **Barre inférieure à cinq contrôles.** La règle `.bottom` de `src/cards/stove/styles.ts` porte `flex-wrap: wrap` : sur une carte étroite, les contrôles (HVAC, température, puissance, ventilation, éco) passent à la ligne plutôt que de rétrécir ; aucune largeur ni `flex-shrink` n'est modifiée sur les contrôles existants (décision utilisateur 2026-11-05, F-02).
- **FR-4.2**: **Entité partagée refusée.** Si `config.number_fan_speed` est égal à `config.number_power_level` (même chaîne), aucune `sf-wheel.fan-speed` n'est rendue et aucun appel de ventilation n'est possible ; seule la molette de puissance est rendue (décision utilisateur 2026-11-05, F-05). Le domaine du service reste tiré du préfixe de l'id d'entité configuré, borné à `DOMAIN.NUMBER` / `DOMAIN.INPUT_NUMBER` (FR-12 de stove-power-level).
- **FR-5**: **Règles de la molette.** Valeur numérique, bornes avec repli par borne, plafond de 50 items, ids à index entier et textes `toFixed(d)`, sélection numérique bornée, désactivation sur état non numérique (dont `unavailable` / `unknown`, jamais sur l'état du `climate`), garde de présence et de domaine, `set_value` du domaine de l'entité, dernier choix gagnant après 400 ms, sélection optimiste portée par la carte et automate repos / attente / envoyé, toast de succès ou d'erreur (`err.message`, sinon `String(err)`) rendu comme texte : exactement FR-5, FR-5.1, FR-5.2, FR-6, FR-7, FR-8, FR-8.1, FR-12, FR-13 de [stove-power-level](../stove-power-level/spec.md), lues avec `number_fan_speed` à la place de `number_power_level` et le trio de repli **0/5/1** à la place de 1/5/1. Ainsi `{ min: 7 }` seul donne 7 > 5 → trio 0/5/1 ; attributs absents → 6 items, ids `'0'…'5'`, textes `'0'…'5'`.
- **FR-6**: **Mécanisme partagé.** `src/cards/stove/sci-fi-stove.ts` porte **un seul** jeu de fonctions et de méthodes pour les deux molettes, paramétré par un descripteur `NumberWheelSpec` dont les champs sont : la clé de molette, le champ de config lu (donc l'entité), la classe CSS, le trio de repli, le libellé, le message de succès, le message d'indisponibilité. Tout ce qui lit l'entité, ses domaines, son état désactivé ou sa valeur est générique et prend le descripteur ou la grille en paramètre : la lecture de l'entité, la liste des domaines acceptés (`DOMAIN.NUMBER`, `DOMAIN.INPUT_NUMBER`, une seule liste pour les deux), le test de désactivation, le calcul de la valeur d'un item, la grille (`numberGrid(attrs, fallback)`) — aucune de ces fonctions n'existe en double pour la ventilation. Les noms privés sont le choix du builder, sauf `NumberWheelSpec` et `numberGrid` (agent's call : seuls ces deux noms sont gelés, F-08). La sélection en attente (index et drapeau « appel envoyé ») est un état réactif par molette, indexé par la clé du descripteur et réaffecté en entier à chaque changement (`@state`) ; les minuteurs vivent dans un champ privé **non réactif**, indexé par la même clé (un minuteur n'est jamais rendu). Délai 400 ms et plafond 50 items, une seule constante chacun. Aucun corps de méthode n'est copié pour la ventilation ; toute la suite `tests/cards/stove/sci-fi-stove-power-level.test.ts` reste verte sans modification de ses assertions.
- **FR-7**: **Indépendance.** Les deux molettes ont chacune leur sélection en attente et leur minuteur : un choix sur l'une ne relance, n'annule ni ne libère l'autre ; à l'échéance chacune fait son propre appel `set_value` sur sa propre entité et son propre toast. **La libération est par molette** : à chaque affectation de `hass`, chaque molette applique l'automate de FR-8 de stove-power-level à **sa seule** sélection, selon **sa seule** entité — une molette en **envoyé** revient au repos, une molette en **attente** dont l'entité reste présente, acceptée et active garde son choix et son minuteur, même si l'autre molette est libérée ou si l'entité de l'autre disparaît (F-01). `disconnectedCallback` annule les deux minuteurs sans appel et remet les deux sélections au repos.
- **FR-7.1**: **Risque pris — choix silencieusement abandonné.** Si l'entité de la ventilation devient indisponible, absente ou refusée pendant les 400 ms d'attente, le choix est abandonné sans appel ni toast ; la molette s'affiche déjà grisée (FR-4), aucun autre signal n'est donné. Limite acceptée par l'utilisateur le 2026-11-05 (F-07), identique à la puissance.
- **FR-8**: le toast de succès de la ventilation est `msg('Fan speed changed')` (fr `Ventilation modifiée`).
- **FR-8.1**: **Risque pris — texte du toast brut.** Le toast d'erreur rend `err.message` (sinon `String(err)`) comme texte, sans troncature ni plafond de longueur ; l'encodage reste celui de `sf-toast` (texte, jamais HTML). Limite acceptée par l'utilisateur le 2026-11-05 (F-11), identique à la puissance.
- **FR-9**: l'éditeur rend `this._renderInput('number_fan_speed', 'entity', 'input-number-fan-speed', 'mdi:fan', config.number_fan_speed ?? '')` juste après la ligne `number_power_level` ; `labels.ts` mappe `'input-number-fan-speed'` sur `msg('Fan speed number')` (fr `Entité vitesse de ventilation`).
- **FR-10**: quatre chaînes source nouvelles — `Fan` (`Ventilation`), `Fan speed changed` (`Ventilation modifiée`), `Fan speed number` (`Entité vitesse de ventilation`), `Fan speed unavailable` (`Ventilation indisponible`) — avec leurs unités `xliff/fr.xlf` et `src/locales/locales/fr.js` régénéré (`npm run localize-extract`, `npm run localize-build`).
- **FR-11**: [stove.md](../cards/stove.md) documente ce comportement : ligne Blueprint `F-STOVE-D10`, section « Vitesse de ventilation — `number_fan_speed` », ligne de la table des contrôles, sélecteur gelé `sf-wheel.fan-speed`, ligne de l'Error Handling Matrix, et l'étape « activer l'entité vitesse de ventilation dans Home Assistant (désactivée par défaut) » ; sans elle la molette est absente. Aucun texte d'aide dans l'éditeur (décision utilisateur 2026-11-05, F-06).

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | `number.*_fan_speed` (core fumis) expose `min` 0, `max` 5, `step` 1 ; sinon le repli 0/5/1 par borne s'applique | Low | TELL — énoncé utilisateur 2026-11-05 (0-5) ; contrat standard des entités `number` | TC-SFS-U-1102 |
| 2 | L'entité désactivée par défaut côté HA est absente de `hass.states` : la carte ne rend alors pas de molette (garde de présence) | Low | SHOW — une entité désactivée du registre n'a pas d'état ; garde FR-12 de ve4.1 | TC-SFS-U-1103 |
| 3 | Le refactor de FR-6 ne change aucun comportement de la molette de puissance | Medium | SHOW — la suite power-level existante, inchangée | TC-SFS-U-1107 |

## Anti-patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Copier `_renderPowerLevel` / `_onPowerLevelChange` en `_renderFanSpeed` / `_onFanSpeedChange` | un seul mécanisme paramétré par `NumberWheelSpec`, FR-6 |
| 2 | Un minuteur ou une sélection en attente partagés entre les deux molettes | état par molette, FR-7 |
| 3 | Reprendre le repli 1/5/1 pour la ventilation | trio 0/5/1, FR-5 |
| 4 | Réutiliser la clé `Fan speed` pour le libellé | `msg('Fan')`, fr `Ventilation`, FR-4 |

## Test Case Specifications

Les tests vivent dans `tests/cards/stove/sci-fi-stove-fan-speed.test.ts` (carte) et `tests/cards/stove/sci-fi-stove-editor.test.ts` (éditeur), mêmes conventions que la spec puissance (mock `hass`, `callService` en `vi.fn`, `vi.useFakeTimers()`, espion sur `addMessage` du `sf-toast`). Les cas limites des règles partagées (FR-5) sont prouvés par la suite power-level sur le même code (TC-SFS-U-1107) ; ce lot ne prouve ici que ce qui diffère : repli, placement, libellés, indépendance.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SFS-U-1101 | config sans `number_fan_speed`, d'abord sans puis avec `number_power_level` (1/5/1, état `'2'`) ; `innerHTML` normalisé de `.bottom` comparé à un snapshot enregistré sur le code d'avant ce lot — premier geste du BUILD ; `getRelevantEntities()` | FR-2, FR-3 | égal au snapshot dans les deux cas ; aucun `sf-wheel.fan-speed` ; `getRelevantEntities()` sans id `*_fan_speed` |
| TC-SFS-U-1102 | `number_fan_speed: 'number.stove_fan_speed'`, état `'0'`, attributs absents ; puis `{ min: 0, max: 5, step: 1 }` état `'3'` ; puis `{ min: 7 }` ; puis `{ max: 'x' }` | FR-1, FR-2, FR-5 | 6 items, ids `'0'…'5'`, textes `'0'…'5'`, `selectedId` `'0'`, `disabled` `false` ; puis `selectedId` `'3'` ; puis textes `0..5` ; puis textes `0..5` ; `getRelevantEntities()` contient l'id |
| TC-SFS-U-1103 | `number_power_level` et `number_fan_speed` tous deux présents ; puis puissance absente de `hass` ; puis ventilation absente de `hass` ; puis ventilation `'switch.fan'` présent | FR-4, FR-5 | ordre des enfants de `.bottom` : HVAC, température, `power-level`, `fan-speed`, éco ; puis `fan-speed` juste après la température ; puis aucun `sf-wheel.fan-speed` ; puis aucun `sf-wheel.fan-speed` |
| TC-SFS-U-1104 | ventilation état `'2'` puis `'unavailable'` | FR-4, FR-10 | `text` et `aria-label` `Fan`, sans `title` ; puis `disabled` `true`, `title` `Fan speed unavailable`, `aria-label` `Fan` |
| TC-SFS-U-1105 | ventilation 0/5/1 état `'1'` ; `wheel-change` `'0'`, 400 ms, `callService` résolu ; puis rejeté avec `Error('boom')` ; puis `input_number.stove_fan` | FR-5, FR-8 | appel `callService('number', 'set_value', { entity_id: 'number.stove_fan_speed', value: 0 })`, toast `('Fan speed changed', false)` ; toast `('boom', true)` ; appel sur `input_number` / `set_value` |
| TC-SFS-U-1106 | puissance et ventilation présentes ; `wheel-change` `'3'` sur puissance à t=0, `'1'` sur ventilation à t=300 ms ; avancer à t=400 ms puis t=700 ms ; second scénario : `wheel-change` sur les deux puis retrait de la carte avant 400 ms | FR-7 | à t=400 ms un seul appel (puissance, `value: 4`), `selectedId` ventilation `'1'` toujours en attente ; à t=700 ms un second appel (ventilation, `value: 1`) ; deux toasts distincts ; second scénario : aucun appel après 1000 ms ; reconnectée avec le même `hass`, `selectedId` puissance et ventilation égaux aux états de HA (aucune attente restante) |
| TC-SFS-U-1107 | lancer `tests/cards/stove/sci-fi-stove-power-level.test.ts` inchangé ; lire la source `sci-fi-stove.ts` | FR-6 | suite verte ; la source contient `NumberWheelSpec` et `numberGrid`, et ne contient pas `powerGrid` |
| TC-SFS-U-1110 | lire `src/cards/stove/styles.ts` | FR-4.1 | le bloc de la règle `.bottom {` contient `flex-wrap: wrap` |
| TC-SFS-U-1111 | `number_power_level` et `number_fan_speed` tous deux `'number.stove_power'`, présent, état `'2'` ; `wheel-change` `'3'` sur `sf-wheel.power-level`, 400 ms | FR-4.2 | aucun `sf-wheel.fan-speed`, un `sf-wheel.power-level` ; un seul appel `callService`, celui de la puissance |
| TC-SFS-U-1112 | puissance et ventilation présentes ; `wheel-change` `'1'` sur ventilation à t=0, avance à 400 ms (ventilation **envoyé**) ; `wheel-change` `'3'` sur puissance à t=450 ms ; `hass` réaffecté à t=500 ms (mêmes états) ; puis `hass` réaffecté à t=600 ms sans l'entité ventilation ; avance à t=850 ms | FR-7 | après t=500 ms : `selectedId` ventilation égal à l'état HA, `selectedId` puissance `'3'` toujours en attente ; après t=600 ms : plus de `sf-wheel.fan-speed`, puissance toujours `'3'` ; à t=850 ms un appel puissance `value: 4`, aucun second appel ventilation |
| TC-SFS-U-1113 | ventilation présente : attributs `{ min: 'NaN', max: 5 }`, `{ max: 'Infinity' }`, `{ min: -2, max: 2, step: 1 }`, `{ step: 0 }`, `{ step: -1 }` ; puis 0/5/1 états `'9'`, `'-3'`, `'abc'` ; puis `set_value` rejeté par `Error('<b>x</b>')` | FR-5, FR-8.1 | textes `0..5`, `0..5`, `-2..2`, `0..5`, `0..5` ; `selectedId` `'5'`, `'0'`, `null` (`disabled` `true` sur `'abc'`) ; toast `('<b>x</b>', true)`, texte du `.toast-body` égal à `<b>x</b>` et aucun élément `b` créé |
| TC-SFS-U-1114 | ventilation 0/5/1 état `'2'` ; `wheel-change` `'99'`, puis `'abc'`, puis `'-1'` ; avance 1000 ms | FR-5 | aucun `callService` ; `selectedId` reste `'2'` |
| TC-SFS-U-1115 | ventilation 0/5/1 état `'2'` ; `wheel-change` `'4'` ; à t=200 ms `hass` réaffecté avec la ventilation `unavailable` ; avance 1000 ms | FR-7.1 | aucun `callService`, aucun toast ; molette `disabled` `true` |
| TC-SFS-U-1108 | éditeur monté avec `number_fan_speed` | FR-9 | entrée `input-number-fan-speed` juste après `input-number-power-level`, valeur `number.stove_fan_speed`, libellé `Fan speed number` ; un changement émet `config-changed` avec `number_fan_speed` |
| TC-SFS-U-1109 | lire `xliff/fr.xlf`, `src/locales/locales/fr.js`, `docs/specs/cards/stove.md` | FR-10, FR-11 | une unité et une entrée pour `Fan`, `Fan speed changed`, `Fan speed number`, `Fan speed unavailable` en `Ventilation`, `Ventilation modifiée`, `Entité vitesse de ventilation`, `Ventilation indisponible` ; `stove.md` contient `F-STOVE-D10`, `number_fan_speed`, `sf-wheel.fan-speed` et `Activer l'entité vitesse de ventilation dans Home Assistant` |
| IT-SFS-I-1101 | élément réel `sci-fi-stove` (`document.createElement`, `document.body`), `setConfig` puis `hass` (climate `off`, `number.stove_fan_speed` à `'2'`, 0/5/1) ; `wheel-change` `'4'` sur `sf-wheel.fan-speed` du shadow DOM, 400 ms | FR-4, FR-5, FR-8 | molette active ; un appel `number` / `set_value` `value: 4` ; `.toast-body` du `sf-toast` réel a pour texte `Fan speed changed` |
| IT-SFS-I-1102 | même élément, `hass` réassigné avec la ventilation `unavailable` | FR-4, FR-5 | `sf-wheel.fan-speed` présent, `disabled` `true`, `title` `Fan speed unavailable` |
| IT-SFS-I-1103 | élément réel avec puissance et ventilation configurées et présentes ; puis config sans `number_fan_speed` | FR-3, FR-4 | deux `sf-wheel` de nombre, ventilation après puissance ; puis seul `sf-wheel.power-level`, aucun `sf-wheel.fan-speed` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| `set_value` de la ventilation rejeté | `sf-toast` en erreur, message du service rendu comme texte, sans plafond (FR-8.1) | la sélection de la ventilation seule est libérée à la prochaine affectation de `hass`, que la promesse soit réglée ou non ; l'état affiché redevient celui de HA (FR-8 de stove-power-level, FR-7) | aucun |
| entité devenue indisponible ou absente pendant l'attente | choix abandonné sans appel ni toast (FR-7.1) | molette grisée ou absente | aucun |
| `number_fan_speed` égal à `number_power_level` | pas de molette de ventilation (FR-4.2) | molette de puissance seule | aucun |
| ventilation `unavailable` / `unknown` / non numérique | molette rendue désactivée, `title` `Fan speed unavailable` | — | aucun |
| entité absente de `hass` (désactivée côté HA) ou d'un domaine refusé | pas de molette, aucun appel | — | aucun |
| borne absente ou non numérique, trio incohérent ou plus de 50 items | repli | 0 / 5 / 1 | aucun |
| un choix en attente sur l'autre molette | aucune interaction, FR-7 | — | aucun |

## Builder Calls

- Classe `fan-speed`, icône éditeur `mdi:fan` (*mine*).
- La sélection en attente par molette est un objet réactif réaffecté en entier à chaque changement (`@state`), pour que Lit voie la mise à jour ; les minuteurs sont dans un champ privé non réactif (agent's call, FR-6).
- Libellés d'items sans unité (agent's call).
- Le test power-level lit `(el as any)._powerPendingIndex` (`tests/cards/stove/sci-fi-stove-power-level.test.ts:298`) : la carte garde un getter privé en lecture seule `_powerPendingIndex` qui renvoie l'index en attente de la molette de puissance depuis l'état partagé, pour que FR-6 « assertions inchangées » tienne ; aucun autre alias (agent's call, builder check).
- TC-SFS-U-1101 enregistre son propre snapshot dans `tests/cards/stove/__snapshots__/sci-fi-stove-fan-speed.test.ts.snap`, sur le code d'avant ce lot, avant toute écriture source, et le garde inchangé après le refactor FR-6 (agent's call, builder check).
- FR-4.2 compare les deux champs par égalité stricte de chaînes, sans trim ni casse, et seulement quand les deux sont renseignés et non vides ; la molette de puissance garde ses propres gardes de présence et de domaine (agent's call, builder check).
- `flex-wrap: wrap` (FR-4.1) s'applique à `.bottom` pour toutes les configs ; FR-3 ne gèle que le HTML rendu, aucun snapshot de feuille de style n'existe à préserver (agent's call, builder check).
- La section § Vitesse de ventilation de `docs/specs/cards/stove.md` est déjà écrite au SPEC ; le BUILD ne fait que la vérifier (TC-SFS-U-1109).

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `SciFiStoveConfig` | configs YAML des dashboards Lovelace |
| `FR-5` | code — `NumberWheelSpec` de la ventilation (trio 0/5/1) | `_renderNumberWheel` |
| `FR-6` | code — `_renderNumberWheel`, `_onNumberWheelChange` | `SciFiStoveCard._renderBottom` |
| `FR-9` | code — `sci-fi-stove-editor.ts`, `labels.ts` | éditeur visuel Lovelace |

## References

- [stove-power-level spec](../stove-power-level/spec.md) § Requirements
- [stove.md](../cards/stove.md) § Vitesse de ventilation — `number_fan_speed`
