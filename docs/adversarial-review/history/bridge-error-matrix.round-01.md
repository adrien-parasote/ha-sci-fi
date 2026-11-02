# Adversarial review — bridge-error-matrix

Spec: `docs/specs/bridge-error-matrix/spec.md`. Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Round 1.

## Summary

Verdict: CLAIM_OVERSTATED on all three lenses. 2 HIGH, 9 MEDIUM, 1 LOW. The spec narrows the vendored `bridge.md` matrix on a builder call (F-02), leaves a stove status gap (F-03), and validates configs too shallowly (F-01).

## Stress-test

The hostile critic, reading the convergences: Scope and User converge on the uncovered `stove.status` (F-03) and on the shared-base change (F-05); Security and User converge on the editor preview, where `setConfig` runs per keystroke (F-06, F-09). Pattern: the spec treats "absent entity" as one condition but the sections answer it three different ways (`--`, `Unavailable`, a false reading), so the rule must be stated once per section family. Blind spot: IT-BEM-I-01 passes with no dedupe at all (F-10). Verdict: the spec is fixable in place without redesign; the divergence question ("should the base-card hook exist") is answered by F-05, bridge-local.

## Findings

[HIGH] — F-01 FR-8 validates only four arrays and no element, so `alerts: {smoke: {}}`, `persons: [null]` or `automations.items: [{entity: 42}]` pass and throw in `shouldUpdate` or a section render [RESOLVED] TC-BEM-U-12
[HIGH] — F-02 Assumption 1 and FR-6 narrow the bridge.md "individual indicator shows `--`" row on a builder call, though smoke, occupancy, cycle and consumable show false readings for an absent entity [CONTRACT] [RESOLVED] TC-BEM-U-08
[MEDIUM] — F-03 `stove.status` absent reads "Inactive" with no `--` and no warn, and `actions.items` is not covered by FR-6 [RESOLVED] TC-BEM-U-09
[MEDIUM] — F-04 FR-3..5 guard NaN only: Infinity, negative power and negative pellet render as measurements [RESOLVED] TC-BEM-U-10
[MEDIUM] — F-05 "present" is undefined (`stove: null`), the error card needs hass today, and the shared base-card hook is not justified against a bridge-local one (wrong line ref) [RESOLVED] IT-BEM-I-03
[MEDIUM] — F-06 The Lovelace editor calls `setConfig` per keystroke and seeds empty-string entity ids: FR-1/FR-2 warn `entity not found:` with an empty id and re-arm every warning [RESOLVED] IT-BEM-I-05
[MEDIUM] — F-07 FR-6 slider shows `--` but the input stays enabled, so dragging replaces `--` and calls a service on a missing entity [RESOLVED] TC-BEM-U-13
[MEDIUM] — F-08 Access tag today shows localized `Unavailable` for an absent entity, FR-6 swaps it for `--` while FR-5 uses `Indisponible`: one condition, two labels [RESOLVED] TC-BEM-U-04
[MEDIUM] — F-09 FR-8 does not say what the error message contains: language, key path, expected type, and never the raw value (unbounded reflection) [RESOLVED] TC-BEM-U-12
[MEDIUM] — F-10 IT-BEM-I-01 passes without any dedupe: the changing entity is unconfigured, so `shouldUpdate` skips every re-render [RESOLVED] IT-BEM-I-01
[MEDIUM] — F-11 FR-5 names no selector and the bridge.md vehicle NOTE names `.vehicle-power` / `.vehicle-status`, which do not exist (`.vehicle-power-value`, `.vehicle-status-label`); the separator is U+00A0 [RESOLVED] TC-BEM-U-03
[LOW] — F-12 TC-BEM-U-06 exercises four of the FR-8 rules, not non-object, missing `type`, `automations`/`actions` items, `pellet_quantity`, `pellet_stock` [RESOLVED] TC-BEM-U-12

## Hostile-input checklist

HIC-1 covered ("guarded by a module-level `Set`, which `setConfig()` clears")
HIC-2 FINDING F-09
HIC-3 N/A — no SQL, shell, filesystem or URL sink; entity ids only key a Set and are never the first console argument
HIC-4 N/A — a card renders from any config, no authorization or bootstrap state exists
HIC-5 FINDING F-01
HIC-6 FINDING F-04

## Builder check

Cold opus builder, foreground, read spec.md plus the bridge.md sections it cites (not the code, not the review).

### Answered
- FR-8 rule 5 would reject valid dashboards? No: `src/cards/bridge/config.ts` types `entity: string` on persons, actions and every item array. Recorded in spec Builder Calls.

### My calls
- `{}` valid or not: `{}` without `type` is invalid, `{type}` alone is valid; TC-BEM-U-06 reworded (spec TC-BEM-U-06).
- Absent toggle / action look: toggles get `toggle-unknown`, `data-on="false"`, disabled; actions look unchanged and disabled (spec FR-6 table, FR-6.2).
- bridge.md drift on detection (`Number.isFinite`, `>= 0`) and on the `unavailable`/`unknown` numeric-slot row: amended in bridge.md, added to FR-9 and TC-BEM-U-07.
- Card-level warn: `sci-fi-bridge.ts` never warns (spec Builder Calls); IT-BEM-I-01 count of 4 holds.
- Stale stove layout names in bridge.md (`.pellet-progress`, `ON`/`OFF`): out of this lot's scope, noted in FR-9.

### Theirs
none
