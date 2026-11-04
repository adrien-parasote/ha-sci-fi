# Spec 02 — Domain Selectors & Types

> Document Type: Implementation
> Covers: Step 2 from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here | Covers |
|---|---|---|---|
| F-DOM-01 | HomeAssistantExt types | ✅ `src/types/ha.ts` | ⬜ aucun cas de test — déclarations de types, vérifiées par TC-103 de [spec 01](./01_infrastructure.md#blueprint-coverage) |
| F-DOM-02 | Configuration validation schemas | ✅ `src/types/config.ts` — kernel only since ADR-017 (`SciFiBaseConfig`, `ActionConfig`, `assertString`, `assertDefined`, `isValidCardType`). Per-card config interfaces live in `src/cards/<card>/config.ts`. | tests/selectors/entity.selectors.test.ts :: TC-207 |
| F-DOM-03 | Immutability on all domain structures | ✅ `src/types/ha.ts` | tests/selectors/house.test.ts :: IT-201 |
| F-DOM-04 | Immutability mapping helpers | ✅ `src/selectors/house.ts` | tests/selectors/house.test.ts :: TC-201, TC-202, TC-205, TC-208, IT-203 |
| F-DOM-05 | Immutability collection selectors | ✅ `src/selectors/climate.ts` | tests/selectors/entity.selectors.test.ts :: TC-204 |
| F-DOM-06 | Immutability filter selectors | ✅ `src/selectors/light.ts` | tests/selectors/house.test.ts :: TC-203 · tests/selectors/entity.selectors.test.ts :: TC-206, IT-202 |
| F-DOM-07 | Mocking hass extensions | ✅ `tests/fixtures/mock-hass.ts` | ⬜ aucun cas de test — fixture, moyen de TC-201 à IT-203 et non leur objet |

---

## File Tree

```
src/
├── types/
│   ├── ha.ts                       [NEW] Home Assistant custom types
│   └── config.ts                   [NEW] Config KERNEL only — SciFiBaseConfig,
│                                         ActionConfig, assert*/isValidCardType.
│                                         Per-card interfaces: cards/<card>/config.ts
│                                         (ADR-017)
├── selectors/
│   ├── house.ts                    [NEW] Immutable area/floor selectors
│   ├── climate.ts                  [NEW] Climate state selector functions
│   └── light.ts                    [NEW] Light domain selector functions
└── tests/fixtures/mock-hass.ts     [NEW] Mock HomeAssistant environment
```

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | HA state object properties are immutable at runtime | Low | → Run console query hass.states to verify read-only nature |
| 2 | Area and Floor registries are populated in HASS ext | Medium | → Run console check hass.areas and hass.floors structures |
| 3 | Read-only selectors are memory efficient and fast | Medium | → Run performance benchmark test in Chromium browser |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `src/types/ha.ts` | Spec 03-06 | Home Assistant Extended type definitions |
| `src/types/config.ts` | Spec 05, 06 | Config kernel — base config shape, action config, type-guards (ADR-017) |
| `cards/<card>/config.ts` | Spec 05, 10 | Per-card YAML Config structures, owned by the card |
| `selectors/*.ts` | Spec 05 | Functional immutable domain state queries |
| `tests/fixtures/mock-hass.ts` | Spec 03, 05, 06 | Mocked HASS extension fixture |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `tsconfig.json` | Spec 01 | TS rules enforcing strict nulls |

 ### Public Interface

> `selectHouseState()` is REMOVED — ADR-004 explicitly deletes the House model.
> Use direct selector functions instead.

La colonne « Consommé par » nomme les **cartes** qui importent la fonction, et
rien d'autre : pas « les cartes », pas « toutes les cartes », pas un étage de
l'arbre. `socle-contract.test.ts` dérive cette colonne de `src/` et refuse toute
cellule qui ne l'égale pas — voir § Pourquoi cette colonne est mesurée.

| Element | Consommé par | Description |
|---|---|---|
| `getFloors(hass)` | climates, lights, water | `readonly HassFloor[]` du registre d'étages, trié |
| `getFloorById(hass, floorId)` | climates | Un étage, `HassFloor \| undefined` |
| `getAreasByFloor(hass, floorId)` | climates, lights, water | `readonly HassArea[]` d'un étage |
| `getEntitiesByArea(hass, areaId)` | ⬜ aucun appelant | `readonly HassEntityEntry[]` d'un espace |
| `getLightEntities(hass, areaId)` | lights | Filtre les entités `light.*` d'un espace |
| `getClimateEntities(hass)` | ⬜ aucun appelant | Toutes les entités `climate.*` |
| `countActiveLights(hass, areaId)` | ⬜ aucun appelant | Nombre de lumières `'on'` dans un espace |
| `getAreas(hass)` | climates | Tous les espaces du registre, `readonly HassArea[]` |
| `getAreaById(hass, areaId)` | climates, lights | Un espace, `HassArea \| undefined` |
| `getEntitiesByAreaAndDomain(hass, areaId, domain)` | climates, lights | Filtre par espace **et** domaine ; la primitive sur laquelle `getLightEntities` est bâti |
| `hasActiveLights(hass, areaId)` | lights | Vrai si l'espace a au moins une lumière `'on'` |
| `getClimateEntitiesExcluding(hass, excluded)` | climates | Tous les `climate.*` hors une liste d'`entity_id` |
| `isClimateOn(hass, entityId)` | climates | Vrai si l'entité existe et que son état n'est ni `'off'`, ni `'unavailable'`, ni `'unknown'` — cf. § `isClimateOn` |

### Pourquoi cette colonne est mesurée

La table ne portait que sept des seize exports jusqu'au 2026-11-01. Les neuf
ajoutés ce jour-là l'ont d'abord été avec des consommateurs **plausibles plutôt
que mesurés** — la revue en a relevé trois faux, et la mesure qui a suivi en a
trouvé trois autres parmi les **sept lignes d'origine** (`getEntitiesByArea`
« All cards », `getClimateEntities` « Climates card », `countActiveLights`
« Lights card accordion » : zéro appelant chacune).

