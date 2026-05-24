# Spec 04 — Shared Components

> Document Type: Implementation
> Covers: Step 4 from [implementation_plan.md](../implementation_plan.md#L1)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1), [Spec 03](./03_base_classes.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-COMP-01 | `sf-icon` — cache encapsulé | ✅ `sf-icon.ts` + `icon-cache.ts` |
| F-COMP-02 | `sf-radiator` → 4 sub-composants | ✅ 4 sub-composants in `sf-radiator/` |
| F-COMP-03 | Shared components migrated TypeScript | ✅ `sf-accordion`, `sf-tabs`, `sf-toggle-switch` |
| F-COMP-04 | Iconset custom fallback | ✅ `sf-icon.ts` fallback |

---

## File Tree

```
src/
└── components/
    ├── sf-icon/
    │   ├── sf-icon.ts              [NEW] Icon rendering element
    │   └── icon-cache.ts           [NEW] idb-keyval icon cache
    ├── sf-radiator/
    │   ├── sf-radiator.ts          [NEW] Main radiator container
    │   ├── sf-radiator-button.ts   [NEW] Mode select buttons
    │   ├── sf-radiator-gauge.ts    [NEW] Heat circular gauge
    │   └── sf-radiator-temp.ts     [NEW] Target temp selector
    └── sf-toggle-switch.ts         [NEW] Custom switch component
```

---

## Assumptions

| # | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | `idb-keyval` is supported in browser local databases | Low | → Run IndexDB inspection inside active browser developer tools |
| 2 | `window.customIcons['sf']` is registered before render | Medium | → Run console log verification check for customIcons during load |
| 3 | Shadow DOM prevents CSS leaks into shared components | Medium | → Run style isolation inspection on elements in browser DOM |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `sf-icon` | Spec 05 | Rendering MDI or custom package icons |
| `sf-radiator` | Spec 05 | Multi-radiator climate interface |
| `sf-toggle-switch` | Spec 05 | Shared styled switch component |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `types/ha.ts` | Spec 02 | EXT HA type definitions |
| `sciFiCommonStyles` | Spec 03 | Styling theme tokens |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `<sf-icon>` | Lovelace Cards | Resolves and displays SVGs from package or MDI |
| `<sf-toggle-switch>` | Card Editors | Toggles switch boolean configurations |
| `<sf-radiator>` | Climates Card | Climate entity thermostat rendering |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Heavy SVG requests | Fetch MDI icon from external CDN on every render | Query `icon-cache.ts` module-level Map first; use HA native icon registry via `hass.connection.sendMessagePromise({type: 'frontend/get_icons', category: 'mdi'})` — **never unpkg/jsdelivr CDN** (breaks offline HA) |
| 2 | Hardcoded CDN URL | `fetch('https://unpkg.com/@mdi/svg/...')` | Use HA native registry or local HACS file path `hacsfiles/ha-sci-fi/icons/` — see CRITICAL-01 |
| 3 | Component styles leak | Global stylesheet inclusion | Define elements within scoped Lit Shadow DOM |
| 4 | Manual event dispatching | Mutating card config values | Dispatch standard custom element events with `composed: true` |
| 5 | Fetch flood in incognito | IndexedDB blocks in private window — fetching on every render with no rate limit | Use in-memory `Map` as volatile fallback cache + limit concurrent fetches to 5 max — see MEDIUM-03 |
| 6 | `window.customIcons` overwrite | `window.customIcons.sf = sfIconset` (direct assignment) | Merge defensively: `window.customIcons.sf = { ...window.customIcons.sf, ...sfIconset }` |
| 7 | Attribute binding for dynamic icons | `icon="${expression}"` (HTML attribute) for a dynamic value | Use `.icon="${expression}"` (property binding) — Lit attribute binding does NOT reflect updates after first render. Dynamic values (ternary expressions, variables) MUST use property binding `.icon=` to trigger `willUpdate()` on change |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-401 | Unit | sf-icon checks customIcons first | Custom icon request | Renders custom path from window |
| TC-402 | Unit | sf-icon checks native MDI next | MDI icon request | Renders native path from database |
| TC-403 | Unit | icon-cache saves icons successfully | Fetch and cache request | Stores SVG in idb-keyval cache |
| TC-404 | Unit | sf-radiator compiles correctly | Active climate configuration | Renders nested radiator elements |
| TC-405 | Unit | sf-toggle-switch dispatch events | Click active element | Dispatches custom change event |
| IT-401 | Integration | Icon cache hit avoids server queries | Load cached icon again | Loads from DB without fetch requests |
| IT-402 | Integration | Radiator buttons update HA states | Click radiator buttons | Dispatches climate service call event |
| IT-403 | Integration | Components render on state update | Modify entity state | Component updates view immediately |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Icon not in HA registry | `hass.connection.sendMessagePromise` resolves empty | Log warning, render nothing | Render `mdi:help-circle` placeholder icon |
| IndexedDB blocked (incognito) | `idb-keyval` `get()`/`set()` throws `DOMException` | Catch, log warning: `[sf-icon] IndexedDB unavailable, using in-memory fallback` | Use module-level `Map` as volatile cache; rate-limit concurrent fetches to 5 simultaneous max via counter |
| Icon fetch fails entirely | Network error or 404 | Catch, warn | `nothing` rendered — no crash |
| Event dispatch error | Event bubbling fails | Let browser log stack trace | Prevent default, execute safe error boundary catch |
