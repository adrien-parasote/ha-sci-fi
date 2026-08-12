# ADR-018: Two Palette Families — themed frame and text, fixed state and illustration

- **Status:** Accepted
- **Date:** 2026-08-12
- **Deciders:** user + agent (`bd ha-sci-fi-63z`)

## Context

ADR-017 step 9 counted **203 colour literals** in the card sheets, substituted the
**10** that exactly equalled an existing `--sf-*` token, and filed the rest as
`ha-sci-fi-63z`. That bead asks two questions this ADR answers:

1. Should the **theme-chained** tokens (`--sf-primary`, `--sf-bg`, `--sf-text-*`)
   replace hardcoded colours, which would make the cards follow the user's HA theme?
2. Should **new** tokens be minted for the literals that match nothing?

### The token families

`src/styles/common.ts` declares two kinds of token, and the distinction is the
whole subject of this ADR:

| Family | Tokens | Resolves to |
|---|---|---|
| **Fixed** | `--sf-accent-on`, `--sf-warning`, `--sf-error`, `--sf-border`, `--sf-bg-secondary`, `--sf-text-disabled`, `--sf-accent-off` | a literal, always the same colour |
| **Chained** | `--sf-primary`, `--sf-bg`, `--sf-text-primary`, `--sf-text-secondary` | `var(--<ha-theme-var>, <literal>)` — follows the user's theme, falls back to the literal |

### Re-measurement (this ADR, `63f325e`)

The bead's premise was that the literals *bypass* the palette. Re-measuring by
parsing every `` css` ` `` template literal in `src/` (excluding `common.ts`, which
*is* the definition) and classifying each occurrence by its syntactic position
shows that they overwhelmingly do not. The raw occurrence totals match the bead;
the **context** of those occurrences does not.

| Literal | Token | Family | Total | `var()` fallback in `` css` ` `` | `var()` fallback in inline style | raw value in `` css` ` `` | raw in TS / inline style |
|---|---|---|---|---|---|---|---|
| `#00ff9d` | `--sf-accent-on` | fixed | 25 | 17 | 6 | 0 | 2 |
| `#ffd60a` | `--sf-warning` | fixed | 13 | 9 | 2 | 0 | 2 |
| `#ff4d6d` | `--sf-error` | fixed | 12 | 9 | 1 | 0 | 2 |
| `rgba(0, 210, 255, 0.15)` | `--sf-border` | fixed | 7 | 5 | 0 | **2** | 0 |
| `rgba(255, 255, 255, 0.04)` | `--sf-bg-secondary` | fixed | 1 | 0 | 0 | **1** | 0 |
| `rgba(224, 232, 255, 0.3)` | `--sf-text-disabled` | fixed | 1 | 1 | 0 | 0 | 0 |
| **fixed subtotal** | | | **59** | **41** | **9** | **3** | **6** |
| `#00d2ff` | `--sf-primary` | chained | 110 | 100 | 5 | **1** | 4 |
| `#e0e8ff` | `--sf-text-primary` | chained | 17 | 17 | 0 | 0 | 0 |
| `rgba(224, 232, 255, 0.6)` | `--sf-text-secondary` | chained | 12 | 12 | 0 | 0 | 0 |
| **chained subtotal** | | | **139** | **129** | **5** | **1** | **4** |
| **total** | | | **198** | **170** | **14** | **4** | **10** |

`--sf-accent-off` and `--sf-bg` have zero literal occurrences anywhere.

**184 of the 198 are already a `var(--token, literal)` fallback.** The literal is
not a bypass of the design system, it is the *declared default* of the token that
is already applied at that declaration. The cards are not contouring the palette;
they are using it with a defensive fallback, which is the codebase's dominant and
correct idiom.

That reframes the bead. There is no population of 193 rogue literals waiting for
tokens. There are **4 raw colour values** in `` css` ` `` that equal a token value,
and they are enumerated below. Everything else in the 203 is a bespoke
illustration or domain colour (`rgb(250, 146, 29)` ×16 on the plugs card,
`#6ecbf5` ×12, `rgb(102, 156, 210)` ×10, the landspeeder paint, the radiator heat
ramp, the weather icon tints) that matches **no** token, by value or by intent.

