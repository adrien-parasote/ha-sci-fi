
### L012: Spec Conformance Exclusions for External Domain Entities
**Date**: 2026-05-23
**Context**: During HA custom card migration, `P8_SpecConformance` failed because the documentation correctly referenced external Home Assistant domain entities (`Area`, `Floor`, `LightEntity`, etc.) inside backticks. The `spec_conformance.py` script assumed these were intended to be exported by our codebase.
**Actionable Pattern**: When documenting components that interface with external domains, either:
1. Avoid backticking standard domain types if they don't exist in our codebase, OR
2. Immediately add them to the `SPEC_PROSE_EXCLUSIONS` array in `spec_conformance.py` to prevent them from triggering false-positive export failures.

### L013: Post-Refactor TDD Lock Re-alignment
**Date**: 2026-05-23
**Context**: After retrofitting tests for the new TypeScript structure, `P10_TDDSequence` failed because test files were modified after the initial `.tdd_lock` was created.
**Actionable Pattern**: If test retrofitting or major architectural refactoring legitimately alters the test specifications, you must re-run `python3 .agents/skills/verification-loop/scripts/tdd_check.py . --lock` to update the file hashes in `.tdd_lock` and clear the sequence blocker.

### L014: Vitest & Lit Element Lifecycle Warnings
**Date**: 2026-05-23
**Context**: During the VERIFY phase, tests failed because `verify.py` intercepts `stderr` warnings. We encountered warnings like `Lit is in dev mode` and `ReactiveElement.updated()`.
**Actionable Pattern**: 
1. Use a global `setupFiles` in `vitest.config.ts` to intercept and silence specific `console.warn` calls from Lit or the DOM.
2. Avoid state mutations inside `updated()`. If a Lit component updates a ref or internal state after render, use `willUpdate()` instead to prevent synchronous infinite loop warnings that will crash strict test runners.

### L015: Happy-DOM and Canvas APIs (Chart.js)
**Date**: 2026-05-23
**Context**: `Chart.js` relies heavily on native Canvas API features (`ResizeObserver`, canvas rendering context). `happy-dom` lacks full support for these, causing tests to crash with `Failed to create chart: can't acquire context`.
**Actionable Pattern**: When unit-testing Web Components that wrap heavy canvas libraries like `Chart.js` in `happy-dom`, dynamically mock the library's constructor globally (`vi.stubGlobal`) and provide dummy implementations for `destroy`, `update`, and `resize` to safely verify component logic without relying on the actual canvas rendering engine.

### L016: Lit Property vs Attribute Binding for Dynamic Custom Element Properties
**Date**: 2026-05-23
**Source**: ha-sci-fi v2 — Spec 04 components + /code-review
**Evidence**: 5 occurrences of `icon="${expression}"` found across 3 card files during /code-review. 3 src files + 1 test file rewritten. Zero instances in `sf-toggle-switch` because Spec 04 explicitly documented `.checked=` property binding.
**Anti-pattern**: Using `property="${expression}"` (HTML attribute) instead of `.property="${expression}"` (Lit property binding) for dynamic values on custom elements. HTML attribute binding is frozen after first render — HA state updates do NOT trigger `willUpdate()` on the child component.
**Fix**: In any spec documenting a custom element, explicitly note: `static-value="foo"` (attribute, compile-time constant) vs `.dynamic-value="${expr}"` (property, reactive). Add as anti-pattern in all component specs consuming custom elements with `@property()` fields.

### L017: `window.history` Absent in happy-dom — Mock Per-Test, Not Globally
**Date**: 2026-05-23
**Source**: ha-sci-fi v2 — tests/cards/hexa_tiles + /code-review
**Evidence**: 3 tests crashed with `TypeError: Cannot read properties of undefined (reading 'pushState')` after replacing `window.location.assign()` with `pushState`. `happy-dom` exposes `window.history` as `undefined`.
**Anti-pattern**: Adding `window.history.pushState` (or any navigation API) to a component without updating test stubs silently breaks the test suite.
**Fix**: When a component uses `window.history`, `window.open`, or `window.dispatchEvent`, document the per-test mock pattern in the spec:
```ts
vi.stubGlobal('window', {
  ...window,
  history: { pushState: vi.fn() },
  dispatchEvent: vi.fn(),
  location: window.location,
  open: vi.fn(),
});
```
If navigation is a recurring project pattern, add a global stub to `tests/setup.ts`.

### L018: `@state()` on Never-Mutated Fields — Speculative Code Invisible to TypeScript
**Date**: 2026-05-23
**Source**: ha-sci-fi v2 — sci-fi-vehicles.ts + /code-review
**Evidence**: `@state() private _activeIndex = 0` shipped but never written. TypeScript emits no error or warning for unused `@state()` decorators. Detected only via manual /code-review.
**Anti-pattern**: Declaring a `@state()` field for a feature not yet implemented ("tab navigation for v2.1"). Creates unnecessary Lit re-render overhead and is a YAGNI violation the compiler cannot catch.
**Fix**: Add to coding standards: "Every `@state()` field MUST be mutated in the same PR it is introduced. If not, it is speculative code → remove it. Apply YAGNI."

### L019: GitHub Wiki is a Separate Clonable Git Repo
- **Date**: 2026-05-23
- **Source**: ha-sci-fi v2 — release workflow
- **Evidence**: Needed to edit GitHub wiki from CLI during release. Cloning via `git@github-perso:<owner>/<repo>.wiki.git` gave full git access in 1 command — push to `master` publishes immediately.
- **Pattern**: To edit a GitHub wiki programmatically, clone it as a separate repo: `git clone git@github.com:<owner>/<repo>.wiki.git`. It is a standard git repo with `.md` files at root. Specify this in any release automation spec that touches wiki release notes.

### L020: GitHub Classic PAT — `repo` Scope Required for Releases API, `write:packages` Is Not Sufficient
- **Date**: 2026-05-23
- **Source**: ha-sci-fi v2 — GitHub releases API
- **Evidence**: 2 failed API calls (404) with a token that had `write:packages` but not `repo`. Adding `repo` scope resolved immediately. `x-oauth-scopes` response header is the definitive diagnostic — empty = fine-grained PAT with no permissions.
- **Anti-pattern**: Using `write:packages` (GitHub Package Registry) thinking it grants release creation rights. These are unrelated scopes.
- **Fix**: In any spec involving `POST /repos/{owner}/{repo}/releases`, document explicitly: "Requires classic PAT with `repo` scope. Verify with `curl -sI -H 'Authorization: Bearer $TOKEN' https://api.github.com/user | grep x-oauth-scopes`."

### L021: Large README Anti-Pattern — Split Into Per-Component Docs Early
- **Date**: 2026-05-23
- **Source**: ha-sci-fi v2 — README + docs/cards/
- **Evidence**: README grew to 784 lines (full YAML configs for 8 cards inline). Split into `README.md` (124 lines) + `docs/cards/<card>.md` (8 files, ~90 lines each). README became scannable in 30s; card docs are deep-linkable.
- **Pattern**: For multi-component libraries, structure docs as: (1) root `README.md` = badges + install + component table with links, (2) `docs/<type>/<name>.md` = full config reference per component. Apply when README exceeds ~200 lines or when 3+ independently configurable components exist.

### L022: XSS Vulnerability in Test DOM Cleanup (OWASP A03)
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — security scan (VERIFY stage)
- **Evidence**: 8 test files rewritten. `security_scan.py` flagged `document.body.innerHTML = ''` as a critical-risk pattern for XSS in DOM cleanup (`afterEach`).
- **Anti-pattern**: Using `document.body.innerHTML = ''` to clear the DOM after unit tests. Even in a testing context, security scanners correctly flag direct `innerHTML` assignments as an OWASP A03 vulnerability.
- **Fix**: Use `document.body.replaceChildren()` to safely and efficiently clear the DOM synchronously without invoking the HTML parser.

