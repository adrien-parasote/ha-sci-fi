# Adversarial Review Report: 15_vacuum_card_design_update.md

**Reviewer Source:** `cross-model` (Gemini)
**Date:** 2026-05-25
**Target Spec:** `docs/specs/15_vacuum_card_design_update.md`

---

## Step 0: Epistemic Pre-Scan

- **Cross-Document Data Consistency:** 
  - `SciFiVacuumConfig`, `SciFiVacuumEntry`, and `SciFiVacuumSensors` match `src/types/config.ts` exactly.
  - Dependencies on `SciFiBaseCard` and `sciFiCommonStyles` are correctly cited.
- **Externally Verifiable Claims:**
  - `@keyframes moveAcross` is pure CSS and verified to be portable from `main:src/cards/vacuum/style.js`.
  - Icon mappings (`sci:vacuum-docked` and `sci:vacuum-sleep`) are verified custom HA assets in `vacuum_const.js`.
- **Hidden Assumptions:**
  - Assumption: `set_fan_speed` configuration flag is intended to render an action button in the actions bar. (In reality, the new actions bar completely omits it, see findings).
  - Assumption: `this._vacuum_selected_id` will never be out of bounds when the vacuums list configuration changes dynamically.

**Pre-Scan Exit Criteria:** PASS with two high-severity logical findings resolved during the pre-scan/adversarial simulation phase.

---

## Step 0.5: Pre-Commitment Predictions

1. **`set_fan_speed` Dead Config Option:** I predict that the configuration option `set_fan_speed` will be accepted by types but completely ignored by the proposed Lit render code, rendering no button or control.
2. **Selected ID Out of Bounds on Config Reload:** I predict that if the number of configured vacuums decreases (e.g. from 2 to 1 in the Lovelace card editor), `_vacuum_selected_id` will remain at its old index, causing an out-of-bounds `undefined` access and crashing the card.
3. **Mop Intensity Sensor Missing Icon Fallback:** I predict that if a mop intensity sensor state is available but lacks a custom `icon` attribute, accessing `(mopState.attributes as any).icon` will return undefined and render no icon, leaving a blank gap in the header.
4. **Toast DOM Element Selection Race Condition:** I predict that calling `this.shadowRoot?.querySelector('sf-toast')` immediately after an action might return `null` if Lit has not painted the toast component yet, causing silent failures.

---

## Step 1: Adversarial Findings

### [HIGH] — `set_fan_speed` Omission from Actions Bar and Undefined Cycle Behavior
- **Location:** Section Constants (lines 175-180) and renderActions (lines 637-640)
- **Problem:** `SciFiVacuumEntry` includes the frozen `set_fan_speed?: boolean` config option. The spec states that this should be kept as a configurable action button using `vacuum.set_fan_speed` service (instead of the old `<select>` dropdown). However, `VACUUM_ACTION_KEYS` and `VACUUM_ACTIONS_ICONS` completely omit `set_fan_speed`. Thus, if `v.set_fan_speed !== false`, no button is rendered, and there is no way to trigger the service, violating the spec's own stated design and ADR-005. Furthermore, since there is no dropdown, the button must cycle through fan speeds, but the cyclic speed selection logic is completely unspecified.
- **Fix:** 
  1. Add `set_fan_speed` to `VACUUM_ACTION_KEYS` and `VACUUM_ACTIONS_ICONS`:
     ```ts
     export const VACUUM_ACTION_SET_FAN_SPEED = 'set_fan_speed';
     
     // In VACUUM_ACTION_KEYS
     export const VACUUM_ACTION_KEYS = [
       VACUUM_ACTION_START,
       VACUUM_ACTION_PAUSE,
       VACUUM_ACTION_STOP,
       VACUUM_ACTION_RETURN_TO_BASE,
       VACUUM_ACTION_SET_FAN_SPEED,
     ] as const;
     
     // In VACUUM_ACTIONS_ICONS
     [VACUUM_ACTION_SET_FAN_SPEED]: 'mdi:fan',
     ```
  2. Implement a cyclic speed toggle in `sci-fi-vacuum.ts` when calling `set_fan_speed`:
     ```ts
     private _callAction(entityId: string, service: string): void {
       if (service === 'set_fan_speed') {
         const state = this.hass.states[entityId];
         const currentSpeed = (state?.attributes as any)?.fan_speed as string | undefined;
         const speeds = ['quiet', 'standard', 'strong', 'max'];
         const nextIndex = currentSpeed ? (speeds.indexOf(currentSpeed) + 1) % speeds.length : 1;
         const nextSpeed = speeds[nextIndex];
         
         void this.hass.callService('vacuum', 'set_fan_speed', { entity_id: entityId, fan_speed: nextSpeed })
           .then(() => this._toast(false, msg('done')))
           .catch((e: Error) => this._toast(true, e.message));
         return;
       }
       // Other actions...
     }
     ```

