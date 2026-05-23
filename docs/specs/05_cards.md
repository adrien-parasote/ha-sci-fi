# Spec 05 — Cards Rewrite (8 cartes)

> Document Type: Implementation
> Covers: Step 5 from [implementation_plan.md](../implementation_plan.md#L1)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1), [Spec 03](./03_base_classes.md#L1), [Spec 04](./04_components.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-CARD-01 | `sci-fi-hexa-tiles` Lovelace Card | ✅ `hexa_tiles/` |
| F-CARD-02 | `sci-fi-lights` Lovelace Card | ✅ `lights/` |
| F-CARD-03 | `sci-fi-climates` Lovelace Card | ✅ `climates/` |
| F-CARD-04 | `sci-fi-plugs` Lovelace Card | ✅ `plugs/` |
| F-CARD-05 | `sci-fi-weather` Lovelace Card | ✅ `weather/` |
| F-CARD-06 | `sci-fi-stove` Lovelace Card | ✅ `stove/` |
| F-CARD-07 | `sci-fi-vehicles` Lovelace Card | ✅ `vehicles/` |
| F-CARD-08 | `sci-fi-vacuum` Lovelace Card | ✅ `vacuum/` |

---

## File Tree

```
src/cards/
├── hexa_tiles/                     [NEW] Hexagonal dashboard card
├── lights/                         [NEW] Lights control card
├── climates/                       [NEW] Radiator climate controls
├── plugs/                          [NEW] Plug power monitor card
├── weather/                        [NEW] Weather forecast chart
├── stove/                          [NEW] Stove heat monitor card
├── vehicles/                       [NEW] Vehicle range and controls
└── vacuum/                         [NEW] Vacuum manager card
```

---

## Assumptions

| # | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | Configuration YAML mappings align with target HA models | Low | → Run Lovelace card configuration dashboard validation |
| 2 | Lit component loops handle 8 distinct cards reactively | Medium | → Run performance profiling check inside Chrome DevTools |
| 3 | Chart.js is **bundled** (not CDN-loaded) in the IIFE — offline HA works | Medium | → Run `npm run build` and confirm Chart.js appears in `dist/sci-fi.min.js` bundle stats |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `sci-fi-hexa-tiles` | Spec 06 | Registered custom Lovelace card |
| `sci-fi-lights` | Spec 06 | Registered custom Lovelace card |
| `sci-fi-climates` | Spec 06 | Registered custom Lovelace card |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `SciFiBaseCard` | Spec 03 | Standard card parent class |
| `<sf-icon>` | Spec 04 | Packaged custom package icon renderer |
| `getFloors()`, `getLightEntities()`, `getClimateEntities()` | Spec 02 | Direct domain selectors — **no `selectHouseState()`** (ADR-004) |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `custom:sci-fi-hexa-tiles` | Lovelace Dashboard | Main dashboard card interface |
| `custom:sci-fi-lights` | Lovelace Dashboard | Main lights control card interface |
| `custom:sci-fi-climates` | Lovelace Dashboard | Main climate control card interface |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Inline styling duplication | Redefining styles across cards | Import common classes from `common.ts` |
| 2 | Heavy state calculations | Recomputing arrays in render | Delegate tasks to selector utility functions |
| 3 | Bypassing base editors | Redefining editor handlers | Inherit functions from `SciFiBaseEditor` |
| 4 | Ignoring translation files | Hardcoded text labels in card | Query localization utilities via `@lit/localize` |
| 5 | Infinite re-renders | Modifying parameters in update | Perform updates strictly inside Lit lifecycle hooks |
| 6 | Dynamic CDN load of Chart.js | `import('https://cdn.jsdelivr.net/npm/chart.js')` | Bundle Chart.js in the IIFE — never load from CDN (offline HA will crash) |
| 7 | No Chart.js offline fallback | Canvas renders blank on offline HA | If Chart.js fails to init, render static CSS grid with temperature numbers |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-501 | Unit | HexaTiles parses configuration | YAML with 3 items | Returns 3 matching tile objects |
| TC-502 | Unit | WeatherCard renders forecast — Chart.js bundled | Weather entity with 5-day forecast | Chart canvas OR CSS grid fallback visible |
| TC-503 | Unit | LightsCard filters offline | Entities with unavailable state | Filters and hides offline lights |
| TC-504 | Unit | VehiclesCard updates dynamic speed | speed state set in HA | SVG speeds match state values |
| TC-505 | Unit | VacuumCard issues vacuum commands | Click vacuum start button | Dispatches correct HASS service calls |
| TC-506 | Unit | WeatherCard offline fallback | Chart.js constructor throws | CSS grid with temperature values rendered |
| IT-501 | Integration | Card registers on customElements | Load script entry point | `customElements.get()` returns classes |
| IT-502 | Integration | Card updates on HASS state changes | Trigger state update event | Card layout re-renders instantly |
| IT-503 | Integration | Editor synchronizes configuration | Change toggles in editor | Dispatches valid `config-changed` event |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| YAML Parse Failure | Invalid Lovelace configuration | Log error trace | `SciFiBaseCard.render()` error boundary catches → shows error card |
| Entity Unavailable | Missing entity in HASS state | Display warning badge | Show entity unavailable placeholder text |
| Chart.js Init Failure | `new Chart()` throws (offline or blocked) | Catch exception | Render CSS grid fallback with raw temperature forecast numbers |