### The four raw values, and why none of them is substitutable

| # | Site | Literal | Nominal token | Why it stays |
|---|---|---|---|---|
| 1 | `src/styles/editor-common.ts:204` | `rgba(0, 210, 255, 0.15)` | `--sf-border` | editor tree — token does not reach it |
| 2 | `src/components/editor-inputs/sf-editor-slider.ts:35` | `rgba(0, 210, 255, 0.15)` | `--sf-border` | editor tree — token does not reach it |
| 3 | `src/components/editor-inputs/sf-editor-input.ts:44` | `rgba(255, 255, 255, 0.04)` | `--sf-bg-secondary` | editor tree — token does not reach it |
| 4 | `src/cards/water/styles.ts:6` | `#00d2ff` (`--water-on-color:`) | `--sf-primary` | chained family — decision 1 forbids it |

Two further whitespace variants are value-identical but not character-identical to
the token declaration, and are excluded for their own reasons:
`src/cards/bridge/sci-fi-bridge-editor.ts:78` (`rgba(0,210,255,0.15)`, editor tree)
and `src/cards/bridge/styles.ts:17`
(`--sf-bg-secondary: rgba(255,255,255,0.04)`, a deliberate local redefinition of
the token — substituting it would make the declaration circular).

### Why `--sf-*` does not reach the editor tree

`--sf-*` is declared on the `:host` of `sciFiCommonStyles`. Custom properties
inherit down the DOM tree and do cross shadow roots, so any element rendered
*inside* a card's tree receives them. `sciFiCommonStyles` is included by the 11
cards, the 8 bridge sections, and the six shared widgets (`sf-button`,
`sf-circle-progress-bar`, `sf-hexa-row`, `sf-hexa-tile`, `sf-stack-bar`,
`sf-wheel`).

**No editor includes it**, and no editor is a descendant of a card: HA renders the
config editor in `hui-dialog-edit-card`, as a *sibling* of the card preview, not a
child of it. The editor tree therefore has its own token family, declared on the
`:host` of `sciFiEditorCommonStyles` — `--editor-gap`, `--editor-border`,
`--editor-chip-bg`, `--editor-section-color`, `--editor-chip-color` — chained to
the HA theme variables that *do* reach a dialog (`--divider-color`,
`--primary-text-color`, `--secondary-text-color`).

Writing `background: var(--sf-border)` in an editor sheet would be invalid at
computed-value time and the declaration would fall back to `transparent`. This is
the single most dangerous substitution the bead invites, and it is the one three
of the four candidates would have been.

## Decision

**Frame, primary accent and text follow the HA theme. State colours and
illustrations are fixed. The line runs *through* each card, not between the cards
and the shared kernel.**

That is not a new rule — it is what the measurement above shows the code already
does, and this ADR's decision is to keep it exactly there:

| What | Rendered by | Follows the HA theme? |
|---|---|---|
| card background, border, primary accent, body text | chained tokens `--sf-bg`, `--sf-primary`, `--sf-text-primary`, `--sf-text-secondary` — **129 of them inside card sheets** | **yes** |
| on/off, warning, error, disabled state | fixed tokens `--sf-accent-on`, `--sf-warning`, `--sf-error`, `--sf-text-disabled`, `--sf-accent-off` | no |
| illustrations and domain palettes (landspeeder, radiator, stove, plugs, weather icons) | bespoke literals in the owning card's sheet | no |

Concretely:

1. **No theme-chained token replaces a hardcoded colour.** (Answers bead question 1: *no*.)
2. **No new token is minted for the remaining literals.** (Answers bead question 2: *no*.)
3. **No substitution is performed.** The palette is already applied everywhere it
   reaches; the four raw values are each blocked by 1 or 2 above. The CSS this
   commit *does* change is a different operation — correcting fallbacks and one
   misspelt token name to say what already renders (§ Corrected here) — and it
   moves no colour across the line drawn above.