C'est pourquoi la colonne n'est plus de la prose. Une attribution plausible est
indistinguable d'une attribution vraie à la lecture, et c'est exactement le
défaut que ce lot existe pour retirer — y compris quand c'est le lot qui
l'écrit.

**Les trois `⬜ aucun appelant` restants sont des primitives documentées** :
`getEntitiesByArea`, `getClimateEntities` et `countActiveLights` sont chacune la
base d'un export appelé (`getEntitiesByAreaAndDomain`, `getClimateEntitiesExcluding`,
`hasActiveLights`) et portent un cas de test de cette spec (TC-203, TC-204,
TC-206). Les trois autres exports sans appelant ni cas de test — `getFirstFloor`,
`getLightState`, `getClimateState` — ont été supprimés (lot fix `socle`, O2,
bead `ha-sci-fi-u9a`).

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Direct state mutation | `hass.states['light.x'].state = 'on'` | Treat HASS states as read-only, return a copy |
| 2 | Heavy loops in render | Computing arrays in Lit `render()` | Appeler les sélecteurs hors du chemin de rendu, et borner les re-rendus par `getRelevantEntities()` — cf. [spec 03 § Contrat de rendu sélectif](./03_base_classes.md#contrat-de-rendu-sélectif). **Les sélecteurs ne sont PAS mémoïsés**, et ne doivent pas l'être : cf. § Mémoïsation ci-dessous |
| 3 | Incomplete typecasting | Cast `hass` as `any` | Always use strict custom types from `ha.ts` — **à l'intérieur** du projet. La frontière HA est exemptée et l'exemption est nommée : cf. § La frontière `any` ci-dessous |
| 4 | Deep copying registry | `JSON.parse(JSON.stringify(hass))` | Perform shallow copy using spread operators |
| 5 | Hardcoded entity types | String literals in filtering | **Non tenu, et c'est une dette, pas une erreur de lecture** : aucune constante de domaine n'existe dans le dépôt, les domaines sont des littéraux (`entry.entity_id.startsWith('climate.')` dans `climate.ts`, `'light'` passé à `getEntitiesByAreaAndDomain` dans `light.ts`). Mesuré le 2026-11-01. Le jour où une carte se trompe de domaine en silence, c'est ici que ça se paie — bead `ha-sci-fi-eud`. **Re-mesuré le 2026-11-03** (scan AST de `src/`, lot [domain-constants](./domain-constants/spec.md#re-mesure)) : ces deux sites sont 2 sur **111** littéraux de domaine remplaçables, répartis dans 24 fichiers (2 dans `selectors/`, 109 dans `cards/`) ; le lot les remplace par `DOMAIN.*` (`src/types/domains.ts`) et pose la sonde qui les garde. **Tenu depuis la livraison du lot `domain-constants`** (2026-11-03) : 24 clés `DOMAIN`, 111 sites remplacés dans 24 fichiers, gardés par la sonde AST et son ratchet (`tests/helpers/domain-scan.test.ts`). Reste ouvert, hors de cette ligne : les trois domaines sans test qui rougisse à la mutation (NUMBER, COUNTER, VALVE — bead `knps`) |

### Mémoïsation — tranché contre, le 2026-11-01

L'AP#2 prescrivait « Use memoized selector functions ». Trois faits mesurés
contredisaient la prescription, et c'est la prescription qui cède :

1. **Aucune mémoïsation n'existe** : `grep -rniE 'memo|cache|WeakMap' src/selectors/`
   ne rend rien. `getFloors()` refait `Object.values()` puis `sort()` à chaque
   appel (`house.ts`).
2. **Les trois fichiers se déclarent le contraire** : « Pure, stateless functions.
   No mutation. » en en-tête de `house.ts`, `climate.ts` et `light.ts`. Un cache
   est un état.
3. **IT-201 l'interdit déjà** : il exige que `getFloors()` alloue un tableau neuf
   plutôt que de trier le registre en place, et dit en propres termes qu'exiger
   l'identité de référence « mandaterait un cache qu'aucune autre exigence ne
   demande, et risquerait de servir des étages périmés ».

Le bon mécanisme anti-rendu-inutile n'est pas ici : c'est `getRelevantEntities()`
dans la classe de base, qui empêche le rendu plutôt que d'accélérer le calcul.
Un sélecteur mémoïsé derrière un `shouldUpdate()` qui rend `true` ne gagne rien.
**Donc : sélecteurs purs et sans cache, et le coût se borne en amont.**

### La frontière `any` — où elle est légitime, et où c'est une dette

L'AP#3 dit « Always use strict custom types from `ha.ts` ». La classe de base
viole la lettre de cette règle à deux endroits, et les deux ne sont pas de même
nature :

| Occurrence | Verdict |
|---|---|
| `hass?: any` et `setConfig(config: any)` dans `interface LovelaceCard` (`src/utils/base-card.ts`) | **Légitime.** C'est la déclaration de l'interface que le frontend HA appelle, pas un usage interne. Resserrer le paramètre d'une méthode appelée par du code tiers ne le rend pas plus sûr, il rend l'implémentation incompatible. Le champ interne `_hass` est, lui, typé `HomeAssistantExt` |
| Les trois `*_action?: any` et l'index `[key: string]: any` de `fireHassAction` (`src/utils/action.ts`) | **Dette.** `ActionConfig` existe (`src/types/config.ts`) et n'est pas utilisé. Bead `ha-sci-fi-1la` |

La règle se lit donc : **`any` est admis pour déclarer ce que HA appelle, jamais
pour ce que le projet s'appelle à lui-même.** Les 122 `no-explicit-any` du budget
de la [spec 01](./01_infrastructure.md#budget-de-lint)
sont le compte de cette frontière plus la dette.

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-201 | Unit | `getFloors()` returns all floors | `mockHass` with 2 floors | `readonly HassFloor[]` length 2 |
| TC-202 | Unit | `getAreasByFloor()` filters by floor | `mockHass` floor `ground` has 3 areas | Returns exactly 3 areas |
| TC-203 | Unit | `getLightEntities()` filters light domain | `mockHass` area with 2 lights + 1 switch | Returns only 2 light entities |
| TC-204 | Unit | `getClimateEntities()` skips non-climate | `mockHass` with 1 climate + 1 sensor | Returns array length 1 |
| TC-205 | Unit | `getFloors()` empty if no floors registered | `mockHass` with empty floors registry | Returns `[]` (no crash) |
| TC-206 | Unit | `countActiveLights()` correct count | 3 lights: 2 on, 1 off | Returns `2` |
| TC-207 | Unit | Type guard rejects invalid config | `{ type: 'custom:sci-fi-lights' }` missing required field | Throws `Error` with field name |
| TC-208 | Unit | `getAreasByFloor()` returns an empty list for an unknown floor | `mockHass`, floor id `nonexistent_floor` | Returns `[]` — tests/selectors/house.test.ts |
| IT-201 | Integration | Selectors are pure — no mutation | Call `getFloors()` twice | Returns equal data, and `hass.floors` is unchanged (same contents, same key order). Reference identity is NOT required: `getFloors` sorts, so it must allocate a fresh array rather than sort the registry in place — requiring identical references would mandate a cache no other requirement asks for, and would risk serving stale floors |
| IT-202 | Integration | Performance: 500 entities | `mockHass` with 500 states | `getLightEntities()` completes under 5ms |
| IT-203 | Integration | End-to-end selector pipeline | Chain `getFloors` -> `getAreasByFloor` -> `getEntitiesByArea` | Correct entities resolved across hierarchy |

### `HassEntityEntry.domain` — optionnel, dérivé en pratique

L'API entity_registry de HA n'envoie pas de champ `domain` ; `src/selectors/house.ts`
le dérive du préfixe d'`entity_id`. `src/types/ha.ts` le déclare donc optionnel
(`readonly domain?: string`) : un code qui en a besoin le dérive de l'`entity_id`,
il ne le lit pas sur l'entrée (lot fix `socle`, O3, bead `ha-sci-fi-kw1`).

### `isClimateOn` — « allumé et joignable », pas « en chauffe »

La fonction rend vrai si l'entité existe et que son état n'est ni `'off'`, ni
`'unavailable'`, ni `'unknown'`. **Décision utilisateur du 2026-11-04** (lot fix
`ui`, O6, bead `ha-sci-fi-jbun`) : un thermostat injoignable ou d'état inconnu
ne compte plus comme actif — ni pour l'étage et l'espace actifs de la carte
climates, ni pour la bascule été/hiver de l'en-tête. Elle s'appelait
`isClimateNotOff` (lot fix `socle`, O4, bead `ha-sci-fi-djb`), nom devenu faux
une fois ces deux états exclus ; avant encore `isClimateActive`, documentée
« currently heating », ce qu'elle n'a jamais fait.

---

## Error Handling

> **« Null Registry State » : pas de journal — the decision is taken** (lot
> `config-error-card`, bead `ha-sci-fi-l3z`). Il n'y a aucun `console.*` dans
> `src/selectors/` et il n'y en aura pas : un sélecteur est une fonction pure
> appelée à chaque rendu, il ne peut pas journaliser à chaque appel, et lui donner
> une mémoire « une fois » ajouterait un état à une fonction pure sans lecteur du
> journal. Le repli (`[]` ou `undefined`) est le contrat.

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Invalid Configuration | Lightweight TypeScript type-guard assertions (`if (typeof config.entity_id !== 'string')`) — **no Zod** (Zod adds ~45KB to IIFE bundle) | Throw `Error('Invalid config: entity_id is required')` | Block rendering, `SciFiBaseCard.render()` catches and shows error banner |
| Null Registry State | `hass.areas` undefined | Return default empty records (`[]`, or `undefined` for a single lookup), no log | Fall back safely: the caller shows an empty list |
| Type Mismatch | Compiler type checker | Interrupt build process | Exit build with compiler type mismatch log |
