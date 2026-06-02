# Spec 10 — Card Editors (Graphical Configuration UI)

> Document Type: Implementation
> Covers: Step 10 — Restoration of 8 graphical card editors
> Depends on: [Spec 03](./03_base_classes.md#L1), [Spec 04](./04_components.md#L1), [Spec 05](./05_cards.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Spec file |
|---|---|---|
| F-EDITOR-01 | `sf-editor-input` — texte/number input avec label flottant | ✅ This spec § Editor Input Components |
| F-EDITOR-02 | `sf-editor-dropdown` — dropdown filtrable | ✅ This spec § Editor Input Components |
| F-EDITOR-03 | `sf-editor-dropdown-entity` — dropdown entités HA | ✅ This spec § Editor Input Components |
| F-EDITOR-04 | `sf-editor-dropdown-icon` — dropdown icônes | ✅ This spec § Editor Input Components |
| F-EDITOR-05 | `sf-editor-multi-entity` — multi-sélection entités avec chips | ✅ This spec § Editor Input Components |
| F-EDITOR-06 | `sf-editor-slider` — range input | ✅ This spec § Editor Input Components |
| F-EDITOR-07 | `sf-editor-chips` — tags multivaleur | ✅ This spec § Editor Input Components |
| F-EDITOR-08 | `sf-editor-color-picker` — color picker | ✅ This spec § Editor Input Components |
| F-EDITOR-09 | `sf-editor-accordion` — accordéon groupé | ✅ This spec § Editor Input Components |
| F-EDITOR-10 | Enrichissement `SciFiBaseEditor` (`getLabel`, `_getNewConfig`) | ✅ This spec § Base Editor Enrichment |
| F-EDITOR-11 | `sci-fi-weather-editor` | ✅ This spec § Card Editors |
| F-EDITOR-12 | `sci-fi-climates-editor` | ✅ This spec § Card Editors |
| F-EDITOR-13 | `sci-fi-lights-editor` | ✅ This spec § Card Editors |
| F-EDITOR-14 | `sci-fi-plugs-editor` | ✅ This spec § Card Editors |
| F-EDITOR-15 | `sci-fi-stove-editor` | ✅ This spec § Card Editors |
| F-EDITOR-16 | `sci-fi-vacuum-editor` | ✅ This spec § Card Editors |
| F-EDITOR-17 | `sci-fi-vehicles-editor` | ✅ This spec § Card Editors |
| F-EDITOR-18 | `sci-fi-hexa-tiles-editor` | ✅ This spec § Card Editors |

---

## File Tree

```
src/
├── components/
│   └── editor-inputs/
│       ├── sf-editor-input.ts              [NEW] Base input field
│       ├── sf-editor-dropdown.ts           [NEW] Filterable dropdown (extends input)
│       ├── sf-editor-dropdown-entity.ts    [NEW] HA entity dropdown
│       ├── sf-editor-dropdown-icon.ts      [NEW] Icon picker dropdown
│       ├── sf-editor-multi-entity.ts       [NEW] Multi-entity chips selector
│       ├── sf-editor-slider.ts             [NEW] Range slider
│       ├── sf-editor-chips.ts              [NEW] Multi-value chips input
│       ├── sf-editor-color-picker.ts       [NEW] Color picker
│       └── sf-editor-accordion.ts          [NEW] Collapsible section
├── styles/
│   └── editor-common.ts                    [NEW] Shared editor CSS tokens
├── utils/
│   └── base-editor.ts                      [MODIFY] Add getLabel() + _getNewConfig()
├── cards/
│   ├── weather/
│   │   └── sci-fi-weather-editor.ts        [NEW]
│   ├── climates/
│   │   └── sci-fi-climates-editor.ts       [NEW]
│   ├── lights/
│   │   └── sci-fi-lights-editor.ts         [NEW]
│   ├── plugs/
│   │   └── sci-fi-plugs-editor.ts          [NEW]
│   ├── stove/
│   │   └── sci-fi-stove-editor.ts          [NEW]
│   ├── vacuum/
│   │   └── sci-fi-vacuum-editor.ts         [NEW]
│   ├── vehicles/
│   │   └── sci-fi-vehicles-editor.ts       [NEW]
│   └── hexa_tiles/
│       └── sci-fi-hexa-tiles-editor.ts     [NEW]
└── sci-fi.ts                               [MODIFY] Import all editors
```

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | `hass.floors`, `hass.areas`, `hass.devices` are populated before editor opens | Medium | Validated via `grep -r hass.floors src/` — guard added in all editor components |
| 2 | `sf-toggle-switch` emits `sf-toggle-change` (not `toggle-change`) with `{ checked: boolean }` payload | Low | Verified via `grep -r sf-toggle-change src/` — confirmed event name and payload |
| 3 | HA Lovelace listens for `config-changed` CustomEvent with `{ config }` detail on the editor element | Low | Verified via HA frontend docs — `config-changed` + `composed: true` is standard |
| 4 | `CUSTOM_ICONS` import from `sf-icon/data/sf-icons.ts` is a `Record<string, string>` (keys = icon names) | Low | Confirmed by inspecting first line of file: `export default { 'vacuum-sleep': '...', ... }` |
| 5 | `msg()` from `@lit/localize` is available inside `base-editor.ts` | Low | Already used in `base-card.ts` — same import pattern applies |

### API Response Contract (SHOW vs TELL)

```json
// [verified via POC 2024-05-24]
// Example of hass.floors structure returned by the backend:
{
  "floor_1": {
    "floor_id": "floor_1",
    "name": "First Floor",
    "icon": "mdi:home",
    "aliases": [],
    "level": 1
  }
}
```

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Port logic faithfully from `main` branch; use `@customElement` decorator; dispatch `config-changed` with `bubbles: true, composed: true`; import `sciFiEditorCommonStyles` in every editor |
| **Ask first** | Adding new config fields not present in `main`; adding new dependencies to `package.json`; changing the event payload format of existing components |
| **Never do** | Mutate `this.config` directly — always create a new object via `_getNewConfig()`; use `innerHTML`; add validation logic to editors (validation belongs in `setConfig`); test implementation details/private methods |

---

## Cross-Spec Contracts

 ### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `sci-fi-*-editor` custom elements | Web Components | This spec § Card Editors | Lovelace `getConfigElement()` in Spec 05 |
| `sf-editor-input`, `sf-editor-dropdown`, etc. | Web Components | This spec § Editor Input Components | 8 card editors in this spec |
| `SciFiBaseEditor.getLabel(key)` | `string` method | This spec § Base Editor Enrichment | All 8 card editors |
| `SciFiBaseEditor._getNewConfig<T>()` | `T` method | This spec § Base Editor Enrichment | All 8 card editors |

 ### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `SciFiBaseEditor` | Abstract class | Spec 03 § base-editor.ts | `src/utils/base-editor.ts` |
| `HomeAssistantExt` | TS type | Spec 02 § types/ha.ts | `src/types/ha.ts` |
| `Sci-Fi*Config` types | TS interfaces | Spec 05 § Config Types | `src/types/config.ts` |
| `getFloors`, `getAreasByFloor` | Functions | Spec 02 § house.ts | `src/selectors/house.ts` |
| `getLightEntities` | Function | Spec 02 § light.ts | `src/selectors/light.ts` |
| `sf-toggle-switch` | Web Component | Spec 04 § sf-toggle-switch | `src/components/sf-toggle-switch/` |
| `CUSTOM_ICONS`, `WEATHER_ICONS` | Dicts | Spec 04 § sf-icon/data | `src/components/sf-icon/data/` |
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |

 ### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-weather-editor>` | HA Lovelace via `getConfigElement()` | Weather card editor |
| `<sci-fi-climates-editor>` | HA Lovelace | Climates editor |
| `<sci-fi-lights-editor>` | HA Lovelace | Lights editor |
| `<sci-fi-plugs-editor>` | HA Lovelace | Plugs editor |
| `<sci-fi-stove-editor>` | HA Lovelace | Stove editor |
| `<sci-fi-vacuum-editor>` | HA Lovelace | Vacuum editor |
| `<sci-fi-vehicles-editor>` | HA Lovelace | Vehicles editor |
| `<sci-fi-hexa-tiles-editor>` | HA Lovelace | Hexa tiles editor |
| `<sf-editor-input>` | Card editors | Reusable text/number field |
| `<sf-editor-dropdown>` | Card editors | Reusable filterable dropdown |
| `<sf-editor-dropdown-entity>` | Card editors | HA entity picker |
| `<sf-editor-dropdown-icon>` | Card editors | Icon picker |
| `<sf-editor-multi-entity>` | Card editors | Multi-entity chips selector |
| `<sf-editor-slider>` | Card editors | Numeric slider |
| `<sf-editor-chips>` | Card editors | Chip-list input |
| `<sf-editor-color-picker>` | Card editors | Color picker |
| `<sf-editor-accordion>` | Card editors | Collapsible section |

 ### External Invocations

| Type | Invoked | Defined in |
|---|---|---|
| HA API | `hass.states` — read entity states for dropdowns | HA runtime (not our code) |
| HA API | `hass.floors` — read floors for lights editor | Spec 02 § types/ha.ts |
| HA API | `hass.areas` — read areas for lights editor | Spec 02 § types/ha.ts |
| HA API | `hass.devices` — read devices for vehicles/plugs editors | Spec 02 § types/ha.ts |
| HA event | `config-changed` CustomEvent — notify Lovelace of config update | HA Lovelace contract |

---

## Base Editor Enrichment

### `src/utils/base-editor.ts` — changes

Add the following methods to `SciFiBaseEditor`:

```ts
/** Deep-clones the current config to ensure immutability during updates. */
protected _getNewConfig<T extends SciFiBaseConfig>(): T {
  return this.config ? (JSON.parse(JSON.stringify(this.config)) as T) : ({} as T);
}

/**
 * Creates a new merged config and dispatches 'config-changed' to Lovelace.
 * @param newConfig — the complete new config object (NOT a partial patch)
 */
protected _dispatchChange(newConfig: SciFiBaseConfig): void {
  this.config = newConfig; // CRITICAL: Updates local reference immediately to avoid stale updates/race conditions
  this.dispatchEvent(new CustomEvent<{ config: SciFiBaseConfig }>('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config: newConfig },
  }));
}
```

```ts
/** Label dictionary — port from main branch base_editor.js getLabel() */
getLabel(key: string): string {
  const labels: Record<string, string> = {
    'section-title-header': msg('Header'),
    'section-title-settings': msg('Settings'),
    'section-title-vehicle': msg('Vehicle'),
    'section-title-state': msg('State'),
    'section-title-mode': msg('Mode'),
    'section-title-weather': msg('Weather'),
    'section-title-chart': msg('Chart'),
    'section-title-alert': msg('Alert'),
    'section-title-tile': msg('Tile'),
    'section-title-technical': msg('Technical'),
    'section-title-home-selection': msg('Display selection'),
    'section-title-appearance': msg('Appearance'),
    'section-title-entity': msg('Entity'),
    'section-title-entity-light-custom': msg('Light entities customization'),
    'section-title-sensor': msg('Sensors'),
    'section-title-storage': msg('Storage'),
    'section-title-plug': msg('Plugs'),
    'section-title-energy': msg('Energy'),
    'section-title-other': msg('Others'),
    'section-title-monitoring': msg('Monitoring'),
    'section-title-config': msg('Configuration'),
    'section-title-device': msg('Device'),
    'section-title-visibility': msg('Visibility'),
    'section-title-default-actions': msg('Default actions display'),
    'section-title-custom-actions': msg('Custom actions'),
    'section-title-shortcuts': msg('Shortcuts'),
    'section-title-segments': msg('Segments'),
    'text-optional': msg('(optional)'),
    'text-required': msg('(required)'),
    'text-switch-climate-global-turn-on_off': msg('Display global turn on/off button ?'),
    'text-switch-hexa-add-weather-tile': msg('Add weather tile ?'),
    'text-switch-hexa-standalone': msg('Standalone entity?'),
    'text-switch-action-start': msg('Start?'),
    'text-switch-action-pause': msg('Pause?'),
    'text-switch-action-stop': msg('Stop?'),
    'text-switch-action-return-to-base': msg('Return to base?'),
    'text-switch-action-set-fan-speed': msg('Set fan speed?'),
    'text-child-lock': msg('Child lock?'),
    'text-power-outage-memory': msg('Power outage memory'),
    'text-other-sensor': msg('Others sensors'),
    'edit-section-title': msg('Edit'),
    'input-message-header-section-winter': msg('Winter period message'),
    'input-icon-header-section-winter': msg('Winter period icon'),
    'input-message-header-section-summer': msg('Summer period message'),
    'input-icon-header-section-summer': msg('Summer period icon'),
    'input-entities-to-exclude': msg('Entities to exclude'),
    'input-icon': msg('Icon'),
    'input-weather-alert-entity-id': msg('Weather alert entity id'),
    'input-icon-auto': msg('Icon auto'),
    'input-icon-off': msg('Icon off'),
    'input-icon-heat': msg('Icon heat'),
    'input-icon-frost_protection': msg('Icon frost protection'),
    'input-icon-eco': msg('Icon eco'),
    'input-icon-comfort': msg('Icon comfort'),
    'input-icon-comfort-1': msg('Icon comfort-1'),
    'input-icon-comfort-2': msg('Icon comfort-2'),
    'input-icon-boost': msg('Icon boost'),
    'input-color-auto': msg('Auto icon color'),
    'input-color-off': msg('Off icon color'),
    'input-color-heat': msg('Heat icon color'),
    'input-color-frost_protection': msg('Frost protection icon color'),
    'input-color-eco': msg('Eco icon color'),
    'input-color-comfort': msg('Comfort icon color'),
    'input-color-comfort-1': msg('Comfort-1 icon color'),
    'input-color-comfort-2': msg('Comfort-2 icon color'),
    'input-color-boost': msg('Boost icon color'),
    'input-message-text': msg('Message'),
    'input-weather-entity': msg('Weather entity'),
    'input-link': msg('Link'),
    'input-name': msg('Name'),
    'input-active-icon': msg('Active icon'),
    'input-inactive-icon': msg('Inactive icon'),
    'input-states-on': msg('States on'),
    'input-state-error': msg('Error state'),
    'input-entity-id': msg('Entity id'),
    'input-entity-kind': msg('Entity kind'),
    'input-floor-id': msg('First floor to render'),
```

> _(block continued)_

```ts
    'input-area-id': msg('First area to render'),
    'input-location': msg('Location'),
    'input-location-last-activity': msg('Location last activity'),
    'input-mileage': msg('Mileage'),
    'input-lock-status': msg('Lock status'),
    'input-fuel-autonomy': msg('Fuel autonomy'),
    'input-fuel-quantity': msg('Fuel quantity'),
    'input-battery-autonomy': msg('Battery autonomy'),
    'input-battery-level': msg('Battery level'),
    'input-charging-state': msg('Charging'),
    'input-plug-state': msg('Plug state'),
    'input-remainting-charging-time': msg('Remaining charging time'),
    'input-storage-counter': msg('Storage counter'),
    'input-threshold': msg('Threshold'),
    'input-stove-combustion-chamber': msg('Stove combustion chamber'),
    'input-room-temperature': msg('Room temperature'),
    'input-stove-pressure': msg('Stove pressure'),
    'input-stove-fan-speed': msg('Stove fans speed'),
    'input-stove-power-rendered': msg('Stove power rendered'),
    'input-stove-power-consume': msg('Stove power consumed'),
    'input-stove-status': msg('Stove status'),
    'input-stove-time-to-service': msg('Stove time to service'),
    'input-pellet-quantity': msg('Stove pellet quantity'),
    'input-pellet-quantity-threshold': msg('Pellet quantity threshold'),
    'input-daily-forecast-number': msg('Forecast number of days'),
    'input-chart-first-focus-data': msg('First data targeted on the chart'),
    'input-alert-green': msg('Green state'),
    'input-alert-yellow': msg('Yellow state'),
    'input-alert-orange': msg('Orange state'),
    'input-alert-red': msg('Red state'),
    'input-device': msg('Device'),
    'input-energy': msg('Energy'),
    'input-power': msg('Power'),
    'input-map': msg('Map'),
    'input-service': msg('Service to call'),
    'input-segment': msg('Segment'),
    'input-current-clean-area': msg('Current clean area'),
    'input-current-clean-duration': msg('Current clean duration'),
    'input-last-clean-area': msg('Last clean area'),
    'input-last-clean-duration': msg('Last clean duration'),
    'input-battery': msg('Battery'),
    'input-mop-intensite': msg('Mop intensite'),
    'input-command': msg('Command'),
    // ── Action labels ─────────────────────────────────────────────────────
    'action-add-tile': msg('Add tile'),
    'action-add-custom-entity': msg('Add custom entity'),
    'action-add-vehicle': msg('Add vehicle'),
    'action-add-device': msg('Add device'),
    'action-add-segment': msg('Add segment'),
    'action-add-shortcut': msg('Add shortcut'),
    'action-delete-shortcut': msg('Delete shortcut'),
    'action-edit-shortcut': msg('Edit shortcut'),
    // ── Entity labels ─────────────────────────────────────────────────────
    'input-switch-entity': msg('Switch entity'),
    'input-vacuum-entity': msg('Vacuum entity'),
    // ── Status text ───────────────────────────────────────────────────────
    'text-no-vacuum': msg('No vacuum configured.'),
  };
  return key in labels ? labels[key] : '';
}
```

> **Note:** `msg` is imported from `@lit/localize`. All labels go through the localization system so that `getLabel()` strings are translated when the locale changes.

---

## Editor Input Components

### Shared Event Contract

All editor input components dispatch a single event type:

```ts
interface InputUpdateDetail {
  id: string;    // element-id attribute value
  kind: string;  // semantic category (e.g. 'header', 'weather_entity')
  value: string; // new value
  type?: 'add' | 'remove'; // only for multi-entity and chips
}
```

Event name: **`input-update`**
Bubbles: `true`, Composed: `true`

This is the single unified event for all inputs, text fields, sliders, multi-entity additions/removals, and dropdown item selections. Editors do not need to listen to multiple event names; they only bind `@input-update="${this._update}"`.

### `sf-editor-input` (`<sf-editor-input>`)

**Tag:** `sf-editor-input`
**Custom element registration:** `@customElement('sf-editor-input')`

**Properties:**
| Property | Type | Attribute | Default | Description |
|---|---|---|---|---|
| `label` | `string` | `label` | `''` | Floating label text |
| `icon` | `string` | `icon` | `''` | Left icon (`mdi:` or `sf:` prefix) |
| `value` | `string` | `value` | `''` | Current input value |
| `elementId` | `string` | `element-id` | `''` | ID forwarded in event detail |
| `kind` | `string` | `kind` | `''` | Kind forwarded in event detail |
| `disabled` | `boolean` | `disabled` | `false` | Disables input |
| `type` | `string` | `type` | `'text'` | HTML input type (`text`, `number`) |

**Render:**
```html
<div class="container">
  <div class="icon"><!-- sf-icon if icon set --></div>
  <div class="input-group">
    <label>${label}</label>
    <input type="${type}" value="${value}" ?disabled="${disabled}"
           @input="${_onInput}" @change="${_onChange}" />
  </div>
</div>
```

**Events dispatched:**
- `input-update` on every keystroke: `{ id: elementId, kind, value: input.value }`

**Styles:** Floating label animation (label moves up + scales 0.75 when input has value or focus). Imports `sciFiEditorCommonStyles`.

---

### `sf-editor-dropdown` (`<sf-editor-dropdown>`)

**Tag:** `sf-editor-dropdown`
**Extends:** `SfEditorInput`

**Additional Properties:**
| Property | Type | Attribute | Default | Description |
|---|---|---|---|---|
| `items` | `any[]` | — | `[]` | Options list (handles both string[] and HassEntity[] securely to prevent TS inheritance type conflicts, property binding only `.items=`) |
| `disabledFilter` | `boolean` | `disabled-filter` | `false` | Show all items without filtering |

**Render:** Extends parent render. Adds `<div class="dropdown-menu">` below container, shown on focus. Items rendered as `<div class="dropdown-item">` rows.

**Events dispatched:**
- `input-update` on item click: `{ id: elementId, kind, value: selected }` then closes dropdown

**Behavior:**
- On focus → show dropdown
- On blur (outside click) → close dropdown (100ms delay)
- On type → filter items by `value.toUpperCase().includes(query.toUpperCase())`. **CRITICAL**: Typing must NOT dispatch `input-update`, only selection does.

---

### `sf-editor-dropdown-entity` (`<sf-editor-dropdown-entity>`)

**Tag:** `sf-editor-dropdown-entity`
**Extends:** `SfEditorDropdown`

**Item type:** `HassEntity` (`{ entity_id: string, attributes: { friendly_name?: string, icon?: string } }`)

**Render override for each item:**
```html
<div class="dropdown-item" @click="${() => _select(item.entity_id)}">
  <sf-icon .icon="${item.attributes.icon ?? 'mdi:information-off-outline'}"></sf-icon>
  <div class="info">
    <div class="name">${item.attributes.friendly_name}</div>
    <div class="element_id">${item.entity_id}</div>
  </div>
</div>
```

**Filter override:** filters by `entity_id.toUpperCase().includes(query)`

---

### `sf-editor-dropdown-icon` (`<sf-editor-dropdown-icon>`)

**Tag:** `sf-editor-dropdown-icon`
**Extends:** `SfEditorDropdown`

**Items source:** `Object.keys(CUSTOM_ICONS).map(k => 'sf:' + k)` merged with a curated set of common MDI icon names. Loaded once at module level (not per-instance). Max 200 icons shown in dropdown (the 200 limit must be applied *after* matching search query filtering, not before, to allow users to search the full set of icons).

**Render override for each item:**
```html
<div class="dropdown-item" @click="${() => _select(iconName)}">
  <sf-icon .icon="${iconName}"></sf-icon>
  <div class="name">${iconName}</div>
</div>
```

**Additional property:**
| Property | Type | Attribute | Default | Description |
|---|---|---|---|---|
| `icon` | `string` | `icon` | `''` | Current icon displayed in input field |

---

### `sf-editor-multi-entity` (`<sf-editor-multi-entity>`)

**Tag:** `sf-editor-multi-entity`
**Extends:** `SfEditorDropdownEntity`

**Additional Property:**
| Property | Type | Attribute | Default | Description |
|---|---|---|---|---|
| `values` | `string[]` | — | `[]` | Currently selected entity IDs (property binding `.values=`) |

**Render override:** Shows `<ul class="chips">` with selected entities above the input. Each chip has an `X` delete button.

**Events dispatched:**
- `input-update` on chip add: `{ id: elementId, kind, value: entityId, type: 'add' }`
- `input-update` on chip remove (X clicked): `{ id: elementId, kind, value: index, type: 'remove' }`

**Filter override:** Excludes already-selected entity IDs from dropdown items.

---

### `sf-editor-slider` (`<sf-editor-slider>`)

**Tag:** `sf-editor-slider`
**Extends:** `SfEditorInput`

**Additional Properties:**
| Property | Type | Attribute | Default | Description |
|---|---|---|---|---|
| `min` | `number` | `min` | `0` | Slider minimum |
| `max` | `number` | `max` | `100` | Slider maximum |
| `step` | `number` | `step` | `1` | Slider step |

**Render override:** Replaces `<input type="text">` with `<input type="range">` + a `<span class="value">` showing current value.

---

### `sf-editor-chips` (`<sf-editor-chips>`)

**Tag:** `sf-editor-chips`
**Extends:** `SfEditorInput`

**Property:**
| Property | Type | Attribute | Default |
|---|---|---|---|
| `values` | `string[]` | — | `[]` |

**Render override:** Shows chips above input. Pressing Enter adds a chip. X button removes.
**Events:** `input-update` with `type: 'add'` or `type: 'remove'`.

---

### `sf-editor-color-picker` (`<sf-editor-color-picker>`)

**Tag:** `sf-editor-color-picker`
**Extends:** `SfEditorInput`

**Render override:** Replaces `<input type="text">` with `<input type="color">`. Label always floated up. Icon shows a color swatch using the current value as CSS `--input-icon-color`.

---

### `sf-editor-accordion` (`<sf-editor-accordion>`)

**Tag:** `sf-editor-accordion`
**Does NOT extend** `SfEditorInput`. Standalone `LitElement`.

**Properties:**
| Property | Type | Attribute | Default |
|---|---|---|---|
| `title` | `string` | `title` | `''` |
| `icon` | `string` | `icon` | `''` |
| `open` | `boolean` | `open` | `false` |
| `elementId` | `string` | `element-id` | `''` |

**Render:**
```html
<div class="accordion">
  <div class="tab-header" @click="${_toggle}">
    <sf-icon .icon="${icon}"></sf-icon>
    <span>${title}</span>
    <span class="chevron">${open ? '▲' : '▼'}</span>
  </div>
  <div class="tab-content" ?hidden="${!open}">
    <slot></slot>
  </div>
</div>
```

**Events dispatched:**
- `input-update` on delete button click (if delete-able): `{ id: elementId, type: 'remove' }`

---

## Shared Editor Styles — `src/styles/editor-common.ts`

```ts
export const sciFiEditorCommonStyles = css`
  :host { width: 100%; height: 100%; }
  .card { position: relative; padding: 10px; justify-content: center;
          display: flex; width: 100%; height: fit-content; }
  .container { display: flex; flex-direction: column; flex: 1; row-gap: 10px; }
  section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
  section h1 {
    font-size: var(--font-size-normal);
    border-bottom: var(--border-width) solid var(--secondary-light-color);
    margin: 10px 0 5px 0; padding-bottom: 5px;
    text-transform: capitalize; font-weight: 400;
    color: var(--secondary-light-color);
    display: flex; flex-direction: row; align-items: center;
  }
  section h1 sf-icon { --icon-width: var(--icon-size-small); --icon-height: var(--icon-size-small); margin-right: 10px; }
  .container.false { display: none; }
  .editor.false { display: none; }
  .editor { display: flex; flex-direction: column; row-gap: 10px; flex: 1; min-height: 300px; }
  .editor .head { display: flex; flex-direction: row; column-gap: 10px; }
  .editor .head span { flex: 1; align-content: center; }
`;
```

---

## Card Editors

### Editor Architecture Pattern

Every editor follows this pattern:

```ts
@customElement('sci-fi-<card>-editor')
export class SciFi<Card>Editor extends SciFiBaseEditor {

  // Card-specific reactive state (loaded once from hass)
  @state() private _<entities>: HassEntity[] = [];

  // Optional: "edit mode" toggle for inline sub-editors
  @state() private _edit = false;
  @state() private _editTarget: string | null = null;

  // Load entities from hass on first set
  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._<entities>.length > 0) return;
    this._<entities> = Object.values(hass.states).filter(/* domain filter */);
  }

  // Sealed render → calls renderEditor()
  protected override renderEditor(): TemplateResult {
    if (!this.config) return html`<div>No config</div>`;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this._renderSection1()}
          ${this._renderSection2()}
        </div>
        <div class="editor ${this._edit}">
          ${this._renderEditView()}
        </div>
      </div>
    `;
  }

  private _update(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<Sci-Fi<Card>Config>();
    // switch on e.detail.id or e.detail.kind
    // CRITICAL: Always spread/initialize nested objects to prevent TypeError crashes when undefined:
    // e.g. newConfig.header = { ...(newConfig.header || {}), [e.detail.id]: e.detail.value };
    this._dispatchChange(newConfig);
  }
}
```

> **Key difference from `main`:** `_update` uses `this._dispatchChange(newConfig)` (the new method on `SciFiBaseEditor`) instead of `this.__dispatchChange(e, newConfig)`.

---

### `sci-fi-weather-editor`

**File:** `src/cards/weather/sci-fi-weather-editor.ts`
**Tag:** `sci-fi-weather-editor`

**Sections:**
1. **Weather** (required) — `<sf-editor-dropdown-entity>` for `weather_entity`, filters `hass.states` by `entity_id.startsWith('weather.')`
2. **Technical** (optional) — `<sf-editor-slider min="1" max="15">` for `weather_daily_forecast_limit`
3. **Chart** (optional) — `<sf-editor-dropdown>` for `chart_first_kind_to_render` with items `['Temperature', 'Precipitation', 'Wind Speed']`, mapping to values `['temperature', 'precipitation', 'wind']`
4. **Alert** (optional) — 5 `<sf-editor-input>` fields: `entity_id`, `state_green`, `state_yellow`, `state_orange`, `state_red`

**Mapping Constant:**
```ts
const CHART_KINDS: Record<string, 'temperature' | 'precipitation' | 'wind'> = {
  'Temperature': 'temperature',
  'Precipitation': 'precipitation',
  'Wind Speed': 'wind',
};
```

**`_update` logic:**
```ts
switch (e.detail.kind) {
  case 'alert':
    newConfig.alert = { ...newConfig.alert, [e.detail.id]: e.detail.value };
    break;
  case 'chart':
    newConfig.chart_first_kind_to_render = CHART_KINDS[e.detail.value];
    break;
  default:
    (newConfig as Record<string, unknown>)[e.detail.id] = e.detail.value;
}
```

---

### `sci-fi-climates-editor`

**File:** `src/cards/climates/sci-fi-climates-editor.ts`
**Tag:** `sci-fi-climates-editor`
**Has edit mode:** Yes (icon + color picker for each state/mode)

**State loaded from hass:** `_climates: HassEntity[]` — `Object.values(hass.states).filter(e => e.entity_id.startsWith('climate.'))`

**Main view sections:**
1. **Header** — `<sf-toggle-switch>` for `header.display`; conditional `<sf-editor-input>` for winter/summer messages; `<sf-editor-dropdown-icon>` for winter/summer icons
2. **Settings** — `<sf-editor-multi-entity>` for `entities_to_exclude` (items = `_climates`)
3. **State** (accordion, required) — for each of `heat`, `off`, `auto`: row with disabled `<sf-editor-input>` showing current icon + `<button edit>` → enters edit mode
4. **Mode** (accordion, required) — for each of `frost_protection`, `eco`, `comfort`, `comfort-1`, `comfort-2`, `boost`: same pattern

**Edit view:**
```html
<div class="head">
  <button @click="${_endEdit}">← back</button>
  <span>${getLabel('edit-section-<kind>-<state>-title')}</span>
