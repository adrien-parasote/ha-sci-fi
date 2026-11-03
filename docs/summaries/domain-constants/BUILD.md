# BUILD — domain-constants (stage summary)

**Decided:**
- Red tests first, then G0 (DOMAIN, Domain, selectors, plug_const), then G1..G5 by 5 parallel sub-agents on disjoint files, each verified (counts == table, git status == write set).
- Baseline re-scan on 35f1020 matched the spec: 111 / 13 / 21 / 115. No count drift.
- FR-8 mutation loop on a copy (full suite, 3 new guard files excluded, baseline failures subtracted): 21 of 24 keys turn a test red. GAPS: NUMBER, COUNTER, VALVE (bead ha-sci-fi-knps). ZONE is pinned (1 test, hexa-tiles); expected gap `zone` did not occur.
- Red counts per key: LIGHT 16, CLIMATE 30, SENSOR 11, BINARY_SENSOR 2, SWITCH 17, COVER 3, LOCK 2, MEDIA_PLAYER 10, VACUUM 5, WEATHER 3, PERSON 7, ZONE 1, REMOTE 2, SELECT 7, AUTOMATION 1, SCRIPT 1, INPUT_BOOLEAN 1, INPUT_SELECT 1, INPUT_NUMBER 1, INPUT_BUTTON 1, HOMEASSISTANT 2, NUMBER 0, COUNTER 0, VALVE 0.

**Artifacts:** src/types/domains.ts · tests/helpers/domain-scan.ts · tests/helpers/domain-scan.test.ts · tests/types/domains.test.ts · tests/types/domain-literals.test.ts · tests/specs/domain-site-table.json · 26 src files (selectors 3, cards 23) · .sc/task.md · .sc/smoke.yaml (copy of root recipe: tsc)

**Spec deviations (spec amended: row heads, G0 paths, Carriers):**
- Test ids: spec row heads were backticked, the repo-wide ids guard needs bare ids: 14 rows unbackticked.
- domain-literals test lives in tests/types/, not tests/specs/ (ids-cas-uniques ignores tests/specs/ as citation); scanner + fixture tests in tests/helpers/.
- FR-4 "no existing test edited" NOT held for 3 guards that read src text: bridge-spec-structure and delivered-design regexes also accept DOMAIN.KEY; water-history-aligned D24 construct input_boolean -> INPUT_BOOLEAN (import placed on the blank line so cited line numbers stay). TDD re-locked with --reason.
- test-compacted: test_reduce plan crashes (JSON truncated at 65534 chars); `test_reduce.py skip` with reason, friction noted locally.

**Open/risky:** bundle builds (rollup on a copy, dist/ untouched). Spec 02 AP#5 flip to Tenu still owed at HARDEN. G4 left 4 `*.ts-E` stray files, removed.

**Next action:** VERIFY (fresh context), then HARDEN: flip AP#5, commit.

**Tests:** files +4 ~3 −0 · cases +20 −0 · 1600 pass, tsc x2 and eslint clean.
