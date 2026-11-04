# Spec 14 — Stove Card

> Document Type: Implementation
> Covers: la carte `sci-fi-stove` telle qu'elle est livrée — en-tête, zone contenu, barre de contrôles, et le contrat d'intégration Fumis
> Depends on: [Spec 05](../05_cards.md#sci-fi-stove), [Spec 03](../03_base_classes.md#L1)
> ADR-005: Zero breaking YAML changes — all config fields frozen, all CSS selectors used by tests frozen
>
> **Renumérotée le 2026-11-01** (lot fix `specs-design-abandonne`, O8) : cet
> en-tête disait « Spec 11 », déjà pris par
> [11_guidelines_remediation.md](../11_guidelines_remediation.md). Le premier
> correctif l'a mis en « Spec 12 », qui était pris deux fois —
> [vehicles.md](./vehicles.md) et [water_history.md](./water_history.md) :
> j'avais comparé avec le seul fichier que le bead nommait, et remplacé une
> collision à deux par une collision à trois. Mesuré sur les 22 specs,
> 14 était libre. Le titre disait aussi « Design Update » — un nom de
> chantier, alors que le document est la spec de la carte.

---

## Blueprint Coverage

| Feature ID | Description | Spec file | Covers |
|---|---|---|---|
| F-STOVE-D01 | En-tête : le `friendly_name` seul, sur une ligne à bordure basse, avec repli localisé | ✅ This spec § Header et ligne de statut | tests/cards/stove/sci-fi-stove.test.ts :: TC-STOVE-U-1105, TC-STOVE-U-1115, IT-STOVE-I-1102 |
| F-STOVE-D02 | Statut : icône, libellé et classe de couleur choisis ensemble par `STATUS_ICONS`, sur `.status` dans la zone médiane | ✅ This spec § Header et ligne de statut | tests/cards/stove/sci-fi-stove.test.ts :: TC-STOVE-U-1101, TC-STOVE-U-1102, TC-STOVE-U-1103, TC-STOVE-U-1104, TC-STOVE-U-1114 |
| F-STOVE-D03 | Extract CSS into `styles.ts` (climate pattern) | ✅ This spec § styles.ts | tests/cards/stove/styles.test.ts :: TC-STOVE-U-1113 · tests/cards/stove/sci-fi-stove.test.ts :: IT-STOVE-I-1103 |
| F-STOVE-D04 | `ha-card` background `var(--sf-bg)` — mesuré le 2026-11-01 dans `tests/styles/card-css-baseline.json` ; la valeur `rgba(39,40,43,0.3)` que cette ligne annonçait n'est appliquée par aucune règle de `sci-fi-stove` (elle l'est par `lights`, `vehicles`, `water-management` et `weather`) | ✅ This spec § styles.ts | tests/styles/card-css-baseline.test.ts (« sci-fi-stove resolves to the same CSS as the baseline », sans id) |
| F-STOVE-D05 | Zone contenu : l'illustration `sf-stove-image`, puis le panneau `.info` en trois zones (jauges, statut + températures, puissances) | ✅ This spec § sci-fi-stove.ts — la structure rendue | tests/cards/stove/sci-fi-stove.test.ts :: IT-STOVE-I-1102 · tests/cards/stove/sci-fi-stove.test.ts (« renders .content with .info panel », « renders stove-image component with correct state », « renders fan speed in .powers section… », sans id) |
| F-STOVE-D06 | Les jauges sont des composants, pas des règles de la feuille : `sf-circle-progress-bar` pour les granulés, `sf-stack-bar` pour le stock, et rien quand l'état n'est pas numérique | ✅ This spec § sci-fi-stove.ts — la structure rendue | tests/cards/stove/sci-fi-stove.test.ts (« renders sf-circle-progress-bar for pellet quantity », « renders sf-stack-bar for storage_counter », « does not render pellet gauge when state is non-numeric (NaN branch) », sans id) |
| F-STOVE-D07 | Les sélecteurs que les tests lisent ne sont pas renommés | ✅ This spec § Test Selectors — Frozen Contract | tests/cards/stove/sci-fi-stove.test.ts :: TC-STOVE-U-1111, TC-STOVE-U-1114, IT-STOVE-I-1101 |
| F-STOVE-D08 | Barre inférieure : mode HVAC, molette de température et mode éco, chacun écrivant par un service et confirmant par `sf-toast` | ✅ This spec § Barre inférieure — les contrôles interactifs | tests/cards/stove/sci-fi-stove.test.ts :: test_O3_eco_switch_renders_a_toggle_and_reflects_its_state, test_O3_eco_switch_toggle_calls_switch_toggle, test_O3_no_dead_control_when_neither_switch_nor_presets · tests/cards/stove/sci-fi-stove.test.ts (« renders .bottom interactive section », « calls climate services and shows sf-toast on hvac/temp/preset actions », les trois chemins d'erreur et le garde `isNaN`, sans id) |

---

## Assumptions

| ID | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The `sci:stove-heat` and `sci:stove-off` icons are already registered in the custom icon set | Low | SHOW | 'grep 'sci:stove-heat' src/cards/stove/sci-fi-stove.ts' → found |
| 2 | ~~CSS selectors `.bar-fill.pellet`, `.bar-fill.storage`, `.sensor-tile`, `.sensor-tile.warn` MUST be preserved — 4 tests depend on them~~ — **fausse, retirée le 2026-11-01** (O6). Mesure : `grep -c` dans `tests/cards/stove/sci-fi-stove.test.ts` rend 0 pour `bar-fill` et pour `sensor-tile`. Zéro test en dépendait, et les classes ont été supprimées le 2026-08-12 (bead `ha-sci-fi-9xf`). Le sélecteur que les tests lisent vraiment est `.stove-status` | — | SHOW | `grep -c 'bar-fill\|sensor-tile' tests/cards/stove/sci-fi-stove.test.ts` → 0 |
| 3 | `sciFiCommonStyles` from `src/styles/common.ts` provides all `--sf-*` tokens used in the new styles | Low | SHOW | 'grep '--sf-' src/styles/common.ts' → tokens present |
| 4 | The header uses `staveState.attributes.friendly_name` as the name (already in prod) | Low | SHOW | 'grep 'friendly_name' src/cards/stove/sci-fi-stove.ts' → usage found |
| 5 | The stove is ON when `stoveState.state !== 'off' && stoveState.state !== 'unavailable'` | Low | SHOW | 'grep '!== "off"' src/cards/stove/sci-fi-stove.ts' → logic found |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Préserver les sélecteurs que les tests lisent — `.stove-status`, `.status` et ses classes de couleur, `.header` (§ Test Selectors) ; utiliser `sciFiCommonStyles` de `src/styles/common.ts` ; importer `stoveStyles` depuis `styles.ts` |
| **Ask first** | Ajouter un champ de config hors ADR-005 ; changer les noms d'icônes (`sci:stove-heat`, `sci:stove-off`, `sci:stove-eco`, `sci:stove-cool`, `sci:stove-unknow`) ; modifier les entrées de `STATUS_ICONS` ou `STATUS_LABELS` (§ Vocabulaire de statut) |
| **Never do** | Renommer `.stove-status` ou une classe de couleur de `.status` ; muter `this.config` ; renommer le champ `entity` en `entity_id` ; importer Chart.js ; remettre `.sensor-tile` / `.bar-fill` en CSS sans rendu qui les produise |

---

## Cross-Spec Contracts

 ### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/stove/styles.ts` | Lit CSS export (`stoveStyles`, export unique) | This spec § styles.ts | `sci-fi-stove.ts` (import `stoveStyles`) |
| `sci-fi-stove` card | Web Component | This spec § sci-fi-stove.ts — la structure rendue | Lovelace via `getConfigElement()` (Spec 05) |

 ### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | Spec 03 § base-card.ts | `src/utils/base-card.ts` |
| `SciFiStoveConfig` | TS interface | Spec 05 § sci-fi-stove | `src/cards/stove/config.ts` |
| `sf-icon` | Web Component | Spec 04 § sf-icon | `src/components/sf-icon/` |

 ### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-stove>` | HA Lovelace | Stove monitoring card (unchanged tag) |

 ### External Invocations

N/A — No third-party APIs. Internal `hass` property only:
- `this.hass.states[entity]` — sensor state reads
- `this.hass.config?.unit_system?.temperature` — temperature unit (°C default)
- `this.hass.config?.unit_system?.pressure` — pressure unit (Pa default)
- `this.hass.connection` — passed to `sf-icon` for icon loading

 ### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `--sf-bg-primary` token | Repli de la bordure basse de `.header` dans styles.ts | Spec 03 § styles/common.ts |
| `ha-card` background `var(--sf-bg)` | Hérité de `sciFiCommonStyles` — `styles.ts` ne porte **aucune** règle `ha-card` (mesuré le 2026-11-01, F-STOVE-D04) | Spec 05 (climate pattern), sci-fi-lights.ts |

---

## File Tree

```
src/cards/stove/
├── sci-fi-stove.ts             [MODIFY] — import stoveStyles, redesign renderCard(); wheel .selectedId property binding + Math.round()
└── styles.ts                   [NEW]    — extracted stove CSS; header padding 5px; amber rgb(250,146,29); absolute px font-sizes

src/components/
├── sf-stove-image.ts           [NEW]    — SVG stove illustration ported 1:1 from main branch
├── sf-wheel.ts                 [MODIFY] — align-items:center on .core/.slider; min-height:24px; fallback selected item; fix circular CSS var
├── sf-stack-bar.ts             [NEW]    — stack bar component ported from main
└── buttons/
    ├── sf-button.ts            [MODIFY] — display:block on :host for centering
    └── sf-button-card.ts       [MODIFY] — justify-content:center
```

> [!NOTE]
> `sf-stove-image.ts`, `sf-stack-bar.ts`, and 'sf-circle-progress-bar.ts' are new files not in the original spec — they were extracted from main branch JS components as part of the TS port.
>
> ADR-017: `sf-stove-image.ts` lives in `src/cards/stove/` — the stove card is
> its only consumer, so it is card-private, not a shared component.
> `sf-stack-bar.ts` and `sf-circle-progress-bar.ts` have several consumers and
> stay in `src/components/`.

---

## Post-Spec Corrections (divergences fixed after initial implementation)

> These corrections were applied during the polish phase. They are documented here to preserve reproducibility.

| ID | File | Correction | Root Cause |
|----|------|------------|------------|
| C01 | `sf-stove-image.ts` | `_getCommons()` replaced with exact main SVG (body rect, right gradient strip, horizontal curves, wood grain paths) | Simplified stub didn't match main branch visual |
| C02 | `styles.ts` | Header `padding: 10px → 5px` | User correction |
| C03 | `styles.ts` | Amber color `#ffd60a → rgb(250, 146, 29)` everywhere | User-specified exact main branch color |
| C04 | `styles.ts` | All `0.75rem` fallbacks → `12px` absolute | HA root font-size 24px → `0.75rem = 18px` not 12px |
| C05 | `sf-wheel.ts` | `.core { align-items: center }` added | Arrows left-aligned in flex column without explicit centering |
| C06 | `sf-button.ts` | `:host { display: block }` added | Custom element default `inline` prevented `margin:auto` centering |
| C07 | `sf-button-card.ts` | `.btn { justify-content: center }` | `justify-content: left` was non-standard and misaligned content |
| C08 | `sf-wheel.ts` | Fallback: show first item if `selectedId` matches nothing | All items `.hide` → slider collapses → temperature invisible |
| C09 | `sf-wheel.ts` | Remove circular CSS var `--item-font-size: var(--item-font-size, …)` | Browser ignores circular self-reference → inherited 18px from HA body |
| C10 | `sci-fi-stove.ts` | Wheel `selected-id` → `.selectedId` property binding + `Math.round()` | Attribute string vs property; float temps (20.5) didn't match integer item IDs |
| C11 | `styles.ts` | Power cell icons `--icon-color: var(--primary-light-color, #6ecbf5)` | `sf-icon` uses `currentColor` → inherited grey from label color |
| C12 | `sci-fi-stove.ts` | Bottom bar `msg()` keys changed from French → English; 7 entries added to `xliff/fr.xlf`, then `src/locales/locales/fr.js` regenerated | French source keys generate hashes absent from `fr.js` → lit-localize falls back to raw source in all locales |

---

## Contrat d'intégration Fumis — les deux générations

> Lot `stove-fumis-core` (O2 → bead `ha-sci-fi-nib`, O3 → bead `ha-sci-fi-1qy`).
> La carte est branchée indifféremment sur l'intégration HACS `maheus/fumis_integration`
> (projet arrêté) ou sur l'intégration **core** `fumis` (HA 2026.5+). Les deux ne
> présentent pas le même poêle, et la carte doit tolérer les deux.

### Vocabulaire de statut — `sensors.sensor_status`

`STATUS_ICONS` et `STATUS_LABELS` couvrent les **quatorze** valeurs de
`sensor.*_detailed_stove_status` de l'intégration core. Les sept premières sont
aussi celles qu'écrivait le `binary_sensor` de l'intégration HACS.

| État | Icône | Couleur | Génération |
|---|---|---|---|
| `off` | `sci:stove-off` | off | les deux |
| `pre_heating` | `sci:stove-heat` | amber | les deux |
| `ignition` | `sci:stove-heat` | amber | les deux |
| `pre_combustion` | `sci:stove-heat` | red | les deux |
| `combustion` | `sci:stove-heat` | red | les deux |
| `eco` | `sci:stove-eco` | green | les deux |
| `cooling` | `sci:stove-cool` | blue | les deux |
| `cold_start` | `sci:stove-heat` | amber | core |
| `cold_start_off` | `sci:stove-off` | off | core |
| `hybrid_init` | `sci:stove-heat` | amber | core |
| `hybrid_start` | `sci:stove-heat` | red | core |
| `wood_start` | `sci:stove-heat` | amber | core |
| `wood_combustion` | `sci:stove-heat` | red | core |
| `wood_burning_off` | `sci:stove-cool` | blue | core |

Le repli `sci:stove-unknow` + `replaceAll('_', ' ')` **reste en place** : il couvre une
valeur future que l'intégration ajouterait (TC-STOVE-U-1114 le vérifie).

> **Source du vocabulaire** : relevé sur l'installation d'Adrien le 2026-10-31
> (HA 2026.10.4, intégration core `fumis`), consigné dans le bead `ha-sci-fi-nib` ;
> les sept valeurs core supplémentaires sont celles que réclamait
> `maheus/fumis_integration#17`. Aucune de ces quatorze valeurs n'est garantie par un
> contrat publié : une quinzième apparaîtrait sur le repli, pas en erreur. Si
> l'intégration en ajoute, c'est ce tableau qu'il faut compléter — et le
> `STOVE_OFF_STATES` de `sf-bridge-stove.ts` en même temps, sans quoi un nouvel état
> éteint compterait comme « en marche » sur le bridge.

> [!WARNING]
> **Ne pas brancher la carte sur `sensor.*_stove_status`** (la version simplifiée de core) :
> elle renomme `combustion` en `burning`, `pre_heating` en `heating_up`, et perd
> `pre_combustion` — trois des sept clés historiques cesseraient d'être reconnues.

### Mode éco — `switch_eco_mode`

L'intégration HACS exposait `preset_modes: ['none', 'eco']` sur l'entité `climate`.
L'intégration core ne l'expose plus : ses `supported_features` valent
`TARGET_TEMPERATURE | TURN_ON | TURN_OFF`, sans `PRESET_MODE`, et le mode éco devient
une entité à part, `switch.*_eco_mode`. Le troisième contrôle de la barre du bas suit
donc trois branches, dans cet ordre :

| Condition | Rendu | Action |
|---|---|---|
| `config.switch_eco_mode` renseigné | `sf-button-card` bascule, icône `mdi:leaf` quand le switch est `on`, `mdi:circle-medium` sinon | `switch.toggle` sur l'entité |
| sinon, `attributes.preset_modes` non vide | `sf-button-card-select` — comportement historique, inchangé | `climate.set_preset_mode` |
| sinon | **rien** | — |

La troisième branche est le défaut corrigé : un bouton rendu mais sans liste à ouvrir
est un contrôle mort, pire qu'un contrôle absent.

`switch_eco_mode` est un champ **racine** de `SciFiStoveConfig` (ce n'est pas un capteur),
exposé par l'éditeur dans la section Configuration et ajouté à `getRelevantEntities()`.

---

## Header et ligne de statut

> **Réécrit le 2026-11-01** — lot fix `specs-design-abandonne`, O3 (bead
> `ha-sci-fi-zdw.3`). Cette section décrivait un en-tête à trois colonnes
> (icône + nom + état, bordures haute et basse) qui n'a jamais été construit :
> ni `.header-icon`, ni `.header-info`, ni `.stove-name`, ni
> `.sf-state-on|off` n'existent dans l'arbre. Ce qui suit est mesuré sur le
> code livré.

### L'en-tête rendu

L'en-tête ne porte **que le nom**. `_renderHeader` (`sci-fi-stove.ts:143-145`) :

```ts
private _renderHeader(name: string): TemplateResult {
  return html`<div class="header">${name}</div>`;
}
```

Le nom lui est passé par `renderCard` :
`stoveState.attributes.friendly_name ?? msg('Stove')` — un repli **localisé**,
pas un littéral (TC-STOVE-U-1115 le tient).

Son CSS (`styles.ts:25-33`) n'a qu'une bordure, en bas :

```css
.header {
  text-align: center;
  border-bottom: var(--sf-border-width, 1px) solid var(--sf-bg-primary, #0d1117);
  padding: 5px;
  background-color: rgba(13, 17, 23, 0.6);
  color: var(--sf-text-secondary, #b0bec5);
  font-size: var(--sf-text-sm, 12px);
  font-weight: bold;
}
```

### L'état et sa couleur — `_renderStatus`, pas l'en-tête

L'icône du poêle et son état ne sont pas dans l'en-tête : ils vivent dans la
zone médiane du contenu, rendus par `_renderStatus` :

```ts
private _renderStatus(text: string, status: string | undefined): TemplateResult {
  const resolved = status ?? 'N/A';
  const meta = STATUS_ICONS[resolved] ?? { icon: 'sci:stove-unknow', color: 'off' };
  const label = STATUS_LABELS[resolved] ?? resolved.replaceAll('_', ' ');
  return html`
    <div class="status ${meta.color}">
      <sf-icon icon="${meta.icon}" .connection="${this.hass.connection}"></sf-icon>
      <div class="label">${text}:</div>
      <div class="stove-status">${label}</div>
    </div>
  `;
}
```

La coloration conditionnelle est donc portée par la classe que
`STATUS_ICONS[status].color` choisit, sur `.status`, et non par une classe
d'état sur le libellé :

| Classe rendue | Couleur appliquée (`styles.ts:240-284`) | États concernés (§ Vocabulaire de statut) |
|---|---|---|
| `.status.off` | `var(--sf-text-secondary, #7ca8c9)` | `off`, `cold_start_off`, et le repli `N/A` |
| `.status.amber` | `rgb(250, 146, 29)` | `pre_heating`, `ignition`, `cold_start`, `hybrid_init`, `wood_start` |
| `.status.red` | `#ff4444` | `pre_combustion`, `combustion`, `hybrid_start`, `wood_combustion` |
| `.status.green` | `#4caf50` | `eco` |
| `.status.blue` | `var(--primary-light-color, #6ecbf5)` | `cooling`, `wood_burning_off` |

La même classe colore l'icône (`--icon-color`) et le libellé
(`div:last-child`). `.stove-status` est le seul sélecteur de cette zone que la
spec gèle : il porte le libellé lisible, et `display: inline`
(`styles.ts:296-299`) est tout son style.

---

## styles.ts

**File:** `src/cards/stove/styles.ts`

**Export name:** `stoveStyles` — **un seul export**, aligné sur le
`climateStyles` de `src/cards/climates/styles.ts`.

> **Réécrit le 2026-11-01** — lot fix `specs-design-abandonne`, O10 (bead
> `ha-sci-fi-zdw.10`). Cette section portait une feuille CSS complète en deux
> exports, `stoveStyles` + `stoveStylesPart2`, déclarant `.header-icon`,
> `.header-info`, `.stove-name`, `.sensors-grid`, `.sensor-tile`,
> `.sensor-value`, `.sensor-label`, `.bar-bg`, `.bar-fill.pellet` et
> `.bar-fill.storage`. Aucun de ces sélecteurs n'est dans l'arbre, et
> `stoveStylesPart2` n'existe nulle part dans `src/` : c'était un brouillon de
> conception, pas la feuille livrée. Le plan ci-dessous est relevé sur
> `src/cards/stove/styles.ts`.

### Les zones de la feuille livrée

La feuille suit l'ordre du DOM rendu, chaque zone sous sa propre bannière :

| Bannière dans `styles.ts` | Ce qu'elle habille | Sélecteurs propres à la zone |
|---|---|---|
| `CONTAINER` | l'enveloppe de la carte | `.container` |
| `HEADER` | la ligne de nom | `.header` |
| `CONTENT` | l'illustration + le panneau d'info | `.content`, `.info` |
| `Zones e (top / bottom)` | les deux rangées encadrant la zone médiane — jauges en bas, puissances en haut | `.e.top-path`, `.e.bottom-path`, `.quantities` |
| `Power cells` | les puissances instantanée et nominale | `.powers`, `.power` |
| `Decorative display connector (circle + lines)` | le trait et le cercle de liaison | `.display`, `.circle`, `.h-path`, `.d-path` |
| `N/A quantity` | le repli d'une quantité absente | `.nothing` |
| `Middle zone` | la colonne statut + températures | `.m` |
| `Status + temperature rows` | les lignes statut / températures / pression | `.status`, `.temperature`, `.label`, `.no-temp`, et les classes de couleur `.off`, `.amber`, `.red`, `.green`, `.blue`, `.high`, `.medium` |
| `Status label, rendered by _renderStatus` | le libellé d'état | `.stove-status` |
| `BOTTOM` | la barre de contrôles | `.bottom` |

Les jauges ne sont pas des règles CSS de cette feuille : ce sont les composants
`sf-circle-progress-bar` (quantité de granulés) et `sf-stack-bar` (stock), qui
portent leur propre feuille.

### Ce que la feuille gèle

Un seul sélecteur de cette feuille est un contrat : **`.stove-status`**, nommé
en tête du module (`sci-fi-stove.ts:12` — « CSS selector required by tests »).
Les quatre classes que cette spec gelait autrefois — `.sensor-tile`,
`.sensor-tile.warn`, `.bar-fill.pellet`, `.bar-fill.storage` — ont été
supprimées le 2026-08-12 (bead `ha-sci-fi-9xf`), et `styles.ts:300-305` porte
le commentaire qui dit pourquoi : elles n'étaient rendues par aucun template et
aucun test ne les lisait.

---

## sci-fi-stove.ts — la structure rendue

> **Réécrit le 2026-11-01** — lot fix `specs-design-abandonne`, O4 (bead
> `ha-sci-fi-zdw.4`). Cette section décrivait un import `stoveStylesPart2`, une
> grille `.sensors-grid` et quatre méthodes — `_buildSensorTiles()`,
> `_renderSensorTile()`, `_renderPelletBar()`, `_renderStorageCounter()` —
> présentées comme « unchanged ». Mesure : `grep -rl` rend **zéro** fichier de
> `src/` pour chacun des cinq symboles. Rien de cela n'a été construit. Ce qui
> suit est la structure réellement rendue.

### Imports de style

```ts
static override styles = [sciFiCommonStyles, stoveStyles];
```

`sciFiCommonStyles` reste la première entrée : elle fournit les jetons `--sf-*`,
le socle `ha-card` et la requête de conteneur. `stoveStyles` surcharge par
dessus — et c'est le seul export de `styles.ts`.

### renderCard()

```ts
return html`
  <ha-card>
    <div class="container">
      ${this._renderHeader(stoveState.attributes.friendly_name ?? msg('Stove'))}
      ${this._renderContent(stoveState)}
      ${this._renderBottom(stoveState)}
    </div>
    <sf-toast></sf-toast>
  </ha-card>
`;
```

Trois zones, pas de grille de tuiles :

```
ha-card
├── .container
│   ├── .header                      — _renderHeader : le friendly_name, rien d'autre
│   ├── .content                     — _renderContent
│   │   ├── sf-stove-image           — l'illustration SVG, state=${stoveState.state}
│   │   └── .info
│   │       ├── .e.bottom-path       — _renderTopZone : les deux jauges
│   │       │   ├── .display         — .circle, .h-path, .d-path
│   │       │   └── .quantities
│   │       │       ├── sf-circle-progress-bar   — _renderPelletQuantity
│   │       │       └── sf-stack-bar             — _renderPelletStock
│   │       ├── .m                   — _renderMiddleZone
│   │       │   ├── .display         — .circle, .h-path
│   │       │   └── .temperatures    — cinq lignes, dans cet ordre
│   │       │       ├── .temperature         — _renderTimeToService
│   │       │       ├── .status.<couleur>    — _renderStatus (§ Header et ligne de statut)
│   │       │       ├── .temperature         — _renderTemperature, externe
│   │       │       ├── .temperature         — _renderTemperature, interne
│   │       │       └── .temperature         — _renderPressure
│   │       └── .e.top-path          — _renderPowerZone
│   │           ├── .display         — .circle, .h-path, .d-path
│   │           └── .powers          — _renderPower ×2, puis _renderFan
│   └── .bottom                      — _renderBottom (§ Barre inférieure)
└── sf-toast                         — le retour des appels de service
```

> ⚠ Les deux noms de classe sont contre-intuitifs et c'est le code qui
> tranche : `_renderTopZone` — les jauges — rend `class="e bottom-path"`
> (`sci-fi-stove.ts:166`), et `_renderPowerZone` rend `class="e top-path"`
> (`:314`). Le nom décrit le tracé décoratif qui relie la zone au reste, pas sa
> position. La première rédaction de cet arbre, le 2026-11-01, les avait
> inversés — réintroduisant dans la correction la classe de défaut que ce lot
> existe pour supprimer. Un cas épingle désormais chaque zone sur la classe que
> sa méthode rend.

Un capteur absent n'est pas rendu : chaque méthode de zone garde son
`this.hass.states[...]` et retombe sur `.nothing` / `.no-temp` plutôt que sur
une tuile masquée.

---

## Barre inférieure — les contrôles interactifs

> **Ajouté le 2026-11-01** — lot fix `specs-design-abandonne`, O9 (bead
> `ha-sci-fi-zdw.9`). Cette zone est rendue et testée depuis la livraison, et
> n'apparaissait dans aucune ligne Blueprint, aucun TC et aucune ligne de
> l'Error Handling Matrix : tout correctif porté sur elle l'aurait été contre
> aucune spécification.

`_renderBottom` (`sci-fi-stove.ts:353-397`) rend trois contrôles dans `.bottom`.
Les trois écrivent, et chacun confirme par un `sf-toast` — succès ou message
d'erreur du service.

| Contrôle | Composant | Source des items | Service appelé |
|---|---|---|---|
| Mode | `sf-button-card-select`, `position="bottom"` | `attributes.hvac_modes`, icône par `HVAC_ICONS[m]`, repli `mdi:information-off-outline` | `climate.set_hvac_mode` |
| Température | `sf-wheel` | `min_temp` (défaut 15) à `max_temp` (défaut 30), pas de 1, libellés `${t}°C` | `climate.set_temperature` |
| Mode éco | trois branches — voir § Mode éco | `switch.*_eco_mode`, sinon `attributes.preset_modes`, sinon rien | `switch.toggle`, sinon `climate.set_preset_mode` |

Deux points de contrat qui ont chacun coûté un défaut :

- **La molette se lie par propriété, arrondie.** `.selectedId="${String(Math.round(targetTemp))}"` :
  une liaison d'attribut passe une chaîne, et une température flottante (20.5)
  ne correspond alors à aucun item entier — la molette s'affiche vide
  (correction C10).
- **L'entité cible est lue sur l'attribut, avec repli sur la config.**
  `stoveState.attributes.entity_id ?? this.config.entity`, pour les
  installations où l'entité `climate` expose l'identifiant de l'appareil piloté.

La température cible est `attributes.temperature ?? attributes.current_temperature ?? 20`.

---

## Test Selectors — Frozen Contract

> **Réécrit le 2026-11-01** — lot fix `specs-design-abandonne`, O5 (bead
> `ha-sci-fi-zdw.5`). Cette section gelait douze lignes dont **aucune**
> n'existait dans le fichier de test qu'elle citait : `grep -c` dans
> `tests/cards/stove/sci-fi-stove.test.ts` rend 0 pour `bar-fill`,
> `sensor-tile`, `1500 W` et `2 / 10`, et les numéros de ligne gelés (L71 à
> L175) pointaient du code sans rapport. Un contrat gelé qui ne gèle rien
> autorise exactement ce qu'il prétend interdire.
>
> Les lignes de numéro ne sont pas réécrites : un numéro de ligne se périme au
> premier `it()` inséré au-dessus, et c'est ce qui a périmé la table
> précédente. Le contrat porte sur des **noms**, que le test nomme aussi.

> [!CAUTION]
> Les sélecteurs ci-dessous sont lus par `tests/cards/stove/sci-fi-stove.test.ts`.
> Les renommer casse le test, pas seulement le rendu.

| Sélecteur gelé | Ce que le test en lit | Cas |
|---|---|---|
| `.stove-status` | le libellé d'état, `textContent` | TC-STOVE-U-1103, TC-STOVE-U-1104, TC-STOVE-U-1114 |
| `.status` + sa classe de couleur (`off`, `amber`, `red`, `green`, `blue`) | la classe présente sur la ligne de statut | TC-STOVE-U-1103, TC-STOVE-U-1104 |
| `sf-icon[icon="sci:stove-heat"]` / `sf-icon[icon="sci:stove-off"]` | l'icône choisie par `STATUS_ICONS` | TC-STOVE-U-1101, TC-STOVE-U-1102 |
| `.header` | le `friendly_name`, ou son repli localisé | TC-STOVE-U-1105, TC-STOVE-U-1115 |
| `sf-stove-image`, `sf-circle-progress-bar`, `sf-stack-bar` | la présence des composants de la zone contenu | IT-STOVE-I-1102 |

Les quatre classes que cette table gelait autrefois — `.sensor-tile`,
`.sensor-tile.warn`, `.bar-fill.pellet`, `.bar-fill.storage` — ne sont pas
gelées : elles ont été supprimées le 2026-08-12 avec les lignes de test qui
les promettaient (bead `ha-sci-fi-9xf`), et aucun rendu ne les produit.

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Renommer `.stove-status` ou une classe de couleur de `.status`** | Renommer `.stove-status`, ou `.status.off|amber|red|green|blue` | Ces noms sont le contrat de § Test Selectors. Les quatre classes de tuiles que cette ligne gelait autrefois (`.sensor-tile`, `.sensor-tile.warn`, `.bar-fill.pellet`, `.bar-fill.storage`) ont été supprimées le 2026-08-12 avec les lignes de test qui les promettaient : les remettre serait du CSS mort |
| 2 | **Déplacer l'icône de statut hors de `_renderStatus`** | Rendre l'icône du poêle ailleurs que dans `.status` | L'icône, le libellé et la couleur sont une seule unité : `STATUS_ICONS[status]` donne les deux, et la classe de couleur colore les deux |
| 3 | **Inline CSS in `sci-fi-stove.ts`** | Re-adding `css\`...\`` block inside the card file | All card CSS goes in `styles.ts` |
| 4 | **Remplacer un littéral de couleur d'état ou d'illustration par un jeton chaîné sur le thème** | Passer `#4caf50` (statut `eco`) ou une couleur de `sf-stove-image` en `var(--sf-primary)` | Les laisser. ADR-018 § Decision range le poêle parmi les illustrations à littéraux, et ses points 1 et 3 disent « No theme-chained token replaces a hardcoded colour » et « No substitution is performed ». `styles.ts` en porte 14 lignes hors repli, toutes légales. Ce qui reste interdit : un littéral là où un jeton **chaîné** existe déjà — cadre, accent primaire, texte |
| 5 | **Changing the icon binding to attribute** | `icon="${...}"` instead of `.icon="${...}"` | Must use Lit property binding `.icon=` (ADR in 'architecture.md' § sf-icon Binding Rule) |
| 6 | **Lier la molette de température par attribut, ou sans arrondi** | `selected-id="${t}"`, ou `.selectedId="${t}"` sur une température flottante | `.selectedId="${String(Math.round(t))}"` — une température à 20,5 ne correspond sinon à aucun item entier et la molette s'affiche vide (correction C10) |
| 7 | **Rendre un contrôle au-dessus d'une liste vide** | Rendre le bouton éco quand ni `switch_eco_mode` ni `preset_modes` n'est disponible | Ne rien rendre — § Mode éco, troisième branche. Un bouton qui n'ouvre rien est pire qu'un bouton absent |
| 8 | **Mutating config** | `this.config.entity = '...'` | Always immutable — read-only access only |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-STOVE-U-1101 | Unit | La ligne de statut rend `sf-icon` avec `sci:stove-heat` en combustion | `sensor_status: 'combustion'` | `sf-icon[icon="sci:stove-heat"]` présent |
| TC-STOVE-U-1102 | Unit | La ligne de statut rend `sf-icon` avec `sci:stove-off` à l'arrêt | `sensor_status: 'off'` | `sf-icon[icon="sci:stove-off"]` présent |
| TC-STOVE-U-1103 | Unit | La ligne de statut porte sa classe de couleur en combustion | `sensor_status: 'combustion'` | `.status.red` présent, `.stove-status` = `combustion` |
| TC-STOVE-U-1104 | Unit | La ligne de statut porte sa classe de couleur à l'arrêt | `sensor_status: 'off'` | `.status.off` présent, `.stove-status` = `off` |
| TC-STOVE-U-1105 | Unit | `friendly_name` appears in header info | `attributes.friendly_name: 'Poêle Salon'` | textContent includes `'Poêle Salon'` |
| TC-STOVE-U-1111 | Unit | Error message when entity not found; config without `entity` refused | `entity: 'climate.missing'`, hass empty; then `setConfig({ type })` without `entity` | textContent includes `'Entité poêle non trouvée'`; `setConfig({ type })` throws `'You need to define an entity'` (decision 2026-11-04) |
| TC-STOVE-U-1113 | Unit | `styles.ts` exports `stoveStyles` as a Lit CSSResult | Import check | `typeof stoveStyles === 'object'` with `cssText` property |
| TC-STOVE-U-1114 | Unit | Le repli de libellé d'un statut absent de `STATUS_LABELS` remplace **tous** les underscores | `sensor_status: 'some_unknown_state'` | `.stove-status` = `some unknown state` (et non `some unknown_state`) |
| TC-STOVE-U-1115 | Unit | Le repli d'en-tête d'une entité sans `friendly_name` est **localisé** — il suit la langue de HA, il n'est pas un littéral | Entité sans `friendly_name`, `hass.locale.language` = `fr` puis `en` | `.header` = « Poêle » sous `fr`, `Stove` sous `en` |
| IT-STOVE-I-1101 | Integration | `sci-fi-stove` registers correctly in `customElements` | Load 'sci-fi.min.js' | `customElements.get('sci-fi-stove')` returns the class |
| IT-STOVE-I-1102 | Integration | Rend l'en-tête, le panneau info et la ligne de statut depuis un hass réel | Mount `state: 'heat'`, `sensor_status: 'combustion'`, pellets + stock | `.header` porte le `friendly_name`, `.content .info`, `sf-stove-image`, `sf-circle-progress-bar`, `sf-stack-bar` et `.stove-status` présents |
| IT-STOVE-I-1103 | Integration | `styles.ts` imported — no inline `css\`\`` block remains in `sci-fi-stove.ts` | Grep source file | 'grep -c 'css\'' sci-fi-stove.ts` returns 0 |

> [!NOTE]
> **Révision du 2026-08-12** (bead `ha-sci-fi-9xf`). Cette table décrivait un *new header
> design* dont une partie n'a jamais été construite. Ce qui a changé :
>
> Les identifiants retirés ne sont pas réécrits ci-dessous : le contrôle de couverture P14
> lit tout ID présent dans une spec comme une promesse à tenir, y compris dans une note
> de suppression.
>
> - **Lignes unitaires 1101 à 1104** — reformulées. Le comportement décrit est réel, mais
>   il vit dans la ligne de statut (`_renderStatus`), pas dans un en-tête, et les classes
>   sont `.status.<couleur>` (off / amber / red / green / blue), pas `.sf-state-on|off`.
> - **Lignes unitaires 1106 à 1109** — retirées. `.sensor-tile`, `.sensor-tile.warn`,
>   `.bar-fill.pellet` et `.bar-fill.storage` n'existaient qu'en CSS mort dans
>   `styles.ts`, sous le commentaire « required by tests — legacy compatibility », pour
>   des tests jamais écrits. Aucun rendu ne les produit : les jauges sont
>   `sf-circle-progress-bar` et `sf-stack-bar`. Le CSS a été supprimé avec les lignes.
> - **Ligne unitaire 1110** — retirée. `header_message` n'existe ni dans
>   `SciFiStoveConfig` ni dans la carte, et la classe `.sf-header` n'existe pas. À
>   réintroduire *avec* la fonctionnalité si on la veut, par cohérence avec les cartes
>   lights et climates.
> - **Ligne de régression 1112** — retirée. « Tous les tests existants passent » est une
>   porte de régression, pas un cas de test : lui donner un ID la rendait circulaire.
> - **Ligne d'intégration 1102** — reformulée sur les sélecteurs réels.

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Config without `entity` (key absent, or not a non-empty string) | `validateConfig()` override, called by `setConfig()` | Throws `Error('You need to define an entity')` — the standard HA refusal; Lovelace renders its own configuration-error card | None — user must fix config. Amended 2026-11-04 (user decision, fix lot stove-bridge O2, bead ha-sci-fi-bnf): the card no longer accepts the config to fail at render with « … : undefined » |
| Entity not found (`this.hass.states[this.config.entity]` undefined) | Guard at top of `renderCard()` | Return error `<ha-card>` with a localized message — « Entité poêle non trouvée : <entity> » under `fr`, `Stove entity not found: <entity>` in the source locale | None — user must fix config |
| Capteur absent de `hass` | Garde dans la méthode de zone qui le lit (`_renderTopZone`, `_renderMiddleZone`, `_renderPowerZone`) | La cellule rend son repli — `.nothing` pour une quantité, `.no-temp` pour une température | Rien de trompeur : l'absence se voit |
| État du capteur de granulés non numérique | Garde `isNaN` dans `_renderPelletQuantity` | La jauge `sf-circle-progress-bar` n'est pas rendue | Zone vide plutôt qu'une jauge à `NaN%` |
| Capteur de granulés publié en ratio (0–1) | `normalizePelletPct` (`src/utils/pellet.ts`), partagé avec `sf-bridge-stove` | Une valeur ≤ 1 est un ratio (×100), au-delà un pourcentage ; bornée à 0–100 et arrondie | Amendé le 2026-11-04 (décision utilisateur, lot fix stove-bridge O1, bead ha-sci-fi-15v) : la carte et le bridge lisent la même entité de la même façon |
| Service `climate.*` ou `switch.toggle` en échec | `.catch` sur la promesse de `callService` | `sf-toast` en erreur, portant le message du service | L'état affiché reste celui de `hass` — rien n'est supposé appliqué |
| No `hass` available | `SciFiBaseCard` base class guard before `renderCard()` is called | Base class returns empty template | Transparent empty card |
| Missing `friendly_name` attribute | Nullish coalescing on a localized fallback in the header | Show « Poêle » under `fr`, `Stove` in the source locale | Always renders something |

---

## Deep Links

| Reference | Location |
|---|---|
| Existing stove card implementation | [sci-fi-stove.ts](../../../src/cards/stove/sci-fi-stove.ts#L1) |
| Climate styles pattern to follow | [climates/styles.ts](../../../src/cards/climates/styles.ts#L1) |
| Light card CSS patterns | [sci-fi-lights.ts](../../../src/cards/lights/sci-fi-lights.ts#L1) |
| Common tokens source | [styles/common.ts](../../../src/styles/common.ts#L1) |
| Existing stove tests (frozen selectors) | [sci-fi-stove.test.ts](../../../tests/cards/stove/sci-fi-stove.test.ts#L1) |
| Config types contract | [Spec 05 § sci-fi-stove](../05_cards.md#sci-fi-stove) |
| sf-icon binding rule | [architecture.md § sf-icon Binding Rule](../../CODEMAPS/architecture.md#sf-icon-binding-rule) |
| ADR-018 palette fixed identity | [ADR-018](../../adr/ADR-018_palette-fixed-identity.md) |
| ADR-005 zero-breaking-change contract | [Spec 05 L6](../05_cards.md#L6) |


## Adversarial Fixes: Edge Cases

| # | Attendu | État |
|---|---|---|
| 1 | Quand `entity.state` vaut `unavailable` ou `unknown`, la carte désactive ses contrôles et rend un état visuel distinct (surcouche « Offline ») | ⬜ **non livré** — aucune branche de `sci-fi-stove.ts` ne lit `'unavailable'` ni `'unknown'` au niveau de la carte, et aucun cas ne l'exerce. Cette ligne était un MUST sans implémentation ni test : la laisser au présent de l'indicatif, c'était promettre un comportement que la carte n'a pas. Suivi par le bead `ha-sci-fi-zdw` |

Le repli réel aujourd'hui : un capteur absent ou non numérique n'est pas rendu
(§ Error Handling Matrix), et une entité `climate` absente de `hass` rend la
carte d'erreur. Un `unavailable` traverse donc l'affichage comme une valeur
d'état ordinaire — `STATUS_ICONS` ne le connaît pas, il tombe sur
`sci:stove-unknow` et la couleur `off`.
