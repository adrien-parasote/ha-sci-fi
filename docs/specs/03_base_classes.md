# Spec 03 — Base Classes & Styles

> Document Type: Implementation
> Covers: Step 3 from [implementation_plan.md](../implementation_plan.md#L1)
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
| F-BASE-06 | Shared editor Lit CSS styles | ✅ `` |

---

## File Tree

```
src/
├── helpers/
│   └── utils/
│       ├── base-card.ts            [NEW] Base card class
│       └── base-editor.ts          [NEW] Base editor class
└── styles/
    ├── common.ts                   [NEW] Shared styles
    └── editor.ts                   [NEW] Editor styles
```

---

## Assumptions

| # | Assumption | Risk | Validation |
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
| `SciFiBaseEditor` | Spec 05 | Base Lovelace card editor class |
| `src/styles/common.ts` | Spec 04, 05 | Shared sci-fi theme styling tokens |

 ### Consumes
| Artefact | Provider | Description |
|---|---|---|
| `types/ha.ts` | Spec 02 | Immutability extended HA types |
| `syncHALocale` | Spec 06 | Language localization syncing helper |

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
| 2 | Inline styling tokens | Hardcoded hex colors in css | Import shared styles from `common.ts` |
| 3 | Manual update calls | `this.performUpdate()` in card | Lit properties handle reactivity automatically |
| 4 | Duplicated editor styles | Copy-pasting styling rules | Import editor common styles from `editor.ts` |
| 5 | Unhandled rendering exception | Empty render blocks | Wrap rendering loop in try/catch block |
| 6 | Missing `super.willUpdate()` call | Card subclass overrides `willUpdate()` without calling `super.willUpdate(changedProperties)` | Any subclass override of `willUpdate`, `updated`, or `firstUpdated` **MUST** call `super.willUpdate(changedProperties)` as the **first line** — otherwise `syncHALocale` is bypassed (MEDIUM-02) |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-301 | Unit | renderCard executes inside try/catch | Valid subclass config | Subclass renders correctly |
| TC-302 | Unit | renderCard error catches | Throw error in renderCard | Renders error card display banner |
| TC-303 | Unit | willUpdate triggers syncHALocale | Trigger hass change | syncHALocale executed with state |
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
