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

```typescript
interface SciFiHexaTilesWeatherConfig {
  readonly activate?: boolean;
  readonly weather_entity: string;          // ← "weather_entity" (PAS weather_entity_id)
  readonly weather_alert_entity?: string;   // ← "weather_alert_entity" (PAS weather_alert_entity_id)
  readonly link?: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

interface SciFiHexaTileConfig {
  readonly standalone?: boolean;
  readonly entity?: string;                 // ← "entity" (PAS entity_id) — pour tiles standalone
  readonly entity_kind?: string;            // type domaine (light, climate, vacuum...)
  readonly entities_to_exclude?: readonly string[];
  readonly active_icon?: string;
  readonly inactive_icon?: string;
  readonly name?: string;
  readonly state_on?: readonly string[];    // états considérés actifs
  readonly state_error?: string;
  readonly link?: string;                   // navigation (ex: "lights")
  readonly visibility?: readonly string[];  // person entity IDs
}

interface SciFiHexaTilesConfig {
  readonly header_message?: string;
  readonly weather?: SciFiHexaTilesWeatherConfig;
  readonly tiles?: readonly SciFiHexaTileConfig[];
}
```

**Exemple de config validée (backup production) :**
```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Hey, welcome back !"
weather:
  activate: true
  weather_entity: weather.la_chapelle_sur_erdre
  weather_alert_entity: sensor.44_weather_alert
  link: weather
  state_green: Vert
tiles:
  - standalone: true
    entity: climate.clou
    active_icon: sci:stove-heat
    inactive_icon: sci:stove-off
    name: Poêle
    state_on: [cool, heat]
    link: stove
```

---

### sci-fi-lights

```typescript
interface SciFiEntityOverride {
  readonly name?: string;
  readonly icon_on?: string;
  readonly icon_off?: string;
}

interface SciFiLightsConfig {
  readonly header_message?: string;
  readonly default_icon_on?: string;        // default: mdi:lightbulb-on-outline
  readonly default_icon_off?: string;       // default: mdi:lightbulb-outline
  readonly first_floor_to_render?: string;
  readonly first_area_to_render?: string;
  readonly ignored_entities?: readonly string[];              // ← "ignored_entities" (PAS ignored_entity_ids)
  readonly custom_entities?: Readonly<Record<string, SciFiEntityOverride>>; // ← "custom_entities" (PAS entity_overrides)
}
```

**Exemple :**
```yaml
type: custom:sci-fi-lights
header_message: Lumières
default_icon_on: mdi:lightbulb-on-outline
ignored_entities:
  - light.la_boite_a_cha_day_ambient_colour
custom_entities:
  light.nous_salon:
    name: "Étoile"
    icon_on: mdi:star
    icon_off: mdi:star-outline
```

**Comportement de sélection initiale (floor/area) :**

| Config | Comportement |
|---|---|
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

```typescript
interface SciFiClimatesHeaderConfig {
  readonly display?: boolean;
  readonly icon_winter_state?: string;      // default: mdi:thermometer-chevron-up
  readonly message_winter_state?: string;   // default: 'Winter is coming'
  readonly icon_summer_state?: string;      // default: mdi:thermometer-chevron-down
  readonly message_summer_state?: string;   // default: 'Summer time'
}

interface SciFiStateIconsConfig {
  readonly auto?: string;   // default: sci:radiator-auto
  readonly off?: string;    // default: sci:radiator-off
  readonly heat?: string;   // default: sci:radiator-heat
}

interface SciFiStateColorsConfig {
  readonly auto?: string;   // hex — default: #669cd2
  readonly off?: string;    // hex — default: #6c757d
  readonly heat?: string;   // hex — default: #ff7f50
}

interface SciFiModeIconsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

interface SciFiModeColorsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

interface SciFiClimatesConfig {
  readonly entities_to_exclude?: readonly string[];   // ← "entities_to_exclude" (PAS excluded_entity_ids)
  readonly header?: SciFiClimatesHeaderConfig;
  readonly state_icons?: SciFiStateIconsConfig;       // ← NE PAS SUPPRIMER
  readonly state_colors?: SciFiStateColorsConfig;     // ← NE PAS SUPPRIMER
  readonly mode_icons?: SciFiModeIconsConfig;         // ← NE PAS SUPPRIMER
  readonly mode_colors?: SciFiModeColorsConfig;       // ← NE PAS SUPPRIMER
}
```

