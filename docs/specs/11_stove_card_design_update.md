# Spec 11 — Stove Card Design Update

> Document Type: Implementation
> Covers: Design alignment of `sci-fi-stove` card with `sci-fi-lights` and `sci-fi-climates` patterns
> Depends on: [Spec 05](./05_cards.md#sci-fi-stove), [Spec 03](./03_base_classes.md#L1)
> ADR-005: Zero breaking YAML changes — all config fields frozen, all CSS selectors used by tests frozen

---

## Blueprint Coverage

| Feature ID | Description | Spec file |
|---|---|---|
| F-STOVE-D01 | Structured header (border-top + bottom, icon + name + state) | ✅ This spec § Header |
| F-STOVE-D02 | Conditional state coloring (orange ON, grey OFF) in header | ✅ This spec § Header |
| F-STOVE-D03 | Extract CSS into `styles.ts` (climate pattern) | ✅ This spec § styles.ts |
| F-STOVE-D04 | `ha-card` background `rgba(39,40,43,0.3)` (light/climate pattern) | ✅ This spec § styles.ts |
| F-STOVE-D05 | Sensor grid tiles — refined tokens, preserved CSS selectors | ✅ This spec § Sensor Grid |
| F-STOVE-D06 | Pellet bar and storage counter tiles — preserved classes + refined colors | ✅ This spec § Special Tiles |
| F-STOVE-D07 | All existing tests remain GREEN (no CSS selector changes that break tests) | ✅ This spec § Test Selectors |

---

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The `sci:stove-heat` and `sci:stove-off` icons are already registered in the custom icon set | Low | SHOW | `grep 'sci:stove-heat' src/cards/stove/sci-fi-stove.ts` → found |
| 2 | CSS selectors `.bar-fill.pellet`, `.bar-fill.storage`, `.sensor-tile`, `.sensor-tile.warn` MUST be preserved — 4 tests depend on them | Low | SHOW | `npm test` → existing stove tests pass |
| 3 | `sciFiCommonStyles` from `src/styles/common.ts` provides all `--sf-*` tokens used in the new styles | Low | SHOW | `grep '--sf-' src/styles/common.ts` → tokens present |
| 4 | The header uses `staveState.attributes.friendly_name` as the name (already in prod) | Low | SHOW | `grep 'friendly_name' src/cards/stove/sci-fi-stove.ts` → usage found |
| 5 | The stove is ON when `stoveState.state !== 'off' && stoveState.state !== 'unavailable'` | Low | SHOW | `grep '!== "off"' src/cards/stove/sci-fi-stove.ts` → logic found |

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Preserve all existing CSS selectors used by tests (`.bar-fill.pellet`, `.bar-fill.storage`, `.sensor-tile`, `.sensor-tile.warn`, `.stove-status`); use `sciFiCommonStyles` from `src/styles/common.ts`; import `stoveStyles` from the new `styles.ts` file |
| **Ask first** | Adding new config fields not in ADR-005; changing the `sf-icon` icon names (`sci:stove-heat`, `sci:stove-off`); altering the `_buildSensorTiles()` return shape |
| **Never do** | Remove or rename `.bar-fill.pellet`, `.bar-fill.storage`, `.sensor-tile`, `.sensor-tile.warn`, `.stove-status` CSS classes; mutate `this.config`; change the `entity` field name to `entity_id`; import Chart.js |

---

## Cross-Spec Contracts

### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/stove/styles.ts` | Lit CSS export | This spec § styles.ts | `sci-fi-stove.ts` (import `stoveStyles`) |
| Updated `sci-fi-stove` card | Web Component | This spec § Full render | Lovelace via `getConfigElement()` (Spec 05) |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | Spec 03 § styles/common.ts | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | Spec 03 § base-card.ts | `src/utils/base-card.ts` |
| `SciFiStoveConfig`, `SciFiStoveSensors` | TS interfaces | Spec 05 § sci-fi-stove | `src/types/config.ts` |
| `sf-icon` | Web Component | Spec 04 § sf-icon | `src/components/sf-icon/` |

### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-stove>` | HA Lovelace | Stove monitoring card (unchanged tag) |

### External Invocations

N/A — This spec invokes no external interfaces. All data comes from `this.hass.states`.

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `--sf-border` token | Used in styles.ts header borders | Spec 03 § styles/common.ts |
| `ha-card` background `rgba(39,40,43,0.3)` | Applied in styles.ts | Spec 05 (climate pattern), sci-fi-lights.ts |

---

## File Tree

```
src/cards/stove/
├── sci-fi-stove.ts             [MODIFY] — import stoveStyles, redesign renderCard(); wheel .selectedId property binding + Math.round()
└── styles.ts                   [NEW]    — extracted stove CSS; header padding 5px; amber rgb(250,146,29); absolute px font-sizes

src/components/
├── sf-stove-image.ts           [NEW]    — SVG stove illustration ported 1:1 from main branch
├── sf-wheel.ts                 [MODIFY] — align-items:center on .core/.slider; min-height:24px; fallback selected item; fix circular CSS var
├── sf-stack-bar.ts             [NEW]    — stack bar component ported from main
└── buttons/
    ├── sf-button.ts            [MODIFY] — display:block on :host for centering
    └── sf-button-card.ts       [MODIFY] — justify-content:center
```

> [!NOTE]
> `sf-stove-image.ts`, `sf-stack-bar.ts`, and `sf-circle-progress-bar.ts` are new files not in the original spec — they were extracted from main branch JS components as part of the TS port.

---

## Post-Spec Corrections (divergences fixed after initial implementation)

> These corrections were applied during the polish phase. They are documented here to preserve reproducibility.

| ID | File | Correction | Root Cause |
|----|------|------------|------------|
| C01 | `sf-stove-image.ts` | `_getCommons()` replaced with exact main SVG (body rect, right gradient strip, horizontal curves, wood grain paths) | Simplified stub didn't match main branch visual |
| C02 | `styles.ts` | Header `padding: 10px → 5px` | User correction |
| C03 | `styles.ts` | Amber color `#ffd60a → rgb(250, 146, 29)` everywhere | User-specified exact main branch color |
| C04 | `styles.ts` | All `0.75rem` fallbacks → `12px` absolute | HA root font-size 24px → `0.75rem = 18px` not 12px |
| C05 | `sf-wheel.ts` | `.core { align-items: center }` added | Arrows left-aligned in flex column without explicit centering |
| C06 | `sf-button.ts` | `:host { display: block }` added | Custom element default `inline` prevented `margin:auto` centering |
| C07 | `sf-button-card.ts` | `.btn { justify-content: center }` | `justify-content: left` was non-standard and misaligned content |
| C08 | `sf-wheel.ts` | Fallback: show first item if `selectedId` matches nothing | All items `.hide` → slider collapses → temperature invisible |
| C09 | `sf-wheel.ts` | Remove circular CSS var `--item-font-size: var(--item-font-size, …)` | Browser ignores circular self-reference → inherited 18px from HA body |
| C10 | `sci-fi-stove.ts` | Wheel `selected-id` → `.selectedId` property binding + `Math.round()` | Attribute string vs property; float temps (20.5) didn't match integer item IDs |
| C11 | `styles.ts` | Power cell icons `--icon-color: var(--primary-light-color, #6ecbf5)` | `sf-icon` uses `currentColor` → inherited grey from label color |

---

## Header

### Design Specification

The header follows the same pattern as `sci-fi-climates` and `sci-fi-lights`:

```
┌─────────────────────────────────────────────────────────────┐
│ border-top: 1px solid var(--sf-border)                      │
│ [sf-icon stove-heat/off]  [friendly_name]  [state text]     │
│ border-bottom: 1px solid var(--sf-border)                   │
└─────────────────────────────────────────────────────────────┘
```

**HTML structure:**
```html
<div class="header">
  <div class="header-icon">
    <sf-icon .icon="${isOn ? 'sci:stove-heat' : 'sci:stove-off'}" .connection="${this.hass.connection}"></sf-icon>
  </div>
  <div class="header-info">
    <div class="stove-name">${stoveState.attributes.friendly_name ?? 'Poêle'}</div>
    <div class="stove-status ${isOn ? 'sf-state-on' : 'sf-state-off'}">${stoveState.state}</div>
  </div>
</div>
```

**CSS classes (preserved from tests):**
- `.stove-status` — the state text line (already tested in `sci-fi-stove.test.ts` L72)
- `.stove-status.sf-state-on` — orange color when ON
- `.stove-status.sf-state-off` — dim color when OFF (uses `--sf-accent-off` token)

**State coloring:**
| State | CSS class | Color |
|---|---|---|
| ON (heating / cool / heat / any non-off) | `.sf-state-on` | `var(--sf-accent-on)` initially, override to stove orange `#ff6b35` |
| OFF | `.sf-state-off` | `var(--sf-accent-off)` = `rgba(224,232,255,0.25)` |
| unavailable | `.sf-state-off` | same dim color |

> [!NOTE]
> `.stove-status.sf-state-on` color is overridden in `styles.ts` to `#ff6b35` (warm fire orange) to match the existing brand color already present in the current card.

**Icon sizing:**
```css
.header-icon sf-icon {
  --icon-width: var(--sf-icon-size-md, 28px);
  --icon-height: var(--sf-icon-size-md, 28px);
}
```

---

## styles.ts

**File:** `src/cards/stove/styles.ts`

**Export name:** `stoveStyles` (matching the `climateStyles` naming pattern from `src/cards/climates/styles.ts`)

```ts
import { css } from 'lit';

export const stoveStyles = css`
  :host {
    font-size: var(--sf-font-size-sm, 0.75rem);
    height: 100%;
    width: 100%;
    background-color: rgba(39, 40, 43, 0.3);
  }

  ha-card {
    background: rgba(39, 40, 43, 0.3) !important;
    border: none !important;
    height: 100%;
    width: 100%;
    display: block;
    box-sizing: border-box;
  }

  /* ─── HEADER ─────────────────────────────────────────── */
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--sf-spacing-sm, 8px);
    border-top: 1px solid var(--sf-border);
    border-bottom: 1px solid var(--sf-border);
    padding: 8px 12px;
    background-color: transparent;
  }
  .header-icon sf-icon {
    --icon-width: 28px;
    --icon-height: 28px;
    --icon-color: var(--sf-primary);
    display: block;
  }
  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  .stove-name {
    font-size: var(--sf-font-size-base, 0.875rem);
    font-weight: 600;
    color: var(--sf-text-primary);
  }
  /* .stove-status preserved — tests depend on this class */
  .stove-status {
    font-size: var(--sf-font-size-sm, 0.75rem);
  }
  .stove-status.sf-state-on {
    color: #ff6b35;
    text-shadow: 0 0 4px #ff6b35;
  }
  .stove-status.sf-state-off {
    color: var(--sf-accent-off);
  }

  /* ─── CONTAINER ──────────────────────────────────────── */
  .container {
    padding: var(--sf-spacing-sm, 8px) var(--sf-spacing-md, 16px);
  }