`--sf-primary` carrying two roles at once — "the HA theme accent" *and* "the
sci-fi cyan" — is the arbitrage the bead flags. It is resolved here in favour of
keeping both roles on the one chained token and **not** substituting the `#00d2ff`
occurrences. This is a held position, not a deferral. It needs stating precisely,
because the naive reading of it is false: the cards **already** follow the theme
through that token at 100 of its 110 sites. What the decision refuses is
converting the remaining raw literals *into* it — a card-local widget token
(`--water-on-color`) and, by the same logic, any future state or illustration
colour. Nobody should reopen this as an oversight in either direction.

## Options considered

| Option | Summary | Rejected because |
|---|---|---|
| A | Substitute the theme-chained tokens for the matching literals, so cards follow the user's HA theme | **Rejected — and mostly a no-op anyway.** 138 of the 139 chained-family literals are *already* the fallback of the chained token, so the cards already follow the theme at those sites; there is nothing there to substitute. Only one raw site remains (`--water-on-color`), and converting it would push theme-following past the line the code already draws, into card-local widget state. Pushing further still — onto the `#00ff9d` on-state green, the `#ffd60a` warning amber, the `#ff4d6d` error red, the illustration palettes — is impossible on the merits: the HA theme has no variable meaning "warning" or "landspeeder paint", so those stay fixed by construction. A card whose on-lamp tracked the user's accent while the amber warning beside it could not is incoherent in a way the current split is not. |
| B | Mint new `--sf-*` tokens for the ~193 unmatched literals | **Rejected.** A token earns its name when a value is both *shared across consumers* and *carries meaning*. These are illustration and domain palettes — the landspeeder paint, the radiator heat ramp, the weather icon tints — with exactly one consumer each. Naming them would publish a palette contract nobody reads and everybody has to keep in sync. |
| C | Apply the existing palette wherever a literal already equals a token value, character for character | **Chosen in principle, empty in practice.** This is not extending the contract, it is ceasing to route around it. Re-measurement found 4 such sites and every one is blocked: 3 sit in the editor tree where `--sf-*` does not resolve, and the 4th belongs to the chained family that option A rejects. Net: 0 substitutions. |
| D | Extend `--sf-*` into the editor tree so the 3 editor sites become substitutable | **Rejected, out of scope.** It would mean declaring the card token family on every editor `:host`, duplicating a second token domain into the config dialog, for 3 declarations. The `--editor-*` family already covers that tree and is already theme-chained. |

## Consequences

**Positive:**
- The bead's two questions are answered and closed, with the arbitrage written
  down rather than carried as unnamed debt.
- The rule is now stateable in one line and checkable by review: *frame, accent and
  text chained; state and illustration fixed; the line runs through each card.*
- The reachability boundary is documented. `var(--sf-border)` in the editor tree
  is now a known regression, not a plausible cleanup somebody attempts later.
- The four latent defects the audit surfaced are corrected in the same commit
  rather than filed (see § Corrected here), so the ADR leaves no debt behind it.

**Negative / tradeoffs:**
- Users who theme HA get partial integration by design: card background, frame,
  primary accent and text follow the theme; status colours and illustrations do
  not. That is the intended look, and it needs to be said out loud in the README
  the day somebody files it as a bug.
- The `var(--token, literal)` idiom means each token's default value is repeated at
  every use site. Changing a fixed token's value means changing `common.ts` *and*
  its fallbacks, or accepting that the fallbacks drift into decoration. Ten such
  drifts existed on `--sf-border` alone and are corrected below; nothing prevents
  the next one but review.
- ~193 bespoke colours stay unnamed. Recolouring the plugs card or the radiator
  remains a find-and-replace over one file, which is acceptable precisely because
  each has one consumer.

**Risks:**
- *A fallback drifts away from its token's real value, and nobody notices because
  the token always resolves.* This is the live one, and it was widespread. Of the
  24 `var(--sf-border, …)` in `src/`, **17 carried a fallback that was not
  `--sf-border`'s declared value** — ten in `bridge/styles.ts` alone (five white
  `rgba(255,255,255,α)` at α = 0.06/0.04/0.2/0.04/0.1, five cyan at the wrong alpha
  0.2/0.2/0.2/0.3/0.18), plus three whitespace variants there and four more in
  `hexa-tiles/styles.ts`, `sf-wheel` and `sf-hexa-tile`. Every one is dead code:
  each of those elements declares `sciFiCommonStyles` in its own `static styles`,
  so `--sf-border` is defined on its own `:host`, and nothing in `src/` redefines
  it. Dead but actively misleading — a reader infers `--sf-border` is a white 4 %
  border, or a pale lavender one. All 17 corrected below. Mitigation for the next
  one: `tests/styles/card-css-baseline.json` locks the resolved text of all 11
  cards, so any such declaration surfaces as a reviewed diff.
