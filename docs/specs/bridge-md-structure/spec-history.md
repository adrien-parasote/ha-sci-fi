# bridge.md — Spec History

Archive de [`bridge.md`](../cards/bridge.md), constituée le 2026-11-01 par le lot
fix `bridge-md-structure` (bead `ha-sci-fi-1b3`).

Ce fichier porte ce qui décrivait **comment la carte a été livrée**, pas ce
qu'elle est. `bridge.md` ne décrit plus que l'état courant ; l'historique vit
ici, consultable pour un débogage ou une archéologie de décision, et n'est le
contrat de rien.

> **Pourquoi ici et pas à côté de la spec.** `/spec-consolidate` prescrit un
> `spec-history.md` voisin du document consolidé. Le gate de périmètre SC refuse
> la création d'un fichier neuf sous `docs/specs/cards/`, qui est le périmètre de
> la feature `cards` et non celui de ce lot. L'archive vit donc dans le dossier
> du lot, et `bridge.md` y renvoie.

---

## § README & CHANGELOG Updates (déplacé de bridge.md, 2026-11-01)

**Pourquoi déplacé :** cette section prescrivait un HARDEN **accompli le
2026-06-02** — ses trois sous-sections portent `✅ Complété` ou `✅ Créé`, et les
trois fichiers existent. Une prescription honorée n'est plus un contrat à
confronter au code : c'est de l'histoire.

**Et elle coûtait cher là où elle était.** Le bloc `` ```markdown `` qui cite la
page utilisateur contenait un `` ```yaml `` imbriqué. Ce fence interne fermait le
fence externe 23 lignes trop tôt, si bien que la ligne censée le fermer ouvrait
au contraire un bloc jamais refermé : §Deep Links, §Shared Artifact Schema,
§Assumptions et une seconde table de Test Cases — 52 lignes, jusqu'à la fin du
fichier — rendaient comme un seul bloc de code, pour tout lecteur et tout outil.
C'était l'observation O2 du lot. Sortir ce bloc de la spec retire la cause, pas
seulement le symptôme.

**Une correction dans le texte archivé :** la ligne de CHANGELOG ci-dessous
nommait la huitième section « Call Kids ». Elle a été renommée `actions` en
1.3.0, et le CHANGELOG livré porte le bon nom. Le texte est corrigé ici plutôt
que laissé faux, et l'ancien nom reste mentionné pour qu'il reste retrouvable.

---

> [!IMPORTANT]
> Ces deux fichiers **DOIVENT** être mis à jour lors du HARDEN. Ils font partie de la définition de "done" (F-BR-16).

### README.md — À modifier

**Fichier :** [`README.md`](../../../README.md#blueprint-coverage)

#### 1. Ajouter la carte dans la table `## 🧩 Available cards`

Après la ligne `| 💧 **Water Management** | ... |`, ajouter :

```markdown
| 🛠️ **Bridge Overview** | Dashboard maison — équipage, alertes, accès, automatisations, électroménager, poêle, voiture | [→ docs](./docs/cards/bridge.md#installation) |
```

#### 2. Badges tests + coverage — ✅ Complété (2026-06-02)

> Badges mis à jour dans `README.md` : `tests-953%20passing` et `coverage-87%25`.

### CHANGELOG.md — À modifier

**Fichier :** [`CHANGELOG.md`](../../../CHANGELOG.md#blueprint-coverage)

Ajouter une section v1.3 en tête du CHANGELOG (après l'en-tête, avant la section v1.2 ou v1.0 existante) :

```markdown
## v1.3 — 2026-06-02 *(Bridge Overview)*

### 🏠 Bridge Overview — nouvelle carte

- **`sci-fi-bridge`** : carte dashboard maison modulaire. 8 sections indépendantes (Crew, Alertes, Accès, Automatisations, Électroménager, Poêle, Voiture, Actions — nommée « Call Kids » jusqu'en 1.3.0).
- **Design responsive** : 1 colonne en portrait, 2 colonnes en paysage via container queries.
- **Sections optionnelles** : toute section absente du YAML est simplement masquée — zéro erreur.
- **Icônes configurables** : chaque section et chaque entrée accepte un champ `icon` via `<sf-editor-dropdown-icon>` (searchable MDI + sci-fi).
- **i18n complète** : 20 nouvelles clés `msg()` en FR/EN.
- **Éditeur visuel** : accordéons par section avec `<sf-editor-dropdown-entity>`, `<sf-editor-input>`, `<sf-editor-dropdown-icon>`, `<sf-editor-dropdown>`, `<sf-editor-accordion>`.
- **Workbench** : 5 scénarios mockés (Normal, Alerte, Absent, Déconnecté, Minimal). Le workbench passe `scenarioData` à l'éditeur pour maintenir les entités après chaque modification de config.
```

### docs/cards/bridge.md — ✅ Créé (2026-06-02)

**Fichier :** `docs/cards/bridge.md` (créé le 2026-06-02)

La page de documentation utilisateur (référencée depuis README). Elle devait contenir :

`````markdown
# 🏠 Bridge Overview (`sci-fi-bridge`)

Carte dashboard maison. Affiche le statut global de la maison en temps réel.

## Configuration

### Exemple minimal

```yaml
type: custom:sci-fi-bridge
persons:
  - entity: person.adrien
```

### Exemple complet

[Voir la spec → § YAML Configuration Schema](../cards/bridge.md#blueprint-coverage)

## Sections disponibles

| Section | Clé YAML | Optionnelle | Description |
|---------|-----------|-------------|-------------|
| Crew | `persons` | ✔ | Présence de l'équipage avec zones HA |
| Alertes | `alerts` | ✔ | Détecteurs fumée, toggles, occupancy |
| Accès | `access` | ✔ | Portes, portails, verrous |
| Automatisations | `automations` | ✔ | Toggles + slider tempo |
| Électroménager | `appliances` | ✔ | Cycles en cours + consommables |
| Poêle | `stove` | ✔ | Pellets + état poêle |
| Voiture | `vehicle` | ✔ | Puissance de charge EV |
| Actions | `actions` | ✔ | Panneau de boutons d'actions configurables |

## Icônes

Chaque section et chaque entrée accepte un champ `icon` optionnel (string MDI, ex: `mdi:garage`).
Si absent, l'icône par défaut de la section est utilisée.
`````

> Le fence externe de cet échantillon porte **cinq** backticks : il contient un
> bloc à quatre et un bloc à trois. Un fence qui en contient un autre doit en
> porter davantage que le plus long qu'il contient, sinon le parsing casse — ce
> qui est exactement ce qui est arrivé dans `bridge.md`.
