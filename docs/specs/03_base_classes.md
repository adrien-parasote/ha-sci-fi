# Spec 03 — Base Classes & Styles

> Document Type: Implementation
> Covers: Step 3 from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here | Covers |
|---|---|---|---|
| F-BASE-01 | `SciFiBaseCard` abstract base | ✅ `base-card.ts` | tests/utils/base-card.test.ts :: TC-301, TC-304, IT-301 |
| F-BASE-02 | `SciFiBaseEditor` abstract base | ✅ `base-editor.ts` | tests/utils/base-editor.test.ts :: TC-305, TC-308 · tests/styles/editor-common.test.ts :: IT-302 |
| F-BASE-03 | Reactivity and lifecycle hooks | ✅ `base-card.ts` | tests/utils/base-card.test.ts :: TC-303, TC-306, IT-301 · tests/utils/base-editor.test.ts :: IT-303 |
| F-BASE-04 | Sealed render wrapper pattern | ✅ `base-card.ts` | tests/utils/base-card.test.ts :: TC-301, TC-302 |
| F-BASE-05 | Shared common Lit CSS styles | ✅ `src/styles/common.ts` | tests/styles/editor-common.test.ts :: IT-302 |
| F-BASE-06 | Shared editor Lit CSS styles | ✅ `src/styles/editor-common.ts` | tests/styles/editor-common.test.ts :: IT-302 |
| F-BASE-07 | Design token families (fixed vs theme-chained) | ✅ `src/styles/common.ts` — [ADR-018](../adr/ADR-018_palette-fixed-identity.md) | tests/styles/token-refs.test.ts :: TC-307; tests/styles/token-declarations.test.ts |
| F-BASE-08 | Rendu sélectif : `shouldUpdate()` scellé + `getRelevantEntities()` surchargeable | ✅ `base-card.ts` — § Contrat de rendu sélectif | tests/utils/base-card.test.ts :: IT-301, TC-309, TC-310 |

---

## File Tree

```
src/
├── utils/
│   ├── base-card.ts                [NEW] Base card class
│   ├── base-editor.ts              [NEW] Base editor class — label lookup
│   │                                     MECHANISM + sharedEditorLabels()
│   │                                     + SHARED_SECTION_ICONS (ADR-017)
│   ├── action.ts                   [NEW] fireHassAction() — l'événement
│   │                                     `hass-action` natif HA (tap/hold/
│   │                                     double_tap), consommé par les cartes
│   └── toast.ts                    [NEW] showToast() — notification impérative,
│                                         un élément appendu à document.body.
│                                         ⬜ aucun appelant en production :
│                                         voir § Les deux toasts
└── styles/
    ├── common.ts                   [NEW] Shared styles — imported by every card
    ├── editor-common.ts            [NEW] Editor styles
    └── floor-nav.ts                [NEW] Hexagonal floor-navigation shell,
                                          shared by lights + water (ADR-017).
                                          Goes BEFORE the card sheet in
                                          `static styles` so the card can
                                          override it.
```

---

## Les deux toasts — un mécanisme livré, un mécanisme mort

Le socle porte `src/utils/toast.ts`, `src/components/` porte `<sf-toast>`, et
aucune ligne de spec ne nommait ni l'un ni l'autre avant le 2026-11-01 :

| Mécanisme | Où | Forme | Consommateurs |
|---|---|---|---|
| `showToast(message, type)` | [`src/utils/toast.ts`](../../src/utils/toast.ts) — ce socle | Appel impératif ; crée et appende un élément à `document.body`, hors de tout arbre de carte, donc n'hérite d'aucun token et code ses couleurs en dur (cf. § Design Tokens règle 5) | ⬜ aucun appelant |
| `<sf-toast>` | `src/components/sf-toast.ts` — [spec 04](./04_components.md) | Élément déclaré dans le `render()` d'une carte, piloté par ses propriétés | bridge, climates, lights, plugs, stove, tv, vacuum, vehicles, water |

La colonne des consommateurs est **dérivée de `src/` par
`socle-contract.test.ts`**, qui refuse une liste qui ne l'égale pas. Elle nomme
des cartes, jamais un nombre, et elle cherche le symbole **en mot entier**.

