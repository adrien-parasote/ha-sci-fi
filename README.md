# 🛸 HA SCI-FI 🛸

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#)
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)
[![Tests](https://img.shields.io/badge/tests-137%20passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Lit](https://img.shields.io/badge/Lit-3.x-blueviolet)](#)

HA sci-fi is a collection of custom Lovelace cards for a minimalist sci-fi dashboard experience in Home Assistant.  
The goal: a single phone entry point to control your entire home.

> [!IMPORTANT]
> **v2.0 — Full rewrite** (Lit 3 + TypeScript 5, no CDN, 137 tests).  
> If you're upgrading from v1, see **[MIGRATION.md](./MIGRATION.md)** for the breaking changes.

---

# 📚 Table of contents

1. 🛠️ [How to install?](#how_to_install)
2. 🧩 [Available cards](#available_components)
   - ⬡ [Hexa-Tiles](#hexa_tiles)
   - 💡 [Lights](#lights_card)
   - 🌦️ [Weather](#weather_card)
   - 🌡️ [Climates](#climates_card)
   - 🪵🔥 [Stove](#stove_card)
   - 🚗 [Vehicles](#vehicles_card)
   - 🔌 [Plugs](#plugs_card)
   - 🖲 [Vacuum](#vacuum_card)
3. 🖼️ [Custom icons](#icon)
4. 🔧 [Developer / Local testing](#dev)
5. 👽 [Language / i18n](#lang)

---

# 🛠️ How to install? <a name="how_to_install"></a>

<details>
<summary>With HACS (Recommended)</summary>

<br>

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Click the 3-dot menu (top right) → **Custom repositories**
4. Add `https://github.com/adrien-parasote/ha-sci-fi`, type `Dashboard`, click **Add**
5. Find `ha-sci-fi` in **Available for download** and click **Download**
6. Tap **Reload** to finish

</details>

<details>
<summary>Without HACS (manual)</summary>

<br>

1. Download [dist/sci-fi.min.js](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/dist/sci-fi.min.js)
2. Copy it into your `<config>/www/ha-sci-fi/` folder
3. In your dashboard: top-right icon → **Edit dashboard** → **Manage resources**
4. Click **Add resource**, enter `/local/ha-sci-fi/sci-fi.min.js?v=2`, select **JavaScript Module**
5. Reload the page
6. After any update, bump the version number (`?v=2` → `?v=3`) to bust the cache

</details>

<br>

---

# 🧩 Available cards <a name="available_components"></a>

## ⬡ Sci-Fi Hexa-Tiles card <a name="hexa_tiles"></a>

> [!CAUTION]
> Designed for smartphone / single-panel HA. Tiles are not yet fully responsive.

### Description

Main dashboard card with hexagonal tiles. Each tile shows a global entity state (e.g. any light on?), a single entity, or a weather summary. Clicking a tile navigates to a dedicated dashboard view.

### Features

- Person presence tiles (photo + location zone)
- Weather tile (condition icon + temperature)
- Weather alert banner (green / yellow / orange / red)
- Custom tiles: standalone (1 entity) or kind (aggregate by type)
- Visibility filter per person

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_1.jpeg" width="300">

</details>

### Configuration

> [!TIP]
> Configurable via the HA UI editor.

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-hexa-tiles
```

#### Full

```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Hey, welcome back!"
weather:
  activate: true
  weather_entity_id: weather.home          # your weather entity
  weather_alert_entity_id: sensor.alert    # optional alert sensor
  link: /lovelace/weather                  # navigation path on tile click
  state_green: "Vert"
  state_yellow: "Jaune"
  state_orange: "Orange"
  state_red: "Rouge"
persons:
  - person.alice
  - person.bob
vehicles:
  - device_tracker.my_car
tiles:
  - entity_id: switch.tv
    name: TV
    icon: mdi:television
    tap_action:
      action: call-service
      service: switch.toggle
      service_data:
        entity_id: switch.tv
  - entity_id: light.salon
    name: Salon
    icon: mdi:lightbulb
    tap_action:
      action: navigate
      navigation_path: /lovelace/lights
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-hexa-tiles` | |
| `header_message` | String | | Header text | `''` |
| `weather` | Object | | Weather tile config | |
| `persons` | List\<String\> | | Person entity IDs to show | `[]` |
| `vehicles` | List\<String\> | | Device tracker entity IDs | `[]` |
| `tiles` | List\<Object\> | | Custom tile definitions | `[]` |

**`weather` options**

| Name | Type | Required | Description |
|---|---|---|---|
| `activate` | Boolean | | Show the weather tile | `false` |
| `weather_entity_id` | String | ✅ (if activate) | HA weather entity |
| `weather_alert_entity_id` | String | | Alert sensor entity |
| `link` | String | | Navigation path on click |
| `state_green/yellow/orange/red` | String | | Alert state values |

**`tiles[]` options**

| Name | Type | Required | Description |
|---|---|---|---|
| `entity_id` | String | ✅ | Entity to track |
| `name` | String | | Display name |
| `icon` | String | | `mdi:` icon |
| `tap_action` | Object | | Action on click (`navigate` or `call-service`) |

</details>

<br>

---

## 💡 Sci-Fi Lights card <a name="lights_card"></a>

### Description

Auto-discovers all `light` entities, groups them by floor and area.

### Features

- Global turn-on / turn-off button
- Per-floor summary (count on/off, floor icon from HA areas config)
- Per-area: area name, toggle, individual light buttons
- Sun phase display (dawn, day, dusk, night) if `sun.sun` is available

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_1.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-lights
```

#### Full

```yaml
type: custom:sci-fi-lights
header_message: "Lights"
ignored_entities:
  - light.ignored_light
custom_entities:
  light.christmas_tree:
    name: "Christmas tree"
    icon_on: mdi:pine-tree
    icon_off: mdi:pine-tree-variant-outline
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-lights` | |
| `header_message` | String | | Card header | |
| `ignored_entities` | List\<String\> | | Light entity IDs to hide | `[]` |
| `custom_entities` | Object | | Per-entity icon/name override | |

</details>

<br>

---

## 🌦️ Sci-Fi Weather card <a name="weather_card"></a>

### Description

Displays current weather conditions, alerts, hourly chart and daily forecast.  
Chart.js is **bundled** — works completely offline, no CDN dependency.

### Features

- Current condition icon (MDI mapping), temperature, humidity, wind
- Optional alert banner (green/yellow/orange/red)
- Hourly Chart.js temperature graph
- Daily forecast row

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather_edit.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-weather
weather_entity_id: weather.home
```

#### Full

```yaml
type: custom:sci-fi-weather
header_message: "Météo"
weather_entity_id: weather.home
weather_daily_forecast_limit: 5
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-weather` | |
| `weather_entity_id` | String | ✅ | HA weather entity | |
| `header_message` | String | | Card header | |
| `weather_daily_forecast_limit` | Integer | | Days of forecast to show | `5` |

</details>

<br>

---

## 🌡️ Sci-Fi Climates card <a name="climates_card"></a>

> [!CAUTION]
> Currently designed for `climate` entities of type **radiator** only.

### Description

Auto-discovers all `climate` entities, groups them by floor and area.

### Features

- Global average temperature, global eco/frost_protection toggle
- Per-floor and per-area grouping (icons from HA areas config)
- Per radiator: current temp, target temp, HVAC mode button, preset button
- Season icon if `sensor.season` (meteorological) is available

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_2.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-climates
```

#### Full

```yaml
type: custom:sci-fi-climates
header_message: "Radiateurs"
entities_to_exclude:
  - climate.excluded_radiator
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-climates` | |
| `header_message` | String | | Card header | |
| `entities_to_exclude` | List\<String\> | | Climate entity IDs to hide | `[]` |

</details>

<br>

---

## 🪵🔥 Sci-Fi Stove card <a name="stove_card"></a>

> [!NOTE]
> Based on [fumis integration](https://github.com/maheus/fumis_integration) by [maheus](https://github.com/maheus).

### Description

Dedicated card for a pellet stove — displays state, temperatures, sensors and actions.

### Features

- Graphical stove state (cool / heat / off)
- Internal pellet quantity and storage counter with alert thresholds
- Sensors: state, pressure, time to service, temperatures, power, fan speed
- Actions: mode, target temperature, preset

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_2.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-stove
entity: climate.my_stove
```

#### Full

```yaml
type: custom:sci-fi-stove
entity: climate.my_stove
sensors:
  sensor_actual_power: sensor.stove_actual_power
  sensor_power: sensor.stove_power
  sensor_combustion_chamber_temperature: sensor.stove_combustion_temp
  sensor_inside_temperature: sensor.stove_room_temp
  sensor_pellet_quantity: sensor.stove_pellet_quantity
  sensor_status: binary_sensor.stove_status
  sensor_fan_speed: sensor.stove_fan_speed
  sensor_pressure: sensor.stove_pressure
  sensor_time_to_service: sensor.stove_time_to_service
pellet_quantity_threshold: 0.4
storage_counter: counter.pellet_stock
storage_counter_threshold: 0.07
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-stove` | |
| `entity` | String | ✅ | Stove climate entity ID | |
| `sensors` | Object | | Additional stove sensors | |
| `pellet_quantity_threshold` | Float | | Alert threshold (0–1) | `0.5` |
| `storage_counter` | String | | Pellet bag counter entity | |
| `storage_counter_threshold` | Float | | Alert threshold (0–1) | `0.1` |

</details>

### Pellet storage counter automation

To auto-decrement your storage counter when the stove is refilled:

```yaml
alias: Pellet stock management
triggers:
  - trigger: state
    entity_id: sensor.stove_pellet_quantity
conditions:
  - condition: numeric_state
    entity_id: sensor.stove_pellet_quantity
    above: 99
actions:
  - action: counter.decrement
    target:
      entity_id: counter.pellet_stock
mode: single
```

<br>

---

## 🚗 Sci-Fi Vehicles card <a name="vehicles_card"></a>

> [!NOTE]
> Designed for [Renault integration](https://www.home-assistant.io/integrations/renault/) — but works with any EV via entity mapping.

### Description

EV/vehicle monitoring card: battery, range, charging state, lock, location, mileage.

### Features

- Battery level bar (green / yellow / red threshold)
- Charging state icon (dynamic `mdi:ev-station` vs `mdi:car-electric`)
- Range, mileage, location, lock state
- Multiple vehicles supported

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vehicle.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vehicle_edit.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-vehicles
vehicles:
  - id: my_vehicle
    name: My Car
```

#### Full

```yaml
type: custom:sci-fi-vehicles
header_message: "Véhicules"
vehicles:
  - id: my_vehicle
    name: My Car
    charging: binary_sensor.car_charging
    lock_status: binary_sensor.car_lock
    location: device_tracker.car_location
    battery_level: sensor.car_battery_level
    range: sensor.car_range
    mileage: sensor.car_mileage
```

#### Vehicle options

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | String | ✅ | Unique vehicle identifier |
| `name` | String | ✅ | Display name |
| `charging` | String | | `binary_sensor` — charging state |
| `lock_status` | String | | `binary_sensor` — locked/unlocked |
| `location` | String | | `device_tracker` entity |
| `battery_level` | String | | `sensor` — % battery |
| `range` | String | | `sensor` — km range |
| `mileage` | String | | `sensor` — total km |

</details>

<br>

---

## 🔌 Sci-Fi Plugs card <a name="plugs_card"></a>

### Description

Smart plug monitoring and control card with power chart.

### Features

- Plug state (on/off) with animated icon
- Power sensor chart (last 24h)
- Linked sensors display with actions
- Multi-plug footer navigator

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/plug_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/plug_2.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-plugs
devices: []
```

#### Full

```yaml
type: custom:sci-fi-plugs
header_message: "Prises"
devices:
  - device_id: my_plug_device_id
    entity_id: switch.my_plug
    name: My Plug
    active_icon: mdi:power-plug-outline
    inactive_icon: mdi:power-plug-off-outline
    sensors:
      sensor.my_plug_power:
        show: true
        name: Power
        power: true
```

#### Options

| Name | Type | Required | Description |
|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-plugs` |
| `devices` | List | ✅ | List of plug definitions |

**`devices[]` options**

| Name | Type | Required | Description |
|---|---|---|---|
| `device_id` | String | ✅ | HA device ID |
| `entity_id` | String | ✅ | `switch` entity |
| `name` | String | | Display name |
| `active_icon` | String | | MDI icon when on |
| `inactive_icon` | String | | MDI icon when off |
| `sensors` | Object | | Sensor entity map (see below) |

**`sensors` per entry**

| Name | Type | Description |
|---|---|---|
| `show` | Boolean | Display this sensor |
| `name` | String | Custom label |
| `power` | Boolean | Is this the power sensor (used for chart) |

</details>

<br>

---

## 🖲 Sci-Fi Vacuum card <a name="vacuum_card"></a>

### Description

Full-featured vacuum control card with live map, shortcuts and status.

### Features

- Battery + mop intensity bars
- State animation (cleaning, docked, sleeping, returning)
- Clean area and duration sensors
- Live map image (if camera sensor provided)
- Action bar: start, pause, stop, return to base
- Room shortcuts (segment cleaning)

### Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vacuum.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vacuum_edit_1.jpeg" width="300">

</details>

### Configuration

<details>
<summary>YAML</summary>

#### Minimal

```yaml
type: custom:sci-fi-vacuum
vacuums:
  entity: vacuum.my_vacuum
```

#### Full

```yaml
type: custom:sci-fi-vacuum
header_message: "Dobby"
vacuums:
  entity: vacuum.my_vacuum
  start: true
  pause: true
  stop: true
  return_to_base: true
  sensors:
    current_clean_area: sensor.vacuum_clean_area
    current_clean_duration: sensor.vacuum_clean_duration
    battery: sensor.vacuum_battery
    mop_intensite: sensor.vacuum_mop
    map: image.vacuum_live_map
  shortcuts:
    service: custom_service.call_segment
    command: command_params
    description:
      - name: Kitchen + Living
        icon: mdi:silverware-fork-knife
        segments:
          - 1
          - 2
```

#### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-vacuum` | |
| `vacuums.entity` | String | ✅ | Vacuum entity ID | |
| `vacuums.start/pause/stop/return_to_base` | Boolean | | Show action button | `true` |
| `vacuums.sensors` | Object | | Sensor entity map | |
| `vacuums.shortcuts` | Object | | Room shortcut config | |

</details>

<br>

---

# 🖼️ Custom icons <a name="icon"></a>

> [!NOTE]
> These icons are loaded from the HA native icon registry — no CDN, works offline.

| Name | HA string |
|---|---|
| Season winter | `sci:winter` |
| Season spring | `sci:spring` |
| Season autumn | `sci:autumn` |
| Season summer | `sci:summer` |
| Stove | `sci:stove` |
| Stove cool | `sci:stove-cool` |
| Stove eco | `sci:stove-eco` |
| Stove heat | `sci:stove-heat` |
| Stove off | `sci:stove-off` |
| Radiator auto | `sci:radiator-auto` |
| Radiator frost | `sci:radiator-frost-protection` |
| Radiator heat | `sci:radiator-heat` |
| Radiator off | `sci:radiator-off` |
| Vacuum sleep | `sci:vacuum-sleep` |
| Vacuum docked | `sci:vacuum-docked` |
| Landspeeder | `sci:landspeeder` |
| Landspeeder plugged | `sci:landspeeder-plugged` |
| Lock unknown | `sci:lock-unknow` |

<br>

---

# 🔧 Developer / Local testing <a name="dev"></a>

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build production bundle (dist/sci-fi.min.js)
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

**Copy bundle to HA:**

```bash
npm run build && cp dist/sci-fi.min.js /path/to/ha/config/www/ha-sci-fi/sci-fi.min.js
```

Then bump the resource version in HA dashboard settings and hard-reload.

**DevContainer:** open in VS Code → *Reopen in Container* → HA dev instance starts automatically.

> [!NOTE]
> **v2 tech stack:** Lit 3 · TypeScript 5 strict · Rollup 4 · Vitest + happy-dom · ESLint · GitHub Actions CI  
> **Test suite:** 22 files, 137 tests — 100% GREEN  
> **Zero CDN:** Chart.js bundled, icons via HA native registry only

<br>

---

# 👽 Language / i18n <a name="lang"></a>

Available languages: 💂 English · 🥖 French

To add a new language, follow the [Lit localization guide](https://lit.dev/docs/localization/overview/) and submit a PR with your `.xlf` file.

Steps:
1. Download [xliff/fr.xlf](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/xliff/fr.xlf)
2. Rename it to your [BCP 47 language code](https://www.w3.org/International/articles/language-tags/index.en)
3. Update the `target-language` attribute and all `<target>` tags
4. Open a [Pull Request](https://github.com/adrien-parasote/ha-sci-fi/pulls)
