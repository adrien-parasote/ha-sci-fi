# 💧 Water Management Card

The Water Management card provides a centralized interface for monitoring and controlling water-related entities such as water heaters, smart valves, and leak sensors. Devices are automatically grouped by floor and area.

## Screenshots

| Card View | Configuration UI |
|---|---|
| ![Card](../../screenshot/water_1.jpeg) | ![Config 1](../../screenshot/water_edit1.jpeg) |
| ![Card Active](../../screenshot/water_2.jpeg) | ![Config 2](../../screenshot/water_edit2.jpeg) |

## Features
- **Auto-Discovery**: Automatically discovers entities by floor/area or specified HA label.
- **Water Heaters & Valves**: Unified ON/OFF controls for all water equipment.
- **Visibility Toggles**: Easily hide or show individual sensors inside the configuration UI.
- **Sensor Grouping**: Sensors are grouped logically under their parent device (e.g., Nodon Water Heater, Giex Valve).

## YAML Configuration

```yaml
type: custom:sci-fi-water-management
header: Water Management
label: water
default_floor: rdc
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | **required** | `custom:sci-fi-water-management` |
| `header` | `string` | *optional* | Custom title for the card. |
| `label` | `string` | *optional* | HA filter label used to group and auto-discover entities. |
| `default_floor` | `string` | *optional* | The ID of the floor to open by default. |
| `default_icon` | `string` | `mdi:floor-plan` | The fallback icon for floors. |
| `visibility` | `object` | `{}` | A dictionary of entity IDs mapped to boolean indicating whether they should be shown. Designed to be configured via the UI. |

## Integration with Hexa-Tiles

If you want to add a tile in your main `sci-fi-hexa-tiles` dashboard that navigates to the Water Management subview, and lights up when *any* water device is active, you should create a **Template Binary Sensor** in Home Assistant to aggregate their states.

### 1. Create a Global Template Sensor (Home Assistant)
Go to Settings > Devices & Services > Helpers > Create Helper > Template > Template a binary sensor.

```yaml
# State template example:
{{ is_state('water_heater.nodon', 'on') or is_state('switch.giex_valve', 'on') }}
```
Name it "Eau Active" (Entity ID will be `binary_sensor.eau_active`).

### 2. Configure Hexa-Tiles (YAML Mode)
Since `binary_sensor` is not currently aggregated natively in the Hexa-Tiles visual editor, you must add it via the **Code Editor** in Lovelace:

```yaml
tiles:
  - entity: binary_sensor.eau_active
    name: Eau
    active_icon: mdi:water
    inactive_icon: mdi:water-off
    state_on:
      - "on"
    link: water-management
    standalone: true
```