</div>
<sf-editor-dropdown-icon element-id="${kind}_icons" kind="${state}" ... />
<sf-editor-color-picker element-id="${kind}_colors" kind="${state}" ... />
```

**Toggle handler:** `sf-toggle-change` event from `sf-toggle-switch` → `newConfig.header.display = e.detail.checked`

---

### `sci-fi-lights-editor`

**File:** `src/cards/lights/sci-fi-lights-editor.ts`
**Tag:** `sci-fi-lights-editor`
**Has edit mode:** Yes (custom entity detail)

**State loaded from hass:**
- `_floors: HassFloor[]` — via `getFloors(hass)` from `src/selectors/house.ts`
- `_lightsEntities: HassEntityEntry[]` — via `getEntitiesByAreaAndDomain` across all areas, domain `'light'`
- Auto-setup default config: if `config.first_floor_to_render` is unset, pick first floor with lights and dispatch `config-changed`. **CRITICAL GUARD**: To prevent infinite render loops, this check must verify the new value actually differs from current config, and dispatch must happen asynchronously (e.g. `await this.updateComplete` or inside `firstUpdated`).

**Main view sections:**
1. **Header** — `<sf-editor-input>` for `header_message`
2. **Appearance** — two `<sf-editor-dropdown-icon>`: `default_icon_on`, `default_icon_off`
3. **Display selection** — two `<sf-editor-dropdown-entity>`: floors dropdown + areas dropdown (areas filtered by selected floor + must have lights). Selecting a floor resets `first_area_to_render` to `null`
4. **Entities to exclude** — `<sf-editor-multi-entity>` for `ignored_entities`
5. **Light entities customization** —
   - List of `custom_entities` (from `custom_entities` record): row per entry with `entity_id` and action buttons: Edit (`_editTarget = entity_id`, `_edit = true`) and Delete (removes `entity_id` key from `custom_entities`).
   - `<sf-editor-dropdown-entity>` for picking a light entity to customize, with `+ Add` button. Selecting an entity and clicking Add adds the key to `custom_entities` with `{ name: '', icon_on: '', icon_off: '' }`, sets `_editTarget = entity_id`, `_edit = true`.

**Edit view (custom entity):**
```html
<div class="head">
  <button @click="${_endEdit}">← back</button>
  <span>Edit ${this._editTarget}</span>