**Ces deux précautions ont chacune attrapé une erreur de la première rédaction de
ce §**, et elles valent d'être dites parce que c'est le défaut que ce lot existe
pour retirer :

- elle annonçait « 10 cartes » pour `<sf-toast>` : c'était le nombre de
  **fichiers**, `src/cards/bridge/` en portant deux. Un nombre faux se lit comme
  un nombre vrai ; une liste fausse se compare ;
- elle annonçait cinq consommateurs pour `showToast`. Il n'en existe aucun. Les
  cinq « occurrences » étaient `this._showToast(…)`, **méthode privée** de
  `water`, `tv`, `stove`, `vehicles` et `lights` qui pilote leur `<sf-toast>` —
  une sous-chaîne, pas un appel. `src/utils/toast.ts` n'est importé que par son
  propre test.

Donc il n'y a pas deux voies concurrentes : il y a `<sf-toast>`, et un module de
notification du socle que **rien n'utilise**. `src/cards/hexa-tiles/` et
`src/cards/weather/` n'émettent aucune notification du tout.

Ce qui reste à décider n'est pas une frontière entre deux mécanismes, c'est le
sort de `src/utils/toast.ts` : le supprimer, ou lui donner le rôle qu'il semblait
avoir (la notification qu'une carte doit émettre alors qu'elle n'est peut-être
plus montée, que `<sf-toast>` ne peut pas rendre). Bead `ha-sci-fi-ckw`.

## Design Tokens — two families, two reaches

Decided in [ADR-018](../adr/ADR-018_palette-fixed-identity.md); that record holds
the measurements and the rationale, this is the operating summary.

`src/styles/common.ts` declares two kinds of `--sf-*` token:

| Family | Tokens | Resolves to |
|---|---|---|
| **Fixed** | `--sf-accent-on`, `--sf-accent-off`, `--sf-warning`, `--sf-error`, `--sf-border`, `--sf-bg-secondary`, `--sf-text-disabled` | a literal — state and status, never follows the HA theme |
| **Chained** | `--sf-primary`, `--sf-bg`, `--sf-text-primary`, `--sf-text-secondary` | `var(--<ha-theme-var>, <literal>)` — frame, primary accent and text, follows the HA theme |

Rules that follow from it:

1. **The line runs through each card, not between the cards and this kernel.**
   A card sheet uses both families: its frame, accent and text are chained (129
   such declarations live in card sheets today), its state colours and
   illustrations are fixed. Do not move a colour across that line — replacing a
   state or illustration literal with a *chained* token drags it into the user's
   theme while the status colours beside it cannot follow, since the HA theme has
   no variable meaning "warning".
2. **`var(--sf-token, <literal>)` is the idiom**, not a bypass. The literal is the
   token's declared default repeated at the use site. Where the element declares
   `sciFiCommonStyles` in its own `static styles`, the token always resolves and
   the fallback is dead — keep it **character-identical** to the declaration in
   `common.ts`, because a fallback that says something else is read as the token's
   value and is wrong. "Declares" follows the **inheritance chain**, not the import
   line, so an element that extends one which declares it and returns `super.styles`
   declares it too (see the ADR-018 Erratum). Where the element does *not* declare it
   (`sf-dropdown` is the only one; it relies on its mount point), the fallback is live
   insurance: it is what renders off-tree, and it is deliberately not the token's
   value. A `--sf-*` name read in `src/` must be declared (`common.ts`) whether or not
   it carries a fallback — see `tests/styles/token-declarations.test.ts`.
3. **A bespoke colour with one consumer does not get a token.** Illustration and
   domain palettes (landspeeder, radiator, stove, plugs, weather icons) stay
   literal in their own sheet.
4. **`--sf-*` does not reach the editor tree.** The tokens are declared on the
   `:host` of `sciFiCommonStyles`; editors do not include it and are rendered by
   HA as siblings of the card preview, not descendants. `background: var(--sf-border)`
   in an editor sheet computes to `transparent`. Editors use the `--editor-*`
   family declared in `editor-common.ts`, chained to HA theme variables that do reach a dialog.
5. **A component in `src/components/` that needs the tokens includes
   `sciFiCommonStyles` itself**, rather than relying on being mounted inside a
   card. An element appended to `document.body` (`src/utils/toast.ts`) inherits
   nothing and correctly hard-codes its colours.

