# ha-sci-fi v1.0.0 — Implementation Plan

> Stream Coding · SPEC gate · Révisé 2026-05-24
> Branch: `v1.0.0-wip` (main = v0.9.6 stable, untouched)

---

## Context

Full rewrite of ha-sci-fi (8 custom HA cards) from vanilla JavaScript to TypeScript state-of-the-art.

**References :**
- [Discovery](./research/discovery.txt) ← **Source de vérité absolue pour les schémas YAML**
- [Strategic blueprint](./strategic/blueprint.md)
- Backups YAML production : `yaml backup/*.yaml` dans le workspace HA

---

## ⛔ Contrainte Absolue — Zero Breaking YAML Changes (ADR-005)

> [!CAUTION]
> **AUCUN champ de config YAML ne peut être renommé ou supprimé.**
> Les noms de champs sont un contrat public avec les dashboards en production.
> Source de vérité : `docs/research/discovery.txt` §2 + `src/cards/*/config-metadata.js` v0.9.6.
>
> Champs GELÉS (exemples critiques) :
> - `entity` (vacuum, stove) — **PAS** `entity_id`
> - `weather_entity` (hexa-tiles, weather) — **PAS** `weather_entity_id`
> - `weather_alert_entity` — **PAS** `weather_alert_entity_id`
> - `ignored_entities` (lights) — **PAS** `ignored_entity_ids`
> - `custom_entities` (lights) — **PAS** `entity_overrides`
> - `entities_to_exclude` (climates) — **PAS** `excluded_entity_ids`
> - `mop_intensite` (vacuum) — **PAS** `mop_intensity`
> - `shortcuts` (vacuum) — feature complète, à NE PAS supprimer
> - `state_icons`, `state_colors`, `mode_icons`, `mode_colors` (climates) — à NE PAS supprimer
> - `alert` (weather) — section complète, à NE PAS supprimer
> - `storage_counter`, `pellet_quantity_threshold`, `storage_counter_threshold` (stove) — à NE PAS supprimer

---

## User Review Required

> [!IMPORTANT]
> **Zéro breaking change YAML** — Contrairement à la v1.0.0-wip, cette release ne casse aucune configuration existante. Les dashboards `yaml backup/*.yaml` doivent fonctionner sans modification.

> [!IMPORTANT]
> **`config-metadata.ts` est conservé** — Le système de validation déclaratif est migré en TypeScript typé, pas remplacé par Zod. L'éditeur HA reste piloté par ce schéma.

---

## Proposed Changes

---

### Step 1 — Infrastructure & Tooling

> Objective: Branche `v1.0.0-wip`, TypeScript strict, Rollup 4, dev server automatisé, CI.

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
         eslint, @typescript-eslint/eslint-plugin

Suppressions: lodash-es, memoize-one, es-dev-server, rollup (v2)

Scripts:
  "dev":         "web-dev-server + rollup --watch (rebuild auto)"
  "test":        "web-test-runner"
  "test:watch":  "web-test-runner --watch"
  "typecheck":   "tsc --noEmit"
  "lint":        "eslint src tests --ext .ts"
  "build":       "rollup -c --environment NODE_ENV:production"
  "build:dev":   "rollup -c --environment NODE_ENV:development"
```

#### [NEW] `.eslintrc.json`
`@typescript-eslint` + règles: `eqeqeq`, `no-var`, `prefer-const`, `@typescript-eslint/no-explicit-any`.

#### [NEW] `web-test-runner.config.mjs`
`@web/test-runner` avec Chromium, `@open-wc/testing`, coverage activé.

#### [NEW] `.github/workflows/ci.yml`
```yaml
jobs:
  build-and-test: [typecheck, lint, test, build]
  hacs-validate: [hacs/action@main]
