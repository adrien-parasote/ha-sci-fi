# Tactical Water Management

## Context
A dynamic, spaceship-style dashboard component designed to display and manage water-related entities across different floors/areas. It acts as a unified hub for water control, adapting dynamically to the user's Home Assistant setup based on tags/labels rather than static configuration.

## Features
1. **Dynamic Floor Selector**: Hexagonal tabs for floors (e.g., Ground, First Floor, Exterior). Selecting a floor filters the entities shown below.
2. **Label-based Discovery**: Automatically finds and lists any HA entity labeled with `water` (or a custom configured label).
3. **Smart Entity Controls**:
   - `switch`, `valve`, `automation`, `input_boolean`: Rendered with an ON/OFF state and a sci-fi toggle switch.
   - `sensor`: Rendered with its value and unit of measurement (e.g., `75%`, `12°C`).
4. **Resilient UI**: Gracefully handles states where no floors exist, or no water entities are present on the selected floor.

## Configuration & Tags (Étiquettes)
Pour que vos équipements apparaissent automatiquement dans la carte, ils doivent :
1. Avoir le label configuré (par défaut : `water`).
2. Être assignés à une **Pièce (Area)**, elle-même assignée à un **Étage (Floor)**.

**Exemples d'entités à tagguer avec `water` :**
- `switch.0x4c97a1fffeefd20f_valve_1` (Vanne d'arrosage 1)
- `switch.0x4c97a1fffeefd20f_valve_2` (Vanne d'arrosage 2)
- `sensor.0x4c97a1fffeefd20f_battery` (Batterie vanne d'arrosage)
- `number.0x4c97a1fffeefd20f_countdown_1` / `_2` (Minuteur d'arrosage)
- `switch.nodon_chauffe_eau` / `switch.zbmini_l_chauffe_eau` (Chauffe-eau)
- `sensor.nodon_chauffe_eau_power` / `_energy` (Consommation chauffe-eau)

## Visuals
- Matches the overarching Sci-Fi theme: glowing neon borders (`var(--sf-primary)`), dark translucent backgrounds, sci-fi toggles, and customized SVG corner cutouts on entity rows.
- Dynamic Island / Hexagonal tabs with `scale` transforms on selection/hover.

## Code Contracts
- **Card**: `sci-fi-water-management`
- **Editor**: `sci-fi-water-management-editor`
- **Config Interface**: `SciFiWaterManagementConfig`

### Properties:
- `header_message` (string, optional): Title at the top.
- `filter_label` (string, optional): HA label to look for (default: `water`).
- `first_floor_to_render` (string, optional): Default selected floor. Resolves by `floor_id` or case-insensitive floor name. Handles HA initialization delays (waits for `hass.floors` before resolving).
- `default_icon` (string, optional): Fallback icon for entities without an explicit icon.
- `ignored_entities` (string[], optional): List of `entity_id`s to exclude from rendering.

## Anti-Patterns
- **Do NOT hardcode entities in the card configuration**: The card must remain completely dynamic based on `labels` and `areas`.
- **Do NOT use `getAreas()` alone**: The selector works via `getFloors()`, then queries areas attached to that floor to find entities.
