# Discovery — ha-sci-fi v0.9.6
> Document de référence exhaustif. À mettre à jour à chaque évolution significative.
> Généré le 2026-05-24. Ne pas modifier le code sans avoir relu ce document.

---

## 1. Architecture globale

### Technologie
- **Langage** : JavaScript ES Modules (pas de TypeScript)
- **Framework UI** : [Lit 3](https://lit.dev/) (`lit@3.2.1`)
- **Bundler** : Rollup 2.79 — produit `dist/sci-fi.min.js`
- **Localisation** : `@lit/localize` avec fichiers `src/locales/locales/fr.js`
- **Charts** : `chart.js@4.4.7`
- **Utilitaires** : `lodash-es`, `memoize-one`, `idb-keyval`

### Entrée
- `src/sci-fi.js` — enregistre toutes les cards + composants

### Pattern commun à toutes les cards
```
src/cards/<card_name>/
  card.js            ← logique de rendu (extends SciFiBaseCard)
  editor.js          ← UI de configuration dans HA (extends SciFiBaseEditor)
  config-metadata.js ← schéma de config (clé → {mandatory, type, default, data...})
  const.js           ← constantes de la card
  style.js           ← CSS Lit
  style_editor.js    ← CSS Lit pour l'éditeur
  import.js          ← re-exports
```

### Classes de base
| Classe | Fichier | Rôle |
|--------|---------|------|
| `SciFiBaseCard` | `src/helpers/utils/base-card.js` | LitElement + validation config via `configMetadata` + i18n |
| `SciFiBaseEditor` | `src/helpers/utils/base_editor.js` | LitElement + rendu éditeur générique |
| `buildStubConfig()` | `src/helpers/utils/base-card.js` | Génère stub config depuis configMetadata pour `getStubConfig()` |

### Validation de config
La validation est **pilotée par `config-metadata.js`** — chaque card définit son schéma :
```js
{ key: { mandatory, type, default, range?, data?, data_type? } }
```
`__validateConfig()` dans `base-card.js` parcourt récursivement ce schéma.

---

## 2. Inventaire des cards

### 2.1 `sci-fi-hexa-tiles` — Dashboard principal

**Fichiers** : `src/cards/hexa_tiles/` (card: 296 lignes, editor: 457)

**Config schema** (`config-metadata.js`) :
```yaml
header_message: string (optionnel)
weather:
  activate: boolean
  weather_entity: string        # ← NOM EXACT (pas weather_entity_id !)
  weather_alert_entity: string  # ← NOM EXACT
  link: string
  state_green/yellow/orange/red: string
tiles[]:
  standalone: boolean
  entity: string                # ← NOM EXACT (pas entity_id !)
  entity_kind: string           # type d'entité (light, climate, vacuum...)
  entities_to_exclude[]: string
  active_icon: string
  inactive_icon: string
  name: string
  state_on[]: string            # états considérés actifs
  state_error: string
  link: string                  # navigation (ex: "lights")
  visibility[]: string          # person entity IDs
```

> ⚠️ **CRITIQUE** : `entity` (pas `entity_id`), `weather_entity` (pas `weather_entity_id`).
> La v1.0.0 a renommé ces champs — c'est un breaking change qui casse les dashboards existants.

---

### 2.2 `sci-fi-lights` — Gestion des lumières

**Fichiers** : `src/cards/lights/` (card: 356 lignes, editor: 347)

**Config schema** :
```yaml
header_message: string
default_icon_on: string (default: mdi:lightbulb-on-outline)
default_icon_off: string (default: mdi:lightbulb-outline)
first_floor_to_render: string   # slug du premier étage affiché
first_area_to_render: string    # slug de la première pièce affichée
ignored_entities[]: string      # ← NOM EXACT (pas ignored_entity_ids !)
custom_entities:                # ← NOM EXACT (pas entity_overrides !)
  "<entity_id>":
    name: string
    icon_on: string
    icon_off: string
```

> ⚠️ **CRITIQUE** : `ignored_entities` et `custom_entities` — renommés à tort en v1.0.0.

---

### 2.3 `sci-fi-climates` — Radiateurs

**Fichiers** : `src/cards/climates/` (card: 311 lignes, editor: 290)

**Config schema** :
```yaml
entities_to_exclude[]: string   # ← NOM EXACT (pas excluded_entity_ids !)
header:
  display: boolean
  icon_winter_state: string     (default: mdi:thermometer-chevron-up)
  message_winter_state: string  (default: 'Winter is coming')
  icon_summer_state: string     (default: mdi:thermometer-chevron-down)
  message_summer_state: string  (default: 'Summer time')
state_icons:
  auto: string   (default: sci:radiator-auto)
  off: string    (default: sci:radiator-off)
  heat: string   (default: sci:radiator-heat)
state_colors:
  auto/off/heat: string (hex color)
mode_icons:
  frost_protection/eco/comfort/comfort-1/comfort-2/boost: string
mode_colors:
  frost_protection/eco/comfort/comfort-1/comfort-2/boost: string (hex)
```

> ⚠️ **CRITIQUE** : `state_icons`, `state_colors`, `mode_icons`, `mode_colors` — entièrement supprimés en v1.0.0.

---

### 2.4 `sci-fi-plugs` — Prises connectées

**Fichiers** : `src/cards/plugs/` (card: 427 lignes, editor: 370)

**Config schema** :
```yaml
devices[]:
  device_id: string (mandatory)
  entity_id: string (mandatory)
  active_icon: string   (default: mdi:power-socket-fr)
  inactive_icon: string (default: sci:power-socket-fr-off)
  name: string
  sensors:              # dict keyed by entity_id
    "<entity_id>":
      name: string
      show: boolean     # afficher dans UI ?
      power: boolean    # est-ce le capteur de puissance (pour graph) ?
```

> ⚠️ **CRITIQUE** : `sensors` est un **dictionnaire** keyed par entity_id avec `show/name/power` par sensor.
> La v1.0.0 a réduit à `{power: string, energy: string}` — perd toute la configuration fine.

---

### 2.5 `sci-fi-stove` — Poêle à granulés

**Fichiers** : `src/cards/stove/` (card: 452 lignes, editor: 225)

**Config schema** :
```yaml
entity: string (mandatory)              # ← NOM EXACT (pas entity_id !)
sensors:
  sensor_actual_power: string
  sensor_combustion_chamber_temperature: string
  sensor_inside_temperature: string     # MANQUANT en v1.0.0
  sensor_pellet_quantity: string
  sensor_power: string                  # MANQUANT en v1.0.0
  sensor_status: string                 # MANQUANT en v1.0.0
  sensor_fan_speed: string              # MANQUANT en v1.0.0
  sensor_pressure: string               # MANQUANT en v1.0.0
  sensor_time_to_service: string        # MANQUANT en v1.0.0
storage_counter: string                 # MANQUANT en v1.0.0
pellet_quantity_threshold: number [0,1] # MANQUANT en v1.0.0
storage_counter_threshold: number [0,1] # MANQUANT en v1.0.0
```

---

### 2.6 `sci-fi-vacuum` — Aspirateur robot

**Fichiers** : `src/cards/vacuum/` (card: 222 lignes, editor: 470)

**Config schema** :
```yaml
vacuums[]:
  entity: string (mandatory)            # ← NOM EXACT (pas entity_id !)
  start/pause/stop/return_to_base/set_fan_speed: boolean
  sensors:
    map: string
    battery: string
    mop_intensite: string               # ← "intensite" (FR) pas "intensity"
    current_clean_area: string
    current_clean_duration: string
  shortcuts:                            # ENTIÈREMENT MANQUANT en v1.0.0
    service: string
    command: string
    description[]:
      icon: string
      name: string
      segments[]: number
```

> ⚠️ **CRITIQUE** : `entity` (pas `entity_id`), `mop_intensite` (pas `mop_intensity`), `shortcuts` complètement absent.

---

### 2.7 `sci-fi-vehicles` — Véhicules

**Fichiers** : `src/cards/vehicles/` (card: 170 lignes, editor: 252)

**Config schema** :
```yaml
vehicles[]:
  id: string (mandatory)
  name: string (mandatory)
  charging: string
  lock_status: string
  location: string
  battery_autonomy: string              # MANQUANT en v1.0.0
  fuel_autonomy: string                 # MANQUANT en v1.0.0
  battery_level: string
  location_last_activity: string        # MANQUANT en v1.0.0
  charge_state: string                  # MANQUANT en v1.0.0
  plug_state: string                    # MANQUANT en v1.0.0
  mileage: string
  fuel_quantity: string                 # MANQUANT en v1.0.0
  charging_remaining_time: string       # MANQUANT en v1.0.0
```

---

### 2.8 `sci-fi-weather` — Météo

**Fichiers** : `src/cards/weather/` (card: 449 lignes, editor: 185)

**Config schema** :
```yaml
weather_entity: string (mandatory)      # ← NOM EXACT (pas weather_entity_id !)
weather_daily_forecast_limit: number [0,15] (default: 10)
chart_first_kind_to_render: string (default: 'temperature')
alert:
  entity_id: string (mandatory si section présente)
  state_green/yellow/orange/red: string
```

> ⚠️ **CRITIQUE** : `weather_entity` (pas `weather_entity_id`), `alert` section entièrement absente en v1.0.0.

---

## 3. Composants partagés

```
src/components/
  buttons/         ← sf-button, sf-button-card, sf-button-card-select
  icons/           ← sf-icon, sf-icon-weather, sf-iconset, sf-svg-icon
  inputs/          ← sf-input, sf-input-chips, sf-input-color-picker,
                      sf-input-dropdown (entity/device/icon/multi), sf-input-slider
  landspeeder/     ← sf-landspeeder (SVG animé)
  sf-accordion.js
  sf-circle_progress_bar.js
  sf-hexa-row.js
  sf-person.js
  sf-radiator.js
  sf-stack_bar.js
  sf-stove.js
  sf-tabs.js
  sf-tiles.js
  sf-toast.js
  sf-toggle-switch.js
  sf-wheel.js
```

---

## 4. Helpers / domaine

```
src/helpers/entities/
  climate/          ← Climate entity wrapper + constantes
  light/            ← Light entity wrapper + constantes
  plug/             ← Plug entity wrapper + constantes (getHistory via websocket)
  sensor/           ← Sensor, LockSensor, SelectSensor wrappers
  vacuum/           ← Vacuum entity wrapper
  vehicle/          ← Vehicle entity wrapper
  counter.js        ← Counter entity
  device.js         ← Device (device registry)
  house.js          ← House (floors/areas from HA area registry)
  person.js         ← Person entity
  weather.js        ← Weather entity
  zone.js           ← Zone entity
src/helpers/styles/
  common_style.js   ← CSS partagé toutes les cards
  editor_common_style.js ← CSS partagé éditeurs
src/helpers/utils/
  base-card.js      ← SciFiBaseCard + buildStubConfig + __validateConfig
  base_editor.js    ← SciFiBaseEditor
  utils.js          ← Utilitaires divers
```

---

## 5. Build

### Commandes
| Script | Effet |
|--------|-------|
| `npm run build-release` | Format + prepare-env + rollup + clean-up → `dist/sci-fi.min.js` |
| `npm run build-test` | Idem + bump patch version |
| `npm run format` | Prettier sur tous les .js |
| `npm run prepare-release` | update-local + build-release + git commit + push |

### Process de build
1. Copie `src/` → `temp/`
2. Remplace `temp/build/const.js` par `const.js.PROD` (URLs de prod)
3. Rollup bundle → `sci-fi.min.js`
4. Déplace dans `dist/`

---

## 6. Déploiement

- **Distribution** : HACS — `dist/sci-fi.min.js`
- **Branche stable** : `main` (actuellement v0.9.6)
- **Branche de travail futur** : `v1.0.0-wip`
- **Workflow manuel** : l'utilisateur copie `dist/sci-fi.min.js` dans son instance HA

---

## 7. Règles critiques pour tout futur refactoring

> Ces règles sont déduites des erreurs de la tentative v1.0.0. NE PAS RÉPÉTER.

1. **Noms de champs de config = contrat public** — toute renommage = breaking change pour les utilisateurs
   - Champs à NE PAS renommer : `entity`, `weather_entity`, `weather_alert_entity`, `ignored_entities`, `custom_entities`, `entities_to_exclude`, `mop_intensite`
2. **`config-metadata.js` = source de vérité** — avant tout refactoring, vérifier config-metadata de la carte concernée
3. **L'éditeur (`editor.js`) est couplé au schéma** — modifier le schéma = modifier l'éditeur en même temps
4. **`shortcuts` vacuum est critique** — c'est la feature de nettoyage par pièce, ne pas supprimer
5. **`state_icons/colors` et `mode_icons/colors` climates sont critiques** — customisation visuelle par état
6. **`alert` section weather est critique** — alerte météo départementale
7. **`pellet_quantity_threshold`, `storage_counter`, seuils stove** — logique métier du poêle
8. **Valider les backups YAML avant chaque release** — les fichiers `yaml backup/*.yaml` sont la vérité terrain

---

## 8. Tableau de conformité — backups YAML vs config-metadata

| Card | Backup YAML | Config-metadata v0.9.6 | Conforme ? |
|------|-------------|------------------------|------------|
| hexa-tiles | `yaml backup/hexa.yaml` | `hexa_tiles/config-metadata.js` | ✅ Oui |
| lights | `yaml backup/lights.yaml` | `lights/config-metadata.js` | ✅ Oui |
| climates | `yaml backup/climate.yaml` | `climates/config-metadata.js` | ✅ Oui |
| plugs | `yaml backup/plugs.yaml` | `plugs/config-metadata.js` | ✅ Oui |
| stove | `yaml backup/stove.yaml` | `stove/config-metadata.js` | ✅ Oui |
| vacuum | `yaml backup/vacuum.yaml` | `vacuum/config-metadata.js` | ✅ Oui |
| vehicles | `yaml backup/vehicle.yaml` | `vehicles/config-metadata.js` | ✅ Oui |
| weather | `yaml backup/weather.yaml` | `weather/config-metadata.js` | ✅ Oui |
