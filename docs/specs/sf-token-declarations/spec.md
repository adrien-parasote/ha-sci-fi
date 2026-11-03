---
spec: docs/specs/sf-token-declarations/spec.md
sources:
  - tests/styles/token-refs.test.ts
  - src/styles/common.ts
  - docs/adr/ADR-018_palette-fixed-identity.md
  - docs/specs/03_base_classes.md
  - src/components/buttons/sf-button-card.ts
---

# `--sf-*` token declarations — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-5wj` (retrocheck `j02`, 2026-10-31). `--sf-*` names are read by `var(--sf-x, <fallback>)` and declared nowhere in `src/`. TC-307 (`tests/styles/token-refs.test.ts`) treats "fallback present" as healthy, so it cannot see them: the property always renders its fallback, silently, and a near-homonym (`--sf-text-sm` beside the declared `--sf-font-size-sm`) looks like a token that works.

**Decisions (user, 2026-11-03, AskUserQuestion).**
1. *Scope A*: the socle (`src/styles/`, `src/components/`, and the tokens declared in `common.ts`, which settle their card sites too) plus the hardening of TC-307, drift guard included (FR-4 is that hardening: it keeps a declared token from being re-forked). Every other card site is settled in a follow-up bead per card family; TC-307 carries an explicit, dated, per-name allow-list for them.
2. *Zero visual change*: each socle token is declared at **its current rendered value**. `--sf-text-xs/sm/base` are declared in px (not renamed to `--sf-font-size-*`, see below). `--sf-bg-primary` is a new opaque surface token; the four hexa hooks are documented hooks in an allow-list, one reason each.
3. *Dead fallbacks only*: a fallback is changed only on an element that includes `sciFiCommonStyles` (so the token always resolves and the fallback is dead). `--secondary-bg-color` (weather, stove) is **not** renamed.
4. *Rem bug*: `--sf-font-size-*` render 18px/21px because HA sets 24px on `:root`. Already filed as `ha-sci-fi-x6e`; this lot does not touch those tokens.

**Measurement (worktree on `main`, 2026-11-03, throwaway scanner with TC-307's own comment-blanking and balanced-paren logic, deleted after the run).** *A name is "undeclared" when no `--name:` declaration exists in any file of `src/`.*

| | Bead says | Measured | Why they differ |
|---|---|---|---|
| undeclared `--sf-*` names | 35 | **36** | the bead counted by another rule for tokens set only in inline `style=`; not reconciled name by name |
| socle sites (9 files of `src/styles/` + `src/components/`) | 50 | **51** | same |
| card sites | 166 | **110** | the bead's 166 included non-`--sf-` names (weather: 10 variables) and sites of names that `common.ts` now settles; not reconciled |

Of the 36 names, re-measured at the spec review (round 1): **11 become declared by `common.ts`** (`--sf-border-width` 23 sites, `--sf-icon-size-xs/sm/md/lg` 2/17/3/2, `--sf-text-xs/sm/base` 1/15/4, `--sf-bg-primary` 8, `--sf-bg-tertiary` 4, `--sf-border-light` 1 as a declared alias of `--sf-bg-tertiary`, same value, user decision 2026-11-03); the new name `--sf-bg-tile` is **not** one of the 36, it is added to `common.ts` for 4 of the 8 `--sf-bg-primary` sites (FR-3), so `common.ts` gains **12 declarations**; **4 are hooks** (`--sf-hexa-border`, `--sf-hexa-row-icon-off-color`, `--sf-default-hexa-width`, `--sf-selected-hexa-width`, nothing in `src/` sets them); **21 are open card names** (allow-list): tv 6, hexa-tiles 7, climates 4 `--sf-season-*`, bridge 3 (`--sf-text`, `--sf-font`, `--sf-glow-cyan`), water 2. `--sf-glow-cyan` is read by both tv and bridge (`src/cards/tv/style.ts`, `src/cards/bridge/styles.ts`), so the per-family breakdown sums to 22 and the distinct names are 21. 11 + 4 + 21 = 36.

**Rendered values today** (the undeclared name always resolves to its fallback; all fallbacks of a name are identical except `--sf-bg-primary`):

| Name | Fallback = rendered today | Declared as |
|---|---|---|
| `--sf-border-width` | `1px` | `1px` |
| `--sf-icon-size-xs / sm / md / lg` | `12px / 16px / 24px / 36px` | same |
| `--sf-text-xs / sm / base` | `10px / 12px / 14px` | same, **px** |
| `--sf-bg-primary` | `#0d1117` (dropdown, button-select, stove ×2) and `#101626` (`sf-hexa-tile` ×4) | `#0d1117`; the hexa-tile sites are renamed `--sf-bg-tile: #101626` |
| `--sf-bg-tertiary` / `--sf-border-light` | `rgba(0, 210, 255, 0.1)` ×4 / ×1 | `rgba(0, 210, 255, 0.1)` / alias `var(--sf-bg-tertiary)` (both declared) |

**Why not a rename to the canonical `--sf-font-size-*`.** `--sf-text-sm` (12px) beside `--sf-font-size-sm` (`0.75rem`) looks like a typo for the declared token. It is not safe to rename: with HA's 24px root `0.75rem` renders 18px, so the rename would change 15 sites from 12px to 18px (a visible, wrong change, rejected by `rem-fallbacks.test.ts`'s own rule). Declaring the px value is the zero-change option; the rem tokens are `x6e`'s.

