# Spec 12 — Vehicle Card Design Update

> Document Type: Implementation
> Covers: Full reconstruction of `sci-fi-vehicles` card to match `main` branch layout — landspeeder image, header with vehicle navigation, and AC actions.
> Depends on: [Spec 05](./05_cards.md#sci-fi-vehicles), [Spec 03](./03_base_classes.md#L1)
> ADR-005: Zero breaking YAML changes — all config fields in `SciFiVehicleEntry` and `SciFiVehiclesConfig` frozen; CSS selectors used by tests frozen.

---

## Blueprint Coverage

| Feature ID | Description | Spec file |
|---|---|---|
| F-VEH-D01 | Header: vehicle name centered + prev/next navigation buttons (multi-vehicle) | ✅ This spec § Header |
| F-VEH-D02 | `sf-landspeeder` component: SVG top-view image + overlaid data panels (top, middle) | ✅ This spec § sf-landspeeder |
| F-VEH-D03 | Landspeeder `.top` zone: location (with map link) + mileage | ✅ This spec § sf-landspeeder top zone |
| F-VEH-D04 | Landspeeder `.middle` zone: lock + fuel + battery + charging panels positioned on SVG | ✅ This spec § sf-landspeeder middle zone |
| F-VEH-D05 | Actions bar: temperature `sf-wheel` + Start AC / Stop AC buttons | ✅ This spec § Actions |
| F-VEH-D06 | Extract CSS into `styles.ts` (stove/climate pattern) | ✅ This spec § styles.ts |
| F-VEH-D07 | Battery color thresholds: green ≥60%, orange 20-59%, red <20% | ✅ This spec § sf-landspeeder middle zone |
| F-VEH-D08 | Charge state + plug state icon mapping from `vehicles/vehicle_const.ts` | ✅ This spec § Constants |
| F-VEH-D09 | All existing 6 vehicle tests remain GREEN (regression gate) | ✅ This spec § Test Selectors |

---

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `SciFiVehicleEntry` and `SciFiVehiclesConfig` config fields are frozen — no new fields needed | Low | SHOW | 'grep -n "SciFiVehicleEntry" src/types/config.ts' → 14 sensor fields already defined |
| 2 | Existing CSS selectors `.vehicle-card`, `.battery-bar-fill`, `.stat-item` in existing tests must be preserved or tests must be rewritten alongside | Medium | SHOW | 'grep -n "querySelector" tests/cards/vehicles/sci-fi-vehicles.test.ts' → 4 assertions on these selectors |
| 3 | The SVG top-view landspeeder ('top.js' from main) can be ported 1:1 as a Lit `html` template literal | Low | SHOW | 'git show main:src/components/landspeeder/data/top.js' → SVG is already wrapped in `html\`...\`` |
| 4 | `sf-wheel`, `sf-button-card`, and `sf-button` components already exist in TS and match the AC actions pattern | Low | SHOW | 'ls src/components/buttons/' → `sf-button-card.ts`, `sf-button.ts` exist; `sf-wheel.ts` exists |
| 5 | The Renault AC service (`renault`, `ac_start`, `ac_cancel`) is the correct service — card calls `hass.callService('renault', 'ac_start', {vehicle: id, temperature})` | Medium | SHOW | 'git show main:src/helpers/entities/vehicle/vehicle_const.js' → `HASS_RENAULT_SERVICE = 'renault'`, `HASS_RENAULT_SERVICE_ACTION_START_AC = 'ac_start'` |
| 6 | Temperature wheel items: 10 items from 16°C to 25°C (idx 0–9, default idx=2 = 18°C) | Low | SHOW | 'git show main:src/cards/vehicles/card.js' → `Array.from(Array(10).keys()).map((e,idx) => idx+16)` |
| 7 | The existing 6 tests reference `.stat-item`, `.vehicle-card`, `.battery-bar-fill` — these must be **updated** in the new test file, not preserved, because the layout changes completely | Medium | TELL | Tests reference old flat-stats layout; new layout is landspeeder-based — test selectors will change |
| 8 | `sf-button-card` (not `sf-button-card-select`) is the correct component for Start/Stop AC buttons (no dropdown needed) | Low | SHOW | 'git show main:src/cards/vehicles/card.js' → uses `sci-fi-button-card` with `@button-click`, no selection |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Preserve `SciFiVehicleEntry` and `SciFiVehiclesConfig` field names (ADR-005); use `sciFiCommonStyles`; export `vehicleStyles` from `styles.ts`; preserve `vehicle.id` for Renault AC service call |
| **Ask first** | Adding new config fields; changing the AC service name or params; altering `getStubConfig()` return shape |
| **Never do** | Rename config fields (`id`, `name`, `charging`, `lock_status`, etc.); mutate `this.config` or `this.hass`; hardcode `temperature_items` length differently from `main` (10 items, 16–25°C) |

---

## Cross-Spec Contracts

### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/vehicles/styles.ts` | Lit CSS export | This spec § styles.ts | `vehicles/sci-fi-vehicles.ts` (import `vehicleStyles`) |
| `src/components/sf-landspeeder.ts` | Web Component | This spec § sf-landspeeder | `vehicles/sci-fi-vehicles.ts` |
| `src/cards/vehicles/vehicle_const.ts` | TS constants | This spec § Constants | `components/sf-landspeeder.ts`, `vehicles/sci-fi-vehicles.ts` |
| Updated `sci-fi-vehicles` card | Web Component | This spec § Full render | Lovelace via `getConfigElement()` (Spec 05) |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | Spec 03 § base-card.ts | `src/utils/base-card.ts` |
| `SciFiVehiclesConfig`, `SciFiVehicleEntry` | TS interfaces | Spec 05 § sci-fi-vehicles | `src/types/config.ts` |
| `sf-wheel` | Web Component | Spec 04 § sf-wheel | `src/components/sf-wheel.ts` |
| `sf-button-card` | Web Component | Spec 04 § sf-button-card | `src/components/buttons/sf-button-card.ts` |
| `sf-icon` | Web Component | Spec 04 § sf-icon | `src/components/sf-icon/` |

### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-vehicles>` | HA Lovelace | Vehicle monitoring card (unchanged tag) |
| `<sf-landspeeder>` | `vehicles/sci-fi-vehicles.ts` | Internal landspeeder display component |

### External Invocations

| Service | Action | Params | When |
|---|---|---|---|
| `renault` | `ac_start` | `{ vehicle: v.id, temperature: selectedTemp }` | User clicks "Start AC" |
| `renault` | `ac_cancel` | `{ vehicle: v.id }` | User clicks "Stop AC" |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `_active_vehicle_id` reactive state | Index into `config.vehicles[]` array; prev/next buttons cycle it | This spec § Header |
| `_selected_temp_id` reactive state | Index into temperature wheel items (0–9); default = 2 (=18°C) | This spec § Actions |
| Battery color thresholds | `raw_battery_level / 10` rounded → green ≥60, orange 20–59, red <20 | This spec § middle zone |

---

## File Tree

```
src/cards/vehicles/
├── src/cards/vehicles/sci-fi-vehicles.ts             [MODIFY] — full reconstruction: header+landspeeder+actions layout; state properties; AC service calls
├── src/cards/vehicles/styles.ts                      [NEW]    — extracted vehicle CSS (card, header, actions sections)
└── src/cards/vehicles/vehicle_const.ts               [NEW]    — charge/plug state constants + icon/label mappings (ported from main vehicle_const.js)

src/components/
└── src/components/sf-landspeeder.ts                  [NEW]    — landspeeder SVG + overlaid top/middle data panels (ported from main sf-landspeeder.js)

tests/cards/vehicles/
└── tests/cards/vehicles/sci-fi-vehicles.test.ts      [MODIFY] — rewrite to match new layout selectors; preserve TC-VEH-0001 (getConfigElement) and TC-VEH-0002 (getStubConfig)

xliff/
└── xliff/fr.xlf                                      [MODIFY]
```

> [!NOTE]
> `components/sf-landspeeder.ts` is a new component not yet in `src/components/`. Its SVG data is ported 1:1 from 'main:src/components/landspeeder/data/top.js'. The `vehicles/vehicle_const.ts` constants are ported from 'main:src/helpers/entities/vehicle/vehicle_const.js'.

---

## Constants — vehicle_const.ts

**File:** `src/cards/vehicles/vehicle_const.ts`

```ts
// Ported from main:src/helpers/entities/vehicle/vehicle_const.js

export const HASS_RENAULT_SERVICE = 'renault';
export const HASS_RENAULT_SERVICE_ACTION_START_AC = 'ac_start';
export const HASS_RENAULT_SERVICE_ACTION_STOP_AC = 'ac_cancel';

// Charge states (HA entity states for charge_state sensor)
export const VEHICLE_CHARGE_STATES_NOT_IN_CHARGE = 'not_in_charge';
export const VEHICLE_CHARGE_STATES_WAITING_PLANNED_CHARGE = 'waiting_for_a_planned_charge';
export const VEHICLE_CHARGE_STATES_WAITING_CURRENT_CHARGE = 'waiting_for_current_charge';
export const VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS = 'charge_in_progress';
export const VEHICLE_CHARGE_STATES_CHARGE_ENDED = 'charge_ended';
export const VEHICLE_CHARGE_STATES_CHARGE_ERROR = 'charge_error';
export const VEHICLE_CHARGE_STATES_ENERGY_FLAP_OPENED = 'energy_flap_opened';
export const VEHICLE_CHARGE_STATES_UNAVAILABLE = 'unavailable';

// Plug states
export const VEHICLE_PLUG_STATES_UNPLUGGED = 'unplugged';
export const VEHICLE_PLUG_STATES_PLUGGED = 'plugged';
export const VEHICLE_PLUG_STATES_PLUGGED_WAITING_FOR_CHARGE = 'plugged_waiting_for_charge';
export const VEHICLE_PLUG_STATES_ERROR = 'plug_error';
export const VEHICLE_PLUG_STATES_UNKNOWN = 'plug_unknown';
export const VEHICLE_PLUG_UNAVAILABLE = 'unavailable';

// Generic sensor states
export const VEHICLE_SENSOR_ON_STATE = 'on';
export const VEHICLE_SENSOR_UNAVAILABLE_STATE = 'unavailable';
```

**Charge state icon map** (used in `components/sf-landspeeder.ts` → `_getChargeStateIcon()`):

| State constant | Icon |
|---|---|
| `NOT_IN_CHARGE` | `mdi:battery-off` |
| `WAITING_PLANNED_CHARGE` | `mdi:battery-clock` |
| `WAITING_CURRENT_CHARGE` | `mdi:battery-clock` |
| `CHARGE_IN_PROGRESS` | `mdi:battery-charging-medium` |
| `CHARGE_ENDED` | `mdi:battery-check` |
| `CHARGE_ERROR` | `mdi:battery-alert-variant` |
| `ENERGY_FLAP_OPENED` | `mdi:battery-unknown` |
| `UNAVAILABLE` | `mdi:battery-unknown` |

**Plug state icon map** (sci: custom icons from main):

| State constant | Icon |
|---|---|
| `UNPLUGGED` | `sci:landspeeder-plugged-off` |
| `PLUGGED` | `sci:landspeeder-plugged` |
| `PLUGGED_WAITING_FOR_CHARGE` | `sci:landspeeder-plugged-clock` |
| `ERROR` | `sci:landspeeder-error-plug` |
| `UNKNOWN` / `UNAVAILABLE` | `sci:landspeeder-unknown-plug` |

**Human-readable label map** (used in `components/sf-landspeeder.ts` → `_getLabel(key)`):

| Key | Label (msg()) |
|---|---|
| `home` | `msg('home')` |
| `not_home` | `msg('not home')` |
| `unavailable` | `msg('unavailable')` |
| `not_in_charge` | `msg('Not in charge')` |
| `waiting_for_a_planned_charge` | `msg('Waiting for planned charge')` |
| `waiting_for_current_charge` | `msg('Waiting for current charge')` |
| `charge_in_progress` | `msg('In progress')` |
| `charge_ended` | `msg('Ended')` |
| `charge_error` | `msg('Error')` |
| `energy_flap_opened` | `msg('Flap opened')` |
| `unplugged` | `msg('Unplugged')` |
| `plugged` | `msg('Plugged')` |
| `plugged_waiting_for_charge` | `msg('Waiting for charge')` |
| `plug_error` | `msg('Error')` |

> [!IMPORTANT]
> `msg()` keys must be English strings. Do NOT modify `src/locales/locales/fr.ts` by hand. New translation keys must be added to `xliff/fr.xlf`, then compiled via `npm run locale:build` to regenerate `fr.ts` (relying on `lit-localize` hash matching).

---

## styles.ts

**File:** `src/cards/vehicles/styles.ts`

**Export name:** `vehicleStyles`

```ts
import { css } from 'lit';

export const vehicleStyles = css`
  /* HEIGHT CHAIN: :host (flex col, min-height 732px) → ha-card (flex:1) → .container (flex:1) → sf-landspeeder (flex:1)
     display:flex on :host is mandatory — without it, ha-card{flex:1} has nothing to fill in card mode. */
  :host {
    display: flex;
    flex-direction: column;
    background-color: black;
    height: 100%;
    width: 100%;
    min-height: 732px;
  }

  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* ── CONTAINER ─────────────────────────────────────── */
  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
  }
  /* sf-landspeeder fills all vertical space between header and actions */
  sf-landspeeder {
    flex: 1;
    min-height: 0;
  }

  /* ── HEADER ──────────────────────────────────────────── */
  .header {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-bottom: 1px solid var(--sf-border);
    padding: 10px;
    background-color: var(--sf-bg-secondary);
    align-items: center;
  }
  .header .hide {
    visibility: hidden;
    pointer-events: none;
  }
  .header .title {
    flex: 1;
    align-content: center;
    color: var(--sf-text-primary);
    font-size: var(--sf-font-size-base, 14px);
    font-weight: 600;
  }

  /* ── ACTIONS ─────────────────────────────────────── */
  /* Pinned at bottom of flex column; buttons centered horizontally */
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-shrink: 0;
    padding: 10px;
    padding-bottom: 20px;
  }
  .actions .ac {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: stretch;
  }
  /* sf-wheel: matching border + height alignment with sf-button-card */
  .actions .ac sf-wheel {
    --padding: 0 10px;
    --wheel-row-gap: 2px;
    --text-size: var(--sf-font-size-xs, 10px);
    --border: 1px solid rgba(102, 156, 210, 0.5);
    justify-content: center;
  }
  /* sf-button-card: visible border + translucent background */
  .actions .ac sf-button-card {
    --border: 1px solid rgba(102, 156, 210, 0.5);
    --background: rgba(102, 156, 210, 0.2);
  }
