# ADR-017: Feature-First Modules — cards own their config, labels and exclusive components

- **Status:** Accepted
- **Date:** 2026-08-12
- **Deciders:** user + agent (`/sc:refactor`)

## Context

ADR-009 urbanized the *card* directories: every card owns `sci-fi-<card>.ts`,
`-editor.ts` and `styles.ts`. What ADR-009 did **not** move is everything else a
card owns. Those artefacts still live in shared hubs organised by technical kind
(`types/`, `utils/`, `components/`), so a change confined to one card lands in a
file that every other card imports.

Measured on `main` @ `f1a949b` (sentrux, 314 files / 507 import edges):

| Signal | Value |
|---|---|
| quality_signal | 0.6388 (floor in `rules.toml`: 0.60) |
| Bottleneck | **modularity 0.156** — 415 of 507 import edges cross a module boundary |
| Cycles | 0 |
| `check_rules` | **FAIL** — `max_fn_lines` (11 functions > 100 l), `max_cc` (1 function cc=32) |

Named anti-patterns:

1. **God types module** — `src/types/config.ts`: 436 lines, 50 exports, one
   block per card, imported by 30 files. Adding a field to the vacuum config
   edits a file in the import graph of all 11 cards.
2. **God dictionary in the shared base class** — `SciFiBaseEditor.getLabel()`
   (`src/utils/base-editor.ts:106`) is 189 lines / 179 keys holding the UI
   vocabulary of all 11 editors; `getSectionTitle()` adds a 28-entry icon map.
   118 of the 179 keys have a single consumer. Some keys are built dynamically
   (`getLabel('input-icon-' + key)`), so no tool can tell a live key from a dead
   one. Every new editor field edits the class every editor extends.
3. **Card-exclusive components parked in the shared layer** —
   `sf-landspeeder.ts` (925 l, vehicles only), `sf-radiator.ts` (554 l, climates
   only), `sf-stove-image.ts` (197 l, stove only), `vehicle_const.ts` (vehicles
   only) sit in `src/components/`, which `rules.toml` declares reusable and
   forbids from depending on cards. ~48 % of the layer's LOC has exactly one
   consumer, which makes that boundary rule vacuous.
4. **Monolithic render functions** — `_renderSpeeder` 412 l (an inline SVG
   asset), `sci-fi-tv.ts:renderCard` 261 l / cc=32, `sf-radiator.__displayImage`
   131 l, plus 4 editor render methods at 106–118 l.

Root cause: the layering is drawn by *technical kind* rather than by *feature*,
so every card-specific artefact that is not the card itself is pushed into a
shared hub.

Out of the diagnosis but **not** part of this ADR: `src/sci-fi.ts` is reported as
a god file (fan-out 28). It is a pure barrel + Lovelace registry — the fan-out is
intrinsic and the right answer is a `rules.toml` exclusion, not a refactor.

## Decision

Adopt **feature-first co-location** for card-owned artefacts, keeping an
explicit shared kernel.

```
src/
  cards/<card>/
    sci-fi-<card>.ts          (unchanged)
    sci-fi-<card>-editor.ts   (unchanged)
    styles.ts                 (unchanged)
    config.ts                 ← NEW: this card's config interfaces
    labels.ts                 ← NEW: this card's editor label dict
    <card-exclusive components moved here>
  types/config.ts             ← kernel only: SciFiBaseConfig, ActionConfig,
                                assertString/assertDefined, isValidCardType
  utils/base-editor.ts        ← lookup MECHANISM + shared keys only
  components/                 ← only components with ≥ 2 consumers
```

Dependency direction: `cards/<card>` → kernel (`types`, `utils`, `styles`,
`selectors`, `components`). No card→card, no kernel→card. Unchanged from today —
this ADR narrows the kernel, it does not invert anything.

Pattern: **Move Module** (pure relocation + import rewrite), then **Extract
Method** for the oversized functions.

A third concern, the CSS duplication, is included at the user's decision (see
Options C below): `:host`/`.header`/`.container` are redeclared across 10–11 card
stylesheets — `lights` and `climates` are near-identical copies that have already
drifted apart, `plugs` bypasses the `--sf-*` tokens with raw `rgb()`. A shared
`src/styles/card-chrome.ts` absorbs the identical blocks and the token bypasses
are corrected.

Explicitly OUT OF SCOPE:
- Any behaviour change. Rendered output, YAML config surface and public custom
  element names are byte-identical before and after.
- `src/sci-fi.ts` fan-out (see above).
- Splitting `sf-radiator` into the 4 sub-components that spec 04 § F-COMP-02
  already claims exist. That claim is stale (the code is one 554-line file); this
  ADR corrects the spec to match reality and files the split as follow-up.

## Options considered

