# Adversarial review — repo-wide-ids-guard

Regime: fan-out (user answer: `fan-out`), three lenses (Security, User, Scope), each on opus (the author is sonnet), foreground, one message. Spec: docs/specs/repo-wide-ids-guard/spec.md, reviewed after the FR-10 amendment the user decided ("Retirer maintenant"): the spec the lenses read already retired cases in tv, vacuum, bare-range and water.

## Stress-test

Verdict: CLAIM_OVERSTATED from all three lenses. The converging attack (Security and Scope, with User on the water mutant): FR-10 called tv and water cases "provably subsumed" while those cases check titles against one card spec, and the repo guard accepts any bare id declared by a numbered spec; the spec's own condition for keeping weather and vehicles applied to them too. The fix narrows the retirement to the three cases that meet three written conditions (vacuum `-01`, `-02`, bare-range `-03`). Second cluster: the id grammar skipped forged shapes silently instead of refusing them, titles could be laundered through constants, and the corpus listing could drop quoted paths. Third: the retirement edit list was incomplete and deleted rows that RULES.md rule 1 says to mark `[RETIRED]`. No finding disputes the core of the lot (the TypeScript-parser guard, the five titles, `TC-208`).

## Findings

[HIGH] — F-01 FR-10 retires the tv and water declared-id cases although they check against one card spec only, so a bare id declared for another card (`TC-504`) passes the repo guard and nothing holds it [RESOLVED] TC-RWG-U-09
[HIGH] — F-02 The token grammar of FR-3 skips shapes it cannot place (`TC-202bis`, `TC-202-old`, `TC-X-U-1_x`) instead of refusing them, so FR-5 is overstated and the retired per-lot extractors saw more [RESOLVED] TC-RWG-U-06
[HIGH] — F-03 FR-10 deletes TC rows from closed lot specs, against RULES.md rule 1 (a retired item keeps its id in place, marked [RETIRED]) [RESOLVED] TC-RWG-U-09
[HIGH] — F-04 Lot spec sentences that promise the retired behaviour (vacuum FR-1, bare-range FR-4, "78y.8 absorbs", "01..10" ranges) stay true-looking after the cases go, and the FR-10 edit list names only three of five [RESOLVED] TC-RWG-U-09
[HIGH] — F-05 Retiring water `TC-WATOI-U-02` removes the only mutant of `waterIdsIn` (the mixed-title fixture) that `TC-WATOI-U-09` still calls, against FR-9 [RESOLVED] TC-RWG-U-09
[MEDIUM] — F-06 A non-literal title is accepted without question: an id can be laundered through a constant (`const T = 'TC-GHOST-U-1'; it(T)`), and a local `test` parameter is read as vitest's [RESOLVED] TC-RWG-U-02
[MEDIUM] — F-07 `git ls-files` without `-z` drops quoted non-ASCII paths from both the corpus and its witness; `suite`, `bench` and `import { it as t }` evade both probes; an ignored test file that vitest runs is never scanned [RESOLVED] TC-RWG-U-03
[MEDIUM] — F-08 Declarations can be planted by an untracked doc, and a row marked unplayed counts as declared for a title citing it [FALSE] untracked-but-not-ignored docs are read by design (CLAUDE.md: the batch stays untracked until HARDEN) and a title that spells an unplayed id is refused by ids-cas-uniques rule malPlace, as FR-8 says
[MEDIUM] — F-09 The Overview and IT-RWG-I-03 say five files for the five titles while the table lists four files (vacuum twice) [RESOLVED] IT-RWG-I-03
[MEDIUM] — F-10 The rewording list of FR-10 misses `bare-range-ids` "01..05" and `water-orphan-ids` "01..11" and never says what a range with a hole becomes [RESOLVED] TC-RWG-U-09
[MEDIUM] — F-11 TC-RWG-U-09 reads the retired ids from a prose table cell of this spec, with a short form (`-02`) and ranges, a grammar written nowhere, so a later wording change breaks the guard or silently reads fewer ids [RESOLVED] TC-RWG-U-09
[LOW] — F-12 Minor: ambiguity of the greedy lot-id shape, `docs/specs/cards/<dir>/spec.md` classed as neither card nor lot spec, `execFileSync` without `maxBuffer`, `it.fails` and `it.runIf` absent from the TC-RWG-U-01 fixtures, the Error Handling fallback wrong for template fixtures [RESOLVED] TC-RWG-U-05

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — the guard reads the tracked files of one repository at test time; the only buffer is the `git ls-files` output, bounded by `maxBuffer` (Builder Calls)
HIC-2 stored-string — N/A — no user string is stored or emitted; titles are only read
HIC-3 injection — FINDING F-02
HIC-4 bootstrap-authz — N/A — no route, role or account exists in this lot
HIC-5 malformed-oversized — FINDING F-06
HIC-6 numeric-edge — N/A — no numeric input; ids are matched by shape, never computed

## Builder check

One cold builder (opus, foreground) read the settled spec whole (133/133 lines) and probed the tree read-only: five questions, nothing else left.

### Answered

- Q1 FR-5 refused titles that FR-6 and FR-10 leave (`TC-7xx`, `TC-15xx`, the stem `TC-VACUUM-U-`): answered in FR-5 (three prose forms never read: a run ending in a hyphen, a digit run followed only by `x`, a lowercase prefix; the builder re-scans the tree first) and in TC-RWG-U-06.
- Q2 binding rule per scope or per file: answered in FR-1 (the enclosing scopes of the call, `water-history-aligned.test.ts` and `delivered-design.test.ts` named) and in TC-RWG-U-02.
- Q3 `opaque` and the refusal channel missing from the signature: answered in FR-1 (`titlesOf` returns `titles`, `fragments`, `opaque`, `refused`, collected over the tree, never a throw).
- Q4 `UT-n` bare or refused: answered in the Builder Calls (bare is `^(TC|IT)-\d+$`, so `UT` is refused as unplaceable).
- Q5 wording of bare-range FR-4 after the edit: answered in FR-10 edit (3), with its own text (no prefix rule is claimed).

### My calls

- none beyond those already marked *mine* in the Builder Calls of the spec.

### Theirs

- none
