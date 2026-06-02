# 🔌 Plugs card

**`custom:sci-fi-plugs`** — Smart plug monitoring and control card with power chart.

---

## Features

- Plug on/off toggle with animated icon
- Power sensor chart (last 24h activity) via bundled Chart.js
- Linked sensors display with actions
- Multi-plug footer navigator (switch between plugs)

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/plug_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/plug_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/plug_edit_1.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-plugs
devices: []
```

### Full

```yaml
type: custom:sci-fi-plugs
header_message: "Smart Plugs"
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
      number.my_plug_countdown:
        show: true
        name: Countdown
        power: false
```

### Options — root

| Name | Type | Required | Description |
|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-plugs` |
| `header_message` | String | | Card header text |
| `devices` | List\<Object\> | ✅ | Plug definitions |

### Options — `devices[]`

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `device_id` | String | ✅ | HA device ID | |
| `entity_id` | String | ✅ | `switch` entity ID | |
| `name` | String | | Display name | |
| `active_icon` | String | | MDI icon when on | `mdi:power-socket-fr` |
| `inactive_icon` | String | | MDI icon when off | `sci:power-socket-fr-off` |
| `sensors` | Object | | Sensor map (entity ID as key) | |

### Options — `sensors` (per entry)

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `show` | Boolean | ✅ | Display this sensor in the card | `false` |
| `name` | String | | Custom label | entity name |
| `icon` | String | | Override icon for this sensor | `mdi:information-outline` |
| `power` | Boolean | ✅ | Link to plug power (used for chart) | `false` |
