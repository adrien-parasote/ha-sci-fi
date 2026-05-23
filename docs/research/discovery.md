# 🔬 DISCOVER — ha-sci-fi Research Report

> Stream Coding · DISCOVER gate · May 2026

---

## 1. Project Overview

**ha-sci-fi** is a published HACS custom card package (v0.9.6) for Home Assistant dashboards.
It exposes **8 sci-fi-themed cards** built with Lit + vanilla JavaScript:

| Card | Package tag | Description |
|------|-------------|-------------|
| Hexa-Tiles | `sci-fi-hexa-tiles` | Main hub — hexagonal tiles linking to sub-dashboards |
| Lights | `sci-fi-lights` | Floor/area light management |
| Weather | `sci-fi-weather` | Météo-France forecast + chart |
| Climates | `sci-fi-climates` | Radiator / climate control |
| Stove | `sci-fi-stove` | Pellet stove (Fumis integration) |
| Vehicles | `sci-fi-vehicles` | Renault EV / ICE vehicle |
| Plugs | `sci-fi-plugs` | Smart plug management |
| Vacuum | `sci-fi-vacuum` | Robot vacuum (multi-vacuum) |

Plus a shared **sci-fi icon set** (`sci:` prefix) and a custom Lit localization layer (EN/FR).

---

## 2. Current Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Component framework | Lit (LitElement) | 3.2.1 |
| Language | **JavaScript** (no TypeScript) | ES2021 |
| Bundler | Rollup | 2.79.2 |
| Localization | @lit/localize | 0.12.2 |
| State diffing | lodash-es `isEqual` | 4.17.21 |
| Icon cache | idb-keyval (IndexedDB) | 6.2.1 |
| Charts | Chart.js | 4.4.7 |
| HA Websocket | home-assistant-js-websocket | 9.6.0 |
| Memoization | memoize-one | 6.0.0 |
| Async tasks | @lit/task | 1.0.2 |
| Tests | **Manual HTML** (tests/index.html + mock hass) | — |
| Linting | None | — |
| Type safety | None | — |

---

## 3. Architecture Audit

### 3.1 Directory Layout

```
src/
  sci-fi.js              # Entry point — registers all cards + prints version
  build/
    const.js             # DEV constants (debug = true)
    const.js.PROD        # PROD constants (overwritten by build script)
  cards/
    cards.js             # Re-exports all 8 cards
    <card>/
      card.js            # Main card (LitElement)
      editor.js          # YAML/UI editor (LitElement)
      style.js           # Card-scoped CSS (Lit css``)
      style_editor.js    # Editor-scoped CSS
      config-metadata.js # Config schema (plain JS object)
      const.js           # Card-level constants
      import.js          # customElements.define() call
  components/
    sf-accordion.js      # Shared UI: collapsible section
    sf-circle_progress_bar.js
    sf-hexa-row.js
    sf-person.js
    sf-radiator.js       # 533 lines — largest component
    sf-stove.js
    sf-tabs.js
    sf-tiles.js
    sf-toast.js
    sf-toggle-switch.js
    sf-wheel.js
    buttons/             # Button components
    icons/               # sf-icon.js, sf-iconset.js, weather icons
    inputs/              # Form input components
    landspeeder/         # Vehicle SVG (car model)
  helpers/
    entities/            # Domain model (House, Floor, Area, LightEntity, …)
    styles/              # common_style.js + editor_common_style.js
    utils/
      base-card.js       # SciFiBaseCard (extends LitElement)
      base_editor.js     # SciFiBaseEditor (extends LitElement)
      import.js          # defineCustomElement helper
      utils.js           # isSameDay, templateToString
  locales/              # @lit/localize generated files
```

### 3.2 Identified Anti-Patterns

#### 🔴 CRITICAL