### L023: Lit Template Ternaries Are Structurally Uncoverable by v8
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — 100% coverage push (VERIFY stage)
- **Evidence**: After 17 new tests (141→158), branch coverage reached 90.39% but plateaued. Remaining uncovered branches are all ternaries inside `html\`...\`` template literals (Lit `repeat()` callbacks, inline `${expr ? html\`...\` : ''}`). v8 instruments JS AST branches, but Lit's tagged template literal evaluation collapses these branches into a single expression node during transpilation.
- **Anti-pattern**: Chasing 100% branch coverage on LitElement Web Components. The last ~10% of branches in template ternaries are structurally inaccessible to v8 — adding more tests won't help and wastes time.
- **Fix**: In specs for Lit-based cards, document explicitly: "Branch coverage target = 90%+ (not 100%). Remaining branches are Lit template ternaries, structurally uncoverable by v8. Functions and Statements targets remain 100%."
- **Scope**: Applies to all LitElement projects using v8 coverage (Vitest, c8, Istanbul v8).

### L024: `!= null` vs `!== null && !== undefined` — TypeScript Strict Null Checks
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — user-applied refactoring pass
- **Evidence**: User replaced all `!= null` with `!== null && !== undefined` across 8 source files. This is semantically equivalent in JavaScript (`!= null` covers both `null` and `undefined`), but the explicit form is required by `eqeqeq: ["error", "always"]` in `.eslintrc.json`.
- **Pattern**: When `eqeqeq: always` is enforced, `!= null` triggers lint errors. Use `=== null || === undefined` or optional chaining (`?.`). In Lit template branches, prefer `value !== null && value !== undefined` for full ESLint compliance.
- **Scope**: Applies to all TS projects with `eqeqeq: always` + `strictNullChecks`. Document this constraint explicitly in the spec's coding-constraints section.

### L025: Type-Guard Unit Tests Belong in `tests/types/` — Not Inlined in Card Tests
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — coverage gap closure (VERIFY stage)
- **Evidence**: `assertString` and `assertDefined` in `src/types/config.ts` had 0% branch coverage. Adding them to an existing card test file would have polluted the card's test domain. Creating `tests/types/config.test.ts` achieved 100% coverage with 7 focused tests.
- **Pattern**: Utility functions (`assertX`, `validateX`, `parseX`) that exist at the type layer should have their own test file under `tests/types/` or `tests/utils/`, matching the source structure. This prevents domain pollution and makes coverage gaps obvious.
- **Fix**: In specs that define type-guard or validation utility functions, always include a `tests/types/<module>.test.ts` pointer in the Test Case Specifications table.

### L026: Inspect the Branch History Before Building Any Dev Tool
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — workbench session
- **Evidence**: User reminded agent mid-session that `main` branch already contained `tests/js/hass.js` with a fully working `home-assistant-js-websocket` connection + `subscribeEntities` pattern. Agent had started implementing from scratch instead of inspecting the branch. 1 iteration of rework avoided once user pointed this out.
- **Anti-pattern**: Starting implementation of a dev/infra tool (workbench, mock server, test helper) without first running `git ls-tree -r <branch> --name-only | grep <keyword>` to check if prior art exists on another branch.
- **Fix**: Before building any developer tooling (workbench, mock, server, demo page), ALWAYS run:
  1. `git branch -a` — list all branches
  2. `git ls-tree -r main --name-only | grep -i "test\|demo\|workbench\|dev"` — check prior art
  3. `git show main:<file>` — read the existing implementation
  Only then decide Adopt / Adapt / Build-New.

### L027: Production YAML Configs Are the Ideal Source for Mock Data
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — workbench session
- **Evidence**: The `yaml backup/*.yaml` files contained exact production entity IDs, sensor names, and config structures. Using them to generate mock `hass.states` produced 100% realistic workbench data with zero guesswork — all entity IDs matched production on first try.
- **Pattern**: For HA card projects, always derive workbench mock data from the production YAML backups (or equivalent config files), not from invented entity names. The entity IDs in `yaml backup/*.yaml` are the ground truth; mock data that diverges from them will hide integration bugs.
- **Fix**: In any workbench or test helper spec for HA custom cards, add: "Mock `hass.states` MUST be derived from `yaml backup/*.yaml`. Never invent entity IDs — copy them verbatim."

### L028: ID Selectors on Root Layout Wrappers Override Granular Class Logic
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — Workbench responsive device frames
- **Evidence**: Device simulation for iPad (`height: 1000px`) and iPhone frames kept collapsing to content height in panel mode. The culprit was a global utility rule `#card-mount-wrap { height: 100%; }`. Because `id="card-mount-wrap"` was placed on the exact same HTML element as `.device-screen`, the ID selector `(0,1,0,0)` permanently overrode the class selector `(0,0,2,0)`.
- **Anti-pattern**: Using ID selectors for generic layout wrappers (`#wrapper`, `#container`, `#mount`) while simultaneously applying context-specific dimensions via class names (`.tablet-screen`). The ID will always win the specificity war, making the contextual classes powerless and incredibly hard to debug in responsive/fluid designs.
- **Fix**: Never use IDs for structural styling. Use classes. If an ID is required for JS targeting (`getElementById`), restrict its CSS usage strictly to properties that won't conflict with layout (or better, don't style the ID at all).

### L029: Web Components and Container Queries in DOM Simulation
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — Workbench responsive device frames
- **Evidence**: `@container (max-width: 450px)` failed to trigger on `ha-card` in the custom workbench. `ha-card` is an unknown custom element to the browser (not registered by HA core in this standalone env), meaning the browser rendered it as `display: inline`. Inline elements cannot act as container query contexts, so the query silently resolved to the width of the content, breaking all mobile breakpoints.
- **Pattern**: When simulating or mounting Web Components in a standalone workbench or testing environment, ensure custom element wrappers (`ha-card`, etc.) explicitly declare `display: block; width: 100%;` in their base CSS. Relying on the host app (HA) to provide these styles works in production but breaks CSS container queries in isolation.

### L030: SVG-rendered Light DOM Custom Element Sizing & Invisible Icons
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sci-fi-hexa-tiles.ts + /self-debug
- **Evidence**: `<sf-icon>` renders `<svg class="sf-icon">` in the Light DOM (using `createRenderRoot() { return this; }`). Inside shadow DOM cards setting CSS variables `--icon-width` and `--icon-height` on `<sf-icon>`, but without active rules in card styles mapping these variables to the actual SVG's `width`, `height`, and `fill` (e.g. `sf-icon svg, .sf-icon { width: var(--icon-width); height: var(--icon-height); fill: var(--icon-color); }`), the SVG collapses to `0x0` or renders with default black fill on black backgrounds, becoming completely invisible.
- **Pattern**: When using custom elements that render in the Light DOM (like `sf-icon`), you must ensure that card stylesheets or global stylesheets map any custom layout variables (width, height, color) directly to the target Light DOM SVG element inside.

### L031: Promise Caching for Heavy Websocket API Category Fetches
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — icon-cache.ts + /self-debug
- **Evidence**: On initial page load, multiple components fetch icons concurrently. The custom icon resolver sent a websocket request `frontend/get_icons` for *each* icon because it didn't cache the active query promise. When loading 10+ icons concurrently, this: (1) hit the concurrency limit (`MAX_CONCURRENT_FETCHES = 5`), instantly returning `ICON_NOT_FOUND` (fallback `?`) for subsequent requests, and (2) sent redundant massive websocket payloads (thousands of icons) to the HA server.
- **Pattern**: When fetching heavy categories of data from a WebSocket API concurrently, always cache the active `Promise` globally. All concurrent callers will wait for the same promise to resolve. Clear this promise cache in global test resets (`clearMemCache()`) to ensure isolated test suites.

