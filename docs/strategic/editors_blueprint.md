# Strategic Blueprint — Restauration des 8 Éditeurs Graphiques

**Date**: 2026-05-24
**Version**: 1.0
**Status**: Approved

---

## 1. Problème

Depuis la migration `main` (JavaScript) → `v1.0.0-wip` (TypeScript), la méthode `getConfigElement()` de chaque carte retourne `document.createElement('sci-fi-<card>-editor')`, mais cet élément n'est jamais enregistré. Résultat : le panneau d'édition latéral de Home Assistant est cassé pour les 8 cartes.

---

## 2. Décision d'architecture : Port fidèle

**Choix** : Porter fidèlement le JavaScript de `main` vers TypeScript. Pas de réécriture.

**Rationale** :
- La logique existe et est validée en production
- Réécrire = risque de régression + temps 3x
- Les seules transformations : `js` → `ts`, `static get properties()` → `@property()`, `defineCustomElement` → `@customElement`

**Ce qu'on ne change PAS** :
- La logique métier des éditeurs
- Le contrat d'événements (`input-update`, `select-item`, `toggle-change`, `config-changed`)
- La structure des sections dans chaque éditeur

---

## 3. Architecture des composants

```
src/components/editor-inputs/          # Nouveaux composants input (couche réutilisable)
├── sf-editor-input.ts                 # Champ texte/number avec label flottant
├── sf-editor-dropdown.ts              # Dropdown filtrable (extends input)
├── sf-editor-dropdown-entity.ts       # Dropdown entités HA (extends dropdown)
├── sf-editor-dropdown-icon.ts         # Dropdown icônes avec preview (extends dropdown)
├── sf-editor-multi-entity.ts          # Multi-sélection entités avec chips (extends dropdown-entity)
├── sf-editor-slider.ts                # Range input min/max/step (extends input)
├── sf-editor-chips.ts                 # Tags multivaleur add/remove (extends input)
├── sf-editor-color-picker.ts          # Color picker (extends input)
└── sf-editor-accordion.ts             # Accordéon groupé (standalone LitElement)

src/utils/base-editor.ts               # Enrichir : getLabel(), _getNewConfig()

src/cards/weather/
└── sci-fi-weather-editor.ts           # @customElement('sci-fi-weather-editor')

src/cards/climates/
└── sci-fi-climates-editor.ts          # @customElement('sci-fi-climates-editor')

src/cards/lights/
└── sci-fi-lights-editor.ts            # @customElement('sci-fi-lights-editor')

src/cards/plugs/
└── sci-fi-plugs-editor.ts             # @customElement('sci-fi-plugs-editor')

src/cards/stove/
└── sci-fi-stove-editor.ts             # @customElement('sci-fi-stove-editor')

src/cards/vacuum/
└── sci-fi-vacuum-editor.ts            # @customElement('sci-fi-vacuum-editor')

src/cards/vehicles/
└── sci-fi-vehicles-editor.ts          # @customElement('sci-fi-vehicles-editor')

src/cards/hexa-tiles/
└── sci-fi-hexa-tiles-editor.ts        # @customElement('sci-fi-hexa-tiles-editor')
```

---

## 4. Contrats d'événements (inchangés depuis main)

| Événement | Source | Payload |
|-----------|--------|---------|
| `input-update` | sf-editor-input | `{ id, kind, value }` |
| `select-item` | sf-editor-dropdown | `{ id, kind, value }` |
| `toggle-change` | sf-toggle-switch | `{ id, value: boolean }` |
| `accordion-delete` | sf-editor-accordion | `{ id }` |
| `config-changed` | Éditeurs | `{ config: T }` (Lovelace contract) |

---

## 5. Gaps résolus

**Gap 1 — `getAllIconNames()` en TS ?**
Absent. En remplacement : `Object.keys(CUSTOM_ICONS)` + `Object.keys(WEATHER_ICONS)` depuis les imports directs. Le composant `sf-editor-dropdown-icon` importera ces deux dictionnaires et fusionnera leurs clés. Tag prefix `sf:` ou `sci:` sera ajouté aux noms. Pour MDI, un `Set` de noms courants sera hardcodé (la liste complète MDI = trop lourde pour l'éditeur).

**Gap 2 — Bundle ou lazy import ?**
Static import dans `sci-fi.ts`. Chaque éditeur est un `@customElement` importé au startup. Même stratégie que dans `main` (tout dans un bundle). Les éditeurs ne sont chargés que si HA ouvre le panneau d'édition.

**Gap 3 — Type du detail de l'événement `input-update` pour multi-entity**
```ts
interface InputUpdateDetail {
  id: string;
  kind: string;
  value: string;
  type?: 'add' | 'remove';
}
```
Les éditeurs lights et climates distinguent `type === 'remove'` pour dépiler l'entité.

---

## 6. Styles

- `editor_common_style` (sections, h1, container) → fichier partagé `src/styles/editor-common.ts`
- Styles spécifiques à chaque éditeur → inline dans le fichier éditeur correspondant (pas de fichier `style_editor.ts` séparé)
- Les composants `editor-inputs` portent leurs propres styles inline

---

## 7. Ordre d'implémentation (par dépendance)

```
Step 1: src/styles/editor-common.ts         (aucune dépendance)
Step 2: src/utils/base-editor.ts            (enrichissement)
Step 3: src/components/editor-inputs/
  3a. sf-editor-input.ts
  3b. sf-editor-dropdown.ts
  3c. sf-editor-slider.ts
  3d. sf-editor-chips.ts
  3e. sf-editor-color-picker.ts
  3f. sf-editor-dropdown-entity.ts
  3g. sf-editor-dropdown-icon.ts
  3h. sf-editor-multi-entity.ts
  3i. sf-editor-accordion.ts
Step 4: Éditeurs simples (pas de vue inline)
  4a. sci-fi-weather-editor.ts
  4b. sci-fi-stove-editor.ts
  4c. sci-fi-vehicles-editor.ts
Step 5: Éditeurs avec vue inline
  5a. sci-fi-climates-editor.ts
  5b. sci-fi-plugs-editor.ts
  5c. sci-fi-lights-editor.ts
Step 6: Éditeurs complexes
  6a. sci-fi-vacuum-editor.ts
  6b. sci-fi-hexa-tiles-editor.ts
Step 7: sci-fi.ts — imports éditeurs
Step 8: dev/workbench.html — intégration mode Edition
```

---

## 8. Non-scope (explicite)

- ❌ Pas de validation schema dans les éditeurs
- ❌ Pas de nouveaux champs non présents dans `main`
- ❌ Pas de tests unitaires pour les composants éditeurs (UI purs, pas de logique métier)
- ❌ Pas de migration des config-metadata.js (non nécessaire pour les éditeurs)
- ❌ Pas de lazy loading — bundle unique

---

## 9. Risques

| Risque | Probabilité | Mitigation |
|--------|------------|------------|
| Composant `sf-toggle-switch` a un API différente de `sci-fi-toggle` du main | Moyen | Vérifier avant d'implémenter les éditeurs l'utilisant |
| Les noms de tag `sci-fi-accordion-card` vs `sf-editor-accordion` | Bas | Utiliser des noms neutres dans les éditeurs |
| L'icône dropdown MDI liste vide sans `getAllIconNames()` | Bas | Fallback hardcodé des icônes courantes suffit pour l'éditeur |