| # | Anti-pattern | Location | Evidence |
|---|-------------|----------|----------|
| 1 | **No TypeScript** | Entire codebase | `.js` files only, no `tsconfig.json` |
| 2 | **Mutation in `addEntity()`** | `house.js:366-368` | `entity.floor_id = this.floor_id` directly mutates passed object |
| 3 | **`var` usage** | `hexa_tiles/card.js:111-113` | `var entities`, `var state` — should be `const` |
| 4 | **`lenght` typo (guard never fires)** | `house.js:53,55` | `entities_ids.lenght == 0` — entities with no area silently skipped |
| 5 | **Silent error swallowing** | `sf-icon.js:164,178` | Only `console.error`, no user feedback |
| 6 | **Global mutable state** | `sf-icon.js:10-11` | `CACHE` and `CACHE_STORE_KEYS` at module level — shared across all instances |
| 7 | **Build system fragility** | `package.json:10-12` | `rm + mv` shell for PROD const swap — fragile and OS-specific |
| 8 | **No automated tests** | `tests/` | Only manual HTML fixtures; zero unit/integration tests |

#### 🟡 MEDIUM

| # | Anti-pattern | Location | Evidence |
|---|-------------|----------|----------|
| 9 | **Files > 400 lines** | Multiple | `sf-radiator.js` (533), editor files (370–470), `house.js` (429) |
| 10 | **`unsafeHTML` with generated content** | `lights/card.js:174-177` | `unsafeHTML(res.join(''))` — should use `repeat()` directive |
| 11 | **`isEqual` deep-clone on every hass update** | All cards | lodash `isEqual` on full domain objects every HA push |
| 12 | **`getLabel()` mega-object** | `base_editor.js:67-207` | 60+ labels in one function — all labels loaded by every card |
| 13 | **Loose `==`** | Multiple | `entities.length == 0`, `hass.language != getLocale()` |
| 14 | **No error boundary in `render()`** | All cards | Uncaught exception crashes the card silently |
| 15 | **`window.customIcons` global coupling** | `sf-icon.js:81,199` | Hard coupling to a global side-effectful registry |
| 16 | **Dead code: `renderAsEntity()`** | `house.js:275,378`, `light.js:34` | Methods never called by any consumer |
| 17 | **`// TODO: change` comments** | `house.js:307,406` | `callService` TODO, light-only — never extended |
| 18 | **Rollup v2 (EOL)** | `package.json` | v2.79.2 — current stable is v4 |
| 19 | **`es-dev-server` (EOL)** | `package.json` | Replaced by `@web/dev-server` in 2021 |

#### 🟢 MINOR

| # | Anti-pattern | Location |
|---|-------------|----------|
| 20 | Inconsistent naming: `style_editor.js` vs `style.js` (snake vs kebab) | All cards |
| 21 | Duplicate resize listener (matchMedia + resize) | `hexa_tiles/card.js:33-45` |
| 22 | `hass.language` compared without case normalization | `base-card.js:97` |
| 23 | Config validation mutates input object | `base-card.js:19` |
| 24 | `getLocale()` called on every `hass` setter invocation | All cards |

---

## 4. Web Research Findings

### 4.1 HA Custom Card Best Practices (2025)

Source: HA Developer Docs, Custom Cards Boilerplate, community consensus.

**Stack**
- **TypeScript** is the community standard — type safety for `HomeAssistant`, `LovelaceCardConfig`.
- **Lit 3.x** remains the correct component framework (same as HA frontend).
- **Rollup 4** for single-file IIFE output; or Vite for better DX.
- **`custom-card-helpers`** for shared HA utility types and interfaces.

**Architecture**
- Use `@customElement()` decorator instead of the `customElements.define()` pattern.
- TypeScript interfaces for card config enforce schema at build time.
- Use `@state()` / `@property()` decorators instead of `static get properties()`.
- Avoid deep cloning `hass` — read `hass.states[entityId]` directly in `render()`.
- Use `@lit/task` for async operations (already in deps, underused).

