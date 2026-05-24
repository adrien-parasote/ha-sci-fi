# 🎯 STRATEGY — ha-sci-fi v1.0.0 Blueprint

> Stream Coding · STRATEGY gate · Révisé 2026-05-24
> Decision: **Full rewrite TypeScript — ZERO breaking YAML changes**

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
| **Features préservées** | **100% — zéro feature supprimée** | **Validation par `research/discovery.txt` §2** |

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
1. **Setup TypeScript + Rollup 4 + ESLint** → `tsconfig.json`, `rollup.config.mjs`, `.eslintrc.json`
2. **Setup `@web/test-runner`** → `web-test-runner.config.mjs`, `tests/fixtures/mock-hass.ts`
3. **Types HA centralisés** → `src/types/ha.ts` + `src/types/config.ts` (**champs YAML = noms exacts v0.9.6**)
4. **Base classes** → `SciFiBaseCard`, `SciFiBaseEditor` en TypeScript avec décorateurs
5. **`config-metadata.ts` migré** → schéma déclaratif typé, validation identique à v0.9.6

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
23. **sci-fi-vacuum** → multi-vacuum + shortcuts segments

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
| 1 | **Backward compat YAML** | ✅ **RÉSOLU — Zero breaking changes.** Les noms de champs YAML sont figés (ADR-005). La source de vérité est `docs/research/discovery.txt` §2 et les `config-metadata` v0.9.6. |
| 2 | **Scope des tests** | ✅ **RÉSOLU** — setup `@web/test-runner` + rebuild automatique. Tests sur domain model ET interactions composants (hass mocké). |
| 3 | **`sf-radiator` découpage** | ✅ **RÉSOLU** — Composants Lit indépendants (`@customElement`) — state of the art. Chaque sous-composant dans son propre répertoire. |
| 4 | **Modèle `House`** | ✅ **RÉSOLU** — Sélecteurs HA qui lisent directement `hass.areas`, `hass.floors`, `hass.devices`, `hass.entities` sans construire un objet intermédiaire lourd. |
| 5 | **Git branching** | ✅ **RÉSOLU** — Branche `v1.0.0-wip` isolée. `main` est revenu sur `v0.9.6` stable. |
| 6 | **Config validation** | ✅ **RÉSOLU** — `config-metadata` migré en TypeScript typé, NON remplacé par zod. Validation identique à v0.9.6. |

---

## Architecture Decision Records

### ADR-001 : Full Rewrite vs Incremental Refactoring
- **Decision :** Full rewrite
- **Status :** Accepted
- **Context :** 8 cartes, 0 tests, stack EOL, bugs critiques, architecture non typée
- **Rationale :** TypeScript strict + tests reproductibles + architecture green-field. Refactoring incrémental préserve les anti-patterns structurels JS.
- **Consequences :** Les 8 cartes sont indisponibles pendant la migration sur la branche `v1.0.0-wip`. Main reste stable sur v0.9.6.

### ADR-002 : Rollup 4 (pas Vite)
- **Decision :** Rollup 4
- **Status :** Accepted
- **Context :** HA custom cards requièrent un bundle IIFE single-file. Vite génère nativement des ES modules pour SPA.
- **Rationale :** Rollup est le standard communauté (boilerplate-card, Mushroom). Migration 2→4 documentée. Vite + IIFE = configuration non standard.
- **Consequences :** Dev server = `@web/dev-server`. Acceptable.

### ADR-003 : lodash-es supprimé
- **Decision :** Supprimer lodash-es
- **Status :** Accepted
- **Context :** Utilisé uniquement pour `isEqual` sur les domain objects.
- **Rationale :** Lit `@state()` déclenche le re-render quand la référence change. Si le domain object est reconstruit à chaque `hass` update (nouvel objet → nouvelle référence), Lit re-rendra. `isEqual` n'est plus nécessaire.
- **Consequences :** Gain ~70KB dans le bundle. Si perf issue → ADR à réviser après mesure.

### ADR-004 : Tests domain-first (pas E2E)
- **Decision :** `@web/test-runner` + `@open-wc/testing` pour domain + composants. Pas de tests E2E dans HA réel.
- **Status :** Accepted
- **Context :** Tester dans HA réel requiert une instance dédiée (devcontainer) et des fixtures complexes.
- **Rationale :** 80% de la valeur des tests est dans le domain model (pure TS, testable sans browser). Les composants Lit sont testés avec `fixture()` et un `hass` mocké.
- **Consequences :** Les interactions réseau réelles (appels `callService`) ne sont pas testées. Acceptable pour usage personnel.

### ADR-005 : Zero Breaking YAML Changes ⚠️ NOUVEAU — CRITIQUE
- **Decision :** Aucun champ YAML de config ne peut être renommé ou supprimé.
- **Status :** Accepted
- **Context :** La v1.0.0-wip a renommé 8 champs YAML et supprimé des features entières, cassant les dashboards en production.
- **Rationale :** Les noms de champs YAML sont un **contrat public** entre les cards et les dashboards utilisateur. Changer ces noms sans contrôle brise silencieusement les configurations existantes. Usage personnel ne signifie pas "sans coût de migration" — au contraire, l'utilisateur n'a pas d'équipe pour absorber ce coût.
- **Source de vérité :** `docs/research/discovery.txt` §2 (inventaire exhaustif) + `src/cards/*/config-metadata` v0.9.6.
- **Règle de validation :** Avant chaque PR, diff les champs TypeScript dans `src/types/config.ts` contre `docs/research/discovery.txt` §2. Tout champ absent ou renommé bloque le merge.
- **Consequences :**
  - Pas de MIGRATION.md nécessaire (pas de breaking change).
  - `config-metadata.ts` migré en TS mais schéma inchangé.
  - Si un champ DOIT vraiment changer → nouvelle majeure (v2.0.0) avec MIGRATION.md et période de deprecated.

### ADR-006 : config-metadata.ts conservé (pas remplacé par zod)
- **Decision :** Migrer `config-metadata` en TypeScript typé, ne pas le remplacer par zod.
- **Status :** Accepted
- **Context :** La v1.0.0-wip a remplacé `config-metadata` par des interfaces TypeScript simples dans `types/config.ts`, perdant la validation dynamique et l'éditeur HA.
- **Rationale :** `config-metadata` fait 3 choses simultanément : (1) valide la config YAML, (2) applique les valeurs par défaut, (3) pilote l'UI de l'éditeur HA. Ces 3 responsabilités sont intrinsèquement liées au schéma. zod ferait (1) mais pas (2)+(3) sans duplication.
- **Consequences :** `config-metadata.ts` est migré en TypeScript avec types stricts pour les valeurs `type`, `mandatory`, `default`. L'éditeur HA continue à être piloté par ce schéma déclaratif.