**Dead fallbacks changed (decision 3), render unchanged** — each element includes `sciFiCommonStyles`, directly or through `super.styles`:

| Site (re-grep at BUILD, lines drift) | Fallback now | Becomes |
|---|---|---|
| `sf-hexa-row.ts` (`--sf-hexa-row-icon-off-color`), `sf-hexa-tile.ts` | `var(--sf-bg-secondary, #1a2235)` (opaque navy; the token is a 4 % white) | `var(--sf-bg-secondary, rgba(255, 255, 255, 0.04))` |
| `sf-hexa-tile.ts` | `var(--sf-primary-dim, rgba(0, 210, 255, 0.3))` (token: 40 % mix) | `var(--sf-primary-dim, color-mix(in srgb, var(--sf-primary) 40%, transparent))` |
| `sf-button-card.ts`, `sf-wheel.ts` | `var(--sf-text-secondary, #b0bec5)` | `var(--sf-text-secondary, rgba(224, 232, 255, 0.6))` |
| `sf-button-card.ts` | `var(--sf-border, rgba(224, 232, 255, 0.1))` | `var(--sf-border, rgba(0, 210, 255, 0.15))` |

**The false premise of ADR-018.** ADR-018 (§ Corrected here) and [03_base_classes.md](../03_base_classes.md) rule 2 justify two non-canonised fallbacks by "neither `sf-dropdown` nor `sf-button-card` includes `sciFiCommonStyles`". `sf-button-card` extends `SciFiButton` and its `static get styles()` returns `[super.styles, …]`; `SciFiButton` lists `sciFiCommonStyles` first (`sf-button.ts`), and `sf-button-card-select` extends `sf-button-card`. Only `sf-dropdown` has no inclusion in its chain. The rule was applied to the syntax of the import, not to the inheritance chain, and no test encoded the negative case. (The bead cites `03_base_classes.md:70-73`; the rule now sits in § Design Tokens rule 2, about lines 109-117.)

**Out of this lot** (stated so nobody reads silence as agreement): the 21 card names and the card fallback drifts (`ha-sci-fi-yj6`, `-03i`, `-xi7`, `-rhd`, `-3z0j`, `-7ge9`, `-gmvv`, `-td4b`); non-`--sf-` ghost variables such as `--secondary-bg-color` (`-gmvv` decides whether the guard extends to them); the rem tokens (`x6e`); local redefinitions of a `common.ts` token (bridge declares its own `--sf-bg` and `--sf-bg-secondary`; the declared-set stays global); `sf-dropdown` breaking its own § Design Tokens rule 5 (it uses tokens without including `sciFiCommonStyles`; adding the include changes `:host` display and height, a visible change); `sf-dropdown.ts` itself, which this lot does not edit.

## Requirements

