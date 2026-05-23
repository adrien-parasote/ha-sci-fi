# ha-sci-fi v2 — Implementation Plan

> Stream Coding · SPEC gate · May 2026
> Branch: `v2` (main stays untouched)

---

## Context

Full rewrite of ha-sci-fi (8 custom HA cards) from vanilla JavaScript to TypeScript state-of-the-art.
All gaps resolved. All ADRs accepted. Ready for BUILD.

**References:**
- [Discovery report](./research/discovery.md)
- [Strategic blueprint](./strategic/blueprint.md)

---

## User Review Required

> [!IMPORTANT]
> **Breaking YAML changes** — All 8 card configurations will change in v2.0.0.
> A `MIGRATION.md` will be produced before the first HACS release.
> The `main` branch stays untouched; all work is on the `v2` branch.

> [!CAUTION]
> **`House` model supprimé** — L'objet `House` est remplacé par des sélecteurs purs
> (`getFloors(hass)`, `getAreas(hass, floorId)`, etc.). Les cartes composent leurs données
> directement depuis `hass.areas`, `hass.floors`, `hass.devices`, `hass.entities`.
> C'est plus performant, plus testable, et élimine le couplage centralisé.

---

## Proposed Changes

---

### Step 1 — Infrastructure & Tooling

> Objective: Branche `v2`, TypeScript strict, Rollup 4, dev server automatisé, CI.

#### [NEW] `tsconfig.json`
TypeScript 5.x strict, `experimentalDecorators: true`, `useDefineForClassFields: false` (requis Lit), target ES2021.

#### [MODIFY] `rollup.config.mjs`
- Rollup 2 → 4
- Input: `src/sci-fi.ts`
- Plugin `@rollup/plugin-typescript` remplace la pré-compilation externe
- Plugin `@rollup/plugin-replace` remplace le swap `const.js.PROD`
- `sourcemap: true` en dev uniquement

#### [MODIFY] `package.json`
```
Ajouts:  @rollup/plugin-typescript, @rollup/plugin-replace, @web/dev-server,
         @web/test-runner, @open-wc/testing, custom-card-helpers, typescript,
         eslint, @typescript-eslint/eslint-plugin, chai

Suppressions: lodash-es, memoize-one, es-dev-server, rollup (v2)

Scripts:
  "dev":         "web-dev-server + rollup --watch (rebuild auto)"
  "test":        "web-test-runner"
  "test:watch":  "web-test-runner --watch"
  "typecheck":   "tsc --noEmit"
  "lint":        "eslint src tests --ext .ts"
  "build":       "rollup -c --environment NODE_ENV:production"
```

#### [NEW] `.eslintrc.json`
`@typescript-eslint` + règles: `eqeqeq`, `no-var`, `prefer-const`, `@typescript-eslint/no-explicit-any`.

#### [NEW] `web-test-runner.config.mjs`
`@web/test-runner` avec Chromium, `@open-wc/testing`, coverage activé.

#### [NEW] `.devcontainer/devcontainer.json`
VS Code DevContainer avec Home Assistant dev instance.
Port 8123 exposé. Rollup en watch mode. Hot-reload automatique dans HA.

#### [NEW] `.github/workflows/ci.yml`
```yaml
jobs:
  build-and-test: [typecheck, lint, test, build]
  hacs-validate: [hacs/action@main]
```

---

### Step 2 — Types & Domain Model (nouveau)

> Objective: Remplacer `helpers/entities/` par des sélecteurs purs et des types TypeScript stricts.
> Testable sans browser, sans HA réel.

#### [NEW] `src/types/ha.ts`
Interfaces HA: `HassFloor`, `HassArea`, `HassDevice`, `HassEntityEntry` (registres modernes).

#### [NEW] `src/types/config.ts`
Interfaces config typées par carte:
`SciFiHexaTilesConfig`, `SciFiLightsConfig`, `SciFiClimatesConfig`, `SciFiPlugsConfig`,
`SciFiWeatherConfig`, `SciFiStoveConfig`, `SciFiVehiclesConfig`, `SciFiVacuumConfig`.

#### [NEW] `src/selectors/floor.selectors.ts`
```typescript
export const getFloors = (hass: HomeAssistant): readonly HassFloor[]
export const getFloorById = (hass: HomeAssistant, id: string): HassFloor | undefined
```

