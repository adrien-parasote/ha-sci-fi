# 🚗 Vehicles card

**`custom:sci-fi-vehicles`** — EV / vehicle monitoring and control card.

> [!NOTE]
> Originally designed for the [Renault integration](https://www.home-assistant.io/integrations/renault/), but works with any vehicle via entity mapping.

---

## Features

- Battery level bar (green / yellow / red thresholds)
- Charging state with dynamic icon (`mdi:ev-station` vs `mdi:car-electric`)
- Range, mileage, location, lock state
- Multiple vehicles supported

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vehicle.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/vehicle_edit.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-vehicles
vehicles:
  - id: my_vehicle
    name: My Car
```

### Full

```yaml
type: custom:sci-fi-vehicles
header_message: "Vehicles"
vehicles:
  - id: my_vehicle
    name: My Car
    charging: binary_sensor.car_charging
    lock_status: binary_sensor.car_lock
    location: device_tracker.car_location
    battery_level: sensor.car_battery_level
    battery_autonomy: sensor.car_battery_autonomy
    fuel_autonomy: sensor.car_fuel_autonomy
    fuel_quantity: sensor.car_fuel_quantity
    mileage: sensor.car_mileage
    location_last_activity: sensor.car_location_last_activity
    charge_state: sensor.car_charge_state
    plug_state: sensor.car_plug_state
    charging_remaining_time: sensor.car_charging_remaining_time
```

### Options — root

| Name | Type | Required | Description |
|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-vehicles` |
| `header_message` | String | | Card header text |
| `vehicles` | List\<Object\> | ✅ | List of vehicle definitions |

### Options — `vehicles[]`

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | String | ✅ | Unique vehicle identifier |
| `name` | String | ✅ | Display name |
| `charging` | String | | `binary_sensor` — charging state |
| `lock_status` | String | | `binary_sensor` — locked/unlocked |
| `location` | String | | `device_tracker` entity |
| `battery_level` | String | | `sensor` — % battery |
| `battery_autonomy` | String | | `sensor` — km EV range |
| `fuel_autonomy` | String | | `sensor` — km fuel range |
| `fuel_quantity` | String | | `sensor` — fuel quantity |
| `mileage` | String | | `sensor` — total km |
| `location_last_activity` | String | | `sensor` — last location update |
| `charge_state` | String | | `sensor` — charge state label |
| `plug_state` | String | | `sensor` — plug state |
| `charging_remaining_time` | String | | `sensor` — remaining charge time |