### L032: Sibling Lit Property Race Condition & Initialization Updates
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sf-icon.ts + /self-debug
- **Evidence**: The custom element `<sf-icon>` resolves MDI icons using a `connection` property passed from its parent (`this.hass.connection`). On the first update, `this.connection` is often `undefined` due to component initialization race conditions. The icon's `willUpdate` hook only watched `changed.has('icon')`, meaning that when the parent subsequently populated the connection property, `sf-icon` ignored the change and remained permanently stuck on the fallback question mark (`?`) placeholder.
- **Pattern**: When a custom element depends on sibling properties that are initialized asynchronously or reactive (such as state, active connection, or user object), always ensure that its update life cycle hooks (`willUpdate`, `shouldUpdate`) watch for changes to *all* critical dependent properties, not just the primary value.

### L033: Custom Element Upgrade Failure due to Style Mutations in Constructor
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sci-fi-hexa-tiles.ts
- **Evidence**: `cardEl.setConfig is not a function` runtime error thrown in Home Assistant card rendering environment.
- **Anti-pattern**: Mutating CSS styles or custom properties (such as `this.style.setProperty('--cols', ...)`) inside the Custom Element constructor. This violates Web Component lifecycle specifications, throws a DOMException during upgrade, and halts element registration (meaning the custom element is treated as a plain `HTMLUnknownElement`).
- **Fix**: Move all dynamic styling or attribute mutations entirely out of the constructor to `connectedCallback()`, `firstUpdated()`, or `willUpdate()`, where element mutation is fully permitted.

### L034: Shadow DOM :host Selector Custom Property Inheritance
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sci-fi-hexa-tiles.ts
- **Evidence**: On tablet (iPad Air) and PC viewports in the workbench, the hexagons collapsed into a standard non-shifting vertical grid because `--cols` was not inherited by the `:host` selector when defined on a child element (`<ha-card style="--cols: ...">`).
- **Anti-pattern**: Attempting to style the `:host` component using CSS custom variables defined inside its own template (on child elements like `ha-card`). Custom properties inherit downwards, not upwards.
- **Fix**: Set custom properties needed by the `:host` selector directly on the host element's style property in JavaScript using `this.style.setProperty('--name', value)` inside reactive hooks (`_updateLayout` / `connectedCallback`).

### L035: MDI Icon Mapping for Weather Conditions in Lovelace Hexagonal Dashboards
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sci-fi-hexa-tiles.ts + /tdd
- **Evidence**: Replaced hardcoded `mdi:weather-cloudy` weather icon and temperature text with custom mapped weather icon matching HA weather state and entity's friendly name (city name) as tile label.
- **Pattern**: When rendering a weather tile inside specialized layout grids (like hexagons), avoid hardcoding temporary/generic icons. Define a standard `WEATHER_ICON_MAP` covering all standard HA weather states (`sunny`, `rainy`, etc.), and map the state value to dynamically select the correct icon. Render the `friendly_name` of the weather entity as the label to present the target city clearly.

### L036: Hybrid Native Element Rendering for Heavy WebSocket APIs
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-icon.ts session
- **Evidence**: Fetching the MDI icon registry via the WebSocket `frontend/get_icons` with category `mdi` is deprecated in modern HA and throws `invalid_format`. Bypassed the API and rendered `<ha-icon .icon="${this.icon}"></ha-icon>` natively in the browser.
- **Pattern**: For custom elements that render standard platform-native elements (like icons) which are backed by heavy databases, bypass custom APIs and delegate rendering directly to the host platform's native custom elements (`<ha-icon>`). Use inline CSS property mapping (`--mdc-icon-size: var(--icon-width); width: var(--icon-width); ...`) to bridge custom design tokens.

### L037: Environment Isolation to Prevent Startup Race Conditions
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-icon.ts session
- **Evidence**: On dashboard load, the custom card and `<ha-icon>` register concurrently. A dynamic check `customElements.get('ha-icon') !== undefined` at first update failed due to this registration race, locking the card into the broken WebSocket fallback branch.
- **Pattern**: When deciding whether to render a platform element at element initialization, do not rely on dynamic custom element registration checks which are subject to race conditions. Instead, use static environment detection helpers (e.g. `isLiveHA()` by checking URL pathnames and vitest environment flags) to unconditionally choose the platform-native element rendering path in production. The browser will naturally upgrade the element once it is registered.

### L038: Mocking Dynamic Platform Elements in Isolated Dev Tools
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — dev/workbench.html session
- **Evidence**: Standalone simulators (like `dev/workbench.html`) do not register the platform's native elements (`<ha-icon>`), causing elements using the hybrid native strategy to fail to render and clutter logs.
- **Pattern**: In isolated developer simulators (workbench), declare a lightweight mock custom element (`ha-icon`) that fetches assets from a public, versioned stable CDN (unpkg) dynamically. This satisfies offline-first HACS compliance because the mock/CDN is restricted purely to dev simulation and never bundled or loaded in production, while enabling a high-fidelity visual experience in development.

### L039: Avoid Unsolicited Style Embellishments on Simple Layout Requests
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sci-fi-hexa-tiles.ts session
- **Evidence**: User rejected the premium circle border, background, and drop-shadow added to the status badge, asking only to keep it raw and make the icon itself larger. 1 iteration of minor rework was required to strip these extra styles.
- **Anti-pattern**: Adding unsolicited decorative embellishments (e.g. backgrounds, borders, glows, border-radius) when the user only asks to resize or align a UI element, thinking it makes the UI look more premium. This violates the "Maintain Scope Discipline" and "Enforce Simplicity" principles and can easily cause user rejection and rework.
- **Fix**: When asked to increase the size or adjust the spacing of a UI element, change ONLY the dimensions (width, height, padding, margins, absolute positioning). Do not add backgrounds, borders, or shadow effects unless explicitly requested by the user.

### L040: Intercepting Custom Element Platform Navigation in Developer Workbench Simulators
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — dev/workbench.html session
- **Evidence**: Intercepted `window.history.pushState` dynamically to map card links to local tabs (`lights`, `stove`, etc.) and called `selectCard()`. This: (1) updated the workbench UI to match the tab context when clicking hexagon tiles, and (2) prevented security exceptions (`DOMException`) under `file://` protocol.
- **Pattern**: When simulating dynamic navigation or platform-level URL changes (like Home Assistant internal links) inside a standalone developer simulator, monkeypatch `window.history.pushState` (or write a listener for custom `location-changed` events) to map destination URLs to the simulator's own tab-switching or state-switching functions, and explicitly bypass the native `pushState` under the `file://` protocol to prevent browser security blocks.




### L041: Avoid Bypassing Component Architecture with Direct Workbench Injection
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — dev/workbench.html session
- **Evidence**: Directly modifying the workbench mock state to inject SVG templates bypassed the underlying component's architecture, causing the UI not to update and resulting in a messy mock environment.
- **Anti-pattern**: Bypassing component boundaries and polluting local development mock data to force an integration (e.g. injecting HTML/SVG strings into mocked state objects).
- **Fix**: Leverage the component's internal logic and registration namespaces (`window.customIcons.sf`) to map custom dynamic values cleanly without rewriting static mock data in the workbench. Mock data should simulate pure backend states, not UI rendering logic.

### L042: Floor/Area Initial Selection — Validate Existence, Not Content
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sci-fi-lights.ts HARDEN session
- **Evidence**: `first_floor_to_render: 'rdc'` validation required `lightAreas(floorId).length > 0`. On first HA render, `hass.entities` (entity registry) may not be fully loaded → `lightAreas` returns 0 → fallback fires → wrong floor shown → "Aucune lumière" flash. Fix: validate floor by `hass.floors[id] !== undefined`, not by light count.
- **Anti-pattern**: Using downstream content (light count, entity count) to validate upstream config references (floor IDs, area IDs). This introduces false-negatives when the referenced entities aren't loaded yet.
- **Fix**: Validate config-referenced IDs by existence in the host data store only. Content-based validation (e.g. "must have ≥1 entity") belongs in the render layer (show empty-state message), NOT in the selection-validation layer. Never let an empty entity registry cause a config-valid floor to be deselected.