`;
```

---

## sci-fi-vehicles.ts — Full Reconstruction

### Imports

```ts
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { vehicleStyles } from './styles.js';
import type { SciFiVehiclesConfig, SciFiVehicleEntry } from '../../types/config.js';
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
} from './vehicle_const.js';

import '../../components/sf-landspeeder.js';
import '../../components/sf-wheel.js';
import '../../components/buttons/sf-button-card.js';
import '../../components/buttons/sf-button.js';
```

### static override styles

```ts
static override styles = [sciFiCommonStyles, vehicleStyles];
```

### Reactive state

```ts
declare config: SciFiVehiclesConfig;

@state() private _active_vehicle_id: number = 0;
@state() private _selected_temp_id: number = 2; // default = 18°C (index 2 in 16–25°C range)
@state() private _is_ac_loading: boolean = false;
```
> The temperature items reference `this.hass` for the unit symbol. They are rebuilt in `renderCard()` to always reflect current hass unit system. They should NOT be cached as a class-level constant (unit could theoretically change).

### renderCard() — layout structure

```html
<div class="container">
  ${this._renderHeader()}
  <sf-landspeeder
    .vehicle="${this.config.vehicles[this._active_vehicle_id]}"
    .hass="${this.hass}"
  ></sf-landspeeder>
  ${this._renderActions()}
</div>
<sf-toast></sf-toast>
```

