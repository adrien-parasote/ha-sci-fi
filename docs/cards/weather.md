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
```

### Options

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| `type` | String | ✅ | `custom:sci-fi-weather` | |
| `weather_entity` | String | ✅ | HA weather entity ID | |
| `header_message` | String | | Card header text | |
| `weather_daily_forecast_limit` | Integer | | Number of forecast days (0–15) | `5` |