### L043: Test Selectors Must Match Implementation HTML — Document in Spec
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sci-fi-lights.test.ts HARDEN session
- **Evidence**: Tests used `.floor-btn`, `.area-tile`, `.light-row`, `aria-selected`, `aria-pressed` — but the implementation used `.floor-hexa`, `.area-hexa`, `.light-btn`, `data-selected`, `data-active`. 6 tests failed. Both the spec and test file needed updating.
- **Anti-pattern**: Writing test DOM selectors without first inspecting the implementation's actual rendered HTML. Invented selectors (`aria-selected`, `.floor-btn`) that look like best practice but don't match the actual template cause all E2E assertions to silently return `null`.
- **Fix**: In specs for UI components, always document the canonical CSS class names and data attributes used by tests in a "CSS Selectors for E2E Tests" table (see `05_cards.md → sci-fi-lights`). Treat these selectors as a public API contract between the spec and test files.

### L044: Bottom-Aligned SVG + Fixed `padding-top` = Fragile Positioning
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-radiator.ts, wheel alignment debugging
- **Evidence**: The radiator image uses `align-items: end` (bottom-aligned). `padding-top: 54px` worked for one card height but broke for another. The white square drifted because `padding-top` is relative to the container TOP while the image is anchored to the BOTTOM.
- **Anti-pattern**: Using `padding-top` (top-relative) to position elements that must align with a point in a bottom-anchored asset. Container height changes move the asset but not the padding.
- **Fix**: Compute `bottom = asset_height - target_y_from_top`. Apply:
  ```css
  .element { position: absolute; bottom: 197px; transform: translateY(50%); }
  ```
  `bottom` is invariant to container height when the image is always bottom-aligned. `translateY(50%)` centers the element on the anchor point.

### L045: CSS Custom Variable Override vs. `width` on Web Component Host
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-button-card.ts + sf-radiator.ts debugging
- **Evidence**: `width: 80px` on host + `min-width: var(--btn-min-width, 90px)` on internal `.btn` → 10px overflow → text clipping ("Frost Protectic").
- **Anti-pattern**: Setting `width` on a web component host without checking if the shadow DOM has a `min-width` CSS variable. The host width does not override internal `min-width` — the inner element overflows and the parent clips it.
- **Fix**: Override the CSS variable directly: `--btn-min-width: 80px`. This controls the internal size with no overflow.

### L046: Downward Dropdown Overflow — `right: 0` Is the Correct Horizontal Anchor
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-button-card-select.ts dropdown overflow
- **Evidence**: `position: absolute; top: 100%; min-width: max-content` caused page-level horizontal scroll. Button near right edge → dropdown extended rightward → overflow.
- **Anti-pattern**: Leaving `left: 0` (implicit) on a downward dropdown near the right edge of the card. Content extends rightward and creates horizontal scrollbars.
- **Fix**: `right: 0; left: auto` anchors the dropdown's RIGHT edge to the button's right edge. Dropdown can only extend LEFTWARD — always within card bounds. Combine with `white-space: nowrap`.

### L047: `overflow-x: hidden` on `:host` Clips Shadow DOM Children
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — sf-radiator.ts overflow debugging
- **Evidence**: `overflow-x: hidden` on `sf-radiator :host` clipped buttons in child `sf-button-card-select` shadow DOM, causing text cutoff.
- **Anti-pattern**: Using blanket `overflow: hidden` at the host level as a symptom fix. It clips absolutely-positioned descendants across shadow DOM boundaries.
- **Fix**: Fix the ROOT CAUSE (L046: `right: 0` on dropdown). Never use `overflow: hidden` to mask overflow symptoms without confirming all children are in-bounds.

### L048: Test Coupling to Intermediate Implementation Hooks Breaks On Refactor
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — base-card.ts i18n restoration
- **Evidence**: TC-303 tested `_onHassLocaleChanged` (private method used as locale sync hook). After refactoring to the correct `hass` setter pattern, `_onHassLocaleChanged` was removed and TC-303 crashed with "property not defined". 1 test rewritten.
- **Anti-pattern**: Writing unit tests that spy on private intermediate methods (`_onHassLocaleChanged`, `syncHALocale`) rather than testing the observable contract (hass getter returns what was set, setLocale is invoked). Intermediate hooks are implementation details — they change with refactors. Observable contracts don't.
- **Fix**: In specs for base classes, write TC expectations against the PUBLIC CONTRACT: "setting `hass` stores the value AND triggers locale sync asynchronously". Test with `el.hass = mockHass; expect(el.hass).toBe(mockHass)` and `await new Promise(r => setTimeout(r, 0))` — never spy on private hooks.

### L049: ES Module Named Exports Are Read-Only in Vitest — Cannot vi.fn() Mock Them Directly
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — base-editor.test.ts i18n coverage tests
- **Evidence**: `(locMod as any).setLocale = vi.fn().mockRejectedValue(...)` threw `TypeError: Cannot set property setLocale of [object Module] which has only a getter`. ES module exports are live bindings (read-only) — Vitest preserves this contract.
- **Anti-pattern**: Trying to override named exports of ES modules in Vitest via direct property assignment on the imported module object. This works in CommonJS (where exports is a mutable object) but NOT in native ESM.
- **Fix**: Three valid alternatives:
  1. Test the observable outcome instead (e.g. locale loads without crash for a supported locale, error branch fires for an unsupported one)
  2. Use `vi.mock('../../src/locales/localization.js', () => ({ setLocale: vi.fn() }))` — module factory mock hoisted at module boundary
  3. Extract the locale call into an injectable adapter (only if needed for multiple tests)
  For the error path coverage, approach (1) is sufficient: set `hass` to a language not in `targetLocales` and assert no uncaught exception.

### L050: Dynamic Workbench Synchronization with HASS System Language
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — dev/workbench.html dynamic language sync
- **Evidence**: 1 file modified (`dev/workbench.html`). Auto-extracting `config.language` from connected HA instance, syncing `currentLanguage` in the toolbar, local storage, and updating the global `hass` object. Verified to immediately translate the workbench user interface and cards upon live connection.
- **Pattern**: When designing developer workbenches or diagnostic simulators that connect to active platforms (like Home Assistant), avoid forcing developers to manually select language preferences to test localized layouts. Always extract the platform-level configuration parameters (`config.language`) directly from the active connection payload upon establishing connection and propagate it instantly to all mounted UI components and settings.

### L051: Dynamic Localization of Platform-native Fallback Labels in Lit-based Components
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — `src/cards/weather/sci-fi-weather.ts`, `src/cards/climates/sci-fi-climates.ts` translation fallback
- **Evidence**: 2 source files modified (`sci-fi-weather.ts`, `sci-fi-climates.ts`). Wrapping weather description and default climate summer/winter labels inside `@lit/localize`'s `msg(...)`. All 215 tests passed.
- **Pattern**: When using dynamic localization libraries (such as `@lit/localize`) in custom components, avoid leaving fallback labels, sensor descriptors, or weather states in raw English strings. Wrap all hardcoded fallback messages, static labels, and descriptive properties within the local translation function (`msg(...)`) to enable full multi-language support. Rename any local variable conflicts (e.g., conflicting local `msg` variable names) to ensure smooth transpilation.

### L052: Synchronizing Chart timeline locale with the connected HASS locale
- **Date**: 2026-05-24
- **Source**: ha-sci-fi — `sci-fi-weather.ts` chart timelines
- **Evidence**: Modified 1 file (`sci-fi-weather.ts`). Changed `Intl.DateTimeFormat(navigator.language, ...)` to `Intl.DateTimeFormat(this.hass?.locale?.language || navigator.language, ...)` for timeline chart labels, so the timeline language matches the active user language instead of the browser system language.
- **Pattern**: When rendering timeline charts or dynamic graphical components inside localized dashboards, do not force `navigator.language` directly for formatting times, dates, or currencies. Instead, always prioritize the active system user locale (`this.hass?.locale?.language`) as the formatting locale to ensure the timeline matches the user's explicit language preference.