### _renderHeader()

```
┌──────────────────────────────────────────────────────────┐
│ border-bottom: 1px solid var(--sf-border)                │
│ [btn chevron-left (hide if 1 veh)] [vehicle.name] [btn chevron-right (hide if 1 veh)] │
└──────────────────────────────────────────────────────────┘
```

```ts
private _renderHeader(): TemplateResult {
  const multiple = this.config.vehicles.length > 1;
  const v = this.config.vehicles[this._active_vehicle_id];
  return html`
    <div class="header">
      <div class="${multiple ? '' : 'hide'}">
        <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
      </div>
      <div class="title">${v.name}</div>
      <div class="${multiple ? '' : 'hide'}">
        <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
      </div>
    </div>
  `;
}

private _prev(): void {
  this._active_vehicle_id = this._active_vehicle_id === 0
    ? this.config.vehicles.length - 1
    : this._active_vehicle_id - 1;
}

private _next(): void {
  this._active_vehicle_id = this._active_vehicle_id === this.config.vehicles.length - 1
    ? 0
    : this._active_vehicle_id + 1;
}
```

### _renderActions()

```ts
private _renderActions(): TemplateResult {
  const tempItems = Array.from({ length: 10 }, (_, idx) => ({
    id: String(idx),
    text: `${idx + 16} ${this.hass.config?.unit_system?.temperature ?? '°C'}`,
  }));
  const v = this.config.vehicles[this._active_vehicle_id];
  return html`
    <div class="actions">
      <div class="ac">
        <sf-wheel
          .items="${tempItems}"
          .selectedId="${String(this._selected_temp_id)}"
          text="${msg('Temperature')}"
          @wheel-change="${this._onTempChange}"
          ?disabled="${this._is_ac_loading}"
        ></sf-wheel>
        <sf-button-card
          icon="mdi:play"
          title="${msg('Air-cond')}"
          text="${msg('Start')}"
          @button-click="${() => this._startAc(v)}"
          ?disabled="${this._is_ac_loading}"
        ></sf-button-card>
        <sf-button-card
          icon="mdi:stop"
          title="${msg('Air-cond')}"
          text="${msg('Stop')}"
          @button-click="${() => this._stopAc(v)}"
          ?disabled="${this._is_ac_loading}"
        ></sf-button-card>
      </div>
    </div>
  `;
}

private _onTempChange(e: CustomEvent): void {
  this._selected_temp_id = Number(e.detail.id);
}

private _startAc(v: SciFiVehicleEntry): void {
  this._is_ac_loading = true;
  const temperature = this._selected_temp_id + 16;
  void this.hass.callService(HASS_RENAULT_SERVICE, HASS_RENAULT_SERVICE_ACTION_START_AC, {
    vehicle: v.id,
    temperature,
  })
  .then(() => this._toast(false, msg('done')))
  .catch((e: Error) => this._toast(true, e.message))
  .finally(() => { this._is_ac_loading = false; });
}

private _stopAc(v: SciFiVehicleEntry): void {
  this._is_ac_loading = true;
  void this.hass.callService(HASS_RENAULT_SERVICE, HASS_RENAULT_SERVICE_ACTION_STOP_AC, {
    vehicle: v.id,
  })
  .then(() => this._toast(false, msg('done')))
  .catch((e: Error) => this._toast(true, e.message))
  .finally(() => { this._is_ac_loading = false; });
}

private _toast(error: boolean, text: string): void {
  const toast = this.shadowRoot?.querySelector('sf-toast') as any;
  if (toast?.addMessage) toast.addMessage(text, error);
}
```

