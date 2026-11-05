---
spec: docs/specs/spec-12-renumber/spec.md
sources:
  - docs/specs/cards/vehicles.md
  - docs/specs/cards/water_history.md
  - docs/specs/cards/plugs.md
  - docs/specs/cards/vacuum.md
  - tests/cards/water/sci-fi-water-management.test.ts
  - tests/specs/delivered-design.test.ts
---

# Spec 12 collision between vehicles.md and water_history.md — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-b8g`. `docs/specs/cards/vehicles.md` and `docs/specs/cards/water_history.md` both open with `# Spec 12`. The user decided: `vehicles.md` keeps 12, `water_history.md` becomes `Spec 16` (16 is free: the other titles are 01..06, 09..11, 13, 14, 15). Three references follow: the `describe` title in the water test, and two links in `plugs.md` and `vacuum.md` that point at `./12_vehicle_card_design_update.md`, a file that no longer exists. The delivered-design guard pins the collision as a known exception; it now covers every spec title in `docs/specs/` and fails on any collision except one other known one, Spec 07 (`tv.md` vs `hexa-tiles.md`), out of scope here (bead `ha-sci-fi-13j`) and pinned by name so it cannot grow silently. Code and tests of the vehicles card keep their `Spec 12` mentions: they are about vehicles. No behaviour changes. See [the vehicles spec](../cards/vehicles.md) and [the water history spec](../cards/water_history.md).

## Requirements