**Testing**
- **Web Test Runner** (`@web/test-runner`) + **`@open-wc/testing`** is the community standard.
- Unit tests for pure entity model classes are straightforward.

---

## 5. Adopt / Adapt / Build-New Decision

### ✅ ADOPT (keep as-is)

| Decision | Rationale |
|----------|-----------|
| **Lit 3.x** | Already correct; community standard |
| **@lit/localize** | Correct i18n approach |
| **Rollup + terser** | Keep bundler, upgrade version |
| **Card architecture** (card / editor / style / config-metadata) | Clean separation — worth keeping |
| **House / Floor / Area domain model** | Good DDD structure — needs types only |
| **idb-keyval icon cache** | Good approach — needs cleanup |
| **HACS compatibility** | hacs.json + dist/ output — keep |

### 🔄 ADAPT (refactor, not rewrite)

| Decision | What changes |
|----------|-------------|
| **Migrate JS → TypeScript** | Add `tsconfig.json`, rename `.js` → `.ts`, add types for `hass`, config interfaces |
| **Upgrade Rollup 2 → 4** | Update config + add `@rollup/plugin-typescript` |
| **Fix immutability** | `house.js` entity mutation, config mutation in validator |
| **Fix critical bugs** | `lenght` typo, loose `==` comparisons |
| **Split large files** | `sf-radiator.js` (533 lines) → extract sub-components |
| **Replace `unsafeHTML`** | Use `repeat()` directive |
| **Clean build pipeline** | Replace `const.js.PROD` swap with rollup replace plugin |
| **Replace `es-dev-server`** | Switch to `@web/dev-server` |

### 🆕 BUILD-NEW

| Decision | Rationale |
|----------|-----------|
| **TypeScript config interfaces** | `SciFiHexaTilesConfig`, `SciFiLightsConfig`, etc. |
| **Automated test suite** | Zero tests today; needs full setup |
| **Error boundary pattern** | Wrap `render()` with try/catch + fallback UI |
| **CI pipeline** | GitHub Actions for build + HACS validation |

---

## 6. Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| TypeScript migration breaks build | Medium | Incremental: helpers → components → cards |
| Rollup 4 API differences | Low | Well-documented migration guide |
| Breaking HACS user configs | Medium | Maintain YAML backward compatibility |
| `lenght` bug (silent entity skip) | High | Fix in first commit — entities with no area never rendered |
| `unsafeHTML` XSS vector | Low | HA controls entity state values; still replace with `repeat()` |

---

## 7. Open Questions for STRATEGY

1. **TypeScript scope**: All 8 cards, or incrementally (hexa-tiles, lights, climates first)?
2. **Rollup vs Vite**: Stay Rollup 4 (minimal diff) or migrate to Vite (better DX)?
3. **Test scope**: Unit tests for entity model only, or component tests too?
4. **lodash removal**: Remove entirely (save ~70KB), or keep for comparison utilities?
5. **Config breaking changes**: Clean up deprecated YAML fields (e.g., v0.4 era renames)?
6. **New cards planned**: Any roadmap items the refactoring should accommodate?

---

## 8. Summary Score

| Dimension | Current State | Target State |
|-----------|--------------|-------------|
| Language | JavaScript (no types) | TypeScript |
| Test coverage | 0% | ≥ 80% (entity models) |
| Critical bugs | 2 (`lenght`, mutation) | 0 |
| Files > 400 lines | 4 files | 0 files |
| Build tooling | Rollup 2 (EOL) | Rollup 4 |
| CI | None | GitHub Actions |
| Immutability | Violated in 3 places | Enforced |

---

## 9. Green-Field Best Practices — Repartir de zéro

> Ce qui suit est la **cible idéale** : comment on construirait ha-sci-fi si on repartait d'une feuille blanche aujourd'hui, en appliquant strictement les best practices de la communauté HA 2025.

---

### 9.1 Stack de référence

