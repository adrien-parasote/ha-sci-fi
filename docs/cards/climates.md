# 🌡️ Climates card

**`custom:sci-fi-climates`** — Auto-discovers all `climate` entities and groups them by floor and area.

> [!CAUTION]
> Currently designed for `climate` entities of type **radiator** only.

---

## Features

- Global average temperature + eco / frost_protection toggle
- Per-floor and per-area grouping (icons from HA areas config)
- Per radiator: current temp, target temp, HVAC mode button, preset button
- Season icon if `sensor.season` (meteorological) is available

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
header_message: "Radiators"
entities_to_exclude:
  - climate.excluded_radiator
```

### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-climates` | |
| `header_message` | String | | Card header text | |
| `entities_to_exclude` | List\<String\> | | Climate entity IDs to hide | `[]` |
