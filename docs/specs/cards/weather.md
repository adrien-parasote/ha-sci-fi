# sci-fi-weather Schema

### sci-fi-weather

```typescript
// src/types/config.ts
interface SciFiWeatherAlertConfig {
  readonly entity_id: string;
  readonly state_green?: string;
  readonly state_yellow?: string;
  readonly state_orange?: string;
  readonly state_red?: string;
}

interface SciFiWeatherConfig {
  readonly weather_entity: string;                          // ← "weather_entity" (NOT weather_entity_id)
  readonly weather_daily_forecast_limit?: number;           // range [0, 15], default: 10
  readonly chart_first_kind_to_render?: 'temperature' | 'precipitation' | 'wind';
  readonly alert?: SciFiWeatherAlertConfig;                 // ← DO NOT REMOVE
}
```

**Exemple :**
```yaml
type: custom:sci-fi-weather
weather_entity: weather.la_chapelle_sur_erdre
weather_daily_forecast_limit: 10
alert:
  entity_id: sensor.44_weather_alert
  state_green: Vert
  state_yellow: Jaune
  state_orange: Orange
  state_red: Rouge
```


# 08 — Sci-Fi Weather Card UI Restoration

> Document Type: Implementation

## 1. Description & Goal
The `sci-fi-weather` component has lost its original, complex UI during the migration to Lit and TypeScript. The goal is to strictly restore the original design, functionality, and styling from the legacy codebase while respecting the new architecture.

## Deep Links
- **Source Component**: [sci-fi-weather.ts](../../src/cards/weather/sci-fi-weather.ts#L1)
- **Base Class**: [base-card.ts](../../src/utils/base-card.ts#L1)
- **Types**: [config.ts `SciFiWeatherConfig`](../../src/types/config.ts#L1)

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | Chart.js version 4.x is compatible with old logic | Medium | Verified in package.json |
| 2 | Extracted SVGs from sf-weather-icons match layout | Low | Will reuse existing `sci-fi-weather-icon` |
| 3 | Old logic maps perfectly to Lit | High | Refactoring might require new private state properties |

## 3. Implementation Details

### Data Models
- **Sun State**: Calculate `isDay()` using `sun.sun` attributes (next_dawn, next_dusk, etc.).
- **Weather State**: Fetch basic weather attributes and custom extra sensors (`daily_precipitation`, `freeze_chance`, `rain_chance`, `snow_chance`, `cloud_cover`).
- **Date/Time**: Refresh current time every 10 seconds via `setInterval`.

### UI Layout
- **Header**: Contains the main animated weather icon and a clock (hour + date) aligned to the right.
- **Alerts**: Shows active weather alerts based on the config thresholds (`state_yellow`, `state_orange`, `state_red`).
- **Today Summary**: Renders 5 key metrics (`cloud`, `precipitation`, `rainy`, `frozen`, `snowy`) using `<sci-fi-weather-icon>`.
- **Chart**: 
  - Integrated with 'Chart.js'.
  - Top dropdown to switch chart data type (`temperature`, `precipitation`, `wind_speed`).
  - Implements a custom Chart.js plugin `afterDatasetsDraw` to render weather SVG icons at data points directly on the canvas.
- **Daily Forecast (Footer)**: 
  - Horizontal scrolling list of daily forecasts.
  - Interactive: Clicking a day updates `_day_selected` and automatically redraws the Chart to show hourly data for that specific day.

### Styling
- The full CSS from 'old_weather_style.js' must be ported to the Lit `styles` getter.
- Use CSS variables (`--primary-bg-color`, `--secondary-light-color`) as defined in the global design system.

## Cross-Spec Contracts

 ### Produces
| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `sci-fi-weather` | Custom Element | This spec | HA Lovelace Dashboard |

 ### Consumes
| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `SciFiBaseCard` | Abstract class | `src/utils/base-card.ts` | Spec 03 |
| `sciFiCommonStyles` | Lit CSS | `src/styles/common.ts` | Spec 03 |
| `SciFiWeatherConfig`, `SciFiWeatherAlertConfig` | TS interfaces | Spec 05 § sci-fi-weather | `src/types/config.ts` |
| 'sci-fi-weather-icons.js' | JS icon map | `src/components/sf-icon/` | Spec 04 |
| Chart.js | External lib | `package.json` | `chart.js@^4` |
| `getStubConfig` / `getConfigElement` | Abstract methods | Spec 05 | `src/utils/base-card.ts` |

 ### Public Interface
| Element | Signature | Description |
|---|---|---|
| `sci-fi-weather` | Custom Element | HA Lovelace weather card (unchanged tag) |
| `setConfig(config)` | `(config: SciFiWeatherConfig) => void` | Called by HA to configure the card |
| `getCardSize()` | `() => number` | Returns layout size hint to Lovelace |

 ### External Invocations
| Service | Action | Params | When |
|---|---|---|---|
| `hass.callWS({ type: 'weather/subscribe_forecast' })` | Subscribe forecast | `entity_id`, `forecast_type: 'daily'` | On config set |

 ### Tracked Concepts
| Concept | Shared with | Description |
|---|---|---|
| Weather alert level detection | hexa-tiles.md | Same `state_green/yellow/orange/red` config pattern — must stay in sync |
| `weather_alert_entity` attribute keys as phenomenon names | hexa-tiles.md | Both cards read phenomenon names from alert entity attribute keys |


## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Creating many helpers files | Module fragmentation for simple UI state | Embed utility logic inside 'sci-fi-weather.ts' as private methods. |
| 2 | DOM element creation via JS | Violates Lit framework patterns | Declare `<canvas>` in HTML template and use `@query`. |
| 3 | Unmanaged Chart.js instances | Memory leaks and rendering artifacts | Call `this._chart.update()` or `this._chart.destroy()` when updating. |
| 4 | Duplicating SVG icons | Wasted bundle size | Import from 'sci-fi-weather-icons.js' as in original |
| 5 | Polluting Home Assistant entity | Anti-pattern to add props to Hass objects | Create local wrapper or mapping dictionary |

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Missing `this.hass` or config | Null check in `render()` | Return `nothing` | Blank render |
| Missing weather entity | `hass.states[config.weather_entity]` is undefined | Skip rendering sensor data | Empty state icons / N/A text |

## Test Case Specifications

| ID | Description | Preconditions | Action | Expected Result |
|---|---|---|---|---|
| TC-001 | Header rendering | Valid config | Render component | Header shows correct icon and time |
| TC-002 | Alerts rendering | Alert entity has state | Render component | Alerts section displays correctly |
| TC-003 | Today summary rendering | Weather entity has sensors | Render component | 5 sensors displayed |
| TC-004 | Chart rendering | Chart instance created | Render component | Chart.js canvas rendered with data |
| TC-005 | Days list rendering | Daily forecast exists | Render component | List of days is rendered |
| IT-001 | Chart Interaction | Component rendered | Click dropdown menu | `_chartDataKind` updates, chart type changes |
| IT-002 | Day Selection | Component rendered | Click a day in footer | `_day_selected` updates, chart updates hourly data |
| IT-003 | Clock Update | Component rendered | Wait 10 seconds | Header time updates |