#### [NEW] `src/selectors/area.selectors.ts`
```typescript
export const getAreas = (hass: HomeAssistant): readonly HassArea[]
export const getAreasByFloor = (hass: HomeAssistant, floorId: string): readonly HassArea[]
```

#### [NEW] `src/selectors/entity.selectors.ts`
```typescript
export const getEntitiesByArea = (hass: HomeAssistant, areaId: string): readonly HassEntityEntry[]
export const getLightEntities = (hass: HomeAssistant, areaId?: string): readonly HassEntity[]
export const getClimateEntities = (hass: HomeAssistant, areaId?: string): readonly HassEntity[]
// + switch, vacuum, weather, sensor, cover par domaine
```

#### [NEW] `src/selectors/device.selectors.ts`
```typescript
export const getDevicesByArea = (hass: HomeAssistant, areaId: string): readonly HassDevice[]
```

#### [DELETE] `src/helpers/entities/house.js` + tous les entity files

#### [NEW] `tests/selectors/floor.selectors.test.ts`
#### [NEW] `tests/selectors/area.selectors.test.ts`
#### [NEW] `tests/selectors/entity.selectors.test.ts`
#### [NEW] `tests/fixtures/mock-hass.ts`
```typescript
export function mockHass(overrides?: Partial<HomeAssistant>): HomeAssistant
export function mockHassWithFloors(floors: HassFloor[], areas: HassArea[]): HomeAssistant
export function mockHassWithLights(lights: Partial<HassEntity>[]): HomeAssistant
```

---

### Step 3 — Base Classes & Shared Styles

> Objective: `SciFiBaseCard` et `SciFiBaseEditor` en TypeScript avec décorateurs Lit.

#### [MODIFY] `src/utils/base-card.ts` (ex `base-card.js`)
```typescript
export abstract class SciFiBaseCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  protected render() {
    try {
      if (!this.hass) return nothing;
      return this.renderCard();
    } catch (err) {
      console.error(`[${this.tagName}] Render error:`, err);
      return html`<div class="error">⚠️ Card error — see console</div>`;
    }
  }

  protected abstract renderCard(): TemplateResult;
  public abstract setConfig(config: unknown): void;
  public abstract getCardSize(): number;
}
```

#### [MODIFY] `src/utils/base-editor.ts` (ex `base_editor.js`)
- Décorateurs `@property`, `@state`
- Labels extraits dans `src/locales/labels.ts` (supprime la mega-fonction `getLabel()`)

#### [MODIFY] `src/styles/common.ts` (ex `common_style.js`)
#### [MODIFY] `` (ex `editor_common_style.js`)

---

### Step 4 — Shared Components Rewrite

> Objective: Tous les composants `sf-*` migrés TypeScript.
> `sf-radiator` découpé en 4 composants `@customElement` indépendants.

#### [MODIFY] `src/components/sf-icon/sf-icon.ts`
Cache encapsulé, types stricts `iconPrefix` / `iconName`.

#### [NEW] `src/components/sf-icon/icon-cache.ts`
```typescript
const cache = new Map<string, IconData>();
export const getCachedIcon = (name: string): IconData | undefined => cache.get(name);
export const setCachedIcon = (name: string, data: IconData): void => { cache.set(name, data); };
```

#### [MODIFY] `src/components/sf-radiator/` — DÉCOUPAGE 4 composants
```
sf-radiator.ts              # Container principal (< 150 lignes)
sf-radiator-header.ts       # Température + icon + état
sf-radiator-controls.ts     # Boutons chaud/froid/off + slider température
sf-radiator-schedule.ts     # Timeline planning hebdomadaire
style.ts                    # CSS partagé du module
```
Chaque fichier = `@customElement` enregistré — réutilisable indépendamment.

#### [MODIFY] Tous les autres composants → TypeScript
`sf-accordion`, `sf-tabs`, `sf-toast`, `sf-toggle-switch`,
`sf-circle-progress-bar`, `sf-hexa-row`, `sf-tiles`,
`sf-stove`, `sf-landspeeder`, `sf-person`, `sf-wheel`,
`buttons/*`, `inputs/*`

#### [NEW] `tests/components/sf-radiator.test.ts`
#### [NEW] `tests/components/sf-toggle-switch.test.ts`
#### [NEW] `tests/components/sf-icon.test.ts`

---

### Step 5 — Cards Rewrite (8 cartes)

