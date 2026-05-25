# Spec 15 — Vacuum Card Design Update

> Document Type: Implementation
> Covers: Full reconstruction of `sci-fi-vacuum` card to match `main` branch layout — animated sub-header icon traversing the card, header (name + fan speed + battery + mop_intensite), info sensors (current_clean_area + current_clean_duration), full-width map, actions bar (default buttons + shortcuts), and bottom device navigation.
> Depends on: [Spec 05](./05_cards.md#sci-fi-vacuum), [Spec 03](./03_base_classes.md#L1)
> ADR-005: Zero breaking YAML changes — all config fields in `SciFiVacuumEntry` and `SciFiVacuumConfig` frozen; `entity` (not `entity_id`), `mop_intensite` (FR spelling) preserved.

---

## Blueprint Coverage

| Feature ID | Description | Spec file |
|---|---|---|
| F-VAC-D01 | Header: vacuum name + fan speed (clickable → cycles fan speed) + mop_intensite (conditional) + battery (conditional, with warning/critical colors) | ✅ This spec § Header |
| F-VAC-D02 | Sub-header: animated icon traversing card (CLEAN/RETURNING=moveAcross, DOCKED=rotate 90°, IDLE/ALERT=centered) — icon 40px, sub-header height 40px | ✅ This spec § Sub-header |
| F-VAC-D03 | Info sensors: `current_clean_area` + `current_clean_duration` — column cards with icon + value + unit + name, centered, duration rounded to integer minutes | ✅ This spec § Info sensors |
| F-VAC-D04 | Map: full-width `<img>` with border/radius; fallback text `msg('No map defined')` — fills all remaining space between info and actions via `flex: 1` | ✅ This spec § Map |
| F-VAC-D05 | Actions: `.default` row (sf-button for start/pause/stop/return_to_base only — **set_fan_speed excluded**) + `.shortcuts` row — pinned to bottom | ✅ This spec § Actions |
| F-VAC-D06 | Device navigation: bottom bar with chevron-left/right + dot indicators (hidden if single vacuum) | ✅ This spec § Devices |
| F-VAC-D07 | Toast feedback on action success/failure via `<sf-toast>` | ✅ This spec § Toast |
| F-VAC-D08 | Extract CSS into `styles.ts` (stove/vehicle/plugs pattern) | ✅ This spec § styles.ts |
| F-VAC-D09 | `vacuum_const.ts` constants file (ported from main) | ✅ This spec § Constants |
| F-VAC-D10 | All existing vacuum tests remain GREEN (regression gate) | ✅ This spec § Test Selectors |

---

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `SciFiVacuumEntry` and `SciFiVacuumConfig` config fields are frozen — no new fields needed | Low | SHOW | `grep -n "SciFiVacuum" src/types/config.ts` → L184–L218 define all fields |
| 2 | Existing CSS selectors `.vacuum-tabs`, `.vacuum-tab`, `.vacuum-main`, `.ctrl-btn`, `.fan-select`, `.shortcut-btn` in existing tests MUST be **updated** — layout changes completely | Medium | SHOW | `grep -n "querySelector" tests/cards/vacuum/sci-fi-vacuum.test.ts` → all tests reference old grid selectors |
| 3 | `sf-button` component is already available — used in vehicles and plugs cards | Low | SHOW | `ls src/components/buttons/sf-button.ts` → present; `grep "sf-button" src/cards/vehicles/sci-fi-vehicles.ts` → imported |
| 4 | `sf-toast` component is already available — used in plugs card | Low | SHOW | `grep "sf-toast" src/cards/plugs/sci-fi-plugs.ts` → present |
| 5 | Fan speed in `main` is **read-only** (displayed from `entity.attributes.fan_speed`) — `set_fan_speed` action is kept as a configurable action button using `vacuum.set_fan_speed` service but no inline select | Medium | SHOW | `git show main:src/cards/vacuum/card.js` → fan speed displayed in header div, no `<select>` |
| 6 | The `@keyframes moveAcross` animation is pure CSS, portable 1:1 from `main:src/cards/vacuum/style.js` | Low | SHOW | `git show main:src/cards/vacuum/style.js` → full CSS block, no JS animation |
| 7 | `VACUUM_ICONS` contains custom icons `sci:vacuum-docked` and `sci:vacuum-sleep` — these must be preserved in `vacuum_const.ts` | Low | SHOW | `git show main:src/helpers/entities/vacuum/vacuum_const.js` → both icons present |
| 8 | Battery and mop_intensite are rendered in the **header** (not in `.info` sensors), matching `main` | Low | SHOW | `git show main:src/cards/vacuum/card.js` → `__renderBattery()` and `__renderMopIntensite()` called from `__renderHeader()` |
| 9 | Map URL is constructed with `location.protocol + '//' + location.host + entity_picture` in `main` but the TS implementation uses `attributes.entity_picture` directly — **use direct attribute** as in current TS implementation | Low | SHOW | current `sci-fi-vacuum.ts` L216: `entity_picture as string` → simpler, no protocol construction needed in TS context |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Preserve `SciFiVacuumEntry` field names (ADR-005); use `sciFiCommonStyles`; export `vacuumStyles` from `styles.ts`; use `sf-button` for all action/navigation buttons |
| **Ask first** | Adding new config fields; changing vacuum service name/params; altering `getStubConfig()` return shape |
| **Never do** | Rename config fields (`entity`, `mop_intensite`, `shortcuts`, etc.); mutate `this.config` or `this.hass`; keep the old tab/ctrl-btn/fan-select layout; use raw `<button>` for actions |

---

## Cross-Spec Contracts

### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/vacuum/styles.ts` | Lit CSS export | This spec § styles.ts | `vacuum/sci-fi-vacuum.ts` (import `vacuumStyles`) |
| `src/cards/vacuum/vacuum_const.ts` | TS constants | This spec § Constants | `vacuum/sci-fi-vacuum.ts` |
| Updated `sci-fi-vacuum` card | Web Component | This spec § Full render | Lovelace via `getConfigElement()` (Spec 05) |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | Spec 03 § base-card.ts | `src/utils/base-card.ts` |
| `SciFiVacuumConfig`, `SciFiVacuumEntry`, `SciFiVacuumSensors`, `SciFiVacuumShortcuts`, `SciFiVacuumShortcutDescription` | TS interfaces | Spec 05 § sci-fi-vacuum | `src/types/config.ts` |
| `sf-icon` | Web Component | Spec 04 § sf-icon | `src/components/sf-icon/` |
| `sf-button` | Web Component | Spec 04 § sf-button | `src/components/buttons/sf-button.ts` |
| `sf-toast` | Web Component | Spec 04 § sf-toast | `src/components/sf-toast.ts` |

### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-vacuum>` | HA Lovelace | Robot vacuum control card (unchanged tag) |

### External Invocations

| Service | Action | Params | When |
|---|---|---|---|
| `vacuum` | `start` | `{ entity_id }` | User clicks start button (if `v.start !== false`) |
| `vacuum` | `pause` | `{ entity_id }` | User clicks pause button (if `v.pause !== false`) |
| `vacuum` | `stop` | `{ entity_id }` | User clicks stop button (if `v.stop !== false`) |
| `vacuum` | `return_to_base` | `{ entity_id }` | User clicks base button (if `v.return_to_base !== false`) |
| `vacuum.send_command` (or custom) | `app_segment_clean` (or custom) | `{ command, params: [{ segments }] }` | User clicks shortcut button |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `_vacuum_selected_id` reactive state | Index into `config.vacuums[]`; prev/next arrows cycle it | This spec § Devices |
| `VACUUM_ACTIVITY_STATE` | Maps HA state string → CSS class name (CLEAN/RETURNING/IDLE/DOCKED/ALERT) | This spec § Sub-header |
| `VACUUM_ICONS` | Maps HA state string → MDI/sci icon string | This spec § Sub-header |
| `VACUUM_ACTIONS_ICONS` | Maps action key → MDI icon string for sf-button | This spec § Actions |

---

## File Tree

```
src/cards/vacuum/
├── src/cards/vacuum/sci-fi-vacuum.ts      [MODIFY] — full reconstruction: header + sub-header + info + map + actions + devices
├── src/cards/vacuum/styles.ts             [NEW]    — extracted vacuum CSS (ported from main:src/cards/vacuum/style.js)
└── src/cards/vacuum/vacuum_const.ts      [NEW]    — vacuum constants (ported from main:src/helpers/entities/vacuum/vacuum_const.js)

tests/cards/vacuum/
└── tests/cards/vacuum/sci-fi-vacuum.test.ts  [MODIFY] — rewrite to match new layout selectors; preserve static tests
```

> [!NOTE]
> No new component files needed. All layout sections are rendered inline in `sci-fi-vacuum.ts`. The editor file `sci-fi-vacuum-editor.ts` is **not modified** — its 19 tests remain GREEN untouched.

---

## Constants — vacuum_const.ts

**File:** `src/cards/vacuum/vacuum_const.ts`

```ts
// Ported from main:src/helpers/entities/vacuum/vacuum_const.js

export const VACUUM_STATE_CLEANING   = 'cleaning';
export const VACUUM_STATE_DOCKED     = 'docked';
export const VACUUM_STATE_ERROR      = 'error';
export const VACUUM_STATE_IDLE       = 'idle';
export const VACUUM_STATE_PAUSE      = 'paused';
export const VACUUM_STATE_RETURNING  = 'returning';
export const VACUUM_STATE_UNAVAILABLE = 'unavailable';
export const VACUUM_STATE_UNKNOWN    = 'unknown';

export const VACUUM_ACTIVITY_CLEAN     = 'CLEAN';
export const VACUUM_ACTIVITY_RETURNING = 'RETURNING';
export const VACUUM_ACTIVITY_IDLE      = 'IDLE';
export const VACUUM_ACTIVITY_DOCKED    = 'DOCKED';
export const VACUUM_ACTIVITY_ALERT     = 'ALERT';

export const VACUUM_ACTIVITY_STATE: Record<string, string> = {
  [VACUUM_STATE_CLEANING]:    VACUUM_ACTIVITY_CLEAN,
  [VACUUM_STATE_DOCKED]:      VACUUM_ACTIVITY_DOCKED,
  [VACUUM_STATE_ERROR]:       VACUUM_ACTIVITY_ALERT,
  [VACUUM_STATE_IDLE]:        VACUUM_ACTIVITY_IDLE,
  [VACUUM_STATE_PAUSE]:       VACUUM_ACTIVITY_IDLE,
  [VACUUM_STATE_RETURNING]:   VACUUM_ACTIVITY_RETURNING,
  [VACUUM_STATE_UNAVAILABLE]: VACUUM_ACTIVITY_ALERT,
  [VACUUM_STATE_UNKNOWN]:     VACUUM_ACTIVITY_ALERT,
};

export const VACUUM_ICONS: Record<string, string> = {
  [VACUUM_STATE_CLEANING]:    'mdi:robot-vacuum',
  [VACUUM_STATE_DOCKED]:      'sci:vacuum-docked',
  [VACUUM_STATE_ERROR]:       'mdi:robot-vacuum-alert',
  [VACUUM_STATE_IDLE]:        'sci:vacuum-sleep',
  [VACUUM_STATE_PAUSE]:       'sci:vacuum-sleep',
  [VACUUM_STATE_RETURNING]:   'mdi:robot-vacuum',
  [VACUUM_STATE_UNAVAILABLE]: 'mdi:robot-vacuum-off',
  [VACUUM_STATE_UNKNOWN]:     'mdi:robot-vacuum-off',
};

export const VACUUM_ACTION_START          = 'start';
export const VACUUM_ACTION_PAUSE          = 'pause';
export const VACUUM_ACTION_STOP           = 'stop';
export const VACUUM_ACTION_RETURN_TO_BASE = 'return_to_base';
export const VACUUM_ACTION_SET_FAN_SPEED  = 'set_fan_speed';

export const VACUUM_ACTIONS_ICONS: Record<string, string> = {
  [VACUUM_ACTION_START]:          'mdi:play-circle-outline',
  [VACUUM_ACTION_PAUSE]:          'mdi:pause-circle-outline',
  [VACUUM_ACTION_STOP]:           'mdi:stop-circle-outline',
  [VACUUM_ACTION_RETURN_TO_BASE]: 'mdi:home-import-outline',
  [VACUUM_ACTION_SET_FAN_SPEED]:  'mdi:fan',
};

// Maps config key → VACUUM_ACTION_* for action filtering
export const VACUUM_ACTION_KEYS = [
  VACUUM_ACTION_START,
  VACUUM_ACTION_PAUSE,
  VACUUM_ACTION_STOP,
  VACUUM_ACTION_RETURN_TO_BASE,
  VACUUM_ACTION_SET_FAN_SPEED,
] as const;
```

---

## styles.ts

**File:** `src/cards/vacuum/styles.ts`

**Export name:** `vacuumStyles`

Ported 1:1 from `main:src/cards/vacuum/style.js` with CSS variable adaptations:

| main CSS variable | TS equivalent |
|---|---|
| `--primary-bg-color` | `var(--sf-border)` |
| `--primary-bg-alpha-color` | `rgba(39, 40, 43, 0.3)` |
| `--secondary-bg-color` | `var(--sf-bg-secondary)` |
| `--primary-light-color` | `var(--sf-accent-on, #00ff9d)` |
| `--primary-light-alpha-color` | `var(--sf-text-secondary)` |
| `--border-width` | `1px` |
| `--corner-size` | `var(--sf-radius, 8px)` |
| `--font-size-normal` | `var(--sf-font-size-base, 14px)` |
| `--font-size-small` | `var(--sf-font-size-sm, 12px)` |
| `--icon-size-normal` | `60px` |
| `--icon-size-subtitle` | `40px` |
| `--icon-size-xsmall` | `16px` |

```ts
import { css } from 'lit';

export const vacuumStyles = css`
  /* HEIGHT CHAIN (Card mode):
     :host (flex col, min-height 732px) → ha-card (flex:1 = fills host) → .container (flex:1) → .map (flex:1)
     Without display:flex on :host + flex:1 on ha-card, ha-card stays at auto/content height
     and .map{flex:1} has nothing to expand into. */
  :host {
    display: flex;
    flex-direction: column;
    background-color: black;
    height: 100%;
    width: 100%;
    min-height: 732px;
  }
  ha-card {
    display: flex !important;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  /*********** HEADER *************/
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--sf-border);
    background-color: rgba(39, 40, 43, 0.3);
    padding: 10px;
    color: var(--sf-accent-on, #00ff9d);
    font-size: var(--sf-font-size-base, 14px);
  }
  .header .name {
    text-shadow: 0px 0px 5px var(--sf-accent-on, #00ff9d);
  }
  .header .infoH {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    flex: 1;
    justify-content: end;
  }
  .header .infoH sf-icon {
    --icon-width: 16px;
    --icon-height: 16px;
  }
  .header .infoH .spacer {
    width: 10px;
  }

  /*********** DEVICES *************/
  .devices {
    display: flex;
    flex-direction: row;
    border-top: 1px solid var(--sf-border);
    background-color: rgba(39, 40, 43, 0.3);
    padding: 10px;
    color: var(--sf-accent-on, #00ff9d);
    font-size: var(--sf-font-size-base, 14px);
  }
  .devices .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    align-items: center;
    flex-grow: 1;
  }
  .devices .number > div {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--sf-text-secondary);
    text-decoration: none;
    border-radius: 50%;
  }
  .devices .number > div.active {
    background-color: var(--sf-accent-on, #00ff9d);
  }

  /*********** SUB HEADER *************/
  .sub-header {
    display: flex;
    flex-direction: column;
    padding: 15px;
    position: relative;
    height: 60px;
  }
  .sub-header sf-icon {
    position: absolute;
    --icon-width: 60px;
    --icon-height: 60px;
  }
  .sub-header sf-icon.DOCKED {
    transform: rotate(90deg);
  }
  .sub-header sf-icon.CLEAN,
  .sub-header sf-icon.RETURNING {
    animation: moveAcross 20s linear infinite;
  }

  @keyframes moveAcross {
    0% {
      left: 0;
      transform: rotate(90deg);
    }
    49.999% {
      left: 92%;
      transform: rotate(90deg);
    }
    50% {
      left: 92%;
      transform: rotate(-90deg);
    }
    99.999% {
      left: 0;
      transform: rotate(-90deg);
    }
    100% {
      left: 0;
      transform: rotate(90deg);
    }
  }

  .sub-header sf-icon.IDLE,
  .sub-header sf-icon.ALERT {
    left: calc(50% - 30px);
  }
  .sub-header sf-icon.ALERT {
    --icon-color: var(--error-color, red);
  }

  /*********** MAP *************/
  .map {
    display: flex;
    flex: 1;
    padding: 15px;
    justify-content: center;
  }
  .map .image {
    border: 1px solid var(--sf-bg-secondary);
    border-radius: var(--sf-radius, 8px);
    width: auto;
    height: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .map .map-content {
    color: var(--sf-text-secondary);
    align-self: center;
  }

  /*********** INFO *************/
  .info {
    display: inline-flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--sf-bg-secondary);
    border-bottom: 1px solid var(--sf-bg-secondary);
    background-color: rgba(39, 40, 43, 0.3);
  }
  .info .sensor {
    width: 183px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    align-items: center;
  }
  .info .sensor sf-icon {
    --icon-color: var(--sf-text-secondary);
  }
  .info .sensor .data {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  }
  .info .sensor .data .value {
    color: var(--sf-accent-on, #00ff9d);
    text-shadow: 0px 0px 5px var(--sf-accent-on, #00ff9d);
  }
  .info .sensor .data .unit {
    color: var(--sf-text-secondary);
  }
  .info .sensor .name {
    color: var(--sf-text-secondary);
    font-size: var(--sf-font-size-sm, 12px);
  }

  /*********** ACTIONS *************/
  .actions {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    padding: 10px 10px 15px 10px;
    border-top: 1px solid var(--sf-bg-secondary);
    background-color: rgba(39, 40, 43, 0.3);
    justify-content: center;
  }
  .actions .default,
  .actions .shortcuts {
    display: flex;
    flex: 1;
    flex-direction: row;
    column-gap: 5px;
  }
  .actions .default {
    justify-content: left;
  }
  .actions .shortcuts {
    justify-content: right;
  }
  .actions .default sf-button,
  .actions .shortcuts sf-button {
    --btn-size: 40px;
  }
`;
```

---

## sci-fi-vacuum.ts — Full Reconstruction

### Imports

```ts
import { html, nothing, type TemplateResult, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { vacuumStyles } from './styles.js';
import type {
  SciFiVacuumConfig,
  SciFiVacuumEntry,
  SciFiVacuumShortcutDescription,
} from '../../types/config.js';
import {
  VACUUM_ICONS,
  VACUUM_ACTIVITY_STATE,
  VACUUM_ACTIONS_ICONS,
  VACUUM_ACTION_KEYS,
} from './vacuum_const.js';

import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';
import '../../components/sf-toast.js';
```

### static override styles

```ts
static override styles = [sciFiCommonStyles, vacuumStyles];
```

### Reactive state

```ts
declare config: SciFiVacuumConfig;

@state() private _vacuum_selected_id: number = 0;

protected override willUpdate(changedProperties: PropertyValues): void {
  super.willUpdate(changedProperties);
  if (changedProperties.has('config')) {
    const len = this.config.vacuums?.length ?? 0;
    if (this._vacuum_selected_id >= len) {
      this._vacuum_selected_id = Math.max(0, len - 1);
    }
  }
}
```

### renderCard() — layout structure

```html
<ha-card>
  <div class="container">
    ${this._renderHeader(vacuum)}
    ${this._renderSubHeader(vacuum)}
    ${this._renderInfo(vacuum)}
    ${this._renderMap(vacuum)}
    ${this._renderActions(vacuum)}
    ${this._renderDevices()}
  </div>
  <sf-toast></sf-toast>
</ha-card>
```

Guard: if `!this.config.vacuums?.length` → return `html\`<ha-card></ha-card>\``.

Current vacuum: `const vacuum = this.config.vacuums[this._vacuum_selected_id]`.

### _renderHeader(v)

```
┌──────────────────────────────────────────────────────────────────┐
│ border-bottom: 1px solid var(--sf-border)                        │
│ [.name: vacuum.friendly_name] [.infoH: fan + spacer + mop + bat]│
└──────────────────────────────────────────────────────────────────┘
```

```ts
private _renderHeader(v: SciFiVacuumEntry): TemplateResult {
  const entityState = this.hass.states[v.entity];
  const name = entityState?.attributes.friendly_name ?? v.entity;
  const fanSpeed = (entityState?.attributes as any)?.fan_speed as string | undefined;

  const batteryState = v.sensors?.battery
    ? this.hass.states[v.sensors.battery]
    : undefined;
  const mopState = v.sensors?.mop_intensite
    ? this.hass.states[v.sensors.mop_intensite]
    : undefined;

  // Battery color thresholds (mirrors sf-landspeeder pattern)
  const batteryLevel = batteryState ? parseFloat(batteryState.state) : NaN;
  const batteryClass = !isNaN(batteryLevel)
    ? batteryLevel < 20 ? 'battery-critical'
    : batteryLevel < 30 ? 'battery-warn'
    : ''
    : '';

  return html`
    <div class="header">
      <div class="name">${name}</div>
      <div class="infoH">
        ${fanSpeed ? html`
          <sf-icon
            icon="mdi:fan"
            .connection="${this.hass.connection}"
            style="cursor:pointer"
            @click="${() => this._callAction(v.entity, VACUUM_ACTION_SET_FAN_SPEED)}"
          ></sf-icon>
          <div>${fanSpeed}</div>
        ` : nothing}
        <div class="spacer"></div>
        ${mopState ? html`
          <sf-icon icon="${(mopState.attributes as any).icon ?? 'mdi:water-opacity'}" .connection="${this.hass.connection}"></sf-icon>
          <div>${mopState.state}</div>
        ` : nothing}
        <div class="spacer"></div>
        ${batteryState ? html`
          <sf-icon class="${batteryClass}" icon="${(batteryState.attributes as any).icon ?? 'mdi:battery'}" .connection="${this.hass.connection}"></sf-icon>
          <div class="${batteryClass}">${batteryState.state}${(batteryState.attributes as any).unit_of_measurement ?? ''}</div>
        ` : nothing}
      </div>
    </div>
  `;
}
```

> [!IMPORTANT]
> Fan speed icon is **clickable** — clicking cycles through `fan_speed_list` using `_callAction(set_fan_speed)`. It is **not** rendered as an action button in the action bar.

### _renderSubHeader(v)

```
.sub-header — height: 40px, position: relative
└── sf-icon — position: absolute, --icon-width/height: 40px, class=ACTIVITY_STATE
    CLEAN / RETURNING → animation: moveAcross 20s
    DOCKED            → transform: rotate(90deg)
    IDLE / ALERT      → left: calc(50% - 20px)
    ALERT             → --icon-color: rgb(250, 146, 29)
```

```ts
private _renderSubHeader(v: SciFiVacuumEntry): TemplateResult {
  const stateStr = this.hass.states[v.entity]?.state ?? 'unknown';
  const icon = VACUUM_ICONS[stateStr] ?? 'mdi:robot-vacuum-off';
  const activity = VACUUM_ACTIVITY_STATE[stateStr] ?? 'IDLE';

  return html`
    <div class="sub-header">
      <sf-icon icon="${icon}" class="${activity}" .connection="${this.hass.connection}"></sf-icon>
    </div>
  `;
}
```

### _renderInfo(v)

Renders only `current_clean_area` and `current_clean_duration` sensors (not battery, not mop — those are in header).
Elements are **centered** (`justify-content: center` on `.info`).
`current_clean_duration` value is **rounded to integer** with `Math.round()` before display.

```
.info
├── .sensor (current_clean_area)   → .data [icon + .value + .unit] + .name
└── .sensor (current_clean_duration) → .data [icon + .value + .unit] + .name
```

```ts
private _renderInfo(v: SciFiVacuumEntry): TemplateResult {
  const areaState = v.sensors?.current_clean_area
    ? this.hass.states[v.sensors.current_clean_area]
    : undefined;
  const durationState = v.sensors?.current_clean_duration
    ? this.hass.states[v.sensors.current_clean_duration]
    : undefined;

  const sensors = [
    { state: areaState, icon: 'mdi:floor-plan', label: msg('Area') },
    { state: durationState, icon: 'mdi:timer-outline', label: msg('Duration') },
  ].filter((s) => s.state !== undefined);

  if (sensors.length === 0) return html``;

  return html`
    <div class="info">
      ${sensors.map((s) => html`
        <div class="sensor">
          <div class="data">
            <sf-icon icon="${s.icon}" .connection="${this.hass.connection}"></sf-icon>
            <div class="value">${s.state!.state}</div>
            <div class="unit">${(s.state!.attributes as any).unit_of_measurement ?? ''}</div>
          </div>
          <div class="name">${(s.state!.attributes as any).friendly_name ?? s.label}</div>
        </div>
      `)}
    </div>
  `;
}
```

### _renderMap(v)

```
.map (flex: 1, padding: 15px)
└── if map entity defined:
      <img class="image" src="${mapUrl}" alt="...">
    else:
      <div class="map-content">${msg('No map defined')}</div>
```

```ts
private _renderMap(v: SciFiVacuumEntry): TemplateResult {
  const mapState = v.sensors?.map
    ? this.hass.states[v.sensors.map]
    : undefined;
  const mapUrl = mapState?.attributes['entity_picture'] as string | undefined;

  return html`
    <div class="map">
      ${mapUrl
        ? html`<img class="image" src="${mapUrl}" alt="${msg('Vacuum map')}" />`
        : html`<div class="map-content">${msg('No map defined')}</div>`
      }
    </div>
  `;
}
```

### _renderActions(v)

```
.actions — pinned to bottom via margin-top: auto on the flex column container
├── .default  → sf-button per enabled action (start/pause/stop/return_to_base ONLY)
│              set_fan_speed is handled by clicking the fan icon in the header
└── .shortcuts → sf-button per shortcut description icon, right-aligned
```

```ts
private _renderActions(v: SciFiVacuumEntry): TemplateResult {
  // set_fan_speed is excluded from the action bar — it is handled by the fan icon click in header
  const BAR_ACTIONS = VACUUM_ACTION_KEYS.filter(k => k !== VACUUM_ACTION_SET_FAN_SPEED);
  const enabledActions = BAR_ACTIONS
    .filter((k) => (v as any)[k] !== false)
    .map((k) => ({ key: k, icon: VACUUM_ACTIONS_ICONS[k] }));

  const shortcuts = v.shortcuts?.description ?? [];

  return html`
    <div class="actions">
      <div class="default">
        ${enabledActions.map((a) => html`
          <sf-button
            icon="${a.icon}"
            @button-click="${() => this._callAction(v.entity, a.key)}"
          ></sf-button>
        `)}
      </div>
      <div class="shortcuts">
        ${shortcuts.map((s, id) => html`
          <sf-button
            icon="${s.icon ?? 'mdi:broom'}"
            @button-click="${() => this._callShortcut(v, id)}"
          ></sf-button>
        `)}
      </div>
    </div>
  `;
}
```

### _renderDevices()

Hidden (not rendered) if single vacuum. Shows prev/next chevrons + dot indicators.

```ts
private _renderDevices(): TemplateResult {
  if (this.config.vacuums.length <= 1) return html``;

  return html`
    <div class="devices">
      <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
      <div class="number">
        ${this.config.vacuums.map((_, id) => html`
          <div class="${id === this._vacuum_selected_id ? 'active' : ''}"></div>
        `)}
      </div>
      <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
    </div>
  `;
}

private readonly _prev = (): void => {
  const len = this.config.vacuums.length;
  this._vacuum_selected_id = this._vacuum_selected_id === 0
    ? len - 1
    : this._vacuum_selected_id - 1;
};

private readonly _next = (): void => {
  const len = this.config.vacuums.length;
  this._vacuum_selected_id = this._vacuum_selected_id === len - 1
    ? 0
    : this._vacuum_selected_id + 1;
};
```

### Service calls

```ts
private _callAction(entityId: string, service: string): void {
  if (service === 'set_fan_speed') {
    const state = this.hass.states[entityId];
    const currentSpeed = (state?.attributes as any)?.fan_speed as string | undefined;
    const speeds = ((state?.attributes as any)?.fan_speed_list as string[] | undefined)
      ?? ['quiet', 'standard', 'strong', 'max'];
    const nextIndex = currentSpeed ? (speeds.indexOf(currentSpeed) + 1) % speeds.length : 1;
    const nextSpeed = speeds[nextIndex];
    void this.hass.callService('vacuum', 'set_fan_speed', { entity_id: entityId, fan_speed: nextSpeed })
      .then(() => this._toast(false, msg('done')))
      .catch((e: Error) => this._toast(true, e.message));
    return;
  }

  void this.hass.callService('vacuum', service, { entity_id: entityId })
    .then(() => this._toast(false, msg('done')))
    .catch((e: Error) => this._toast(true, e.message));
}

private _callShortcut(v: SciFiVacuumEntry, idx: number): void {
  const sc = v.shortcuts;
  if (!sc?.service) return;
  const [domain, service] = sc.service.split('.');
  if (!domain || !service) return;
  const desc: SciFiVacuumShortcutDescription | undefined = sc.description?.[idx];
  if (!desc) return;
  void this.hass.callService(domain, service, {
    entity_id: v.entity,
    command: sc.command ?? 'app_segment_clean',
    params: [{ segments: desc.segments }],
  })
    .then(() => this._toast(false, msg('done')))
    .catch((e: Error) => this._toast(true, e.message));
}

private _toast(error: boolean, text: string): void {
  const toast = this.shadowRoot?.querySelector('sf-toast') as any;
  if (toast?.addMessage) toast.addMessage(text, error);
}
```

---

## Test Selectors — Frozen Contract

> [!CAUTION]
> The following selectors in `tests/cards/vacuum/sci-fi-vacuum.test.ts` reference the **OLD** layout and MUST be **updated**:

| Old selector (must update) | Old assertion | New selector in new layout |
|---|---|---|
| `.vacuum-tabs` | `querySelectorAll('.vacuum-tab').length` | N/A — navigation is `.devices` with dot indicators |
| `.vacuum-tab` | `getAttribute('aria-selected')` | N/A — no tab buttons |
| `.vacuum-state` | `textContent includes 'cleaning'` | `.sub-header sf-icon[class="CLEAN"]` |
| `.vacuum-main` | flex row layout | N/A — replaced by `.header` + `.sub-header` + `.info` + `.map` |
| `.vacuum-info` | flex: 1 | N/A |
| `.sensors-row` | sensor items | `.info .sensor` |
| `.map-container` | 120x120 map | `.map .image` |
| `.ctrl-btn` | `querySelectorAll` count | N/A — replaced by `sf-button` in `.actions .default` |
| `.fan-select` | `<select>` element | N/A — fan speed is read-only in `.header .infoH` |
| `.shortcut-btn` | text button | N/A — replaced by `sf-button` in `.actions .shortcuts` |

> [!IMPORTANT]
> The following selectors are **preserved** and must remain GREEN:

| Selector | Test | Assertion |
|---|---|---|
| `getConfigElement()` | TC-1501 | `tagName === 'sci-fi-vacuum-editor'` |
| `getStubConfig().type` | TC-1502 | `=== 'custom:sci-fi-vacuum'` |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Keeping the tabs layout** | `.vacuum-tab[aria-selected]` tab row for navigation | Full replacement: `.devices` bottom bar with dots + sf-button chevrons |
| 2 | **Using `<button>` for actions** | `<button class="ctrl-btn">▶ Démarrer</button>` | `<sf-button icon="mdi:play-circle-outline">` in `.actions .default` |
| 3 | **Using `<select>` for fan speed** | `<select class="fan-select">` | Fan speed is **read-only** in header: `entity.attributes.fan_speed` |
| 4 | **Putting battery/mop in `.info` sensors** | Emoji `🔋 85%` in `.sensors-row` | Battery + mop_intensite in `.header .infoH` via sf-icon + text |
| 5 | **Putting battery/mop in `.info` card grid** | `.info .sensor` for battery | Only `current_clean_area` and `current_clean_duration` go in `.info` |
| 6 | **Side-by-side map** | Map 120×120px next to info | Map is **full-width** in its own `.map` section (flex: 1) |
| 7 | **Missing animation** | Static icon for CLEAN state | `sf-icon.CLEAN` / `sf-icon.RETURNING` get `animation: moveAcross 20s` via CSS class |
| 8 | **Missing sf-toast** | No feedback on action failure | `<sf-toast>` must be present inside `renderCard()` template |
| 9 | **Missing null guards on hass.states** | `this.hass.states[v.entity].state` | Always `this.hass.states[v.entity]?.state` |
| 10 | **Shortcut params as flat array** | `params: desc.segments` | `params: [{ segments: desc.segments }]` — matches main `_callShortcutService` signature |
| 11 | **Fan speed as action bar button** | `<sf-button icon="mdi:fan">` in `.actions .default` | Fan speed is **header-only**: clickable `sf-icon` in `.header .infoH` cycles through `fan_speed_list` |
| 12 | **No battery color thresholds** | Battery always cyan regardless of level | `battery-warn` class (amber) at < 30%, `battery-critical` class (orange) at < 20% |
| 13 | **Flat flex container for .info** | `display: inline-flex` without centering | `display: flex; justify-content: center` |
| 14 | **ha-card display:block breaks flex** | `ha-card { display: block }` from common styles | Override in vacuumStyles: `ha-card { display: flex !important; flex-direction: column }` |
| 15 | **Duration not rounded** | `10.0666…` displayed as-is | `Math.round(parseFloat(state))` before display |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-1501 | Unit | `getConfigElement()` returns correct editor tag | static call | `tagName === 'sci-fi-vacuum-editor'` |
| TC-1502 | Unit | `getStubConfig()` returns correct type | static call | `config.type === 'custom:sci-fi-vacuum'` |
| TC-1503 | Unit | Renders gracefully without hass | no hass set | `shadowRoot.textContent` is empty |
| TC-1504 | Unit | Renders empty card when no vacuums | `{ type, vacuums: [] }` + hass | `.container` absent or empty ha-card |
| TC-1505 | Unit | Header shows vacuum name | vacuum with `friendly_name: 'Robot 1'` | `.header .name` textContent includes `'Robot 1'` |
| TC-1506 | Unit | Header shows fan speed from entity attributes | state with `fan_speed: 'Standard'` | `.header .infoH` textContent includes `'Standard'` |
| TC-1507 | Unit | Sub-header renders sf-icon with DOCKED class | vacuum in `docked` state | `.sub-header sf-icon` has class `DOCKED` |
| TC-1508 | Unit | Sub-header renders sf-icon with CLEAN class | vacuum in `cleaning` state | `.sub-header sf-icon` has class `CLEAN` |
| TC-1509 | Unit | Sub-header renders sf-icon with ALERT class | vacuum in `error` state | `.sub-header sf-icon` has class `ALERT` |
| TC-1510 | Unit | Info renders current_clean_area sensor | sensor configured and in hass | `.info .sensor` present with area value |
| TC-1511 | Unit | Info hidden when no info sensors configured | no sensors in config | `.info` absent |
| TC-1512 | Unit | Map image rendered when map entity present | map camera with entity_picture | `.map .image` present, `src` set |
| TC-1513 | Unit | Map fallback text rendered when no map | no `sensors.map` | `.map .map-content` textContent includes `'No map defined'` |
| TC-1514 | Unit | Actions: enabled action buttons rendered as sf-button | default config (all actions true) | **4** `sf-button` in `.actions .default` (set_fan_speed excluded — handled by header click) |
| TC-1515 | Unit | Actions: disabled action not rendered | `start: false` | **3** `sf-button` in `.actions .default` |
| TC-1516 | Unit | Actions: sf-button click calls vacuum service | click start button | `callService('vacuum', 'start', { entity_id })` called |
| TC-1517 | Unit | Shortcuts: sf-button per shortcut description rendered | 2 shortcuts in config | 2 `sf-button` in `.actions .shortcuts` |
| TC-1518 | Unit | Shortcuts: sf-button click calls shortcut service | click first shortcut | `callService('vacuum', 'send_command', { entity_id, command, params })` called |
| TC-1519 | Unit | Devices bar absent for single vacuum | 1 vacuum | `.devices` absent |
| TC-1520 | Unit | Devices bar present for multiple vacuums | 2 vacuums | `.devices` present with 2 dots |
| TC-1521 | Unit | Prev navigation cycles correctly | 2 vacuums at idx 0, click prev | `_vacuum_selected_id` becomes 1 |
| TC-1522 | Unit | Next navigation cycles correctly | 2 vacuums at idx 1, click next | `_vacuum_selected_id` becomes 0 |
| TC-1523 | Unit | Toast shows success message after action | click start, service resolves | `sf-toast.addMessage` called with `('done', false)` |
| TC-1524 | Unit | Toast shows error message after action failure | click start, service rejects with Error('fail') | `sf-toast.addMessage` called with `('fail', true)` |
| IT-1501 | Integration | Card registers in `customElements` | load card | `customElements.get('sci-fi-vacuum')` returns class |
| IT-1502 | Integration | Card full render: header + sub-header + map + actions | mount with full config | `.header`, `.sub-header`, `.map`, `.actions` all present |
| IT-1503 | Integration | `vacuum/styles.ts` imported — no inline `css\`` in `sci-fi-vacuum.ts` | grep | `grep -c "css\`" sci-fi-vacuum.ts` returns 0 |

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| No `hass` | `SciFiBaseCard` guard before `renderCard()` | Returns empty template | Transparent empty card |
| No `vacuums` in config | `!this.config.vacuums?.length` | Return `html\`<ha-card></ha-card>\`` | Empty card shown |
| Vacuum entity not in `hass.states` | `this.hass.states[v.entity]?.state` undefined | `stateStr = 'unknown'`, icon = `mdi:robot-vacuum-off`, activity = `IDLE` | Card shown in idle state |
| Battery sensor not in `hass.states` | `v.sensors?.battery` → `this.hass.states[...]` undefined | Battery block hidden from header | Header shown without battery |
| Mop_intensite sensor not in `hass.states` | Same pattern | Mop block hidden from header | Header shown without mop |
| Info sensor not in `hass.states` | `s.state === undefined` → filtered out | Sensor card not rendered | `.info` may be empty |
| Map entity not in `hass.states` | `v.sensors?.map` → `mapState` undefined | Fallback `.map-content` with `msg('No map defined')` | Text fallback shown |
| Shortcut service missing or malformed | `!sc?.service` or `!domain \|\| !service` after split | Early return, no service call | Nothing happens |
| Shortcut description missing at index | `!desc` guard | Early return, no service call | Nothing happens |
| Action service call fails | `.catch((e) => this._toast(true, e.message))` | Toast error message shown | Toast shown |
| `_vacuum_selected_id` out of bounds | Can't happen: prev/next bounded to `vacuums.length - 1` | — | — |

---

## Localization — New msg() Keys

| English key (msg()) | French translation |
|---|---|
| `'done'` | Already present from vehicle/plugs cards — verify |
| `'No map defined'` | `'Aucune carte définie'` |
| `'Vacuum map'` | `'Carte aspirateur'` (alt text for img) |
| `'Area'` | `'Surface'` (fallback label for area sensor) |
| `'Duration'` | `'Durée'` (fallback label for duration sensor) |

> [!IMPORTANT]
> Run `grep -r "msg('done'\|msg('No map" src/` before adding. Only add keys that are genuinely missing. Do NOT modify `src/locales/locales/fr.ts` by hand — update `xliff/fr.xlf` first, then run `npm run locale:build`.

---

## Deep Links

| Reference | Location |
|---|---|
| Current vacuum card (to replace) | [sci-fi-vacuum.ts](../../src/cards/vacuum/sci-fi-vacuum.ts#L1) |
| Vacuum config types (frozen) | [config.ts L184-L218](../../src/types/config.ts#L184-L218) |
| Main branch card.js (reference) | `git show main:src/cards/vacuum/card.js` |
| Main branch style.js (reference) | `git show main:src/cards/vacuum/style.js` |
| Main branch vacuum_const.js | `git show main:src/helpers/entities/vacuum/vacuum_const.js` |
| Plugs card (sf-toast + styles.ts pattern) | [sci-fi-plugs.ts](../../src/cards/plugs/sci-fi-plugs.ts#L1) |
| Plugs styles pattern | [plugs/styles.ts](../../src/cards/plugs/styles.ts#L1) |
| Vehicle card (navigation pattern) | [sci-fi-vehicles.ts](../../src/cards/vehicles/sci-fi-vehicles.ts#L1) |
| sf-button component | [sf-button.ts](../../src/components/buttons/sf-button.ts#L1) |
| sf-icon component | [sf-icon/](../../src/components/sf-icon/#L1) |
| sf-toast component | [sf-toast.ts](../../src/components/sf-toast.ts#L1) |
| Common tokens | [styles/common.ts](../../src/styles/common.ts#L1) |
| Existing vacuum tests | [sci-fi-vacuum.test.ts](../../tests/cards/vacuum/sci-fi-vacuum.test.ts#L1) |
| Plugs spec (styles.ts + toast pattern) | [Spec 13](./13_plugs_card_design_update.md#L1) |
| Vehicle spec (navigation pattern) | [Spec 12](./12_vehicle_card_design_update.md#L1) |
| Stove spec (styles.ts pattern) | [Spec 11](./11_stove_card_design_update.md#L1) |
| Screenshots (main UX) | `git show main:screenshot/vacuum.jpeg` |
