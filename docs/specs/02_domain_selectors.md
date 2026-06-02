# Spec 02 — Domain Selectors & Types

> Document Type: Implementation
> Covers: Step 2 from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-DOM-01 | HomeAssistantExt types | ✅ `src/types/ha.ts` |
| F-DOM-02 | Configuration validation schemas | ✅ `src/types/config.ts` |
| F-DOM-03 | Immutability on all domain structures | ✅ `src/types/ha.ts` |
| F-DOM-04 | Immutability mapping helpers | ✅ `src/selectors/house.ts` |
| F-DOM-05 | Immutability collection selectors | ✅ `src/selectors/climate.ts` |
| F-DOM-06 | Immutability filter selectors | ✅ `src/selectors/light.ts` |
| F-DOM-07 | Mocking hass extensions | ✅ `tests/fixtures/mock-hass.ts` |

---

## File Tree

```
src/
├── types/
│   ├── ha.ts                       [NEW] Home Assistant custom types
│   └── config.ts                   [NEW] Lovelace Card YAML interfaces
├── selectors/
│   ├── house.ts                    [NEW] Immutable area/floor selectors
│   ├── climate.ts                  [NEW] Climate state selector functions
│   └── light.ts                    [NEW] Light domain selector functions
└── tests/fixtures/mock-hass.ts     [NEW] Mock HomeAssistant environment
```

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | HA state object properties are immutable at runtime | Low | → Run console query hass.states to verify read-only nature |
| 2 | Area and Floor registries are populated in HASS ext | Medium | → Run console check hass.areas and hass.floors structures |
| 3 | Read-only selectors are memory efficient and fast | Medium | → Run performance benchmark test in Chromium browser |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `types/ha.ts` | Spec 03-06 | Home Assistant Extended type definitions |
| `types/config.ts` | Spec 05, 06 | YAML Card Config structures |
| `selectors/*.ts` | Spec 05 | Functional immutable domain state queries |
| `tests/fixtures/mock-hass.ts` | Spec 03, 05, 06 | Mocked HASS extension fixture |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `tsconfig.json` | Spec 01 | TS rules enforcing strict nulls |

 ### Public Interface

> `selectHouseState()` is REMOVED — ADR-004 explicitly deletes the House model.
> Use direct selector functions instead.

| Element | Consumed by | Description |
|---|---|---|
| `getFloors(hass)` | Card components | Returns `readonly HassFloor[]` from HA floor registry |
| `getFloorById(hass, floorId)` | Lights card | Returns a single `HassFloor \| undefined` |
| `getAreasByFloor(hass, floorId)` | Lights card | Returns `readonly HassArea[]` for a floor |
| `getEntitiesByArea(hass, areaId)` | All cards | Returns `readonly HassEntityEntry[]` for an area |
| `getLightEntities(hass, areaId)` | Lights card | Filters `light.*` entities by area |
| `getClimateEntities(hass)` | Climates card | Returns all `climate.*` entities |
| `countActiveLights(hass, areaId)` | Lights card accordion | Count of lights with state `'on'` in an area |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Direct state mutation | `hass.states['light.x'].state = 'on'` | Treat HASS states as read-only, return a copy |
| 2 | Heavy loops in render | Computing arrays in Lit `render()` | Use memoized selector functions |
| 3 | Incomplete typecasting | Cast `hass` as `any` | Always use strict custom types from `ha.ts` |
| 4 | Deep copying registry | `JSON.parse(JSON.stringify(hass))` | Perform shallow copy using spread operators |
| 5 | Hardcoded entity types | String literals in filtering | Use typed selector domain constants |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-201 | Unit | `getFloors()` returns all floors | `mockHass` with 2 floors | `readonly HassFloor[]` length 2 |
| TC-202 | Unit | `getAreasByFloor()` filters by floor | `mockHass` floor `ground` has 3 areas | Returns exactly 3 areas |
| TC-203 | Unit | `getLightEntities()` filters light domain | `mockHass` area with 2 lights + 1 switch | Returns only 2 light entities |
| TC-204 | Unit | `getClimateEntities()` skips non-climate | `mockHass` with 1 climate + 1 sensor | Returns array length 1 |
| TC-205 | Unit | `getFloors()` empty if no floors registered | `mockHass` with empty floors registry | Returns `[]` (no crash) |
| TC-206 | Unit | `countActiveLights()` correct count | 3 lights: 2 on, 1 off | Returns `2` |
| TC-207 | Unit | Type guard rejects invalid config | `{ type: 'custom:sci-fi-lights' }` missing required field | Throws `Error` with field name |
| IT-201 | Integration | Selectors are pure — no mutation | Call `getFloors()` twice | Returns identical references (same data, no mutation) |
| IT-202 | Integration | Performance: 500 entities | `mockHass` with 500 states | `getLightEntities()` completes under 5ms |
| IT-203 | Integration | End-to-end selector pipeline | Chain `getFloors` -> `getAreasByFloor` -> `getEntitiesByArea` | Correct entities resolved across hierarchy |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Invalid Configuration | Lightweight TypeScript type-guard assertions (`if (typeof config.entity_id !== 'string')`) — **no Zod** (Zod adds ~45KB to IIFE bundle) | Throw `Error('Invalid config: entity_id is required')` | Block rendering, `SciFiBaseCard.render()` catches and shows error banner |
| Null Registry State | `hass.areas` undefined | Return default empty records | Log warning in console and fall back safely |
| Type Mismatch | Compiler type checker | Interrupt build process | Exit build with compiler type mismatch log |
