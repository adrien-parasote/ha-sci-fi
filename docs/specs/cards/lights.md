> Document Type: Reference
> YAML contract — Full implementation spec in [05_cards.md](../05_cards.md#sci-fi-lights)
> Depends on: [Spec 02](../02_domain_selectors.md#blueprint-coverage), [Spec 03](../03_base_classes.md#blueprint-coverage)

# sci-fi-lights Schema

### sci-fi-lights

```typescript
// src/types/config.ts
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
  readonly ignored_entities?: readonly string[];              // ← "ignored_entities" (NOT ignored_entity_ids)
  readonly custom_entities?: Readonly<Record<string, SciFiEntityOverride>>; // ← "custom_entities" (NOT entity_overrides)
}
```

**Example:**
```yaml
type: custom:sci-fi-lights
header_message: Lights
default_icon_on: mdi:lightbulb-on-outline
ignored_entities:
  - light.ambient_colour
custom_entities:
  light.living_room:
    name: "Star lamp"
    icon_on: mdi:star
    icon_off: mdi:star-outline
```

**Floor/Area initial selection behavior:**

| Config | Behavior |
|---|---|
| `first_floor_to_render: 'ground'` | Selects 'ground' if ID or name exists in `hass.floors` (case-insensitive) |
| `first_floor_to_render` absent or unknown | Fallback → first floor with lights → first floor |
| `first_area_to_render: 'bedroom'` | Selects 'bedroom' if it is in the active floor's areas |
| `first_area_to_render` absent or area outside floor | Fallback → first area with lights → first area of floor |

> [!NOTE]
> Validation does **not** require lights to be present to keep a configured floor/area. This prevents an empty screen flash on first render when the HA entity registry is not yet loaded (L042).
> Validate `first_floor_to_render` by ID existence in `hass.floors` ONLY — NOT by light count.

## Anti-Patterns

> This file is a Reference (YAML contract). Full anti-patterns are in [05_cards.md Anti-Patterns](../05_cards.md#anti-patterns).

| # | Anti-Pattern | Pointer |
|---|---|---|
| 1 | Renaming YAML fields (`custom_entities` → `entity_overrides`, `ignored_entities` → `ignored_entity_ids`) | ADR-005 — field names frozen |
| 2 | Validating `first_floor_to_render` by light count (not ID existence) | L042 — validate by `hass.floors[id]` existence only |
| 3 | Skipping empty state rendering | When no lights in floor/area → show empty state message |
| 4 | Using `window.location.assign()` for HA navigation | Use `history.pushState()` + `location-changed` ([05_cards.md#anti-patterns](../05_cards.md#anti-patterns) AP#8) |
| 5 | Attribute binding for dynamic properties (`.icon=` vs `icon=`) | L016 — property binding required for reactive updates |

## Test Case Specifications

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les huit lignes : aucun test de la carte ne cite ses ids — `sci-fi-lights-editor.test.ts` porte ceux de `10_card_editors.md`.
> Le marqueur est la seule source : `tests/specs/ids-cas-uniques.test.ts` dérive
> l'ensemble des cas non joués de ces marques et refuse l'écart dans les deux
> sens — un cas non marqué que rien ne cite, comme un cas marqué qu'un test porte.

> Full test suite in [tests/cards/lights/](../../tests/cards/lights/#L1).

| ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-LIGHTS-U-001 ⬜ | Unit | Renders empty state when no lights in area | Config with ignored all entities | Empty state message rendered |
| TC-LIGHTS-U-002 ⬜ | Unit | `first_floor_to_render` resolved by ID not light count | `first_floor_to_render: 'rdc'`, floor exists but has no lights | `rdc` floor still selected |
| TC-LIGHTS-U-003 ⬜ | Unit | `ignored_entities` hides listed entities | Config with entity in `ignored_entities` | Entity not present in DOM |
| TC-LIGHTS-U-004 ⬜ | Unit | `custom_entities` overrides name and icons | Config with `custom_entities` entry | Custom name/icon rendered |
| TC-LIGHTS-U-005 ⬜ | Unit | `getRelevantEntities()` returns only light domain entities | Mixed entity config | Only `light.*` in result |
| IT-LIGHTS-I-001 ⬜ | Integration | Floor navigation updates area list | Click floor tab | Area list updates to selected floor |
| IT-LIGHTS-I-002 ⬜ | Integration | Card re-renders on hass state change |  light entity updated | DOM reflects new light state |
| IT-LIGHTS-I-003 ⬜ | Integration | Editor custom_entities persisted to config | Add custom icon in editor |  updated in card |

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| No `hass` object | Null check in `render()` | Return `nothing` | Blank render |
| `first_floor_to_render` not in `hass.floors` | ID lookup fails | Fallback to first floor with lights | First floor of registry |
| All entities ignored | Post-filter empty array | Empty state message | N/A |

## Cross-Spec Contracts

| Concept | Shared with | Contract |
|---|---|---|
| `SciFiBaseCard` abstract class | [Spec 03](../03_base_classes.md#blueprint-coverage) | `setConfig`, `getCardSize`, `getRelevantEntities` required |
| `SciFiEntityOverride` | [Spec 05](../05_cards.md#sci-fi-lights) | YAML field names frozen — `icon_on`/`icon_off`/`name` |
| `hass.floors` / `hass.areas` | [Spec 02](../02_domain_selectors.md#blueprint-coverage) | HA registry selectors — floor/area hierarchy |
| `sciFiCommonStyles` | [Spec 03](../03_base_classes.md#blueprint-coverage) | Shared CSS tokens — import, do not redefine |

## Localization

Every user-visible string of the card is an English `msg()` source, French in `xliff/fr.xlf` (project `sourceLocale` is `en`; stove contract C12): the default header `Lights`, the empty states `No floor configured`, `No lights configured for this floor`, `No lights` and `Select a room`, the turn on/off button titles (`Turn all off`, `Turn all on`, `Turn this floor off`, `Turn this floor on`, `Turn the room off`, `Turn the room on`) and the eight toasts (`Light|Room|Floor|All turned off|on`). `header_message` from the config replaces the default header. An editor label is a key of `src/cards/lights/labels.ts` read by `getLabel` (ADR-017). Area and floor names come from the Home Assistant registry and are never translated by the card. Full list and tests: [i18n-hardcoded-fr](../i18n-hardcoded-fr/spec.md) FR-2.
