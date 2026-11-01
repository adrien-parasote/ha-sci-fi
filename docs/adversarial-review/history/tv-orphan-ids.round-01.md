# Adversarial review — tv-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/tv-orphan-ids/spec.md.

## Stress-test

Verdict: CLAIM_OVERSTATED by all three lenses. The shared weakness was that FR-1 and FR-2 were promised but not pinned: the tv-scoped guard had no named file, nothing proved a row matches its test, a rename could drop an assertion unseen, and the spec's own TC-TVO / IT-TVO ids would have become orphans under `ids-cas-uniques`. The spec was rewritten once to close all eight findings.

## Findings

[HIGH] — F-01 The tv-scoped guard is never located or specified, so it can be absent or a no-op and still read as green [RESOLVED] TC-TVO-U-02 (FR-1 names the guard file and U-02 feeds it an orphan fixture)
[HIGH] — F-02 Renaming titles can drop an `it(`, add `skip`/`todo`, or remove an `expect` while vitest stays green [RESOLVED] TC-TVO-U-05 (skip, todo and only are banned; IT-TVO-I-01 checks the diff holds only title lines)
[HIGH] — F-03 The variant to number mapping (718b, 724b-d, 725b-c, 726b to 739..745) is not written [RESOLVED] TC-TVO-U-03 (FR-2 carries the mapping table)
[HIGH] — F-04 No case proves a row matches what its test asserts, yet FR-2 claims it [RESOLVED] TC-TVO-U-03 (FR-2 now says the row-versus-assertion match is a VERIFY code-review item, not a test)
[HIGH] — F-05 The spec's own ids TC-TVO-U-01..05 and IT-TVO-I-01..03 become orphans for `ids-cas-uniques` [RESOLVED] TC-TVO-U-01 (the guard cites TC-TVO-U-01..05 from tests/cards/tv; IT-TVO-I-* carry the unplayed mark)
[HIGH] — F-06 The tv-scoped guard duplicates 78y.8 and has no valid home under tests/specs/ [RESOLVED] TC-TVO-U-02 (the guard stays under tests/cards/tv, anti-pattern 4)
[MEDIUM] — F-07 Assumptions 1 and 3 are wrong: the grep pattern cannot check 716..738 and the guard derives its prefix only for docs/specs/cards/* and MASTER [RESOLVED] TC-TVO-U-03 (assumptions 1 and 3 rewritten)
[LOW] — F-08 IT-TVO-I-03 (tsc) cannot prove FR-3, and TC-TVO-U-05 duplicated IT-TVO-I-02 [RESOLVED] TC-TVO-U-04 (the tsc case is dropped and the duplicate removed)

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no input range, count or pagination; the lot edits a spec and test titles
HIC-2 stored-string — N/A — no user string is stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface is touched
HIC-4 bootstrap-authz — N/A — no route or role exists in this lot
HIC-5 malformed-oversized — N/A — no endpoint, input is a markdown table
HIC-6 numeric-edge — FINDING F-03

## Builder check

One cold sonnet builder, spec and tv.md only. Eleven questions.

### Answered

Which ids are orphans (all of 716..738), old title form, case count of the guard (five `it` blocks), guard cites U-01..05.

### My calls

Where row bodies come from, row placement and language, guard location, fixture and fs path, comment-line format. All written in the spec under Builder Calls.

### Theirs

none