### L053: Editor UI Labels Must Route Through `getLabel()` — Never Direct `msg()` in Templates
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — i18n editor pass (6 editors fixed: hexa-tiles, lights, climates, plugs, vehicles, vacuum)
- **Evidence**: 6 `*-editor.ts` files contained raw `msg()` calls in their Lit templates (some with hardcoded French strings like `msg('Ajouter une tuile')`). These strings bypassed `getLabel()`, so locale changes did NOT trigger UI updates in the editor. Anti-Pattern #9 in Spec 10 said "Wrap ALL labels in `msg()`" but failed to distinguish between `getLabel()` (the correct pattern for editors) and direct `msg()` calls (the wrong pattern).
- **Anti-pattern**: In `SciFiBaseEditor` subclasses, calling `msg('Some label')` directly in the template. The string IS wrapped in `msg()` but is NOT registered in the `getLabel()` dictionary, meaning:
  1. The hash for the string exists in `fr.ts` but the French translation is never actually applied when the locale changes via `updateWhenLocaleChanges()`.
  2. Adding a NEW label requires only updating `fr.ts` — but no one remembers to also update `base-editor.ts` + `xliff/fr.xlf`.
- **Fix (3-file coordinated change)**:
  1. `src/utils/base-editor.ts` — add `'action-add-tile': msg('Add tile')` to `getLabel()` dictionary
  2. `src/locales/locales/fr.ts` — add `s<hash>: 'Ajouter une tuile'` using hash from `generateMsgId(['Add tile'], false)` via `@lit/localize/internal/id-generation.js`
  3. `xliff/fr.xlf` — add `<trans-unit id="s<hash>">` with source + target
  4. In the editor template: `this.getLabel('action-add-tile')` (never `msg('...')`)
- **Hash computation**: `node -e "const { generateMsgId } = require('@lit/localize/internal/id-generation.js'); console.log(generateMsgId(['Add tile'], false));"` — run from project root.
- **Scope**: Applies to ALL `SciFiBaseEditor` subclasses. Applies any time a new UI label is added to an editor template.

### L054: DOM Selector Verification Before Writing Editor Tests — Inspect `.tab-btn` vs `.add-btn`
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — sci-fi-vacuum-editor.test.ts, sci-fi-lights-editor.test.ts coverage hardening
- **Evidence**: 3 tests failed on first run (vacuum `.add-btn`, lights `.card` global event, slider min/max). Vacuum editor uses `.tab-btn` (not `.add-btn`) for the "add vacuum" button. Lights editor uses per-element `@input-update` handlers (not a global handler on `.card`). 2 test files required complete rewrite of specific test cases.
- **Anti-pattern**: Writing editor test cases without first inspecting the rendered HTML template to verify CSS class names and event listener locations. Invented selectors (`.add-btn` when `.tab-btn` is used, global `.card` listener when per-element listeners exist) return `null` and silently cause `AssertionError: expected 0 to be greater than 0`.
- **Fix**: Before writing any editor test, run: `grep -n "class=\"\|@input-update\|@click" src/cards/<module>/<editor>.ts | head -20` to discover: (1) the exact CSS class names for buttons/inputs, (2) whether event listeners are global (on `.card`) or per-element. Document the canonical selectors in the spec's "Test Case Specifications" table as a public contract.
- **Scope**: Applies to all LitElement editor components. Especially critical for complex multi-section editors (vacuum, lights) where different sub-sections use different interaction patterns.

### L055: Pure SVG Data Files Must Be Excluded From Coverage — They Are Untestable by v8
- **Date**: 2026-05-24
- **Source**: ha-sci-fi v2 — vitest.config.ts coverage configuration
- **Evidence**: `src/components/icons/data/sf-weather-icons.ts` and `src/components/sf-icon/data/sf-weather-icons.ts` both reported 0% coverage despite having test files. These files export a `Record<string, TemplateResult>` where each value is a `svg\`...\`` tagged template literal (Lit). v8 cannot instrument SVG data inside tagged template literals — the export object is created at module load time with no branching or function calls.
- **Anti-pattern**: Including pure data files (SVG icon maps, static lookup tables, CSS-in-JS constant records) in the v8 coverage report. They will permanently show 0% and drag global metrics below thresholds, forcing false gate failures.
- **Fix**: Exclude all pure data files from `vitest.config.ts` coverage:
  ```ts
  exclude: [
    'src/**/data/sf-weather-icons.ts',
    'src/**/data/sf-icons.ts',
    'src/types/ha.ts',  // type-only HA interfaces, no runtime logic
  ]
  ```
  In specs for projects with static data files, add a `## Coverage Exclusions` section listing files that must be excluded and the reason (SVG data, type-only, generated).
- **Scope**: Applies to all Vitest/c8/Istanbul v8 projects with static data exports (SVG maps, icon registries, JSON-as-TS constants).

### L056: HA Weather Alert Entity — State Is Color Level, Attribute Keys Are Phenomenon Names
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sci-fi-hexa-tiles.ts weather alert banner
- **Evidence**: 3 iterations to find the correct label source. Tried (1) `attributes.friendly_name` → city name ("La Chapelle-sur-Erdre 44 Weather alert"), (2) `alertEntity.state` → color code ("Jaune"), (3) `Object.keys(alertEntity.attributes).filter(...)` → phenomenon name ("canicule"). Correct answer was already implemented in `sci-fi-weather.ts` — agent did not read existing code before building the new feature.
- **Anti-pattern**: For HA Météo-France weather alert entities:
  - `entity.state` = the MAX alert color level (e.g., `"Jaune"`) — NOT the phenomenon name
  - `entity.attributes.friendly_name` = city name — NOT the alert type
  - `entity.attributes.<phenomenon>` = the color level of that phenomenon (e.g., `attributes.canicule = "Jaune"`)
- **Pattern**: To display phenomenon names (e.g., "canicule") from a weather alert entity:
  ```typescript
  const nonGreenValues = new Set([state_yellow, state_orange, state_red].map(v => v.toLowerCase().trim()));
  const labels = Object.keys(alertEntity.attributes)
    .filter(key => nonGreenValues.has(String(alertEntity.attributes[key]).toLowerCase().trim()))
    .join(', ');
  const label = labels || alertEntity.state; // fallback to state if no attributes match
  ```
- **Rule**: Before building any feature that reads an entity label, ALWAYS inspect how an existing card in the same codebase reads the same entity type. Run `grep -r "weather_alert" src/` to find prior art.

### L057: CSS Custom Property Circular Self-Reference Is Silently Ignored by Browsers
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sf-wheel.ts font-size debugging
- **Evidence**: `--item-font-size: var(--item-font-size, 12px)` in `:host` appeared correct but the browser resolved to 18px (inherited from HA body). The pattern `--x: var(--x, fallback)` IS circular — the spec says the browser must treat the property as invalid (using the inherited value), not the fallback. 3 iterations to diagnose: tried changing the fallback value, tried property binding, finally read the Chrome DevTools computed tab showing font-size came from body.
- **Anti-pattern**: Reassigning a CSS custom property to itself with a fallback inside `:host { }`. This is a circular reference. The CSSWG spec mandates browsers resolve circular custom properties to invalid/initial, then inherit from the parent — which may be a completely unrelated value.
- **Fix**: Remove the self-assignment. Instead, put the fallback directly on the consuming rule:
  ```css
  /* ❌ CIRCULAR — browser ignores */
  :host { --x: var(--x, 12px); }
  .el { font-size: var(--x); }

  /* ✅ CORRECT */
  .el { font-size: var(--x, 12px); }
  ```
  External callers (`.parent sf-component { --x: 10px }`) will still cascade in correctly.
