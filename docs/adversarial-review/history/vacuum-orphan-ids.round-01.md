# Adversarial review — vacuum-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/vacuum-orphan-ids/spec.md.

## Stress-test

Verdict: CLAIM_BROKEN (Security), CLAIM_OVERSTATED (User, Scope). The spec counted nine orphan ids but the vacuum test files cite eleven (TC-1016 and TC-506 are also undeclared, checked by grep). The new id 1527 reused a number that vacuum.md:839 retires. That same note turned false for 1529 and 1530. The guard was specified loosely. The spec was rewritten once: rows now 1528..1536, TC-506 drops its id, the note is rewritten (FR-5), the guard gets ten pinned cases.

## Findings

[HIGH] — F-01 TC-1016 (editor test line 158) and TC-506 (vacuum test line 304) are also undeclared orphans; the spec counts nine, so TC-VOI-U-01 cannot go green without filtering or without a decision on them [RESOLVED] TC-VOI-U-04 (TC-1016 gets row 1536, TC-506 drops its id; U-04 bans both)
[HIGH] — F-02 TC-VACUUM-U-1527 reuses the number that vacuum.md:839 retires ("the 1525/1526/1527 series must be completely deleted"); a reader takes the live editor row for the deleted cyclic-click test [RESOLVED] TC-VOI-U-03 (rows start at 1528; U-03 requires 1527 absent)
[HIGH] — F-03 The vacuum.md:839 note says TC-1529 and TC-1530 "are preserved" and calls 1529 "malformed shortcut"; after the lot neither id exists and the test is about an absent shortcuts.service, so the note misleads and "leave it untouched" is wrong [RESOLVED] TC-VOI-U-10 (FR-5 rewrites the note; U-10 greps it)
[MEDIUM] — F-04 The guard's row-head regex is "with or without **" but the tv precedent accepts only the bolded form; a copy of it yields an empty declared set, and nothing asserts the declared set is non-empty [RESOLVED] TC-VOI-U-08 (row head matches with or without **; non-empty set required)
[MEDIUM] — F-05 Title extraction by `it(` alone is blind to `test(`, `it.each` and titles held in a variable, so an orphan can escape the guard while it stays green [RESOLVED] TC-VOI-U-09 (extraction reads test( and it.each, flags non-literal titles)
[MEDIUM] — F-06 IT-VOI-I-01 (no assertion lost by a rename) is unplayed and has no defined pass form, while TC-VE06 and TC-1528 hold weak or conditional assertions [RESOLVED] TC-VOI-U-04 (IT-VOI-I-01 now defines its pass form; the weak assertions are stated in FR-2 and FR-3)
[MEDIUM] — F-07 The FR-2 mapping table carries two old-to-new pairs per row with no header saying so, so a row reads as pairing VE01 with VE05 [RESOLVED] TC-VOI-U-03 (FR-2 table is one old/new pair per row, with a header)
[MEDIUM] — F-08 Nothing requires the TC-VE06 row to state its conditional assertion, so the row can overstate what the test proves [RESOLVED] TC-VOI-U-03 (FR-2 says the 1533 row states its condition)
[LOW] — F-09 After TC-1528 loses its id, nothing in the test points to TC-VACUUM-U-1524, its spec row [RESOLVED] TC-VOI-U-04 (FR-3 new title points to TC-VACUUM-U-1524)
[LOW] — F-10 TC-VOI-U-06 checks only an unprefixed TC-15xx in sci-fi-plugs.ts, so a stale TC-VE0n or a second wrong citation passes [RESOLVED] TC-VOI-U-06 (U-06 scans src/ and checks the new id)
[LOW] — F-11 Assumption 4's grep covers src only; the claim "only sci-fi-plugs.ts cites an old id" needs the whole repo (the Scope lens re-ran it and it holds) [RESOLVED] TC-VOI-U-06 (Assumption 4 rerun repo-wide, U-06 guards it)
[LOW] — F-12 The vacuum guard overlaps 78y.8's repo-wide guard and the spec does not say 78y.8 retires or absorbs it [RESOLVED] TC-VOI-U-01 (FR-1 says 78y.8 absorbs or retires the guard)

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no input range, count or pagination; the lot edits a spec and test titles
HIC-2 stored-string — N/A — no user string is stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface is touched
HIC-4 bootstrap-authz — N/A — no route or role exists in this lot
HIC-5 malformed-oversized — N/A — no endpoint, input is a markdown table
HIC-6 numeric-edge — FINDING F-02

## Builder check

One cold sonnet builder, spec only. Seven questions.

### Answered

Q1 "eight" versus nine rows: Overview corrected to nine. Q5 placement: TC-VACUUM-U-1526 exists as a row head; Builder Calls say so.

### My calls

Q2/Q3 token pattern, whole-token match, every id checked (Builder Calls). Q4 the FR-5 note drops the TC-1528 mention (Builder Calls). Q6 prefixed ids in src/ are fine (Builder Calls). Q7 minor, the spec text defines the row-head forms.

### Theirs

none
