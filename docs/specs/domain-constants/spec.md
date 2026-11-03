---
spec: docs/specs/domain-constants/spec.md
sources:
  - docs/specs/02_domain_selectors.md
  - src/selectors/house.ts
  - src/cards/plugs/plug_const.ts
  - tests/specs/socle-contract.test.ts
  - tests/docs/repo-wide-ids-guard.test.ts
  - tests/i18n/french-literals.ts
---

# Domain constants — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-eud`. Spec 02 anti-pattern #5 ("Hardcoded entity types") is stated as **not held** (amended by lot `socle-specs-01-03`): no domain constant exists, every Home Assistant domain is a string literal. This lot adds one typed constants module, replaces **every** domain literal of `src/` (the user's scope, 2026-11-03), and adds a probe that fails when one comes back. It is a **pure refactor**: zero behaviour change, nothing product-visible, no DOM / CSS / YAML change, no existing test edited.

**Decisions (user, 2026-11-03, AskUserQuestion).**

| # | Decision | Where it lands |
|---|---|---|
| D1 | *Scope*: all of `src/` (not selectors only, not selectors + cards). | FR-3 |
| D2 | *Allow-list*: bounded and named — the config-kind vocabulary (hexa-tiles `ENTITY_KINDS` / `entity_kind`, stove-editor `kind`), the legitimate literals that are not HA domains (`'renault'` and the like), and `tests/`, `src/locales/`, `docs/`, `dev/` — each entry with a reason and a count bound, stale entries detected. And `HASS_PLUG_SERVICE` is re-pointed to the new constant. | FR-5, FR-6, FR-9 |
| D3 | *Shape*: one `DOMAIN as const` object plus `type Domain`, in `src/types/domains.ts`; `getEntitiesByAreaAndDomain`'s parameter is tightened to `Domain`. | FR-1, FR-2 |
| D4 | *Adversarial regime*: fan-out. Spike-offer and build-mode: not yet asked. | — |

**Correction under D1/D3 (adversarial round 1, F-01): `DOMAIN` is 24 keys, not 23.** The round-1 re-measure found `'counter'` (`sci-fi-bridge-editor.ts:777`, `_entitiesByDomain('counter')`) — a real domain absent from the first scan. The key `COUNTER` is added; replaceable literal sites go 110 → **111** (cards 108 → 109, bridge-editor 24 → 25, G1 36 → 37). The 23 → 24 change is a consequence of D1 (all of `src/`) and D3 (one object holding the domains `src/` uses), not a new decision.

## Re-mesure

Main `35f1020`, 2026-11-03, re-measured after adversarial round 1. **Authoritative method: a TypeScript-AST scan** of `src/**/*.ts` (not `src/locales/`): every `StringLiteral`, `NoSubstitutionTemplateLiteral` and template span whose text is a known HA domain (`exact`, e.g. `'light'`), a domain followed by `.` alone (`prefix`, e.g. `startsWith('light.')`, `` `sensor.${x}` ``), or a domain followed by `.name` (`fullid`, e.g. `'sun.sun'`); comments, type-level literals (`Config['weather']`) and import strings are not nodes of that kind and never match. The AST scan is the cross-check **of** two regex scans, and it corrected them: the first anchored regex counted 96 sites because it counted a multi-domain call (`_entitiesByDomain('a','b','c')`) once and missed tuple / ternary results; a broader quoted-token regex gave 151 with ~40 comment, type and prose false positives. This is why the probe (FR-5) is AST-based and is cross-checked by a regex of different shape.

| class | tokens | what |
|---|---:|---|
| `prefix` | 27 | `startsWith('x.')` ×26, `` `sensor.${city}…` `` ×1 |
| `exact`, **to replace** | 83 | A selector / helper argument 31 (`getEntitiesByAreaAndDomain` 9, `_entitiesByDomain` 22 — `counter` is the 22nd) · S service domain 25 (`callService` ×21, `bridgeCall` ×4) · S′ service domain in a tuple / ternary result 7 · C comparison / `case` 10 · L literal list 10 |
| `exact`, plug constant | 1 | `plug_const.ts` `HASS_PLUG_SERVICE = 'switch'` — re-pointed (D2), not removed |
| **replaceable total** | **111** | **24 files**: `selectors/` 2 (2 files), `cards/` 109 (22 files); `components/`, `utils/`, `types/`: 0 |
| `exact`, **allow-listed** | 13 | hexa-tiles-editor `ENTITY_KINDS` ×4 + `entity_kind: 'light'` ×1; hexa-tiles `kind === 'light'/'switch'/'climate'` ×3; stove-editor `kind === 'sensor'` + `_renderInput(…, 'sensor', …)` ×2; `sf-bridge-access.ts:177` `'lock'` ×1 (the *service action* `lock`); `sf-stack-bar.ts:89` `'light'` ×1 (a CSS variant class); `sf-editor-input.ts:30` `type = 'text'` ×1 (an HTML input type; `text` is also a HA domain) |
| `fullid`, **not probed** | 21 | `'sun.sun'` ×9, stub / default ids (`person.CHANGE_ME`, `climate.poele`, `vacuum.robot`, `weather.forecast_home`, `media_player.bravia_4k_vh22`, `sensor.season`), water demo data ×4, lights-editor synthetic key `light.new` ×2 |