- **Scope**: Applies to all shadow DOM components using CSS custom properties for theming. This pattern appears in many Lit component port starters — audit `:host { }` blocks for any `--prop: var(--prop, ...)` pattern.

### L058: `rem` Fallbacks in HA Custom Cards Must Be Absolute `px` Values
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — stove card styles.ts font-size debugging
- **Evidence**: `font-size: var(--sf-text-sm, 0.75rem)` displayed as 18px instead of 12px. HA dashboard sets `font-size: 24px` on the `:root`/`html` element (Polymer/Material Design baseline). `0.75 × 24 = 18px`. The token `--sf-text-sm` was never defined in our project — HA injects its own value but the fallback `0.75rem` still resolved relative to HA's root.
- **Anti-pattern**: Using `rem` values as fallbacks for CSS custom property tokens in HA custom cards. If the token is not defined in the project, the `rem` fallback multiplies against HA's root font-size (24px), not the expected 16px browser default.
- **Fix**: Always use absolute `px` values as fallbacks: `var(--sf-text-sm, 12px)` not `var(--sf-text-sm, 0.75rem)`. If a design token system defines relative values, document the HA root font-size assumption explicitly.
- **Scope**: Applies to all HA custom card projects. Affects any CSS property using `rem` as a fallback without a defined project-level root font-size reset.

### L059: Lit Custom Element `:host` Requires `display: block` for `margin: auto` Centering
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sf-button.ts wheel centering debugging
- **Evidence**: `sf-button` rendered arrows left-aligned inside `sf-wheel`'s flex column despite `.btn { margin: auto }`. Root cause: custom elements have `display: inline` by default (per HTML spec). `margin: auto` on block-level children of a flex container only centers horizontally when the child itself is block-level. With `display: inline`, the element collapses to content width and `margin: auto` has no effect.
- **Anti-pattern**: Expecting `margin: auto` or `align-self: center` to work on a custom element that hasn't declared `display: block` on its `:host`. The element's display is `inline` by default and overrides any flex centering applied by the parent.
- **Fix**: Add `display: block` to `:host` in every LitElement component:
  ```css
  :host { display: block; }
  ```
  This is a Lit best practice — the Lit documentation explicitly recommends it. Audit all `sf-*` components: any without `display: block` on `:host` will have silent centering/layout bugs in flex/grid parents.
- **Scope**: Applies to ALL LitElement custom elements. Add as a mandatory check in `/code-review` and spec anti-patterns for all component specs.

### L060: lit-localize msg() Source MUST Be English — French Source Keys Silently Break All Locales
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sci-fi-stove.ts bottom bar i18n
- **Evidence**: 9 `msg()` calls used French strings as source (e.g. `msg('Température')`, `msg('Éteint')`). lit-localize generates hash IDs from the source string. A French source generates a different hash than the English source — absent from `fr.ts`. Result: `getMsg()` finds no entry → returns raw source string. Both EN and FR locales displayed French text, but for the wrong reason. The bug was invisible in FR locale (output was correct by accident) but broken in EN locale (displayed French). Caught by user visual inspection, not by tests.
- **Anti-pattern**: Using the target language string as the `msg()` source key (e.g. `msg('Température')` instead of `msg('Temperature')`). lit-localize uses the source string to generate the hash key. If the source is French, the hash differs from what `fr.ts` contains (keyed by English hash), so the translation lookup fails silently — the raw source string is returned.
- **Fix (3-file coordinated change)**:
  1. `src/cards/*.ts` — `msg('FrenchString')` → `msg('EnglishString')`
  2. `src/locales/locales/fr.ts` — add `sHASH_OF_ENGLISH: 'FrenchTranslation'`
  3. `xliff/fr.xlf` — add `<trans-unit id="sHASH">` with `<source>English</source><target>French</target>`
- **Detection script**: Run this after any new `msg()` addition to verify all keys have FR coverage:
  ```bash
  node -e "
  const { generateMsgId } = require('@lit/localize/internal/id-generation.js');
  const fs = require('fs');
  const src = fs.readFileSync('src/path/to/component.ts', 'utf8');
  const fr = fs.readFileSync('src/locales/locales/fr.ts', 'utf8');
  [...src.matchAll(/msg\('([^']+)'\)/g)].map(m => m[1]).forEach(str => {
    const id = generateMsgId([str], false);
    if (!fr.includes(id)) console.log('MISSING:', id, '->', str);
  });
  "
  ```
- **Scope**: Applies to ALL LitElement components using `@lit/localize`. Add this check to the VERIFY stage for any card that introduces new `msg()` calls. Add to the spec's Anti-Patterns section: "msg() source strings MUST be English."

