# Adversarial review — water-spec-arbitration

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/water-spec-arbitration/spec.md. Lenses checked the rewritten docs/specs/cards/water_history.md against the real code in src/cards/water (not src/cards/water-management) and against docs/specs/cards/water.md.

## Stress-test

Verdict: CLAIM_BROKEN (Scope), CLAIM_OVERSTATED (Security, User). The window (7 days), the endpoint order (history/history_during_period then logbook/get_events), the two filters, the alert definition and D01/D12/D15 match the code. But the lot is not green: ids-cas-uniques is red today on the arbitration spec's own ids (TC-WSA-U-01..05, IT-WSA-I-01..03 are declared with no citation and no marker), the planned guard location trips the same guard, the spec still mandates an accordion-open fetch that water.md forbids, and it promises malformed-row handling the code lacks. Nothing is fixed at this step.

## Findings

[HIGH] — F-01 water_history.md still mandates `expanded` as an accordion-open fetch trigger (:57, :81, :108, TC-U-002 :128); water.md forbids it (AP "Fetch on accordion open" :102, "Global expanded state" :104), nothing in src/ sets `.expanded` (only tests do), so FR-3 hard-codes a contradiction and AP 1 cites water.md while violating it [RESOLVED] TC-WSA-U-03
[HIGH] — F-02 water_history.md:99 promises "ignore malformed rows, console.warn"; `_queryLogbook` (sci-fi-water-management.ts:258-272) validates nothing and `log.state.toUpperCase()` (:374) throws on a stateless logbook event (automation entries); no Known Gap covers it [RESOLVED] TC-WSA-U-07
[HIGH] — F-03 FR-6 cannot be met: ids-cas-uniques reads every docs/**.md, the arbitration spec's TC-WSA-U-01..05 and IT-WSA-I-01..03 are declared without a citing .ts or the ⬜ marker, the guard is red today (vehicles precedent marks its IT rows ⬜) [RESOLVED] IT-WSA-I-01
[HIGH] — F-04 Anti-pattern 3 gets the reason backwards: citations outside tests/specs/ do count; if tests/cards/water/water-history-aligned.test.ts spells IT-WATER-HISTORY-I-001/-I-003, `malPlace` fires (wrong path) and marked-vs-played mismatches (both rows are ⬜), so the guard must build those ids from fragments or match by scenario text [RESOLVED] IT-WSA-I-01
[HIGH] — F-05 D12 is called "known gap, spec not bent" but water_history.md:97 withdraws the `[ OFFLINE ]`/cached-data requirement while :145 says the spec states the intended behaviour and AP 1 forbids bending; bead ha-sci-fi-1k7 stays open for a requirement that no longer exists; also both-fail renders the same empty state as "no history", no timeout, and water.md:173 "connection error / retry 5s" is not reconciled [RESOLVED] TC-WSA-U-04
[MEDIUM] — F-06 FR-6 and IT-WSA-I-01 name the wrong guard set: spec-numbering lives in tests/docs/spec-numbering.test.ts (not run by `vitest run tests/specs`), and tests/specs holds six guards including transverse-registries which reads water_history.md [RESOLVED] IT-WSA-I-01
[MEDIUM] — F-07 D14 "resolved, no bead" is unsound: its justification (TC-WATER-HISTORY-U-005 asserts a literal) is a ⬜ row, so no test plays it [RESOLVED] TC-WSA-U-04
[MEDIUM] — F-08 The guard assertions are file-wide or trivially passing: no section scoping for Known Gaps / § 1 / offline row / AP 1; `24[ -]hours?` misses `24 h`, `24h`, `24 heures`, `1 day`; "at least one 7-day mention" does not guard "every place"; `Warning filter` misses "third (Warning) filter"; `per floor load` matches "never per floor load"; bead check is shape-only [RESOLVED] TC-WSA-U-01
[MEDIUM] — F-09 Scope contradicts water.md: water_history.md:4 and F-WATER-HIST-01 put the log inside the Automations accordion only; water.md F-WATER-05 and the code (:613, :628) render a filtered log in every device accordion [RESOLVED] TC-WSA-U-06
[MEDIUM] — F-10 Known Gap D07 says the "no equipment for this floor" branch is unreachable; with first_floor_to_render naming an existing floor with no water entities it renders (:457-458, :491-495), so the bead targets the wrong defect [RESOLVED] TC-WSA-U-04
[MEDIUM] — F-11 `_rawLogs` is stored unbounded (FR "store the FULL 7-day response", sensor domain queried) and filtered/sorted on every render once per accordion (:333-342, :613, :628); the 50 limit applies to output only [ACCEPTED: spec FR-10]
[LOW] — F-12 D20 cites stale lines (:511, :566, :606, :621); actual style= lines are 515, 570, 610, 625; Assumption 2 cites "L101" for entity retrieval (actually :414) [RESOLVED] TC-WSA-U-04
[LOW] — F-13 Leftover logbook-only wording: IT-WATER-HISTORY-I-002 expects "a new logbook fetch" (:138) and the Empty State Guard says "DO NOT call the logbook API" (:85), leaving the recorder call unguarded [RESOLVED] TC-WSA-U-02
[LOW] — F-14 Domain lists differ: water_history.md:76 and the code (:138-140) include input_boolean, water.md:39 omits it; the Overview claims alignment without recording which wins [RESOLVED] TC-WSA-U-08
[LOW] — F-15 The `sensor` + moisture `on` alert path can never fire (numeric state) so the "both" alert definition is vacuous for sensor [RESOLVED] TC-WSA-U-08
[LOW] — F-16 Early returns (empty entityIds, sandbox) skip `_fetchId++` (:149-157) so "MUST discard superseded responses" is overstated; bead counts (78y.7 lists 25 ids vs "40 titles") and o5p/enr closure are not stated [RESOLVED] TC-WSA-U-08

## Hostile-Input Checklist

HIC-1 unbounded-input — FINDING F-11
HIC-2 stored-string — N/A — friendly_name/state render through Lit text interpolation, no unsafeHTML/innerHTML in src/cards/water
HIC-3 injection — N/A — entity ids go into JSON WS payloads from the registry, no string-built query, HTML or eval
HIC-4 bootstrap-authz — N/A — calls use the logged-in user's hass connection, no route or role added
HIC-5 malformed-oversized — FINDING F-02
HIC-6 numeric-edge — FINDING F-16

## Builder check

Two cold sonnet builders ran, in the foreground: a first one (spec plus sources, which found the bead-id charset, section and bullet extraction, nested-vitest timeout, `main` resolution and git-status gaps, and one false claim about `transverse-registries`, all fixed in the spec) and a second in the prescribed form (spec dir only, COVERAGE spec.md 94/94). Second builder's questions, sorted:

### Answered
- Order of work, guard green on first run since `water_history.md` is already rewritten at SPEC, a missing zone fails: spec.md, `Builder rulings`.
- `main...HEAD` is a merge-base diff, immune to an advanced `main`: spec.md, `Builder rulings` and IT-WSA-I-02.
- `ids-cas-uniques` scanning the guard: the guard cites `TC-WSA`/`IT-WSA` literally and spells the `water_history` ids from fragments: spec.md Anti-patterns 3 and 5, Assumption 4.
- Sections and row ids exist in `water_history.md`; a missing zone is a failure: spec.md, `Builder rulings`.
- Beads exist already (filed at SPEC), a missing one blocks VERIFY: spec.md, `Builder rulings`.

### My calls
- `Warning` check scoped to the I-003 row; `expanded` ban on the backticked token only; Known Gaps runs to the next `##`; exact 1-indexed line citations, case-sensitive `style=`; pipe tables, indentation counted in spaces; `o5p`/`enr` closure is a manual HARDEN step: spec.md, `Builder rulings` (marked as agent's call).
- The guard proves it can fail by in-memory mutants of the file text (not git history): spec.md, `Builder rulings`.

### Theirs
none
