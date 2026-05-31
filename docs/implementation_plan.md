# Refactoring workbench.html — Architecture modulaire & déclarative

## Contexte

Le fichier `dev/workbench.html` fait **2819 lignes / 123 Ko** : CSS, HTML, données mock, configs de cartes, scénarios, logique de connexion HA, console, éditeur, device simulator — tout dans un seul fichier.

**Objectif :** Éclater en modules ES autonomes avec une approche **déclarative** — ajouter une nouvelle carte = ajouter un fichier de config, zéro modification du moteur workbench.

## Principe déclaratif

Aujourd'hui, les scénarios sont des **fonctions** couplées à `MOCK_STATES` :
```js
'Alerte météo JAUNE': () => ({
  'sensor.44_weather_alert': {
    ...MOCK_STATES['sensor.44_weather_alert'],
    state: 'Jaune',
    attributes: { friendly_name: 'Alerte météo 44', vent_violent: 'Jaune' }
  }
})
```

Demain, les scénarios sont de la **donnée pure** (overrides partiels) :
```js
'Alerte météo JAUNE': {
  'sensor.44_weather_alert': {
    state: 'Jaune',
    attributes: { vent_violent: 'Jaune' }
  }
}
```

Le moteur workbench fait le deep-merge avec `MOCK_STATES` automatiquement. Pour les scénarios "bulk" (ex: toutes les lumières ON/OFF), syntaxe `$match:` :
```js
'Tout allumé': { '$match:light.*': { state: 'on' } }
'Tout éteint': { '$match:light.*': { state: 'off' } }
```

**Résultat : pour ajouter une carte, il suffit de créer un fichier `dev/cards/ma-carte.js` :**
```js
export default {
  id: 'my-card',
  label: '🆕 My Card',
  tag: 'sci-fi-my-card',
  config: { type: 'custom:sci-fi-my-card', entity: 'sensor.something' },
  scenarios: {
    'Normal': {},
    'Alerte': { 'sensor.something': { state: 'alert' } },
  }
};
```

Puis ajouter 1 ligne d'import dans `dev/cards/_registry.js`. Aucun autre fichier à toucher.

---

## Architecture cible

```
dev/
├── workbench.html                ← HTML squelette (~120 lignes)
├── workbench.css                 ← Styles extraits (~1180 lignes, inchangés)
├── cards/                        ← 1 fichier = 1 carte (déclaratif)
│   ├── _registry.js              ← Import de toutes les cartes
│   ├── hexa.js
│   ├── weather.js
│   ├── stove.js
│   ├── vacuum.js
│   ├── vehicles.js
│   ├── climates.js
│   ├── plugs.js
│   ├── lights.js
│   ├── water.js
│   └── tv.js
└── modules/                      ← Moteur workbench (logique réutilisable)
    ├── mock-data.js              ← MOCK_STATES, MOCK_AREAS, MOCK_FLOORS, MOCK_ENTITIES, MOCK_DEVICES
    ├── mock-hass.js              ← buildMockHass (merge engine), buildLiveHass
    ├── ha-icon.js                ← Custom element ha-icon mock
    ├── console.js                ← Console proxy, filtres, copie
    ├── ha-connection.js          ← connectToHA, loadLiveData, disconnectHA, auth
    ├── ui-helpers.js             ← setHaStatus, setLiveMode, modals
    ├── editor.js                 ← mountUiEditor, handleYamlInput, YAML sync
    ├── view-modes.js             ← setViewMode, setDeviceSize, device simulator
    └── workbench-app.js          ← Point d'entrée — init, tabs, renderCard, navigation
```

---

## Détail par composant

### HTML — `dev/workbench.html`

- Réduit à **~120 lignes** — markup uniquement
- `<link rel="stylesheet" href="workbench.css">`
- `<script type="module" src="modules/workbench-app.js"></script>`
- `<script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>`
- Zéro JS inline, zéro CSS inline

### CSS — `dev/workbench.css`

- Extraction pure des lignes 9–1179
- **Aucune modification** du contenu CSS

### Mock data — `dev/modules/mock-data.js`

Exporte : `MOCK_STATES`, `MOCK_AREAS`, `MOCK_FLOORS`, `MOCK_ENTITIES`, `MOCK_DEVICES`

### Registry — `dev/cards/_registry.js`

```js
import hexa from './hexa.js';
import weather from './weather.js';
// ...
export const CARDS = { [hexa.id]: hexa, [weather.id]: weather, /* ... */ };
```

### Fichiers de cartes — `dev/cards/<card>.js`

Contrat de l'objet exporté :
- `id` : string unique (clé dans CARDS)
- `label` : string affichée dans l'onglet
- `tag` : nom du custom element HTML
- `config` : objet config HA
- `scenarios` : `{ nom: overrides }` — deep-merged avec MOCK_STATES
  - Clé `$match:pattern` pour overrides bulk par regex

### Moteur mock — `dev/modules/mock-hass.js`

- `resolveScenario(overrides)` : moteur de merge déclaratif
  1. Part de `MOCK_STATES`
  2. Pour chaque clé : si `$match:` → regex match sur tous les entity_id, sinon → merge direct
  3. Deep-merge : `{ ...base, ...override, attributes: { ...base.attributes, ...override.attributes } }`
- `buildMockHass(overrides)` : construit le faux objet hass
- `buildLiveHass(baseHass, lang)` : wraps connexion HA réelle

### Modules restants

| Module | Contenu | Lignes ≈ |
|--------|---------|----------|
| `ha-icon.js` | Custom element ha-icon mock (fetch MDI SVG) | ~70 |
| `console.js` | `log()`, filtres, copie, interception console.warn/error | ~80 |
| `ha-connection.js` | `connectToHA()`, `loadLiveData()`, `disconnectHA()` | ~180 |
| `ui-helpers.js` | `setHaStatus()`, `setLiveMode()`, modals | ~60 |
| `editor.js` | `mountUiEditor()`, `handleYamlInput()`, `copyConfigYaml()` | ~100 |
| `view-modes.js` | `setViewMode()`, `setDeviceSize()`, device labels | ~80 |
| `workbench-app.js` | init, tabs, scenarios, renderCard, navigation | ~180 |

---

## Vérification

1. `npm run build` + `npx serve . --listen 8888 --cors`
2. Ouvrir `http://localhost:8888/dev/workbench.html`
3. Vérifier :
   - Tous les onglets de cartes s'affichent
   - Les scénarios fonctionnent
   - Mode Card / Panel + Device simulator
   - Mode Edit (GUI + YAML)
   - Console (filtres, copie, recherche)
   - Changement de langue (FR/EN)
   - Connexion HA live (si dispo)
   - Reload carte + Navigation interceptée
