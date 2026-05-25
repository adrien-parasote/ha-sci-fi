# Spec 05 — Cards Rewrite (8 cartes)

> Document Type: Implementation
> Covers: Step 5 from [implementation_plan.md](../implementation_plan.md#step-5-cards-rewrite-8-cartes)
> Depends on: [Spec 01](./01_infrastructure.md#blueprint-coverage), [Spec 02](./02_domain_selectors.md#blueprint-coverage), [Spec 03](./03_base_classes.md#blueprint-coverage), [Spec 04](./04_components.md#blueprint-coverage)
> **ADR-005 : Zero breaking YAML changes — champs gelés, features gelées**

---

## Assumptions

| # | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | The production dashboards use exactly the properties backed up in `"yaml backup"/*.yaml`, without undocumented parameters. | Medium | → Validated against primary config schemas and exact production YAML files. |
| 2 | Home Assistant's Lovelace custom card registration system remains fully compatible with `@customElement` auto-registration. | Low | → Confirmed through standard custom element registry practices in HA developer docs. |
| 3 | The Lit-based base classes and selectors from Spec 02, 03, and 04 satisfy all specific interface needs for these 8 cards. | Low | → Verified by dependency type definitions in `tsconfig.json` and base class test coverage. |
| 4 | Chart.js can be bundled directly in the IIFE without violating HA's dashboard runtime limits or memory constraints. | Medium | → Profiled and tested on sample dashboards with active sensor state changes. |

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-CARD-01 | `sci-fi-hexa-tiles` Lovelace Card | ✅ `hexa_tiles/` |
| F-CARD-02 | `sci-fi-lights` Lovelace Card | ✅ `lights/` |
| F-CARD-03 | `sci-fi-climates` Lovelace Card | ✅ `climates/` |
| F-CARD-04 | `sci-fi-plugs` Lovelace Card | ✅ `plugs/` |
| F-CARD-05 | `sci-fi-weather` Lovelace Card | ✅ `weather/` |
| F-CARD-06 | `sci-fi-stove` Lovelace Card | ✅ `stove/` |
| F-CARD-07 | `sci-fi-vehicles` Lovelace Card | ✅ `vehicles/` |
| F-CARD-08 | `sci-fi-vacuum` Lovelace Card | ✅ `vacuum/` |

---

## ⛔ YAML Config Contracts (ADR-005 — Source de vérité)

> [!CAUTION]
> Les noms de champs ci-dessous sont figés. Toute divergence dans `src/types/config.ts` ou dans le code des cartes est un bug bloquant.
> Source primaire : `config-metadata.js` de chaque card en v0.9.6.
> Source de vérification : `"yaml backup"/*.yaml` dans le workspace HA.

---

### sci-fi-hexa-tiles

See [hexa-tiles-schema.md](./cards/hexa-tiles-schema.md) for full config contract.

---

### sci-fi-lights

See [lights-schema.md](./cards/lights-schema.md) for full config contract.

---|---|
| `first_floor_to_render: 'rdc'` | Sélectionne 'rdc' SI l'ID existe dans `hass.floors` (même si aucune lumière) |
| `first_floor_to_render` absent ou ID inconnu | Fallback → 1er floor avec lumières → 1er floor |
| `first_area_to_render: 'chambre'` | Sélectionne 'chambre' SI elle est dans les areas du floor actif |
| `first_area_to_render` absent ou area hors floor | Fallback → 1ère area avec lumières → 1ère area du floor |

> [!NOTE]
> La validation ne requiert **pas** la présence de lumières pour conserver un floor/area configuré. Cela évite un flash d'écran vide lors du 1er rendu quand le registre d'entités HA n'est pas encore chargé.

**CSS selectors des éléments interactifs (pour tests E2E) :**

| Élément | Sélecteur | Attribut d'état |
|---|---|---|
| Hexagone de floor | `.floor-hexa` | `data-selected="true/false"`, `data-active="true/false"` |
| Hexagone d'area | `.area-hexa` | `data-selected="true/false"`, `data-active="true/false"` |
| Bouton de lumière | `.light-btn` | classe `light-off` si éteinte |
| Label de lumière | `.light-label` | — |

**Icône jour/nuit dans le header :**
L'icône en haut à droite du header lit l'état de `sun.sun`. Si `above_horizon` → icône animée `sf:sunny-day` ; sinon → `sf:starry-night`. Utilise `WEATHER_ICON_SET` de `sf-weather-icons.ts`.

**getCardSize() :** retourne `5`.

---

### sci-fi-climates

See [climates-schema.md](./cards/climates-schema.md) for full config contract.

---

### sci-fi-plugs

See [plugs-schema.md](./cards/plugs-schema.md) for full config contract.

---

### sci-fi-weather

See [weather-schema.md](./cards/weather-schema.md) for full config contract.

---

### sci-fi-stove

See [stove-schema.md](./cards/stove-schema.md) for full config contract.

---

### sci-fi-vacuum

See [vacuum-schema.md](./cards/vacuum-schema.md) for full config contract.

---

### sci-fi-vehicles

See [vehicles-schema.md](./cards/vehicles-schema.md) for full config contract.

---

## 📋 Implementation Constraints & Disambiguations

To ensure robust and correct code generation across the 8 cards, the following constraints must be strictly adhered to:

### 1. Chart.js Shadow DOM Selection (plugs & weather cards)
* **Constraint**: Querying the canvas context using standard `document.getElementById` or global queries will fail inside Shadow DOM.
* **Rule**: Always select the canvas element using `this.shadowRoot!.querySelector('canvas')` or Lit's `@query('canvas')` decorator to guarantee that Chart.js initializes on the correct element boundary.

### 2. Vacuum Shortcut Service Payloads (vacuum card)
* **Constraint**: Roborock and other vacuum integrations require exact payload parameters when invoking segment clean service calls.
* **Rule**: When executing a shortcut, construct the service call payload exactly as follows:
  ```typescript
  this.hass.callService('vacuum', serviceName || 'send_command', {
    entity_id: vacuumEntityId,
    command: commandName || 'app_segment_clean',
    params: segmentsArray
  });
  ```
  If `shortcuts` defines no description or segments, the shortcut buttons panel must be completely hidden.

### 3. Hexa-Tiles Fallback Icons (hexa-tiles card)
* **Constraint**: Standalone tiles might omit `active_icon` or `inactive_icon` parameters.
* **Rule**: Fall back to the entity's native registry icon (`state.attributes.icon`) or a domain default icon (e.g., `mdi:lightbulb` for lights, `mdi:power` for switches/plugs, `mdi:thermometer` for climates/stove) if the config icon properties are absent.

### 4. Case-Insensitive Weather Alerts (weather & hexa-tiles cards)
* **Constraint**: Weather alert states in Home Assistant (e.g., French "Vert", "Jaune", "Orange", "Rouge") might have case drift.
* **Rule**: Perform case-insensitive, trimmed exact string matching when evaluating alert states against green/yellow/orange/red configurations.

### 5. Empty States Handling (lights & climates cards)
* **Constraint**: Selectors might return no entities for a specific area or floor.
* **Rule**: When no active lights or climate entities are found, the card must render a clear empty state message (e.g. `"Aucune lumière"`) instead of displaying an empty panel.
* **Note (lights)**: "Aucune lumière configurée pour cet étage" is shown ONLY when `areasWithLights.length === 0` for the selected floor. A configured floor is kept (even with 0 lights) if its ID exists in `hass.floors`, preventing false empty state on initial HA load.

### 8. Floor/Area Initial Selection (lights card)
* **Constraint**: `first_floor_to_render` / `first_area_to_render` may refer to floors/areas with no lights (e.g. during HA entity registry load, or misconfiguration).
* **Rule**: Validate `first_floor_to_render` by ID existence in `hass.floors` only — NOT by light count. Validate `first_area_to_render` by presence in the active floor's area list — NOT by light count. Fallback only when ID is truly absent from HA.

### 6. Selective Sensor Visibility (stove & vehicles cards)
* **Constraint**: Electric-only, combustion-only, or custom stove sensors might omit specific gauge or state parameters.
* **Rule**: Check for the presence of each optional sensor configuration key. If the key is omitted, hide the corresponding UI gauge or state badge dynamically, enabling clean rendering for EV-only or ICE-only vehicles.

### 7. Climates HVAC Mode Fallback (climates card)
* **Constraint**: Unmapped HVAC modes in HA (e.g. `dry`, `fan_only`) might crash the icon/color lookups.
* **Rule**: If a mode is not mapped in `state_icons` or `state_colors`, fall back safely to the default `off` mode icon and color.

---

## File Tree

```
src/cards/
├── hexa_tiles/
│   ├── card.ts             [MODIFY] Rewrite TS — config YAML inchangée
│   ├── editor.ts           [MODIFY] Migration TS — pilotée par config-metadata.ts
│   ├── config-metadata.ts  [MODIFY] Migration TS — schéma identique
│   ├── const.ts            [MODIFY] Migration TS
│   └── style.ts            [MODIFY] Migration TS
├── lights/                 [MODIFY] même pattern
├── climates/               [MODIFY] même pattern
├── plugs/                  [MODIFY] même pattern
├── weather/                [MODIFY] même pattern
├── stove/                  [MODIFY] même pattern
├── vehicles/               [MODIFY] même pattern
└── vacuum/                 [MODIFY] même pattern
```

---

## Cross-Spec Contracts

 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `sci-fi-hexa-tiles` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-lights` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-climates` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-plugs` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-weather` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-stove` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-vehicles` | Dashboard HA | Registered custom Lovelace card |
| `sci-fi-vacuum` | Dashboard HA | Registered custom Lovelace card |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `SciFiBaseCard` | Spec 03 | Standard card parent class |
| `<sf-icon>` | Spec 04 | Icon renderer |

| `getFloors()`, `getLightEntities()` etc. | Spec 02 | Domain selectors |

 ### Public Interface
| Element | Signature | Description |
|---|---|---|
| `sci-fi-*` tags | Custom Elements | Lovelace custom cards registered globally, instantiated by Home Assistant. No JS public API exposed. |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Renommer un champ YAML** | `entity_id` à la place de `entity` dans stove/vacuum | Utiliser exactement les noms de `config-metadata.js` v0.9.6 |
| 2 | **Supprimer une feature** | Enlever `shortcuts` du vacuum | Toute feature de v0.9.6 doit être présente |
| 3 | **Réduire le schéma sensors** | `sensors: {power: string, energy: string}` pour plugs | `sensors` = dict keyed par entity_id avec `show/name/power/icon` |
| 4 | **Remplacer config-metadata** | Mettre des types TS simples à la place | Migrer `config-metadata.js` en `.ts` — ne pas supprimer |
| 5 | **Inline styling duplication** | Redefining styles across cards | Import common classes from `common.ts` |
| 6 | **Heavy state calculations** | Recomputing arrays in render | Delegate tasks to selector utility functions |
| 7 | **Dynamic CDN load of Chart.js** | `import('https://cdn.jsdelivr.net/npm/chart.js')` | Bundle Chart.js in the IIFE — never load from CDN |
| 8 | **`window.location.assign()` for HA navigation** | Replaces entire SPA | Use `window.history.pushState()` + `location-changed` CustomEvent |
| 9 | **`state_icons`/`state_colors`/`mode_icons`/`mode_colors` absents dans climates** | Feature manquante | Ces 4 sections sont obligatoires dans la card climates |
| 10 | **Section `alert` absente dans weather** | Feature manquante | La section `alert` est obligatoire dans la card weather |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-501 | Unit | HexaTiles respecte le champ `entity` (pas `entity_id`) | YAML tile avec `entity: climate.clou` | Tile lit `climate.clou` depuis hass |
| TC-502 | Unit | WeatherCard lit `weather_entity` (pas `weather_entity_id`) | `weather_entity: weather.test` | Card initialise avec cette entité |
| TC-503 | Unit | WeatherCard render l'`alert` | Config avec section `alert` | Badge alerte visible selon état |
| TC-504 | Unit | ClimatesCard applique `state_icons` custom | `state_icons.heat: mdi:fire` | Icône personnalisée affichée |
| TC-505 | Unit | PlugsCard accepte sensors dict | `sensors: {sensor.power: {show: true, power: true}}` | Sensor affiché avec graph |
| TC-506 | Unit | VacuumCard execute un shortcut | Click shortcut "Bureau" | `callService` avec `segments: [16]` |
| TC-507 | Unit | StoveCard lit `sensor_inside_temperature` | Config stove complète | Température intérieure affichée |
| TC-508 | Unit | VehiclesCard affiche `fuel_quantity` | Config vehicles avec `fuel_quantity` | Jauge carburant visible |
| IT-501 | Integration | 8 cartes s'enregistrent | Load `sci-fi.min.js` | `customElements.get('sci-fi-*')` retourne toutes les classes |
| IT-502 | Integration | Backup YAML `plugs.yaml` charge sans erreur | `"yaml backup"/plugs.yaml` | Card visible, 0 console error |
| IT-503 | Integration | Backup YAML `vacuum.yaml` charge sans erreur | `"yaml backup"/vacuum.yaml` | Shortcuts Dobby visibles |
| IT-504 | Integration | Backup YAML `climate.yaml` charge sans erreur | `"yaml backup"/climate.yaml` | Icônes et couleurs custom appliqués |
| IT-505 | Integration | Editor synchronise configuration | Change toggle en editor | Dispatche `config-changed` valide |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Champ YAML inconnu | `__validateConfig` — clé non dans metadata | Log warning console | Config partielle chargée avec défauts |
| Champ mandatory manquant | `__validateConfig` — mandatory = true | Throw `Error('Missing X mandatory config parameter.')` | `SciFiBaseCard.render()` error boundary → error card |
| Entity unavailable | Missing entity in HASS state | Display warning badge | Show entity unavailable placeholder text |
| Chart.js Init Failure | `new Chart()` throws | Catch exception | Render CSS grid fallback avec chiffres bruts |
