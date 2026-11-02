---
spec: docs/specs/icon-contract/spec.md
sources:
  - docs/specs/04_components.md
  - src/components/sf-icon/sf-iconset.ts
  - src/components/sf-icon/sf-icon.ts
  - src/components/sf-icon/sci-icon.ts
  - src/components/sf-icon/icon-cache.ts
---

# Icon contract — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-6vj`, from the 2026-10-31 retrocheck of [Spec 04](../04_components.md). The icon socle says more than it does, in seven places: `getIcon()` hands a lit `TemplateResult` to HA in a `path: string` field for the 46 animated weather icons (#37; the retrocheck counted 33, the data file holds 46); `sci-icon.ts` is a 218-line copy of `sf-icon.ts`, not an alias (#35); the HA picker lists 61 icons while the editor dropdown offers 28 (#39); F-COMP-03 once ticked components that never existed (#33); AP#3 "shadow DOM" is violated by `sf-icon`/`sci-icon` (#34); AP#5 "5 concurrent fetches" is claimed but absent (#36); `sf-toast.ts` imports `lit-html`, which no `package.json` section declares (#47). Where the code can serve the documented contract it is changed; where the document cannot be served as written it is amended to the measured truth, and every claim then owes a test that fails when it stops being true. Calls that are the author's, not agreed with anyone, are marked *mine* and listed under [Builder Calls](#builder-calls). Rulings already made by the user (28-icon picker, light-DOM exception with AP#3 amended) are not *mine*.