</div>
<sf-editor-input label="Name" kind="name" element-id="name" .value="${this.config.custom_entities?.[this._editTarget]?.name ?? ''}" ... />
<sf-editor-dropdown-icon label="Active icon" kind="icon_on" element-id="icon_on" .value="${this.config.custom_entities?.[this._editTarget]?.icon_on ?? ''}" ... />
<sf-editor-dropdown-icon label="Inactive icon" kind="icon_off" element-id="icon_off" .value="${this.config.custom_entities?.[this._editTarget]?.icon_off ?? ''}" ... />
```

**Area items computation:** When `first_floor_to_render` changes, recompute areas via `getAreasByFloor(hass, floorId)` filtered to only areas containing at least one light entity.

---

### `sci-fi-plugs-editor`

**File:** `src/cards/plugs/sci-fi-plugs-editor.ts`
**Tag:** `sci-fi-plugs-editor`

**State loaded:** `_devices` from `Object.values(hass.devices).filter(d => d.entry_type !== 'service')`

> **Note:** The plugs editor in `main` was complex (per-device sensor configuration with a sub-editor). Port the full behavior including the inline device edit panel.

**Main view sections:**
1. List of configured devices (accordion per device using `<sf-editor-accordion>`).
2. Per device:
   - `<sf-editor-dropdown>` for `device_id` (items = `_devices` names, mapping to `d.id`)
   - `<sf-editor-dropdown-entity>` for the switch `entity_id` (filtered by `entity_id.startsWith('switch.')`)
   - `<sf-editor-input>` for device custom name (`name`)
   - `<sf-editor-dropdown-icon>` for `active_icon` and `inactive_icon`
   - **Sensor sub-configuration**:
     - `<sf-editor-dropdown-entity>` for the **Power Sensor** entity (`power_entity`, filtered by `sensor` domain)
     - `<sf-editor-dropdown-entity>` for the **Energy Sensor** entity (`energy_entity`, filtered by `sensor` domain)
3. Add device button (`+ Add Device`) and delete button inside the device accordion.

**Sensor Mapping Logic:**
The `sensors` field in `SciFiPlugDevice` is a `Record<string, SciFiPlugSensorEntry>` keyed by sensor `entity_id`. When updating the sensors:
- **Power Sensor selection** (dropdown dispatches `e.detail.value`):
  1. Remove any existing key in `sensors` that has `power: true`
  2. If a new entity ID is selected, add an entry to `sensors`: `[e.detail.value]: { show: true, name: 'Power', power: true }`
- **Energy Sensor selection**:
  1. Remove any existing key in `sensors` that has `power: false` (or undefined)
  2. If a new entity ID is selected, add an entry to `sensors`: `[e.detail.value]: { show: true, name: 'Energy', power: false }`
- If no keys remain, `sensors` is set to `undefined` or an empty record.

---

### `sci-fi-stove-editor`

**File:** `src/cards/stove/sci-fi-stove-editor.ts`
**Tag:** `sci-fi-stove-editor`

**State loaded:** `_climates: HassEntity[]` — filtered by `entity_id.startsWith('climate.')`

**Sections:**
1. **Config** — inputs for all sensor entity IDs (`sensor_actual_power`, `sensor_combustion_chamber_temperature`, etc.)
2. **Technical** — sliders for `pellet_quantity_threshold` (0–1, step 0.1), `storage_counter_threshold` (0–1, step 0.1)

---

### `sci-fi-vacuum-editor`

**File:** `src/cards/vacuum/sci-fi-vacuum-editor.ts`
**Tag:** `sci-fi-vacuum-editor`
**Most complex editor — has tab switching per vacuum + shortcut edit mode**

**State:**
- `_vacuumEntities: HassEntity[]` — `Object.values(hass.states).filter(e => e.entity_id.startsWith('vacuum.'))`
- `_activeVacuum: number = 0` — index of active tab
- `_edit: boolean = false`
- `_shortcutId: number | null = null`

**Main view sections per active vacuum:**
1. **Entity** — `<sf-editor-dropdown-entity>` for `vacuums[N].entity`
2. **Actions** (accordion) — toggles (using `<sf-toggle-switch>`) for start, pause, stop, return_to_base, set_fan_speed
3. **Sensors** (accordion) — `<sf-editor-input>` for each sensor in `{ battery, current_clean_area, current_clean_duration, map, mop_intensite }`
4. **Shortcuts** (accordion) —
   - `<sf-editor-input>` for `service` (the Lovelace command service, e.g. `'vacuum.send_command'`)
   - `<sf-editor-input>` for `command` (the segment cleaning command parameter, e.g. `'app_segment_clean'`)
   - List of shortcuts (from `shortcuts.description` array): row showing index, name, icon + edit and delete buttons
   - `+ Add Shortcut` button

**Shortcut edit view:**
- Name input (`<sf-editor-input>`), icon dropdown (`<sf-editor-dropdown-icon>`)
- Segments list: list of segment number inputs (`<sf-editor-input type="number">`) with delete + `+ Add Segment` buttons
- Button to save/exit edit mode.

---

### `sci-fi-vehicles-editor`

**File:** `src/cards/vehicles/sci-fi-vehicles-editor.ts`
**Tag:** `sci-fi-vehicles-editor`

**State loaded:** `_vehiclesList` — `Object.values(hass.devices).filter(d => d.manufacturer === 'Renault')` mapped to `{ entity_id: d.id, attributes: { friendly_name: d.name_by_user, icon: 'sf:landspeeder' } }`

**Sections:**
- List of vehicles (accordion per vehicle)
- Per vehicle: device dropdown + sensor inputs (location, mileage, lock_status, fuel_autonomy, fuel_quantity, battery_autonomy, battery_level, charging, plug_state, charging_remaining_time)
- Add vehicle / delete vehicle buttons

---

### `sci-fi-hexa-tiles-editor`

**File:** `src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.ts`
**Tag:** `sci-fi-hexa-tiles-editor`
**2nd most complex — handles weather tile + N tiles with visibility per person**

**State loaded:**
- `_entityKind: Record<string, HassEntity[]>` — all states grouped by domain prefix
- `_people: HassEntity[]` — `hass.states` filtered by `entity_id.startsWith('person.')`

**Main view:**
1. **Weather tile** — `<sf-toggle-switch .checked="${this.config.weather?.activate}">` for `weather.activate` + conditional `<sf-editor-dropdown-entity>` for `weather.weather_entity`
2. **Tiles** (accordion list using `<sf-editor-accordion>` per tile, with `+ Add Tile` and `Delete Tile` buttons) — for each tile:
   - **Standalone toggle**: `<sf-toggle-switch .checked="${tile.standalone}">`
   - **Entity settings**:
     - If `tile.standalone === true`: `<sf-editor-dropdown-entity>` for picking the single `entity`
     - If `tile.standalone !== true`: `<sf-editor-dropdown>` for `entity_kind` (items = `['light', 'climate', 'vacuum', 'plug', 'switch']`) + `<sf-editor-multi-entity>` for `entities_to_exclude` (excluding selected entities from kind domain)
   - **Appearance**: `<sf-editor-input>` for custom label `name`, `<sf-editor-dropdown-icon>` for `active_icon` and `inactive_icon`
   - **Technical**: `<sf-editor-chips>` for `state_on` (the active state strings, e.g. `'on'`), `<sf-editor-input>` for `state_error` (the error state value), `<sf-editor-input>` for `link` (the click navigation target, e.g. `'lights'`)
   - **Visibility**: row of custom toggle buttons (one per person in `_people`).
     - Button renders the person's friendly_name or profile picture.
     - Active state: button has `active` class if person's `entity_id` is present in `tile.visibility` array.
     - On click: toggles the presence of the person's `entity_id` in the `tile.visibility` array, reassigns `tile.visibility`, and dispatches the updated config.

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Mutating `this.config` directly | `this.config.weather_entity = 'weather.home'` | Call `this._getNewConfig()` → modify clone → call `this._dispatchChange(clone)` |
| 2 | Using `_dispatchConfigChanged(patch)` (base class) in editors | Partial patch loses other fields | Always use `_dispatchChange(completeNewConfig)` with the full config object |
| 3 | Listening to `toggle-change` event (main branch name) | `@toggle-change="${_onToggle}"` | Listen to `sf-toggle-change` and read `e.detail.checked` (not `e.detail.value`) |
| 4 | Attribute binding for dynamic properties | `value="${expression}"` on `sf-editor-*` | Use property binding `.value="${expression}"` for all dynamic values (L016) |
| 5 | Doing DOM manipulation in constructor | `this.style.setProperty(...)` in `constructor()` | Move to `firstUpdated()` or `willUpdate()` (L033) |
| 6 | Registering editor element from inside the card file | `customElements.define(TAG+'-editor', EditorClass)` in card file | Import the editor file in `sci-fi.ts`; the `@customElement` decorator handles registration |
| 7 | Accessing `hass.entities` to build floor/area lists in editors | Custom House/Floor class usage | Use `getFloors()`, `getAreasByFloor()`, `getEntitiesByAreaAndDomain()` from `src/selectors/` |
| 8 | Dispatching `config-changed` without `composed: true` | Event doesn't reach Lovelace shadow boundary | Always `composed: true, bubbles: true` on `config-changed` |
| 9 | Adding i18n labels as raw strings without `msg()` | `'Header'` hardcoded | Wrap ALL labels in `msg('Header')` — `getLabel()` already does this |
| 10 | Building icon list with `getAllIconNames()` (main branch function) | Missing function in TS | Use `Object.keys(CUSTOM_ICONS)` with `sf:` prefix + curated MDI list |
| 11 | Calling `msg()` directly in editor templates for UI labels | Bypasses `getLabel()`, preventing locale updates; French strings as `msg('Ajouter une tuile')` appear untranslatable in other locales | Add the key to `getLabel()` dictionary in `base-editor.ts`, call `this.getLabel('action-add-tile')` in the template; add corresponding entry to `fr.ts` and `xliff/fr.xlf` |

---

## Test Case Specifications

> **Note:** Editors are pure UI configuration components with no business logic. Unit tests cover the config mutation contracts. No tests for visual rendering details.

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-1001 | Unit | `getLabel()` returns correct string for known key | `getLabel('section-title-header')` | Returns non-empty string |
| TC-1002 | Unit | `getLabel()` returns empty string for unknown key | `getLabel('nonexistent-key-xyz')` | Returns `''` |
| TC-1003 | Unit | `_getNewConfig()` returns a deep clone | Nested config object | Clone !== original; mutating clone doesn't affect original |
| TC-1004 | Unit | `_dispatchChange()` fires `config-changed` with correct payload | Call with new config object | Event dispatched, `event.detail.config` equals new config |
| TC-1005 | Unit | `sf-editor-input` dispatches `input-update` on user input | Simulate `@input` event | `event.detail.id` equals `element-id` attribute value |
| TC-1006 | Unit | `sf-editor-dropdown` filters items on input | Type `'weat'` in dropdown | Items filtered to entries containing `'WEAT'` |
| TC-1007 | Unit | `sf-editor-multi-entity` dispatches `type: 'remove'` on chip delete | Click chip X button | `input-update` with `type: 'remove'` and correct index |
| TC-1008 | Unit | `sf-editor-multi-entity` dispatches `type: 'add'` on entity select | Select item from dropdown | `input-update` with `type: 'add'` and entity_id |
| TC-1009 | Unit | `sf-editor-slider` dispatches correct value | Move slider to 7 | `event.detail.value === '7'` |
| TC-1010 | Unit | `sf-editor-accordion` toggles open state on click | Click header | `open` property flips |
| TC-1011 | Unit | weather editor renders all 4 sections | Valid weather config | All 4 section `h1` elements present in shadow DOM |
| TC-1012 | Unit | weather editor `_update` updates `weather_entity` | `input-update` with `kind='weather_entity'` | `config-changed` fired with new `weather_entity` |
| TC-1013 | Unit | climates editor toggle handler reads `sf-toggle-change.detail.checked` | `sf-toggle-change` event with `checked: false` | `config-changed` fired with `header.display = false` |
| TC-1014 | Unit | lights editor resets `first_area_to_render` when floor changes | `input-update` with `id='first_floor_to_render'` | `config-changed` fired with `first_area_to_render = null` |
| TC-1015 | Unit | `_getNewConfig()` deep clone preserves nested arrays | Config with `entities_to_exclude: ['a', 'b']` | Clone has equal but distinct array reference |
| IT-1001 | Integration | weather editor renders in mock HA panel | Mount editor with `setConfig()` + `hass` | Editor element visible, no console errors |
| IT-1002 | Integration | config-changed propagates up to Lovelace mock | User changes `weather_entity` | Parent listener receives `event.detail.config.weather_entity` |
| IT-1003 | Integration | `sf-editor-dropdown-entity` items filtered from hass.states | Hass with 5 weather entities | Dropdown shows 5 entities matching filter |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| `hass` not yet set when editor renders | `!this.hass \|\| !this.config` check at top of `renderEditor()` | Return `html\`<div>Loading...</div>\`` | Nothing rendered — no crash |
| `config` missing required field | `_getNewConfig()` returns partial clone | Editor renders with empty/default value in field | Field shows empty; user must fill |
| Floor not found in `hass.floors` | `getFloors(hass)` returns empty array | Floors dropdown shows empty | User must configure floors in HA first |
| `hass.devices` unavailable | `!hass.devices` guard | `_vehiclesList` stays empty | Vehicle dropdown empty; no crash |
| Icon list load error | `CUSTOM_ICONS` import fails | Catch at module level | Dropdown falls back to empty list |
| `config-changed` event not received by Lovelace | `composed: true` missing | Verified by TC-1004 | Never happens if spec followed |


## Adversarial Fixes: Migration Race Condition
The editor MUST NOT render its interactive elements until it verifies `config.version` matches the current schema version. If it does not match, it must display a 'Migration in progress...' state or wait for `06_entry_migration` to complete to prevent saving an outdated schema back to HA.