**Exemple :**
```yaml
type: custom:sci-fi-climates
entities_to_exclude:
  - climate.clou
state_icons:
  auto: sci:radiator-auto
  heat: sci:radiator-heat
state_colors:
  heat: "#ff7f50"
mode_icons:
  eco: mdi:leaf
  comfort: mdi:sun-thermometer-outline
mode_colors:
  eco: "#96d35f"
  comfort: "#ffff8f"
```

---

### sci-fi-plugs

```typescript
interface SciFiPlugSensorEntry {
  readonly name?: string;
  readonly show?: boolean;   // afficher dans UI ?
  readonly power?: boolean;  // est-ce le capteur de puissance (pour graph) ?
  readonly icon?: string;    // (optionnel — lu depuis state HA si absent)
}

interface SciFiPlugDevice {
  readonly device_id: string;
  readonly entity_id: string;
  readonly name?: string;
  readonly active_icon?: string;    // default: mdi:power-socket-fr
  readonly inactive_icon?: string;  // default: sci:power-socket-fr-off
  // sensors = DICT keyed par entity_id (PAS une liste, PAS {power: string, energy: string})
  readonly sensors?: Readonly<Record<string, SciFiPlugSensorEntry>>;
}

interface SciFiPlugsConfig {
  readonly devices?: readonly SciFiPlugDevice[];
}
```

**Exemple :**
```yaml
type: custom:sci-fi-plugs
devices:
  - device_id: 31428114e049a5557c8a8a05e2b7f9bd
    entity_id: switch.nous_ventilateur_leonard
    active_icon: mdi:fan
    inactive_icon: mdi:fan-off
    name: Ventilateur Léonard
    sensors:
      sensor.nous_ventilateur_leonard_power:
        show: false
        power: true
      sensor.nous_ventilateur_leonard_energy:
        show: true
        name: Énergie
        icon: mdi:lightning-bolt
        power: false
      switch.nous_ventilateur_leonard_child_lock:
        show: true
        name: Child lock
        icon: mdi:account-lock
        power: false
```

---

### sci-fi-weather

```typescript
interface SciFiWeatherAlertConfig {
  readonly entity_id: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

interface SciFiWeatherConfig {
  readonly weather_entity: string;                          // ← "weather_entity" (PAS weather_entity_id)
  readonly weather_daily_forecast_limit?: number;           // range [0, 15], default: 10
  readonly chart_first_kind_to_render?: 'temperature' | 'precipitation' | 'wind';
  readonly alert?: SciFiWeatherAlertConfig;                 // ← NE PAS SUPPRIMER
}
```

**Exemple :**
```yaml
type: custom:sci-fi-weather
weather_entity: weather.la_chapelle_sur_erdre
weather_daily_forecast_limit: 10
alert:
  entity_id: sensor.44_weather_alert
  state_green: Vert
  state_yellow: Jaune
  state_orange: Orange
  state_red: Rouge
```

---

### sci-fi-stove

```typescript
interface SciFiStoveSensors {
  readonly sensor_actual_power?: string;
  readonly sensor_combustion_chamber_temperature?: string;
  readonly sensor_inside_temperature?: string;        // ← NE PAS SUPPRIMER
  readonly sensor_pellet_quantity?: string;
  readonly sensor_power?: string;                     // ← NE PAS SUPPRIMER
  readonly sensor_status?: string;                    // ← NE PAS SUPPRIMER
  readonly sensor_fan_speed?: string;                 // ← NE PAS SUPPRIMER
  readonly sensor_pressure?: string;                  // ← NE PAS SUPPRIMER
  readonly sensor_time_to_service?: string;           // ← NE PAS SUPPRIMER
}

interface SciFiStoveConfig {
  readonly entity: string;                            // ← "entity" (PAS entity_id)
  readonly sensors?: SciFiStoveSensors;
  readonly storage_counter?: string;                  // ← NE PAS SUPPRIMER
  readonly pellet_quantity_threshold?: number;        // range [0,1] — NE PAS SUPPRIMER
  readonly storage_counter_threshold?: number;        // range [0,1] — NE PAS SUPPRIMER
}
```

