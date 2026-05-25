# sci-fi-lights Schema

### sci-fi-lights

```typescript
interface SciFiEntityOverride {
  readonly name?: string;
  readonly icon_on?: string;
  readonly icon_off?: string;
}

interface SciFiLightsConfig {
  readonly header_message?: string;
  readonly default_icon_on?: string;        // default: mdi:lightbulb-on-outline
  readonly default_icon_off?: string;       // default: mdi:lightbulb-outline
  readonly first_floor_to_render?: string;
  readonly first_area_to_render?: string;
  readonly ignored_entities?: readonly string[];              // ← "ignored_entities" (PAS ignored_entity_ids)
  readonly custom_entities?: Readonly<Record<string, SciFiEntityOverride>>; // ← "custom_entities" (PAS entity_overrides)
}
```

**Exemple :**
```yaml
type: custom:sci-fi-lights
header_message: Lumières
default_icon_on: mdi:lightbulb-on-outline
ignored_entities:
  - light.la_boite_a_cha_day_ambient_colour
custom_entities:
  light.nous_salon:
    name: "Étoile"
    icon_on: mdi:star
    icon_off: mdi:star-outline
```

**Comportement de sélection initiale (floor/area) :**

| Config | Comportement |
|
