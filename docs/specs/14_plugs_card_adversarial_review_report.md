# Adversarial Review Report: 13_plugs_card_design_update.md

**Reviewer Source:** \`cross-model\` (Gemini)
**Date:** 2026-05-25
**Target Spec:** \`docs/specs/13_plugs_card_design_update.md\`

---

## Step 0: Epistemic Pre-Scan

- **Cross-Document Data Consistency:** 
  - \`SciFiPlugDevice\` and \`SciFiPlugsConfig\` match the frozen config from ADR-005.
  - \`sciFiCommonStyles\` dependency is correct.
- **Externally Verifiable Claims:** 
  - \`hass.callApi('GET', history/period/...)`: The spec marks this as \`[unverified]\` explicitly. This is acceptable for now but should be tested during POC/Implementation.
- **Hidden Assumptions:**
  - Assumption: The Lit \`render()\` cycle allows immediate DOM querying. (This is false, see findings).

**Pre-Scan Exit Criteria:** PASS with one CRITICAL architecture logic flaw found during pre-scan phase.

---

## Step 0.5: Pre-Commitment Predictions

1. **Lit Lifecycle vs Imperative DOM:** I predict that calling \`_loadPowerChart\` directly from \`_renderContent()\` will fail because \`render()\` is a pure function and the \`shadowRoot\` elements it tries to query won't be painted/available yet.
2. **Chart Caching:** I predict that caching chart data in \`_chart_generation[idx]\` will prevent the chart from updating with real-time data when the user stays on the same plug or navigates away and back.
3. **State Undefined:** I predict that if \`hass.states[device.entity_id]\` is undefined (e.g. HA rebooting), accessing \`.state\` will throw an error and crash the render.
4. **CSS Animation leakage:** I predict the pure CSS animation might cause CPU usage issues if not properly paused when hidden, though the spec uses \`display: none\` which usually mitigates it.

---

## Step 1: Adversarial Findings

### [CRITICAL] — Lit Render Lifecycle Violation for Chart Initialization
Location: \`_renderContent\` and \`_loadPowerChart\`
Problem: \`_renderContent\` is called during Lit's synchronous \`render()\` phase. It synchronously calls \`_loadPowerChart\`, which immediately queries \`this.shadowRoot?.querySelector('.chart-container')\`. On first render, or when the DOM structure changes, the \`shadowRoot\` does not yet contain the elements returned by \`render()\`. This will result in \`chartContainer\` being null, and the chart will fail to mount. Additionally, calling side-effect DOM-mutating functions from \`render()\` is an anti-pattern in Lit.
Fix: Remove the \`void this._loadPowerChart(...)\` call from \`_renderContent\`. Instead, implement Lit's \`updated(changedProperties: PropertyValues)\` lifecycle method, check if \`_selected_plug_id\` or \`config\` changed, and call \`_loadPowerChart\` from there.

### [HIGH] — Stale Chart Data due to Infinite Caching
Location: \`_loadPowerChart\`
Problem: The \`_chart_generation\` dictionary caches the API response forever per plug index. If the user keeps the dashboard open for hours, navigates to plug 2, and goes back to plug 1, they will see the data from when plug 1 was first rendered, not the latest data.
Fix: Add a cache invalidation mechanism, or simply do not cache the data between selections if fresh data is required. Alternatively, fetch new data in the background and update the cache. At a minimum, clarify the cache lifetime policy in the spec.

### [HIGH] — Undefined State Crash
Location: \`_renderHeader\`, \`_renderContent\`, \`_toggle\`
Problem: The spec assumes \`this.hass.states[device.entity_id]\` always exists. If the entity is missing or HA is disconnected, \`switchState\` is undefined, which is safely handled by \`switchState?.state\`, but in \`_toggle\`, if it doesn't exist, it sends a command to \`undefined\` entity or turns it ON by default.
Fix: Add a guard in \`_toggle\`: \`if (!device.entity_id || !this.hass.states[device.entity_id]) return;\`

### [MEDIUM] — Chart Update Logic Clears Canvas Incorrectly
Location: \`_clearChart\` vs \`_drawChart\`
Problem: \`_clearChart\` does \`container.innerHTML = ''\`. Then \`_drawChart\` does \`const existing = container.querySelector('canvas'); const canvas = existing ?? container.appendChild(document.createElement('canvas'));\`. Since \`innerHTML = ''\` was called, \`existing\` will always be null, so it always creates a new canvas. This defeats the purpose of reusing the canvas and causes memory churn.
Fix: Either don't clear \`innerHTML\` in \`_clearChart\` (let Chart.js \`destroy()\` handle cleanup, then \`_drawChart\` can reuse the canvas), or recreate the canvas explicitly every time without pretending to reuse it.

---

## Step 2: Feature-Specific Requirements Quality Check

| FR-### | Dimension | Finding | Tag | Severity |
|--------|-----------|---------|-----|----------|
| F-PLG-D04 | Completeness | The API \`minimal_response=true&no_attributes=true\` might strip data that \`history/period\` needs to return proper history depending on HA version, though \`[unverified]\` is noted. | [Assumption] | LOW |
| F-PLG-D07 | Edge Cases | Toggle action does not disable the button while the API call is in flight, allowing rapid double-clicks to send conflicting commands. | [Gap] | MEDIUM |

---

## Conclusion & Next Steps

**Status:** FAIL. The spec has 1 CRITICAL and 2 HIGH issues.
**Action Required:** Fix the CRITICAL and HIGH issues in \`docs/specs/13_plugs_card_design_update.md\` and re-run the Spec Gate before proceeding to BUILD.
