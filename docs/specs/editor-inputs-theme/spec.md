---
spec: docs/specs/editor-inputs-theme/spec.md
sources:
  - src/styles/editor-common.ts
  - src/components/editor-inputs/sf-editor-accordion.ts
  - src/components/editor-inputs/sf-editor-input.ts
  - tests/styles/css-equivalence.ts
  - docs/adr/ADR-018_palette-fixed-identity.md
---

# editor-inputs-theme — Implementation Spec

Document Type: implementation

## Overview

Port the 11 components of `src/components/editor-inputs/` onto the `--editor-*` token
family declared on the `:host` of `sciFiEditorCommonStyles`
([editor-common.ts](../../../src/styles/editor-common.ts)), and remove the six `--_*`
locals of `sf-editor-accordion`. The port is **visually neutral**: each token is declared
in `editor-common.ts` with exactly the value the component wrote inline before, and each
component reads it as `var(--editor-x, <today's literal>)`. Bead `ha-sci-fi-29mt` (supersedes
the open decision `ha-sci-fi-0z0`). Amends [spec 03 § Les deux étages de l'éditeur](../03_base_classes.md#les-deux-étages-de-léditeur--la-règle-4-ne-couvre-que-le-premier)
and its Anti-pattern 4 (the "règle 4" named there is spec 03's rule, not ADR-018's).
ADR: [ADR-018](../../adr/ADR-018_palette-fixed-identity.md) § The four raw values, rows 2–3
(`sf-editor-slider.ts:35`, `sf-editor-input.ts:44`), amended by its 2026-11-05 addendum (FR-13).

User decisions, 2026-11-05, attended, binding: D1 neutral rendering, no alpha harmonisation;
D2 delivery by inheritance from the card editor's `:host`, inputs never import
`sciFiEditorCommonStyles`; D3 accordion `--_*` removed; D4 one token per role, no `color-mix`.
Base commit of the port: `5251aa3`.

## Requirements

- **FR-1** (D2): `src/styles/editor-common.ts` `:host` declares every token of the § Token table, with the exact value of its "Declared value" column, in addition to the six existing tokens (`--editor-gap`, `--editor-section-color`, `--editor-border`, `--editor-chip-bg`, `--editor-chip-color`, `--editor-icon-size`) left unchanged. Each `--editor-*` name is declared exactly once in that `:host`.
- **FR-2** (D2): in the `css` blocks of the 11 files of `src/components/editor-inputs/`, every `var(` reference names a `--editor-*` token and carries a fallback; no reference names an HA theme variable (`--primary-color`, `--primary-text-color`, `--secondary-text-color`, `--disabled-text-color`, `--error-color`, `--ha-card-background`, `--secondary-light-color`, `--secondary-light-alpha-color`, `--primary-light-color`, `--font-size-small`, `--border-radius`, `--border-width`) directly. A `css` block contains no `${` interpolation (none exists at base; an interpolation could hide a variable from the scan).
- **FR-3** (D4): in those `css` blocks, a colour literal appears only as the fallback argument of a `var(--editor-*, …)`; no `color-mix(` appears in them nor in `editor-common.ts`. "Colour literal" means any of: `#` followed by 3, 4, 6 or 8 hex digits; a call `rgb(`, `rgba(`, `hsl(`, `hsla(`, `hwb(`, `lab(`, `lch(`, `oklab(`, `oklch(`, `color(`; a CSS Color 4 named colour (the 148 names, case-insensitive) standing as a whole value token, i.e. not adjacent to `-` or a letter (so `white-space` is not a colour). The keywords `transparent`, `currentcolor`, `inherit`, `initial`, `unset`, `none` are not colour literals. The accordion gradient stops (pre-port :91–92) are covered by this rule through `--editor-accordion-shade-top` / `--editor-accordion-shade-bottom`.
- **FR-4** (D1): the fallback of every `var(--editor-x, L)` in an editor-input equals the "Fallback literal" column of the § Token table for `--editor-x` (one literal per token, identical at every site).
- **FR-5** (D3): no `--_` custom property is declared or read in `src/components/editor-inputs/`; the accordion's six locals map to the tokens of the § Token table rows marked "accordion".
- **FR-6** (D2): no file of `src/components/editor-inputs/` imports `sciFiEditorCommonStyles` or `editor-common`.
- **FR-7** (D1): inside a card editor, the folded CSS of each of the 11 components, resolved by `resolveVars(css, 'declared')` (§ Resolver), is byte-equal to the pre-port folded CSS resolved by `resolveVars(css, 'locals')`.
- **FR-8** (D1): outside a card editor (fallback only — `sf-editor-accordion` mounted by the card `src/cards/water/sci-fi-water-management.ts`), the folded CSS of the accordion resolved by `resolveVars(css, 'fallback')` is byte-equal to the pre-port folded CSS resolved by `resolveVars(css, 'fallback')`.
- **FR-9** (D1): `sf-editor-dropdown-entity`'s secondary text reads its own token `--editor-text-hint` (declared `var(--secondary-text-color, rgba(224, 232, 255, 0.5))`, fallback alpha `0.5`), distinct from `--editor-text-secondary` (alpha `0.6`). The two differ only on the fallback path: under an HA theme that defines `--secondary-text-color`, both resolve to it, exactly as pre-port. The port preserves that, it does not add a distinction.
- **FR-10**: every file under `src/` outside `src/components/editor-inputs/` whose comment-blanked source contains `<sf-editor-` is either (a) a card editor (`src/cards/**/*-editor.ts`) whose `static styles` initializer lists `sciFiEditorCommonStyles`, so FR-7's inheritance holds in production, or (b) `src/cards/water/sci-fi-water-management.ts`, the single allowed non-editor mount (FR-12). Any other mount fails.
- **FR-11**: `docs/specs/03_base_classes.md` § Les deux étages de l'éditeur says editor-inputs read `--editor-*` by inheritance with literal fallbacks (row `:130` rewritten, the "décision ouverte" paragraph replaced by a pointer to this spec), and Anti-pattern 4 no longer says the rule excludes editor-inputs. [ACCEPTED-LIMIT: user 2026-11-05 — a prose amendment of a spec; no test reads spec prose meaningfully, reviewed at VERIFY doc-update]
- **FR-12** (D2): the water card's accordion (`sci-fi-water-management.ts`, not a card editor) renders fallback literals only: a user HA theme defining `--secondary-light-color`, `--secondary-light-alpha-color`, `--primary-light-color`, `--font-size-small`, `--border-radius` or `--border-width` no longer reaches that accordion (it still reaches every editor accordion through editor-common). [ACCEPTED-LIMIT: user 2026-11-05 — the water-card accordion loses HA theme chaining; accepted as the price of D2 (no import of editor-common in inputs), these variables are declared nowhere in the repo (Assumption 2), threat left out: a user theme customising them sees no effect in the water card]
- **FR-13**: `docs/adr/ADR-018_palette-fixed-identity.md` carries a section `## Addendum — 2026-11-05` stating that the editor-inputs sites of rows 2–3 (`sf-editor-slider.ts:35`, `sf-editor-input.ts:44`) are no longer raw literals: editor-inputs read `--editor-*` by inheritance with literal fallbacks, and it links this spec. The ADR's decisions 1–3 (no `--sf-*` in the editor tree) are unchanged.

## Resolver

`resolveVars(css: string, mode: 'declared' | 'fallback' | 'locals'): string`, defined in
`tests/styles/editor-inputs-theme.test.ts` (the shared harness `css-equivalence.ts` is
read-only for this lot). It is a left-to-right scanner, not a regex:

1. Find the next `var(` at index `i`. From `i + 4`, walk characters keeping a paren depth
   (starting at 1; `(` +1, `)` −1) until depth 0 at index `j`. The argument is `css[i+4 .. j)`.
2. Split the argument at its **first comma at depth 0** (depth counted within the argument):
   `name` = left part trimmed, `fallback` = right part trimmed, or `null` when there is no
   such comma. Commas inside `rgba(…)` or a nested `var(…)` are at depth ≥ 1 and never split.
3. Replacement, by mode:
   - `declared`: if `name` starts with `--editor-`, replace `var(…)` by the Declared value
     of `name` read from the parsed editor-common `:host` (verbatim, not further resolved);
     an `--editor-*` name not declared there throws `undeclared token <name>`. Any other
     `var(…)` is kept verbatim.
   - `fallback`: replace `var(…)` by `resolveVars(fallback, 'fallback')` (recursion resolves
     nested `var(`); a `var(` with `fallback === null` whose name is a `--_*` local is first
     inlined as in `locals`, otherwise throws `no fallback for <name>`.
   - `locals` (pre-port only): collect the accordion's `--_x: V;` declarations from its
     `:host` rule, drop those declarations, and replace each `var(--_x)` by `V` verbatim.
     Other `var(…)` kept verbatim.
4. Continue scanning after the inserted text in `declared`/`locals` (no re-scan of it),
   and from `i` again in `fallback` until no `var(` remains.

Folding order: `foldCss(resolveVars(flattenStyles(Cls.styles), mode))`, whitespace inside
declaration values normalised by `foldCss` as today (every run of whitespace collapsed to
one space, value trimmed — so `var(--secondary-light-color,  rgb(…))` with two spaces
folds equal to the one-space Declared value; `rgba(0,210,255,.2)` would NOT equal
`rgba(0, 210, 255, 0.2)`).

In `fallback` mode, the `--_*` inlining is followed by a re-scan from `i` (that is what
resolves `V`'s own `var(--ha, L)` to `L`); the "no re-scan" of step 4 applies to
`declared` and `locals` only. No `--_x` of the accordion is declared through another
`--_y` (the six values are `var(--ha-var, literal)`, pre-port lines :31–36), so one pass suffices.

## Build notes

Answers to the cold builder check (2026-11-05):

1. The accordion's six pre-port `--_*` values (`sf-editor-accordion.ts:31–36`) are exactly
   the Declared values of the six accordion rows of § Token table, up to whitespace.
2. Every Declared/Fallback literal of the table was copied from the pre-port site text. If
   a site's text differs from its table row beyond whitespace, stop: that is a spec defect
   to raise, never a value to pick. (agent's call: neutrality D1 forbids picking)
3. `--editor-chip-bg` already exists as `rgba(0, 210, 255, 0.12)`; its line stays untouched
   and counts as one of the six existing tokens.
4. Only colour sites are tokenised. Non-colour literals (radii, sizes) of non-accordion
   inputs stay literal; `--editor-radius` / `--editor-border-width` / `--editor-font-small`
   replace the accordion's `--_*` reads only. (agent's call: FR-3 scopes colours)
5. At base no `hsl(`, `oklch(`, `color(`, 8-digit hex or named colour exists in the
   editor-inputs `css` blocks (grep, 2026-11-05): the 109-hit inventory is complete for FR-3.
6. The water card adds no style to the accordion it mounts: IT-EIT-I-02 folds the accordion
   class alone.
7. IT-EIT-I-03 does not hard-code 11: it requires every `src/**` mount to be a
   `*-editor.ts` meeting FR-10, or the water card; the count 11 + 1 is the measured value
   asserted as a snapshot, updated by whoever adds an editor. (agent's call)
8. The baseline JSON is committed alone in a stage-labelled WIP commit on the feature
   branch before any `src/` edit (legal before HARDEN). `.github/workflows/ci.yml` checkout
   gets `fetch-depth: 0` so IT-EIT-I-05 has the history it needs in CI. (agent's call: a
   shallow clone would turn I-05 permanently red)

## Token table

Mapping is by the pre-port inline value: each pre-port value below is replaced, at every
listed site, by `var(<token>, <fallback literal>)`. Sites measured by
`grep -noE "var\(--[a-z_-]+|rgba?\([^)]*\)|#[0-9a-fA-F]{3,6}\b" src/components/editor-inputs/*.ts` (109 hits, 2026-11-05).
Consumers: every `--editor-*` token (including the generic `--editor-text`, `--editor-radius`,
`--editor-border-width`) is read only by `src/components/editor-inputs/*.ts` and declared only
in `editor-common.ts`; `--editor-border` (existing, `var(--divider-color, …)`) keeps its own
role and is not reused for any site below (Anti-pattern 1).

| Token | Declared value (editor-common `:host`) | Fallback literal | Pre-port sites |
|---|---|---|---|
| `--editor-accent` | `var(--primary-color, #00d2ff)` | `#00d2ff` | action:34, input:55,103,115, slider:47,58, source-list:35,85 |
| `--editor-text` | `var(--primary-text-color, #e0e8ff)` | `#e0e8ff` | action:45, chips:49, color-picker:60, dropdown-entity:41, input:110, dropdown:82, multi-entity:48 |
| `--editor-text-secondary` | `var(--secondary-text-color, rgba(224, 232, 255, 0.6))` | `rgba(224, 232, 255, 0.6)` | chips:55, color-picker:30, input:69,88, dropdown:46, multi-entity:61, slider:66 |
| `--editor-text-hint` | `var(--secondary-text-color, rgba(224, 232, 255, 0.5))` | `rgba(224, 232, 255, 0.5)` | dropdown-entity:49 |
| `--editor-text-disabled` | `var(--disabled-text-color, rgba(224, 232, 255, 0.3))` | `rgba(224, 232, 255, 0.3)` | input:119 |
| `--editor-error` | `var(--error-color, #ff4444)` | `#ff4444` | action:53, chips:64, accordion:160, multi-entity:71, source-list:61 |
| `--editor-error-soft` | `rgba(255, 68, 68, 0.12)` | same | chips:65, multi-entity:72 |
| `--editor-error-faint` | `rgba(255, 68, 68, 0.1)` | same | source-list:73 |
| `--editor-surface` | `rgba(255, 255, 255, 0.02)` | same | action:24, source-list:25 |
| `--editor-surface-input` | `rgba(255, 255, 255, 0.04)` | same | input:44 |
| `--editor-field-bg` | `rgba(0, 0, 0, 0.3)` | same | action:43, source-list:41 |
| `--editor-field-border` | `rgba(255, 255, 255, 0.1)` | same | action:44, source-list:42 |
| `--editor-accent-border` | `rgba(0, 210, 255, 0.2)` | same | action:25, input:45, source-list:26,93 |
| `--editor-accent-faint` | `rgba(0, 210, 255, 0.1)` | same | dropdown:87, source-list:83 |
| `--editor-chip-bg` (existing) | `rgba(0, 210, 255, 0.12)` | same | chips:44, multi-entity:43 |
| `--editor-accent-track` | `rgba(0, 210, 255, 0.15)` | same | slider:35 |
| `--editor-chip-border` | `rgba(0, 210, 255, 0.25)` | same | chips:45, multi-entity:44 |
| `--editor-accent-line` | `rgba(0, 210, 255, 0.3)` | same | color-picker:45, dropdown:61 |
| `--editor-accent-strong-border` | `rgba(0, 210, 255, 0.4)` | same | source-list:84 |
| `--editor-accent-strong` | `rgba(0, 210, 255, 0.8)` | same | source-list:94 |
| `--editor-popup-bg` | `var(--ha-card-background, rgba(15, 20, 35, 0.98))` | `rgba(15, 20, 35, 0.98)` | dropdown:60 |
| `--editor-shadow` | `rgba(0, 0, 0, 0.4)` | same | dropdown:66 |
| `--editor-accordion-border` (accordion) | `var(--secondary-light-color, rgb(102, 156, 210))` | `rgb(102, 156, 210)` | `--_border-color` reads :50,108,122,139,156 |
| `--editor-accordion-header-bg` (accordion) | `var(--secondary-light-alpha-color, rgba(102, 156, 210, 0.5))` | `rgba(102, 156, 210, 0.5)` | `--_border-color-alpha` read :94 |
| `--editor-accordion-accent` (accordion) | `var(--primary-light-color, rgb(105, 211, 251))` | `rgb(105, 211, 251)` | `--_color-primary` reads :112,143 |
| `--editor-font-small` (accordion) | `var(--font-size-small, 12px)` | `12px` | `--_font-small` read :99 |
| `--editor-radius` (accordion) | `var(--border-radius, 5px)` | `5px` | `--_border-radius` read :52 |
| `--editor-border-width` (accordion) | `var(--border-width, 1px)` | `1px` | `--_border-width` read :50 |
| `--editor-accordion-shade-top` (accordion) | `rgba(0, 0, 0, 0.7)` | same | gradient :91 |
| `--editor-accordion-shade-bottom` (accordion) | `rgba(0, 0, 0, 0.2)` | same | gradient :92 |

Out of the table: `'#000000'` at color-picker:82 is a JS default value of `<input type="color">`, not CSS — unchanged. `sf-editor-dropdown-icon.ts` has no colour site (0 hits) and needs no change.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Every card editor rendering `<sf-editor-*>` includes `sciFiEditorCommonStyles` | Medium | SHOW — `grep -rlE "<sf-editor-" src` minus editor-inputs → 12 files; 11 editors all OK, 1 card (`sci-fi-water-management.ts`) without it | IT-EIT-I-03 |
| 2 | The accordion's HA-ish variables (`--secondary-light-color`, `--primary-light-color`, `--border-radius`, `--border-width`, `--font-size-small`) are declared nowhere in this repo, so the accordion renders its literals everywhere today | Medium | TELL — spec 03 § Les deux étages (measured 2026-11-01) | IT-EIT-I-02; residual written as FR-12 |
| 3 | Inside a card editor, a token resolved from editor-common equals the pre-port inline expression, so rendering is unchanged even when HA overrides `--primary-color` etc. | Low | SHOW — the Declared value column is the pre-port inline expression verbatim (inventory grep above) | IT-EIT-I-01 |
| 4 | `foldCss`/`flattenStyles` of `tests/styles/css-equivalence.ts` parse the editor-inputs sheets (single `:host`/class selectors) | Low | TELL — harness header comment | IT-EIT-I-01 runs it |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Reusing an existing token whose value differs from the site (e.g. `--editor-border` = `var(--divider-color, …)` for an input border that is `rgba(0, 210, 255, 0.2)`) | A role token with the site's exact value (`--editor-accent-border`) |
| 2 | Harmonising alphas (0.5 → 0.6, 0.1 → 0.12) or `color-mix` to save tokens | One token per distinct value (D1, D4) |
| 3 | `var(--editor-x, var(--primary-color, …))` in an editor-input | Literal fallback only; the HA chain lives in editor-common (FR-2) |
| 4 | Importing `sciFiEditorCommonStyles` into an editor-input | Inherit from the card editor's `:host` (D2) |
| 5 | `var(--sf-*)` in editor sheets | `--editor-*` (spec 03 Anti-pattern 2b) |
| 6 | A regex `var\([^)]*\)` to resolve variables | The depth-counting § Resolver; regex truncates at the first `)` of `rgba(…)` |
| 7 | Regenerating the baseline from the ported sheets | Baseline generated at base commit `5251aa3`, bound by IT-EIT-I-05 |

## Test Case Specifications

All in `tests/styles/editor-inputs-theme.test.ts`; baseline `tests/styles/editor-inputs-css-baseline.json`, generated from the pre-port sheets at base commit `5251aa3` (`inEditor` with mode `locals`, `standalone.accordion` with mode `fallback`), carrying `"baseCommit": "5251aa3…"` (full sha), and committed in its own commit before any `src/` edit (red-first). Sources are "comment-blanked" (comments replaced by spaces, offsets kept) before any scan. A `css` block is the text between `` css` `` and its closing backtick.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-EIT-U-01 | Scan comment-blanked sources of `src/components/editor-inputs/*.ts` for `--_` | FR-5 | 0 occurrences (red at base: accordion has 18) |
| TC-EIT-U-02 | Scan their `css` blocks: each `var(` (via the § Resolver tokenizer), each colour literal per FR-3, each `color-mix(`, each `${` | FR-2, FR-3 | every `var(` names `--editor-*` with a non-null fallback; every colour literal lies inside the fallback span of a `var(--editor-*, …)`; 0 `color-mix(` (also in editor-common); 0 `${` |
| TC-EIT-U-03 | Collect `var(--editor-x, L)` reads in editor-inputs; parse editor-common `:host` | FR-1, FR-4 | each `--editor-x` is declared in editor-common with the table's Declared value; each `L` equals the table's Fallback literal; the six pre-existing tokens unchanged; no `--editor-*` name declared twice in the `:host` |
| TC-EIT-U-04 | Import lines of editor-inputs | FR-6 | none references `editor-common` |
| TC-EIT-U-05 | `sf-editor-dropdown-entity` secondary text | FR-9 | reads `--editor-text-hint` with fallback `rgba(224, 232, 255, 0.5)`; editor-common declares `--editor-text-hint: var(--secondary-text-color, rgba(224, 232, 255, 0.5))` and `--editor-text-secondary: var(--secondary-text-color, rgba(224, 232, 255, 0.6))` (both chain the same HA variable, as pre-port) |
| TC-EIT-U-06 | Resolver fixtures | FR-7, FR-8 | `resolveVars('a: var(--x, rgba(1, 2, 3, 0.5));', 'fallback')` = `'a: rgba(1, 2, 3, 0.5);'`; `var(--x, var(--y, #fff))` → `#fff` in `fallback`; `var(--editor-accent, #00d2ff)` → `var(--primary-color, #00d2ff)` in `declared`; `var(--editor-nope, #000)` in `declared` throws `undeclared token`; `var(--z)` in `fallback` throws `no fallback` |
| TC-EIT-U-07 | Scanner negative controls: run the U-02 scan on fixture `css` strings | FR-2, FR-3 | each of `color: red;`, `color: hsl(0, 0%, 0%);`, `color: #ff4444aa;`, `color: oklch(0.5 0.1 200);`, `color: var(--primary-color, #fff);`, `color: ${x};`, `color: color-mix(in srgb, #fff, #000);` is flagged; `white-space: nowrap;` and `color: var(--editor-text, #e0e8ff);` are not |
| TC-EIT-U-08 | ADR-018 text | FR-13 | the file contains a heading `## Addendum — 2026-11-05` followed by a link to `docs/specs/editor-inputs-theme/spec.md` and the names `sf-editor-slider.ts` and `sf-editor-input.ts` |
| IT-EIT-I-01 | For each of the 11 components: `foldCss(resolveVars(flattenStyles(Cls.styles), 'declared'))` | FR-7 | `diffFolded` vs baseline `inEditor[component]` is empty |
| IT-EIT-I-02 | Accordion as mounted by `sci-fi-water-management.ts`: `foldCss(resolveVars(…, 'fallback'))` | FR-8 | `diffFolded` vs baseline `standalone.accordion` is empty |
| IT-EIT-I-03 | Real tree: every comment-blanked `src/**/*.ts` outside `src/components/editor-inputs/` containing `<sf-editor-` | FR-10, FR-12 | exactly 12 files: 11 `src/cards/**/*-editor.ts` whose `static styles` initializer text (from `static … styles =` to its terminating `;` at bracket depth 0) contains the identifier `sciFiEditorCommonStyles`, plus `src/cards/water/sci-fi-water-management.ts` (the allow entry); any other file fails, naming it |
| IT-EIT-I-04 | Mutation controls on the real ported sheets | FR-4, FR-7, FR-8 | (a) the accordion css with its `#ff4444` fallback replaced by `#ff4445` gives a non-empty I-02 diff; (b) the declared map with `--editor-accent` changed to `var(--primary-color, #00d2fe)` gives a non-empty I-01 diff for `sf-editor-input`; (c) a baseline entry with one declaration removed gives a non-empty diff |
| IT-EIT-I-05 | Baseline binding | FR-7, FR-8 | `baseCommit` in the JSON is an ancestor of `HEAD` (`git merge-base --is-ancestor`); the commit that last added the JSON (`git log --diff-filter=A -1 --format=%H -- <json>`) has the same tree for `src/components/editor-inputs` and `src/styles/editor-common.ts` as `baseCommit` (`git rev-parse <c>:<path>`); git unavailable or shallow history → the test fails, it never skips |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| editor-input mounted outside any card editor (no `--editor-*` declared) | each `var(--editor-x, L)` renders `L` | literal = pre-port fallback | none (CSS) |
| token read but not declared in editor-common | TC-EIT-U-03 fails, names the token; the resolver throws `undeclared token` | — | test output |
| `var(` without fallback in fallback mode | resolver throws `no fallback for <name>` | — | test output |
| baseline drift (rendering changed) | IT-EIT-I-01/02 fail with `diffFolded` lines | — | test output |
| baseline regenerated after the base commit | IT-EIT-I-05 fails | — | test output |

## Carriers & Consumers

| carried by | production consumer | Covers |
|-----------|---------------------|--------|
| code — src/styles/editor-common.ts | the 11 `src/cards/*/sci-fi-*-editor.ts` | FR-1 |
| code — src/components/editor-inputs/*.ts | the 11 card editors and `sci-fi-water-management.ts` | FR-2, FR-3, FR-4, FR-5, FR-6, FR-9 |
| test — tests/styles/editor-inputs-theme.test.ts + tests/styles/editor-inputs-css-baseline.json (reads tests/styles/css-equivalence.ts, unchanged) | CI test run | FR-7, FR-8 |
| code — src/cards/**/*-editor.ts (unchanged), src/cards/water/sci-fi-water-management.ts (unchanged) | HA card dialog / water card | FR-10, FR-12 |
| config — .github/workflows/ci.yml (`fetch-depth: 0`) | CI test run | FR-7, FR-8 (I-05 history) |
| doc — docs/specs/03_base_classes.md | spec readers | FR-11 |
| doc — docs/adr/ADR-018_palette-fixed-identity.md | ADR readers | FR-13 |

## References

- [editor-common.ts](../../../src/styles/editor-common.ts)
- [spec 03 § Design tokens](../03_base_classes.md)
- [ADR-018](../../adr/ADR-018_palette-fixed-identity.md)
- [css-equivalence harness](../../../tests/styles/css-equivalence.ts)