Per replaceable file (prefix + exact): bridge-editor 25, water 23, climates 10, bridge-actions 7, lights 5, hexa-tiles 5, tv 5, bridge-access 3, lights-editor 3, plugs 4, stove 4, hexa-tiles-editor 2, plugs-editor 2, tv-editor 2, vacuum 2, selectors 2 (1 + 1), and 1 each: bridge-alerts, bridge-appliances, climates-editor, plug_const, vacuum-editor, weather, weather-editor. The authoritative per-file per-key table is generated at BUILD (TC-DC-U-08), not hand-typed here. 14 `entity_id.split('.')[0]` derivations hold no literal and stay.

**Computed-key sites (F-09).** `sf-bridge-automations.ts` `autoDefaultIcon` dispatches on a domain through four unquoted keys (`automation`, `switch`, `input_boolean`, `input_number`). That is the same dispatch as the replaced `case` labels, so the four keys become computed keys `[DOMAIN.AUTOMATION]: …`. They are not literals (the probe does not see them) and are counted apart: 111 literal sites + 4 key sites = **115 `DOMAIN.` references** in `src/` outside `domains.ts`. Behaviour is pinned by the card's existing test (the icons per domain); other unquoted keys (config keys named `weather`, `light`) stay.

Not probed, said once: (a) the 21 full entity ids — entity identities, a different debt (an entity-id constant) not AP#5's "entity types", filed as bead `ha-sci-fi-4syw`; (b) domains built at runtime (see FR-5, limits).

Outside `src/`: `tests/` holds ~1 500 `'light.x'`-style fixture ids in 57 files — legitimate, never scanned.

**Reading the numbers.** The two sites the spec 02 amendment names are 2 of 111 (2 %): the debt is in the cards. A selectors-only lot would have left 109.

## Requirements