| Couche | Technologie | Pourquoi |
|--------|-----------|----------|
| **Langage** | TypeScript 5.x | Type safety sur l'objet `hass`, les configs YAML, les états HA |
| **Framework UI** | Lit 3.x | Standard du frontend HA lui-même — léger, Shadow DOM natif |
| **Bundler** | Rollup 4 + `@rollup/plugin-typescript` | Output IIFE single-file requis par HA |
| **Dev server** | `@web/dev-server` | Remplace es-dev-server (EOL) — HMR natif |
| **Tests** | `@web/test-runner` + `@open-wc/testing` | Tests dans vrai navigateur, fixture API pour LitElement |
| **Linter** | ESLint + `@typescript-eslint` | Enforce `===`, no-var, immutabilité |
| **Formatter** | Prettier | Déjà en place — conserver |
| **CI** | GitHub Actions | Build + lint + test + HACS validation |
| **Types HA** | `custom-card-helpers` | Types `HomeAssistant`, `LovelaceCardConfig` |
| **Localization** | `@lit/localize` | Déjà en place — conserver |

---

### 9.2 Structure de projet cible

```
ha-sci-fi/
├── dist/                        # Bundle généré (ne pas committer)
│   └── sci-fi.min.js
├── src/
│   ├── sci-fi.ts                # Entry point : registration + console.info
│   ├── types/
│   │   ├── ha.ts                # Interfaces HomeAssistant, HassEntity, etc.
│   │   └── config.ts            # Config interfaces par carte (SciFiLightsConfig, etc.)
│   ├── cards/
│   │   └── <card>/
│   │       ├── index.ts         # Barrel export
│   │       ├── card.ts          # @customElement class (< 200 lignes)
│   │       ├── editor.ts        # Editor card (< 200 lignes)
│   │       ├── style.ts         # css`` scoped (< 100 lignes)
│   │       └── config.schema.ts # Zod schema ou JSON Schema pour validation
│   ├── components/
│   │   ├── sf-icon/
│   │   │   ├── sf-icon.ts
│   │   │   └── icon-cache.ts    # Cache isolé (pas de global mutable)
│   │   └── sf-<component>/
│   │       ├── <component>.ts
│   │       └── style.ts
│   ├── domain/                  # Modèle domaine (ex-helpers/entities)
│   │   ├── house.ts
│   │   ├── floor.ts
│   │   ├── area.ts
│   │   └── entities/
│   │       ├── light.ts
│   │       ├── climate.ts
│   │       └── ...
│   ├── utils/
│   │   ├── base-card.ts         # SciFiBaseCard extends LitElement
│   │   ├── base-editor.ts
│   │   └── date.ts              # isSameDay, formatDate
│   └── locales/                 # @lit/localize generated
├── tests/
│   ├── domain/
│   │   ├── house.test.ts
│   │   ├── light.test.ts
│   │   └── ...
│   ├── cards/
│   │   └── lights.test.ts
│   └── fixtures/
│       └── mock-hass.ts         # Objet hass mock typé
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint + test + build
│       └── hacs-validate.yml    # HACS action validation
├── hacs.json
├── rollup.config.mjs
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── package.json
```

**Règles de structure :**
- Un répertoire par composant — jamais un seul `components.js` fourre-tout
- `types/config.ts` : toutes les interfaces config centralisées — jamais inline dans les cards
- `domain/` remplace `helpers/entities/` — nom qui reflète l'intention (Domain-Driven Design)
- `tests/` miroir de `src/` — un fichier test par fichier source

---

### 9.3 TypeScript patterns à appliquer

#### Pattern 1 — Card class

