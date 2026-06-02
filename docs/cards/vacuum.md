# 🖲 Vacuum card

**`custom:sci-fi-vacuum`** — Full-featured vacuum control card with live map and room shortcuts.

---

## Features

- Battery + mop intensity bars
- State animation (cleaning / docked / sleeping / returning)
- Clean area and duration sensors
- Live map image (if camera sensor provided)
- Action bar: start, pause, stop, return to base
- Room shortcuts (segment cleaning)

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vacuum.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vacuum_edit_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vacuum_edit_2.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-vacuum
vacuums:
  - entity: vacuum.my_vacuum
```

### Full

```yaml
type: custom:sci-fi-vacuum
header_message: "Dobby"
vacuums:
  - entity: vacuum.my_vacuum
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
      - name: Kitchen + Living room
        icon: mdi:silverware-fork-knife
        segments:
          - 1
          - 2
      - name: Bedroom
        icon: mdi:bed
        segments:
          - 3
```

### Options — root

| Name | Type | Required | Description |
|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-vacuum` |
| `header_message` | String | | Card header text |
| `vacuums` | List\<Object\> | ✅ | List of vacuum configurations |

### Options — `vacuums`

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `entity` | String | ✅ | Vacuum entity ID | |
| `start` | Boolean | | Show start button | `true` |
| `pause` | Boolean | | Show pause button | `true` |
| `stop` | Boolean | | Show stop button | `true` |
| `return_to_base` | Boolean | | Show return-to-base button | `true` |
| `sensors` | Object | | Sensor entity map | |
| `shortcuts` | Object | | Room shortcut config | |

### `sensors` options

| Name | Type | Description |
|---|---|---|
| `current_clean_area` | String | Sensor — current clean area |
| `current_clean_duration` | String | Sensor — current clean duration |
| `battery` | String | Sensor — battery % |
| `mop_intensite` | String | Sensor — mop intensity |
| `map` | String | `image` entity — live map |

### `shortcuts` options

| Name | Type | Required | Description |
|---|---|---|---|
| `service` | String | ✅ | Service to call for segment cleaning |
| `command` | String | ✅ | Command parameter for segment cleaning |
| `description[]` | List | | Shortcut entries |
| `description[].name` | String | | Shortcut display name |
| `description[].icon` | String | | `mdi:` icon | `mdi:broom` |
| `description[].segments` | List\<Number\> | | Room segment IDs |