---

## sf-landspeeder.ts — New Component

**File:** `src/components/sf-landspeeder.ts`

**Tag:** `sf-landspeeder`

### Properties

```ts
@property({ type: Object }) vehicle: SciFiVehicleEntry | null = null;
@property({ type: Object }) hass: any = null;
```

### render() — structure

```
.content
├── .image          (SVG top-view ported from main)
├── .top            (location + mileage)
└── .middle         (lock + fuel + battery + charging panels — absolute positioned on SVG)
```

### Derived values (computed in render())

| Variable | Source | Formula |
|---|---|---|
| `isCharging` | `hass.states[v.charging]?.state === 'on'` | boolean |
| `isLocked` | `hass.states[v.lock_status]?.state` (`'locked'` → true, else false) | boolean |
| `rawBattery` | `parseFloat(hass.states[v.battery_level]?.state)` | number or NaN |
| `batteryLevel` | `Math.round(rawBattery / 10) * 10` | 0–100 in steps of 10 |
| `batteryColor` | `rawBattery >= 60 → 'green'`, `rawBattery >= 20 → 'orange'`, `rawBattery < 20 → 'red'` | string |
| `chargeState` | `hass.states[v.charge_state]?.state` | string |
| `plugState` | `hass.states[v.plug_state]?.state` | string |
| `location` | `hass.states[v.location]?.state ?? 'unavailable'` | string |
| `mileage` | `hass.states[v.mileage]?.state` | string |
| `mileageUnit` | `hass.states[v.mileage]?.attributes?.unit_of_measurement ?? 'km'` | string |
| `batteryAutonomy` | `hass.states[v.battery_autonomy]?.state + ' ' + (hass.states[v.battery_autonomy]?.attributes?.unit_of_measurement ?? 'km')` | string |
| `fuelAutonomy` | `hass.states[v.fuel_autonomy]?.state + ' ' + (hass.states[v.fuel_autonomy]?.attributes?.unit_of_measurement ?? 'km')` | string |
| `fuelQuantity` | `hass.states[v.fuel_quantity]?.state + ' ' + (hass.states[v.fuel_quantity]?.attributes?.unit_of_measurement ?? '%')` | string |
| `chargingTime` | `hass.states[v.charging_remaining_time]?.state + ' ' + (hass.states[v.charging_remaining_time]?.attributes?.unit_of_measurement ?? 'min')` | string |
| `locationLastActivity` | `hass.states[v.location_last_activity]?.state` formatted via `new Date(state).toLocaleString()` (or relative time) | string |

