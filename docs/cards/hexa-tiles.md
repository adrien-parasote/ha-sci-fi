# ⬡ Hexa-Tiles card

**`custom:sci-fi-hexa-tiles`** — Main dashboard card with hexagonal tiles.

Each tile shows an entity state, an aggregated kind state (e.g. "any light on?"), or a weather summary. Clicking a tile uses HA-native navigation to a dashboard view.

---

## Features

- Person presence tiles (photo + location zone from HA zones)
- Weather tile (condition icon + temperature + optional alert banner)
- Custom tiles:
  - **standalone** → tracks a single entity
  - **kind** → aggregates entities of a given type
- Visibility filter per person

> [!CAUTION]
> Designed for smartphone / single-panel HA. Tiles are not yet fully responsive.

> [!CAUTION]
> Requires the default HA `sun.sun` entity for weather tiles.

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/hexa_edit_2.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-hexa-tiles
```

### Full

```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Hey, welcome back!"
weather:
  activate: true
  weather_entity: weather.home
  weather_alert_entity: sensor.weather_alert
  link: /lovelace/weather
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
  - entity: light.salon
    name: Lights
    icon: mdi:lightbulb
    tap_action:
      action: navigate
      navigation_path: /lovelace/lights
  - entity: vacuum.dobby
    name: Dobby
    icon: sci:vacuum-sleep
    tap_action:
      action: navigate
      navigation_path: /lovelace/vacuum
```

### Options — root

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-hexa-tiles` | |
| `header_message` | String | | Text displayed at the top | `''` |
| `weather` | Object | | Weather tile config | |
| `persons` | List\<String\> | | Person entity IDs | `[]` |
| `vehicles` | List\<String\> | | Device tracker entity IDs | `[]` |
| `tiles` | List\<Object\> | | Custom tile definitions | `[]` |

### Options — `weather`

| Name | Type | Required | Description |
|---|---|---|---|
| `activate` | Boolean | | Show the weather tile | `false` |
| `weather_entity` | String | ✅ if activate | HA weather entity |
| `weather_alert_entity` | String | | Alert sensor entity |
| `link` | String | | Navigation path on click |
| `state_green/yellow/orange/red` | String | | Alert state values |

### Options — `tiles[]`

| Name | Type | Required | Description |
|---|---|---|---|
| `entity` | String | ✅ | Entity to track |
| `name` | String | | Display label |
| `icon` | String | | `mdi:` or `sci:` icon |
| `tap_action.action` | String | | `navigate` or `call-service` |
| `tap_action.navigation_path` | String | | Path when action = navigate |
| `tap_action.service` | String | | Service when action = call-service |
| `tap_action.service_data` | Object | | Service call data |