```

---

### Step 2 — Types & Domain Model

> Objective: Types TypeScript stricts pour tous les domaines HA.
> Règle absolue : les noms de champs dans les interfaces = noms exacts du `config-metadata.js` v0.9.6.

#### [NEW] `src/types/ha.ts`
Interfaces HA: `HassFloor`, `HassArea`, `HassDevice`, `HassEntityEntry` (registres modernes).

#### [NEW] `src/types/config.ts`
Interfaces config typées par carte — **noms de champs = EXACTEMENT ceux de `config-metadata.js`**.
Voir Spec 05 pour le contrat YAML complet par carte.

#### [MODIFY] `src/types/config-metadata.ts` (migré depuis `config-metadata.js`)
```typescript
type FieldType = 'string' | 'boolean' | 'number' | 'array' | 'object' | 'Boolean';

interface FieldMeta {
  readonly mandatory: boolean;
  readonly type: FieldType;
  readonly default?: unknown;
  readonly range?: { readonly min: number; readonly max: number };
  readonly data?: ConfigMetadata;
  readonly data_type?: 'string' | 'number' | 'object';
}

export type ConfigMetadata = Readonly<Record<string, FieldMeta>>;
```

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
```

#### [NEW] `tests/fixtures/mock-hass.ts`
```typescript
export function mockHass(overrides?: Partial<HomeAssistant>): HomeAssistant
export function mockHassWithFloors(floors: HassFloor[], areas: HassArea[]): HomeAssistant
export function mockHassWithLights(lights: Partial<HassEntity>[]): HomeAssistant
```

---

### Step 3 — Base Classes & Shared Styles