### _renderTop() zone

```
.top (flex-row, 2 columns)
├── .component  [mdi:map-marker icon] [location text] [open-in-new btn]
│              └── .sub-info (location_last_activity if present)
└── .component  [mdi:counter icon] [mileage + unit]
```

> [!NOTE]
> The "open in map" button (`mdi:open-in-new`) opens Google Maps / Apple Maps based on device. The GPS coordinates come from `hass.states[v.location]?.attributes?.latitude` + `longitude`. If latitude is null, button click is a no-op.
> Device detection / URL helper:
> ```ts
> const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
> const url = isApple 
>   ? `maps://?q=${latitude},${longitude}` 
>   : `https://maps.google.com/?q=${latitude},${longitude}`;
> window.open(url, '_blank');
> ```

### _renderMiddle() zone

```
.middle (relative, flex: 1)
├── .lock       (absolute, left: calc(50% - 130px), top: min(55%, 230px))
│   └── [lock icon: green locked / orange unlocked] + .h-path + .circle
├── .fuel       (absolute, left: calc(50% - 179px), top: min(70%, 300px))
│   └── .components [mdi:gas-station + fuel_autonomy] [mdi:fuel + fuel_quantity]
├── .battery    (absolute, left: calc(50% + 35px), top: min(70%, 300px)) — only if battery_level present
│   └── .components (color class: green/orange/red) [mdi:ev-station + battery_autonomy] [battery_level_icon + battery_level]
└── .charging   (absolute, top: 10px, left: 50%) — only if charging config present
    └── .components (on/off/error class) [charge_icon + charge_state] [plug_icon + plug_state] [mdi:update + time if charging]
