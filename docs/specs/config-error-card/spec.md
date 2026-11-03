---
spec: docs/specs/config-error-card/spec.md
sources:
  - src/utils/base-card.ts
  - src/selectors/house.ts
  - docs/specs/03_base_classes.md
  - docs/specs/02_domain_selectors.md
  - docs/specs/bridge-error-matrix/spec.md
---

# Config Error Card — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-l3z`. Two promises of the numbered specs are not delivered: [`03_base_classes.md` § Error Handling](../03_base_classes.md) "Missing Configuration" promised a "setup required warning card" (marked ⬜ on 2026-11-01), and [`02_domain_selectors.md` § Error Handling](../02_domain_selectors.md) "Null Registry State" promises a console warning that no selector emits. This lot delivers the first as a generic base-class behaviour (the idea of [bridge-error-matrix](../bridge-error-matrix/spec.md), generalised) and settles the second as **no log**.

**Non-goal.** An invalid config (`setConfig` throws, for example a card without its required `entity`) is out of scope: Home Assistant shows its own native error card and the editor keeps the previous config, so such a config never reaches this card's `render()`. This lot adds no `try/catch` around `setConfig`. The "config unset" banner of FR-1 covers only a card that is rendered with `hass` set before any successful `setConfig`.

**Measured facts the design rests on.**
- `SciFiBaseCard.render()` returns `nothing` when `!this.config || !this.hass`. Home Assistant calls `setConfig()` before it sets `hass`, so "config set, `hass` not yet" is a normal first-render state, not an error; `config` unset while `hass` is set happens only when `setConfig` never succeeded.
- The case the bead names (an entity renamed in HA) is neither: `config` and `hass` are both present and `hass.states[id]` is `undefined`. It is a per-card matter today; only the bridge handles it.
- Eleven cards override `getRelevantEntities()`. Three of them build the list from `hass.states` itself (lights, climates, water: nothing there can be "absent"); two mix configured ids with derived or infrastructure ones (weather and hexa-tiles: `sun.sun`, `person.*`, `zone.*`).

**Decisions (user, 2026-11-03).** D1: a missing config renders the localized error card; config set without `hass` renders nothing; an opt-in hook on `SciFiBaseCard` reports the configured entities absent from `hass.states`. D2: the banner shows only when **all** configured entities are absent, otherwise the card renders unchanged; scope: every card overriding `getRelevantEntities()` whose ids are configured, bridge excluded; the banner lists at most three ids, followed by `, … (+N)` where N is the number of further missing ids (truncation and count validated by the user). D3: **no log** for a null registry. D4: wording `Card setup required: configuration is missing.` and `Entity not found: <id>`, French `Configuration requise : la configuration de la carte est absente.` and `Entité introuvable : <id>`, bound as Lit text only. D5: the error card gets `role="status"` and its icon `aria-hidden="true"` (FR-2). D6: an invalid config is out of scope (Overview, non-goal). D7: displayed ids are sanitised of control and bidi characters and capped at 64 code points (FR-4).

**Definitions.**
- A *configured entity id* is a non-empty string returned by `getConfiguredEntities()`; empty strings (the editor seeds `entity: ''`), non-strings and duplicates are dropped.
- An id is *absent* when `hass.states` is a non-null object and the id is not an own property of it with a defined value (`Object.hasOwn(hass.states, id)` is false, or its value is `undefined`): inherited names such as `constructor`, `toString` or `__proto__` are absent. State `unavailable` or `unknown` is present, not absent. When `hass.states` is `null`, `undefined` or not an object, nothing is judged absent (no information, no banner).

## Requirements