**Exemple :**
```yaml
type: custom:sci-fi-stove
entity: climate.clou
sensors:
  sensor_combustion_chamber_temperature: sensor.clou_combustion_chamber_temperature
  sensor_inside_temperature: sensor.frient_smoke_detector_salon_temperature
  sensor_fan_speed: sensor.clou_fan_speed
  sensor_pressure: sensor.clou_pressure
  sensor_actual_power: sensor.clou_power
  sensor_power: sensor.smart_energy_monitor_poele_power
  sensor_pellet_quantity: sensor.clou_pellet_quantity
  sensor_time_to_service: sensor.clou_time_to_service
  sensor_status: binary_sensor.clou_stove_status
pellet_quantity_threshold: 0.3
storage_counter_threshold: 0.1
storage_counter: counter.pellet_stock
```

---

### sci-fi-vacuum

```typescript
interface SciFiVacuumSensors {
  readonly map?: string;
  readonly battery?: string;
  readonly mop_intensite?: string;           // ← "mop_intensite" (FR, PAS mop_intensity)
  readonly current_clean_area?: string;
  readonly current_clean_duration?: string;
}

interface SciFiVacuumShortcutDescription {
  readonly icon?: string;
  readonly name: string;
  readonly segments: readonly number[];
}

interface SciFiVacuumShortcuts {
  readonly service?: string;
  readonly command?: string;
  readonly description?: readonly SciFiVacuumShortcutDescription[];
}

interface SciFiVacuumEntry {
  readonly entity: string;                   // ← "entity" (PAS entity_id)
  readonly start?: boolean;
  readonly pause?: boolean;
  readonly stop?: boolean;
  readonly return_to_base?: boolean;
  readonly set_fan_speed?: boolean;
  readonly sensors?: SciFiVacuumSensors;
  readonly shortcuts?: SciFiVacuumShortcuts; // ← NE PAS SUPPRIMER
}

interface SciFiVacuumConfig {
  readonly vacuums: readonly SciFiVacuumEntry[];
}
```

**Exemple :**
```yaml
type: custom:sci-fi-vacuum
vacuums:
  - entity: vacuum.dobby
    sensors:
      battery: sensor.s7_batterie
      mop_intensite: select.s7_intensite_de_frottement
      current_clean_area: sensor.s7_surface_de_nettoyage
      map: image.s7_map_0
    start: true
    pause: true
    stop: true
    return_to_base: true
    shortcuts:
      service: vacuum.send_command
      command: app_segment_clean
      description:
        - name: Bureau
          icon: mdi:desk-lamp
          segments: [16]
        - name: Charlotte
          icon: mdi:teddy-bear
          segments: [18]
```

---

### sci-fi-vehicles

```typescript
interface SciFiVehicleEntry {
  readonly id: string;
  readonly name: string;
  readonly charging?: string;
  readonly lock_status?: string;
  readonly location?: string;
  readonly battery_autonomy?: string;         // ← NE PAS SUPPRIMER
  readonly fuel_autonomy?: string;            // ← NE PAS SUPPRIMER
  readonly battery_level?: string;
  readonly location_last_activity?: string;   // ← NE PAS SUPPRIMER
  readonly charge_state?: string;             // ← NE PAS SUPPRIMER
  readonly plug_state?: string;               // ← NE PAS SUPPRIMER
  readonly mileage?: string;
  readonly fuel_quantity?: string;            // ← NE PAS SUPPRIMER
  readonly charging_remaining_time?: string;  // ← NE PAS SUPPRIMER
}

interface SciFiVehiclesConfig {
  readonly vehicles: readonly SciFiVehicleEntry[];
}
```

**Exemple :**
```yaml
type: custom:sci-fi-vehicles
vehicles:
  - id: b35bbd24dc8783e010d0d9da45678554
    name: Captur II
    charging: binary_sensor.captur_ii_en_charge
    lock_status: binary_sensor.captur_ii_serrure
    location: device_tracker.captur_ii_emplacement
    battery_autonomy: sensor.captur_ii_autonomie_de_la_batterie
    fuel_autonomy: sensor.captur_ii_autonomie_en_carburant
    battery_level: sensor.captur_ii_batterie
    plug_state: sensor.captur_ii_etat_du_branchement
    mileage: sensor.captur_ii_kilometrage
    fuel_quantity: sensor.captur_ii_quantite_de_carburant
    charging_remaining_time: sensor.captur_ii_temps_de_charge_restant
```

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
