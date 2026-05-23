# 🎯 STRATEGY — ha-sci-fi v2 Blueprint

> Stream Coding · STRATEGY gate · May 2026
> Decision: **Full rewrite** — state of the art, green-field approach

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

**Conséquence concrète :** Il est impossible d'ajouter une nouvelle carte ou de modifier une carte existante sans risquer une régression non détectée, et sans comprendre l'ensemble du code.

**Persona :** Développeur solo qui maintient 8 cartes pour son usage personnel, qui veut pouvoir itérer rapidement et avec confiance.

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
| Time to add a new card | < 2h | Subjectif — template disponible |

**Timeline :** Pas de deadline produit (usage personnel). L'objectif est la qualité durable, pas la vitesse.

---

### Q3 — Pourquoi cette architecture va gagner

**Avantages structurels de la réécriture state-of-the-art :**

1. **TypeScript strict** → le compilateur détecte les bugs avant l'exécution dans HA — impossible avec JS
2. **Domain model immutable** → `House`, `Floor`, `Area` sont des value objects — on peut les tester unitairement sans HA ni browser
3. **Tests dans vrai navigateur** (`@web/test-runner`) → pas de mock DOM, comportement identique à HA
4. **Rollup 4 + replace plugin** → build déterministe, pas de scripts shell fragiles
5. **Architecture par feature** → chaque carte est un répertoire autonome (card + editor + style + types) — modification isolée, zero couplage accidentel

**VS rester en JS :** Un fichier JS non typé avec 428 lignes (`house.js`) et une mutation silencieuse est non testable. TypeScript + immutabilité rend le domain testable en pur Node.

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

**Rationale :** L'utilisateur a explicitement demandé "state of the art". Le refactoring incrémental préserve les anti-patterns structurels (fichier `import.js` séparé, `const.js.PROD` swap, `static get properties()` au lieu des décorateurs). Une réécriture verte permet d'appliquer exactement l'architecture green-field documentée dans discovery.md §9.

**Décision secondaire : Rollup 4 vs Vite**

→ **Rollup 4** retenu.
- Vite ne produit pas nativement un bundle IIFE single-file requis par HA (Vite est fait pour les SPA)
- Rollup 4 est le standard de la communauté HA custom cards (boilerplate-card, Mushroom)
- La migration Rollup 2→4 est documentée et simple
- Vite + IIFE est possible mais non standard et requiert plus de configuration

---

### Q5 — Rationale de la tech stack

| Choix | Rationale |
|-------|-----------|
| **TypeScript 5.x strict** | Permet de typer `HomeAssistant`, `HassEntity`, les configs YAML. Détecte les bugs de structure à la compilation. Standard communauté HA 2025. |
| **Lit 3.x + décorateurs** | Framework du frontend HA lui-même. `@customElement`, `@state`, `@property` sont idiomatiques et produisent moins de boilerplate que `static get properties()`. |
| **Rollup 4** | Seul bundler qui produit un IIFE single-file sans configuration exotique. Standard boilerplate-card, Mushroom, Bubble Card. |
| **`@rollup/plugin-replace`** | Remplace le swap `const.js.PROD` — déterministe, cross-platform, zéro script shell. |
| **`@web/dev-server`** | Successeur officiel de `es-dev-server`. HMR natif, Rollup-compatible. |
| **`@web/test-runner` + `@open-wc/testing`** | Tests dans vrai Chromium — Shadow DOM, custom elements, `updateComplete`. Standard de la communauté Lit. |
| **ESLint + `@typescript-eslint`** | Enforce `===`, `no-var`, `prefer-const`, règles d'immutabilité. |
| **`custom-card-helpers`** | Types `HomeAssistant`, `LovelaceCardConfig` — évite de copier le source HA. |
| **`@lit/localize`** | Déjà en place, correctement utilisé — conserver. |
| **`idb-keyval`** | Déjà en place pour le cache d'icônes MDI — conserver, isoler dans un module dédié. |
| **GitHub Actions** | CI gratuit, HACS action disponible, intégration native. |

