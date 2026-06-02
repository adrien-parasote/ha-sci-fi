# 💡 Lights card

**`custom:sci-fi-lights`** — Auto-discovers all `light` entities and groups them by floor and area.

---

## Features

- Global turn-on / turn-off button
- Per-floor summary (light count, floor icon from HA areas)
- Per-area: area name, area toggle, individual light buttons
- Sun phase display (dawn / day / dusk / night) if `sun.sun` is available
- Exclude specific entities, or override name/icon per entity

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lights_edit_2.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-lights
```

### Full

```yaml
type: custom:sci-fi-lights
header_message: "Lights"
ignored_entities:
  - light.ignored_light_1
  - light.ignored_light_2
custom_entities:
  light.christmas_tree:
    name: "Christmas tree"
    icon_on: mdi:pine-tree
    icon_off: mdi:pine-tree-variant-outline
  light.desk:
    name: "Desk lamp"
    icon_on: mdi:desk-lamp-on
    icon_off: mdi:desk-lamp
```

### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-lights` | |
| `header_message` | String | | Card header text | |
| `ignored_entities` | List\<String\> | | Light entity IDs to hide | `[]` |
| `first_floor_to_render` | String | | Floor ID to display by default | First floor found |
| `first_area_to_render` | String | | Area ID to expand by default | First area found |
| `default_icon_on` | String | | Fallback icon when a light is on | `mdi:lightbulb-on-outline` |
| `default_icon_off` | String | | Fallback icon when a light is off | `mdi:lightbulb-outline` |
| `custom_entities` | Object | | Per-entity name/icon overrides | |

### Options — `custom_entities` (per entry)

Each key is a light entity ID. Values:

| Name | Type | Description | Default |
|---|---|---|---|
| `name` | String | Custom display name | entity friendly name |
| `icon_on` | String | `mdi:` icon when on | `mdi:lightbulb-on-outline` |
| `icon_off` | String | `mdi:` icon when off | `mdi:lightbulb-outline` |