```

**Charging panel state class:**
| Condition | CSS class |
|---|---|
| `charge_state === 'charge_error'` OR `plug_state === 'plug_error'` | `'error'` |
| `isCharging === true` | `'on'` |
| otherwise | `'off'` |

**Battery level icon** (matches main exactly):
```ts
_getBatteryLevelIcon(batteryLevel: number, isCharging: boolean): string {
  if (!isCharging) {
    if (batteryLevel === 100) return 'mdi:battery';
    if (batteryLevel === 0) return 'mdi:battery-outline';
    return `mdi:battery-${batteryLevel}`; // e.g. mdi:battery-60
  } else {
    return batteryLevel <= 10 ? 'mdi:battery-charging-10' : `mdi:battery-charging-${batteryLevel}`;
  }
}
```

### sf-landspeeder CSS (inline in component)

The component CSS is ported 1:1 from 'main:src/components/landspeeder/style.js', with the following adaptations for the TS token system:

| main CSS variable | TS equivalent |
|---|---|
| `--primary-bg-color` | `var(--sf-border)` |
| `--secondary-light-alpha-color` | `var(--sf-bg-secondary)` |
| `--primary-light-color` | `var(--sf-text-primary)` |
| `--primary-green-color` | `#00ff9d` |
| `--primary-green-alpha-color` | `rgba(0, 255, 157, 0.15)` |
| `--primary-error-color` | `#ffd60a` |
| `--primary-error-light-alpha-color` | `rgba(255, 214, 10, 0.15)` |
| `--primary-emergency-color` | `#ff4d6d` |
| `--primary-emergency-alpha-color` | `rgba(255, 77, 109, 0.15)` |
| `--border-width` | `1px` |
| `--border-radius` | `var(--sf-radius, 8px)` |
| `--font-size-small` | `var(--sf-font-size-sm, 12px)` |
| `--font-size-xsmall` | `var(--sf-font-size-xs, 10px)` |
| `--icon-size-xsmall` | `16px` |
| `--speeder-width` | `250px` (unchanged) |
| `--speeder-height` | `493px` (unchanged) |
| `--top-height` | `50px` (unchanged) |

---

## Test Selectors — Frozen Contract

> [!CAUTION]
> The following selectors in `tests/cards/vehicles/sci-fi-vehicles.test.ts` reference the **OLD** flat-stats layout and MUST be **updated** in the new tests:

| Old selector (must update) | Old assertion | New selector in new layout |
|---|---|---|
| `.stat-item` | `length === 0` | N/A — flat stats removed; vehicle name in `.header .title` |
| `.vehicle-card` | `data-charging === 'true'` | N/A — replaced by `sf-landspeeder` property |
| `.battery-bar-fill` | `data-level === 'high'/'mid'/'low'` | N/A — battery color is in `sf-landspeeder` CSS class |
| Text `'Verrouillé'` | via `.sf-state-on` | Moved to `sf-landspeeder` lock panel |

> [!IMPORTANT]
> The following selectors are **preserved** and must remain GREEN:

| Selector | Test | Assertion |
|---|---|---|
| `getConfigElement()` | TC-VEH-0001 | `tagName === 'sci-fi-vehicles-editor'` |
| `getStubConfig().type` | TC-VEH-0002 | `=== 'custom:sci-fi-vehicles'` |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Keeping the flat stats grid** | Keeping `.stat-item`, `.vehicle-stats`, `.vehicle-card` | Full replacement with header + landspeeder + actions layout |
| 2 | **Inlining landspeeder in the card** | Putting SVG image and data panels directly in `vehicles/sci-fi-vehicles.ts` | Separate `components/sf-landspeeder.ts` component (matches main architecture) |
| 3 | **Wrong battery threshold** | Using `>= 60 → high`, `>= 30 → mid` (old TS logic) | Use `Math.round(raw / 10) * 10` then `≥60 → green`, `≥20 → orange`, `<20 → red` (matches main) |
| 4 | **Hardcoding temperature range** | `Array.from({length: 5}, ...)` | Always 10 items (idx 0–9), values 16°C to 25°C, default idx=2 |
| 5 | **Calling the wrong AC service** | `climate.turn_on`, `switch.turn_on` | `renault.ac_start` with `{vehicle: v.id, temperature}` |
| 6 | **Using `sf-button-card-select` for AC** | Dropdown for Start/Stop | Simple `sf-button-card` with `@button-click` (no dropdown needed) |
| 7 | **Absolute GPS values in location** | Showing lat/long numbers | Use `hass.states[v.location]?.state` (HA tracker state: `'home'`, `'not_home'`, zone name) |
| 8 | **Missing null guards on optional sensors** | Crash when `v.battery_level` is undefined | All sensor reads guarded: `if (!v.battery_level) return nothing` |
| 9 | **Removing `sf-toast`** | No user feedback on AC calls | `<sf-toast>` must be present in `renderCard()` template |
| 10 | **Mutating `_active_vehicle_id` in template** | Calling `_next()` / `_prev()` inline in `@click` attribute | Use `@button-click` event from `sf-button` (event-driven, not inline mutation) |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-1201 | Unit | `getConfigElement()` returns correct editor tag | static call | `tagName === 'sci-fi-vehicles-editor'` |
| TC-1202 | Unit | `getStubConfig()` returns correct type | static call | `config.type === 'custom:sci-fi-vehicles'` |
| TC-1203 | Unit | Renders empty without hass | no hass | `shadowRoot.textContent` is empty |
| TC-1204 | Unit | Renders vehicle name in header | `vehicles: [{id:'v1', name:'Tesla'}]` | textContent includes `'Tesla'` |
| TC-1205 | Unit | Prev/next buttons hidden for single vehicle | 1 vehicle | `.hide` class on both button containers |
| TC-1206 | Unit | Prev/next buttons visible for multiple vehicles | 2 vehicles | no `.hide` class on button containers |
| TC-1207 | Unit | `sf-landspeeder` present in shadow DOM | mounted with hass | `querySelector('sf-landspeeder')` not null |
| TC-1208 | Unit | `sf-landspeeder` receives vehicle prop | `vehicles[0]` configured | `landspeeder.vehicle` deep-equals `config.vehicles[0]` |
| TC-1209 | Unit | AC actions section present | mounted with hass | `querySelector('.actions')` not null |
| TC-1210 | Unit | Temperature wheel present in actions | mounted with hass | `querySelector('sf-wheel')` not null |
| TC-1211 | Unit | Start and Stop AC buttons present | mounted with hass | 2 `sf-button-card` elements in `.ac` |
| TC-1212 | Unit | Prev navigation cycles to last vehicle | 2 vehicles, click prev from idx 0 | `.title` textContent changes to second vehicle name |
| TC-1213 | Unit | Next navigation cycles to first vehicle | 2 vehicles, click next from idx 1 | `.title` textContent changes to first vehicle name |
| TC-1214 | Regression | All existing 2 static tests pass | `getConfigElement`, `getStubConfig` | No failures |
| IT-1201 | Integration | Card registers in `customElements` | load card | `customElements.get('sci-fi-vehicles')` returns class |
| IT-1202 | Integration | Card full render: header + landspeeder + actions | mount with full config | All 3 sections present |
| IT-1203 | Integration | `vehicles/styles.ts` imported — no inline `css\`` in `vehicles/sci-fi-vehicles.ts` | grep | 'grep -c "css\`" sci-fi-vehicles.ts' returns 0 |

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| No `hass` | `SciFiBaseCard` guard before `renderCard()` | Returns empty template | Transparent empty card |
| No `vehicles` in config | `this.config.vehicles` empty array or missing | `renderCard()` returns `html\`<div>No vehicles configured</div>\`` | Message shown |
| Sensor entity not found in `hass.states` | `hass.states[entityId]?.state` undefined | Return `nothing` for that panel | Panel simply hidden |
| `_active_vehicle_id` out of bounds | Can't happen: prev/next are bounded to `config.vehicles.length - 1` | — | — |
| AC service call fails | `.catch((e) => this._toast(true, e.message))` | Toast error message shown | User notified |
| GPS latitude null | `_openLocation` checks `gps?.latitude === null` | No-op — button click ignored | No map opened |
| Battery level NaN | `isNaN(parseFloat(...))` | Battery panel hidden (`return nothing`) | No broken display |

