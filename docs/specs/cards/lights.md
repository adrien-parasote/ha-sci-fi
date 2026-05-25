> Document Type: Reference
> YAML contract — Full implementation spec in [05_cards.md](../05_cards.md#sci-fi-lights)
> Depends on: [Spec 02](../02_domain_selectors.md#blueprint-coverage), [Spec 03](../03_base_classes.md#blueprint-coverage)

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
|---|---|
| `first_floor_to_render: 'rdc'` | Sélectionne 'rdc' SI l'ID existe dans `hass.floors` (même si aucune lumière) |
| `first_floor_to_render` absent ou ID inconnu | Fallback → 1er floor avec lumières → 1er floor |
| `first_area_to_render: 'chambre'` | Sélectionne 'chambre' SI elle est dans les areas du floor actif |
| `first_area_to_render` absent ou area hors floor | Fallback → 1ère area avec lumières → 1ère area du floor |

> [!NOTE]
> La validation ne requiert **pas** la présence de lumières pour conserver un floor/area configuré. Cela évite un flash d'écran vide lors du 1er rendu quand le registre d'entités HA n'est pas encore chargé (L042).
> Valider `first_floor_to_render` par existence d'ID dans `hass.floors` UNIQUEMENT — PAS par le nombre de lumières.

## Anti-Patterns

> This file is a Reference (YAML contract). Full anti-patterns are in [05_cards.md Anti-Patterns](../05_cards.md#anti-patterns).

| # | Anti-Pattern | Pointer |
|---|---|---|
| 1 | Renaming YAML fields (`custom_entities` → `entity_overrides`, `ignored_entities` → `ignored_entity_ids`) | ADR-005 — field names frozen |
| 2 | Validating `first_floor_to_render` by light count (not ID existence) | L042 — validate by `hass.floors[id]` existence only |
| 3 | Skipping empty state rendering | When no lights in floor/area → show "Aucune lumière" message |
| 4 | Using `window.location.assign()` for HA navigation | Use `history.pushState()` + `location-changed` (AP#8 in 05_cards.md) |
| 5 | Attribute binding for dynamic properties (`.icon=` vs `icon=`) | L016 — property binding required for reactive updates |

