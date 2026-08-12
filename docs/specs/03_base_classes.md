# Spec 03 — Base Classes & Styles

> Document Type: Implementation
> Covers: Step 3 from [MASTER.md](../MASTER.md#spec-gate-pre-checklist)
> Depends on: [Spec 01](./01_infrastructure.md#L1), [Spec 02](./02_domain_selectors.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F-BASE-01 | `SciFiBaseCard` abstract base | ✅ `base-card.ts` |
| F-BASE-02 | `SciFiBaseEditor` abstract base | ✅ `base-editor.ts` |
| F-BASE-03 | Reactivity and lifecycle hooks | ✅ `base-card.ts` |
| F-BASE-04 | Sealed render wrapper pattern | ✅ `base-card.ts` |
| F-BASE-05 | Shared common Lit CSS styles | ✅ `src/styles/common.ts` |
| F-BASE-06 | Shared editor Lit CSS styles | ✅ `src/styles/editor-common.ts` |
| F-BASE-07 | Design token families (fixed vs theme-chained) | ✅ `src/styles/common.ts` — [ADR-018](../adr/ADR-018_palette-fixed-identity.md) |

---

## File Tree

```
src/
├── utils/
│   ├── base-card.ts                [NEW] Base card class
│   └── base-editor.ts              [NEW] Base editor class — label lookup
│                                         MECHANISM + sharedEditorLabels()
│                                         + SHARED_SECTION_ICONS (ADR-017)
└── styles/
    ├── common.ts                   [NEW] Shared styles — imported by every card
    ├── editor-common.ts            [NEW] Editor styles
    └── floor-nav.ts                [NEW] Hexagonal floor-navigation shell,
                                          shared by lights + water (ADR-017).
                                          Goes BEFORE the card sheet in
                                          `static styles` so the card can
                                          override it.
```

---

## Design Tokens — two families, two reaches

Decided in [ADR-018](../adr/ADR-018_palette-fixed-identity.md); that record holds
the measurements and the rationale, this is the operating summary.

`src/styles/common.ts` declares two kinds of `--sf-*` token:

| Family | Tokens | Resolves to |
|---|---|---|
| **Fixed** | `--sf-accent-on`, `--sf-accent-off`, `--sf-warning`, `--sf-error`, `--sf-border`, `--sf-bg-secondary`, `--sf-text-disabled` | a literal — state and status, never follows the HA theme |
| **Chained** | `--sf-primary`, `--sf-bg`, `--sf-text-primary`, `--sf-text-secondary` | `var(--<ha-theme-var>, <literal>)` — frame, primary accent and text, follows the HA theme |

Rules that follow from it:

1. **The line runs through each card, not between the cards and this kernel.**
   A card sheet uses both families: its frame, accent and text are chained (129
   such declarations live in card sheets today), its state colours and
   illustrations are fixed. Do not move a colour across that line — replacing a
   state or illustration literal with a *chained* token drags it into the user's
   theme while the status colours beside it cannot follow, since the HA theme has
   no variable meaning "warning".
2. **`var(--sf-token, <literal>)` is the idiom**, not a bypass. The literal is the
   token's declared default repeated at the use site. Where the element declares
   `sciFiCommonStyles` in its own `static styles`, the token always resolves and
   the fallback is dead — keep it **character-identical** to the declaration in
   `common.ts`, because a fallback that says something else is read as the token's
   value and is wrong. Where the element does *not* declare it (`sf-dropdown`,
   `sf-button-card` — both rely on their mount point), the fallback is live
   insurance: it is what renders off-tree, and it is deliberately not the token's
   value.
3. **A bespoke colour with one consumer does not get a token.** Illustration and
   domain palettes (landspeeder, radiator, stove, plugs, weather icons) stay
   literal in their own sheet.
4. **`--sf-*` does not reach the editor tree.** The tokens are declared on the
   `:host` of `sciFiCommonStyles`; editors do not include it and are rendered by
   HA as siblings of the card preview, not descendants. `background: var(--sf-border)`
   in an editor sheet computes to `transparent`. Editors use the `--editor-*`
   family from `editor-common.ts`, chained to HA theme variables that do reach a dialog.
5. **A component in `src/components/` that needs the tokens includes
   `sciFiCommonStyles` itself**, rather than relying on being mounted inside a
   card. An element appended to `document.body` (`src/utils/toast.ts`) inherits
   nothing and correctly hard-codes its colours.

`tests/styles/card-css-baseline.test.ts` locks the resolved CSS of all 11 cards,
so any change to these declarations surfaces as a reviewed diff.

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | Lit `@property({ attribute: false })` works for hass object | Low | → Run element properties check after state change events |
| 2 | Sealed `render` executes `willUpdate` hook reactively | Medium | → Run console log check for willUpdate triggers on state change |
| 3 | CSS variables are supported in HA dashboard environment | Medium | → Run style rendering checks inside active dashboard window |

---

## Cross-Spec Contracts
 ### Produces
| Artefact | Consumer | Description |
|---|---|---|
| `SciFiBaseCard` | Spec 05 | Base custom Lovelace card class |
| `SciFiBaseEditor` | Spec 05 | Base Lovelace card editor class. Owns the label lookup mechanism (`getLabel`, `getSectionTitle`) and the shared dictionaries; per-card vocabulary is supplied by subclasses via `cardLabels` / `cardSectionIcons` — ADR-017, Spec 10 § Base Editor Enrichment |
| `src/styles/common.ts` | Spec 04, 05 | Shared sci-fi theme styling tokens |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `types/ha.ts` | Spec 02 | Immutability extended HA types |
| `setLocale`, `getLocale` | `src/locales/localization.ts` | Runtime locale switching via `@lit/localize` |
| `updateWhenLocaleChanges` | `@lit/localize` | Schedules re-render when active locale changes |

 ### Public Interface
| Element | Consumed by | Description |
|---|---|---|
| `SciFiBaseCard` | Card subclasses | Extends LitElement, manages state safely |
| `SciFiBaseEditor` | Editor subclasses | Extends LitElement, manages card config |
| `sciFiCommonStyles` | Custom elements | CSS Lit styles with shared styling tokens |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | Overriding `render()` | Card overrides `render()` directly | Implement `renderCard()` inside card subclasses |
| 2 | Inline styling tokens | Hardcoded hex color in css where a `--sf-*` token already holds that exact value | Use `var(--sf-token, <literal>)` — see § Design Tokens and [ADR-018](../adr/ADR-018_palette-fixed-identity.md). A bespoke colour with one consumer stays literal; a *chained* token never replaces a widget colour |
| 2b | Chained token in an editor sheet | `var(--sf-border)` inside `editor-common.ts` or `components/editor-inputs/*` — `--sf-*` does not reach the config dialog, so the declaration computes to its initial value | Use the `--editor-*` family from `editor-common.ts` |
| 3 | Manual update calls | `this.performUpdate()` in card | Lit properties handle reactivity automatically |
| 4 | Duplicated editor styles | Copy-pasting styling rules | Import editor common styles from `editor.ts` |
| 5 | Unhandled rendering exception | Empty render blocks | Wrap rendering loop in try/catch block |
| 6 | Orphaned locale sync | Card or editor uses `willUpdate` as the only locale trigger | Use the `hass` property setter (with getter/setter pair) — call `setLocale(hass.locale.language)` when language differs, and `updateWhenLocaleChanges(this)` in the constructor. The `hass` setter fires on every HA state propagation, not just on property changes seen by `willUpdate`. |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-301 | Unit | renderCard executes inside try/catch | Valid subclass config | Subclass renders correctly |
| TC-302 | Unit | renderCard error catches | Throw error in renderCard | Renders error card display banner |
| TC-303 | Unit | hass setter triggers setLocale | Set `hass` with FR language | `setLocale` invoked asynchronously, hass getter returns set value |
| TC-304 | Unit | setConfig stores config | Configuration object | config gets updated and stored |
| TC-305 | Unit | baseEditor updates properties | Change value in editor | Dispatches config-changed custom event |
| TC-306 | Unit | Subclass overriding willUpdate must call super | Subclass with `willUpdate()` override | `super.willUpdate(changedProperties)` is first line; locale sync still fires |
| IT-301 | Integration | Card reacts to HA state changes | Modify mockHass states | Subclass `renderCard` triggered |
| IT-302 | Integration | Editor styles apply correctly | Open card editor | Shared CSS properties verify as loaded |
| IT-303 | Integration | Locale synced with HA language | Update HA language state | UI translation texts update reactively |

---

## Error Handling

| Error | Detection | Response | Fallback |
|---|---|---|---|
| Render Card Failure | Try/Catch in render method | Log stack trace in console | Render standard error Lovelace card panel |
| Missing Configuration | config object undefined | Display critical error state | Render setup required warning card |
| Style Injection Error | CSS loading failures | Let browser console log | Load fallback styling tokens seamlessly |