> Pattern établi sur `sci-fi-lights` (carte la plus complexe) puis répliqué.

#### Règles communes à toutes les cartes
- `@customElement('sci-fi-<name>')` dans `card.ts` (supprime `import.ts`)
- `setConfig()` → copie immutable `{ ...config }`
- `render()` → hérité de `SciFiBaseCard` (error boundary inclus)
- `window.customCards.push()` dans `card.ts`
- Zéro `unsafeHTML` → `repeat()` partout
- Zéro `var`, zéro `==`

---

#### [MODIFY] `src/cards/hexa_tiles/card.ts`
Breaking YAML changes:
```yaml
# v1 → v2
entity: light.x  →  entity_id: light.x
# Nouveau: tap_action / hold_action standardisés HA
```

#### [MODIFY] `src/cards/lights/card.ts`
Breaking YAML changes:
```yaml
ignored_entities  →  ignored_entity_ids
custom_entities   →  entity_overrides
```

#### [MODIFY] `src/cards/climates/card.ts`
#### [MODIFY] `src/cards/plugs/card.ts`
#### [MODIFY] `src/cards/weather/card.ts`
#### [MODIFY] `src/cards/stove/card.ts`
#### [MODIFY] `src/cards/vacuum/card.ts`
#### [MODIFY] `src/cards/vehicles/card.ts`

#### Editors (toutes les cartes)
#### [MODIFY] `src/cards/*/editor.ts`
- `ha-selector` pour les entity pickers (standard HA 2025)
- Supprimer `getLabel()` → `src/locales/labels.ts`

#### Tests cards
#### [NEW] `tests/cards/lights.test.ts`
#### [NEW] `tests/cards/hexa-tiles.test.ts`
#### [NEW] `tests/cards/climates.test.ts`

---

### Step 6 — Entry Point, Icons, i18n & Migration Doc

#### [MODIFY] `src/sci-fi.ts`
- Import des cartes uniquement (auto-enregistrement via `@customElement`)
- `console.info` version
- Plus de `customElements.define()` centralisé

#### [MODIFY] `src/components/icons/sf-iconset.ts`
Migré TypeScript, types pour `window.customIcons`.

#### [MODIFY] `src/locales/`
Re-génération `@lit/localize` sur le setup TS, labels v2 ajoutés.

#### [NEW] `MIGRATION.md` (racine du projet)
Tableau complet par carte:

| Carte | Champ v1 | Champ v2 | Note |
|-------|---------|---------|------|
| Toutes | `entity` | `entity_id` | Cohérence avec HA |
| lights | `ignored_entities` | `ignored_entity_ids` | Cohérence HA |
| lights | `custom_entities` | `entity_overrides` | Clarté |
| ... | ... | ... | ... |

Avec exemple YAML complet avant/après pour chaque carte.

---

## Verification Plan

### Automated Tests (CI)
```bash
npm run typecheck   # 0 erreurs TypeScript strict
npm run lint        # 0 warnings ESLint
npm test            # ≥ 80% coverage domain + composants
npm run build       # dist/sci-fi.min.js généré sans erreur
```

### Manual Verification (par carte)
1. Déployer `dist/sci-fi.min.js` dans `/config/www/`
2. Vérifier rendu visuel dans dashboard HA
3. Vérifier editor UI dans HA (ha-selector entity picker)
4. Vérifier interactions (toggle, navigation, service calls)
5. Vérifier MIGRATION.md : configs v1 migrées fonctionnent en v2

### HACS Gate
GitHub Actions `hacs/action@main` doit passer ✅ avant tag `v2.0.0`.

---

## Sequence Dependencies

```
Step 1 (Infra: TS + Rollup 4 + CI)
    ↓
Step 2 (Types + Sélecteurs — tests unitaires)
    ↓
Step 3 (Base classes SciFiBaseCard/Editor)
    ↓
Step 4 (Composants partagés — sf-radiator découpé)
    ↓
Step 5 (Cards — séquence: lights → hexa-tiles → climates → plugs → weather → stove → vehicles → vacuum)
    ↓
Step 6 (Entry + Icons + i18n + MIGRATION.md)
    ↓
Merge v2 → main + tag v2.0.0
```

Steps 1-3 sont bloquants pour tout le reste.
Steps 4-5 peuvent se paralléliser par composant/carte une fois Step 3 terminé.