**Supprimé :**
- `lodash-es` → Lit `@state()` gère le diff de rendu — `isEqual` est superflu et coûteux (~70KB)
- `memoize-one` → remplacé par le cache natif dans les classes TypeScript
- `es-dev-server` → EOL
- Rollup 2 → EOL, manque `@rollup/plugin-typescript`

---

### Q6 — Features (ordonnées par dépendance d'implémentation)

#### Tier 0 — Infrastructure (prérequis de tout le reste)
1. **Setup TypeScript + Rollup 4 + ESLint** → `tsconfig.json`, `rollup.config.mjs`, `.eslintrc.json`
2. **Setup `@web/test-runner`** → `web-test-runner.config.mjs`, `tests/fixtures/mock-hass.ts`
3. **Types HA centralisés** → `src/types/ha.ts` + `src/types/config.ts`
4. **Base classes** → `SciFiBaseCard`, `SciFiBaseEditor` en TypeScript avec décorateurs
5. **Styles partagés** → `src/styles/common.ts`, ``

#### Tier 1 — Domain model (testable sans browser)
6. **House / Floor / Area** → immutable, `ReadonlyMap`, testé unitairement
7. **Entity models** → `LightEntity`, `ClimateEntity`, `PlugEntity`, `VacuumEntity`, `WeatherEntity`, `StoveEntity`, `VehicleEntity`
8. **Icon cache** → module isolé `src/components/sf-icon/icon-cache.ts`

#### Tier 2 — Composants partagés
9. **`sf-icon`** → typé, cache encapsulé
10. **`sf-accordion`** → migré TS
11. **`sf-toggle-switch`**, **`sf-tabs`**, **`sf-toast`** → migrés TS
12. **`sf-circle-progress-bar`**, **`sf-hexa-row`** → migrés TS
13. **Boutons et inputs** → migrés TS
14. **`sf-radiator`** → découpé en sous-composants (< 200L chacun)
15. **`sf-landspeeder`** → migré TS (SVG animé véhicule)

#### Tier 3 — Cartes (par ordre de complexité croissante)
16. **sci-fi-hexa-tiles** → carte hub principale
17. **sci-fi-lights** → plus utilisée — carte de référence pour le pattern
18. **sci-fi-climates** → dépend de `sf-radiator`
19. **sci-fi-plugs** → patterns similaires à lights
20. **sci-fi-weather** → Chart.js + Météo-France
21. **sci-fi-stove** → Fumis + `sf-stove`
22. **sci-fi-vehicles** → Renault + `sf-landspeeder`
23. **sci-fi-vacuum** → multi-vacuum

#### Tier 4 — Polish et infrastructure finale
24. **GitHub Actions CI** → lint + typecheck + test + build + HACS validate
25. **Icon set custom** → `sf-iconset.ts` migré TS
26. **`@lit/localize`** → re-générer les fichiers avec le nouveau setup TS
27. **Documentation** → README mis à jour, CHANGELOG v2.0.0

---

### Q7 — Ce qu'on ne construit PAS

| Exclusion | Rationale |
|-----------|-----------|
| ❌ Nouvelles cartes (nouvelles features) | Le scope est la réécriture des 8 cartes existantes — pas d'extension de périmètre pendant la migration |
| ❌ Vite comme bundler | Non standard pour IIFE HA cards — Rollup 4 suffit |
| ❌ React / Vue / Svelte | HA frontend = Lit. Cohérence avec l'écosystème. |
| ❌ Tests E2E dans HA réel | Hors scope — tests composants `@open-wc` suffisent pour la confiance |
| ❌ Backward compat configs YAML v0.3/v0.4 | Usage personnel — migration propre, pas de legacy |
| ❌ Storybook / design system externe | Overkill pour un package 8 cartes personnel |
| ❌ NPM publish | Distribution via HACS uniquement (déjà en place) |
| ❌ Internationalisation autres langues | EN + FR uniquement (déjà en place avec `@lit/localize`) |