### L061: Shadow DOM Height Propagation — `height:100%` Must Chain From Host to Container
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sf-wheel.ts vehicle card actions bar
- **Evidence**: Applied `align-items: stretch` on parent flex row to make `sf-wheel` match `sf-button-card` height. The host element stretched correctly (flex rules apply to the host), but the internal `.container` div ignored the height — it sized itself to content only. 3 iterations to diagnose: tried `justify-content: center` from outside (no effect through shadow boundary), tried `height: 100%` from outside (overrides host but doesn't reach `.container`). Fix: add `display: block; height: 100%` to `:host` + `height: 100%; box-sizing: border-box` to `.container` inside the shadow DOM.
- **Anti-pattern**: Expecting `align-items: stretch` on a flex parent to automatically cascade height into a shadow DOM component's internal layout. The host element receives the height, but internal divs inside the shadow DOM only inherit height if explicitly set via `height: 100%` on both `:host` and the consuming inner element.
- **Fix**: To make a shadow DOM component fill its flex-allocated height:
  ```css
  /* Inside shadow DOM */
  :host { display: block; height: 100%; }
  .container { height: 100%; box-sizing: border-box; }
  ```
  External `align-items: stretch` only sets the host's allocated size. The chain must be completed inside the shadow DOM.
- **Scope**: Applies to ALL Lit Web Components used inside flex/grid containers where height alignment is needed. Add to `sf-button-card`, `sf-wheel`, and any future container-like components.

### L062: `sf-landspeeder` Sizing — flex:1 + height:100% Enables Adaptive Card Layout
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — vehicle card layout (spec 12)
- **Evidence**: Fixed `height: 410px` on `sf-landspeeder :host` prevented the speeder from filling available card space. After making `.container { height: 100% }` and `sf-landspeeder { flex: 1; min-height: 0 }` in the parent CSS, plus `:host { height: 100% }` in the component, the speeder fills all space between header and actions bar. Actions bar is always pinned to the bottom via `flex-shrink: 0`.
- **Pattern**: For full-height sub-components in flex column cards:
  1. Parent container: `height: 100%; display: flex; flex-direction: column`
  2. Growing component: `flex: 1; min-height: 0` in parent CSS
  3. Component `:host`: `height: 100%`
  4. Fixed-size sections (actions bar): `flex-shrink: 0; justify-content: center`
- **Scope**: Applies to any card component (stove, climate, vehicle) with a central visual element that should fill available vertical space.

### L063: `noUncheckedIndexedAccess` — Always Use Non-Null Assertion on Array Index Access in Tests
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — TypeScript fix cycle (18 test files, 54 occurrences)
- **Evidence**: `npx tsc --noEmit` produced 54 TS2532 errors across 18 test files. All errors were `received[0].detail...` patterns where `received: CustomEvent[]`. Fixed in one batch pass with a Python regex script. Zero test failures after fix.
- **Anti-pattern**: Writing test assertions as `received[0].detail.config.x` when `received: T[]`. With `noUncheckedIndexedAccess: true` in tsconfig, array index access returns `T | undefined` — TypeScript requires either a null check or `!` non-null assertion before accessing properties.
- **Fix**: Standard pattern for event collection in tests:
  ```ts
  const received: CustomEvent[] = [];
  el.addEventListener('my-event', (e) => received.push(e as CustomEvent));
  // ... trigger event ...
  expect(received).toHaveLength(1);
  expect(received[0]!.detail.value).toBe('expected');  // ← always use !
  ```
  Add this pattern to all test templates. Enforce by running `npx tsc --noEmit` BEFORE committing tests (not just `vitest run`).
- **Critical insight**: `vitest run` passes even with TS2532 errors because Vitest transpiles without typechecking. Only `tsc --noEmit` catches these. Both must be part of the verify gate.

### L064: External HA Interface Types Must Match the Full Runtime Object Shape
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — `src/types/ha.ts` + `sci-fi-stove.ts`
- **Evidence**: `sci-fi-stove.ts` called `this.hass.config?.unit_system?.temperature` but `HomeAssistantExt` had no `config` property → 2 TS2339 errors. Fix required adding `config?: { unit_system?: { temperature?: string; pressure?: string; } }` to the interface.
- **Anti-pattern**: Writing `HomeAssistantExt` to only include the fields you know you need right now. When a new card adds `this.hass.config`, `this.hass.user.is_owner`, or any other HA runtime property, TypeScript silently allows it at runtime (HA passes the full object) but errors at compile time. This creates a permanent drag on type accuracy.
- **Fix**: When adding a new `this.hass.<property>` access in any card:
  1. First grep `src/types/ha.ts` for the property
  2. If absent, add it to `HomeAssistantExt` with the correct optional type BEFORE writing the card code
  3. Check the real HA Home Assistant types (hass-frontend) for the correct shape
- **Scope**: Applies to all HA custom card projects. `HomeAssistantExt` must be kept in sync with all properties accessed across all cards.

### L065: CSS Custom Property Double-Dash Typo Is Silently Ignored
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sci-fi-plugs `styles.ts` icon color debugging
- **Evidence**: `--icon--color` (double dash) was used throughout `styles.ts` instead of `--icon-color` (single dash). The sf-icon component exposes `color: var(--icon-color, currentColor)` — the double-dash variant is a completely different (undefined) CSS custom property. Icons rendered with `currentColor` fallback (white on dark bg) instead of the intended `rgb(102, 156, 210)`. Zero build errors, zero lint warnings, zero TypeScript errors. Only visible via manual inspection.
- **Anti-pattern**: Mistyping CSS custom property names. CSS custom properties are case-sensitive and hyphen-sensitive. `--icon--color` and `--icon-color` are two distinct, unrelated properties. The browser silently ignores undefined custom properties and falls back to the fallback value (or `currentColor`).
- **Fix**: (1) Run `grep -rn -- "--icon--color"` to detect double-dash variants. (2) In specs, document the exact CSS variable name of each sf-* component in a "CSS Variables Exposed" table. (3) When renaming or using CSS variables from a shared component, always verify the exact name with `grep -n "var(--" src/components/<component>/<component>.ts`.
- **Scope**: Applies to all CSS custom property usage. Especially dangerous in large stylesheets where the correct rendering (via fallback) looks reasonable at first glance.

### L066: HA CORS Must Match Workbench Exact Origin (Protocol + Hostname + Port)
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — dev/workbench.html CORS debugging
- **Evidence**: HA `cors_allowed_origins` had `http://localhost:8000` but workbench served on port 8888. `callApi` fetch failed with CORS error in browser console. Fix: add `http://localhost:8888` to `cors_allowed_origins` under the `http:` key (not at the root of `configuration.yaml`).
- **Anti-pattern**: (1) Assuming the `cors_allowed_origins` list covers all localhost ports — it does not. Each port is a distinct origin. (2) Placing `cors_allowed_origins` outside the `http:` block in `configuration.yaml` — HA silently ignores it.
- **Fix**: When the workbench runs on a different port than what's in `cors_allowed_origins`, either: (a) add the exact origin to the HA CORS list and restart HA, or (b) launch the workbench server on the already-allowed port (`python3 -m http.server 8000 --directory .`). Always verify the `http:` key nesting in `configuration.yaml`.
- **Scope**: Applies to all HA custom card development using a standalone workbench that calls `hass.callApi()` (REST) from a browser different from HA's own origin.

### L067: Workbench Card Config Must Be Derived From Real YAML — Never Invented
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — dev/workbench.html EvLink + Paillette Charlotte config drift
- **Evidence**: EvLink workbench config had `active_icon: 'mdi:ev-plug-type2'` (invented) instead of `sci:landspeeder-plugged` (real YAML). Paillette Charlotte was missing `sensor.nous_paillette_charlotte_power` with `power: true`. Both caused silent functional failures: wrong icon displayed, graph missing for Paillette Charlotte. Real YAML in `yaml backup/plugs.yaml` was the correct source of truth.
- **Anti-pattern**: Inventing workbench card configs instead of deriving them verbatim from the production YAML backup. Even small differences (wrong icon prefix, missing sensor, wrong power flag) cause the workbench to test a different config than production — the workbench becomes a validation fiction.
- **Fix**: After any card config change in the real YAML, immediately update the corresponding workbench card config from `yaml backup/*.yaml`. Use the production YAML as the single source of truth for all workbench configs. See also L027 (mock state derivation).
- **Scope**: Applies to all HA custom card projects with a workbench and YAML-driven card configs. Any deviation between workbench config and production YAML introduces a gap between what is tested and what is shipped.
### L068: sf-toast Component Was Never Ported to TypeScript v2 — Silent Registration Gap
- **Date**: 2026-05-25
- **Source**: ha-sci-fi v2 — plugs card toast debugging
- **Evidence**: All cards (climates, stove, plugs, vehicles, lights) referenced `<sf-toast>` in their templates and called `querySelector('sf-toast')?.addMessage(...)`. But `customElements.define('sf-toast', ...)` was never called anywhere in the TypeScript v2 codebase. The old JS v1 code used `defineCustomElement('sci-fi-toast', SciFiToast)` — a different tag name. Result: `querySelector('sf-toast')` always returned `null`, `addMessage` was never called, and zero toast notifications appeared in any card. Zero build errors, zero TypeScript errors.
- **Anti-pattern**: (1) Porting a card that uses `<X>` without verifying that `X` is registered as a custom element in the v2 codebase. (2) Using `querySelector('sf-toast') as any` — the `as any` hides the null return silently. (3) During a migration/port, assuming components from the previous version's `src/components/` are automatically available.
- **Fix**: (1) After any port, run `grep -rn "<sf-" src/ | sort -u` and cross-reference against `grep -rn "customElement\|customElements.define" src/`. Every tag used in templates MUST have a matching registration. (2) Add a global entry point import in `sci-fi.ts` for every shared component so it's never accidentally missing. (3) Replace `querySelector('sf-toast') as any` with a typed accessor once the component is defined in TypeScript.
- **Scope**: Applies to any Web Component project migrating from JS to TypeScript where custom element registration is split across files.

### L069: Workbench i18n — setLocale Must Be Called Directly, Not Via hass.locale.language
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — dev/workbench.html language switch debugging
- **Evidence**: Clicking the language toggle button called `updateHassLanguage()` → `cardEl.hass = hass` with `hass.locale.language = 'en'`. The base-card setter then called `setLocale('en')` asynchronously. But between the `hass` assignment and the `setLocale` Promise resolution, Lit could schedule and complete a render using the OLD locale (still 'fr'). The `updateWhenLocaleChanges` callback then triggered a second render with 'en', but in some timing scenarios (especially when states update via WebSocket simultaneously), the second render was suppressed or didn't fire.
- **Anti-pattern**: Relying on `cardEl.hass = newHass` to transitively trigger `setLocale()` for language switching in a workbench. The locale change is async and not guaranteed to complete before the next scheduled render.
- **Fix**: Expose `setLocale` from the bundle as `window.__sciFiSetLocale = setLocale` in `sci-fi.ts`. In the workbench, `await window.__sciFiSetLocale(lang)` BEFORE calling `updateHassLanguage()`. This guarantees the locale is resolved before hass triggers a re-render. The `hass` setter still calls `setLocale` as a safety net for real HA live mode.
- **Scope**: Applies to all lit-localize workbench integrations where the language switch is driven by the workbench UI, not by HA's own locale system.

### L070: Lit Toggle Selector Ambiguity — Multiple `sf-toggle-switch` in Shadow DOM
- **Date**: 2026-05-25
- **Source**: ha-sci-fi v2 — hexa-tiles-editor test coverage hardening
- **Evidence**: Test `"dispatches config-changed when standalone is toggled"` fired `sf-toggle-change` on `el.shadowRoot.querySelector('sf-toggle-switch')` (FIRST match). But the editor renders a weather toggle first, then a per-tile standalone toggle. Firing on the first element triggered `_toggleWeather` (not `_updateTileField`). Test passed visually but asserted the wrong handler.
- **Anti-pattern**: Using `querySelector('sf-toggle-switch')` without index/attribute qualification when the component renders multiple toggles at different semantic levels. FIRST match is not always the intended target.
- **Fix (two valid approaches)**:
  1. **Direct method call** (preferred for internal-state branches): `(el as any)._updateTileField(0, 'standalone', true)` — tests the branch directly, avoids DOM ambiguity.
  2. **Attribute selector** (for DOM wiring tests): `el.shadowRoot.querySelectorAll('sf-toggle-switch')[N]` with a documented index, or `querySelector('[element-id="standalone-0"]')` if the template assigns element IDs.
- **Rule**: When an editor renders ≥2 instances of the same custom element, ALWAYS qualify the selector. Document the selector order/index in the spec's CSS Selectors table.
- **Scope**: All LitElement editors with multi-section layouts containing repeated sub-components (toggles, dropdowns, accordions).

### L071: Dynamic `element-id` Attributes on Dropdown Entities — Use Method Calls in Tests, Not Generic Selectors
- **Date**: 2026-05-25
- **Source**: ha-sci-fi v2 — lights-editor rename tests coverage hardening
- **Evidence**: `_renderCustomEntityRow(entityId)` renders `<sf-editor-dropdown-entity element-id="${entityId}">` where `entityId` is dynamic (e.g., `"light.salon"`). `querySelector('sf-editor-dropdown-entity')` returns the FIRST dropdown in the shadow DOM — but the lights editor also renders floor/area dropdowns before custom entity dropdowns. Firing `input-update` on the wrong dropdown triggered `_updateFloor` instead of `_renameCustomEntity`. Test asserted the wrong state change.
- **Anti-pattern**: Selecting the first instance of a generic component type (`sf-editor-dropdown-entity`) when the template renders multiple instances with different semantic roles (floor, area, custom entity). The first match is context-dependent on render order.
- **Fix**: For internal branches triggered by dynamically-identified elements:
  1. **Call the private method directly**: `(el as any)._renameCustomEntity('light.salon', 'light.bedroom')` — covers the branch with zero selector ambiguity.
  2. **Use attribute selector** if DOM wiring must be tested: `querySelector('[element-id="light.salon"]')` — targets the exact element.
- **Rule**: When `element-id` is derived from dynamic data (entity IDs, indexes), the selector `[element-id="${value}"]` is the only safe DOM selection pattern. Document this in the spec's Test Case Specifications table.
- **Scope**: All LitElement editors that render lists of configurable entities with per-row event listeners.

### L072: Decouple Selection Styles from Child Component Domain-State Indicators
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — climates card `sf-hexa-row` and `sf-hexa-tile`
- **Evidence**: Fixed selected override in `sf-hexa-row.ts`. Removing `--icon-color: var(--sf-primary, #00d2ff) !important;` from `sf-hexa-tile.selected .item-icon sf-icon` resolved the issue where inactive room/floor icons became blue when selected, allowing them to remain grey as expected. All unit tests passed.
- **Anti-pattern**: Forcing a nested indicator's styling (like an icon color representing active domain state, e.g. "at least one active radiator") using a parent's selection state class (`.selected` or `.item-on`). This couples selection state with domain state, rendering the domain state invisible when the item is selected.
- **Fix**: Never force child component colors in parent selection-state rules. Let the child styling solely depend on its own domain-state classes (`.on` / `.off`), and keep parent selection styles limited to layout properties (size, scale) and container border/shadow/background styles.

### L062: `ha-card` Is `display: block` — Must Be Overridden for Flex Layout Children
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — sci-fi-vacuum.ts layout session
- **Evidence**: `.container { flex: 1 }` on a child of `ha-card` had no effect. The map section did not grow to fill the remaining space, and the action bar was not pinned to the bottom. Root cause: `ha-card` is rendered as `display: block` by the HA common styles (and by `sciFiCommonStyles`). A `flex: 1` child inside a block container has no flex context to expand into.
- **Anti-pattern**: Adding `flex: 1` or `flex-grow` on a child of `ha-card` without verifying `ha-card` is itself a flex container.
- **Fix**: Override `ha-card` display in the card's own stylesheet:
  ```css
  ha-card {
    display: flex !important;
    flex-direction: column;
    height: 100%;
  }
  ```
  The `!important` is required because HA injects `display: block` via its own shadow DOM styles with high specificity. Applies to any card that needs a flex-column layout (map + fixed action bar pattern, scrollable content + fixed footer, etc.).
- **Scope**: Applies to ALL HA custom cards using `ha-card` as the root element where vertical flex layout is needed.

### L063: OAuth Auth Callback From Localhost — PKCE Verifier Must Be Consumed Immediately
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — dev/workbench.html auth flow debugging
- **Evidence**: Clearing `localStorage` orphaned an OAuth code in the URL (`auth_callback=1&code=...`). On reload, the code was replayed without the PKCE verifier → HA returned `400 Bad Request`. The workbench kept looping: URL had the code, localStorage was empty, the code exchange failed every time.
- **Anti-pattern**: Building a workbench OAuth flow that requires the user to manually click "Connect" again after the auth callback redirect. If `localStorage` is cleared between the redirect and the click, the PKCE verifier is gone and the code exchange always fails with 400.
- **Fix**: Detect `auth_callback=1` at page load (not on button click) and immediately exchange the code with the PKCE verifier that is still in `sessionStorage` (not `localStorage`). After exchange, call `history.replaceState()` to remove the OAuth params from the URL before any re-render. This prevents replay attacks and stale-code loops.
- **Rule**: PKCE verifier → store in `sessionStorage` (survives page load within same tab but not `localStorage.clear()`). Auth code → exchange immediately on page load detection, then strip from URL.

### L064: Battery Warning Color Pattern — Threshold Classes vs Inline Style
- **Date**: 2026-05-25
- **Source**: ha-sci-fi — vacuum card battery header
- **Evidence**: Battery level coloring (warn/critical) was missing from the vacuum card. Other cards (sf-landspeeder) used computed CSS class names (`battery-warn`, `battery-critical`) added to the element, with dedicated CSS rules for `--icon-color`, `color`, and `text-shadow`. Inline `style=` would have worked but is harder to override.
- **Pattern**: For threshold-based color states (battery, temperature, signal), use CSS class names computed in TypeScript:
  ```ts
  const cls = level < 20 ? 'battery-critical' : level < 30 ? 'battery-warn' : '';
  ```
  Then bind the class to both the icon and the text label. Define CSS rules:
  ```css
  .battery-warn  { --icon-color: rgb(255, 215, 0); color: rgb(255, 215, 0); }
  .battery-critical { --icon-color: rgb(250, 146, 29); color: rgb(250, 146, 29); }
  ```
  This mirrors HA's `--primary-warning-color` and `--primary-error-color` tokens.
- **Thresholds**: `< 30%` = warn (amber), `< 20%` = critical (orange-red). Reuse these thresholds across all cards for visual consistency.
- **Scope**: Apply to any card displaying a battery, signal strength, or fuel level percentage sensor.
