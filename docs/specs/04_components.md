# Spec 04 — Shared Components

> Document Type: Implementation
> Covers: Step 4 from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1), [Spec 03](./03_base_classes.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-COMP-01 | `sf-icon` — cache encapsulé | ✅ `sf-icon.ts` + `icon-cache.ts` |
| F-COMP-02 | `sf-radiator` — one card-private Lit element | ✅ `src/cards/climates/sf-radiator.ts` — a single `@customElement`, deliberately kept whole (see [§ `sf-radiator` — one element on purpose](#sf-radiator--one-element-on-purpose)). Relocated out of `src/components/` by ADR-017 (single consumer). |
| F-COMP-03 | Shared components migrated TypeScript | ✅ `sf-accordion`, `sf-tabs`, `sf-toggle-switch` |
| F-COMP-04 | Iconset custom fallback | ✅ `sf-icon.ts` fallback |
| F-COMP-05 | `sci-icon` public element | ✅ `sci-icon.ts` — global `<sci-icon>` usable in any HA card |
| F-COMP-06 | HA icon-picker integration | ✅ `sf-iconset.ts` — `window.customIcons.sci.getIconList()` + `getIcon()` |

---

## File Tree

> **ADR-017 — membership rule.** `src/components/` holds components with **two
> or more consumers**. A component used by a single card lives in that card's
> directory (`src/cards/<card>/`), not here. This is what makes the
> `components ↛ cards` boundary in `.sentrux/rules.toml` meaningful.

```
src/
└── components/
    ├── sf-icon/
    │   ├── sf-icon.ts              Icon rendering element (internal, used by sci-fi cards)
    │   ├── sci-icon.ts             Public-facing <sci-icon> element (usable in any HA card)
    │   ├── sf-iconset.ts           Registers sci: namespace via window.customIconsets (ha-icon)
    │   │                           + window.customIcons.sci with getIconList()/getIcon() (ha-icon-picker)
    │   ├── icon-cache.ts           idb-keyval icon cache (in-memory + IndexedDB)
    │   └── data/
    │       ├── sf-icons.ts         Custom static SVG path strings
    │       └── sf-weather-icons.ts Animated weather SVG TemplateResults
    ├── sf-toggle-switch/
    │   └── sf-toggle-switch.ts     Custom switch component
    ├── buttons/
    │   ├── sf-button.ts            Base action button
    │   ├── sf-button-card.ts       Card-styled button
    │   └── sf-button-card-select.ts Card-styled select button
    ├── editor-inputs/              Editor field components (see Spec 10)
    │   ├── sf-editor-accordion.ts      sf-editor-action.ts
    │   ├── sf-editor-chips.ts          sf-editor-color-picker.ts
    │   ├── sf-editor-dropdown.ts       sf-editor-dropdown-entity.ts
    │   ├── sf-editor-dropdown-icon.ts  sf-editor-input.ts
    │   ├── sf-editor-multi-entity.ts   sf-editor-slider.ts
    │   └── sf-editor-source-list.ts
    ├── sf-circle-progress-bar.ts   Circular progress indicator
    ├── sf-dropdown.ts              Generic dropdown
    ├── sf-hexa-row.ts              Hexagonal tile row
    ├── sf-hexa-tile.ts             Hexagonal tile
    ├── sf-stack-bar.ts             Stacked bar display
    ├── sf-toast.ts                 Global toast element
    └── sf-wheel.ts                 Radial dial (stove + vehicles — stays shared)
```

Relocated by ADR-017 (single-consumer components):

| File | Was | Now | Sole consumer |
|---|---|---|---|
| `sf-landspeeder.ts` | `src/components/` | `src/cards/vehicles/` | vehicles card |
| `vehicle_const.ts` | `src/components/` | `src/cards/vehicles/` | vehicles card |
| `sf-radiator.ts` | `src/components/` | `src/cards/climates/` | climates card |
| `sf-stove-image.ts` | `src/components/` | `src/cards/stove/` | stove card |

### `sf-radiator` — one element on purpose

Earlier revisions of this spec announced `sf-radiator` as four sub-components
living in an `sf-radiator/` directory. That directory was never created and
those four elements were never written: the line described an intention, not a
structure that was later lost. The shipped and specified form is **one Lit
element in one file** — `src/cards/climates/sf-radiator.ts`, with its inline SVG
asset already carved off into `radiator-svg.ts` by ADR-017 step 7.

Why it stays whole:

- **Nothing in the file is complaining.** 427 lines, of which ~128 are the
  `static styles` CSS block. The eleven members are small — the longest,
  `__select`, is 48 lines against a `max_fn_lines` ceiling of 100, and
  `check_rules` reports no `max_fn_lines` or `max_cc` violation here. Splitting
  would be a reaction to a line count, not to a measured complexity signal.
- **It would undo ADR-017.** Four extra custom elements mean four shadow roots,
  four tag registrations and four import edges — for widgets whose only consumer
  is the radiator itself. Co-locating single-consumer artefacts with their card
  is precisely the coupling ADR-017 removed; re-splitting a card-private
  component into more card-private components contradicts that decision.
- **The genuinely reusable widget is already out.** The temperature selector is
  `sf-wheel` in `src/components/`, shared with stove and vehicles. What remains
  in `sf-radiator` is climate-specific glue: preset/HVAC option building, label
  mapping and the three `change-*` events. None of it has a second consumer.

Sub-components are the right answer when a widget earns a second consumer, or
when a method stops fitting in a screen. Neither is true here; the split is not
deferred work, it is a rejected option.

---

## Assumptions

| ID | Assumption | Risk | Validation |
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
| `sf-toggle-switch` | Spec 05 | Shared styled switch component |
| `sf-wheel` | Spec 05 | Radial dial — stove + vehicles |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `types/ha.ts` | Spec 02 | EXT HA type definitions |
| `sciFiCommonStyles` | Spec 03 | Styling theme tokens |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `<sf-icon>` | Lovelace Cards (internal) | Resolves and displays SVGs from package or MDI |
| `<sci-icon>` | Any HA component or card | Public-facing icon element — identical to `<sf-icon>` but stable public tag name. Supports `sci:`, `sf:`, `mdi:` prefixes and `--icon-width`, `--icon-height`, `--icon-color` CSS custom properties |
| `<sf-toggle-switch>` | Card Editors | Toggles switch boolean configurations |

> `<sf-radiator>` and `<sf-landspeeder>` were listed here as shared public
> interfaces. They have exactly one consumer each and are card-private as of
> ADR-017 — see Spec 05 § Climates / Vehicles.

### HA Icon Picker API

`sf-iconset.ts` registers two objects on `window`:

| Object | Key | Purpose |
|---|---|---|
| `window.customIconsets['sci']` | `sci` | Used by `<ha-icon icon="sci:name">` — returns `{ path, viewBox }` for direct resolution |
| `window.customIcons['sci']` | `sci` | Used by `<ha-icon-picker>` search — exposes `getIcon(name)` and `getIconList()` |

**`getIconList()` contract:** `() => Promise<{name: string, keywords?: string[]}[]>`
- Returns all `sci:` icon names (static + animated weather icons)
- Non-enumerable on the map (does not pollute icon path lookups in `sf-icon.ts`)

**`getIcon(name)` contract:** `(name: string) => Promise<{ path: string; viewBox: string }>`
- Used by HA to preview an icon before selection

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Heavy SVG requests | Fetch MDI icon from external CDN on every render | Query `icon-cache.ts` module-level Map first; in live HA environment (if `<ha-icon>` custom element is registered), directly bypass the deprecated `'mdi'` WebSocket registry call and render `<ha-icon .icon="${this.icon}"></ha-icon>` natively — **never unpkg/jsdelivr CDN** (breaks offline HA) |
| 2 | Hardcoded CDN URL | `fetch('https://unpkg.com/@mdi/svg/...')` | Use HA native registry or local HACS file path 'hacsfiles/ha-sci-fi/icons/' — see CRITICAL-01 |
| 3 | Component styles leak | Global stylesheet inclusion | Define elements within scoped Lit Shadow DOM |
| 4 | Manual event dispatching | Mutating card config values | Dispatch standard custom element events with `composed: true` |
| 5 | Fetch flood in incognito | IndexedDB blocks in private window — fetching on every render with no rate limit | Use in-memory `Map` as volatile fallback cache + limit concurrent fetches to 5 max — see MEDIUM-03 |
| 6 | `window.customIcons` overwrite | `window.customIcons.sf = sfIconset` (direct assignment) | Merge defensively: `window.customIcons.sf = { ...window.customIcons.sf, ...sfIconset }` |
| 7 | Attribute binding for dynamic icons | `icon="${expression}"` (HTML attribute) for a dynamic value | Use `.icon="${expression}"` (property binding) — Lit attribute binding does NOT reflect updates after first render. Dynamic values (ternary expressions, variables) MUST use property binding `.icon=` to trigger `willUpdate()` on change |
| 8 | **Missing `:host { display: block }`** | Omitting `display: block` on `:host` in any LitElement component | All `sf-*` custom elements have `display: inline` by default (HTML spec). `margin: auto` and flex/grid centering silently fail. Add `:host { display: block; }` as the FIRST rule in every component's `styles.ts`. (L059) |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-401 | Unit | sf-icon checks customIcons first | Custom icon request | Renders custom path from window |
| TC-402 | Unit | sf-icon checks native MDI next | MDI icon request | Renders native path from database |
| TC-403 | Unit | icon-cache saves icons successfully | Fetch and cache request | Stores SVG in idb-keyval cache |
| TC-404 | Unit | sf-radiator compiles correctly | Active climate configuration | Renders the radiator SVG, one `sf-wheel` and the two `sf-button-card-select` — **moved to Spec 05 § Climates** (component relocated by ADR-017); test lives in `tests/cards/climates/sf-radiator.test.ts` |
| TC-405 | Unit | sf-toggle-switch dispatch events | Click active element | Dispatches custom change event |
| TC-406 | Unit | sci-icon mirrors sf-icon API | sci: / sf: / mdi: icon | Renders correctly for each prefix |
| TC-407 | Unit | getIconList() returns all sci: icons | Call getIconList() | Returns array with name for each registered icon |
| TC-408 | Unit | getIcon() returns path+viewBox | Call getIcon('stove') | Returns `{ path: string, viewBox: '0 0 24 24' }` |
| IT-401 | Integration | Icon cache hit avoids server queries | Load cached icon again | Loads from DB without fetch requests |
| IT-402 | Integration | Radiator buttons update HA states | Click radiator buttons | Dispatches climate service call event |
| IT-403 | Integration | Components render on state update | Modify entity state | Component updates view immediately |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Icon not in HA registry | `<ha-icon>` fail or `resolveIcon` returns `ICON_NOT_FOUND` | Log warning, render nothing | Render `mdi:help-circle` placeholder icon |
| IndexedDB blocked (incognito) | `idb-keyval` `get()`/`set()` throws `DOMException` | Catch, log warning: `[sf-icon] IndexedDB unavailable, using in-memory fallback` | Use module-level `Map` as volatile fallback cache |
| Icon fetch fails entirely | Network error or 404 | Catch, warn | `nothing` rendered — no crash |
| Event dispatch error | Event bubbling fails | Let browser log stack trace | Prevent default, execute safe error boundary catch |
