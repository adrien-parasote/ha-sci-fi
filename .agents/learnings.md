
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