`tests/styles/card-css-baseline.test.ts` locks the resolved CSS of all 11 cards,
so any change to these declarations surfaces as a reviewed diff.

### Les deux étages de l'éditeur — la règle 4 ne couvre que le premier

La règle 4 ci-dessus dit « Editors use the `--editor-*` family ». Vrai d'un étage
sur deux, et la spec ne distinguait pas les deux (corrigé le 2026-11-01) :

| Étage | Ce qu'il consomme |
|---|---|
| **Chaque éditeur de carte** (`src/cards/*/sci-fi-*-editor.ts`) | `sciFiEditorCommonStyles`, donc la famille `--editor-*` déclarée dans `editor-common.ts`. Tous l'importent, sans exception |
| **Chaque composant d'`src/components/editor-inputs/`** | **Zéro `--editor-*`.** Ils consomment les variables de thème HA en direct — `--primary-color`, `--secondary-text-color`, `--primary-text-color`, `--error-color`, `--ha-card-background`, `--disabled-text-color` |

Les variables de thème HA atteignent le dialogue de configuration, donc ces
composants rendent correctement : ce n'est pas un bug d'affichage. Mais ils sont
hors de toute famille gouvernée, et `sf-editor-accordion` va plus loin — il déclare
six locales privées (`--_border-color`, `--_color-primary`, `--_font-small`,
`--_border-radius`, `--_border-width`, `--_border-color-alpha`) sous le commentaire
« Legacy CSS variables (with fallbacks for non-HA environments) », adossées à
`--secondary-light-color`, `--primary-light-color`, `--border-radius`,
`--border-width` et `--font-size-small`, dont aucune n'est déclarée dans ce dépôt.
Elles rendent donc toutes leur littéral de repli, dans HA comme hors de HA.

**Ce que cette spec tranche : les composants d'`editor-inputs/` sont au contrat de
thème HA, pas au contrat `--editor-*`** — et c'est ce que le code fait. Les porter
sur `--editor-*` est une décision ouverte, pas une correction : bead
`ha-sci-fi-0z0`.

---

## Contrat de rendu sélectif

> `shouldUpdate()` scellé, `getRelevantEntities()` surchargeable.

Ce contrat est **le plus consommé du projet** : chaque carte le surcharge (TC-310).
Il n'était écrit nulle part avant le 2026-11-01 — ni en Blueprint Coverage, ni en
Public Interface, ni en anti-patron, ni en cas de test. `sci-fi-bridge.ts`
renvoyait même à une « spec §getRelevantEntities » en commentaire, section qui
n'existait pas. Voici ce que le socle livre.

### Ce que `shouldUpdate()` décide

`SciFiBaseCard.shouldUpdate()` (scellé — une carte ne le surcharge pas) rend
`true`, donc re-rend, dans ces cas et dans cet ordre :

1. **plus d'une propriété a changé**, ou une seule qui n'est pas `hass` — une
   propriété réactive de la carte a bougé, Lit sait pourquoi ;
2. **`config` absent** — évalué juste après la branche 1, avant toute lecture de
   `getRelevantEntities()` (que les cartes écrivent en lisant `this.config`) :
   l'état de la bannière de configuration manquante se repeint, il ne lève pas ;
3. `hass` a changé et **la langue diffère** (`oldHass.locale?.language !==
   this.hass.locale?.language`) — cf. AP#6 ;
4. `hass` a changé et **`getRelevantEntities()` rend une liste vide** — le repli
   conservateur : sans liste, la carte ne peut pas savoir ce qui la concerne,
   donc elle se re-rend ;