- **FR-1**: TC-307 reports every `var(--sf-…)` whose name is declared nowhere in `src/`, **with or without a fallback**, unless the name is in `HOOKS` or `OPEN_CARD_NAMES` (FR-2). A non-`--sf-` name keeps the old rule (reported only when written without a fallback). The comment header of the test no longer says that an undefined reference with a fallback is healthy for `--sf-*` names, and the failure message names the three exits (declare in `common.ts`, rename to the canonical token, remove). *Declaration scan (bounded):* a `--sf-x:` counts as a declaration only when it sits inside a `css` template literal or an inline `style=` of a `src/` file, after comment blanking (not in a plain string, a comment or a test file). It is still global across files: one card's sheet declaring `--sf-x` makes the name declared for every file. That limit is stated, not hidden, and pinned by TC-SFT-U-07; BUILD re-measures the 36 with this rule and records any delta in the commit message.
- **FR-2**: The test holds two exported tables. `HOOKS`: name → `reason` (non-empty, at most 200 characters); the 4 hooks of the Overview, each with the reason "public override point read by `<file>`, set by no one in `src/`". `OPEN_CARD_NAMES`: name → `{ bead, since }`, covering exactly the 21 open names (tv 6, hexa-tiles 7, climates 4 `--sf-season-*`, bridge 3, water 2; the card sites of names settled by FR-3 need no entry). `since` is the ISO date `2026-11-03`. *Bead assignment:* `bead` is one of the 8 follow-up beads listed in References and must be the bead of the family that reads the name (tv `3z0j`, hexa-tiles `7ge9`, climates `rhd`, bridge `yj6`, water `td4b`); a shared name (`--sf-glow-cyan`, read by tv and bridge) is keyed once with `bead` the bead whose title lists it first (`3z0j`) and the second family is named in a `also` field (`yj6`), so that either bead's lot deletes it only when no card still reads it. *Key restriction:* every key must be read by at least one file of `src/cards/`, never by a socle file. *Existence:* the 8 ids are a constant of the test checked against the References list of this spec; BUILD runs `bd show` on each id and records the result in the commit message (the test cannot call `bd`). The tables are a **ratchet**: an entry whose name is now declared in `src/`, or no longer referenced, fails and names the line to delete; a name in both tables fails; an entry without `reason`/`bead`/`since` fails.
- **FR-3**: `common.ts` declares, in `:host` and at the values of the Overview table: `--sf-border-width: 1px`; `--sf-icon-size-xs/sm/md/lg: 12px/16px/24px/36px`; `--sf-text-xs/sm/base: 10px/12px/14px` (px, never rem); `--sf-bg-primary: #0d1117`; `--sf-bg-tile: #101626`; `--sf-bg-tertiary: rgba(0, 210, 255, 0.1)`; `--sf-border-light: var(--sf-bg-tertiary)` (declared alias, user decision; terminal literal `rgba(0, 210, 255, 0.1)`). The 4 `var(--sf-bg-primary, #101626)` of `sf-hexa-tile.ts` become `var(--sf-bg-tile, #101626)`; the `var(--sf-border-light, rgba(0, 210, 255, 0.1))` site of `sf-dropdown.ts` is left as it is. The fallback of every touched site equals the declared value or, for a chained token, its terminal literal (character-identical after removing whitespace), and the rendered value of every site is unchanged. The `--sf-border-light` site keeps its literal by design: its fallback is the terminal literal of the alias.
- **FR-4**: The drift guard. For every `var(--sf-X, F)` where `common.ts` declares `X`, `F` equals the declared value or, for a chained token, its terminal literal (compared after removing whitespace), in every file **except**: files whose class chain does not include `sciFiCommonStyles` (FR-5; their fallback is live); the tokens `--sf-font-size-*` (`ha-sci-fi-x6e`); and the entries of `OPEN_DRIFT` (below). The `OPEN_DRIFT` table lists card-sheet drifts as `<file>::<token>` → `{ bead, since, max }`, generated at BUILD from the guard's own output, each entry owned by one of the 8 follow-up beads. *Bounds:* the file must be under `src/cards/` (a socle file or a token that is not declared by `common.ts` cannot be keyed); `bead` follows the family rule of FR-2; `max` must equal the measured number of drifting sites (a larger `max` fails as slack, a smaller one fails as a violation), so the allow-list can only shrink; the same ratchet as FR-2 applies (a stale entry fails).
- **FR-5**: A helper `includesCommonStyles(file)` decides the inclusion from the **inheritance chain**: true when the class's `static styles` (or `static get styles()`) lists `sciFiCommonStyles`, or when the class `extends` a class imported from a file of `src/` for which the helper is true **and** its styles return `super.styles` (a class that overrides `styles` without `super.styles` does not inherit). *Class-less card sheets:* most card sheets (`src/cards/*/styles.ts`, `style.ts`) export a bare `css` value and declare no class; for such a file, inclusion is resolved through the classes that **import** it: the helper returns true when at least one importing class includes the common styles (the sheet is then policed by FR-4, its fallbacks being dead); false when it has importers and none includes them (live fallback, FR-4 exempts it); and *unresolved* (null) when no class imports it, directly or through another class-less sheet, which FR-4 polices (never silently exempt). A class without `styles` that extends nothing is a helper and does not decide for the file. A negative case is encoded: `sf-button-card` and `sf-button-card-select` are true, `sf-dropdown` is false, and the chain logic is also proved on in-memory fixtures (direct, one level, two levels, override without `super.styles`, a class-less sheet imported by an including card, a class-less sheet imported by nobody).
- **FR-6**: The four dead fallbacks of the Overview table are canonised (character-identical to `common.ts` or its terminal literal) and the other `--sf-border` fallback left un-canonical in ADR-018, `sf-dropdown.ts` (`rgba(0, 210, 255, 0.3)`), stays: it is live, and the guard passes it because `sf-dropdown` is false in FR-5.
- **FR-7**: The documents tell the truth. `ADR-018` gains a dated **Erratum** (the premise, the measurement of the chain, the fallbacks changed, the pointer to this spec; the Accepted text above it is not rewritten); `03_base_classes.md` § Design Tokens rule 2 names **only `sf-dropdown`** as an element that does not include the tokens, the `F-BASE-07` row of its feature table (line 19) cites this spec's tests, and the TC-307 row (line 295) reads "undeclared `--sf-*` name, fallback or not".
- **FR-8**: `tests/styles/card-css-baseline.json` is regenerated (`UPDATE_CSS_BASELINE=1 npx vitest run tests/styles/card-css-baseline.test.ts`) and the **reviewed diff** is exactly: the new `:host` declarations of FR-3 in `sciFiCommonStyles`, nothing else, in each card that embeds it; no card's rendered value changes. The BUILD records the diff's added lines in the commit message. The baseline folds only the 11 card tags, so the touched components (`sf-hexa-tile`, `sf-hexa-row`, `sf-wheel`, `sf-button-card`, `sf-button-card-select`, `sf-dropdown`) are proved separately by IT-SFT-I-02.
- **FR-9**: The honesty of the counts: the allow-lists and this spec name the counts as measured (36 / 51 / 110, and 11 + 4 + 21), derive every count in the tests from `src/` rather than writing it, and the first line of the `OPEN_CARD_NAMES` comment points to the 8 follow-up beads (pinned by TC-SFT-U-08).
- **FR-10**: The tests do not break the existing guards: `rem-fallbacks.test.ts` (no `rem` in a fallback), `ids-cas-uniques`, the repo-wide ids guard and `socle-contract.test.ts` stay green, with every `TC-SFT-*` / `IT-SFT-*` id of this spec cited in a test title (P14) and `docs/specs/sf-token-declarations/` listed wherever the repo guard requires. Proved by IT-SFT-I-05.
- **FR-11**: *Accepted limit (user decision, 2026-11-03, card-mod row).* Once `common.ts` declares a token on `:host`, a value of that token set on an **ancestor** (card-mod on an outer container, an HA theme) no longer wins over the `:host` declaration, for the card's own host **and** for every nested `sf-*` component that includes `sciFiCommonStyles` and so re-declares the tokens on its own `:host`. A rule on the card's host element reaches the card's own tree, but not the nested `sf-*` components, which re-declare on their own `:host`; the only workaround for those is a rule targeting the nested element. This limit is accepted by the user, carries no workaround promise beyond that, and is not testable (an external stylesheet); it is stated in the ADR-018 Erratum (FR-7) so a user finds it.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | For each name of FR-3 all fallbacks in `src/` are identical, except `--sf-bg-primary` (`#0d1117` ×4, `#101626` ×4), so declaring the common value changes no rendered value | High | SHOW — throwaway scanner, fallbacks per name grouped (output in the Overview table) | TC-SFT-U-02, IT-SFT-I-02 |
| 2 | Declaring a token on the card `:host` makes the previous fallback unreachable inside the card tree, and `sf-dropdown` (no inclusion, mounted in `sci-fi-vacuum`) inherits the same value from the card. happy-dom's handling of `var()` through `:host` is NOT assumed: IT-SFT-I-02 opens with a canary that proves it, and fails loudly when it does not hold | High | TELL — CSS inheritance across shadow roots, ADR-018 § Why `--sf-*` does not reach the editor tree | IT-SFT-I-02 (canary, then before/after on every touched component) |
| 3 | The elements of FR-6 include `sciFiCommonStyles` (so their fallback is dead): `sf-hexa-row`, `sf-hexa-tile`, `sf-wheel` directly, `sf-button-card` through `super.styles` | High | SHOW — grep: `sf-hexa-row.ts:17`, `sf-hexa-tile.ts:19`, `sf-wheel.ts:15`, `sf-button.ts:7-8`, `sf-button-card.ts:9` | TC-SFT-U-04 |
| 4 | A user who set `--sf-text-sm` (etc.) on an *ancestor* through card-mod relied on the undeclared name as a de-facto hook; after the `:host` declaration an ancestor value no longer wins, on the card and on its nested `sf-*` components (FR-11) | Low | TELL — CSS cascade: a declaration on the element itself beats an inherited value | [ACCEPTED: spec FR-11] |
| 5 | The HA root is 24px, so rem tokens are out | Medium | SHOW — `tests/styles/rem-fallbacks.test.ts` title, bead `x6e` | TC-SFT-U-02 asserts no `rem` among the new declarations |
| 6 | The 4 hooks are set by no one in `src/` | Low | SHOW — `grep -rn -e '--sf-hexa-border' -e '--sf-hexa-row-icon-off-color' -e '--sf-default-hexa-width' -e '--sf-selected-hexa-width' src` finds only `var()` reads | TC-SFT-U-05 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Renaming `--sf-text-*` to `--sf-font-size-*` because the names look alike | declare the px value (FR-3); the rem tokens are `x6e`'s |
| 2 | Declaring a token at a value other than its current rendered fallback "to clean up" | zero visual change; a visible change is a follow-up bead with before/after |
| 3 | Reading "includes `sciFiCommonStyles`" from the import line | follow the inheritance chain (FR-5) |
| 4 | Canonising a fallback on an element whose chain lacks the common styles | live insurance, stays (FR-6, `sf-dropdown`) |
| 5 | An allow-list entry with no bead, no date, or that outlives its cause | the ratchet fails (FR-2, FR-4) |
| 6 | A written count (`35`, `110`) in a test | counts are derived from `src/` (FR-9) |
| 7 | Resolving a card's open name inside this lot | its follow-up bead decides, with before/after |
| 8 | Exempting a class-less card sheet from the drift guard because it declares no class | resolve through its importers (FR-5); an unimported sheet is policed |

