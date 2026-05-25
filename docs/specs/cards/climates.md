# sci-fi-climates Schema

### sci-fi-climates

```typescript
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
  readonly entities_to_exclude?: readonly string[];   // ← "entities_to_exclude" (PAS excluded_entity_ids)
  readonly header?: SciFiClimatesHeaderConfig;
  readonly state_icons?: SciFiStateIconsConfig;       // ← NE PAS SUPPRIMER
  readonly state_colors?: SciFiStateColorsConfig;     // ← NE PAS SUPPRIMER
  readonly mode_icons?: SciFiModeIconsConfig;         // ← NE PAS SUPPRIMER
  readonly mode_colors?: SciFiModeColorsConfig;       // ← NE PAS SUPPRIMER
}
```

**Exemple :**
```yaml
type: custom:sci-fi-climates
entities_to_exclude:
  - climate.clou
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
