# Adversarial review — vehicles-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/vehicles-orphan-ids/spec.md. No vendored contract (docs/research absent).

## Stress-test

Verdict: CLAIM_OVERSTATED (Security, User), CLAIM_BROKEN (Scope). The mapping of the nine retired titles holds against the real files, but the lot's own test-case prefix `VOI` is already owned by the merged vacuum lot, so `ids-cas-uniques` goes red on ten ids and IT-VOI-I-02 cannot pass as written. Around that, the guard is weaker than promised: the skip ban misses runIf and fails, the guard file itself is not scanned, the "nothing else changed" proof is an unpinned line count, and three FR-2 clauses and two TC rows (U-04, U-05) have no checkable wording. Nothing touches runtime input, so no finding rates above HIGH.

## Findings

[HIGH] — F-01 The lot's TC-VOI-U-* / IT-VOI-I-* prefix collides with the vacuum lot's spec (docs/specs/vacuum-orphan-ids/spec.md declares TC-VOI-U-01..10, IT-VOI-I-01..03), so ids-cas-uniques fails on duplicate declaration — [RESOLVED] TC-VEHOI-U-01 (lot ids renamed to TC-VEHOI-U-* / IT-VEHOI-I-*, Anti-pattern 7; no other VEHOI owner in docs, tests, src)
[MEDIUM] — F-02 The skip ban (FR-4, TC-VOI-U-06) misses it.runIf, describe.runIf and it.fails, so a renamed test can stop running while the suite stays green — [RESOLVED] TC-VEHOI-U-06
[MEDIUM] — F-03 Nothing stops the guard file vehicles-ids-declared.test.ts from being skipped itself — [RESOLVED] TC-VEHOI-U-06
[MEDIUM] — F-04 The diff check only counts nine minus and nine plus lines, it does not prove each new line equals the old one with only the id swapped — [RESOLVED] TC-VEHOI-U-03 (the pairwise diff comparison is played by command)
[MEDIUM] — F-05 TC-VOI-U-04 does not name the retired-id pattern, so a TC-V99 fixture cannot be matched by a pattern limited to TC-V01..V08 — [RESOLVED] TC-VEHOI-U-04
[MEDIUM] — F-06 TC-VOI-U-05 anchor `3` for row 1223 is already inside its own head TC-VEHICLES-U-1223 and can never fail — [RESOLVED] TC-VEHOI-U-05
[MEDIUM] — F-07 Three FR-2 clauses (numeric order after 1214, no ⬜ on the nine rows, note "vingt-six") have no TC row — [RESOLVED] TC-VEHOI-U-08
[MEDIUM] — F-08 Assumption 1's proof grep for TC-1215 / TC-V01..V08 matches the spec itself and contradicts its claim — [RESOLVED] TC-VEHOI-U-01 (Assumption 1 proof now greps row heads only, which finds none)
[MEDIUM] — F-09 Old ids stay in comments above the renamed titles, a silent residue for 78y.8 — [ACCEPTED: spec FR-5]
[LOW] — F-10 The relaxed row-head matcher counts unplayed ⬜ heads as declared — [ACCEPTED: spec FR-6]
[LOW] — F-11 The Error Handling messages (id and count named, empty set named) are not what the prescribed assertions print — [RESOLVED] TC-VEHOI-U-03 (Error Handling table now describes the toEqual and length diffs)
[LOW] — F-12 Builder Calls says copy the weather guard, but headsOf and GHOST must differ from the precedent — [RESOLVED] TC-VEHOI-U-02 (Builder Calls names headsOf and the ghost id as differing)
[LOW] — F-13 The out-of-scope list names four test files that cite no id today — [RESOLVED] TC-VEHOI-U-01 (Out of scope now states they cite none and that 78y.8 takes later ones)
[LOW] — F-14 The user decision to add rows for all nine ids has no recorded source — [ACCEPTED: spec FR-7]

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — test-title and spec-row rename only, no range, count, size or pagination at runtime
HIC-2 stored-string — N/A — no user-supplied string is stored or emitted; titles are repo-authored
HIC-3 injection — N/A — no SQL, shell, template, URL or header sink; the guard reads repo files by fixed path
HIC-4 bootstrap-authz — N/A — no route, no mutation, no actor
HIC-5 malformed-oversized — N/A — no endpoint; the copied TITLE_RE has disjoint alternations and a missing file throws loudly
HIC-6 numeric-edge — N/A — no numeric or enum field parsed at runtime

## Builder check

One cold sonnet builder read the settled spec alone; no hard blocker.

### Answered

prefix and numbers of the nine ids (Overview, FR-3); rename not declare (Anti-pattern 1); TC-508 stays (Anti-pattern 2); guard location and shape, what differs from the weather guard (Builder Calls, Anti-pattern 4); `**` and ⬜ in the row-head matcher; fragments for retired ids; eight `it` blocks, never spelling an IT-VEHOI-I id; row format; no ⬜ on the new rows; comments and other test files untouched; IT rows played by a command at VERIFY; F-CARD-07 marker is the vehicles file.

### My calls

reading the cited test lines only to confirm row wording; exact assertions inside the eight guard tests, following the TC table; commit handling per the lane; writing rows so the TC-VEHOI-U-05 anchors appear after stripping backticks.

### Theirs

whether `78y.8` absorbs or retires the guard (not blocking, nothing to build).

Ambiguities raised and settled: A1 FR-2 versus "already written" — FR-2 now says the builder verifies and adds only what is missing; A2 repo guards red between SPEC and BUILD — expected, stated in Builder Calls; A3 the title extractor reads `it(`/`test(` calls only, so the residual comments cannot trip TC-VEHOI-U-04 — stated by "Titles are read as literal source text" and Assumption 6.
