# Migration v1 → v2

> Guide de migration pour passer de **sci-fi cards v1** à **v2**.
> La v2 est une réécriture complète en TypeScript + Lit 3.
> **Certains champs YAML ont été renommés** — ce document liste tous les breaking changes.

---

## 1. Installation

Remplace le fichier dans ta config HACS :

```yaml
# configuration.yaml (lovelace resources)
- url: /hacsfiles/ha-sci-fi/dist/sci-fi.min.js
  type: module
```

Le nom du fichier ne change pas : `dist/sci-fi.min.js`.

---

## 2. Breaking changes par carte

### `sci-fi-lights`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `ignored_entities` | `ignored_entity_ids` | Renommé pour cohérence |
| `custom_entities` | `entity_overrides` | Renommé — même structure |

**Exemple v1 :**
```yaml
type: custom:sci-fi-lights
ignored_entities:
  - light.debug
custom_entities:
  light.salon:
    name: Salon Principal
```

**Exemple v2 :**
```yaml
type: custom:sci-fi-lights
ignored_entity_ids:
  - light.debug
entity_overrides:
  light.salon:
    name: Salon Principal
    icon_on: mdi:lightbulb
    icon_off: mdi:lightbulb-outline
```

---

### `sci-fi-climates`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `entities_to_exclude` | `excluded_entity_ids` | Renommé pour cohérence |
| `header.season_entity` | `header.season_entity_id` | Suffixe `_id` ajouté |

**Exemple v1 :**
```yaml
type: custom:sci-fi-climates
entities_to_exclude:
  - climate.test
header:
  display: true
  season_entity: sensor.season
```

**Exemple v2 :**
```yaml
type: custom:sci-fi-climates
excluded_entity_ids:
  - climate.test
header:
  display: true
  season_entity_id: sensor.season
  icon_winter_state: mdi:snowflake
  icon_summer_state: mdi:white-balance-sunny
```

---

### `sci-fi-weather`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `weather_entity` | `weather_entity_id` | Suffixe `_id` ajouté |

**Exemple v1 :**
```yaml
type: custom:sci-fi-weather
weather_entity: weather.forecast_home
```

**Exemple v2 :**
```yaml
type: custom:sci-fi-weather
weather_entity_id: weather.forecast_home
weather_daily_forecast_limit: 5
chart_first_kind_to_render: temperature
```

---

### `sci-fi-stove`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `entity` | `entity_id` | Renommé pour cohérence HA |

**Exemple v1 :**
```yaml
type: custom:sci-fi-stove
entity: climate.poele
sensors:
  sensor_actual_power: sensor.poele_power
```

**Exemple v2 :**
```yaml
type: custom:sci-fi-stove
entity_id: climate.poele
sensors:
  sensor_actual_power: sensor.poele_power
  sensor_combustion_chamber_temperature: sensor.poele_temp
  sensor_pellet_quantity: sensor.poele_granules
```

---

### `sci-fi-vacuum`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `entity` (par vacuum) | `entity_id` | Renommé — dans chaque entrée du tableau `vacuums` |

**Exemple v1 :**
```yaml
type: custom:sci-fi-vacuum
vacuums:
  - entity: vacuum.robot
    sensors:
      battery: sensor.robot_battery
```

**Exemple v2 :**
```yaml
type: custom:sci-fi-vacuum
vacuums:
  - entity_id: vacuum.robot
    sensors:
      battery: sensor.robot_battery
      current_clean_area: sensor.robot_area
      map: camera.robot_map
    start: true
    pause: true
    stop: true
    return_to_base: true
    set_fan_speed: true
```

---

### `sci-fi-plugs` *(inchangé dans la structure principale)*

Aucun breaking change sur les noms de champs.

```yaml
type: custom:sci-fi-plugs
devices:
  - device_id: ma_prise
    entity_id: switch.prise_salon
    name: Prise Salon
    active_icon: mdi:power-plug
    inactive_icon: mdi:power-plug-off
    sensors:
      power: sensor.prise_salon_power
      energy: sensor.prise_salon_energy
```

---

### `sci-fi-hexa-tiles`

| Champ v1 | Champ v2 | Notes |
|---|---|---|
| `weather.weather_entity` | `weather.weather_entity_id` | Suffixe `_id` ajouté |
| `weather.weather_alert` | `weather.weather_alert_entity_id` | Suffixe `_id` ajouté |

**Exemple v2 complet :**
```yaml
type: custom:sci-fi-hexa-tiles
weather:
  activate: true
  weather_entity_id: weather.forecast_home
  weather_alert_entity_id: sensor.vigilance_meteorologique
  state_green: Vert
  state_yellow: Jaune
  state_orange: Orange
  state_red: Rouge
  link: /lovelace/meteo
persons:
  - person.adrien
  - person.marie
tiles:
  - entity_id: input_boolean.mode_vacances
    icon: mdi:palm-tree
    name: Vacances
    tap_action:
      action: toggle
```

---

### `sci-fi-vehicles` *(inchangé — nouvelle carte en v2)*

Structure identique à la v1 (la carte a été réécrite mais l'interface YAML reste compatible).

---

## 3. Champs ajoutés en v2 (optionnels, non breaking)

Toutes les cartes acceptent désormais :

```yaml
header_message: "Mon titre personnalisé"
```

---

## 4. Résumé des renommages

| Ancien champ | Nouveau champ | Carte(s) |
|---|---|---|
| `entity` | `entity_id` | stove, vacuum (par entrée) |
| `weather_entity` | `weather_entity_id` | weather, hexa-tiles |
| `weather_alert` | `weather_alert_entity_id` | hexa-tiles |
| `ignored_entities` | `ignored_entity_ids` | lights |
| `custom_entities` | `entity_overrides` | lights |
| `entities_to_exclude` | `excluded_entity_ids` | climates |
| `header.season_entity` | `header.season_entity_id` | climates |

---

## 5. Rollback

Si tu veux revenir à la v1, le fichier `dist/sci-fi.min.js` est disponible sur la branche `main`.

```bash
git checkout main -- dist/sci-fi.min.js
```
