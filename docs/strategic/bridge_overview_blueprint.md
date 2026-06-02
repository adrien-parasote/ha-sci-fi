# 🎯 STRATEGY — sci-fi-bridge (v1.3 Bridge Overview)

> Document Type: Strategic
> Stream Coding · STRATEGY gate · Created 2026-06-01
> Implementation spec: `docs/specs/cards/bridge.md` (to be written)

---

## Anti-Patterns (Strategic Pointer)

> Anti-patterns for implementation are in the card spec. This table is a strategic-level pointer only.

| # | Anti-Pattern | Pointer |
|---|---|---|
| 1 | Hard-coding entity lists | Spec AP#1 — all sections use configurable arrays |
| 2 | Re-rendering on every hass update | ADR-008 → `getRelevantEntities()` mandatory |
| 3 | Inlining CSS in render() | ADR-009 → all styles in `styles.ts` |
| 4 | Using `viewport` queries for responsive | Use `container-type: inline-size` + `@container sf-card` |
| 5 | New color tokens not in `common.ts` | Only `--sf-*` tokens — zero new custom colors |

---

## The 7 Questions

---

### Q1 — Quel problème exact résout-on ?

**Problème :** Il n'existe pas dans le dashboard sci-fi de carte unifiée permettant de consulter l'état global de la maison en un coup d'œil, en particulier depuis un mobile.

L'utilisateur doit aujourd'hui naviguer entre la carte hexa-tiles (hub de navigation), la page Scripts (automatisations), et la page Vehicles pour avoir une vue d'ensemble. Il n'y a aucun endroit où voir simultanément : qui est à la maison, si les appareils tournent, si les accès sont sécurisés, et l'état du stock de pellets.

**Ce que la v1.3 apporte :**
Une carte de tableau de bord unique — la "passerelle" — affichant en temps réel le statut de tous les systèmes clés de la maison dans un format lisible sur mobile.

**Persona :** Utilisateur solo + conjoint, depuis leur mobile en portrait ou paysage, plusieurs fois par jour pour vérifier l'état général avant de quitter la maison ou en rentrant.

---

### Q2 — Métriques de succès

| Métrique | Cible | Comment mesurer |
|----------|-------|----------------|
| Chargement complet | < 300ms | Workbench perf panel |
| Entités affichées correctement | 100% des 20+ entités configurées | Test manuel + workbench mock |
| Responsive mobile portrait | 1 colonne, aucun overflow | Test @390px viewport |
| Responsive mobile paysage | 2 colonnes, sections côte à côte | Test @760px viewport |
| Ajout d'une entité sans code | ✅ (YAML seul) | Ajouter entrée dans config + vérifier rendu |
| Re-render limité | Uniquement sur entités pertinentes | Profiler shouldUpdate() |
| Tests coverage | ≥ 80% domain logic | `web-test-runner --coverage` |

---

### Q3 — Pourquoi cette architecture va gagner

1. **Sections configurables via YAML** → chaque section (persons, access, appliances, automations) est une liste déclarative. Ajouter un portail ou un enfant = modifier le YAML uniquement.
2. **Container queries** → responsive qui fonctionne que la carte soit en panel, en grid, ou en sidebar. Pas d'hypothèse sur la taille du viewport.
3. **Cohérence avec le système existant** → même base (`SciFiBaseCard`), mêmes tokens CSS (`common.ts`), même pattern `getRelevantEntities()`. Zero dette technique.
4. **Zones HA pour la présence** → `person.*` + attribut `state` (home, work, school, not_home) sans custom template. Fonctionne nativement avec la configuration existante.

---

### Q4 — Décision architecturale centrale

**Trade-off : Section monolithique vs Sections composants indépendants**

| Critère | Monolithique (un render()) | Composants sections |
|---------|--------------------------|---------------------|
| Complexité initiale | Faible | Moyenne |
| Testabilité | Difficile | Bonne (chaque section testable) |
| Performance shouldUpdate | Re-render total si entité quelconque | Ciblé par section |
| Extensibilité | Modifier le render central | Ajouter un composant section |
| Décision | ❌ | ✅ **Composants sections** |

**Décision :** Chaque section est un composant Lit dédié (`sf-bridge-crew`, `sf-bridge-alerts`, `sf-bridge-access`, `sf-bridge-automations`, `sf-bridge-appliances`, `sf-bridge-stove`, `sf-bridge-vehicle`, `sf-bridge-actions`). La carte principale orchestre et passe le `hass` + config à chaque section.

**Trade-off : Layout — CSS Grid responsive vs Flex column**

→ **CSS Grid avec container queries** retenu.
- `grid-template-columns: 1fr` en portrait (< 600px conteneur)
- `grid-template-columns: 1fr 1fr` en paysage (≥ 600px conteneur)
- Section CREW et panneau ACTIONS toujours `grid-column: 1 / -1` (pleine largeur)

---

### Q5 — Rationale de la tech stack