- **FR-1**: `SciFiBaseCard.render()` decides in this order: `hass` unset renders `nothing` (config set or not: the transient state of a card that is not yet wired); `config` unset with `hass` set renders `_renderErrorCard(msg('Card setup required: configuration is missing.'))`; otherwise the entity rule of FR-4 **inside the same `try/catch` as `renderCard()`**, then `renderCard()` as today. A wrong-type result of `getConfiguredEntities()` (not an array), a `getConfiguredEntities()` that throws, or `hass.states === null` never throws out of `render()`: the first and the third mean "no information, no banner" (the card renders), a throw takes the existing catch path (`_renderErrorCard`, unchanged `console.error`). `render()` writes no `@state` of its own and no `console.*` call on the paths of this FR (it runs on every repaint); the existing catch path keeps its `_renderError` write and log.
- **FR-2**: the message of FR-1 is a Lit text binding inside the existing `.sf-error-card > .sf-error-message` markup; `_renderErrorCard` keeps its signature and stays private; the English source is exactly `Card setup required: configuration is missing.` and the French is exactly `Configuration requise : la configuration de la carte est absente.`. D5 amends the markup of every error card by two attributes only: `.sf-error-card` carries `role="status"` and `.sf-error-icon` carries `aria-hidden="true"`; classes, element order and text are unchanged.
- **FR-3**: `SciFiBaseCard` declares two protected members: `getConfiguredEntities(): string[]`, default `[]` (the opt-in: a card that does not override it never shows the banner), and `getMissingEntities(): string[]`, which returns the configured ids (per Definitions) that are absent, in the order of `getConfiguredEntities()`. No card overrides `getMissingEntities()` or `render()`; cards override only `getConfiguredEntities()`.
- **FR-4**: when `getConfiguredEntities()` yields at least one id and `getMissingEntities()` returns all of them, `render()` renders `_renderErrorCard(msg(str`Entity not found: ${ids}`))` instead of `renderCard()`. `ids` is the first three missing ids, each shown after the display transform below, joined by `, `; when there are more than three, `, … (+N)` follows, N being the number of missing ids beyond the first three (`a, b, c, … (+1)` for four). Display transform of one id: every C0 control (U+0000–U+001F), DEL and C1 control (U+007F–U+009F), and every bidi control (U+061C, U+200E, U+200F, U+202A–U+202E, U+2066–U+2069) is removed, then the result is cut to 64 code points, with `…` appended when it was cut. The count of ids and the all-absent decision use the raw ids; only the display is transformed. If at least one configured entity is present (any state), or the list is empty, `renderCard()` runs and no banner shows. The ids are bound as Lit text, never as HTML: an id such as `<img src=x onerror=alert(1)>` or `<svg onload=alert(1)>` appears as text and creates no element. An embedded `, ` inside an id stays (cosmetic only: the `(+N)` count is computed, not parsed).
- **FR-5**: the banner follows the data: when a missing entity reappears in `hass.states` the next render shows the card, and when all vanish again the banner returns. This holds because, for every card that overrides `getConfiguredEntities()`, the result is a subset of its `getRelevantEntities()` (so `shouldUpdate()` repaints on their state changes); `shouldUpdate()` gains one guard only (`!this.config` returns `true` before `getRelevantEntities()` is read, so a `hass` push in the setup-banner state cannot throw); its `oldHass.states[id] !== hass.states[id]` identity comparison is correct for own and inherited names alike and is unchanged, so bridge, lights, climates and water repaint exactly as today (agent's call: the comparison never decides absence).
- **FR-6**: these seven cards override `getConfiguredEntities()`: vacuum, stove, tv, vehicles, plugs (return what their `getRelevantEntities()` already returns, those ids all being configured; for plugs that is `devices[].entity_id` and the keys of `devices[].sensors`) and weather and hexa-tiles (return only configured entities, never `sun.sun`, `person.*`, `zone.*`). Weather returns `weather_entity` and `alert.entity_id`. Hexa-tiles returns `tiles[].entity` for every tile that has one (never ids expanded from `tiles[].entity_kind`), plus `weather.weather_entity` and `weather.weather_alert_entity` **only when `weather.activate` is truthy**; with no weather tile and no activated weather its list is the `tiles[].entity` ones, possibly empty (then no banner). Bridge (its own matrix, [bridge-error-matrix](../bridge-error-matrix/spec.md)), lights, climates and water keep the default `[]` and are not changed.
- **FR-7**: `src/selectors/` emits no `console.*` call on a null registry: `getAreas(hass)` returns `[]` and `getAreaById(hass, id)` returns `undefined` when `hass.areas` is undefined, and calling them any number of times writes nothing to the console. The log is not delegated to a render-path caller either.
- **FR-8**: the two new sources are `msg()` English sources with their French in `xliff/fr.xlf` (the `${ids}` placeholder carried by an `<x id="0" …/>` element in the target, as the existing `Weather alert` unit), `npm run localize-extract` then `npm run localize-build` run, and `src/locales/locales/fr.js` committed regenerated.
- **FR-9**: [`03_base_classes.md` § Error Handling](../03_base_classes.md) row "Missing Configuration" (written in French, like that document) states the behaviour of FR-1..FR-6 (the ⬜ marker and the "non livré" text are removed, `hass` unset renders nothing by design, the banner is all-absent and opt-in via `getConfiguredEntities`, an invalid config stays HA's native error card; the "Render Card Failure" row is unchanged); [`02_domain_selectors.md` § Error Handling](../02_domain_selectors.md) row "Null Registry State" reads "Return default empty records / `undefined`, no log" and its warning block contains the sentence `the decision is taken` followed by the reason (no log: a selector is a pure function called at every render).
- **FR-10**: the per-card entity messages that already exist keep working when at least one other configured entity is present: stove's `Stove entity not found: <id>` (only its main entity missing), tv's `.offline-banner` `TACTICAL BRIDGE DISCONNECTED` (main entity missing, another configured entity present) and plugs' offline or unavailable treatment. When **all** configured entities are absent, the generic banner **supersedes** those per-card messages (this change is deliberate: one consistent message instead of three). Existing card tests whose fixture has none of the configured entities in `hass.states` are updated in this lot to assert the banner or to provide the entities.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | HA sets `hass` after `setConfig`, so config-set-without-`hass` is a normal state and must keep rendering nothing | Medium | SHOW — `grep -n "if (!this.config" src/utils/base-card.ts` → `106:    if (!this.config \|\| !this.hass) return nothing;` (the single guard today, `hass` is a separate setter) | TC-CEC-U-02 |
| 2 | The seven cards of FR-6 return their whole configured list (weather: `weather_entity`, `alert.entity_id`; hexa-tiles: `tiles[].entity` and the activated weather ids; tv, plugs, vacuum, stove, vehicles: their relevant list) | Medium | SHOW — read `getRelevantEntities()` of the 11 cards: `src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:27-52` adds `tile.entity` and `weather.*` ids beside derived `person.*`/`zone.*`, weather `src/cards/weather/sci-fi-weather.ts:146` adds `sun.sun`, plugs `:48`, tv `:92` | TC-CEC-U-09, TC-CEC-U-19 |
| 3 | Existing tests of the seven cards render with `hass.states` lacking every configured id and will show the banner | Medium | SHOW — `grep -rln "states: {}" tests/cards` → tests/cards/tv/sci-fi-tv.test.ts among others; `grep -rn "Stove entity not found" tests` → no match (stove's own message is untested) | FR-10, IT-CEC-I-02 |
| 4 | Showing three ids then `, … (+N)` is enough to fix a config | Low | SHOW — user decision D2 (2026-11-03): truncation to three ids and the `(+N)` count validated by the user | TC-CEC-U-04 |
| 5 | `msg(str\`…${ids}\`)` already produces an `<x>` placeholder unit in `fr.xlf` | Low | SHOW — `src/cards/stove/sci-fi-stove.ts:126` and the hexa `Weather alert` unit use the same form | TC-CEC-U-08 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Rendering the error card when `hass` is unset | `nothing` (FR-1): it would flash an error on every dashboard load |
| 2 | `console.warn` or `console.error` in `render()` or in a selector | no log (FR-1, FR-7): both run at every repaint |
| 3 | Setting `_renderError` or any `@state` from `render()` on the new paths | pure render (FR-1): a state write inside render schedules another render |
| 4 | Binding an entity id with `unsafeHTML` or in an attribute built by concatenation | Lit text binding (FR-4): the id comes from user YAML |
| 5 | Banner as soon as ONE entity is missing | all-absent only (FR-4): partial absence stays the card's own concern |
| 6 | Counting ids derived from `hass.states` or `sun.sun` as configured | `getConfiguredEntities()` lists configured ids only (FR-6) |
| 7 | Changing the bridge, lights, climates or water | they keep the default `[]` (FR-6) |
| 8 | Judging absence with `hass.states[id] === undefined` | own-property test (Definitions): `constructor` or `__proto__` would read as present |

## Test Case Specifications

Tests live in `tests/utils/` (base class, selectors, docs) and `tests/cards/` (per card), each title cites its id; every French assertion starts with `await setLocale('fr')` and restores `en` after.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-CEC-U-01 | test subclass with `hass` set and no `setConfig`, rendered 20 times, `console.warn/error/log` spied | FR-1, FR-2 | `.sf-error-message` text is `Card setup required: configuration is missing.`, inside `.sf-error-card`; zero console calls; `_renderError` stays `null` |
| TC-CEC-U-02 | `hass` unset with config set, then both unset | FR-1 | nothing rendered (no `ha-card`), zero console calls |
| TC-CEC-U-03 | subclass with `getConfiguredEntities()` returning `a`, `b`, `c` and `hass.states` empty | FR-3, FR-4 | `.sf-error-message` text is `Entity not found: a, b, c`; `renderCard()` not called |
| TC-CEC-U-04 | same with four ids; then with five ids; then with `a`, duplicates and `''` only | FR-3, FR-4 | four ids: text is `Entity not found: a, b, c, … (+1)`; five: `a, b, c, … (+2)`; `a` plus duplicates plus `''`: `Entity not found: a` |
| TC-CEC-U-05 | one of the ids present with state `on`, then `unavailable`; then default subclass (no override); then `hass.states` undefined | FR-3, FR-4 | in each case `renderCard()` content is shown, no `Entity not found` banner |
| TC-CEC-U-06 | id `<img src=x onerror=alert(1)>` missing; then `<svg onload=alert(1)>` missing; then the same two with `await setLocale('fr')` | FR-4, FR-8 | the message text contains the literal string in English and in French (`Entité introuvable : <…>`); the shadow root holds no `img`, no `svg` and no element other than the card markup |
| TC-CEC-U-07 | `await setLocale('fr')`: missing config, then missing ids `a`, `b` | FR-2, FR-4, FR-8 | `Configuration requise : la configuration de la carte est absente.`; `Entité introuvable : a, b` |
| TC-CEC-U-08 | read `xliff/fr.xlf` and `src/locales/locales/fr.js` | FR-8 | both sources have a non-empty French target, the `Entity not found` target carries an `<x id="0"` placeholder and no literal `${`; `fr.js` holds the two French strings |
| TC-CEC-U-09 | for the seven cards of FR-6 built with their test fixture config, `getConfiguredEntities()` vs `getRelevantEntities()`; for bridge, lights, climates, water the default; every card's `getMissingEntities` and `render` compared with the base prototype | FR-3, FR-5, FR-6 | the seven return a non-empty subset of their relevant ids and never `sun.sun`, `person.*` or `zone.*`; the four others return `[]`; no card overrides `getMissingEntities` or `render` |
| TC-CEC-U-10 | `getAreas` and `getAreaById` with `hass.areas` undefined, called 100 times, `console.*` spied; `src/selectors/*.ts` scanned for `console.` | FR-7 | `[]` and `undefined`; zero console calls; the scan finds none |
| TC-CEC-U-11 | read `docs/specs/03_base_classes.md` and `docs/specs/02_domain_selectors.md` | FR-9 | row "Missing Configuration" contains `getConfiguredEntities`, `Entity not found` and `hass`, and not `⬜` nor `non livré`; row "Null Registry State" contains `no log` and not `Log warning in console`; its warning block contains `the decision is taken` |
| TC-CEC-U-12 | subclass whose `getConfiguredEntities()` returns `5`, then `null`, then throws, then returns `['a']` with `hass.states === null`; plus the vacuum card with config `vacuums: 5` | FR-1 | `render()` never throws; non-array and `null` states: `renderCard()` content shown; throwing case: `.sf-error-card` with the thrown message through the existing catch path (one `console.error`, `_renderError` set); the vacuum case does not throw out of `render()` |
| TC-CEC-U-13 | ids `constructor`, `toString`, `__proto__` configured, `hass.states = {}`; then `hass.states = { constructor: undefined }` and a real own entity | FR-4, FR-5 | first: `Entity not found: constructor, toString, __proto__`; own key with `undefined` value is absent; a real own entity makes the card render |
| TC-CEC-U-14 | one missing id of 50,000 characters, then one of exactly 64 and one of 65 code points (including an astral character at the cut) | FR-4 | displayed id is 64 code points then `…` for the long ones, unchanged for the 64-point one; no split surrogate pair; message length under 200 characters |
| TC-CEC-U-15 | the stove card (or any card with a required key), `hass` unset, `setConfig` with an invalid config, then `setConfig(null)`; then the same with an earlier valid config in place and `hass` set | Non-goal, FR-1 | `setConfig` still throws its existing error (no catch added, no "attempted" flag); with `hass` unset nothing renders; with the earlier valid config kept, the card keeps rendering its content and shows no setup banner (the banner stays reserved for "config never set, `hass` set", FR-1 and IT-CEC-I-04) |
| TC-CEC-U-16 | 3, 4 and 10 missing ids; French locale with 4 | FR-4, FR-8 | `Entity not found: a, b, c`; `…a, b, c, … (+1)`; `…a, b, c, … (+7)`; French `Entité introuvable : a, b, c, … (+1)` |
| TC-CEC-U-17 | render the banner and the render-error card | FR-2 | `.sf-error-card` has `role="status"`; `.sf-error-icon` has `aria-hidden="true"`; classes and text unchanged |
| TC-CEC-U-18 | missing ids containing `‮`, `\u0000`, `\u001B`, `\u0085`, `⁦` and an embedded `, ` | FR-4 | none of the control or bidi characters appears in the message text; the embedded `, ` stays; count `(+N)` is unaffected |
| TC-CEC-U-19 | hexa-tiles fixtures: (a) `weather.activate` true, weather entity missing, a `tiles[].entity` present; (b) all `tiles[].entity` missing and `weather.activate` false with weather ids absent; (c) `weather.activate` false, only the weather entity configured and absent, no tile | FR-6, FR-5 | (a) card renders (partial absence); (b) banner names the tile ids and not the weather ids; (c) list is empty, no banner; `entity_kind` expansions never appear in `getConfiguredEntities()` |
| IT-CEC-I-01 | test subclass: all ids missing (banner), `hass` replaced with one id present (card), replaced again with none (banner) | FR-4, FR-5 | banner, card content, banner; no console call |
| IT-CEC-I-02 | each of the seven cards of FR-6, its fixture config, `hass.states` empty, then with one configured entity | FR-6, FR-10 | empty: `.sf-error-message` begins `Entity not found:` and names the first configured id; one entity: the card's own content, no banner; the stove case with main entity missing and a sensor present keeps `Stove entity not found:` |
| IT-CEC-I-03 | bridge, lights, climates and water with `hass.states` empty and valid configs | FR-6 | none renders `Entity not found:` or `Card setup required:` (bridge keeps its own matrix output) |
| IT-CEC-I-04 | card built through `document.createElement`, `hass` assigned first, `setConfig` later | FR-1 | first render is the setup banner, after `setConfig` the card content shows and the banner is gone |
| TC-CEC-U-20 | card with no `setConfig`, `hass` set, a `getRelevantEntities()` that reads `this.config`; then a `hass` push, and `shouldUpdate()` called with a language-only change | FR-1, FR-5 | no throw, setup banner stays; `shouldUpdate()` returns `true` |
| IT-CEC-I-06 | each of the seven cards, same element: all absent (banner), `hass` with every id (card), `hass` empty again (banner) | FR-5 | banner, `ha-card` content, banner |
| IT-CEC-I-07 | plugs, same element: all absent, entities present, absent, present again, `callApi` mocked with history, then with empty history | FR-5 | the chart canvas is drawn each time the card shows; an empty history shows `No power data to display` and hides the chart container after the return; the stale chart is destroyed while the banner shows |
| IT-CEC-I-08 | weather: a chart bound to a canvas other than `#weather-chart` | FR-5 | that chart is destroyed and recreated against the current canvas |
| IT-CEC-I-05 | tv with main entity missing and `volume_entity` present: `.offline-banner` `TACTICAL BRIDGE DISCONNECTED` still shows; tv with all configured entities absent; plugs with one device entity missing and another present, then all absent | FR-10 | partial absence keeps the tv offline banner and the plugs treatment; all absent shows only `Entity not found:` (supersede), no `.offline-banner` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| Config unset, `hass` set | `.sf-error-card` with `Card setup required: configuration is missing.` | next `setConfig` renders the card | none (render path) |
| `hass` unset | nothing rendered | `hass` arrives, card renders | none |
| Invalid config (`setConfig` throws) | out of scope: Home Assistant's native error card, editor keeps the previous config | fix the YAML | none added by this lot |
| All configured entities absent | `.sf-error-card` with `Entity not found: <ids>` (three ids max, `, … (+N)` beyond) | an entity reappears, card renders | none (render path) |
| Some configured entities absent | card renders as today | the card's own per-entity handling | unchanged |
| `getConfiguredEntities()` wrong type, `hass.states` null | card renders (no information, no banner) | next `hass` push | none |
| `getConfiguredEntities()` throws | existing catch path: `.sf-error-card` with the message, `_renderError` set | — | unchanged `console.error('[<tag>] Render error:', err)` |
| Null registry in a selector | `[]` or `undefined` | caller shows an empty list | none, by decision (FR-7) |
| `renderCard()` throws | unchanged: `.sf-error-card`, `_renderError` set | — | unchanged `console.error('[<tag>] Render error:', err)` |

## Builder Calls

- Hook shape (*mine*): opt-in `getConfiguredEntities()` default `[]` rather than reusing `getRelevantEntities()`, because lights, climates, water, weather and hexa-tiles mix in derived or infrastructure ids that could never be absent or would hide a real absence; this also leaves bridge untouched without a special case.
- Scope (*mine*, from the user's "cards overriding `getRelevantEntities`, bridge excluded"): lights, climates and water are out because their lists are derived from `hass.states`; weather and hexa-tiles are in, restricted to configured ids.
- Ids shown: up to three, `, … (+N)` after, 64 code points each (user decision D2 and D7).
- `hass` unset with config unset renders nothing, not the setup banner (*mine*): that state occurs before HA wires the card.
- Test layout: new base cases extend `tests/utils/base-card.test.ts`; selector case in `tests/selectors/`; per-card cases in each card's existing test file; doc case in `tests/docs/`.

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-3` | code — `SciFiBaseCard` | the seven cards of FR-6 and Lovelace through `render()` |
| `FR-8` | config/schema — `xliff/fr.xlf` | `src/locales/localization.ts` through `fr.js` |

## References

- [03_base_classes.md § Error Handling](../03_base_classes.md)
- [02_domain_selectors.md § Error Handling](../02_domain_selectors.md)
- [bridge-error-matrix](../bridge-error-matrix/spec.md)
- [base-card](../../../src/utils/base-card.ts)