> Objective: `SciFiBaseCard` et `SciFiBaseEditor` en TypeScript avec décorateurs Lit.
> `config-metadata.ts` migré et typé — validation identique à v0.9.6.

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
  
  // Préserve le système de validation par config-metadata
  protected __validateConfig(config: unknown, metadata: ConfigMetadata): Record<string, unknown>;
}
```

#### [MODIFY] `src/utils/base-editor.ts` (ex `base_editor.js`)
- Décorateurs `@property`, `@state`
- Préserve le rendu piloté par `config-metadata.ts`

#### [MODIFY] `src/styles/common.ts` (ex `common_style.js`)
#### [MODIFY] `src/styles/editor-common.ts` (ex `editor_common_style.js`)

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

#### [MODIFY] Tous les autres composants → TypeScript
`sf-accordion`, `sf-tabs`, `sf-toast`, `sf-toggle-switch`,
`sf-circle-progress-bar`, `sf-hexa-row`, `sf-tiles`,
`sf-stove`, `sf-landspeeder`, `sf-person`, `sf-wheel`,
`buttons/*`, `inputs/*`

---

### Step 5 — Cards Rewrite (8 cartes)

> Règle absolue : les champs YAML restent exactement ceux de `config-metadata.js` v0.9.6.
> Voir Spec 05 pour les contrats YAML complets par carte.

#### Règles communes à toutes les cartes
- `@customElement('sci-fi-<name>')` dans `card.ts`
- `setConfig()` → copie immutable `{ ...config }`
- `render()` → hérité de `SciFiBaseCard` (error boundary inclus)
- `window.customCards.push()` dans `card.ts`
- Zéro `unsafeHTML` → `repeat()` partout
- Zéro `var`, zéro `==`
- **Champs YAML = noms exacts de `config-metadata.js` v0.9.6 — AUCUNE EXCEPTION**

#### [MODIFY] `src/cards/hexa_tiles/card.ts`
Config YAML **inchangée** (voir Spec 05 §YAML hexa-tiles) :
- `weather.weather_entity` (pas `weather_entity_id`)
- `weather.weather_alert_entity` (pas `weather_alert_entity_id`)
- `tiles[].entity` (pas `entity_id`)
- `tiles[].entity_kind` conservé

#### [MODIFY] `src/cards/lights/card.ts`
Config YAML **inchangée** :
- `ignored_entities` (pas `ignored_entity_ids`)
- `custom_entities` (pas `entity_overrides`)

#### [MODIFY] `src/cards/climates/card.ts`
Config YAML **inchangée** — `state_icons`, `state_colors`, `mode_icons`, `mode_colors` **TOUS CONSERVÉS**.

#### [MODIFY] `src/cards/plugs/card.ts`
Config YAML **inchangée** — `sensors` = dict keyed par entity_id avec `show/name/power` **CONSERVÉ**.

#### [MODIFY] `src/cards/weather/card.ts`
Config YAML **inchangée** — `weather_entity` (pas `weather_entity_id`), section `alert` **CONSERVÉE**.

#### [MODIFY] `src/cards/stove/card.ts`
Config YAML **inchangée** — `entity` (pas `entity_id`), tous les capteurs + seuils + `storage_counter` **CONSERVÉS**.

#### [MODIFY] `src/cards/vacuum/card.ts`
Config YAML **inchangée** — `entity` (pas `entity_id`), `mop_intensite` (pas `mop_intensity`), `shortcuts` **CONSERVÉ**.

#### [MODIFY] `src/cards/vehicles/card.ts`
Config YAML **inchangée** — tous les champs `battery_autonomy`, `fuel_autonomy`, `plug_state`, etc. **CONSERVÉS**.

#### Editors (toutes les cartes)
#### [MODIFY] `src/cards/*/editor.ts`
- Migration TypeScript
- Préserve le rendu piloté par `config-metadata.ts`
- `ha-selector` pour les entity pickers (standard HA 2025)

---

### Step 6 — Entry Point, Icons & i18n

#### [MODIFY] `src/sci-fi.ts`
- Import des cartes uniquement (auto-enregistrement via `@customElement`)
- `console.info` version
- Plus de `customElements.define()` centralisé

#### [MODIFY] `src/components/icons/sf-iconset.ts`
Migré TypeScript, types pour `window.customIcons`.

#### [MODIFY] `src/locales/`
Re-génération `@lit/localize` sur le setup TS.

> **Pas de MIGRATION.md** — zéro breaking change = pas de document de migration à produire.

---

## Verification Plan

### Automated Tests (CI)
```bash
npm run typecheck   # 0 erreurs TypeScript strict
npm run lint        # 0 warnings ESLint
npm test            # ≥ 80% coverage domain + composants
npm run build       # dist/sci-fi.min.js généré sans erreur
```

### YAML Contract Validation (Gate obligatoire)
Avant tout merge :
1. Diff `src/types/config.ts` contre `docs/research/discovery.txt` §2 — zéro champ manquant ou renommé
2. Tester chaque `yaml backup/*.yaml` contre la nouvelle version → 8/8 doivent charger sans erreur

### Manual Verification (par carte)
1. Copier `dist/sci-fi.min.js` dans `/config/www/`
2. Vérifier rendu visuel dans dashboard HA
3. Vérifier editor UI dans HA (entity pickers)
4. Vérifier interactions (toggle, navigation, service calls)
5. **Vérifier les configs de `yaml backup/*.yaml` fonctionnent sans modification**

### HACS Gate
GitHub Actions `hacs/action@main` doit passer ✅ avant tag `v1.0.0`.

---

## Sequence Dependencies

```
Step 1 (Infra: TS + Rollup 4 + CI)
    ↓
Step 2 (Types + config-metadata.ts + Sélecteurs)
    ↓
Step 3 (Base classes SciFiBaseCard/Editor)
    ↓
Step 4 (Composants partagés — sf-radiator découpé)
    ↓
Step 5 (Cards — séquence: lights → hexa-tiles → climates → plugs → weather → stove → vehicles → vacuum)
    ↓
Step 6 (Entry + Icons + i18n)
    ↓
YAML Contract Validation Gate
    ↓
Merge v1.0.0-wip → main + tag v1.0.0
```

Steps 1-3 sont bloquants pour tout le reste.
Steps 4-5 peuvent se paralléliser par composant/carte une fois Step 3 terminé.