| Option | Summary | Rejected because |
|---|---|---|
| A | Feature-first co-location of config, labels and card-exclusive components | — chosen (phase 1, steps 1-4) |
| B | Extract-method: split the 11 oversized functions | — chosen (phase 2, steps 5-7). Alone it would turn `check_rules` green without touching the root cause; sequenced after A it lands on already-relocated files. |
| C | Style kernel: hoist card chrome into `styles/card-chrome.ts`, enforce `--sf-*` tokens | — chosen (phase 3, steps 8-9) at the user's decision, against the agent's recommendation to defer. Biggest raw duplication (~4 100 lines of card CSS vs 158 of tokens) but the weakest native safety net: no existing test asserts a computed style. Mitigated by a purpose-built CSS equivalence harness (see Risks). |

## Consequences

**Positive:**
- A card's blast radius becomes its own directory. Adding a vacuum config field
  or a lights editor label no longer edits a file 30 other modules import.
- `src/components/` becomes what `rules.toml` already claims it is, so the
  `components ↛ cards` boundary starts catching real violations.
- Cross-module import edges drop (the 30 `types/config.js` importers and the
  base-editor label coupling are the two largest contributors to modularity 0.156).
- Labels become locally readable: a card's dictionary sits next to the editor
  that consumes it, dynamic-key construction included.

**Negative / tradeoffs:**
- More files (2 new small modules per card), which is the point but is still more
  files to open.
- The shared/single-consumer split for labels is a judgement call: 23 keys have
  2+ consumers and stay in the kernel; a later card wanting a "single-consumer"
  key must promote it back.
- Estimated scope: ~35 files touched, ~1 400 lines moved, 0 lines of behaviour.

**Risks:**
- *A moved import is missed* — Mitigation: `tsc --noEmit` is exhaustive on ESM
  path specifiers; it fails on any dangling `.js` path.
- *A dynamically-built label key silently falls back to `''`* — Mitigation: the
  4 dynamic construction sites are known (climates ×4, vacuum ×2, hexa-tiles,
  tv); each is covered by an editor test, and the merged-map lookup keeps the
  kernel fallback.
- *Test files reference old paths* — Mitigation: 91 test files / 1019 tests, all
  green at baseline; they are moved in the same commit as the source.
- *A CSS hoist changes the cascade and silently breaks a layout* (phase 3, the
  serious one — no existing test asserts a computed style) — Mitigation: a
  purpose-built harness parses each card's flattened `cssText` into a normalized
  `selector → declarations` map and asserts the map is identical before and
  after the hoist. Only blocks that are byte-identical across cards are hoisted,
  and the chrome is placed FIRST in the `static styles` array so any per-card
  override still wins the cascade. Token substitutions (`rgb(...)` → `--sf-*`)
  are done only where the token's fallback value equals the literal being
  replaced, which the same harness verifies.

## Migration strategy

**Move Module**, one atomic step per concern, each independently verifiable.
Big-bang is not needed: no step depends on the next, and every step is a pure
relocation the compiler fully checks.

The component moves come *first*, before the config split, on purpose:
`sf-landspeeder.ts` imports `SciFiVehicleEntry`. Splitting `config.ts` while the
component still sits in `src/components/` would leave it importing
`cards/vehicles/config.js` — a `components → cards` edge that `rules.toml`
forbids. Moving the component first keeps every intermediate commit
boundary-clean.

| # | Step | Verify |
|---|---|---|
| 1 | Move `sf-landspeeder.ts` + `vehicle_const.ts` → `cards/vehicles/` | tsc + vitest |
| 2 | Move `sf-radiator.ts` → `cards/climates/`, `sf-stove-image.ts` → `cards/stove/` | tsc + vitest |
| 3 | Split `types/config.ts` → 11 `cards/<card>/config.ts` + kernel | tsc + vitest |
| 4 | Split `getLabel`/`getSectionTitle` → 11 `cards/<card>/labels.ts` + kernel mechanism | tsc + vitest |
| 5 | Extract the 412-line SVG out of `_renderSpeeder` into an asset module | tsc + vitest |
| 6 | Extract `sci-fi-tv.ts:renderCard` (261 l, cc=32) into per-zone methods | tsc + vitest |
| 7 | Extract the remaining 100+ line functions (radiator, 4 editors) | tsc + vitest + `check_rules` |
| 8 | Build the CSS equivalence harness, then hoist what is genuinely shared | tsc + vitest + CSS harness |
| 9 | Replace token-bypassing literals (`rgb(...)`) with `--sf-*` tokens | tsc + vitest + CSS harness |
| 10 | Sync CODEMAPS + specs 02/03/04/05/10 to the post-refactor tree | doc review + link check |

Commit format: `refactor(<scope>): <what> — step N/10`.

Test coverage requirement before starting: **met** — baseline `npx tsc --noEmit`
clean and `npx vitest run` 91 files / 1019 tests green, captured before step 1.

## Correction to the diagnosis (recorded after step 8)

The diagnosis claimed a duplicated *card chrome*: `:host` in 11 stylesheets,
`.header` in 10, `.container` in 10. Counting selector names was the wrong
measurement. Once the equivalence harness folded every card's resolved CSS and
compared rules by their **declarations**, the real picture came out:

| Duplication | Size | Verdict |
|---|---|---|
| `lights` ↔ `water` | **26 rules / 106 declarations** — card frame, header, power button, and the whole hexagonal floor-tile widget with its hover/selected/active states | Hoisted into `src/styles/floor-nav.ts` |
| `bridge` ↔ `water` | `@keyframes spin`, 2 rules / 2 declarations | Left duplicated — a shared module for 4 lines costs more than it saves, and folding it into `sciFiCommonStyles` would push an unused rule into all 11 cards |
| `climates` ↔ `weather`, `stove` ↔ `vacuum` | one `.container`, 3 declarations each | Left duplicated — same reason |

There is **no** chrome common to the 11 cards. The 10 `.header` blocks are ten
different `.header` rules: `lights` and `climates` are near-copies that have
already drifted (`align-items`, `min-height` present in one, absent in the
other), and `plugs` is unrelated and bypasses the `--sf-*` tokens outright.
What exists is one duplicated *widget* between two cards, which is a component
problem, not a design-system problem.

Net effect: `lights/styles.ts` 478 → 335, `water/styles.ts` 557 → 414, with 184
shared lines declared once in `styles/floor-nav.ts`.

The token half of C (step 9) shrank for the same reason. Of the **203 colour
literals** in the card sheets, only **10** exactly equal an existing `--sf-*`
token; those 10 were substituted. The other 193 are bespoke values with no token
equivalent — `plugs` "bypassing the tokens" turned out to mean *it uses colours
the design system does not define*. Giving them tokens is designing new palette
entries, a product decision, not a refactor. Filed as follow-up.

Substitution rule applied, and it matters: only tokens whose value is a **literal**
(`--sf-border`, `--sf-bg-secondary`, `--sf-text-disabled`) were used. Tokens that
chain to an HA theme variable — `--sf-primary: var(--primary-color, #00d2ff)`,
`--sf-bg`, `--sf-text-primary`, `--sf-text-secondary` — were excluded: replacing
a hardcoded colour with one of those makes the card follow the user's HA theme,
which is a visible behaviour change and not this ADR's to make.

## Outcome (measured after step 10)

| Signal | Before (`f1a949b`) | After | |
|---|---|---|---|
| quality_signal | 0.6388 | **0.6545** | floor 0.60 |
| modularity (the bottleneck) | 0.156 | **0.227** | +45 % |
| cross-module import edges | 415 / 507 (82 %) | **406 / 545 (75 %)** | |
| propagation cost | 345 | **317** | |
| redundancy | 0.112 | **0.103** | |
| cycles | 0 | 0 | |
| `check_rules` `max_cc` | 1 violation (cc=32) | **0** | |
| `check_rules` `max_fn_lines` in `src/` | 9 violations | **0** | |
| tests | 91 files / 1019 | 92 files / 1031 | all green |
| `tsc --noEmit`, `eslint`, `npm run build` | clean | clean | 0 errors |

`types/config.ts` 436 → 51 lines. `base-editor.ts` 347 → 214, `getLabel()`
189 → 4. `sf-landspeeder.ts` 925 → 518. `sci-fi-tv.ts:renderCard` 261 → 27.

Two `check_rules` violations remain and are intentional:
- `dev/modules/icon-browser.js` (198 lines) and `dev/modules/mock-hass.js` (117)
  — the workbench, plain JS, never shipped in the bundle. Either fix them in
  their own pass or exclude `dev/**` in `rules.toml`.
- `src/sci-fi.ts` fan-out 28 — barrel + registry, see Context.

## Follow-ups filed by this ADR

1. Split `sf-radiator` into the 4 sub-components spec 04 § F-COMP-02 has claimed
   since day one but which were never written.
2. `vacuum-editor` builds `input-${f.replace('_','-')}`, which replaces only the
   first underscore: `current_clean_area` → `input-current-clean_area`, a key
   that does not exist. Two sensor fields render an empty label.
3. Six unreachable label keys: `input-last-clean-area`,
   `input-last-clean-duration`, `input-device`, `action-call-children`,
   `input-input-button-entity`, `input-button-text`.
4. 193 colour literals in the card sheets match no `--sf-*` token. Extending the
   palette to cover them is a design decision, not a refactor.
5. Decide whether `--sf-primary` and the other theme-chained tokens should
   replace hardcoded colours — that makes cards follow the user's HA theme, a
   visible product change.
6. `.claude/` is not in `.gitignore`; a worktree created under
   `.claude/worktrees/` shows up as untracked in the main checkout.

## Rollback plan

Every step is one atomic commit on `refactor/sc-refactor`, a worktree branch that
`main` does not track. Rollback at step K:

```
git revert --no-edit HEAD~<10-K>..HEAD
```

Total abandon: delete the worktree; `main` was never touched.
