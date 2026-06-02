> Document Type: Reference
> YAML contract — Full implementation spec in [05_cards.md](../05_cards.md#sci-fi-climates)
> Depends on: [Spec 02](../02_domain_selectors.md#blueprint-coverage), [Spec 03](../03_base_classes.md#blueprint-coverage)

# sci-fi-climates Schema

### sci-fi-climates

```typescript
// src/types/config.ts
interface SciFiClimatesHeaderConfig {
  readonly display?: boolean;
  readonly icon_winter_state?: string;      // default: mdi:thermometer-chevron-up
  readonly message_winter_state?: string;   // default: 'Winter is coming'
  readonly icon_summer_state?: string;      // default: mdi:thermometer-chevron-down
  readonly message_summer_state?: string;   // default: 'Summer time'
}

interface SciFiStateIconsConfig {
  readonly auto?: string;   // default: sci:radiator-auto
  readonly off?: string;    // default: sci:radiator-off
  readonly heat?: string;   // default: sci:radiator-heat
}

interface SciFiStateColorsConfig {
  readonly auto?: string;   // hex — default: #669cd2
  readonly off?: string;    // hex — default: #6c757d
  readonly heat?: string;   // hex — default: #ff7f50
}

interface SciFiModeIconsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

interface SciFiModeColorsConfig {
  readonly frost_protection?: string;
  readonly eco?: string;
  readonly comfort?: string;
  readonly 'comfort-1'?: string;
  readonly 'comfort-2'?: string;
  readonly boost?: string;
}

interface SciFiClimatesConfig {
  readonly entities_to_exclude?: readonly string[];   // ← "entities_to_exclude" (NOT excluded_entity_ids)
  readonly header?: SciFiClimatesHeaderConfig;
  readonly state_icons?: SciFiStateIconsConfig;       // ← DO NOT REMOVE
  readonly state_colors?: SciFiStateColorsConfig;     // ← DO NOT REMOVE
  readonly mode_icons?: SciFiModeIconsConfig;         // ← DO NOT REMOVE
  readonly mode_colors?: SciFiModeColorsConfig;       // ← DO NOT REMOVE
}
```

**Example:**
```yaml
type: custom:sci-fi-climates
entities_to_exclude:
  - climate.unused_radiator
state_icons:
  auto: sci:radiator-auto
  heat: sci:radiator-heat
state_colors:
  heat: "#ff7f50"
mode_icons:
  eco: mdi:leaf
  comfort: mdi:sun-thermometer-outline
mode_colors:
  eco: "#96d35f"
  comfort: "#ffff8f"
```

## Anti-Patterns

> This file is a Reference (YAML contract). Full anti-patterns are in [05_cards.md Anti-Patterns](../05_cards.md#anti-patterns).

| # | Anti-Pattern | Pointer |
|---|---|---|
| 1 | Renaming or removing YAML fields | ADR-005 — zero breaking changes |
| 2 | Removing `state_icons` / `state_colors` / `mode_icons` / `mode_colors` | These 4 sections are MANDATORY ([05_cards.md#anti-patterns](../05_cards.md#anti-patterns) AP#9) |
| 3 | Using `excluded_entity_ids` instead of `entities_to_exclude` | Wrong field name — see YAML contract above |
| 4 | Unmapped HVAC mode crashing icon/color lookup | Fallback to `off` state icon/color ([05_cards.md#sci-fi-climates](../05_cards.md#sci-fi-climates) §8) |
| 5 | Inline HVAC state hardcoding | Use `state_icons`/`state_colors` config maps, not switch statements |

## Test Case Specifications

> Full test suite in [tests/cards/climates/](../../tests/cards/climates/#L1).

| ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-001 | Unit | Renders with minimal config | `type` only | Card renders without error |
| TC-002 | Unit | `entities_to_exclude` hides entity | Entity ID in `entities_to_exclude` | Entity not rendered |
| TC-003 | Unit | `state_icons` overrides HVAC icon | `state_icons.heat: mdi:fire` | Custom icon rendered for heat state |
| TC-004 | Unit | `state_colors` overrides HVAC color | `state_colors.heat: "#ff0000"` | Custom color applied to heat state |
| TC-005 | Unit | Unmapped HVAC mode falls back to `off` | Mode not present in `mode_icons` | `off` icon/color used, no crash |
| IT-001 | Integration | Temperature update re-renders card | `hass.states` updated with new temp | Current temp updated in DOM |

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| No `hass` object | Null check in `render()` | Return `nothing` | Blank render |
| HVAC mode not in `mode_icons` | Lookup returns undefined | Use `off` icon/color as fallback | No crash |
| Missing `sensor.season` | `hass.states['sensor.season']` undefined | Season icon hidden | No crash |

## Cross-Spec Contracts

| Concept | Shared with | Contract |
|---|---|---|
| `SciFiBaseCard` abstract class | [Spec 03](../03_base_classes.md#blueprint-coverage) | `setConfig`, `getCardSize`, `getRelevantEntities` required |
| `SciFiClimatesConfig` YAML contract | [Spec 05](../05_cards.md#sci-fi-climates) | Field names frozen — `entities_to_exclude`, `state_icons`, `mode_icons` |
| `hass.floors` / `hass.areas` | [Spec 02](../02_domain_selectors.md#blueprint-coverage) | HA registry selectors for floor/area grouping |
| `sciFiCommonStyles` | [Spec 03](../03_base_classes.md#blueprint-coverage) | Shared CSS tokens — import, do not redefine |
