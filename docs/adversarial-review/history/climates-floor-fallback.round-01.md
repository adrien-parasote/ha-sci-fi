# Adversarial review — climates-floor-fallback

Regime: fan-out (recorded by the user). Lenses: Security, User, Scope, each on opus (author on sonnet), foreground, one message. Packet: `.sc/review/864006a-2c0db646`. Round 1 of max 2. Fixed product decisions not re-argued: unconditional fallback as written, FR-5 accepted limit, no new capability.

## Summary

Security: clean, one LOW (nullish first registry element). User: CLAIM_OVERSTATED, one HIGH (the fallback writes `_active_floor_id`, so it locks a floor that today is recomputed on every render; FR-6 and Assumption 5 overstate). Scope: CLAIM_OVERSTATED, one HIGH on the same FR-6 claim (convergence with User) and one HIGH on TC-CFF-U-07 (wrong msg list, comparison with `main`). Facts re-checked in the code by the runner: three extra `msg()` sources exist (`Temperature changed`, `HVAC mode changed`, `Preset changed`), `.floor-content` is always rendered (`sci-fi-climates.ts:109`), the climates.md row reads "Radiators in areas with no floor" (line 124).

## Cross-synthesis

- Convergence (User + Scope, high confidence): FR-6 / Assumption 5 / IT-CFF-I-01 promise recomputation the code does not do once the fallback has written the floor. F-01.
- Pattern: spec text asserting a DOM or list shape that the code does not have (F-02, F-04, F-06), tests built from prose instead of from the template.
- Tension: Security wants nullish guards on the new `[0]` reads; Scope wants no extra tests. A single optional-chain row (F-10) satisfies both.
- Blind spot: none beyond the above; the service-call path targets rendered radiators only (Security lens checked).

## Stress-test

Verdict: the code change is small and sound; the spec over-claims in three places. Attack on the fix: narrowing FR-6 to the fallback floor must not itself promise more (F-01 fix pins the opposite case with IT-CFF-I-04, scenario F then salon moved to `up`: still `Rdc - Off`). The residual consequence, a fallback that locks a floor which today is recomputed, is stated in the corrected Assumption 5 and flagged to the user in the stage summary; it follows from the user's decision "the two blocks as written" and adds no capability. No CRITICAL.

## Findings

[HIGH] — F-01 FR-6 and Assumption 5 claim the card follows a radiator area later assigned to another floor; the fallback writes `_active_floor_id` and `!this._active_floor_id` (sci-fi-climates.ts:65) then never rescans (User + Scope convergent); IT-CFF-I-01 only covers the lucky case.
[HIGH] — F-02 TC-CFF-U-07 / FR-8 list "exactly" four msg sources but seven exist, "plus any already present" contradicts "exactly", and a comparison with `main` needs a git read inside vitest; TC-I18N-U-11 already guards it.
[MEDIUM] — F-03 Builder Calls says the diff touches `sci-fi-climates.ts` only, while FR-7 changes `docs/specs/cards/climates.md` and the TCs add tests under `tests/`.
[MEDIUM] — F-04 TC-CFF-U-04 scenario B expects `.floor-content` absent, but the element is always rendered (sci-fi-climates.ts:109); only its children are empty.
[MEDIUM] — F-05 Scenario A shows `Ground - Off` above a radiator in `heat`; no TC pins that visual contradiction (title class), so a later label change could move it unseen.
[LOW] — F-06 TC-CFF-U-06 expects an Error Handling row "mentioning no floored area" while climates.md:124 says "Radiators in areas with no floor".
[LOW] — F-07 TC-CFF-U-03 (selection kept), IT-CFF-I-03 and the source scans of TC-CFF-U-05 pin behaviour the diff does not change (regression padding).
[LOW] — F-08 Assumption 3: `Object.values` lists integer-like keys first, so an area id such as `1` jumps ahead of registry order; the fixtures use slug ids only.
[LOW] — F-09 Blank body in scenario B gives no text and no accessible hint; FR-8 forbids a new string and the spec does not say so in Error Handling.
[LOW] — F-10 The new `getFloors()[0].floor_id` and `getAreas()[0].area_id` reads throw a TypeError inside `render()` if the first registry value is nullish; Builder Calls does not say to optional-chain.

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — the fallback adds an O(1) `[0]` read on lists already iterated once per render, no new bound.
HIC-2 stored-string — N/A — floor and area names are rendered as text through Lit's escaped `html` template (no unsafeHTML in the card), and nothing is stored.
HIC-3 injection — N/A — no interpreter, URL or header sink; the unknown YAML key `filter_by` is no longer read at all (FR-3).
HIC-4 bootstrap-authz — N/A — a read-only display card with no auth surface.
HIC-5 malformed-oversized — FINDING F-10
HIC-6 numeric-edge — N/A — no numeric input is added; floor `level` ordering is existing `getFloors()` behaviour.

## Builder check

(pending: runs on the settled spec after the fixes)