---

## Localization — New msg() Keys

The following `msg()` keys are **new** and must be added to `src/locales/locales/fr.ts` and `xliff/fr.xlf`:

| English key (msg()) | French translation |
|---|---|
| `'Temperature'` | Already in fr.ts (stove card) — verify |
| `'Air-cond'` | `'Climatisation'` |
| `'Start'` | `'Démarrer'` |
| `'Stop'` | `'Arrêter'` |
| `'done'` | `'Fait'` |
| `'home'` | `'Maison'` |
| `'not home'` | `'Absent'` |
| `'unavailable'` | `'Indisponible'` |
| `'Not in charge'` | `'Pas en charge'` |
| `'Waiting for planned charge'` | `'Attente charge planifiée'` |
| `'Waiting for current charge'` | `'Attente charge'` |
| `'In progress'` | `'En cours'` |
| `'Ended'` | `'Terminé'` |
| `'Error'` | `'Erreur'` |
| `'Flap opened'` | `'Trappe ouverte'` |
| `'Unplugged'` | `'Débranché'` |
| `'Plugged'` | `'Branché'` |
| `'Waiting for charge'` | `'Attente de charge'` |

> [!IMPORTANT]
> Before adding: run `grep -r "msg('Temperature'" src/` to confirm `'Temperature'` is already present from the stove card. If yes, skip it. All others are likely new. Do NOT modify `src/locales/locales/fr.ts` by hand; always update translations in `xliff/fr.xlf` first and run the compilation.

---

## Deep Links

| Reference | Location |
|---|---|
| Current vehicle card (to replace) | [sci-fi-vehicles.ts](../../src/cards/vehicles/sci-fi-vehicles.ts#L1) |
| Vehicle config types (frozen) | [config.ts L220-L242](../../src/types/config.ts#L220-L242) |
| Main branch card.js (reference) | 'git show main:src/cards/vehicles/card.js' |
| Main branch landspeeder (reference) | 'git show main:src/components/landspeeder/sf-landspeeder.js' |
| Main branch landspeeder style (reference) | 'git show main:src/components/landspeeder/style.js' |
| Main branch SVG top data | 'git show main:src/components/landspeeder/data/top.js' |
| Main branch vehicle constants | 'git show main:src/helpers/entities/vehicle/vehicle_const.js' |
| Stove styles pattern | [stove/styles.ts](../../src/cards/stove/styles.ts#L1) |
| sf-wheel component | [sf-wheel.ts](../../src/components/sf-wheel.ts#L1) |
| sf-button-card component | [sf-button-card.ts](../../src/components/buttons/sf-button-card.ts#L1) |
| sf-button component | [sf-button.ts](../../src/components/buttons/sf-button.ts#L1) |
| Common tokens | [styles/common.ts](../../src/styles/common.ts#L1) |
| Existing vehicle tests | [sci-fi-vehicles.test.ts](../../tests/cards/vehicles/sci-fi-vehicles.test.ts#L1) |
| Stove spec (pattern to follow) | [Spec 11](./11_stove_card_design_update.md#L1) |