`;
```

**Part 2: Grid and Progress Bars**

```ts
export const stoveStylesPart2 = css`
  /* ─── SENSOR GRID ────────────────────────────────────── */
  /* .sensors-grid preserved — no tests depend on this class but kept for clarity */
  .sensors-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sf-spacing-sm, 8px);
    margin-top: var(--sf-spacing-sm, 8px);
  }

  /* .sensor-tile preserved — tests depend on this class */
  .sensor-tile {
    background: var(--sf-bg-secondary);
    border: 1px solid var(--sf-border);
    border-radius: var(--sf-radius-sm, 6px);
    padding: var(--sf-spacing-sm, 8px);
    text-align: center;
    transition: border-color 0.2s ease;
  }

  /* .sensor-tile.warn preserved — tests depend on this class */
  .sensor-tile.warn {
    border-color: #ff6b35;
    box-shadow: 0 0 6px rgba(255, 107, 53, 0.3);
  }

  .sensor-value {
    font-size: var(--sf-font-size-xl, 1.25rem);
    font-weight: 700;
    color: var(--sf-primary);
    text-shadow: 0 0 4px var(--sf-primary);
  }

  .sensor-label {
    font-size: var(--sf-font-size-sm, 0.75rem);
    color: var(--sf-text-secondary);
    margin-top: 2px;
  }

  /* ─── PROGRESS BARS ──────────────────────────────────── */
  .bar-bg {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
    margin-top: 6px;
  }

  /* .bar-fill.pellet preserved — tests depend on this class */
  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width var(--sf-transition-base, 250ms);
  }

  /* .bar-fill.pellet preserved */
  .bar-fill.pellet {
    background: linear-gradient(90deg, #ff6b35, #ffd60a);
  }

  /* .bar-fill.storage preserved */
  .bar-fill.storage {
    background: linear-gradient(90deg, #669cd2, #00ff9d);
  }

  /* ─── RESPONSIVE ─────────────────────────────────────── */
  @container sf-card (max-width: 599px) {
    .sensors-grid { grid-template-columns: repeat(2, 1fr); }
    .container { padding: var(--sf-spacing-sm, 8px); }
  }
  @container sf-card (min-width: 600px) {
    .sensors-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;
```

> [!IMPORTANT]
> The following CSS classes MUST remain unchanged (tests depend on their exact names):
> - `.sensor-tile` — used in `querySelectorAll('.sensor-tile')` → `expect(tiles.length).to.equal(0)`
> - `.sensor-tile.warn` — used in `querySelector('.sensor-tile.warn')` → null/not-null assertions
> - `.bar-fill.pellet` — used in `querySelector('.bar-fill.pellet')` → style.width check
> - `.bar-fill.storage` — used in `querySelector('.bar-fill.storage')` → null check
> - `.stove-status` — text content includes `'heating'`/`'off'` state

---

## sci-fi-stove.ts changes

### Imports

```ts
// REMOVE the inline css`` block from static override styles
// ADD:
import { stoveStyles, stoveStylesPart2 } from './styles.js';
```

### static override styles

```ts
static override styles = [sciFiCommonStyles, stoveStyles, stoveStylesPart2];
```

> [!IMPORTANT]
> The `sciFiCommonStyles` MUST remain as the first entry. It provides `--sf-*` tokens, `ha-card` base styles, `.sf-state-on`, `.sf-state-off` classes, and the container query setup (`container-type: inline-size`). `stoveStyles` overrides specific properties on top.

### renderCard() — new HTML structure

```html
<ha-card>
  ${this.config.header_message
    ? html`<div class="sf-header">${this.config.header_message}</div>`
    : ''}
  <div class="header">
    <div class="header-icon">
      <sf-icon
        .icon="${isOn ? 'sci:stove-heat' : 'sci:stove-off'}"
        .connection="${this.hass.connection}"
      ></sf-icon>
    </div>
    <div class="header-info">
      <div class="stove-name">
        ${stoveState.attributes.friendly_name ?? 'Poêle'}
      </div>
      <div class="stove-status ${isOn ? 'sf-state-on' : 'sf-state-off'}">
        ${stoveState.state}
      </div>
    </div>
  </div>

  <div class="container">
    <div class="sensors-grid">
      ${tiles.map(t =>
        t.value !== null && t.value !== undefined
          ? this._renderSensorTile(t)
          : ''
      )}
      ${this._renderPelletBar(sensors)}
      ${this._renderStorageCounter()}
    </div>
  </div>
</ha-card>
```

**Key changes vs current:**
1. The `sf-icon` moves from inside `.stove-main` (removed) into the new `.header > .header-icon` block.
2. The friendly name + state text move into `.header > .header-info`.
3. `.stove-main` div is removed (replaced by `.header`).
4. `.sensors-grid` is now inside `.container` (no change in nesting level, only the outer wrapper changes).
5. `_renderSensorTile`, `_renderPelletBar`, `_renderStorageCounter` are **unchanged** — they use the preserved CSS classes.

### _buildSensorTiles() — unchanged

The method signature and return value are preserved exactly. No modifications.

### _renderSensorTile() — unchanged

```ts
private _renderSensorTile(tile: SensorTile): TemplateResult {
  return html`
    <div class="sensor-tile">
      <div class="sensor-value">${tile.value}${tile.unit ? ` ${tile.unit}` : ''}</div>
      <div class="sensor-label">${tile.label}</div>
    </div>
  `;
}
```

No changes. CSS classes `.sensor-tile`, `.sensor-value`, `.sensor-label` preserved.

### _renderPelletBar() — unchanged

No changes. CSS classes `.sensor-tile`, `.sensor-tile.warn`, `.bar-bg`, `.bar-fill.pellet` preserved.

### _renderStorageCounter() — unchanged

No changes. CSS classes `.sensor-tile`, `.sensor-tile.warn`, `.bar-bg`, `.bar-fill.storage` preserved.

---

## Test Selectors — Frozen Contract

> [!CAUTION]
> The following selectors are used in `tests/cards/stove/sci-fi-stove.test.ts` and MUST NOT be changed.

| Selector | Test line | Assertion |
|---|---|---|
| `.bar-fill.pellet` | L80 | `barFill.style.width === '75%'` |
| `sf-icon` (first) | L84 | `.icon === 'sci:stove-heat'` when ON |
| `sf-icon` (first) | L112 | `.icon === 'sci:stove-off'` when OFF |
| `.sensor-tile` | L116 | `tiles.length === 0` when all sensors missing |
| `.sensor-tile.warn` | L145 | not null when `pct < threshold` |
| text content | L71 | includes `'Poêle Salon'` (friendly_name) |
| text content | L72 | includes `'heating'` (state) |
| text content | L75 | includes `'1500 W'` |
| text content | L76 | includes `'120°'` |
| text content | L77 | includes `'75%'` |
| text content | L147 | includes `'2 / 10'` |
| `.bar-fill.storage` | L175 | `null` when no maximum |

> [!NOTE]
> The test at L71 checks `textContent` for `'Stove Status'` (from `header_message`). This continues to work because the `.sf-header` div is still rendered when `config.header_message` is set.

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Removing preserved CSS selectors** | Deleting `.sensor-tile`, `.bar-fill.pellet`, `.bar-fill.storage`, `.sensor-tile.warn` | Keep these exact class names — 8 test assertions depend on them |
| 2 | **Moving `sf-icon` inside the sensors grid** | Rendering the stove icon as a sensor tile | The icon belongs in `.header > .header-icon` |
| 3 | **Inline CSS in `sci-fi-stove.ts`** | Re-adding `css\`...\`` block inside the card file | All card CSS goes in `styles.ts` |
| 4 | **Hardcoding token values** | `color: #00d2ff` directly | Use `var(--sf-primary)` from `sciFiCommonStyles` |
| 5 | **Changing the icon binding to attribute** | `icon="${...}"` instead of `.icon="${...}"` | Must use Lit property binding `.icon=` (ADR in `architecture.md` § sf-icon Binding Rule) |
| 6 | **Duplicating `ha-card` background** | Setting background in both `sciFiCommonStyles` and `stoveStyles` without `!important` | Use `!important` in `stoveStyles` override (matches `sci-fi-lights.ts` pattern) |
| 7 | **Breaking the sensor tile 2×N grid** | Changing to `repeat(auto-fill, minmax(120px, 1fr))` without responsive constraint | Default to 2 columns on mobile, 3 on wider; keeps compact look |
| 8 | **Mutating config** | `this.config.entity = '...'` | Always immutable — read-only access only |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-1101 | Unit | Header renders `sf-icon` with `sci:stove-heat` when ON | `state: 'heating'` | `sf-icon.icon === 'sci:stove-heat'` |
| TC-1102 | Unit | Header renders `sf-icon` with `sci:stove-off` when OFF | `state: 'off'` | `sf-icon.icon === 'sci:stove-off'` |
| TC-1103 | Unit | Header shows `stoveStatus` class `sf-state-on` when heating | `state: 'heating'` | `.stove-status.sf-state-on` present |
| TC-1104 | Unit | Header shows `stoveStatus` class `sf-state-off` when off | `state: 'off'` | `.stove-status.sf-state-off` present |
| TC-1105 | Unit | `friendly_name` appears in header info | `attributes.friendly_name: 'Poêle Salon'` | textContent includes `'Poêle Salon'` |
| TC-1106 | Unit | `.sensor-tile` count = 0 when all sensors undefined | `sensors: {}` | `querySelectorAll('.sensor-tile').length === 0` |
| TC-1107 | Unit | `.bar-fill.pellet` width = percentage | `sensor_pellet_quantity: 75` | `style.width === '75%'` |
| TC-1108 | Unit | `.sensor-tile.warn` appears when below threshold | `pellet_quantity: 20, threshold: 0.5` | `.sensor-tile.warn` not null |
| TC-1109 | Unit | `.bar-fill.storage` null when no maximum attribute | `counter state='5', attributes={}` | `.bar-fill.storage` is null |
| TC-1110 | Unit | `header_message` renders in `.sf-header` | `config.header_message: 'Stove Status'` | textContent includes `'Stove Status'` |
| TC-1111 | Unit | Error message when entity not found | `entity: 'climate.missing'`, hass empty | textContent includes `'Entité poêle non trouvée'` |
| TC-1112 | Regression | All existing `sci-fi-stove.test.ts` tests still pass | Run `npm test` | 0 failures |
| TC-1113 | Unit | `styles.ts` exports `stoveStyles` as a Lit CSSResult | Import check | `typeof stoveStyles === 'object'` with `cssText` property |
| IT-1101 | Integration | `sci-fi-stove` registers correctly in `customElements` | Load `sci-fi.min.js` | `customElements.get('sci-fi-stove')` returns the class |
| IT-1102 | Integration | Card renders header + grid with real hass state | Mount with `state: 'heating'`, all sensors set | Header visible, `.sensor-tile` count > 0, `.header-icon sf-icon` present |
| IT-1103 | Integration | `styles.ts` imported — no inline `css\`\`` block remains in `sci-fi-stove.ts` | Grep source file | `grep -c 'css\`' sci-fi-stove.ts` returns 0 |

> [!NOTE]
> TC-1101 through TC-1111 are **NEW** tests for the new header design.
> TC-1112 is the regression gate — all 8 existing tests must remain GREEN.

---

## Error Handling Matrix

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Entity not found (`this.hass.states[this.config.entity]` undefined) | Guard at top of `renderCard()` | Return error `<ha-card>` with message `'Entité poêle non trouvée : ${entity}'` | None — user must fix config |
| Sensor state not found (`this.hass.states[sensorKey]` undefined) | Guard in `_buildSensorTiles` via `get()` helper returning `undefined` | Tile not rendered (filter `t.value !== null && t.value !== undefined`) | Tile simply hidden |
| Pellet sensor state non-numeric | `isNaN(pct)` check in `_renderPelletBar` | Early return `html\`\`` | Pellet bar not rendered |
| No `hass` available | `SciFiBaseCard` base class guard before `renderCard()` is called | Base class returns empty template | Transparent empty card |
| Missing `friendly_name` attribute | Nullish coalescing `?? 'Poêle'` in header | Show `'Poêle'` as fallback | Always renders something |

---

## Deep Links

| Reference | Location |
|---|---|
| Existing stove card implementation | [sci-fi-stove.ts](../../src/cards/stove/sci-fi-stove.ts#L1) |
| Climate styles pattern to follow | [climates/styles.ts](../../src/cards/climates/styles.ts#L1) |
| Light card CSS patterns | [sci-fi-lights.ts L37-L514](../../src/cards/lights/sci-fi-lights.ts#L37-L514) |
| Common tokens source | [styles/common.ts](../../src/styles/common.ts#L1) |
| Existing stove tests (frozen selectors) | [sci-fi-stove.test.ts](../../tests/cards/stove/sci-fi-stove.test.ts#L1) |
| Config types contract | [Spec 05 § sci-fi-stove](./05_cards.md#sci-fi-stove) |
| sf-icon binding rule | [architecture.md § sf-icon Binding Rule](../CODEMAPS/architecture.md#sf-icon-binding-rule) |
| ADR-005 zero-breaking-change contract | [Spec 05 L6](./05_cards.md#L6) |
