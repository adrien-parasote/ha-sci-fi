# 🌡️ Climates Card

**`custom:sci-fi-climates`** — Auto-discovers all `climate` entities and groups them by floor and area.

> [!NOTE]
> Currently optimized for **radiator-type** climate entities. Other climate types may display with limited controls.

---

## Features

- Global average temperature + Eco / Frost Protection preset toggle
- Per-floor and per-area grouping (icons from HA areas config)
- Per radiator: current temp, target temp, HVAC mode button, preset button
- Season icon if `sensor.season` (meteorological) is available
- Fully customizable state icons, state colors, mode icons, and mode colors

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/climates_edit_1.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-climates
```

### Full

```yaml
type: custom:sci-fi-climates
entities_to_exclude:
  - climate.excluded_radiator
header:
  display: true
  message_winter_state: "Heating season"
  icon_winter_state: mdi:thermometer-chevron-up
  message_summer_state: "Summer mode"
  icon_summer_state: mdi:thermometer-chevron-down
state_icons:
  auto: sci:radiator-auto
  off: sci:radiator-off
  heat: sci:radiator-heat
state_colors:
  auto: "#669cd2"
  off: "#6c757d"
  heat: "#ff7f50"
mode_icons:
  frost_protection: mdi:snowflake-alert
  eco: mdi:leaf
  comfort: mdi:sofa
  comfort-1: mdi:sofa-outline
  comfort-2: mdi:sofa-single
  boost: mdi:rocket-launch
mode_colors:
  frost_protection: "#4fc3f7"
  eco: "#66bb6a"
  comfort: "#ffb74d"
  boost: "#ef5350"
```

### Options — root

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-climates` | |
| `entities_to_exclude` | List\<String\> | | Climate entity IDs to hide | `[]` |
| `header` | Object | | Season header customization | |
| `state_icons` | Object | | HVAC state → MDI/sci icon override | |
| `state_colors` | Object | | HVAC state → hex color override | |
| `mode_icons` | Object | | Preset mode → MDI/sci icon override | |
| `mode_colors` | Object | | Preset mode → hex color override | |

### `header` options

| Name | Type | Description | Default |
|---|---|---|---|
| `display` | Boolean | Show the season header bar | `true` |
| `message_winter_state` | String | Text displayed in heating season | |
| `icon_winter_state` | String | Icon in heating season | `mdi:thermometer-chevron-up` |
| `message_summer_state` | String | Text displayed in summer | |
| `icon_summer_state` | String | Icon in summer | `mdi:thermometer-chevron-down` |

### `state_icons` / `state_colors` keys

| Key | State | Default icon | Default color |
|---|---|---|---|
| `auto` | Auto/heat-cool | `sci:radiator-auto` | `#669cd2` |
| `off` | Off | `sci:radiator-off` | `#6c757d` |
| `heat` | Heating | `sci:radiator-heat` | `#ff7f50` |

### `mode_icons` / `mode_colors` keys

Preset modes supported: `frost_protection`, `eco`, `comfort`, `comfort-1`, `comfort-2`, `boost`.
