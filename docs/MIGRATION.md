# Migration Guide — Sci-Fi Lovelace Cards v2.0.0

This guide describes how to migrate your Lovelace YAML configuration from version 1.x to version 2.0.0 of the Sci-Fi Cards package.

---

## 1. Directory & Path Urbanization

All custom card directories have been renamed to follow consistent kebab-case naming. 

If you are referencing paths directly in your Home Assistant resources configuration:

| Old Path | New Path |
|----------|----------|
| `/local/hacs/ha-sci-fi/src/cards/hexa_tiles/...` | `/local/hacs/ha-sci-fi/src/cards/hexa-tiles/...` |

---

## 2. Configuration Schema Migrations (Feature `F-MIGR-01`)

Version 2.0.0 is backward-compatible and automatically migrates legacy configuration keys internally when the card's `setConfig()` is called. However, it is highly recommended to update your YAML configurations directly to avoid depreciation warnings.

### Hexa Tiles Card (`sci-fi-hexa-tiles`)
* **Entity IDs**: The configuration now strictly uses standard `entity` and `weather_entity` keys instead of legacy `entity_id` and `weather_entity_id`.

**Legacy YAML (v1.x):**
```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Welcome Home"
weather:
  activate: true
  weather_entity_id: weather.home
  weather_alert_entity_id: sensor.weather_alert
tiles:
  - standalone: true
    entity_id: light.living_room
```

**Migrated YAML (v2.0.0):**
```yaml
type: custom:sci-fi-hexa-tiles
header_message: "Welcome Home"
weather:
  activate: true
  weather_entity: weather.home
  weather_alert_entity: sensor.weather_alert
tiles:
  - standalone: true
    entity: light.living_room
```

---

## 3. Dynamic Rendering Performance (`getRelevantEntities`)

Version 2.0.0 introduces extreme rendering optimizations. Cards now strictly filter and listen to updates only from entities returned by the `getRelevantEntities()` function. 

* **Smart Re-renders**: If you have cards displaying multiple sensors, make sure all sensors you want to see updated are listed in the card's configuration. The card will ignore Home Assistant state changes for any other unrelated entities, resulting in zero-lag rendering.

---

## 4. Internationalization Support

Static dynamic translations (statically bundled French and English locales) are now active. The card will automatically match the active language of your Home Assistant profile.