- *A shared widget is reused outside a card tree and silently loses the palette.*
  `src/utils/toast.ts` is the standing example: it appends to `document.body`, so
  it inherits nothing and hard-codes `#00ff9d` / `#ffd60a` / `#ff4d6d` / `#00d2ff`
  in an inline style string — correctly, given where it mounts. `sf-dropdown` is
  the latent one: it does not include `sciFiCommonStyles` and relies on being a
  descendant of `sci-fi-vacuum`, its only consumer today. Mitigation: this ADR
  states the rule; a component in `src/components/` that needs the tokens must
  include `sciFiCommonStyles` itself rather than rely on its mount point.
- *A dangling token reference resolves to its fallback forever and looks fine.*
  Two shapes of this exist. A misspelt `--sf-*` name (`--sf-color-cyan`, corrected
  below) is caught by grepping the declarations in `common.ts`. The harder shape is
  a plausible-looking **HA** variable that HA does not define: `--secondary-bg-color`
  appears at 5 sites and is declared nowhere in this repo, while the real HA
  variable is `--secondary-background-color`. Every one of those 5 is inert and
  always renders its fallback. Nothing detects this class automatically — a
  reference to an undefined variable is legal CSS.

## Corrected here

The audit surfaced four latent defects. They are fixed in this commit rather than
filed, because each is a mechanical correction on a file already in the diff and
none needs a product decision.

| # | Site | Was | Now | Rendering |
|---|---|---|---|---|
| a | `src/cards/water/styles.ts:188` | `var(--sf-color-cyan, #00d2ff)` — token declared nowhere | `var(--sf-primary, #00d2ff)` | changes only for a themed user, and only to align this one site with the other 100 `--sf-primary` sites |
| b | `bridge/styles.ts` ×13, `hexa-tiles/styles.ts` ×2, `sf-wheel.ts` ×1, `sf-hexa-tile.ts` ×1 | `var(--sf-border, <anything but the declared value>)` — 17 sites, 4 distinct wrong values plus whitespace variants | `var(--sf-border, rgba(0, 210, 255, 0.15))`, character-identical to `common.ts` | none — `--sf-border` always resolves in these elements, the fallbacks were dead |
| c | `src/components/sf-stack-bar.ts:26` | `color: var(--secondary-bg-color, …)` — a *foreground* taken from a *background* variable, and one HA does not define | `color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6))` | none today (the old variable was inert); a themed user now gets secondary **text** colour, which is what the declaration means |
| d | `docs/MASTER.md` | § ADR Summary stopped at ADR-015, intro said "15 ADRs" | ADR-016/017/018 listed, count corrected to 18 | — |

`--water-on-color` (`water/styles.ts:6`) is deliberately **not** in this table: it
is the one raw chained-family literal, and Decision point 1 is what holds it fixed.

**The two `--sf-border` fallbacks deliberately left un-canonical** are the test's
own negative cases: `src/components/sf-dropdown.ts:43` (`rgba(0, 210, 255, 0.3)`)
and `src/components/buttons/sf-button-card.ts:21` (`rgba(224, 232, 255, 0.1)`).
Neither component includes `sciFiCommonStyles`; both rely on being mounted inside a
card. For them the fallback is **not** dead — it is what renders the day either is
mounted anywhere else — so it is real insurance and stays. The selection rule for
correction was therefore mechanical: *canonicalise the fallback iff the element
declares `sciFiCommonStyles` in its own `static styles`.*

Two further sites are knowingly left alone, outside this ADR's scope:
`src/cards/stove/styles.ts:320` and `src/cards/weather/styles.ts:206,210` also read
the non-existent `--secondary-bg-color`, but their fallbacks are bespoke colours
with no token equivalent, so correcting the variable name would be a colour choice,
not a mechanical fix.