| Choix | Rationale |
|-------|-----------|
| **TypeScript + Lit** | Même stack que toutes les cartes existantes — zéro nouvelle dépendance |
| **Container queries** | Déjà en place dans `common.ts` (`container-type: inline-size`). Responsive sur la largeur carte, pas viewport. |
| **`--sf-*` tokens uniquement** | Cohérence visuelle garantie. Aucun token externe. Thème HA compatible. |
| **`person.*` natif HA** | Les zones sont gérées nativement par HA. Pas de template custom. `state` = zone name, `entity_picture` = avatar. |
| **`binary_sensor` pour cycles** | Les cycles électroménager sont des `binary_sensor` créés par automatisation — déjà en place en prod. |
| **Aucune nouvelle dépendance npm** | La carte utilise uniquement `lit`, `custom-card-helpers`, et les modules internes existants. |

**Supprimé du scope :**
- Chart.js / graphiques — aucune donnée historique dans cette carte
- Animations complexes — seul un indicateur de cycle en cours (pulsing border)

---

### Q6 — Features ordonnées par dépendance d'implémentation

#### Tier 0 — Config & types
1. **`BridgeConfig` TypeScript** → interfaces pour toutes les sections configurables
2. **`config-metadata.ts`** → schéma de validation YAML
3. **`getRelevantEntities()`** → collecte toutes les entity_ids de la config

#### Tier 1 — Sections read-only (render uniquement)
4. **`sf-bridge-crew`** → `person.*` dynamique avec zone + avatar
5. **`sf-bridge-alerts`** → smoke detectors + status badges
6. **`sf-bridge-stove`** → pellets counter + quantity % + status
7. **`sf-bridge-vehicle`** → `sensor.mureva_evlink_power`

#### Tier 2 — Sections interactives
8. **`sf-bridge-access`** → `cover.*` + `lock.*`, actions callService
9. **`sf-bridge-automations`** → toggles + slider tempo
10. **`sf-bridge-appliances`** → cycles + consommables read-only

#### Tier 3 — Actions
11. **`sf-bridge-actions`** → boutons d'actions génériques et configurables (e.g. WiFi Invité, Appel enfants) → callService

#### Tier 4 — Card finale
12. **`sci-fi-bridge` card** → orchestration, grid layout, container queries
13. **Éditeur HA** → `sci-fi-bridge-editor`
14. **Tests** → couverture ≥ 80% sur domain + composants
15. **Workbench mock** → entités mockées pour validation visuelle

---

### Q7 — Ce qu'on ne construit PAS

| Exclusion | Rationale |
|-----------|-----------|
| ❌ Contrôles lave-linge / sèche-linge | Pas de service HA disponible — lecture seule du cycle |
| ❌ Graphique historique consommation EV | Carte dédiée Vehicles (v1.0) existe déjà |
| ❌ Carte météo / alertes météo | Carte dédiée Weather existe déjà |
| ❌ Contrôle des radiateurs | Carte dédiée Climates existe déjà |
| ❌ Vannes irrigation | Carte dédiée Water Management (v1.2) |
| ❌ Carte sécurité avancée (caméras, capteurs fenêtres) | Reporté à une release ultérieure |
| ❌ Nouvelles couleurs / tokens CSS | Palette `common.ts` uniquement — cohérence design |
| ❌ Portail (futur NodOn) en dur | Extensible via config YAML — sera ajouté en YAML quand disponible |
| ❌ Notifications push / TTS depuis la carte | Hors scope carte dashboard |

---

## Architecture Decision Records

> Full ADR files live in [`docs/adr/`](../adr/). This table is a summary index.

| ADR | Decision | Status |
|-----|----------|---------|
| [ADR-012](../adr/ADR-012_bridge-sections.md) | Independent section components | ✅ Accepted |
| [ADR-013](../adr/ADR-013_container-queries.md) | Container queries for responsive (not media queries) | ✅ Accepted |
| [ADR-014](../adr/ADR-014_crew-actions-fullwidth.md) | CREW + ACTIONS always full width | ✅ Accepted |
| [ADR-015](../adr/ADR-015_persons-dynamic.md) | Dynamic persons from hass.states | ✅ Accepted |


---

## Assumption Audit

| # | Assumption | Risk | Status | Verification |
|---|---|---|---|---|
| 1 | `person.*` state = nom de zone HA (home/work/school) | Low | **VERIFIED** | Confirmé par l'utilisateur : zones configurées dans HA |
| 2 | `binary_sensor.cycle_lave_linge` et `cycle_seche_linge` sont `on` pendant le cycle | Low | **VERIFIED** | Créés par automatisation en prod — fonctionnels |
| 3 | `binary_sensor.rinse_aid` et `salt_missing` sont `on` quand consommable manquant | Low | **ASSUMED** (Medium) | Logique standard Electrolux HA — à valider dans workbench |
| 4 | Les raccourcis d'actions configurables appellent les bons services selon le domaine (`input_button.press`, `script.turn_on`, `automation.trigger`, `homeassistant.turn_on`) | Low | **VERIFIED** | Implémenté de manière robuste dans `sf-bridge-actions.ts` |
| 5 | `cover.nodon_porte_garage` supporte `cover.open_cover` et `cover.close_cover` | Low | **VERIFIED** | NodOn cover déjà utilisé en prod |
| 6 | Container queries fonctionnent correctement dans le workbench dev (430px frame) | Low | **VERIFIED** | Déjà validé par ADR-007 sur les cartes existantes |
| 7 | `sensor.mureva_evlink_power` retourne une valeur numérique en W | Low | **ASSUMED** (Low) | Standard sensor HA Zigbee — à confirmer dans workbench |