```typescript
// src/cards/lights/card.ts
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import type { SciFiLightsConfig } from '../../types/config.js';
import { House } from '../../domain/house.js';

@customElement('sci-fi-lights')
export class SciFiLights extends SciFiBaseCard {
  // ✅ Typed hass — pas de _hass privé + getter/setter
  @property({ attribute: false })
  public hass!: HomeAssistant;

  // ✅ Config typée
  @state()
  private _config?: SciFiLightsConfig;

  // ✅ State réactif déclaré proprement
  @state()
  private _house?: House;

  @state()
  private _activeFloorId?: string;

  public setConfig(config: SciFiLightsConfig): void {
    // ✅ Validation immédiate — throw = HA affiche une error card
    if (!config) throw new Error('Invalid configuration');
    // ✅ Copie immutable — jamais muter config
    this._config = { ...config };
    this._activeFloorId = config.first_floor_to_render;
  }

  protected render() {
    // ✅ Guard explicite avec nothing (pas de rendu vide silencieux)
    if (!this.hass || !this._config || !this._house) return nothing;

    // ✅ Lire directement dans hass.states — pas de deep clone
    return html`...`;
  }

  // ✅ hass setter minimaliste — déléguer le diff à Lit
  public set hass(hass: HomeAssistant) {
    super.hass = hass;
    // Reconstruire uniquement si nécessaire
    this._house = new House(hass);
  }
}

// ✅ Registration déclarative (pas de fichier import.ts séparé)
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: 'sci-fi-lights',
  name: 'Sci-Fi Lights',
  description: 'Floor/area light management card',
  preview: false,
});
```

#### Pattern 2 — Config interfaces (types/config.ts)

```typescript
// src/types/config.ts
export interface SciFiLightsConfig {
  type: 'custom:sci-fi-lights';
  header?: string;
  default_icon_on?: string;
  default_icon_off?: string;
  first_floor_to_render?: string;
  first_area_to_render?: string;
  ignored_entities?: string[];
  custom_entities?: Record<string, SciFiLightEntityOverride>;
}

export interface SciFiLightEntityOverride {
  name?: string;
  icon_on?: string;
  icon_off?: string;
}
```

#### Pattern 3 — Domain model (immutable)

```typescript
// src/domain/house.ts
import type { HomeAssistant } from 'custom-card-helpers';
import { Floor } from './floor.js';

export class House {
  readonly floors: ReadonlyMap<string, Floor>;
  readonly latitude: number | null;
  readonly longitude: number | null;

  constructor(hass: HomeAssistant) {
    // ✅ Immutable — construit, jamais muté
    this.floors = this.#build(hass);
    const home = hass.states['zone.home'];
    this.latitude = home?.attributes?.latitude ?? null;
    this.longitude = home?.attributes?.longitude ?? null;
  }

  #build(hass: HomeAssistant): ReadonlyMap<string, Floor> {
    const floors = new Map<string, Floor>();
    // ... logique sans mutation
    return floors;
  }
}
```

#### Pattern 4 — Erreur boundary dans render()

```typescript
protected render() {
  try {
    if (!this.hass || !this._config) return nothing;
    return this.#renderCard();
  } catch (err) {
    console.error('[sci-fi-lights] Render error:', err);
    return html`<div class="error">⚠️ Card render error — check console</div>`;
  }
}
```

---

### 9.4 Configuration tsconfig.json cible

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "declaration": false,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Points clés :**
- `"strict": true` — active toutes les vérifications strictes
- `"useDefineForClassFields": false` — requis pour les décorateurs Lit
- `"moduleResolution": "bundler"` — mode moderne compatible Rollup 4

---

### 9.5 Rollup config cible (Rollup 4)

```javascript
// rollup.config.mjs
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';

const dev = process.env.NODE_ENV === 'development';

export default {
  input: 'src/sci-fi.ts',
  output: {
    file: 'dist/sci-fi.min.js',
    format: 'iife',
    name: 'SciFiCards',
    sourcemap: dev,
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    }),
    resolve({ browser: true }),
    typescript({ tsconfig: './tsconfig.json' }),
    !dev && minifyHTML.default(),
    !dev && terser({ ecma: 2021, module: true }),
  ].filter(Boolean),
};
```

