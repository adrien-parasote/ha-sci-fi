# 🌦️ Weather card

**`custom:sci-fi-weather`** — Current conditions, alerts, hourly chart and daily forecast.

> [!NOTE]
> Chart.js is **bundled** — no CDN, works fully offline.

> [!NOTE]
> Credits: [basmilius](https://github.com/basmilius) for the [weather icons](https://github.com/basmilius/weather-icons).

---

## Features

- Current condition icon, temperature, humidity, wind
- Optional alert banner (green / yellow / orange / red)
- Hourly Chart.js temperature + precipitation + wind graph
- Daily forecast row (tap to switch day)

---

## Screenshots

<details>
<summary>Show</summary>

<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather.jpeg" width="300">
<img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/weather_edit.jpeg" width="300">

</details>

---

## Configuration

> [!TIP]
> This card can be configured through the HA UI editor.

### Minimal

```yaml
type: custom:sci-fi-weather
weather_entity: weather.home
```

### Full

```yaml
type: custom:sci-fi-weather
header_message: "Weather"
weather_entity: weather.home
weather_daily_forecast_limit: 5
chart_first_kind_to_render: temperature
alert:
  entity_id: sensor.weather_alert
  state_green: ok
  state_yellow: low
  state_orange: medium
  state_red: high
```

### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-weather` | |
| `weather_entity` | String | ✅ | HA weather entity ID | |
| `header_message` | String | | Card header text | |
| `weather_daily_forecast_limit` | Integer | | Number of forecast days (0–15) | `10` |
| `chart_first_kind_to_render` | String | | First chart tab: `temperature`, `precipitation`, or `wind` | `temperature` |
| `alert` | Object | | Alert banner configuration | |

### `alert` options

| Name | Type | Required | Description |
|---|---|---|---|
| `entity_id` | String | ✅ | HA sensor entity that holds the alert state |
| `state_green` | String | | State value that maps to green (no alert) |
| `state_yellow` | String | | State value that maps to yellow (low alert) |
| `state_orange` | String | | State value that maps to orange (medium alert) |
| `state_red` | String | | State value that maps to red (high alert) |
