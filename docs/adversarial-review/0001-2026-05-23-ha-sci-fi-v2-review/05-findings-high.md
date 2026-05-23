# High-Severity Findings

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026

High-severity issues indicate structural contradictions or configuration gaps that would cause the compilation to fail or introduce severe architectural regressions.

---

## 1. [HIGH] — Domain Selector Architectural Contradiction (House State Registry)

- **Location**: `docs/specs/02_domain_selectors.md` § Public Interface (Line 66) vs `docs/strategic/blueprint.md` § Gap Discovery ADR-004 (Line 168)
- **Problem**: 
  Spec 02 lists `selectHouseState()` as a core public interface mapping floors, areas, and devices into a unified state registry. However, the strategic blueprint ADR-004 and the implementation plan explicitly state that the **`House` model has been completely deleted** in favor of direct HASS selectors (`getFloors`, `getAreas`, etc.) to eliminate centralized weight and memory overhead.
  
- **Concrete Code Impact**:
  An AI coder executing Spec 02 will generate the obsolete `selectHouseState()` helper, creating redundant, heavy structural mappings that clash with the clean, selector-driven design expected in Spec 03, 04, and 05.
  
- **Fix**:
  Remove `selectHouseState()` entirely from `docs/specs/02_domain_selectors.md` § Public Interface and § Test Cases, and replace it with direct selector definitions.
  
  ```markdown
  ### Update to Spec 02 § Public Interface
  - Remove `selectHouseState()`.
  - Add explicit exports for:
    - `getFloors(hass: HomeAssistant): readonly HassFloor[]`
    - `getAreasByFloor(hass: HomeAssistant, floorId: string): readonly HassArea[]`
    - `getEntitiesByArea(hass: HomeAssistant, areaId: string): readonly HassEntityEntry[]`
  ```

---

## 2. [HIGH] — Rollup 4 TypeScript Decorators Compilation Failure

- **Location**: `docs/specs/01_infrastructure.md` § File Tree / `rollup.config.mjs` (Line 31)
- **Problem**: 
  The infrastructure specification relies on `@rollup/plugin-typescript` to compile TypeScript. However, standard Rollup TypeScript plugins often fail or incorrectly strip class decorators (`@customElement`, `@property`) unless specific flags (`useDefineForClassFields: false` and `experimentalDecorators: true`) are explicitly synchronized between `tsconfig.json` and the Rollup compiler instance. 
  
- **Concrete Code Impact**:
  Subclass components in Spec 04 and 05 will crash at runtime in browser environments with `TypeError: Cannot read properties of undefined (reading 'element')` or will fail to reactively trigger updates when entity states change.
  
- **Fix**:
  Specify explicit Rollup configuration parameters in `docs/specs/01_infrastructure.md` to ensure correct decorator compilation.
  
  ```markdown
  ### Rollup 4 TS Configuration Contract (Update to Spec 01 §2.3)
  `rollup.config.mjs` must instantiate `@rollup/plugin-typescript` with explicit overrides:
  ```javascript
  typescript({
    tsconfig: "./tsconfig.json",
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: false
    }
  })
  ```
  ```

---

## 3. [HIGH] — Chart.js Offline Failure in sci-fi-weather Card

- **Location**: `docs/specs/05_cards.md` § Assumptions (Line 46) & § Error Handling (Line 107)
- **Problem**: 
  The weather card specification assumes `Chart.js` is loaded dynamically from an external CDN at runtime. For offline/local Home Assistant instances, this dynamic load will block indefinitely or throw uncaught connection exceptions, rendering the weather card entirely blank.
  
- **Concrete Code Impact**:
  If the smart home server lacks external internet access, the dashboard weather card crashes.
  
- **Fix**:
  Require a local fallback rendering layout inside the weather card spec if `Chart.js` fails to load.
  
  ```markdown
  ### Chart.js Offline Fallback (Update to Spec 05 §5.5)
  If `Chart.js` is blocked or unavailable, the weather card must fall back gracefully to a standard CSS grid-based bar layout displaying the numerical forecast temperatures statically, ensuring the card remains readable without internet.
  ```

---

## 4. [HIGH] — Defensive window.customIcons Merger

- **Location**: `docs/specs/06_entry_migration.md` § Cross-Spec Contracts (Line 52) & § Error Handling (Line 100)
- **Problem**: 
  Spec 06 defines the iconset registration by assigning `window.customIcons['sf'] = ...`. Directly overwriting properties on `window.customIcons` without defensive checks can crash if `window.customIcons` is undefined, or can overwrite registrations from other custom integrations.
  
- **Concrete Code Impact**:
  Other custom integrations could have their icons broken, or our own card will crash at load time if the global variable is uninitialized.
  
- **Fix**:
  Ensure the entry script checks and initializes the namespace defensively.
  
  ```markdown
  ### Iconset Safe Merger (Update to Spec 06 §6.3)
  `src/sci-fi.ts` must instantiate the icon registry defensively:
  ```typescript
  window.customIcons = window.customIcons || {};
  window.customIcons.sf = {
    ...window.customIcons.sf,
    ...sfIconset
  };
  ```
  ```