**Différences avec l'actuel :**
- Plus de `const.js.PROD` swap — `process.env.NODE_ENV` géré par `replace`
- Input sur `.ts` directement (plus de copie dans `/temp`)
- `sourcemap` uniquement en dev
- Plugin typescript intégré (plus de pré-compilation externe)

---

### 9.6 Tests — setup et patterns

```typescript
// tests/domain/house.test.ts
import { expect } from '@open-wc/testing';
import { House } from '../../src/domain/house.js';
import { mockHass } from '../fixtures/mock-hass.js';

describe('House', () => {
  it('builds floors from hass devices', () => {
    const hass = mockHass({
      devices: { 'device-1': { area_id: 'living_room' } },
      areas: { 'living_room': { floor_id: 'ground', name: 'Living Room', icon: null } },
      floors: { 'ground': { level: 0, name: 'Ground Floor', icon: null } },
    });

    const house = new House(hass);

    expect(house.floors.size).to.equal(1);
    expect(house.floors.get('ground')).to.exist;
  });

  it('returns null temperature when no climate entities', () => {
    const house = new House(mockHass());
    expect(house.getTemperature()).to.equal(null);
  });
});
```

```typescript
// tests/fixtures/mock-hass.ts
import type { HomeAssistant } from 'custom-card-helpers';

export function mockHass(overrides: Partial<HomeAssistant> = {}): HomeAssistant {
  return {
    states: {},
    devices: {},
    entities: {},
    areas: {},
    floors: {},
    language: 'en',
    config: { unit_system: { temperature: '°C' } },
    callService: async () => undefined,
    ...overrides,
  } as HomeAssistant;
}
```

**Commandes npm :**
```json
{
  "scripts": {
    "test": "web-test-runner tests/**/*.test.ts --node-resolve",
    "test:watch": "web-test-runner tests/**/*.test.ts --node-resolve --watch",
    "dev": "web-dev-server --app-index tests/index.html --node-resolve --watch",
    "build": "rollup -c --environment NODE_ENV:production",
    "build:dev": "rollup -c --environment NODE_ENV:development",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier src tests --write"
  }
}
```

---

### 9.7 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  hacs-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hacs/action@main
        with:
          category: plugin
```

---

### 9.8 Checklist "Repartir de zéro" vs Refactoring

| Décision | Green-field | Refactoring ha-sci-fi |
|----------|-------------|----------------------|
| TypeScript | Dès le départ, `strict: true` | Migration incrémentale (helpers → cards) |
| Décorateurs Lit | `@customElement`, `@state`, `@property` | Migrer `static get properties()` |
| Config types | `types/config.ts` dès J1 | Ajouter progressivement par carte |
| Immutabilité | Objets `readonly` dans domain | Fix `house.js`, `base-card.js` |
| Tests | TDD — RED avant impl | test-retrofit sur le code existant |
| Build | Rollup 4 + `replace` propre | Upgrade + supprimer `const.js.PROD` |
| Erreur boundary | Systématique dans `render()` | Ajouter à `SciFiBaseCard` |
| window.customCards | Déclaratif dans chaque card.ts | Déplacer depuis `import.js` |
| lodash-es `isEqual` | Supprimer — laisser Lit diff | Supprimer + laisser `@state()` gérer |
| Global icon cache | Singleton pattern typé | Refactor `sf-icon.js` |

---

### 9.9 Références

| Ressource | URL |
|-----------|-----|
| HA Custom Card docs (officiel) | https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/ |
| Boilerplate card (community) | https://github.com/custom-cards/boilerplate-card |
| custom-card-helpers types | https://github.com/custom-cards/custom-card-helpers |
| @open-wc testing | https://open-wc.org/docs/testing/testing-package/ |
| Lit testing guide | https://lit.dev/docs/tools/testing/ |
| Rollup 4 migration guide | https://rollupjs.org/migration/ |
| HACS GitHub Action | https://github.com/hacs/action |
