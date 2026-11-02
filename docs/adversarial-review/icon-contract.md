# Adversarial review — icon-contract (bead ha-sci-fi-6vj)

Spec: docs/specs/icon-contract/spec.md. Lane feature, regime fan-out: three lenses (Security, User, Scope), each on opus (cross-model, author is sonnet), foreground, one message. Packet: .sc/review/868b0fe-6a59c9de. No vendored contract (no scope/ digest): Scope judged against the bead and Spec 04.

Verdicts: Security CLAIM_OVERSTATED, User CLAIM_OVERSTATED, Scope CLAIM_OVERSTATED. No CRITICAL, no HIGH. 14 findings (8 MEDIUM, 6 LOW), all UNRESOLVED when written, resolved in the spec afterwards. Pre-scan facts confirmed by Scope: 28 static / 33 weather, sci-icon.ts 218 lines, `lit` re-exports `render`, `registryPromises` is a WeakMap, only undeclared bare import is `lit-html` (sf-toast.ts:15).

## Cross-synthesis

- Convergence (User + Scope): `SciIcon` is not "tag and class only" today: loading class `sci-icon--loading` and the `[sci-icon]` log prefix differ (F-06). High confidence.
- Convergence (Scope + Security): guards are narrower than their claims: FR-5 checks two names, TC-ICC-U-07 has no negative fixture, FR-8 headers are untested (F-03, F-07, F-08).
- Pattern: FR-1's "path is always a string" holds for direct calls but not for own-property lookups on a plain object (F-01) nor for the route HA really takes (F-11).
- Tension: FR-4 keeps the light DOM, Security/User note its costs (id collisions F-12, global `window.customIcons` as render source F-02).
- Blind spot: no user-facing note that 33 icons leave the picker (F-14).

## Stress-test

Hostile critic over the lens signals: the spec's core calls (static-only picker, light-DOM exception, no limiter, `lit` import, `iconClass` hook) survive; none is overturned. What does not survive is the strength of its proofs: four claims ("observable behaviour unchanged", "every ✅ row", "no second lit-html instance", "equals what the dropdown offers") are wider than the test rows behind them. Smallest attack surviving the planned fixes: a guard that passes vacuously (regex blind to a form), hence negative fixtures on every guard. Verdict: SOUND WITH AMENDMENTS — all findings absorbable in the spec; no redesign, no divergence signal (0 HIGH).

## Findings

- [MEDIUM] — F-01 Own-key lookup: `'constructor'`, `'toString'`, `'getIcon'` pass `in`/`??` on a plain object and yield a non-string `path` (sf-iconset.ts:31,36,47; sf-icon.ts:80-88,123-125), breaking FR-1. [RESOLVED] TC-ICC-U-01
- [MEDIUM] — F-02 FR-1 sends `<sf-icon>` to read renderable templates off the page-global `window.customIcons` (foreign keys survive our spread) instead of the module-local `WEATHER_ICONS` own keys. [RESOLVED] TC-ICC-U-09
- [MEDIUM] — F-03 TC-ICC-U-07 names no import forms (side-effect, `export … from`, dynamic, type-position `import("lit")`) and has no negative fixture; a regex blind to `export … from 'lit-html'` passes green. [RESOLVED] TC-ICC-U-07
- [LOW] — F-04 FR-7 "no second `lit-html` instance can enter the bundle" is overstated: a declared dependency can still nest another lit-html. [RESOLVED] TC-ICC-U-07
- [LOW] — F-05 The `not available` log interpolates the raw config-supplied name (forgeable log line). [RESOLVED] TC-ICC-U-01
- [MEDIUM] — F-06 FR-3/Assumption 3/TC-ICC-U-05: `sci-icon` loading renders `sci-icon sci-icon--loading` and warns with `[sci-icon]` (sci-icon.ts:145,154,163,189); the diff in Assumption 3 missed both and a hook on `class="sf-icon"` alone loses them untested. [RESOLVED] TC-ICC-U-05
- [MEDIUM] — F-07 FR-5/TC-ICC-U-08 only fences names before a `⬜` (two names today); a future `✅` row without `⬜` naming a missing component passes, and `sf-icon.ts` file tokens would false-positive. [RESOLVED] TC-ICC-U-08
- [MEDIUM] — F-08 FR-8 is proven only for the `icon-cache.ts` header and AP#3; the `sci-icon.ts` header ("Mirrors … identical") and the Spec 04 edits (TC-407/408, picker section, AP#5) have no test; FR-8 lists F-COMP-05 but the edit lands in § Public Interface. [RESOLVED] TC-ICC-U-10
- [LOW] — F-09 FR-6 "at most one in flight" holds per `connection` object; a failed request deletes the cached promise (icon-cache.ts:86) so it is retried on every render, and the path only runs when no `ha-icon` is registered. [RESOLVED] TC-ICC-U-06
- [LOW] — F-10 AP#1 bans `as unknown as`, but FR-1 removes it only from sf-iconset.ts; sf-icon.ts:101,104 keep two. [RESOLVED] TC-ICC-U-01
- [MEDIUM] — F-11 Error Handling row 1 names the wrong route: `ha-icon` in live HA reads `window.customIcons.sci.getIcon` (picker form), which returns `''` with no log; TC-ICC-U-01 calls both functions directly and cannot show which one HA uses. [RESOLVED] TC-ICC-U-01
- [MEDIUM] — F-12 FR-4 makes light DOM permanent without declaring that weather SVGs reuse ids (`x1`, `x2`, `b`) in one id scope, so two icons in one card can resolve `<use href="#b">` to the first. [ACCEPTED: spec FR-10]
- [LOW] — F-13 IT-ICC-I-02 "equals the names the dropdown offers with `sci:`" cannot hold literally (dropdown also lists ~100 `mdi:` names), and the import-only fallback proves nothing. [RESOLVED] IT-ICC-I-02
- [LOW] — F-14 33 icons leave HA's picker silently; wiki and release notes say nothing. [RESOLVED] TC-ICC-U-11

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — the only loop is over the fixed 28 or 33 bundled icons; the concurrent-lookup test uses a fixed 10
HIC-2 stored-string — N/A — nothing is stored; icon names are only bound as Lit attributes, which escape (Security lens)
HIC-3 injection — FINDING F-02
HIC-4 bootstrap-authz — N/A — no routes or mutations; client-side icon rendering only
HIC-5 malformed-oversized — FINDING F-01
HIC-6 numeric-edge — N/A — no numeric or enum field in the contract

## Builder check

Run after the fixes: one cold builder (sonnet, spec only), 9 questions, read 111/111 lines.

### Answered

- Lookup precedence in sf-icon.ts and where the foreign key lives (Q1, Q2, Q3): written in spec Builder Calls "Lookup order in sf-icon.ts".
- Spec 04 literal tokens (Q4): spec Builder Calls "Spec 04 edits" now names the edited sections; TC-ICC-U-10 Expected lists the tokens.
- CHANGELOG format (Q9): spec Builder Calls "Test mechanics"; section created.

### My calls

- Q5 FR-5 table parse, Q7 ha-icon isolation and cache reset, Q8 FR-7 detector kind: (agent's call) spec Builder Calls "Test mechanics".
- Q6 dropdown options builder name and signature: left to the builder, as the spec already states (Builder Calls "Dropdown agreement").

### Theirs

none