- **FR-1**: `src/types/domains.ts` exports `DOMAIN`, an `as const` object whose **24** keys are the UPPER_SNAKE of their value (`BINARY_SENSOR: 'binary_sensor'`) — the domains that `src/` uses: `light climate sensor binary_sensor switch cover lock media_player vacuum weather person zone remote select number counter automation script input_boolean input_select input_number input_button valve homeassistant` — and `type Domain = (typeof DOMAIN)[keyof typeof DOMAIN]`. Values are unique and each equals the lower-cased key. The module imports nothing and holds nothing else. `homeassistant` is a service domain, not an entity domain; it lives in the same object by D3 (Assumption 5, confirmed by the user).
- **FR-2**: `getEntitiesByAreaAndDomain(hass, areaId, domain: Domain)` and the bridge editor's `_entitiesByDomain(...domains: Domain[])` take `Domain`: a misspelt domain at a call site is a compile error (`npm run typecheck`). Parameters that carry **parsed or user-YAML data** stay `string` (`bridgeCall`'s domain, `callService(domain, …)` fed by `sc.service.split('.')` in vacuum / tv, `tile.entity_kind`): the refactor neither adds nor removes validation there, and the risk (an arbitrary YAML domain reaching `callService`) is pre-existing and unchanged.
- **FR-3**: The 111 replaceable literal sites of Re-mesure carry a `DOMAIN.*` reference instead of the literal: `startsWith(\`${DOMAIN.X}.\`)`, `DOMAIN.X` as argument / comparand / `case` label / list element; the 4 icon keys of `sf-bridge-automations.ts` are computed keys `[DOMAIN.X]`. A literal list queried with a `string` (`includes(domain)`) is typed `readonly string[]` or `new Set<string>(…)`, never cast. Scope: all of `src/` ([ACCEPTED: spec D1] — user decision D1).
- **FR-4**: Zero behaviour change. Each substituted reference evaluates to the same string as the literal it replaces (pinned by FR-1's value table); no test file that exists on main is modified; the existing behaviour suites (`tests/selectors/*`, `tests/cards/**`) pass unchanged. Bundle size: the module adds one small object (≈ 0.5–1 KB before minification); **stated, not enforced** [ACCEPTED-LIMIT: user, 2026-11-03 — bundle size matters little, no test pins it].
- **FR-5**: A guard test scans `src/` with the TypeScript compiler API for `exact` and `prefix` literals and fails on any outside a bounded allow-list. **Universe (F-03):** the guard's set of domain names is a list pinned in the test file — every `DOMAIN` value plus the other HA domains (`fan camera button alarm_control_panel humidifier water_heater device_tracker sun calendar event input_text input_datetime scene group timer update siren text`) — never "the broad HA domain list"; a test asserts `DOMAIN` values ⊆ universe (TC-DC-U-10). It **can fail** and is not validated by its own pattern: (a) a positive control — an in-memory fixture holding one literal of each class (`startsWith` prefix, `callService` argument, `case` label, array element, template prefix) is flagged, and the scan also flags `'fan'` (in the universe, not in `DOMAIN`); (b) a cross-check with a differently-shaped scan — a plain regex over the same files: every quoted universe token the AST scan did not flag must be in the allow-list, a comment, or a type-level literal; (c) an **instrument check (F-12)** — the AST scan is blind-proofed twice: with its AST layer stubbed to return nothing, the regex cross-check must fail naming the missed tokens; and the set of files the scan visited must equal `git ls-files 'src/**/*.ts'` minus `src/locales/` (a file type or path silently dropped by the scan reads as clean otherwise); (d) the allow-list is a table `file → literal → { max, reason, context }`: `reason` non-empty, `max` ≥ 1, and **`context`** the syntactic position (`PropertyAssignment:ENTITY_KINDS`, `BinaryExpression:kind`, `CallExpression:_renderInput`, `CallExpression:classList`, …) so that an allowed literal cannot stand in for a real domain literal in another position (F-04: swap at same count). An entry whose literal is no longer found in that context, or found fewer than `max` times, **fails** and the message says to delete the entry or **lower `max`** (F-05); found more times fails ("raise `max`" only if the new site is legitimate). `src/types/domains.ts` is the only file exempt. **The unknown-domain message (F-06)** names the key to add: `unknown domain 'fan' at file:line — add FAN: 'fan' to DOMAIN in src/types/domains.ts (and to the value table)`. **Limit (F-10):** the guard sees literals only. Strings built at run time (`'li' + 'ght'`, `String(x) as Domain`, `Object.keys`) evade it; it is a drift probe, not an integrity control, and a negative fixture in TC-DC-U-03 states that explicitly.
- **FR-6**: `plug_const.ts` keeps exporting `HASS_PLUG_SERVICE` with the same name and value `'switch'`, defined as `DOMAIN.SWITCH`.
- **FR-7**: Spec 02 AP#5 is amended **additively** (done at SPEC: the re-measurement and the pointer, corrected to 111 / 109 after round 1; the sentence stays "not held" until delivery); at delivery (HARDEN) the row is rewritten to "Tenu" with the allow-list and the not-probed limits named. `socle-contract.test.ts`, `ids-cas-uniques` and the repo-wide ids guard stay green with this spec's ids declared and cited (P14).
- **FR-8**: Each of the 24 `DOMAIN` keys is mutation-checked at BUILD: with that key's value mutated, at least one existing test turns red; a key no test turns red is a coverage gap — filed as a bead, never hidden. Expected gaps are named now: `number` and `zone` (queried or compared in few tests). [MANUAL: the BUILD runner scripts the loop (scratch script, not committed, excluding the two new test files so they cannot be the red test, F-11) and records the 24 results in the BUILD stage summary.] The lasting automation is TC-DC-U-08.
- **FR-9** (F-08, D2): The allow-list holds the **config-kind vocabulary** and legitimate non-domain literals, as decided by the user (D2): hexa-tiles `ENTITY_KINDS` / `entity_kind`, stove-editor `kind`, the `lock` service action, the `light` CSS variant class and the `text` HTML input type — each with reason, `max` and `context`. `'renault'` (`vehicle_const.ts:8`, `HASS_RENAULT_SERVICE`) is named by the user but is **outside the universe** (not a HA domain): no entry is needed and none is made (a stale entry would fail). hexa-tiles `kind === 'light'/'switch'/'climate'` compare a hybrid (`tile.entity_kind ?? split`) — a config kind and an entity domain at once; it stays allow-listed under D2 and is named here so the choice is visible ([ACCEPTED: spec D2]).

## Build plan (how the work splits)

BUILD is TDD: the probe, the value-table test and the per-file table are written **first** and are red until every group has landed. Then **G0 serially**; **G1–G5 each branch from G0's merged commit** (all five depend on G0: `domains.ts`, and `house.ts`'s `Domain` for G3), in isolated worktrees with disjoint write sets, no group edits a test that exists on main; merged, then the probe goes green. Per group the proof is `npm run typecheck` + that group's existing card tests.

