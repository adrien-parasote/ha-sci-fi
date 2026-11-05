# 🪵🔥 Stove card

**`custom:sci-fi-stove`** — Dedicated card for a pellet stove.

> [!NOTE]
> Based on [fumis integration](https://github.com/maheus/fumis_integration) by [maheus](https://github.com/maheus).

---

## Features

- Graphical stove state (cool / heat / off)
- Internal pellet quantity + optional storage counter with alert thresholds
- Sensor display: state, pressure, time to service, temperatures, power, fan speed
- Actions: HVAC mode, target temperature, preset
- Optional collapsible "Wear" section (collapsed by default): heating time, fuel used, igniter starts, misfires, overheatings — a configured counter that cannot be read shows `—`

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_2.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_3.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-stove
entity: climate.my_stove
```

### Full

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
  sensor_heating_time: sensor.stove_heating_time
  sensor_fuel_used: sensor.stove_fuel_used
  sensor_igniter_starts: sensor.stove_igniter_starts
  sensor_misfires: sensor.stove_misfires
  sensor_overheatings: sensor.stove_overheatings
pellet_quantity_threshold: 0.1
storage_counter: counter.pellet_stock
storage_counter_threshold: 0.1
```

### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-stove` | |
| `entity` | String | ✅ | Stove `climate` entity ID | |
| `sensors` | Object | | Additional stove sensors | |
| `pellet_quantity_threshold` | Float | | Internal pellet alert threshold (0–1) | `0.1` |
| `storage_counter` | String | | Pellet bag counter entity | |
| `storage_counter_threshold` | Float | | Storage counter alert threshold (0–1) | `0.1` |

### `sensors` options

| Name | Type | Description |
|---|---|---|
| `sensor_actual_power` | String | Rendered power sensor |
| `sensor_power` | String | Power consumption sensor |
| `sensor_combustion_chamber_temperature` | String | Combustion chamber temp |
| `sensor_inside_temperature` | String | Room temperature |
| `sensor_pellet_quantity` | String | Internal pellet level — a percentage (0–100) or a ratio (0–1: a value ≤ 1 is read ×100), as the bridge reads it |
| `sensor_status` | String | `binary_sensor` state |
| `sensor_fan_speed` | String | Fan speed sensor |
| `sensor_pressure` | String | Pressure sensor |
| `sensor_time_to_service` | String | Time to service sensor |
| `sensor_heating_time` | String | Wear counter: total heating time (`sensor.*`) |
| `sensor_fuel_used` | String | Wear counter: fuel used (`sensor.*`) |
| `sensor_igniter_starts` | String | Wear counter: igniter starts (`sensor.*`) |
| `sensor_misfires` | String | Wear counter: misfires (`sensor.*`) |
| `sensor_overheatings` | String | Wear counter: overheatings (`sensor.*`) |

---

## Pellet storage counter automation

Auto-decrement your counter when the stove is refilled:

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
