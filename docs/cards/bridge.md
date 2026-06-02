# 🏠 Bridge Overview (`sci-fi-bridge`)

Main dashboard card. Displays the overall status of the home in real time — crew presence, critical alerts, access points, automations, appliances, stove, vehicle, and a configurable quick-action panel.

> Full technical spec: [docs/specs/cards/bridge.md](../specs/cards/bridge.md)

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/bridge_1.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/bridge_2.jpeg" width="300">

</details>

---

## Installation

Add the `sci-fi.min.js` resource to your HA dashboard, then:

```yaml
type: custom:sci-fi-bridge
```

---

## Configuration

### Minimal example

```yaml
type: custom:sci-fi-bridge
persons:
  - entity: person.alice
actions:
  items:
    - entity: input_button.call_everyone
      name: "Call everyone"
      icon: "mdi:bullhorn"
```

### Full example

```yaml
type: custom:sci-fi-bridge

persons:
  - entity: person.alice
  - entity: person.bob

alerts:
  icon: mdi:shield-alert          # optional
  smoke:
    - entity: binary_sensor.smoke_salon
      name: Living room
      icon: mdi:smoke-detector    # optional
  toggles:
    - entity: automation.alarm
      name: Alarm
      icon: mdi:motion-sensor
  occupancy: binary_sensor.people_at_home

access:
  icon: mdi:door-closed           # optional
  items:
    - entity: cover.garage
      name: Garage
      icon: mdi:garage
    - entity: lock.front_door
      name: Front door

automations:
  icon: mdi:robot                 # optional
  items:
    - entity: automation.lights_auto
      name: Auto lights
      type: toggle
  slider:
    entity: input_number.delay
    min: 0
    max: 60
    step: 5

appliances:
  icon: mdi:washing-machine       # optional
  cycles:
    - entity: binary_sensor.washing_machine
      name: Washing machine
      icon: mdi:washing-machine
      running_states: [on]
  consumables:
    - entity: binary_sensor.salt_missing
      name: Salt
      ok_when: "off"

stove:
  icon: mdi:fire                  # optional
  pellet_quantity: sensor.pellets_qty
  pellet_stock: sensor.pellets_stock
  status: sensor.stove_status
  low_threshold: 0.3

vehicle:
  icon: mdi:ev-station            # optional
  power_sensor: sensor.ev_power

actions:
  icon: mdi:lightning-bolt        # optional
  items:
    - entity: script.run_cleanup
      name: Cleanup
      icon: mdi:broom
      color: "#ff9800"            # optional (active color)
    - entity: automation.trigger_alarm
      name: Alarm
      icon: mdi:alarm-light
```

---

## Available sections

All sections are **optional** — if absent from the YAML, the section is not rendered (zero errors).

| Section | YAML key | Description |
|---------|----------|-------------|
| Crew | `persons` | Crew presence with HA zones (home / away / work…) |
| Alerts | `alerts` | Smoke detectors, automation toggles, occupancy sensor |
| Access | `access` | Doors, gates, locks — open/close controls |
| Automations | `automations` | Automation toggles + timer slider |
| Appliances | `appliances` | Active cycles (washing machine…) + consumables (salt, rinse aid…) |
| Stove | `stove` | Pellet quantity (progress bar), stock counter, stove status |
| Vehicle | `vehicle` | EV charging power (read-only) |
| Actions | `actions` | Quick-action button panel (scripts, automations, input_buttons, etc.) |

---

## Icons

Each section and each entry accepts an optional `icon` field (MDI string, e.g. `mdi:garage`).
If absent, the section's default icon is used.
The visual editor provides a **searchable icon picker** (MDI + custom sci-fi icons).

---

## Responsive layout

- **Portrait / mobile**: 1 column
- **Landscape / tablet / desktop**: 2 columns
- Layout via **CSS container queries** (`@container`) — independent of viewport width

---

## Visual editor

The card has a full GUI editor in the HA interface:
- Accordions per section — enable/disable a section
- Expandable lists (add/remove smoke detectors, toggles, items, cycles, consumables)
- Searchable icon picker for all icon fields
- Entity selector for all entity fields

---

## See also

- [Technical spec](../specs/cards/bridge.md)
- [Strategic blueprint](../strategic/bridge_overview_blueprint.md)
- [Changelog](../../CHANGELOG.md)
