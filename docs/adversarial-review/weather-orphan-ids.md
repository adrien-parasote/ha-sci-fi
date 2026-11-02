# Adversarial review — weather-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/weather-orphan-ids/spec.md.

## Stress-test

Verdict: CLAIM_HOLDS (Security, User, Scope), with three MEDIUM gaps. The central decisions hold: TC-502 and TC-503 are row heads of 05_cards.md and cited only here, so dropping them would orphan them; no bare IT-004..007 is declared anywhere (water.md declares IT-WATER-I-004, so the bead's claim is out of date); no other undeclared id sits in tests/cards/weather/. The gaps were closed in one rewrite of the spec: the 05_cards.md part of the declared set is narrowed to the ids that F-CARD-05 lists for this file (TC-WOI-U-07 pins it), IT-007 is read as a coverage test with its reason written, the prose and FR-3 agree on the exact titles. The guard extractor and the skip pattern are widened and pinned by fixtures.

## Findings

[MEDIUM] — F-01 IT-007 (line 419) is dropped to an id-less title beyond the bead's exception (which names line 389 and line 501), yet it asserts a visible behaviour (a chart kind change on an already-built chart calls update()); a reviewer checking against the bead finds an untraced behaviour test [RESOLVED] TC-WOI-U-03 (the Overview reads IT-007 as a line-419 coverage test under the bead's exception for line-citing titles and names IT-WEATHER-I-001 as the holder of the kind-change behaviour; U-03 pins the new title)
[MEDIUM] — F-02 The guard counts every row head of 05_cards.md as declared, including TC-501 and TC-504..508 of other cards, so a weather title citing TC-504 passes FR-1 and the repo guards [RESOLVED] TC-WOI-U-07 (FR-1 narrows the 05_cards.md part to the ids of the F-CARD-05 row for this file; U-07 rejects TC-504 and accepts TC-502 against the real specs)
[MEDIUM] — F-03 The Overview and Assumption 4 say the three coverage titles keep their words, but FR-3 rewrites two of them (answers the precipitation and wind_speed series, updates a chart that is already initialized), so a builder following the prose writes the wrong titles [RESOLVED] TC-WOI-U-03 (Overview and Assumption 4 now defer to the exact wording of FR-3; U-03 checks the four new titles)
[LOW] — F-04 FR-2, the row and the new title say a Chart.js init failure "only" calls console.warn, but the test asserts only the call with the message and an Error, so "only" is a contract no test enforces [RESOLVED] TC-WOI-U-05 (FR-2, the row and the title now say it warns and does not throw; U-05 tokens unchanged)
[LOW] — F-05 The row action says "a datum carrying a weather condition" while the plugin reads dataset.weather as an icon name looked up in WEATHER_ICON_SET and the test mocks the Image load [RESOLVED] TC-WOI-U-05 (the row action reads "a datum carrying a weather icon name (Image load mocked)")
[LOW] — F-06 Builder Calls write the row-head matcher with a placeholder <id> that stands for the cited-id pattern when collecting heads and for one escaped id when counting one, and never say so [RESOLVED] TC-WOI-U-01 (Builder Calls define <id> for both uses; U-01 collects, U-03 counts)
[LOW] — F-07 IT-WOI-I-01 expects exactly four removed and four added lines, but git diff --unified=0 output also carries --- and +++ headers and @@ lines, so a literal count gives five and five [RESOLVED] TC-WOI-U-03 (IT-WOI-I-01 counts four - and four + content lines, headers excluded; U-03 proves the four titles it checks)
[LOW] — F-08 The out-of-scope reason for TC-502 and TC-503 names ids-cas-uniques only; dropping them would also break blueprint-traceability O1 (the F-CARD-05 Covers cell cites them), and the TC-502 row only loosely matches its getStubConfig test [RESOLVED] TC-WOI-U-07 (the Overview names both guards and the loose match; U-07 keeps TC-502 accepted)
[LOW] — F-09 IT-WOI-I-01..03 carry the ⬜ mark; if the guard spells one of those ids in a comment, ids-cas-uniques sees the id cited and the mark goes stale [RESOLVED] TC-WOI-U-01 (Builder Calls: the guard never spells an IT-WOI-I id; Error Handling row; IT-WOI-I-02 plays ids-cas-uniques)
[LOW] — F-10 The invariant covers sci-fi-weather.test.ts only while the guard name and folder suggest the whole weather directory; the editor test file is not named as left to 78y.8 [RESOLVED] TC-WOI-U-01 (the Overview names sci-fi-weather-editor.test.ts and its four ids as staying with 78y.8; U-01 reads sci-fi-weather.test.ts only)
[LOW] — F-11 The extractor reads it(, test( and it.each(...)( only, so it.concurrent( and an it.each whose table holds parentheses cite an undeclared id with the guard green [RESOLVED] TC-WOI-U-02 (the extractor accepts method chains and one level of parentheses in the table; U-02 runs four fixture forms)
[LOW] — F-12 A backtick title with an interpolated id passes, because the guard reads literal source text [FALSE] The guard is a lint over repo test files that are literal strings, and FR-1 now states that titles are read as literal source text and interpolation is not evaluated; the weather file holds no interpolated title (grep of its title lines), so nothing is missed today

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no input range, count or pagination; the guard reads repo files
HIC-2 stored-string — N/A — no user string is stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface; the extractor regex alternatives cannot match the same character, so no ReDoS
HIC-4 bootstrap-authz — N/A — no route or role exists in this lot
HIC-5 malformed-oversized — FINDING F-11
HIC-6 numeric-edge — N/A — ids are matched as whole tokens, no arithmetic

## Builder check

One cold sonnet builder, spec only. Eight questions.

### Answered

Q4 the table has the five columns of FR-2, English. Q5 titles compared by exact string equality. Q6 VERIFY plays IT-WOI-I-01, `<base>` is the merge-base. Q8 the hyphenated suffix is fine for real titles.

### My calls

Q1 F-CARD-05 line shape and cut-off written in Builder Calls. Q2 the builder may adjust the extractor if the fixtures and the real file pass. Q3 the guard's own titles never reach the rules; fixture ids built from fragments if ids-cas-uniques objects. Q7 `orphans(src, declared)` signature. All in Builder Calls.

### Theirs

none
