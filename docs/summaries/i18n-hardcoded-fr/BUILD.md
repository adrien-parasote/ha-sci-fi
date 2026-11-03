# BUILD — i18n-hardcoded-fr (stage summary)

**Decided:** 42 census sites converted, zero real-tree guard hits outside census (no census addition). Pairs use the tuple lookup. Components use msg() + updateWhenLocaleChanges. Guard lives in tests/i18n/ (ids scanned there). Spec Carriers table ids backticked (`FR-n`) so tests/specs/blueprint-traceability does not read them as F rows. Counts bumped in 10_card_editors.md (183/151 to 185/153). hexa-tiles.md TC-706/707 rows reworded.

**Artifacts:** src/cards/{lights/sci-fi-lights,climates/sci-fi-climates,hexa-tiles/sci-fi-hexa-tiles,weather/sci-fi-weather,vehicles/sci-fi-vehicles}.ts; src/cards/tv/{labels,sci-fi-tv-editor}.ts; src/components/editor-inputs/{sf-editor-action,sf-editor-source-list}.ts; xliff/fr.xlf; src/locales/locales/fr.js; tests/i18n/{french-literals.ts,no-hardcoded-literals.test.ts,catalogue.test.ts,surfaces.test.ts,fixtures/pre-fix/*.ts.txt}; tests/fixtures/mock-hass.ts; amended tests: lights, hexa-tiles, sf-editor-source-list; docs/specs/{10_card_editors,cards/hexa-tiles,i18n-hardcoded-fr/spec}.md; .sc/smoke.yaml (run recipe).

**Intent items touched:** none.

**Open/risky:** fr.xlf had NO orphans: extract went 326 to 359 (+33, nothing dropped), so the spec's "24 orphans" was wrong. IT-I18N-I-04 checked here once: extract+build idempotent (md5 equal); VERIFY replays it. Guard: 120 files, 5137 literals. vitest 122 files / 1477 passed, tsc (src and tests) 0, eslint 0 errors / 161 warnings (limit 166). Plan-checked was sealed after the first source edits (plan-bypass had closed plan-gate; friction noted). Reachability: only out-of-diff advisories (src/sci-fi.ts, src/utils/toast.ts).

**Dead ends:** `as string` on tuple lookup in html attributes is flagged by eslint (unneeded); kept only in toast args.

**Next action:** VERIFY: replay IT-I18N-I-04 (git status --porcelain xliff src/locales empty after extract+build), fresh-context code and security review, doc-update.

**Tests:** files +3 ~3 −0 · cases +32 −3 · 1 earlier test file(s) edited, none lost a case
