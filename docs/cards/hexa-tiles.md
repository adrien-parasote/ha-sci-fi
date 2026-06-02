# ⬡ Hexa-Tiles Card

**`custom:sci-fi-hexa-tiles`** — Main dashboard card with hexagonal tiles.

Each tile shows an entity state, an aggregated kind state (e.g. "any light on?"), or a weather summary. Clicking a tile uses HA-native navigation to a dashboard view.

---

## Features

- Person presence tiles (photo + location zone from HA zones)
- Weather tile (condition icon + temperature + optional alert banner)
- Custom tiles:
  - **standalone** → tracks a single entity
  - **kind** → aggregates entities of a given domain type
- Visibility filter per person

> [!NOTE]
> Requires the default HA `sun.sun` entity for weather tile rendering (day/night phase).

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
  link: weather
  state_green: "ok"
  state_yellow: "low"
  state_orange: "medium"
  state_red: "high"
tiles:
  - entity: light.living_room
    standalone: true
    name: Lights
    active_icon: mdi:lightbulb-on-outline
    inactive_icon: mdi:lightbulb-outline
    state_on:
      - "on"
    link: lights
  - entity_kind: vacuum
    name: Vacuum
    active_icon: sci:vacuum-clean
    inactive_icon: sci:vacuum-sleep
    link: vacuum
    visibility:
      - person.john
```

### Options — root

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-hexa-tiles` | |
| `header_message` | String | | Text displayed at the top | `''` |
| `weather` | Object | | Weather tile config | |
| `tiles` | List\<Object\> | | Custom tile definitions | `[]` |

### Options — `weather`

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `activate` | Boolean | | Show the weather tile | `false` |
| `weather_entity` | String | ✅ if activate | HA weather entity | |
| `weather_alert_entity` | String | | Alert sensor entity ID | |
| `link` | String | | Navigation path on click (e.g. `weather`) | |
| `state_green` | String | | Entity state value mapping to green (no alert) | |
| `state_yellow` | String | | Entity state value mapping to yellow | |
| `state_orange` | String | | Entity state value mapping to orange | |
| `state_red` | String | | Entity state value mapping to red | |

> [!NOTE]
> `state_green/yellow/orange/red` must match the exact state strings returned by your alert sensor entity.

### Options — `tiles[]`

| Name | Type | Required | Description |
|---|---|---|---|
| `entity` | String | | Entity ID (for `standalone` tiles) |
| `entity_kind` | String | | Domain type for aggregated tiles (e.g. `light`, `climate`, `vacuum`) |
| `standalone` | Boolean | | `true` = single entity, `false` = aggregates by `entity_kind` | `false` |
| `name` | String | | Display label |
| `active_icon` | String | | `mdi:` or `sci:` icon when active/on |
| `inactive_icon` | String | | `mdi:` or `sci:` icon when inactive/off |
| `state_on` | List\<String\> | | State values considered active (e.g. `["on", "playing"]`) |
| `state_error` | String | | State value rendered as error |
| `link` | String | | Navigation target (Lovelace view name, e.g. `lights`) |
| `entities_to_exclude` | List\<String\> | | Entity IDs to ignore in kind aggregation |
| `visibility` | List\<String\> | | Person entity IDs — tile only shown for these persons |
| `tap_action` | Object | | Full LovelaceAction override (overrides `link`) |
| `hold_action` | Object | | LovelaceAction on long press |
| `double_tap_action` | Object | | LovelaceAction on double tap |
