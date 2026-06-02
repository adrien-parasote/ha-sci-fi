# 💧 Water Management Card

**`custom:sci-fi-water-management`** — Dynamic dashboard card for monitoring and controlling water-related entities. Devices are automatically grouped by floor and area based on HA labels.

---

## Features

- **Auto-Discovery**: Automatically discovers entities by floor/area or specified HA label (default: `water`).
- **Water Heaters & Valves**: Unified ON/OFF controls for all water equipment.
- **Sensor Grouping**: Sensors are grouped logically under their parent device.
- **Execution Log**: Per-accordion history log with filter (All / Alerts).
- **Manual Sync**: Refresh button to re-fetch history without reloading the page.

---

## Screenshots

| Card View | Configuration UI |
|---|---|
| ![Card](../../screenshot/water_1.jpeg) | ![Config 1](../../screenshot/water_edit1.jpeg) |
| ![Card Active](../../screenshot/water_2.jpeg) | ![Config 2](../../screenshot/water_edit2.jpeg) |

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-water-management
```

### Full

```yaml
type: custom:sci-fi-water-management
header_message: Water Management
filter_label: water
first_floor_to_render: ground_floor
default_icon: mdi:water
ignored_entities:
  - switch.irrigation_bypass
```

### Options

| Name | Type | Required | Description | Default |
|------|------|----------|-------------|---------|
| `type` | String | ✅ | `custom:sci-fi-water-management` | |
| `header_message` | String | | Custom title for the card. | |
| `filter_label` | String | | HA label used to auto-discover entities. | `water` |
| `first_floor_to_render` | String | | Floor ID to display by default. | First floor found |
| `default_icon` | String | | Fallback icon for entities without an explicit icon. | `mdi:floor-plan` |
| `ignored_entities` | List\<String\> | | List of `entity_id`s to exclude from rendering. | `[]` |

---

## Integration with Hexa-Tiles

To add a tile on your `sci-fi-hexa-tiles` dashboard that navigates to the Water Management subview and lights up when any water device is active, create a **Template Binary Sensor** in Home Assistant.

### 1. Create a Template Binary Sensor (Home Assistant)

Go to **Settings › Devices & Services › Helpers › Create Helper › Template › Template a binary sensor**.

```yaml
# State template example — adapt entity IDs to your setup:
{{ is_state('water_heater.my_water_heater', 'on') or is_state('switch.my_valve', 'on') }}
```

Name it `Water Active` (entity ID: `binary_sensor.water_active`).

### 2. Configure Hexa-Tiles (YAML)

```yaml
tiles:
  - entity: binary_sensor.water_active
    name: Water
    active_icon: mdi:water
    inactive_icon: mdi:water-off
    state_on:
      - "on"
    link: water-management
    standalone: true
```
