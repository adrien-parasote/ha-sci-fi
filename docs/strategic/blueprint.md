# 🎯 STRATEGY — ha-sci-fi v1.0.0 Blueprint

> Document Type: Strategic
> Stream Coding · STRATEGY gate · Revised 2026-05-24
> Decision: **Full rewrite TypeScript — ZERO breaking YAML changes**
> Implementation specs: [Spec 01](./specs/01_infrastructure.md) · [Spec 02](./specs/02_domain_selectors.md) · [Spec 03](./specs/03_base_classes.md) · [Spec 04](./specs/04_components.md) · [Spec 05](./specs/05_cards.md) · [Spec 06](./specs/06_entry_migration.md)

---

## Anti-Patterns (Strategic Pointer)

> Anti-patterns for implementation are in the individual implementation specs. This table is a strategic-level pointer only.

| # | Anti-Pattern | Pointer |
|---|---|---|
| 1 | Renaming YAML fields | [ADR-005](#adr-005--zero-breaking-yaml-changes-️-nouveau--critique) + [05_cards.md AP#1](./specs/05_cards.md#anti-patterns) |
| 2 | Replacing config-metadata with simple TS types | [ADR-006](#adr-006--config-metadatats-conservé-pas-remplacé-par-zod) + [05_cards.md AP#4](./specs/05_cards.md#anti-patterns) |
| 3 | Building with Vite instead of Rollup 4 | [ADR-002](#adr-002--rollup-4-pas-vite) |
| 4 | Using lodash-es `isEqual` (Lit `@state()` handles diff) | [ADR-003](#adr-003--lodash-es-supprimé) |
| 5 | CSS `rem` fallbacks in HA cards (HA root = 24px, not 16px) | L058 → use absolute `px` fallbacks |
| 6 | Missing `:host { display: block }` on LitElement components | L059 → [04_components.md AP#8](./specs/04_components.md#anti-patterns) |

---

## The 7 Questions

---

### Q1 — Quel problème exact résout-on ?

**Problème :** Le codebase ha-sci-fi actuel (v0.9.6) est fonctionnel mais non maintenable :
- Aucune sécurité de type → bugs silencieux dont `lenght` (typo critique) qui ignore des entités
- Zero tests → chaque changement est une regression potentielle
- Build fragile → un `rm + mv` shell peut casser la prod
- Composants non découpés → `sf-radiator.js` (533 lignes), editors (470 lignes) sont impossibles à tester et à modifier
- Stack EOL → Rollup 2, `es-dev-server` ne reçoivent plus de patches sécurité

**Ce que la v1.0.0-wip a cassé en plus :**
- 8 champs YAML renommés sans justification → dashboards cassés
- Features entières supprimées (shortcuts vacuum, alert weather, state_icons climates, seuils stove)
- Éditeurs de cards perdent leurs customisations

**Conséquence concrète :** Impossible d'ajouter une nouvelle carte ou de modifier une carte existante sans risquer une régression non détectée — ET les dashboards existants sont cassés.

**Persona :** Développeur solo qui maintient 8 cartes pour son usage personnel. Ses configs YAML sont en production. Il ne veut pas avoir à tout remigrer à chaque release.

---

### Q2 — Métriques de succès

| Métrique | Cible | Comment mesurer |
|----------|-------|----------------|
| Couverture de tests | ≥ 80% (domain models) | `web-test-runner --coverage` |
| Bugs critiques | 0 | Audit manuel + lint TypeScript strict |
| Fichiers > 400 lignes | 0 | `wc -l src/**/*.ts` |
| Build reproductible | CI green en < 60s | GitHub Actions |
| Toutes les cartes fonctionnelles | 8/8 | Tests visuels manuels dans HA |
| TypeScript strict | 0 erreurs `tsc --strict` | CI type-check step |
| **YAML backward compat** | **100% — zéro champ renommé** | **Validation par diff contre `config-metadata` v0.9.6** |
| **Features préservées** | **100% — zéro feature supprimée** | **Validation par `research/discovery.md` §2** |

**Timeline :** Pas de deadline produit (usage personnel). L'objectif est la qualité durable, pas la vitesse.

---

### Q3 — Pourquoi cette architecture va gagner

**Avantages structurels de la réécriture state-of-the-art :**

1. **TypeScript strict** → le compilateur détecte les bugs avant l'exécution dans HA — impossible avec JS
2. **Domain model immutable** → `Floor`, `Area` sont des value objects — testables unitairement sans HA ni browser
3. **Tests dans vrai navigateur** (`@web/test-runner`) → pas de mock DOM, comportement identique à HA
4. **Rollup 4 + replace plugin** → build déterministe, pas de scripts shell fragiles
5. **Architecture par feature** → chaque carte est un répertoire autonome (card + editor + style + types) — modification isolée, zero couplage accidentel
6. **`config-metadata.ts` migré** → validation de config toujours pilotée par le schéma déclaratif, mais typé. Zero régression.

**VS rester en JS :** Un fichier JS non typé avec 428 lignes (`house.js`) et une mutation silencieuse est non testable. TypeScript + immutabilité rend le domain testable en pur Node.

**VS la v1.0.0-wip :** Elle a réécrit sans préserver les contrats YAML. Ce blueprint corrige cette erreur structurelle.

---

### Q4 — Décision architecturale centrale

**Trade-off principal : Full rewrite vs Refactoring incrémental**

| Critère | Full Rewrite | Refactoring incrémental |
|---------|-------------|------------------------|
| Risque court terme | Élevé (0 fonctionnel pendant la migration) | Faible (toujours livrable) |
| Qualité finale | Maximale (design cohérent dès J1) | Moyenne (compromis à chaque step) |
| Temps total | Équivalent (les incompatibilités JS→TS se paient de toute façon) | Plus long (nettoyage technique en plus) |
| Tests | TDD from scratch | test-retrofit sur code existant |
| Décision | ✅ **FULL REWRITE** | ❌ |

**Rationale :** Full rewrite en TypeScript, mais les **noms de champs YAML sont figés** (voir ADR-005). Ce sont des contrats publics avec les dashboards en production.

**Décision secondaire : Rollup 4 vs Vite**

→ **Rollup 4** retenu.
- Vite ne produit pas nativement un bundle IIFE single-file requis par HA
- Rollup 4 est le standard de la communauté HA custom cards (boilerplate-card, Mushroom)
- La migration Rollup 2→4 est documentée et simple

---

### Q5 — Rationale de la tech stack

| Choix | Rationale |
|-------|-----------|
| **TypeScript 5.x strict** | Permet de typer `HomeAssistant`, `HassEntity`, les configs YAML. Détecte les bugs de structure à la compilation. Standard communauté HA 2025. |
| **Lit 3.x + décorateurs** | Framework du frontend HA lui-même. `@customElement`, `@state`, `@property` sont idiomatiques et produisent moins de boilerplate que `static get properties()`. |
| **Rollup 4** | Seul bundler qui produit un IIFE single-file sans configuration exotique. Standard boilerplate-card, Mushroom, Bubble Card. |
| **`@rollup/plugin-replace`** | Remplace le swap `const.js.PROD` — déterministe, cross-platform, zéro script shell. |
| **`@web/test-runner` + `@open-wc/testing`** | Tests dans vrai Chromium — Shadow DOM, custom elements, `updateComplete`. Standard de la communauté Lit. |
| **ESLint + `@typescript-eslint`** | Enforce `===`, `no-var`, `prefer-const`, règles d'immutabilité. |
| **`custom-card-helpers`** | Types `HomeAssistant`, `LovelaceCardConfig` — évite de copier le source HA. |
| **`@lit/localize`** | Déjà en place, correctement utilisé — conserver. |
| **`idb-keyval`** | Déjà en place pour le cache d'icônes MDI — conserver, isoler dans un module dédié. |
| **`config-metadata.ts`** | Schéma déclaratif migré en TS depuis JS — **conservé et typé, pas supprimé**. Source de vérité pour la validation config ET l'éditeur HA. |

**Supprimé :**
- `lodash-es` → Lit `@state()` gère le diff de rendu — `isEqual` est superflu et coûteux (~70KB)
- `memoize-one` → remplacé par le cache natif dans les classes TypeScript
- `es-dev-server` → EOL
- Rollup 2 → EOL, manque `@rollup/plugin-typescript`
- `zod` → non ajouté (45KB de bundle pour remplacer `config-metadata.ts` qui fait déjà ce travail)

---

### Q6 — Features (ordonnées par dépendance d'implémentation)

#### Tier 0 — Infrastructure (prérequis de tout le reste)
1. **Setup TypeScript + Rollup 4 + ESLint** → `tsconfig.json`, `rollup.config.mjs`, `.eslintrc.json` — [Spec 01](./specs/01_infrastructure.md#blueprint-coverage)
2. **Setup `@web/test-runner`** → `web-test-runner.config.mjs`, `tests/fixtures/mock-hass.ts` — [Spec 01](./specs/01_infrastructure.md#blueprint-coverage)
3. **Types HA centralisés** → `src/types/ha.ts` + `src/types/config.ts` (**champs YAML = noms exacts v0.9.6**) — [Spec 01](./specs/01_infrastructure.md#blueprint-coverage)
4. **Base classes** → `SciFiBaseCard`, `SciFiBaseEditor` en TypeScript avec décorateurs — [Spec 03](./specs/03_base_classes.md#blueprint-coverage)
5. **`config-metadata.ts` migré** → schéma déclaratif typé, validation identique à v0.9.6 — [Spec 03](./specs/03_base_classes.md#blueprint-coverage)

#### Tier 1 — Domain model (testable sans browser)
6. **House / Floor / Area** → immutable, `ReadonlyMap`, testé unitairement — [Spec 02](./specs/02_domain_selectors.md#blueprint-coverage)
7. **Entity models** → `LightEntity`, `ClimateEntity`, `PlugEntity`, `VacuumEntity`, `WeatherEntity`, `StoveEntity`, `VehicleEntity` — [Spec 02](./specs/02_domain_selectors.md#blueprint-coverage)
8. **Icon cache** → module isolé `src/components/sf-icon/icon-cache.ts` — [Spec 04](./specs/04_components.md#blueprint-coverage)

#### Tier 2 — Composants partagés
9. **`sf-icon`** → typé, cache encapsulé
10. **`sf-accordion`** → migré TS
11. **`sf-toggle-switch`**, **`sf-tabs`**, **`sf-toast`** → migrés TS
12. **`sf-circle-progress-bar`**, **`sf-hexa-row`** → migrés TS
13. **Boutons et inputs** → migrés TS
14. **`sf-radiator`** → découpé en sous-composants (< 200L chacun)
15. **`sf-landspeeder`** → migré TS (SVG animé véhicule)

#### Tier 3 — Cartes (par ordre de complexité croissante)
16. **sci-fi-hexa-tiles** → carte hub principale — [Spec 05](./specs/05_cards.md#sci-fi-hexa-tiles)
17. **sci-fi-lights** → plus utilisée — carte de référence pour le pattern — [Spec 05](./specs/05_cards.md#sci-fi-lights)
18. **sci-fi-climates** → dépend de `sf-radiator` — [Spec 05](./specs/05_cards.md#sci-fi-climates)
19. **sci-fi-plugs** → patterns similaires à lights — [Spec 05](./specs/05_cards.md#sci-fi-plugs)
20. **sci-fi-weather** → Chart.js + Météo-France — [Spec 05](./specs/05_cards.md#sci-fi-weather)
21. **sci-fi-stove** → Fumis + `sf-stove` — [Spec 05](./specs/05_cards.md#sci-fi-stove)
22. **sci-fi-vehicles** → Renault + `sf-landspeeder` — [Spec 05](./specs/05_cards.md#sci-fi-vehicles)
23. **sci-fi-vacuum** → multi-vacuum + shortcuts segments — [Spec 05](./specs/05_cards.md#sci-fi-vacuum)

#### Tier 4 — Polish et infrastructure finale
24. **GitHub Actions CI** → lint + typecheck + test + build + HACS validate
25. **Icon set custom** → `sf-iconset.ts` migré TS
26. **`@lit/localize`** → re-générer les fichiers avec le nouveau setup TS
27. **Documentation** → README mis à jour, CHANGELOG v1.0.0

---

### Q7 — Ce qu'on ne construit PAS

| Exclusion | Rationale |
|-----------|-----------| 
| ❌ Nouvelles cartes (nouvelles features) | Le scope est la réécriture des 8 cartes existantes — pas d'extension de périmètre pendant la migration |
| ❌ Vite comme bundler | Non standard pour IIFE HA cards — Rollup 4 suffit |
| ❌ React / Vue / Svelte | HA frontend = Lit. Cohérence avec l'écosystème. |
| ❌ Tests E2E dans HA réel | Hors scope — tests composants `@open-wc` suffisent pour la confiance |
| ❌ **Renommer les champs YAML** | **INTERDIT — les noms de champs sont un contrat public avec les dashboards en production (ADR-005)** |
| ❌ **Supprimer des features existantes** | **INTERDIT — chaque feature de v0.9.6 doit être présente en v1.0.0 (ADR-005)** |
| ❌ Storybook / design system externe | Overkill pour un package 8 cartes personnel |
| ❌ NPM publish | Distribution via HACS uniquement (déjà en place) |
| ❌ Internationalisation autres langues | EN + FR uniquement (déjà en place avec `@lit/localize`) |
| ❌ zod pour validation config | Bundle trop lourd (~45KB). `config-metadata.ts` fait déjà ce travail. |

---

## Gap Discovery — RESOLVED ✅

| # | Gap | Décision |
|---|-----|----------|
| 1 | **Backward compat YAML** | ✅ **RÉSOLU — Zero breaking changes.** Les noms de champs YAML sont figés (ADR-005). La source de vérité est `docs/research/discovery.md` §2 et les `config-metadata` v0.9.6. |
| 2 | **Scope des tests** | ✅ **RÉSOLU** — setup `@web/test-runner` + rebuild automatique. Tests sur domain model ET interactions composants (hass mocké). |
| 3 | **`sf-radiator` découpage** | ✅ **RÉSOLU** — Composants Lit indépendants (`@customElement`) — state of the art. Chaque sous-composant dans son propre répertoire. |
| 4 | **Modèle `House`** | ✅ **RÉSOLU** — Sélecteurs HA qui lisent directement `hass.areas`, `hass.floors`, `hass.devices`, `hass.entities` sans construire un objet intermédiaire lourd. |
| 5 | **Git branching** | ✅ **RÉSOLU** — Branche `v1.0.0-wip` isolée. `main` est revenu sur `v0.9.6` stable. |
| 6 | **Config validation** | ✅ **RÉSOLU** — `config-metadata` migré en TypeScript typé, NON remplacé par zod. Validation identique à v0.9.6. |

---

## Architecture Decision Records

> Full ADR files live in [`docs/adr/`](../adr/). This table is a summary index.

| ADR | Decision | Status |
|-----|----------|---------|
| [ADR-001](../adr/ADR-001_full-rewrite.md) | Full Rewrite TypeScript | ✅ Accepted |
| [ADR-002](../adr/ADR-002_rollup4.md) | Rollup 4 (not Vite) | ✅ Accepted |
| [ADR-003](../adr/ADR-003_lodash-removed.md) | lodash-es removed | ✅ Accepted |
| [ADR-004](../adr/ADR-004_domain-first-tests.md) | Domain-first tests (not E2E) | ✅ Accepted |
| [ADR-005](../adr/ADR-005_zero-breaking-yaml.md) | **Zero Breaking YAML Changes** | ✅ Accepted — **CRITICAL** |
| [ADR-006](../adr/ADR-006_config-metadata.md) | config-metadata.ts kept (not zod) | ✅ Accepted |
| [ADR-007](../adr/ADR-007_workbench-mandatory.md) | Local workbench mandatory before release | ✅ Accepted |
| [ADR-008](../adr/ADR-008_selective-rendering.md) | Selective rendering via getRelevantEntities() | ✅ Accepted |
| [ADR-009](../adr/ADR-009_urbanization.md) | Unified card structure + styles urbanization | ✅ Accepted |
| [ADR-010](../adr/ADR-010_test-consolidation.md) | Consolidated unit test suites | ✅ Accepted |
| [ADR-011](../adr/ADR-011_tv-dpad-mapping.md) | TV D-pad remote mapping | ✅ Accepted |
| [ADR-012](../adr/ADR-012_bridge-sections.md) | Bridge: independent section components | ✅ Accepted |
| [ADR-013](../adr/ADR-013_container-queries.md) | Bridge: container queries for responsive | ✅ Accepted |
| [ADR-014](../adr/ADR-014_crew-actions-fullwidth.md) | Bridge: CREW + ACTIONS always full width | ✅ Accepted |
| [ADR-015](../adr/ADR-015_persons-dynamic.md) | Bridge: dynamic persons from hass.states | ✅ Accepted |


---

## Assumption Audit

This audit evaluates active architectural and operational assumptions made for this cycle to eliminate integration blockers before entering the SPEC stage.

| # | Assumption | Risk Rating | Status | Verification / Evidence |
|---|---|---|---|---|
| 1 | Renaming the directory `hexa_tiles` to `hexa-tiles` will not break any custom card configuration in Lovelace. | Low | **VERIFIED** | The custom element registry tag `sci-fi-hexa-tiles` is registered in `src/sci-fi.ts` and is independent of the physical directory name on disk. |
| 2 | `getRelevantEntities()` covers 100% of the dynamic entities required by each card's render logic, preventing "frozen UI" states. | Medium | **ASSUMED** | We will carefully audit every entity referenced in each card's `renderCard()` and select them statically or dynamically. Base features like locale change or active floor/area selector updates are already protected by the default `shouldUpdate` checks. |
| 3 | Merging test files will preserve 100% of the 583 test assertions. | Low | **VERIFIED** | All tests are modular and will be grouped within standard `describe` blocks. A baseline test run (`npm test`) will be executed before and after each merge to guarantee zero dropped assertions. |
| 4 | Sentrux architectural boundaries remain fully valid after the directory name standardisation. | Low | **VERIFIED** | The `.sentrux/rules.toml` configuration uses recursive globbing patterns (`src/cards/**`), which are fully directory-name-agnostic. |
| 5 | Bundled Chart.js in `sci-fi-weather` works flawlessly in both dev and production without causing duplicate loads. | Low | **VERIFIED** | Verified by running the existing weather tests and compiling via Rollup's standard IIFE format. |

