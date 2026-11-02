# Adversarial review — bare-range-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/bare-range-ids/spec.md.

## Stress-test

Verdict: CLAIM_HOLDS (Security, Scope), CLAIM_OVERSTATED (User). The Scope lens ran a row-head lookup on every id that starts a title in the two test files: only TC-116 and TC-308 are undeclared, and spec 11 and spec 03 are the right declaring specs. The weak points were one level up: the feature maps still listed no test for the new ids and IT-BRI-I-01 forbade fixing it; Assumption 4 on ids-cas-uniques rested on neighbours only; two wording claims were inexact. The spec was amended once: FR-1/FR-2 edit the F-REMED-08 and F-BASE-02 cells, TC-BRI-U-05 pins them, Assumption 4 states the guard rules, the Overview and Builder Calls wording is corrected, the walk does not follow symlinks.

## Findings

[MEDIUM] — F-01 The feature maps are not updated: F-REMED-08 (11_guidelines_remediation.md:20) lists `TC-114, TC-115` and no F-BASE row (03_base_classes.md:15-20) lists TC-308, so the two new ids belong to no feature, and IT-BRI-I-01 (one added line each) rules the fix out [RESOLVED] TC-BRI-U-05 (FR-1 and FR-2 edit the F-REMED-08 and F-BASE-02 test cells; IT-BRI-I-01 counts two changed lines per spec)
[MEDIUM] — F-02 Assumption 4 (ids-cas-uniques passes) rests on TC-115 and TC-307 being bare rows today; the guard counts declared ids against citations (ids-cas-uniques.test.ts:148, 390) and IT-BRI-I-02 only plays at VERIFY, so the rule the rows satisfy is not stated at spec time [RESOLVED] TC-BRI-U-01 (Assumption 4 now states the O1 uniqueness, citation and O2 card-spec rules the rows satisfy; U-01 pins one declaration per id)
[LOW] — F-03 The Overview says no other declared row covers the behaviours, but TC-114's test already asserts `card.type` does not contain `custom:` for every card (tests/sci-fi.test.ts:22), so TC-116 repeats an assertion made under a declared id; only the TC-114 row wording omits it [RESOLVED] TC-BRI-U-04 (Overview says no other row states the behaviour and names the TC-114 overlap; U-04 pins the TC-116 row tokens)
[LOW] — F-04 Builder Calls say both rows are "in French like their tables", but spec 03 rows TC-301..307 are English and TC-309 is French, and spec 11 mixes TC-114 (English) and TC-115 (French) [RESOLVED] TC-BRI-U-04 (Builder Calls say French like the adjacent TC-115 and TC-309 rows)
[LOW] — F-05 The TC-116 input says "après import de src/sci-fi.js", true only through the top-level static import of tests/sci-fi.test.ts:5; the test does no import itself [RESOLVED] TC-BRI-U-04 (the row input reads "module src/sci-fi.js chargé")
[LOW] — F-06 The recursive walk of docs/specs does not say whether it follows symlinks; a loop or an outside link could hang the guard (only a committer can plant it) [RESOLVED] TC-BRI-U-01 (Builder Calls: the walk uses lstatSync and does not follow symlinks)

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no input range, count or pagination; the guard reads repo files
HIC-2 stored-string — N/A — no user string is stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface; the extractor regex alternatives cannot match the same character, so no ReDoS
HIC-4 bootstrap-authz — N/A — no route or role exists in this lot
HIC-5 malformed-oversized — FINDING F-06
HIC-6 numeric-edge — N/A — ids are matched as whole tokens, no arithmetic

## Builder check

One cold sonnet builder, spec only. Eight questions.

### Answered

Q2 feature-map cells never match a row head. Q7 the new rows carry no ⬜. Q8 the lot's own spec holds no TC-116 or TC-308 row head.

### My calls

Q1 current cell texts and anchors written in Builder Calls. Q3 token list fixed, backticks stripped. Q4 title start is the extracted string; cwd is the worktree root. Q5 orphans(src, spec) signature and bare-id regex fixed. Q6 the real-tree check is restricted to TC-116 and TC-308. All in Builder Calls.

### Theirs

none