## Test Case Specifications

Tests live in `tests/styles/token-refs.test.ts` (extended; the existing TC-307 titles are kept, the first one re-worded to "no var(--x) targets a token defined nowhere in src/ (a --sf-* name even with a fallback)" since its rule widened) and the new `tests/styles/token-declarations.test.ts`, and cite these ids in their titles. Fixtures are in-memory source strings for the scanner and chain cases.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-SFT-U-01 | scanner fixture: `--sf-ghost` with a fallback, `--sf-ok` declared, a `--hook` in `HOOKS`, a non-`--sf` ghost with a fallback, a non-`--sf` ghost bare; plus a `//` fixture: ``url(//cdn/x.png) var(--sf-ghost2, red)`` inside a `css` block | FR-1 | `--sf-ghost` reported; `--sf-ok`, the hook and the non-`--sf` ghost with a fallback not reported; the bare non-`--sf` ghost reported; `--sf-ghost2` reported (the `//` of the URL is not read as a comment); message names declare / rename / remove |
| TC-SFT-U-02 | read `common.ts` through the test's own parser | FR-3 | the 12 new declarations carry the values of the Overview table, none in `rem`; `--sf-font-size-*` unchanged (`0.75rem`, `0.875rem`, `1rem`, `1.25rem`) |
| TC-SFT-U-03 | the real `src/` tree | FR-1, FR-2 | zero violations; the partition is pinned and derived: of the undeclared-before names, 11 are declared by `common.ts`, `HOOKS` has 4 keys, `OPEN_CARD_NAMES` has 21 keys (counts computed from `src/` and the tables, no literal), `--sf-bg-tile` is declared and in none of the three sets of 36; `--sf-glow-cyan` is keyed once with `bead` `3z0j` and `also` `yj6`; every bead is one of the 8 follow-up ids and matches its family; `HOOKS` reasons non-empty; a name in both tables fails (mutant fixture) |
| TC-SFT-U-04 | `includesCommonStyles` on the real files and on in-memory fixtures (direct / one level / two levels / override without `super.styles` / class-less sheet imported by an including card / class-less sheet imported by nobody) | FR-5, FR-6 | `sf-button-card`, `sf-button-card-select`, `sf-button`, `sf-hexa-row`, `sf-hexa-tile`, `sf-wheel` true; `sf-dropdown` false; the override-without-`super.styles` fixture false; the class-less sheet imported by an including card true (policed), imported only by a non-including class false (live), imported by nobody null (policed by the drift guard); on the real tree no card sheet is exempt for want of a class; the four FR-6 files hold the canonical fallbacks; `sf-dropdown.ts` keeps `rgba(0, 210, 255, 0.3)` |
| TC-SFT-U-05 | the ratchet on fixtures: an allow-list entry for a now-declared name, a hook name no longer referenced, an `OPEN_DRIFT` entry whose `max` is exceeded | FR-2, FR-4, FR-9 | each fails, names the line to delete, and counts are derived (no literal `36`/`51`/`110` in the test file) |
| TC-SFT-U-06 | allow-list bounds on fixtures: an `OPEN_DRIFT` key under `src/styles/` or on a token `common.ts` does not declare; a `max` larger than the measured sites; a `bead` not among the 8 or of another family; an `OPEN_CARD_NAMES` key read only by a socle file; a `reason` over 200 characters | FR-2, FR-4 | each fails and names the entry and the rule |
| TC-SFT-U-07 | declaration-scan scope on fixtures: `--sf-x:` in a plain string, in a comment, in a test file; `--sf-y:` in another card's `css` block; `--sf-z:` in an inline `style=` | FR-1 | the string, comment and test-file forms do not declare; the `css`-block and inline `style=` forms do, globally; the global limit is the pinned behaviour |
| TC-SFT-U-08 | the first line of the `OPEN_CARD_NAMES` comment in `token-refs.test.ts` | FR-9 | it names the 8 follow-up beads (`yj6`, `03i`, `xi7`, `rhd`, `3z0j`, `7ge9`, `gmvv`, `td4b`) |
| IT-SFT-I-01 | drift guard over the whole `src/` tree with the real `OPEN_DRIFT` | FR-4 | zero violation outside the allow-list; each `OPEN_DRIFT` entry owned by one of the 8 beads; `--sf-font-size-*` exempt by the `x6e` pointer |
| IT-SFT-I-02 | happy-dom. **Canary first:** an element whose `:host` declares `--sf-canary: 7px`, with a child reading `var(--sf-canary, 99px)`: computed value must be `7px`, else the test fails with "happy-dom does not resolve `var()` through `:host`" (the before/after below would otherwise prove nothing). **Then** each touched component (`sf-button-card`, `sf-button-card-select`, `sf-hexa-tile`, `sf-hexa-row`, `sf-wheel`, `sf-dropdown`) rendered inside a host declaring `sciFiCommonStyles`: computed value of the touched properties before the lot (fallback list kept in the test) and after | FR-3, FR-6, FR-8 | every computed `font-size`, `border-width`, `width/height` of icons, `background-color` is identical to the fallback value, `sf-hexa-tile` still `#101626`, the dropdown popup `#0d1117`; the canary passes |
| IT-SFT-I-03 | `UPDATE_CSS_BASELINE` diff replay: the folded baseline of each card before and after, as in `card-css-baseline.test.ts` | FR-8 | the only added declarations are the 12 `:host` ones of FR-3, `sf-bg-tile` included; no value changes |
| IT-SFT-I-04 | read ADR-018, `03_base_classes.md` | FR-7, FR-11 | ADR-018 has an `Erratum` heading naming `sf-button-card`, `super.styles`, this spec, and the ancestor-override limit of FR-11; rule 2 names `sf-dropdown` only and no longer says "both"; the `F-BASE-07` row cites `token-declarations.test.ts`; the TC-307 row (line 295) says "fallback or not" |
| IT-SFT-I-05 | run `rem-fallbacks.test.ts`, `ids-cas-uniques`, the repo-wide ids guard, `socle-contract.test.ts` with the new files in place; scan the test titles for the ids of this spec | FR-10 | all four green; every `TC-SFT-*` / `IT-SFT-*` id appears in a test title once; the repo guard lists `docs/specs/sf-token-declarations/` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| A new `--sf-*` ghost with a fallback is added | TC-307 fails, names the file, line, token | declare it, rename it, or remove it | the vitest message |
| An allow-list entry is stale (name declared, or no more references) | the ratchet fails, names the line | delete the entry | the vitest message |
| A card follow-up lands without deleting its entries | the same ratchet | delete them in that lot | the vitest message |
| An allow-list entry breaks a bound (slack `max`, wrong family, socle key, over-long reason) | TC-SFT-U-06 rule fails, names the entry | correct or delete the entry | the vitest message |
| A card-mod user set a `--sf-text-*` on an ancestor | the declared value on `:host` now wins over an inherited one, on the card and on nested `sf-*` components | a rule on the card's host for the card's own tree; for a nested `sf-*` component, a rule targeting it | none. [ACCEPTED: spec FR-11] |
| The chain resolver cannot read a `extends` target | the file is reported as unresolved (never silently treated as including the styles) | fix the import or add the target | the vitest message |
| A class-less card sheet is imported by no class | it is policed by the drift guard, not exempted | import it from its card or remove it | the vitest message |
| happy-dom does not resolve `var()` through `:host` | the IT-SFT-I-02 canary fails with its message | fold the declared CSS text instead of computed values for that row, and say so in the BUILD commit message | the vitest message |

## Builder Calls

- *mine*: the new name `--sf-bg-tile` for the 4 hexa-tile sites (`#101626`), because one name cannot hold two values and zero change forbids merging them; the name is the user's to rename at the review.
- *user*: `--sf-border-light` (1 site, same value as `--sf-bg-tertiary`) is NOT renamed to `--sf-bg-tertiary`: it is declared as an alias, `--sf-border-light: var(--sf-bg-tertiary)` (user answer, 2026-11-03).
- *user*: `--sf-bg-tile: #101626` (4 `sf-hexa-tile` sites) and `--sf-bg-primary: #0d1117` are VALIDATED by the user (2026-11-03).
- *user*: card-mod limit ACCEPTED (2026-11-03), written as FR-11.
- *mine*: `--sf-glow-cyan` (tv and bridge) is keyed once, owner bead `3z0j` with `also: yj6`, because a name has one allow-list line; either lot deletes it only when no card reads it.
- *mine*: the drift guard applies to `--sf-*` tokens declared by `common.ts` only; local redefinitions (bridge `--sf-bg`) and non-`--sf-` ghosts are not guarded in this lot (`ha-sci-fi-gmvv`).
- *mine*: `OPEN_DRIFT` is generated from the guard's output at BUILD, then reviewed; the Overview does not list its ~70 entries because their sites are measured by the code, not frozen here; its bounds are FR-4's.
- *mine* (builder check): the scanner, the three tables and TC-SFT-U-01/03/05/06/07/08 live in `token-refs.test.ts`; the chain helper, IT-SFT-I-02/03/04/05 in `token-declarations.test.ts` (which imports the exports of the former); scanner functions take the tables as parameters so fixtures and mutants can feed them; parsing is regex and blanking, no TS AST; a file with several styled classes is exempt only if every one includes the common styles; a file that locally redeclares the token it reads is skipped by FR-4; the 11 settled names are a fixture list in TC-SFT-U-03, the counts derived; `also` is an optional single bead-id string.
- *mine* (builder check): a name that the bounded scan of FR-1 finds outside the 11 / 4 / 21 sets, or an open name read by a socle file, is not guessed: BUILD stops and amends this spec before writing the entry (the 36 were measured with the broader rule; a delta is a spec change, not an allow-list entry). `ids-cas-uniques.test.ts` lists no feature-spec directory (checked); if a guard turns out to require one, BUILD adds that file to the diff list below in the same commit. `--sf-bg-tile` is validated (see above), not open.
- *reconciled at VERIFY* (2026-11-03): the scanner, the tables helper and the chain helper (`includesCommonStyles`, FR-5) live in the new `tests/styles/token-scan.ts` (a test file cannot import another without duplicating its describes and breaking the "id cited once" rule); TC-SFT-U-04 and IT-SFT-I-01 sit in `token-refs.test.ts`, not in `token-declarations.test.ts`. The Carriers table reads accordingly: FR-5 is carried by `tests/styles/token-scan.ts`, consumed by FR-4 and FR-6 in `token-refs.test.ts`.
- Files expected in the diff (BUILD declares them before the batch): `src/styles/common.ts`, `src/components/sf-hexa-tile.ts`, `src/components/sf-hexa-row.ts`, `src/components/sf-wheel.ts`, `src/components/buttons/sf-button-card.ts`, `tests/styles/token-refs.test.ts`, `tests/styles/token-scan.ts`, `tests/styles/token-declarations.test.ts`, `tests/styles/card-css-baseline.json`, `docs/adr/ADR-018_palette-fixed-identity.md`, `docs/specs/03_base_classes.md`.

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `tests/styles/token-refs.test.ts` | `npm test` |
| `FR-3` | code — `src/styles/common.ts` | every card (`:host`), `sf-dropdown` by inheritance |
| `FR-2` | code — `tests/styles/token-refs.test.ts` (`HOOKS`, `OPEN_CARD_NAMES`) | `npm test`, the follow-up beads that delete entries |
| `FR-4` | code — `tests/styles/token-refs.test.ts` (`OPEN_DRIFT`) | `npm test`, the follow-up beads |
| `FR-5` | code — `tests/styles/token-scan.ts` (`includesCommonStyles`) | `FR-4` and `FR-6` in `token-refs.test.ts` |
| `FR-7` | config/schema — `docs/adr/ADR-018_palette-fixed-identity.md`, `docs/specs/03_base_classes.md` | readers of the design-token rules; `tests/docs/` |
| `FR-8` | config/schema — `tests/styles/card-css-baseline.json` | `card-css-baseline.test.ts` |
| `FR-11` | config/schema — `docs/adr/ADR-018_palette-fixed-identity.md` (Erratum) | users of card-mod and HA themes |

## References

- [ADR-018](../../adr/ADR-018_palette-fixed-identity.md)
- [03_base_classes.md § Design Tokens](../03_base_classes.md)
- [repo-wide ids guard](../repo-wide-ids-guard/spec.md)
- [common.ts](../../../src/styles/common.ts)
- [token-refs.test.ts](../../../tests/styles/token-refs.test.ts)
- bead `ha-sci-fi-x6e` (rem tokens); follow-ups `ha-sci-fi-yj6` (bridge), `-03i` (vacuum), `-xi7` (stove), `-rhd` (climates), `-3z0j` (tv), `-7ge9` (hexa-tiles), `-gmvv` (weather), `-td4b` (water)
