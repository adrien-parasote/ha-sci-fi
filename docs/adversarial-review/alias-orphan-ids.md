# Adversarial review — alias-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/alias-orphan-ids/spec.md.

## Stress-test

Verdict: CLAIM_BROKEN (Scope), CLAIM_OVERSTATED (Security, User). The Scope lens was re-checked by grep: the two test files cite eleven more ids no spec declares (TC-505, TC-1215, TC-508 and TC-V01..V08, on ten title lines), so the FR-1 guard as written could not go green. The guard also tripped its own checks and copied a blind title extractor. The spec was rewritten once: FR-1 narrows to the alias pattern, the eleven ids are declared out of scope, the guard builds patterns and fixtures from fragments, the extractor reads test( and it.each(, FR-4 adds the two file-tree lines, five guard cases are pinned.

## Findings

[HIGH] — F-01 The two test files cite eleven more undeclared ids (plugs.test.ts:204 TC-505; vehicles.test.ts:187 TC-1215, :369 TC-508 and TC-V01, :408/425/438/445/462/479/496 TC-V02..V08); FR-1's generic orphan guard would report them, and the "four titles" claim covers aliases only [RESOLVED] TC-AOI-U-02 (FR-1 narrows to the alias pattern; the eleven ids are out of scope in the Overview; the ghost-id fixture proves the guard ignores undeclared non-aliases)
[MEDIUM] — F-02 The generic FR-1 guard duplicates the repo-wide guard of 78y.8 on two files and is what drags in F-01; narrowing it to the alias pattern holds this lot's invariant [RESOLVED] TC-AOI-U-03 (guard checks aliases only; Anti-pattern 5)
[MEDIUM] — F-03 The file-tree lines plugs.md:105 and vehicles.md:111 still say to preserve TC-PLG-0001/0002 and TC-VEH-0001/0002; they are instructions, not history, and contradict the code after the lot [RESOLVED] TC-AOI-U-05 (FR-4 rewrites both lines)
[LOW] — F-04 IT-AOI-I-01 expects exactly four removed and four added lines, which only holds if F-01 is closed by narrowing the guard [RESOLVED] TC-AOI-U-02 (F-01 closed by narrowing; IT-AOI-I-01 defines <base>)
[MEDIUM] — F-05 TC-AOI-U-03 (no alias under tests/) fails on the guard's own source if the alias is written literally, and a U-02 fixture built on an alias does the same [RESOLVED] TC-AOI-U-03 (alias pattern and fixtures built from fragments, FR-1 and Anti-pattern 4)
[MEDIUM] — F-06 The extractor copied from tv-ids-declared.test.ts reads only it( with a literal first argument, so test( and it.each( titles escape the guard [RESOLVED] TC-AOI-U-02 (extractor reads it, test and it.each; the fixture runs all three forms)
[MEDIUM] — F-07 The cited-id pattern covers TC and IT only, while the repo rules allow UT- ids, so an undeclared UT- id in a title passes [FALSE] The guard no longer extracts general cited ids: it matches only the alias pattern TC-PLG-000n and TC-VEH-000n (FR-1), so the cited-id prefix set is not used and the UT- gap has no surface here
[MEDIUM] — F-08 A guard in tests/cards/plugs/ that writes a literal TC-VEHICLES id (fixture or assertion) breaks ids-cas-uniques O1 and IT-AOI-I-02 [RESOLVED] TC-AOI-U-03 (FR-1 and Anti-pattern 4: plugs and vehicles ids built from fragments; ghost prefix TC-GHOST-U-99 for fixtures; IT-AOI-I-02 plays O1)
[LOW] — F-09 The skip/todo/only check copied from the precedent matches it and describe only, so test.skip, test.only and it.skipIf pass [RESOLVED] TC-AOI-U-04 (widened pattern covers it, test, describe and skipIf; test.skip and it.skipIf fixtures)
[LOW] — F-10 Ids in describe( titles are neither checked nor declared out of scope in FR-1 [RESOLVED] TC-AOI-U-02 (Overview Out of scope names describe titles; the extractor reads it, test and it.each only)
[LOW] — F-11 TC-AOI-U-03 checks that the aliases are gone but not that the four new title starts of FR-2 are present [RESOLVED] TC-AOI-U-03 (U-03 asserts the four new starts present and the old starts absent)
[LOW] — F-12 The line anchors of Assumptions 1 and 2 are tied to nothing and will go stale; they should carry the row text [RESOLVED] TC-AOI-U-01 (Assumptions 1 and 2 carry the row text; line numbers marked as today's)

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no input range, count or pagination; the guard reads two repo files
HIC-2 stored-string — N/A — no user string is stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface; the alias regex has no ambiguous overlap, so no ReDoS
HIC-4 bootstrap-authz — N/A — no route or role exists in this lot
HIC-5 malformed-oversized — FINDING F-06
HIC-6 numeric-edge — N/A — aliases are matched as whole tokens, no arithmetic

## Builder check

One cold sonnet builder, spec only. Eight questions.

### Answered

Q1 `it(` is read (FR-1 reworded). Q3 row head matched on the id only, counted per spec. Q8 the IT cases are played at VERIFY; the guard is a fifth, new file.

### My calls

Q2 it.each fixture form pinned. Q4 tree walk covers `.ts` under tests/, node_modules excluded. Q5 tables checked by each row still holding its alias. Q6 only the id tokens after `preserve` change. Q7 skip fixtures built from fragments; xit, fit, xdescribe out of scope. All in Builder Calls.

### Theirs

none
