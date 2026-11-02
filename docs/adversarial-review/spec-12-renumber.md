# Adversarial review — spec-12-renumber

Regime: fan-out (recorded). Lenses: Security, User, Scope (opus, foreground, blind to each other). Spec: docs/specs/spec-12-renumber/spec.md. Round 1.

## Summary

The renumbering itself (Spec 16, FR-1/FR-3) holds: every claim of Assumptions 1, 3 was re-checked against the tree. The weak point is the guard and its test cases: TC-RN-U-04 is wider than FR-4 and cannot go green as written; the guard reads line 1 only, so a second real collision (Spec 07, tv.md vs hexa-tiles.md) stays invisible while the spec claims "no exception". Security: no runtime surface, no security defect. 0 CRITICAL, 2 HIGH, 3 MEDIUM, 2 LOW; all unresolved at this step.

## Stress-test

Cross-synthesis. Convergence: User and Scope both attack TC-RN-U-04 vs FR-4 (F-01), the highest-confidence signal. Pattern: the line-1-only rule surfaces three times (Security: Spec 07 miss; User and Scope: lot spec exempt only by front-matter) and is one systemic issue (F-03, F-06). Blind spot: no TC proves FR-5/FR-6 (F-05). Hostile critic over these signals: the smallest change that survives the fixes is the pairing of F-01 and F-02, because narrowing TC-RN-U-04 to the Vehicle row link and to markdown links only closes both; widening the guard to the first `# Spec N` heading (F-03) then makes the Spec 07 collision turn the guard red on ship, so the fix must also decide the fate of tv.md/hexa-tiles.md (renumber to a free number, or scope the guard). Verdict: not ready to build; fixable in one round, no redesign needed.

## Findings

[HIGH] — F-01 TC-RN-U-04 expects every relative `.md` link in plugs.md and vacuum.md to resolve, but FR-4 repairs only the `12_vehicle` row; other dead links (`./03_base_classes.md`, `./05_cards.md`, `./11_stove_card_design_update.md`, `./13_plugs_card_design_update.md`) stay, so the test is red after the fix. Narrow the TC to the Vehicle row or add an FR. [RESOLVED] TC-RN-U-04
[HIGH] — F-02 TC-RN-U-04 "none names `12_vehicle_card_design_update.md` anywhere under `docs/specs/`" fails on this very spec, which names the file (lsFiles sees untracked files). Reword to "no markdown link targets it". [RESOLVED] TC-RN-U-04
[MEDIUM] — F-03 Assumption 5 (only line 1 carries the number) is false: tv.md:5 and hexa-tiles.md:59 carry `# Spec 07` past line 1, a real collision the guard cannot see while the spec claims "no exception". Correct the assumption, read the first `# Spec N` heading, add a fixture TC, decide the Spec 07 fate. [RESOLVED] TC-RN-U-06
[MEDIUM] — F-04 The guard compares number strings (`/^#\s+Spec\s+(\d+)/`, `m[1]`): `# Spec 1` and `# Spec 01` would not collide. FR-2 must compare integers; add a fixture TC. [RESOLVED] TC-RN-U-03
[MEDIUM] — F-05 FR-5 and FR-6 are in no TC Covers cell (RULES 2); an over-reaching rename into vehicles src/tests stays green. Add a TC (vehicles keep `Spec 12`, stove.md note unchanged) and mark FR-6 as a process step. [RESOLVED] TC-RN-U-07
[LOW] — F-06 FR-2 reads every file under `docs/specs/`, including lot specs; this spec's own H1 `# Spec 12 collision ...` is exempt only by its front-matter. State the shape rule or exclude lot specs. [RESOLVED] TC-RN-U-01
[LOW] — F-07 The new guard `it` title and the "re-locked in tdd" command are not specified (FR-2 quotes the old title with an ellipsis); the builder has to invent them. [RESOLVED] TC-RN-U-01

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — doc renumbering and a test over a finite local directory, no range, count or pagination input.
HIC-2 stored-string — N/A — no user-supplied string stored or emitted; only markdown titles and test names change.
HIC-3 injection — N/A — no interpreter or control surface; the only links are relative markdown paths checked by a test.
HIC-4 bootstrap-authz — N/A — no system, route or account involved.
HIC-5 malformed-oversized — FINDING F-03 (a spec with a header block before its title is malformed for the guard and escapes it).
HIC-6 numeric-edge — FINDING F-04 (`01` vs `1` spec numbers compared as strings).

## Builder check

One cold sonnet builder, spec only.

### Answered

- Line 1 of `water_history.md` becomes `# Spec 16 — Tactical Water Management History Log`; `vehicles.md` keeps `# Spec 12`.
- The guard: scope `docs/specs/*.md` and `docs/specs/cards/*.md`, first `^#\s+Spec\s+(\d+)` heading per file, integer comparison, no `SPECS` filter, no `['12']` exemption, Spec 07 pinned to `hexa-tiles.md` + `tv.md`, witness of more than 8 numbers, pure function over `(path, text)`, new `it` title.
- Water `describe` renamed to `Spec 16`; the Vehicle row link in `plugs.md` and `vacuum.md`; vehicles src/tests, `stove.md` and review folders untouched; guard first, then docs, then full vitest.

### My calls

- Exact name, signature and return shape of the pure check function, where its fixtures live.
- How to scan for the first heading (line loop vs multiline regex; fenced code blocks).
- Non-recursive glob and the fs API; repo-relative forward-slash paths for the pinned pair.
- How TC-RN-U-04 detects a markdown link to the missing file (regex, anchors) and what "resolves" means (file exists, `#L1` ignored).
- Row replacement in `plugs.md` / `vacuum.md`: only the link target.
- How TC-RN-U-07 asserts the `stove.md` note (substring on the two file names).
- Repo-root resolution and substring count for TC-RN-U-02 / TC-RN-U-05.

### Theirs

- The exact tdd re-lock command and its approval mechanism (named by the tdd skill at BUILD).
- Future fate of the Spec 07 pin: bead `ha-sci-fi-13j`, out of scope.
- Line numbers cited (tv.md:5, hexa-tiles.md:59, plugs.md:923, vacuum.md:976, water test line 123) were not checkable from the spec alone; they were SHOWN by the author.
- Commit, branch and bead closing: HARDEN.