---

## Gap Discovery — RESOLVED ✅

| # | Gap | Décision |
|---|-----|----------|
| 1 | **Backward compat YAML** | ✅ **Breaking changes autorisés** — v2.0.0 majeure. Un `MIGRATION.md` documentera tous les changements de champs YAML avec les équivalents v2. |
| 2 | **Scope des tests** | ✅ **Automatisation maximale** — setup devcontainer + `@web/dev-server` avec rebuild automatique. Tests sur domain model ET interactions composants (hass mocké). Fini les tests manuels. |
| 3 | **`sf-radiator` découpage** | ✅ **Composants Lit indépendants** (`@customElement`) — state of the art. Chaque sous-composant dans son propre répertoire, réutilisable par d'autres cartes. |
| 4 | **Modèle `House`** | ✅ **Refonte complète du domain model** — `House` est trop centralisé. Nouveau pattern : **sélecteurs HA** qui lisent directement `hass.areas`, `hass.floors`, `hass.devices`, `hass.entities` sans construire un objet intermédiaire lourd. Chaque carte compose ses propres sélecteurs. |
| 5 | **Git branching** | ✅ **Branche `v2` isolée** — `main` reste stable pour HACS pendant toute la migration. |

---

## Architecture Decision Records

### ADR-001 : Full Rewrite vs Incremental Refactoring
- **Decision :** Full rewrite
- **Status :** Accepted
- **Context :** 8 cartes, 0 tests, stack EOL, bugs critiques, architecture non typée
- **Rationale :** L'utilisateur cible un résultat "state of the art". Un refactoring incrémental préserve les anti-patterns structurels JS. La réécriture verte garantit une architecture cohérente dès J1.
- **Consequences :** Les 8 cartes sont indisponibles pendant la migration. Usage personnel → acceptable.

### ADR-002 : Rollup 4 (pas Vite)
- **Decision :** Rollup 4
- **Status :** Accepted
- **Context :** HA custom cards requièrent un bundle IIFE single-file. Vite génère nativement des ES modules pour SPA.
- **Rationale :** Rollup est le standard communauté (boilerplate-card, Mushroom). Migration 2→4 documentée. Vite + IIFE = configuration non standard.
- **Consequences :** Dev server = `@web/dev-server` (pas Vite HMR). Acceptable.

### ADR-003 : lodash-es supprimé
- **Decision :** Supprimer lodash-es
- **Status :** Accepted
- **Context :** Utilisé uniquement pour `isEqual` sur les domain objects.
- **Rationale :** Lit `@state()` déclenche le re-render quand la référence change. Si `House` est reconstruit à chaque `hass` update (nouvel objet → nouvelle référence), Lit re-rendra. `isEqual` n'est plus nécessaire. Si performance insuffisante → mémorisation explicite avec des comparaisons de string d'entity IDs (< 5 lignes).
- **Consequences :** Gain ~70KB dans le bundle. Si perf issue → ADR à réviser après mesure.

### ADR-004 : Tests domain-first (pas E2E)
- **Decision :** `@web/test-runner` + `@open-wc/testing` pour domain + composants. Pas de tests E2E dans HA réel.
- **Status :** Accepted
- **Context :** Tester dans HA réel requiert une instance dédiée (devcontainer) et des fixtures complexes.
- **Rationale :** 80% de la valeur des tests est dans le domain model (pure TS, testable sans browser). Les composants Lit sont testés avec `fixture()` et un `hass` mocké. C'est ce que fait la communauté (boilerplate-card, Mushroom).
- **Consequences :** Les interactions réseau réelles (appels `callService`) ne sont pas testées. Acceptable pour usage personnel.