**State on entry (verified).** The F-COMP-03 row of Spec 04 already says `sf-editor-accordion` + `sf-toggle-switch` and "no `sf-tabs`" (#33's text defect is fixed on main); what is missing is a guard. TC-408's `if/else` was already replaced by an unconditional assertion on `stove`; what is missing is the weather half and TC-407's membership check.

## Requirements

- **FR-1** (#37): `getIconForIconsets` (`window.customIconsets.sci`) and `getIconForPicker` (`window.customIcons.sci.getIcon`) resolve names only by OWN-key lookup (`Object.hasOwn`) in a map built from `sf-icons.ts` ONLY, typed `Record<string, string>`; `constructor`, `toString`, `__proto__`, `hasOwnProperty` and every inherited name are unknown names. No `as unknown as` cast remains in `sf-iconset.ts` NOR in `sf-icon.ts` (its two casts go with the FR-1.1 rewrite). For every name they resolve, `path` is a non-empty `string`. A name that is not a static icon (an animated weather icon, or unknown) takes the unknown-icon branch: `getIconForIconsets` logs `[sf-iconset] Icon "sci:<name>" not available` and returns `''`; `getIconForPicker` returns `{ path: '', viewBox: '0 0 24 24' }` and logs nothing. In the log, `<name>` is the config-supplied name reduced to printable ASCII (anything else becomes `?`) and cut at 64 characters, so a name cannot forge a second log line. Which of the two routes HA's `ha-icon` takes is not asserted: both are covered (Assumption 9).
- **FR-1.1** (#37, F-02): animated rendering in `<sf-icon>`/`<sci-icon>` is restricted to the module-local `WEATHER_ICONS` imported from `sf-weather-icons.ts`, looked up by OWN key (`Object.hasOwn`) for the prefixes `sci` and `sf`. An object found in the page-global `window.customIcons` (any prefix, including a foreign key added to `window.customIcons.sci`) is never rendered as a template. String paths found in `window.customIcons[prefix]` keep resolving as today, by own key.
- **FR-2** (#39): `getIconList()` returns exactly the 28 static names (the keys of `sf-icons.ts`) and none of the 46 weather names (the count is derived from `data/sf-weather-icons.ts` by the tests, never written in them); one exported constant `STATIC_ICON_NAMES` (in `src/components/sf-icon/icon-names.ts`) is the single source read by `sf-iconset.ts` and by `sf-editor-dropdown-icon.ts`, so the two lists agree by construction. HA's picker draws a `path`; an animated `TemplateResult` cannot be drawn there, so it is not listed.
- **FR-3** (#35): `SciIcon` is a subclass of `SfIcon` that declares only its tag (`@customElement('sci-icon')`) and two protected hooks that `SfIcon` defaults: `iconClass` (`sf-icon` → `sci-icon`) and `logPrefix` (`[sf-icon]` → `[sci-icon]`); it re-implements no method of `SfIcon`. `sci-icon.ts` falls from ~218 lines to under 40. Observable behaviour of both elements is unchanged, including the loading state, which renders `<svg class="<iconClass> <iconClass>--loading">` (`sf-icon sf-icon--loading`, `sci-icon sci-icon--loading`), and the `console.warn` messages, which start with `logPrefix`.
- **FR-4** (#34): `sf-icon` and `sci-icon` render in the LIGHT DOM on purpose (`createRenderRoot` returns `this`, defined once in `SfIcon`); this is a declared exception to AP#3, written in Spec 04 (§ Anti-Patterns row 3 and Assumption 3). The set of `src/` files overriding `createRenderRoot` is pinned to `sf-icon.ts`, so a new light-DOM component fails a test until the spec names it. The cost of the exception (shared SVG id scope) is FR-10.
- **FR-5** (#33): in Spec 04 § Blueprint Coverage, every `sf-*`/`sci-*` element name written in backticks in a `✅` row, before its `⬜` if the row has one (names after the `⬜` are the missing ones and are skipped), is declared by a `@customElement('<name>')` somewhere under `src/`. A backticked token that is a file or directory (ends in `.ts`, or contains `/`) is not an element name. A guard test fails otherwise.
- **FR-6** (#36): the 5-concurrent-fetch limit of AP#5 holds by construction: all MDI lookups of one `connection` object share ONE `frontend/get_icons` request (`registryPromises`, a `WeakMap`), so N concurrent `resolveIcon` calls for N distinct names issue exactly one `sendMessagePromise`. No limiter is added. Caveats written in AP#5: the bound is per `connection` object; it concerns only the path where no `ha-icon` is registered (live HA renders `<ha-icon>` natively); and a failed request deletes the cached promise, so the next render retries (one request in flight at a time, but one per render while it keeps failing). The claim "with a concurrent-fetch rate limiter" is removed from the header of `icon-cache.ts`.
- **FR-7** (#47): `sf-toast.ts` imports `render` from `'lit'` (which re-exports it from `lit-html`), not from `'lit-html'`; every bare package specifier imported under `src/` — in any form: `import x from`, `import 'x'`, `export … from 'x'`, `export * from 'x'`, dynamic `import('x')`, type-position `import("x")` — is declared in `package.json` `dependencies` or `devDependencies` (a guard test; `@scope/pkg/sub` and `pkg/sub` resolved to their package name). This removes the only undeclared import; it does not claim to prove a single `lit-html` copy in the bundle (a declared dependency can still nest another one).
- **FR-8**: Spec 04 is amended with FR-1 to FR-7 wording where it differs — § Public Interface (`<sci-icon>` row), § Anti-Patterns rows 1 (scope: the casts are banned in `src/components/sf-icon/`), 3 and 5, Assumption 3, § HA Icon Picker API, TC-407, TC-408, § Error Handling — and the headers of `sci-icon.ts` and `icon-cache.ts` no longer state anything this spec contradicts (no "Mirrors … exactly", no "rate limiter"). Row F-COMP-05 is unchanged. A guard test reads these texts (TC-ICC-U-10).
- **FR-9** (F-14): the 46 weather icons leaving HA's icon picker is told to users: one release-note line is written in `CHANGELOG.md` under `# Unreleased`, reading "**Icons**: the 46 animated weather icons no longer appear in the Home Assistant icon picker, which can only draw static paths; they still render in cards through `<sf-icon>` / `<sci-icon>`, and existing configurations are unaffected". A test checks the line (TC-ICC-U-11).
- **FR-10** (F-12, risk taken — user's decision, ruling of this lot): with FR-4 making the light DOM permanent, the weather SVGs of `sf-weather-icons.ts` reuse ids (`x1`, `x2`, `b`) in ONE id scope, so two weather icons in the same card can resolve a `<use href="#b">` or a gradient to the first one's definition. The risk is TAKEN, not fixed in this lot; no test can pin an overlap that depends on the page. Follow-up bead `ha-sci-fi-rq0` (P3) uniquifies the ids. Marked [ACCEPTED-LIMIT: user, this lot — rendering collision across two icons of one page, no stable test; owned by ha-sci-fi-rq0].

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `sf-weather-icons.ts` holds 46 keys (33 of them `svg` on one line, 13 multi-line) and `sf-icons.ts` 28 strings (`grep -cE "^  '?[a-zA-Z_-]+'?:"` → 46 and 28 respectively); the count is measured in the worktree and derived by the tests | Low | SHOW — both counts run in the worktree | TC-ICC-U-02 |
| 2 | `sf-iconset.ts:24` casts `WEATHER_ICONS as unknown as Record<string, string>` and `getIconList` therefore lists 61 | Low | SHOW — read of the file | TC-ICC-U-01 |
| 3 | `SciIcon` and `SfIcon` differ only by tag, header, the svg class (`sci-icon` / `sf-icon`), the loading class (`sci-icon--loading` / `sf-icon--loading`) and the warn prefix (`[sci-icon]` / `[sf-icon]`) (`diff sf-icon.ts sci-icon.ts`; sci-icon.ts:145,154,163,189,200) | Medium | SHOW — diff run and read of the lines | TC-ICC-U-03, TC-ICC-U-05, IT-ICC-I-01 |
| 4 | `lit` 3.x re-exports `render` from `lit-html`, so `import { render } from 'lit'` is the same function; `lit-html` is present only as a transitive dependency (the lit-html package exists in the main checkout's installed dependencies, absent from `package.json`) | Low | SHOW — list the installed lit-html package directory in the main checkout and `grep lit package.json` | TC-ICC-U-07 |
| 5 | `getMdiRegistry` caches one promise per `connection` in a `WeakMap`, so concurrent lookups share one request; a rejected request deletes its entry (icon-cache.ts:86) | Low | TELL — read of `icon-cache.ts` | TC-ICC-U-06, IT-ICC-I-03 |
| 6 | HA's icon picker/`ha-icon` renders only `{path, viewBox}`, never a template | Medium | TELL — HA custom-iconset contract (`getIcon` → `{path, viewBox}`) | none runnable; user ruling: 28-icon picker |
| 7 | Cards style `sf-icon` from outside only through its host tag and `--icon-*` custom properties, so the light DOM is not load-bearing for card CSS | Medium | SHOW — `grep -rnE "\.sf-icon\|sf-icon svg" src` → host-tag selectors in `cards/climates/styles.ts` only | TC-ICC-U-04 |
| 8 | Weather SVGs reuse ids (`x1`, `x2`, `b`) and the light DOM shares one id scope, so two icons of one page may collide | Medium | TELL — read of `sf-weather-icons.ts` | FR-10 (risk taken), bead `ha-sci-fi-rq0` |
| 9 | In live HA, `ha-icon icon="sci:x"` reads `window.customIcons.sci.getIcon` (picker form, silent `''` path), while `window.customIconsets.sci` is the documented iconset route (logs); which one HA uses is not testable here | Medium | TELL — HA frontend behaviour | TC-ICC-U-01 asserts both routes |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | A double cast through `unknown` to hide a type that does not fit (banned in `src/components/sf-icon/`) | Build the map from the one data set whose values fit the contract |
| 2 | A test branch that passes on both outcomes (`if (object) … else expect('')`) | One unconditional assertion per case, one case per branch |
| 3 | A second implementation of an element "mirroring" the first | Subclass: tag and hooks only |
| 4 | A doc claim (limiter, shadow DOM, component list) with no test behind it | Either the code serves it and a test fails when it stops, or the doc says what the code does |
| 5 | Importing a package that `package.json` does not declare | Import from the declared package (`lit`), or declare the dependency |
| 6 | Two hand-kept lists of the same icons | One exported constant read by both |
| 7 | A guard test with no negative fixture (a regex blind to a form passes green) | Every guard test feeds its detector one fixture it must flag |

## Test Case Specifications

New tests: `tests/components/sf-icon/icon-contract.test.ts` (TC-ICC-U-01 to 03, 05, 06, 09, IT-ICC-I-01 to 03) and `tests/docs/icon-contract-guards.test.ts` (TC-ICC-U-04, 07, 08, 10, 11). Each id appears verbatim in its test title. Written first, watched red, then made green.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-ICC-U-01 | `customIconsets.sci(name)` and `customIcons.sci.getIcon(name)` for `stove` and every name of `STATIC_ICON_NAMES`; then for `clear-night-day` (weather), an unknown name, and the inherited names `constructor`, `toString`, `__proto__`, `hasOwnProperty`; then a name `"a\n[sf-iconset] forged"` | FR-1 | Static: `typeof path === 'string'`, length > 0, `viewBox '0 0 24 24'`. Weather, unknown and inherited: iconsets returns `''` and logs one `not available` line; picker returns `path ''` and does not log. The forged name logs ONE line with no newline and the part after 64 chars cut. `sf-iconset.ts` and `sf-icon.ts` sources hold no `as unknown as` |
| TC-ICC-U-02 | `getIconList()` names vs `STATIC_ICON_NAMES` and vs the weather keys | FR-2 | Exactly 28 names, equal to `STATIC_ICON_NAMES`; none of the 46 weather keys (count derived from the data); `stove` and `landspeeder` present |
| TC-ICC-U-03 | `SciIcon` shape | FR-3 | `SciIcon.prototype instanceof SfIcon`; own prototype keys are `constructor` plus the `iconClass` and `logPrefix` hooks; `sci-icon.ts` under 40 lines; tag `sci-icon` registered |
| TC-ICC-U-04 | Scan of `src/` for `createRenderRoot` | FR-4 | Exactly one file, `src/components/sf-icon/sf-icon.ts`; Spec 04 AP#3 text names `sf-icon`/`sci-icon` as the light-DOM exception |
| TC-ICC-U-05 | Svg class, loading state and warnings of both elements | FR-3 | `sf-icon` renders `svg.sf-icon`; `sci-icon` renders `svg.sci-icon`; while loading, `sf-icon` renders `svg.sf-icon.sf-icon--loading` and `sci-icon` renders `svg.sci-icon.sci-icon--loading`; an unknown namespace (`foo:bar`) makes `sf-icon` warn with a message starting `[sf-icon]` and `sci-icon` with one starting `[sci-icon]` |
| TC-ICC-U-06 | Header of `icon-cache.ts`; 10 concurrent `resolveIcon` calls on a fake `connection` for 10 distinct names (cache cleared first); then a request that rejects followed by a second call | FR-6, FR-8 | `sendMessagePromise` called exactly once; header text holds no `rate limiter`; after the rejection the next call sends a second request (retry pinned, one in flight at a time) |
| TC-ICC-U-07 | `sf-toast.ts` imports; every bare specifier imported under `src/` against `package.json`; the detector fed one fixture per form: `import 'lit-html'`, `import x from 'lit-html'`, `export { x } from 'lit-html'`, `export * from 'lit-html'`, `await import('lit-html')`, `type T = import("lit-html").X` | FR-7 | No `from 'lit-html'` in `sf-toast.ts` (`render` comes from `'lit'`); the set of undeclared specifiers under `src/` is empty; each of the six fixtures is reported as undeclared (negative fixtures) |
| TC-ICC-U-08 | Spec 04 Blueprint Coverage: each backticked `sf-*`/`sci-*` name of a `✅` row, before the `⬜` if any; the detector fed fixtures: (a) `✅ \`sf-ghost\`` with no `⬜`, (b) `✅ … ⬜ \`sf-tabs\`` read before the `⬜`, (c) `✅ \`sf-icon.ts\`` and `✅ \`src/components/sf-icon/\`` | FR-5 | Every real name has a `@customElement`; (a) reported as undeclared, (b) reported as undeclared when placed before the `⬜` and skipped when after it, (c) not reported (file tokens) |
| TC-ICC-U-09 | `<sf-icon icon="sci:evil">` with `window.customIcons.sci.evil` set to a lit template and to a `{ values: [] }` object; `<sf-icon icon="sci:constructor">`; then `<sf-icon icon="sci:clear-night-day">` | FR-1.1 | The foreign template and object are never rendered (no `svg` built from them; the unknown-icon fallback renders); `constructor` renders no template; the real weather icon still renders its animated `svg` |
| TC-ICC-U-10 | Texts: header of `sci-icon.ts`; Spec 04 `<sci-icon>` Public Interface row, AP#1, AP#3, AP#5, HA Icon Picker API, TC-407, TC-408, Error Handling rows | FR-8 | `sci-icon.ts` header has neither `Mirrors` nor `identical`; Public Interface row says `subclass`; AP#1 names `src/components/sf-icon/`; AP#5 says `by construction` and `per connection`; picker section and TC-407/408 name `STATIC_ICON_NAMES`; Error Handling names the picker-form `getIcon` route |
| TC-ICC-U-11 | `CHANGELOG.md` | FR-9 | Under `# Unreleased`, a line contains `the 46 animated` (the weather key count of the data) and `icon picker` and `<sf-icon>` |
| IT-ICC-I-01 | Real elements `<sf-icon icon="sci:clear-night-day">` and `<sci-icon icon="sci:clear-night-day">` appended to `document.body` | FR-1.1, FR-3 | Both render the animated `svg` (a `<use>` or `<animateTransform>` child, not a `path` string); `<sci-icon icon="sci:stove">` renders `svg.sci-icon > path` |
| IT-ICC-I-02 | The HA picker path as HA drives it: `await window.customIcons.sci.getIconList()`, then `getIcon(name)` on each entry; the options of a mounted `sf-editor-dropdown-icon`, filtered to those prefixed `sci:` (the dropdown also lists `mdi:` names) | FR-1, FR-2 | 28 entries, each resolves to a non-empty string `path`; the `sci:`-filtered dropdown options equal `STATIC_ICON_NAMES` prefixed `sci:` |
| IT-ICC-I-03 | Two `<sf-icon icon="mdi:…">` elements with one fake `connection` set, in a non-live-HA environment (no `ha-icon` registered), distinct names, rendered together | FR-6 | `sendMessagePromise` called once; both render a `path` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| `getIcon('<weather name>')` through the `ha-icon` picker-form route (`window.customIcons.sci.getIcon`) | Returns `{ path: '', viewBox: '0 0 24 24' }` | `<ha-icon>` draws nothing; `<sf-icon>` still renders the animation from `WEATHER_ICONS` (FR-1.1) | none (silent by design) |
| `getIcon('<weather name>')` on `customIconsets.sci` | Returns `''` | same as above | `console.error('[sf-iconset] Icon "sci:<name>" not available')`, name sanitised and cut at 64 |
| Inherited name (`constructor`, `toString`) on either route | Treated as unknown name | same | as the matching row above |
| `window.customIcons` holds a foreign template object | Never rendered by `<sf-icon>` | unknown-icon fallback | none |
| A bare import not declared in `package.json` | Guard test fails with the specifier and file | Declare it, or import from the declared package | test output |
| `✅` component with no `@customElement` | Guard test fails with the name | Fix the row or build the component | test output |

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-2` | code — `src/components/sf-icon/icon-names.ts` | `sf-iconset.ts`, `sf-editor-dropdown-icon.ts` |
| `FR-1` | — | HA `ha-icon` and `ha-icon-picker`, through `window.customIconsets` / `window.customIcons` |
| FR-1.1 | — | `<sf-icon>` / `<sci-icon>` in any card |
| `FR-3` | — | `src/sci-fi.ts` (imports `sci-icon.js`); any HA card using `<sci-icon>` |
| `FR-9` | `CHANGELOG.md` | users reading release notes |

## Builder Calls

Calls marked *mine* are the author's and stand until the user rules otherwise. User rulings (28-icon picker; light DOM with AP#3 amended; fan-out review; F-02 fixed technically, not accepted; F-12 risk taken; F-14 release note written) are recorded in FR-2, FR-4, FR-1.1, FR-10, FR-9.

- **AP#5 amended, no limiter built (FR-6)** — *mine.* The registry is one shared request per connection, so at most 1 fetch is in flight; a limiter of 5 would guard nothing.
- **`lit` instead of declaring `lit-html` (FR-7)** — *mine.* No new dependency; one declared import path.
- **`iconClass` and `logPrefix` hooks (FR-3)** — *mine.* Smallest change that keeps `svg.sci-icon`, the loading class and the warn prefix stable for outside CSS and log readers.
- **Dropdown agreement (IT-ICC-I-02)** — *mine.* If the dropdown's option list is not reachable from a test without a heavy mount, the builder exports a pure function that builds the options; an import-only assertion is not accepted as proof.
- **Spec 04 edits (FR-8)** — made with the Edit tool on the exact lines, nothing else in the file moves; the edits are already in Spec 04 (§ Public Interface `<sci-icon>` row, AP#3, AP#5, § HA Icon Picker API, TC-407, TC-408, § Error Handling), and TC-ICC-U-10 greps the literal tokens quoted in its Expected cell.
- **Lookup order in `sf-icon.ts` (FR-1.1)** — *(agent's call: keeps today's behaviour for built-in names and closes the foreign-object hole)*. For prefixes `sci`/`sf`: own key in `sf-icons.ts` (string), then own key in `WEATHER_ICONS` (template), then an own-key STRING in `window.customIcons[prefix]`; any non-string foreign value is ignored. `sf-icon.ts` reads `window.customIcons[prefix][name]` as a plain property (the picker `getIcon`/`getIconList` are non-enumerable helpers, not read there), so the hardening is a swap of that lookup and of `_ensureCustomIcons`, not a rework of the render pipeline, loading state or hooks (FR-3 lands first, FR-1.1 on the subclass base).
- **Test mechanics (FR-6, FR-7, FR-5)** — *(agent's call)*. `ha-icon` presence is read by `sf-icon` at render time (`customElements.get('ha-icon')`), so tests simply do not define it; the cache reset in TC-ICC-U-06 uses a fresh fake `connection` object per test (the `WeakMap` is keyed on it) and, for the module-level `Map`, an exported test-only reset if none exists. The FR-7 detector is a TypeScript-compiler-API walk (comments and strings ignored; `import type` counts; `node:*` and relative or `tsconfig` alias specifiers are not packages). The FR-5 detector reads each Blueprint Coverage table row whose "Covered here" cell holds `✅`; wildcard tokens (`sf-*`) are skipped. `# Unreleased` is created at the top of `CHANGELOG.md` (done) under `## 🆕 What's New`.