5. `hass` a changé et **au moins une entité de la liste a changé d'objet d'état**
   (`oldHass.states[e] !== this.hass.states[e]`, comparaison d'identité : HA
   remplace l'objet à chaque mise à jour) ;
6. **tout le reste** — le `return true` final : premier rendu (`oldHass` absent),
   `this.hass` encore absent, ou `changedProps` vide. Le défaut est le rendu ;
   seule la branche 5 peut le refuser.

Il rend `false` dans un seul cas : `hass` seul a changé, `config` est présent,
`oldHass` **et** `this.hass` sont là, la langue est la même, la liste est non vide, et aucune de
ses entités n'a changé d'objet d'état.

### Ce que la carte doit fournir

| Élément | Contrat |
|---|---|
| `protected getRelevantEntities(): string[]` | **Chaque carte la surcharge** et rend l'`entity_id` de **toute** entité dont son rendu dépend — celles de sa config, et celles qu'elle lit par ailleurs (capteurs dérivés, `sensor.season`, entité d'application…). Défaut de la classe de base : `[]` |
| La liste doit être **exhaustive** | Une entité oubliée ne fait pas planter : la carte **se périme en silence**, elle n'affiche plus les changements de cette entité et rien ne le signale. C'est le mode de défaillance de ce contrat, et il est invisible en revue comme en test |
| La liste doit rester **à jour** | Une option de configuration ajoutée qui introduit une entité est incomplète tant que `getRelevantEntities()` ne l'inclut pas. Une nouvelle clé de config sans ligne ici est un défaut |

**Le défaut `[]` n'est pas une valeur par défaut raisonnable, c'est un filet.**
Il fait re-rendre la carte à *chaque* changement d'état de *toute* l'installation :
correct à l'affichage, et la perte de performance exacte que ce mécanisme existe
pour éviter.

### La liste vide délibérée est légitime, et elle se nomme

Toute carte surcharge le hook (TC-310). Mais **surcharger le hook n'est pas ne
jamais rendre `[]`** : une carte dont la configuration ne désigne encore aucune
entité rend une liste vide, et elle *doit* la rendre, sinon un état qui disparaît
reste à l'écran.

| Carte | Le `[]` qu'elle rend délibérément |
|---|---|
| climates | `if (entities.size === 0) return []` — quatre lignes de commentaire disent pourquoi : rendre `sensor.season` inconditionnellement rendait la liste jamais vide, et supprimer la dernière entité `climate.*` laissait un radiateur périmé à l'écran (constat d'une revue antérieure) |
| bridge | `if (!this.config) return []` — avant que la configuration arrive |

Toute carte dont le filtre final ne retient rien y arrive aussi, par construction.

**Donc le filet n'est pas un défaut à supprimer : c'est le comportement correct
quand il n'y a rien à suivre.** Le seul défaut de ce contrat est celui que
l'AP#7 nomme — une liste qui *omet une entité que la carte lit*. Cette version
du § remplace une affirmation fausse du 2026-11-01 (« les onze cartes surchargent
le hook, donc aucune n'est dans ce cas »), qui confondait les deux et faisait
prescrire l'AP#7 contre du code déjà relu.

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | Lit `@property({ attribute: false })` works for hass object | Low | → Run element properties check after state change events |
| 2 | Sealed `render` executes `willUpdate` hook reactively | Medium | → Run console log check for willUpdate triggers on state change |
| 3 | CSS variables are supported in HA dashboard environment | Medium | → Run style rendering checks inside active dashboard window |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `SciFiBaseCard` | Spec 05 | Base custom Lovelace card class |
| `SciFiBaseEditor` | Spec 05 | Base Lovelace card editor class. Owns the label lookup mechanism (`getLabel`, `getSectionTitle`) and the shared dictionaries; per-card vocabulary is supplied by subclasses via `cardLabels` / `cardSectionIcons` — ADR-017, Spec 10 § Base Editor Enrichment |
| `src/styles/common.ts` | Spec 04, 05 | Shared sci-fi theme styling tokens |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `src/types/ha.ts` | Spec 02 | Immutability extended HA types |
| `setLocale`, `getLocale` | `src/locales/localization.ts` | Runtime locale switching via `@lit/localize` |
| `updateWhenLocaleChanges` | `@lit/localize` | Schedules re-render when active locale changes |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `SciFiBaseCard` | Card subclasses | Extends LitElement, manages state safely |
| `SciFiBaseEditor` | Editor subclasses | Extends LitElement, manages card config |
| `sciFiCommonStyles` | Custom elements | CSS Lit styles with shared styling tokens |
| `shouldUpdate(changedProps)` | Lit — **scellé** | Décide le re-rendu ; une carte ne le surcharge pas. § Contrat de rendu sélectif |
| `getRelevantEntities(): string[]` | **Chaque carte** | Le hook à surcharger : les `entity_id` dont le rendu dépend. Défaut `[]` = re-rendu à chaque changement d'état HA |
| `renderCard()` | Card subclasses | Abstrait — implémenté au lieu de `render()`, qui est scellé dans un try/catch (AP#1, TC-301) |
| `setConfig(config)` | HA / Lovelace | Valide (`validateConfig`), gèle la config (`Object.freeze`) et la stocke ; jette sur un non-objet |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Overriding `render()` | Card overrides `render()` directly | Implement `renderCard()` inside card subclasses |
| 2 | Inline styling tokens | Hardcoded hex color in css where a `--sf-*` token already holds that exact value | Use `var(--sf-token, <literal>)` — see § Design Tokens and [ADR-018](../adr/ADR-018_palette-fixed-identity.md). A bespoke colour with one consumer stays literal; a *chained* token never replaces a widget colour |
| 2b | Chained token in an editor sheet | `var(--sf-border)` inside `editor-common.ts` or `components/editor-inputs/*` — `--sf-*` does not reach the config dialog, so the declaration computes to its initial value | Use the `--editor-*` family from `editor-common.ts` |
| 3 | Manual update calls | `this.performUpdate()` in card | Lit properties handle reactivity automatically |
| 4 | Duplicated editor styles | Copy-pasting styling rules | Importer `sciFiEditorCommonStyles` de [`src/styles/editor-common.ts`](../../src/styles/editor-common.ts) — la règle nommait un fichier « editor.ts » qui n'a jamais existé. ⚠ Elle ne porte que sur les **éditeurs de carte** (les onze l'importent, mesuré le 2026-11-01), pas sur les composants de `src/components/editor-inputs/` : cf. § Les deux étages de l'éditeur |
| 5 | Unhandled rendering exception | Empty render blocks | Wrap rendering loop in try/catch block |
| 6 | Orphaned locale sync | Card or editor uses `willUpdate` as the only locale trigger | Use the `hass` property setter (with getter/setter pair) — call `setLocale(hass.locale.language)` when language differs, and `updateWhenLocaleChanges(this)` in the constructor. The `hass` setter fires on every HA state propagation, not just on property changes seen by `willUpdate`. |
| 7 | `getRelevantEntities()` omet une entité que la carte lit | Une carte rend une liste non vide qui ne contient pas une entité dont son rendu dépend (capteur dérivé, entité d'application, `sensor.season`…) | Y lister **toute** entité dont le rendu dépend, config et dérivées. ⚠ Rendre `[]` quand il n'y a rien à suivre n'est **pas** cet anti-patron : c'est le comportement correct, et deux cartes le font exprès — § La liste vide délibérée |
| 8 | `shouldUpdate()` surchargé dans une carte | `override shouldUpdate()` dans une sous-classe | Il est scellé : la carte fournit `getRelevantEntities()`, pas une politique de rendu à elle |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-301 | Unit | renderCard executes inside try/catch | Valid subclass config | Subclass renders correctly |
| TC-302 | Unit | renderCard error catches | Throw error in renderCard | Renders error card display banner |
| TC-303 | Unit | hass setter triggers setLocale | Set `hass` with FR language | `setLocale` invoked asynchronously, hass getter returns set value |
| TC-304 | Unit | setConfig stores config | Configuration object | config gets updated and stored |
| TC-305 | Unit | baseEditor updates properties | Change value in editor | Dispatches config-changed custom event |
| TC-306 | Unit | Subclass overriding willUpdate must call super | A compliant subclass AND one that omits `super.willUpdate` | The inherited hook fires for the compliant override and NOT for the faulty one; every `extends SciFiBaseCard` in `src/**/*.ts` that overrides `willUpdate` **as a method declaration** has `super.willUpdate(changedProperties)` as its first statement. The tree-wide half is scoped to method declarations in files that textually `extends SciFiBaseCard` — that is what a source walk can see. Two override shapes fall outside it and are tracked by bead `ha-sci-fi-2t4`, not by this row: a class-field arrow (`override willUpdate = (c) => …`, which shadows the prototype method) and a card extending an intermediate subclass declared elsewhere. The `override` keyword itself is enforced by `noImplicitOverride` in `tsconfig.json`, a different property from the super call: a compiler flag cannot express the latter, and dropping the walk in favour of the flag leaves the clause unchecked |
| TC-307 | Unit | No undeclared `--sf-*` name, fallback or not; no non-`--sf-` `var(--x)` without fallback targets an undefined token | Every `` css` ` `` block and inline `style=` in `src/**/*.ts`, CSS comments excluded | Zero references; a violation is reported with the token name and its `file:line`. Guards rule 2 above — a reference that is neither defined nor defaulted is invalid at computed-value time and the property renders unset |
| TC-308 | Unit | `getLabel` renvoie la chaîne française quand la locale est `fr` | `hass.locale.language = fr`, attendre le chargement de la locale | `getLabel('section-title-header')` vaut `En-tête` — `tests/utils/base-editor.test.ts` |
| TC-309 | Unit | Le défaut `[]` re-rend sur tout | Une sous-classe qui ne surcharge **pas** `getRelevantEntities()` ; réassigner `hass` en changeant une entité qu'elle ne lit pas | `renderCard` est rappelé — le repli conservateur du § Contrat de rendu sélectif, point 3. C'est le pendant d'IT-301, qui prouve le veto quand la liste est fournie |
| TC-310 | Unit | Chaque carte surcharge le hook | Les fichiers de carte de `src/cards/*/` | Toute classe qui `extends SciFiBaseCard` déclare `override getRelevantEntities()`. Le compte des cartes est dérivé de l'arbre, jamais gelé dans le cas |

| IT-301 | Integration | Card reacts to HA state changes | Modify mockHass states | Subclass `renderCard` triggered |
| IT-302 | Integration | Editor styles apply correctly | Open card editor | Shared CSS properties verify as loaded |
| IT-303 | Integration | Locale synced with HA language | Update HA language state | UI translation texts update reactively |

> **Le veto du rendu sélectif n'a pas de ligne à lui** : il est prouvé par
> `IT-301, IT-403` ci-dessus (« re-renders when a relevant entity changes and
> skips when none did »), qui existait avant que ce contrat soit écrit. Cette
> spec le nomme au lieu d'en minter un doublon — le cas prouve déjà la branche 4
> et le seul `false` du § Contrat de rendu sélectif.

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Render Card Failure | `try`/`catch` autour de `renderCard()` dans `render()` | `console.error('[<tag>] Render error:', err)` et `_renderError` renseigné | `<ha-card>` portant `.sf-error-card` : l'icône `.sf-error-icon` et le message `.sf-error-message` |
| Missing Configuration | en tête de `render()` : `!this.hass` ; puis `!this.config` ; puis, pour une carte qui surcharge `getConfiguredEntities()`, toutes ses entités configurées absentes de `hass.states` | `hass` absent : `return nothing` (état normal, HA fournit `hass` après `setConfig` : un message ferait clignoter chaque chargement). `config` absent avec `hass` : `_renderErrorCard(msg('Card setup required: configuration is missing.'))`. Toutes les entités configurées absentes : `_renderErrorCard(msg(str`Entity not found: ${ids}`))`, trois ids au plus puis `, … (+N)` | Dès qu'une entité configurée existe, la carte se rend comme avant ; le crochet `getConfiguredEntities()` est opt-in (défaut `[]`), sept cartes l'implémentent, le pont, lights, climates et water non. Aucun journal : `render()` s'exécute à chaque rendu. Lot `config-error-card`, bead `ha-sci-fi-l3z` |
| Configuration invalide | `setConfig()` : non-objet, ou `validateConfig()` de la sous-classe | `throw new Error('[<Classe>] setConfig: …')` | HA affiche sa propre carte d'erreur de configuration — ce chemin-là est tenu |
| Style Injection Error | ⬜ **aucune détection** | ⬜ — | ⬜ **non implémenté du tout**, mesuré le 2026-11-01. La ligne promettait « Load fallback styling tokens seamlessly » ; aucun code ne surveille le chargement d'une feuille. Les feuilles sont des `css` littéraux compilés dans le bundle : il n'y a pas de chargement à échouer, donc l'erreur décrite ne peut pas se produire sous cette architecture. La ligne est conservée barrée plutôt que supprimée, pour que personne ne la réintroduise en croyant combler un trou. Bead `ha-sci-fi-l3z` |