| group | write set (src only) | sites |
|---|---|---:|
| G0 | `src/types/domains.ts` (new), `src/selectors/house.ts`, `src/selectors/climate.ts`, `src/selectors/light.ts`, `src/cards/plugs/plug_const.ts`; tests added: `tests/types/domains.test.ts`, `tests/types/domain-literals.test.ts` (not under `tests/specs/`, whose guards do not count as citations for `ids-cas-uniques`), `tests/helpers/domain-scan.ts` + `tests/helpers/domain-scan.test.ts` (scanner and its fixtures, TC-DC-U-03/04/05/11), `tests/specs/domain-site-table.json` | 3 + module |
| G1 bridge | `src/cards/bridge/**` (editor 25, actions 7, access 3, alerts 1, appliances 1, automations 4 keys) | 37 + 4 |
| G2 water | `src/cards/water/sci-fi-water-management.ts` | 23 |
| G3 climates + lights | `src/cards/climates/**`, `src/cards/lights/**` | 19 |
| G4 tiles, weather, vacuum, stove | `src/cards/hexa-tiles/**`, `src/cards/weather/**`, `src/cards/vacuum/**`, `src/cards/stove/**` | 16 |
| G5 tv + plugs | `src/cards/tv/**`, `src/cards/plugs/**` except `plug_const.ts` (G0) | 13 |

111 = 3 + 37 + 23 + 19 + 16 + 13 literal sites, plus 4 computed keys (G1) = 115 references.

## Builder decisions (agent's calls, builder check)