- **FR-1**: The first line of `docs/specs/cards/water_history.md` is `# Spec 16 — Tactical Water Management History Log`; the first line of `docs/specs/cards/vehicles.md` stays `# Spec 12 — Vehicle Card Design Update`. `water_history.md` contains no other `Spec 12` mention (checked: its self-references are none today).
- **FR-2**: The guard in `tests/specs/delivered-design.test.ts` (the test titled "le numéro des specs ... ne collisionne avec aucune autre") reads the spec files of `docs/specs/*.md` and `docs/specs/cards/*.md` (lot specs in sub-directories such as `docs/specs/spec-12-renumber/` are not title-bearing specs and are excluded), takes the number of the first line matching `^#\s+Spec\s+(\d+)` in each file (line 1 for all but `tv.md:5`; a file with no such heading, like `bridge.md`, is skipped), compares numbers as integers (`Spec 1` and `Spec 01` collide), and fails when two files share a number. The filter on `SPECS` and the `['12']` exemption (`horsDiff`) are removed. No collision is exempt: the former Spec 07 collision was resolved by lot `vague-1` (bead `ha-sci-fi-doi3`, `hexa-tiles.md` became Spec 08), and every collision fails, named `Spec N: file, file`. The guard keeps its witness that more than 8 numbers were read. The check is a local pure function taking `(path, text)` pairs so a fixture can prove it. The `it` title is `le numéro des specs ne collisionne avec aucune autre`.
- **FR-3**: `describe('Automation History Logs (Spec 12)', ...)` in `tests/cards/water_history/sci-fi-water-management-history.test.ts` (moved there from `tests/cards/water/sci-fi-water-management.test.ts` by the water-orphan-ids lot) becomes `describe('Automation History Logs (Spec 16)', ...)`. Nothing else in that file changes.
- **FR-4**: The row `Vehicle spec (navigation pattern)` in `docs/specs/cards/plugs.md` and in `docs/specs/cards/vacuum.md` links `[Spec 12](./vehicles.md#L1)`. No markdown link under `docs/specs/` targets `12_vehicle_card_design_update.md`. Other dead links in those two files (`./03_base_classes.md`, `./05_cards.md`, `./11_stove_card_design_update.md`, `./13_plugs_card_design_update.md`) are out of scope and untouched.
- **FR-5**: Out of scope and left as is: `src/cards/vehicles/*` and `tests/cards/vehicles/*` (`Spec 12` means vehicles there), the historical note in `docs/specs/cards/stove.md` (it tells the story of the collision and names the files, not a title), and the files under `docs/reviews`, `docs/summaries`, `docs/adversarial-review`.
- **FR-6**: Guard first. The uniqueness test is edited and run on the tree before any doc change: it fails naming `Spec 12` with both files. After FR-1, it passes. This is a process step, proved by the VERIFY run, not by a TC. The renamed titles (the water `describe`, the delivered-design `it`) are re-locked in tdd by the builder with the reason `renumber Spec 12 collision, bead ha-sci-fi-b8g`, using the lock command the tdd skill names.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `Spec 16` is free in `docs/specs/` | Low | SHOW — first lines of every spec read: 01..06, 09, 10, 11, 12 (x2), 13, 14, 15 | TC-RN-U-01 |
| 2 | `plugs.md:923` and `vacuum.md:976` are the only links to the missing file | Medium | SHOW — `grep -rn 12_vehicle docs src tests` outside reviews/summaries/adversarial-review → those two lines | TC-RN-U-04 |
| 3 | The water describe on line 123 is the only `Spec 12` in water tests | Medium | SHOW — `grep -rn 'Spec 12' tests` → water line 123 and vehicles test lines 4 and 50 | TC-RN-U-05 |
| 4 | A bare `# Spec` first line without a number (`bridge.md`) is not a number and is skipped | Low | SHOW — `bridge.md` first line is `# Spec — sci-fi-bridge ...` | TC-RN-U-01 |
| 5 | The number of a spec is carried by its first `# Spec N` heading, which is line 1 except in `tv.md` (line 5) and `hexa-tiles.md` (line 59); those two both say `# Spec 07`, a real collision outside this lot, pinned by name | Medium | SHOW — `grep -n '^# Spec 07' docs/specs/cards/*.md` → tv.md:5, hexa-tiles.md:59 | TC-RN-U-03, TC-RN-U-06 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Widening the filter but keeping an exemption for `12` | No exemption for 12; only Spec 07 is pinned, by name and file pair |
| 2 | Renaming `Spec 12` in `src/cards/vehicles` or its tests | Leave them: they name vehicles |
| 3 | Editing lot docs with sed in place | Edit or Write |
| 4 | Fixing the docs before the guard is red | Run the guard on the current tree first |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-RN-U-01 | Every `docs/specs/**` first line `# Spec N` read from the whole directory; numbers collected | FR-2, FR-6 | No number shared by two files; more than 8 numbers read |
| TC-RN-U-02 | First lines of `vehicles.md` and `water_history.md` | FR-1 | `# Spec 12` and `# Spec 16`; `water_history.md` has no other `Spec 12` |
| TC-RN-U-03 | The collision check applied to a fixture with two files titled `# Spec 7` and `# Spec 07`, one with the heading on line 5 | FR-2 | The check returns `7` with both files |
| TC-RN-U-04 | The `Vehicle spec (navigation pattern)` row of `plugs.md` and of `vacuum.md` links `./vehicles.md#L1`, which resolves; no markdown link in any file under `docs/specs/` targets `12_vehicle_card_design_update.md` | FR-4 | Row link resolves; no link targets the missing file (prose mentions, as in this spec, are allowed) |
| TC-RN-U-05 | The text of `tests/cards/water_history/sci-fi-water-management-history.test.ts` | FR-3 | Contains `Automation History Logs (Spec 16)`, not `(Spec 12)` |
| TC-RN-U-06 | Fixture with a collision on 7 (`hexa-tiles.md`, `tv.md`) and one on 12 | FR-2 | Both collisions are reported, named `Spec N: file, file` — no number is exempt (Spec 07 resolved by lot `vague-1`) |
| TC-RN-U-07 | `vehicles` src and tests, and `stove.md` | FR-5 | `src/cards/vehicles/*` and `tests/cards/vehicles/*` still contain `Spec 12`; `stove.md` historical note unchanged (still names both files) |
| IT-RN-I-01 ⬜ | Full vitest run | FR-1..FR-4 | All suites green |
| IT-RN-I-02 ⬜ | Typecheck and build of the repository after the renumber | FR-5 | Both exit 0; `src/cards/vehicles/*` unchanged |
| IT-RN-I-03 ⬜ | Guard-first run: uniqueness test on the pre-change tree, then on the final tree | FR-6 | Red naming `Spec 12` with both files, then green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** `IT-RN-I-01` est joué par une commande au VERIFY.

## Builder Calls

- Placement (*mine*): TC-RN-U-01 to 07 live in `tests/docs/spec-numbering.test.ts` (tests/specs/ is excluded from id counting by ids-cas-uniques); the existing uniqueness test in `tests/specs/delivered-design.test.ts` is rewritten as the FR-2 guard. Both report `Spec N: file, file` for any collision, so a failure names the files.
- Link form (*mine*): the new link keeps the `#L1` anchor of the other links in those tables: `[Spec 12](./vehicles.md#L1)`.
- The user ruled the number (16) and the file that keeps 12; neither is reopened here.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| Two specs share a number | Guard fails naming `Spec N: file, file` | Renumber one to a free number, never reuse | vitest output |
| A link points at a missing file | TC-RN-U-04 fails naming the link | Point it at the existing file | vitest output |

## References

[Vehicles spec](../cards/vehicles.md), [water history spec](../cards/water_history.md), [delivered-design guard](../../../tests/specs/delivered-design.test.ts), bead `ha-sci-fi-b8g`.
