# Spec 13 — Plugs Card Design Update

> Document Type: Implementation
> Covers: Full reconstruction of `sci-fi-plugs` card to match `main` branch layout — single-plug-at-a-time view with header (area icon + name + model/manufacturer), animated plug image, sensor list, power chart (Chart.js), and footer navigation.
> Depends on: [Spec 05](./05_cards.md#sci-fi-plugs), [Spec 03](./03_base_classes.md#L1)
> ADR-005: Zero breaking YAML changes — all config fields in `SciFiPlugDevice` and `SciFiPlugsConfig` frozen; `sensors = Record<entityId, SciFiPlugSensorEntry>` preserved.

---

## Blueprint Coverage

| Feature ID | Description | Spec file | Covers |
|---|---|---|---|
| F-PLG-D01 | Header: area icon + plug name + model/manufacturer subtitle | ✅ This spec § _renderHeader(device) | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1305, TC-PLUGS-U-1306 |
| F-PLG-D02 | Plug image zone: animated EU socket SVG (CSS-only) + status icon overlay + toggle on click | ✅ This spec § _renderImage(isOn, icon, device) | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1307, TC-PLUGS-U-1308 |
| F-PLG-D03 | Sensor list: vertical list of icon + name + value (with LockSensor and SelectSensor variants) | ✅ This spec § _renderSensors(visibleSensors) | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1314 |
| F-PLG-D04 | Power chart: Chart.js bar histogram of the last 24 hours of power history. The window start is a full ISO timestamp exactly 24 h back, never a bare `YYYY-MM-DD` — that reads as midnight yesterday and makes the window 24 to 48 h wide depending on the time of day. | ✅ This spec § Power chart — _loadPowerChart() | tests/cards/plugs/sci-fi-plugs.test.ts (« asks history for a rolling 24-hour window, not midnight yesterday », sans id) |
| F-PLG-D05 | Footer navigation: prev/next arrows + plug selector icons | ✅ This spec § _renderFooter() | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1309, TC-PLUGS-U-1310, TC-PLUGS-U-1311, TC-PLUGS-U-1312, TC-PLUGS-U-1313 |
| F-PLG-D06 | Extract CSS into `styles.ts` (stove/vehicle pattern) | ✅ This spec § styles.ts | tests/cards/plugs/sci-fi-plugs.test.ts :: IT-PLUGS-I-1303 |
| F-PLG-D07 | Toggle plug on/off via `switch.turn_on` / `switch.turn_off` service | ✅ This spec § Toggle action | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1308 |
| F-PLG-D08 | 'plug_const.ts' constants file (ported from main) | ✅ This spec § Constants — plug_const.ts | ⬜ aucun id TC — fichier de constantes, aucun cas déclaré |
| F-PLG-D09 | All existing plugs tests remain GREEN (regression gate) | ✅ This spec § Test Selectors — Frozen Contract | tests/cards/plugs/sci-fi-plugs.test.ts :: TC-PLUGS-U-1315, IT-PLUGS-I-1301, IT-PLUGS-I-1302 |

---

## Assumptions

| ID | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `SciFiPlugDevice` and `SciFiPlugsConfig` config fields are frozen — no new fields needed | Low | SHOW | 'grep -n "SciFiPlugDevice\|SciFiPlugsConfig" src/cards/plugs/config.ts' → defines all fields |
| 2 | Existing CSS selectors `.plug-tile`, `.plug-name`, `.plug-power`, `.sensor-row`, `.plug-btn` in existing tests MUST be **updated** — layout changes completely | Medium | SHOW | 'grep -n "querySelector" tests/cards/plugs/sci-fi-plugs.test.ts' → all 8 tests reference old grid selectors |
| 3 | Chart.js `^4.4.7` is already in `package.json` — no new dependency needed | Low | SHOW | `cat package.json \| grep chart` → `"chart.js": "^4.4.7"` present |
| 4 | The EU socket SVG (`.icon` with 3 circles) is reproduced in pure CSS — no SVG import needed | Low | SHOW | 'git show main:src/cards/plugs/style.js' → all styling is CSS, no `<svg>` tag, no external file |
| 5 | The `Device` helper (area, manufacturer, model from device registry) is NOT yet ported to TS — fallback to HA state attributes | High | TELL | 'ls src/helpers/' → no 'device.ts' or equivalent; `hass.devices[device_id]` is used instead of helper class |
| 6 | `LockSensor` and `SelectSensor` types are NOT yet ported to TS — sensor type dispatch is based on `entityId.split('.')[0]` prefix | High | TELL | 'ls src/helpers/entities/' → no 'sensor.ts' directory in TS project |
| 7 | The power history API call uses 'hass.callApi("GET", "history/period...")' — available on HA's `HomeAssistant` object | Medium | SHOW | 'git show main:src/helpers/entities/plug/plug.js' → `this._hass.callApi(...)` pattern |
| 8 | The animation "courant qui passe" (`.cirle-container .circle` with `@keyframes move`) is pure CSS, portable 1:1 | Low | SHOW | 'git show main:src/cards/plugs/style.js' → full `@keyframes move` block, no JS |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Preserve `SciFiPlugDevice` and `SciFiPlugsConfig` field names (ADR-005); use `sciFiCommonStyles`; export `plugStyles` from `styles.ts`; sensor key = entityId (ADR-005) |
| **Ask first** | Adding new config fields; changing toggle service name/params; altering `getStubConfig()` return shape; adding Chart.js canvas outside `.chart-container` |
| **Never do** | Rename config fields (`device_id`, `entity_id`, `sensors`, `power`, `show`, etc.); mutate `this.config` or `this.hass`; revert to the multi-tile grid layout |

---

## Cross-Spec Contracts

 ### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/plugs/styles.ts` | Lit CSS export | This spec § styles.ts | `plugs/sci-fi-plugs.ts` (import `plugStyles`) |
| `src/cards/plugs/plug_const.ts` | TS constants | This spec § Constants | `plugs/sci-fi-plugs.ts` |
| Updated `sci-fi-plugs` card | Web Component | This spec § Full render | Lovelace via `getConfigElement()` (Spec 05) |

 ### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | Spec 03 § base-card.ts | `src/utils/base-card.ts` |
| `SciFiPlugsConfig`, `SciFiPlugDevice`, `SciFiPlugSensorEntry` | TS interfaces | Spec 05 § sci-fi-plugs | `src/cards/plugs/config.ts` |
| `sf-icon` | Web Component | Spec 04 § sf-icon | `src/components/sf-icon/` |
| `sf-button` | Web Component | Spec 04 § sf-button | `src/components/buttons/sf-button.ts` |

 ### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-plugs>` | HA Lovelace | Plug monitoring card (unchanged tag) |

 ### External Invocations

| Service | Action | Params | When |
|---|---|---|---|
| `switch` | `turn_on` | `{ entity_id: device.entity_id }` | User clicks image/toggle when plug is OFF |
| `switch` | `turn_off` | `{ entity_id: device.entity_id }` | User clicks image/toggle when plug is ON |
| `hass.callApi` | 'GET history/period...' | yesterday + `filter_entity_id=powerSensorId` | Power chart loads |

 ### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `_selected_plug_id` reactive state | Index into `config.devices[]`; prev/next arrows cycle it | This spec § Footer |
| `_chart` instance | `Chart` instance stored for update vs init | This spec § Content — chart |
| `_historyAttempts` | Map of power entity id → history attempt record | [plugs-history-states/spec.md](../plugs-history-states/spec.md) FR-1 |
| Sensor type dispatch | `entityId.split('.')[0]` prefix → `'lock'` \| `'select'` \| default | This spec § Content — sensors |

---

## File Tree

```
src/cards/plugs/
├── src/cards/plugs/sci-fi-plugs.ts             [MODIFY] — full reconstruction: header + image + sensors + chart + footer
├── src/cards/plugs/styles.ts                   [NEW]    — extracted plug CSS (ported from main:src/cards/plugs/style.js)
└── src/cards/plugs/plug_const.ts               [NEW]    — switch service constants (ported from main:src/helpers/entities/plug/plug_const.js)

tests/cards/plugs/
└── tests/cards/plugs/sci-fi-plugs.test.ts      [MODIFY] — rewrite to match new layout selectors; preserve TC-PLUGS-U-1301 (getConfigElement) and TC-PLUGS-U-1302 (getStubConfig)

xliff/
└── xliff/fr.xlf                                [MODIFY] — add new msg() translation keys
```

> [!NOTE]
> No new component files needed (unlike vehicles' `sf-landspeeder`). The plug image zone is rendered inline in 'sci-fi-plugs.ts' using CSS-only (no SVG import). The `Device` helper is replaced by direct `hass.devices[device_id]` access.

---

## Constants — plug_const.ts

**File:** `src/cards/plugs/plug_const.ts`

```ts
// Ported from main:src/helpers/entities/plug/plug_const.js

export const PLUG_STATE_ON = 'on';

export const HASS_PLUG_SERVICE = 'switch';
export const HASS_PLUG_SERVICE_ACTION_TURN_ON = 'turn_on';
export const HASS_PLUG_SERVICE_ACTION_TURN_OFF = 'turn_off';
```

**Chart colors** (ported from main:src/cards/plugs/const.js):

```ts
export const CHART_BG_COLOR = 'rgba(105, 211, 251, 0.5)';
export const CHART_BORDER_COLOR = 'rgb(102, 156, 210)';
```

---

## styles.ts

**File:** `src/cards/plugs/styles.ts`

**Export name:** `plugStyles`

Ported 1:1 from 'main:src/cards/plugs/style.js'. The `main` variables become literals: they are the plugs card's own domain palette, which ADR-017 and ADR-018 keep as bespoke literals in the card's sheet rather than `var(--sf-*)` tokens.

| main CSS variable | TS equivalent |
|---|---|
| `--primary-bg-color` | `rgb(39, 40, 43)` |
| `--primary-bg-alpha-color` | `rgba(39, 40, 43, 0.3)` |
| `--secondary-light-color` | `rgb(102, 156, 210)` |
| `--secondary-light-alpha-color` | `rgba(102, 156, 210, 0.5)` |
| `--secondary-bg-color` | `rgb(55, 61, 69)` |
| `--primary-light-color` | `rgb(105, 211, 251)` |
| `--border-width` | `1px` |
| `--border-radius` | `5px` |
| `--font-size-normal` | `14px` |
| `--font-size-small` | `12px` |
| `--icon-size-small` | `20px` |
| `--icon-size-normal` | `25px` |

```ts
import { css } from 'lit';

export const plugStyles = css`
  :host {
    font-size: var(--sf-font-size-sm, 12px);
    height: 100%;
    width: 100%;
    background-color: black;
  }

  /* ── CONTAINER ─────────────────────────────────── */
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* ── HEADER ─────────────────────────────────────── */
  .header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--sf-border);
    padding: 10px;
    background-color: rgba(39, 40, 43, 0.3);
    column-gap: 10px;
    align-items: center;
    justify-content: center;
    font-size: var(--sf-font-size-base, 14px);
    color: var(--sf-text-secondary);
    min-height: 45px;
  }
  .header sf-icon.on { --icon-color: var(--sf-text-primary); }
  .header sf-icon    { --icon-color: var(--sf-text-secondary); }
  .header .on  { color: var(--sf-text-primary); }
  .header .info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .header .info .sub-title {
    font-size: var(--sf-font-size-sm, 12px);
    color: var(--sf-bg-secondary);
  }

  /* ── FOOTER ─────────────────────────────────────── */
  .footer {
    display: flex;
    flex-direction: row;
    text-align: center;
    border-top: 1px solid var(--sf-border);
    padding: 10px;
    background-color: rgba(39, 40, 43, 0.3);
    column-gap: 5px;
    align-items: center;
    justify-content: center;
  }
  .footer .hide { display: none; }
  .footer .number {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: 10px;
    flex: 1;
  }
  .footer .number > sf-button {
    align-items: center;
    --btn-size: 20px;
    --primary-icon-color: var(--sf-text-primary);
  }
  .footer .number > sf-button.active {
    --btn-size: 28px;
    --primary-icon-color: var(--sf-accent-on, #00ff9d);
  }

  /* ── CONTENT ────────────────────────────────────── */
  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
```

> _(block continued)_

```ts
  .content .msg-container {
    text-align: center;
    min-height: 30px;
    align-content: center;
    color: var(--sf-text-primary);
  }
  .content .info {
    padding: 10px;
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  /* ── IMAGE ZONE ────────────────────────────────── */
  .content .info .image {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 10px 0;
    cursor: pointer;
  }
  .content .info .image .icon-container {
    border: 2px solid var(--sf-bg-secondary);
    padding: 5px;
    display: flex;
    border-radius: var(--sf-radius, 8px);
    position: relative;
  }
  .content .info .image .icon-container .icon {
    width: 70px;
    height: 70px;
    align-content: center;
    position: relative;
    border: 2px solid var(--sf-bg-secondary);
    border-radius: 50%;
  }
  .content .info .image .icon-container .icon .circle {
    position: absolute;
    background-color: var(--sf-bg-secondary);
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .content .info .image .icon-container .icon .circle:first-child  { top: 13px; left: calc(50% - 4px); }
  .content .info .image .icon-container .icon .circle:nth-child(2) { top: calc(50% - 4px); left: 13px; }
  .content .info .image .icon-container .icon .circle:nth-child(3) { top: calc(50% - 4px); right: 13px; }
  .content .info .image .icon-container sf-icon {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .content .info .image .icon-container sf-icon.off { --icon-color: var(--sf-text-secondary); }
  .content .info .image .cirle-container {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--sf-bg-secondary);
  }
  .content .info .image .cirle-container .circle {
    position: absolute;
    left: -5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--sf-accent-on, #00ff9d);
    animation: 3s linear 1s infinite running move;
  }
  .content .info .image .cirle-container.off .circle {
    animation: none;
    display: none;
  }
  @keyframes move {
    0%   { margin-left: 0%; opacity: 1; }
    60%  { opacity: 0.9; }
    70%  { opacity: 0.8; }
    80%  { margin-left: 100%; opacity: 0.75; }
    90%  { margin-left: 100%; opacity: 0.33; }
    100% { margin-left: 100%; opacity: 0; }
```

> _(block continued)_

```ts
  }

  /* ── SENSORS ────────────────────────────────────── */
  .content .info .sensors {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
  .content .info .sensors .sensor {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    min-height: 25px;
    align-items: center;
  }
  .content .info .sensors .sensor sf-dropdown-input { flex: 1; }
  .content .info .sensors .sensor .name {
    flex: 1;
    margin-left: 10px;
    align-content: center;
  }
  .content .info .sensors .sensor .value {
    color: var(--sf-accent-on, #00ff9d);
    text-transform: uppercase;
    align-content: center;
    font-weight: bold;
  }
`;
```

---

## sci-fi-plugs.ts — Full Reconstruction

### Imports

```ts
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import Chart from 'chart.js/auto';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { plugStyles } from './styles.js';
import type { SciFiPlugsConfig, SciFiPlugDevice, SciFiPlugSensorEntry } from './config.js';
import {
  PLUG_STATE_ON,
  HASS_PLUG_SERVICE,
  HASS_PLUG_SERVICE_ACTION_TURN_ON,
  HASS_PLUG_SERVICE_ACTION_TURN_OFF,
  CHART_BG_COLOR,
  CHART_BORDER_COLOR,
} from './plug_const.js';

import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';
import '../../components/buttons/sf-button-card.js';
import '../../components/buttons/sf-button-card-select.js';
import '../../components/sf-toast.js';
import type { ButtonSelectItem } from '../../components/buttons/sf-button-card-select.js';
```

### static override styles

```ts
static override styles = [sciFiCommonStyles, plugStyles];
```

### Reactive state

```ts
declare config: SciFiPlugsConfig;

@state() private _selected_plug_id: number = 0;
@state() private _historyAttempts: Map<string, HistoryAttempt> = new Map();
private _chart: Chart | null = null;
```

> The history attempt record, keyed by power entity id, is specified in [plugs-history-states/spec.md](../plugs-history-states/spec.md) (FR-1..FR-12).

> `_chart` is NOT `@state()` — chart updates are driven imperatively after hass update, not by Lit re-render. `_selected_plug_id` IS `@state()` to trigger re-render on navigation.

### renderCard() — layout structure

```html
<ha-card>
  <div class="container">
    ${this._renderHeader(device)}
    ${this._renderContent(device)}
    ${this._renderFooter()}
  </div>
  <sf-toast></sf-toast>
</ha-card>
```

Guard: if `!this.config.devices?.length` → return `html\`<ha-card></ha-card>\``.

Current device: `const device = this.config.devices[this._selected_plug_id]`.

### _renderHeader(device)

```
┌──────────────────────────────────────────────────────────┐
│ border-bottom: 1px solid var(--sf-border)                │
│ [area icon (on/off class)] [.info: title + sub-title]    │
└──────────────────────────────────────────────────────────┘
```

```ts
private _renderHeader(device: SciFiPlugDevice): TemplateResult {
  const switchState = this.hass.states[device.entity_id];
  const isOn = switchState?.state === PLUG_STATE_ON;
  const name = device.name ?? switchState?.attributes.friendly_name ?? device.entity_id;

  // Device registry lookup (area icon + model/manufacturer)
  const haDevice = (this.hass as any).devices?.[device.device_id];
  const areaId = haDevice?.area_id;
  const area = areaId ? (this.hass as any).areas?.[areaId] : null;
  const areaIcon = area?.icon ?? 'mdi:power-socket-fr';
  const manufacturer = haDevice?.manufacturer ?? '';
  const model = haDevice?.model ?? '';
  const subTitle = [model, manufacturer].filter(Boolean).join(` ${msg('by')} `);

  return html`
    <div class="header">
      <sf-icon icon="${areaIcon}" class="${isOn ? 'on' : ''}"></sf-icon>
      <div class="info">
        <div class="title ${isOn ? 'on' : ''}">${name}</div>
        ${subTitle ? html`<div class="sub-title">${subTitle}</div>` : nothing}
      </div>
    </div>
  `;
}
```

### _renderContent(device)

```
.content
├── .info
│   ├── .image   (icon-container + 2× cirle-container)
│   └── .sensors
├── .msg-container  (empty or "No power data to display")
└── .chart-container
```

```ts
private _renderContent(device: SciFiPlugDevice): TemplateResult {
  const switchState = this.hass.states[device.entity_id];
  const isOn = switchState?.state === PLUG_STATE_ON;
  const icon = isOn
    ? (device.active_icon ?? 'mdi:power-socket-fr')
    : (device.inactive_icon ?? 'sci:power-socket-fr-off');

  // Chart loading is moved to the updated() lifecycle method to ensure DOM is painted.
  const sensorEntries = Object.entries(device.sensors ?? {});
  const visibleSensors = sensorEntries.filter(([, e]) => e.show !== false && !e.power);

  return html`
    <div class="content">
      <div class="info">
        ${this._renderImage(isOn, icon, device)}
        ${this._renderSensors(visibleSensors)}
      </div>
      <div class="msg-container"></div>
      <div class="chart-container"></div>
    </div>
  `;
}

protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
  super.updated(changedProperties);
  
  // Re-load chart when plug changes or card initializes.
  // Note: we don't trigger chart load on every hass update to avoid spamming the history API,
  // we only load when switching plugs.
  if (changedProperties.has('_selected_plug_id') || (!this._chart && changedProperties.has('hass'))) {
    const device = this.config.devices?.[this._selected_plug_id];
    if (!device) return;
    const powerEntry = Object.entries(device.sensors ?? {}).find(([, e]) => e.power === true);
    if (powerEntry) {
      void this._loadPowerChart(device, powerEntry[0]);
    }
  }
}

```

### _renderImage(isOn, icon, device)

```ts
private _renderImage(isOn: boolean, icon: string, device: SciFiPlugDevice): TemplateResult {
  return html`
    <div class="image" @click="${() => this._toggle(device)}">
      <div class="cirle-container ${isOn ? '' : 'off'}">
        <div class="circle"></div>
      </div>
      <div class="icon-container">
        <div class="icon">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
        <sf-icon icon="${icon}" class="${isOn ? 'on' : 'off'}" .connection="${this.hass.connection}"></sf-icon>
      </div>
      <div class="cirle-container ${isOn ? 'on' : 'off'}">
        <div class="circle"></div>
      </div>
    </div>
  `;
}
```

### _renderSensors(visibleSensors)

Sensor type dispatch based on entityId domain prefix:

| Domain prefix | Render |
|---|---|
| `lock` | `<sf-button-card>` toggling the lock (icon + name + value) |
| `select` | `<sf-button-card-select>` dropdown (label + value + options), `button-select` → `select.select_option` |
| default | `<sf-icon>` + `.name` + `.value` (state + unit) |

> [!NOTE]
> The block below shows the dispatch frame and the **default** branch only. The `lock` and `select` branches render the components of the table above; their template lives in `src/cards/plugs/sci-fi-plugs.ts`.

```ts
private _renderSensors(visibleSensors: [string, SciFiPlugSensorEntry][]): TemplateResult {
  if (!visibleSensors.length) return html``;
  return html`
    <div class="sensors">
      ${visibleSensors
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([entityId, entry]) => {
          const sensorState = this.hass.states[entityId];
          if (!sensorState) return nothing;
          const val = sensorState.state;
          const unit = (sensorState.attributes as any)['unit_of_measurement'] as string | undefined;
          const label = entry.name ?? (sensorState.attributes as any).friendly_name ?? entityId;
          const icon = entry.icon ?? 'mdi:information-outline';
          return html`
            <div class="sensor">
              <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
              <div class="name">${label}</div>
              <div class="value">${val}${unit ? ` ${unit}` : ''}</div>
            </div>
          `;
        })}
    </div>
  `;
}
```

### _renderFooter()

```
.footer
├── [prev arrow: hide if 1 plug]
├── .number: [sf-button per device, .active on current]
└── [next arrow: hide if 1 plug]
```

```ts
private _renderFooter(): TemplateResult {
  const multiple = (this.config.devices?.length ?? 0) > 1;
  return html`
    <div class="footer">
      <div class="${multiple ? '' : 'hide'}">
        <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
      </div>
      <div class="number">
        ${this.config.devices?.map((d, i) => {
          const isOn = this.hass.states[d.entity_id]?.state === PLUG_STATE_ON;
          const icon = isOn ? (d.active_icon ?? 'mdi:power-socket-fr') : (d.inactive_icon ?? 'sci:power-socket-fr-off');
          return html`
            <sf-button
              icon="${icon}"
              class="${i === this._selected_plug_id ? 'active' : ''}"
              @button-click="${() => { this._selected_plug_id = i; }}"
            ></sf-button>
          `;
        })}
      </div>
      <div class="${multiple ? '' : 'hide'}">
        <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
      </div>
    </div>
  `;
}

private _clearChart(): void {
  this._chart?.destroy();
  this._chart = null;
}

private _prev = (): void => {
  const len = this.config.devices?.length ?? 0;
  this._clearChart();
  this._selected_plug_id = this._selected_plug_id === 0 ? len - 1 : this._selected_plug_id - 1;
};

private _next = (): void => {
  const len = this.config.devices?.length ?? 0;
  this._clearChart();
  this._selected_plug_id = this._selected_plug_id === len - 1 ? 0 : this._selected_plug_id + 1;
};
```

### Toggle action

```ts
private _toggle(device: SciFiPlugDevice): void {
  if (!device.entity_id || !this.hass.states[device.entity_id]) return;
  const isOn = this.hass.states[device.entity_id]?.state === PLUG_STATE_ON;
  void this.hass.callService(
    HASS_PLUG_SERVICE,
    isOn ? HASS_PLUG_SERVICE_ACTION_TURN_OFF : HASS_PLUG_SERVICE_ACTION_TURN_ON,
    { entity_id: device.entity_id }
  )
    .then(() => this._toast(false, msg('done')))
    .catch((e: Error) => this._toast(true, e.message));
}
```

### Power chart — _loadPowerChart()

Loading, error, empty and loaded states, the 2 s budget, the retry, the per-plug
attempt record and its ownership invariant are specified in
[plugs-history-states/spec.md](../plugs-history-states/spec.md) (FR-1..FR-19).
`updated()` starts the request for a never-attempted key; the section renders
from the selected key's record; `_drawChart(datasets, labels)` keeps its signature.

### _parseHistory / _buildChartDatasets / _buildChartLabels

```ts
private _parseHistory(data: unknown[]): Record<string, number> {
  const res: Record<string, number> = {};
  (data as Array<{ last_changed: string; state: string }>).forEach((el, idx) => {
    if (idx === 0) return;
    const d = new Date(el.last_changed);
    d.setMinutes(Math.round(d.getMinutes()));
    d.setSeconds(0); d.setMilliseconds(0);
    const value = isNaN(parseFloat(el.state)) ? 0 : parseFloat(parseFloat(el.state).toFixed(2));
    const key = d.toISOString();
    if (!(key in res) || value > res[key]) res[key] = value;
  });
  return res;
}

private _buildChartDatasets(data: number[]): unknown[] {
  return [{ data, fill: true, backgroundColor: CHART_BG_COLOR, borderColor: CHART_BORDER_COLOR, tension: 0.1, borderWidth: 2, borderRadius: 5 }];
}

private _buildChartLabels(keys: string[]): string[] {
  return keys.map(k => {
    const d = new Date(k);
    if (d.getHours() === 0 && d.getMinutes() === 0) return d.toLocaleDateString();
    return d.toLocaleDateString() + '-' + d.toLocaleTimeString([], { timeStyle: 'short' });
  });
}

private _getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0]!;
}
```

### _drawChart / _updateChart

```ts
private _drawChart(datasets: unknown[], labels: string[]): void {
  const container = this.shadowRoot?.querySelector('.chart-container');
  if (!container) return;
  // Guard: reuse existing canvas rather than stacking new ones on each hass update
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  this._chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: datasets as any },
    options: {
      animation: {
        delay: (context: any) => {
          if (context.type === 'data' && context.mode === 'default') {
            return context.dataIndex * 10 + context.datasetIndex * 10;
          }
          return 0;
        },
      },
      scales: {
        y: { display: false, suggestedMin: 0 },
        x: {
          ticks: {
            align: 'start',
            callback: function (this: any, val: any, index: number) {
              return index % Math.floor(this.max / 3) === 0 ? this.getLabelForValue(val) : null;
            },
            color: 'rgb(102, 156, 210)',
            font: { size: 10 },
          },
        },
      },
      plugins: { title: { display: false }, legend: { display: false } },
    },
  });
}

private _updateChart(datasets: unknown[], labels: string[]): void {
  if (!this._chart) return;
  this._chart.data = { labels, datasets: datasets as any };
  this._chart.update();
}
```

### _toast utility

```ts
private _toast(error: boolean, text: string): void {
  const toast = this.shadowRoot?.querySelector('sf-toast') as any;
  if (toast?.addMessage) toast.addMessage(text, error);
}
```

---

## Test Selectors — Frozen Contract

> [!CAUTION]
> The following selectors in `tests/cards/plugs/sci-fi-plugs.test.ts` reference the **OLD** multi-tile grid layout and MUST be **updated** in the new tests:

| Old selector (must update) | Old assertion | New selector in new layout |
|---|---|---|
| `.plug-tile` | `querySelectorAll(...).length === 2` | N/A — one plug at a time; `.container` present |
| `.plug-tile[data-on="true"]` | `getAttribute('data-on') === 'true'` | N/A — plug ON/OFF expressed via `.header .on` class |
| `.plug-name` | `textContent === 'TV Plug'` | `.header .title` |
| `.plug-power` | `textContent includes '45.2 W'` | `.sensors .sensor .value` (power sensor row) |
| `.sensor-row` | `querySelectorAll` | `.sensors .sensor` |
| `.plug-btn` | `textContent === 'Éteindre'` | N/A — toggle is click on `.image` |
| `header_message` display | `textContent includes 'Smart Plugs'` | N/A — header_message removed; plug name in `.header .title` |

> [!IMPORTANT]
> The following selectors are **preserved** and must remain GREEN:

| Selector | Test | Assertion |
|---|---|---|
| `getConfigElement()` | TC-PLG-0001 | `tagName === 'sci-fi-plugs-editor'` |
| `getStubConfig().type` | TC-PLG-0002 | `=== 'custom:sci-fi-plugs'` |

> [!NOTE]
> CSS class `.cirle-container` (one 'r', no second 'c') is preserved 1:1 from `main` branch. Use this exact spelling in test selectors — NOT `.circle-container`.

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Keeping the multi-tile grid** | Keeping `.plug-tile`, `.plugs-grid`, `.plug-btn` layout | Full replacement: single-plug view with header + content + footer |
| 2 | **Displaying all plugs simultaneously** | `repeat(devices, ...)` rendering all tiles | One plug at a time, indexed by `_selected_plug_id` |
| 3 | **Using a text button for toggle** | `<button class="plug-btn">Éteindre</button>` | Click on `.image` zone triggers `_toggle(device)` |
| 4 | **Power sensor in `.plug-power` div** | Large font power display above sensors | Power sensor integrated into `.sensors` list (with `entry.power === true`) |
| 5 | **`header_message` config field** | Showing `this.config.header_message` in header | Header shows device name + area icon from device registry — `header_message` is ignored |
| 6 | **Chart.js outside `.chart-container`** | Appending canvas to shadowRoot directly | Canvas always appended inside `.chart-container` div |
| 7 | **Caching `_chart` across plug changes** | Reusing same Chart instance when switching plug | `this._chart.destroy()` then `this._chart = null` on plug switch. The `<canvas>` is deliberately REUSED, not emptied: `destroy()` releases Chart.js's hold on it, and clearing `.chart-container.innerHTML` would drop the element only to recreate an identical one on the next draw. Emptying it is what this row used to prescribe; `_drawChart` reuses the canvas instead, and that is correct. |
| 8 | **Missing null guards on hass.states** | `this.hass.states[entityId].state` (no optional chain) | Always `this.hass.states[entityId]?.state` |
| 9 | **Removing `sf-toast`** | No user feedback on toggle/chart errors | `<sf-toast>` must be present in `renderCard()` template |
| 10 | **Sensor sorted by insertion order** | Random order depending on config YAML | Sensors sorted by `entityId.localeCompare()` (matches main) |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-PLUGS-U-1301 | Unit | `getConfigElement()` returns correct editor tag | static call | `tagName === 'sci-fi-plugs-editor'` |
| TC-PLUGS-U-1302 | Unit | `getStubConfig()` returns correct type | static call | `config.type === 'custom:sci-fi-plugs'` |
| TC-PLUGS-U-1303 | Unit | Renders gracefully without hass | no hass set | `shadowRoot.textContent` is empty |
| TC-PLUGS-U-1304 | Unit | Renders empty when no devices | `{ type, devices: [] }` + hass | no `.container` or empty inner |
| TC-PLUGS-U-1305 | Unit | Header shows plug name | device with `name: 'TV Plug'` | `.header .title` textContent includes `'TV Plug'` |
| TC-PLUGS-U-1306 | Unit | Header shows area icon based on state | plug ON | `sf-icon` has class `'on'`; plug OFF → no class `'on'` |
| TC-PLUGS-U-1307 | Unit | Image zone present | mounted with hass | `.image` present in `.info` |
| TC-PLUGS-U-1308 | Unit | Click on image triggers toggle call | plug ON, click `.image` | `callService` called with `'switch'`, `'turn_off'`, `{ entity_id }` |
| TC-PLUGS-U-1309 | Unit | Footer hidden prev/next for single plug | 1 device | both nav containers have class `.hide` |
| TC-PLUGS-U-1310 | Unit | Footer shows prev/next for multiple plugs | 2 devices | both nav containers have no `.hide` |
| TC-PLUGS-U-1311 | Unit | Footer selector buttons count matches devices | 3 devices | 3 `sf-button` in `.footer .number` |
| TC-PLUGS-U-1312 | Unit | Prev navigation wraps around | 2 plugs at idx 0, click prev | `_selected_plug_id` becomes 1 |
| TC-PLUGS-U-1313 | Unit | Next navigation wraps around | 2 plugs at idx 1, click next | `_selected_plug_id` becomes 0 |
| TC-PLUGS-U-1314 | Unit | Sensor list rendered for visible sensors | device with `show: true` sensor | `.sensors .sensor` present |
| TC-PLUGS-U-1315 | Regression | All 2 static tests pass | `getConfigElement`, `getStubConfig` | No failures |
| IT-PLUGS-I-1301 | Integration | Card registers in `customElements` | load card | `customElements.get('sci-fi-plugs')` returns class |
| IT-PLUGS-I-1302 | Integration | Card full render: header + content + footer | mount with full config | `.header`, `.content`, `.footer` all present |
| IT-PLUGS-I-1303 | Integration | `plugs/styles.ts` imported — no inline `css\`` in 'sci-fi-plugs.ts' | grep | 'grep -c "css\'" sci-fi-plugs.ts` returns 0 |

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| No `hass` | `SciFiBaseCard` guard before `renderCard()` | Returns empty template | Transparent empty card |
| No `devices` in config | `this.config.devices?.length === 0` | Return `html\`<ha-card></ha-card>\`` | Empty card shown |
| `entity_id` not in `hass.states` | `this.hass.states[device.entity_id]?.state` undefined | `isOn = false`, icon = inactive default | Plug shown as OFF |
| Sensor entityId not in `hass.states` | `this.hass.states[entityId]` undefined | `return nothing` for that sensor row | Sensor row hidden |
| Power chart API call fails or exceeds 2 s | attempt `'error'` ([plugs-history-states/spec.md](../plugs-history-states/spec.md) FR-5, FR-6) | `.history-error` with Retry, no toast | Chart not displayed |
| No power data in history | `Object.keys(history).length === 0` | `msg-container` shows `msg('No power data to display')`; chart hidden | Graceful empty state |
| `_selected_plug_id` out of bounds | Can't happen: prev/next are bounded to `config.devices.length - 1` | — | — |
| Device registry lookup fails | `hass.devices?.[device_id]` undefined | Area icon = `'mdi:power-socket-fr'`; subtitle hidden | Fallback icon shown |
| Chart canvas not found | `this.shadowRoot?.querySelector('.chart-container')` null | Return early without crash | No chart rendered |

---

## Localization — New msg() Keys

| English key (msg()) | French translation |
|---|---|
| `'by'` | `[NEW]` — French: `'par'` — run 'grep "'by'" xliff/fr.xlf'; add if absent |
| `'done'` | Already present from vehicle card — verify |
| `'No power data to display'` | `'Aucune donnée de puissance à afficher'` |
| `'Power'` | `'Puissance'` (used in chart tooltip title) |
| `'Loading history…'` | `'Chargement de l'historique…'` |
| `'Power history unavailable'` | `'Historique de puissance indisponible'` |
| `'Retry'` | `'Réessayer'` |

> [!IMPORTANT]
> Run 'grep -r "msg('by'\|msg('done'\|msg('No power" src/' before adding. Only add keys that are genuinely missing. Do NOT modify `src/locales/locales/fr.js` by hand — update `xliff/fr.xlf` first, then run `npm run localize-build`.

---

## Deep Links

| Reference | Location |
|---|---|
| Current plugs card (to replace) | [sci-fi-plugs.ts](../../src/cards/plugs/sci-fi-plugs.ts#L1) |
| Plugs config types (frozen) | [config.ts](../../src/cards/plugs/config.ts#L1) |
| Main branch card.js (reference) | 'git show main:src/cards/plugs/card.js' |
| Main branch style.js (reference) | 'git show main:src/cards/plugs/style.js' |
| Main branch plug_const.js | 'git show main:src/helpers/entities/plug/plug_const.js' |
| Vehicle card (navigation pattern) | [sci-fi-vehicles.ts](../../src/cards/vehicles/sci-fi-vehicles.ts#L1) |
| Vehicle styles pattern | [vehicles/styles.ts](../../src/cards/vehicles/styles.ts#L1) |
| Stove styles pattern | [stove/styles.ts](../../src/cards/stove/styles.ts#L1) |
| sf-button component | [sf-button.ts](../../src/components/buttons/sf-button.ts#L1) |
| sf-icon component | [sf-icon/](../../src/components/sf-icon/#L1) |
| Common tokens | [styles/common.ts](../../src/styles/common.ts#L1) |
| Existing plugs tests | [sci-fi-plugs.test.ts](../../tests/cards/plugs/sci-fi-plugs.test.ts#L1) |
| Vehicle spec (navigation pattern) | [Spec 12](./vehicles.md#L1) |
| Stove spec (styles.ts pattern) | [Spec 11](./11_stove_card_design_update.md#L1) |
| Screenshots (main UX) | 'git show main:screenshot/plug_1.jpeg' |


## Adversarial Fixes: Edge Cases & Error States
1. **Unavailable State Handling**: The card MUST disable interaction buttons and render an 'Offline' overlay or distinct visual state when `entity.state === 'unavailable' || entity.state === 'unknown'`.
2. **API Timeout (Power History)**: The card MUST render a loading state and an error state with Retry for the chart section when the 'history/period' API call fails or takes ≥ 2 seconds — specified by the per-plug `_historyAttempts` record of [plugs-history-states/spec.md](../plugs-history-states/spec.md) (FR-1..FR-12).