- **Baseline drift** (agent's call: a refactor lot measures what it replaces): the first BUILD step re-runs the AST scan on the worktree HEAD; if any count differs from Re-mesure (111 / 13 / 21 / 115), the spec is amended first (counts and TC-DC-U-08 / U-09 / IT-DC-I-01), never the probe loosened.
- **File set** (agent's call): the guard lists files with `git ls-files -co --exclude-standard 'src/**/*.ts'` (new files are untracked until HARDEN), minus `src/locales/` and the exempt `src/types/domains.ts`; the scan's visited set is compared to that same list.
- **Typing per site** (agent's call: the compiler decides): an argument to a `Domain`-typed parameter is `DOMAIN.X`; a list or tuple queried with a `string` is `readonly string[]` / `Set<string>` (FR-3); no cast. G0's 3 sites are the 2 selector sites (`climate.ts`, `light.ts`) and `plug_const.ts`; `house.ts` carries the type change only.
- **Scanner nodes** (agent's call): `ts.isStringLiteral`, `ts.isNoSubstitutionTemplateLiteral`, `TemplateHead` / `TemplateMiddle` / `TemplateTail` text (a head `sensor.` is a `prefix`); tagged templates are walked like any template.
- **`context`** (agent's call): the kind of the nearest enclosing `PropertyAssignment`, `BinaryExpression`, `CallExpression` or `ArrayLiteralExpression` / `CaseClause`, followed by `:` and its name (property name, callee name, the other operand's identifier); BUILD fixes the exact strings in the table and TC-DC-U-09 pins them.
- **Typecheck gate** (agent's call): `npm run typecheck` is a gate next to `npm test` for G0 and for every merged result (vitest strips types; the `@ts-expect-error` canary proves nothing without `tsc`).

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The 111 / 13 / 21 split is the whole domain-literal surface of `src/` | Medium | SHOW — AST scan + two regex scans on `35f1020`; round 1 found `counter` and `text`, both folded in | FR-5 (b)(c): cross-check and file-set calibration on the real tree |
| 2 | Existing behaviour tests prove FR-4 for every replaced site | Medium | TELL — per-site coverage **not yet measured** | FR-8 mutation loop; TC-DC-U-08 pins which key each file uses |
| 3 | `Domain`-typed parameters do not break callers that hold `string` | Medium | TELL — the only `Domain` callers pass literals; `string` data stays `string` (FR-2) | `npm run typecheck` (`tsconfig` includes `tests/**`, `strict`) |
| 4 | Full entity ids (`sun.sun`, stubs, demo data) are out of AP#5 ("entity types") and stay un-probed | Medium | SHOW — confirmed by the user at the SPEC review (AskUserQuestion, 2026-11-03); follow-up bead `ha-sci-fi-4syw` | accepted |
| 5 | `homeassistant` is a service domain, yet lives in the same `DOMAIN` object | Low | SHOW — confirmed by the user (D3 one object) | accepted |
| 6 | A TypeScript-AST test is acceptable in this repo's test tree | Low | SHOW — `typescript` is installed and AST precedents exist: `tests/docs/repo-wide-ids-guard.test.ts` (`ts.createSourceFile`), `tests/i18n/french-literals.ts` (`import ts from 'typescript'`); `tests/styles/token-scan.ts` is **not** one (AST-free) | FR-5 |
| 7 | `'renault'` (`HASS_RENAULT_SERVICE`) is not a HA domain and needs no allow-list entry | Low | SHOW — it is outside the universe list of FR-5 | TC-DC-U-10 and the stale-entry check |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | A probe validated only by the regex that wrote it (the first scan of this lot undercounted 96 vs 110, then missed `counter`) | AST scan + positive control + a differently-shaped cross-check + an instrument check (FR-5) |
| 2 | Changing a value while naming it, or naming the wrong key at a site | the value table of FR-1, the per-file per-key table (TC-DC-U-08), the mutation loop of FR-8 |
| 3 | Typing a domain that really is user-YAML data as `Domain` (`sc.service.split('.')`) | keep it `string`; validate at the boundary if ever needed |
| 4 | A wide or silent allow-list | every entry named, with reason, `max` and syntactic `context`; stale and over-bound both fail |
| 5 | "Fixing" a test to make the refactor green | no test that exists on main is edited; a red test is a behaviour change, so the code is wrong |
| 6 | Casting around a `Domain[]` that is queried with a `string` | type the list `readonly string[]` / `Set<string>` |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-DC-U-01 | read `DOMAIN` | FR-1 | 24 keys; each key is the UPPER_SNAKE of its value; values unique; values are exactly the 24 listed strings (incl. `COUNTER: 'counter'`) |
| TC-DC-U-02 | type canary in `tests/types/domains.test.ts`: `// @ts-expect-error` on `getEntitiesByAreaAndDomain(hass, 'a', 'lite')`, a valid call with `DOMAIN.LIGHT`, run on a fixture registry | FR-2 | `tsc` accepts the file (the directive is consumed, so the parameter really is `Domain`); at runtime the valid call returns the same entries as before the lot |
| TC-DC-U-03 | scanner on fixtures: a `startsWith('light.')`, a `callService('climate', …)`, a `case 'script':`, an array element, a `` `sensor.${x}` `` — plus a non-flagged set: a comment, `Config['weather']`, an import string, a `'sun.sun'` full id — and a negative fixture: `'li' + 'ght'` and `String(x) as Domain` | FR-5 | the five are flagged with `file:line`; the four others are not; the two runtime-built strings are **not** flagged, asserted, documenting that the guard is literal-only |
| TC-DC-U-04 | allow-list ratchet on fixtures: an entry whose literal is gone, an entry found fewer times than `max`, a literal found more than `max`, an entry with an empty `reason`, an allowed literal found only in a different `context` (swap) | FR-5 | each fails; the messages say delete the entry / lower `max` / raise `max` / fill the reason / wrong context; a correct entry passes |
| TC-DC-U-05 | cross-check on fixtures: `'fan'` (in the universe, not in `DOMAIN`) and a token the regex sees but the AST scan does not (`light` inside a comment, and in a type-level literal) | FR-5 | the AST scan flags `'fan'` and its message names the key `FAN` to add; the regex cross-check accepts the comment and the type literal and fails on any other unflagged token; a double-quoted `"light"` is flagged by both (not used as the divergence case) |
| TC-DC-U-06 | `HASS_PLUG_SERVICE` | FR-6, FR-1 | equals `'switch'` and `DOMAIN.SWITCH`; `tests/cards/plugs/plug_const.test.ts` unchanged and green |
| TC-DC-U-07 | [MANUAL: the BUILD runner, scratch script excluding the two new test files, result recorded in the BUILD stage summary] mutate each `DOMAIN` key's value in turn and run the existing tests | FR-8 | for each of the 24 keys at least one existing test is red; a key with none is listed as a gap (expected: `number`, `zone`) |
| TC-DC-U-08 | the committed table `tests/specs/domain-site-table.json` (generated at BUILD from main `35f1020`, file → `DOMAIN` key → count) compared to an AST count of `DOMAIN.<KEY>` per file on the real tree | FR-3, FR-8 | identical; a site given the wrong key changes two cells and fails; the table's total is 115 |
| TC-DC-U-09 | allow-list on the real tree: each entry carries `reason`, `max`, `context`; every entry matches the Re-mesure (13 tokens) | FR-5, FR-9 | the table equals hexa-tiles-editor 5, hexa-tiles 3, stove-editor 2, bridge-access 1, stack-bar 1, editor-input 1; no `renault` entry |
| TC-DC-U-10 | universe pin: the test's domain list contains every `DOMAIN` value; `'renault'` and `'plug'` are not in it | FR-5, FR-1 | `DOMAIN` values ⊆ universe; the two non-domains absent |
| TC-DC-U-11 | instrument controls: (1) scan with the AST layer stubbed to return nothing; (2) the visited-file set against `git ls-files 'src/**/*.ts'` | FR-5 | (1) the regex cross-check fails naming the missed tokens; (2) the sets are equal (minus `src/locales/`); a dropped file fails naming it |
| IT-DC-I-01 | the guard on the real `src/` tree with the real allow-list | FR-3, FR-5 | zero `exact` / `prefix` literal outside the allow-list; the AST count of `DOMAIN.` references is at least 115 |
| IT-DC-I-02 | caller-side: run the whole existing suite (`tests/selectors`, `tests/cards`, `tests/components`) with `git diff main -- tests/` limited to the new test files | FR-3, FR-4 | green, no assertion edited; every card still calls `callService` with the same domain strings and filters the same entities |
| IT-DC-I-03 | read spec 02 AP#5 and run the three repo-wide guards with this spec's ids in place | FR-7 | AP#5 names the lot and the 111 count; `socle-contract`, `ids-cas-uniques` and the repo-wide ids guard are green; every id of this spec is cited once in a test title |

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A domain literal reappears in `src/` | the guard fails naming `file:line` and the `DOMAIN` key to use | none — fix the source | test output |
| An allow-list entry is stale, under or over its bound | the guard fails ("stale" / "lower max" / "over bound"), naming the line | none | test output |
| A universe domain absent from `DOMAIN` is written as a literal | the guard fails naming the key to add (FR-1, FR-5) | none | test output |
| The scan visits fewer files than `git ls-files` | TC-DC-U-11 fails naming the dropped file | none | test output |
| A mutated key turns no test red (FR-8) | reported in the BUILD summary as a coverage gap | a bead for the missing test, never a silent pass | BUILD stage summary |

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `src/types/domains.ts` | the selectors and 22 cards of `src/` |
| `FR-2` | code — `src/selectors/house.ts`, `src/cards/bridge/sci-fi-bridge-editor.ts` | climates, lights, bridge editor |
| `FR-3` | code — the 24 files of Re-mesure | the cards at run time |
| `FR-5` | code — `tests/types/domain-literals.test.ts` (allow-list table inside) and `tests/helpers/domain-scan.ts` (scanner, universe) | `npm test` |
| `FR-6` | code — `src/cards/plugs/plug_const.ts` | the plugs card |
| `FR-7` | config/schema — `docs/specs/02_domain_selectors.md` | readers of the socle spec; `tests/specs/socle-contract.test.ts` |
| `FR-8` | config/schema — `tests/specs/domain-site-table.json` | `npm test` (TC-DC-U-08) |
| `FR-9` | code — the allow-list table of `tests/types/domain-literals.test.ts` | `npm test` |

## References

- [spec 02 — Domain Selectors § Anti-Patterns](../02_domain_selectors.md)
- [socle contract guard](../../../tests/specs/socle-contract.test.ts)
- [sf-token-declarations](../sf-token-declarations/spec.md) (shape: ratcheted allow-list and positive controls; its scanner `token-scan.ts` is AST-free — the AST precedents are `tests/docs/repo-wide-ids-guard.test.ts` and `tests/i18n/french-literals.ts`)
- bead `ha-sci-fi-eud`; follow-up `ha-sci-fi-4syw` (full entity ids)