### [HIGH] — Selected ID Out-of-Bounds Runtime Crash on Config Update
- **Location:** `sci-fi-vacuum.ts` (lines 462-466 and renderCard L485)
- **Problem:** `@state() private _vacuum_selected_id: number = 0;` is kept as reactive state. If the number of configured vacuums decreases (e.g. from 2 to 1 in the Lovelace card editor or config file reload), `_vacuum_selected_id` is left out of bounds (e.g., remaining at index 1 when the array length is 1). Accessing `this.config.vacuums[this._vacuum_selected_id]` will return `undefined`, resulting in type errors or runtime crashes when rendering the header, sub-header, map, and actions.
- **Fix:** Implement the `willUpdate(changedProperties: PropertyValues)` Lit lifecycle method. Inside, ensure `_vacuum_selected_id` is bounded by the current length of `this.config.vacuums`.
  ```ts
  import { type PropertyValues } from 'lit';
  
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

### [MEDIUM] — Mop Intensity Icon Missing Fallback
- **Location:** `_renderHeader` (lines 516-520)
- **Problem:** The spec proposes rendering mop intensity using `(mopState.attributes as any).icon ?? 'mdi:water-opacity'`. However, mop intensity sensors in Home Assistant are often standard numeric sensors or binary sensors that do NOT define an `icon` attribute on the state. If `mopState.attributes.icon` is undefined, it will fall back to `'mdi:water-opacity'`, which is fine. But if the sensor itself is not defined in `v.sensors.mop_intensite`, it skips mop rendering entirely. If the mopState exists but has no `icon`, it resolves correctly but might render standard icon. To be fully safe and match premium aesthetic, we should ensure the fallback icon is visually coherent.
- **Fix:** Ensure visual coherence by explicitly mapping common mop speed values to corresponding icons or text if needed.

---

## Step 2: Feature-Specific Requirements Quality Check

| FR-### | Dimension | Finding | Tag | Severity |
|--------|-----------|---------|-----|----------|
| F-VAC-D01 | Completeness | If fan speed attribute is missing, the header renders an empty space. A fallback string or hidden fan icon is cleaner. | [Gap] | LOW |
| F-VAC-D06 | Edge Cases | Cycle buttons (`mdi:chevron-left` and `mdi:chevron-right`) do not have `aria-label` tags, violating basic accessibility rules. | [Gap] | LOW |
| F-VAC-D07 | Testability | `<sf-toast>` element is not in any unit test cases as an assertion after service failure/success. | [Gap] | MEDIUM |

---

## Conclusion & Next Steps

**Status:** FAIL. The specification has 2 HIGH issues (`set_fan_speed` omission and selected ID out-of-bounds).
**Action Required:** Incorporate the proposed fixes into `15_vacuum_card_design_update.md` to ensure structural alignment, correct compilation, and robust runtime behavior before running `/spec-gate` again.
