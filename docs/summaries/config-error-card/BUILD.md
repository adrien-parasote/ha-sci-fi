# BUILD — config-error-card (stage summary)

**Decided:**
- Base render order, hook, banner, id sanitising/cap and role/aria: src/utils/base-card.ts (hasOwnProperty.call, not Object.hasOwn: lib target).
- Seven cards override getConfiguredEntities (5 delegate to getRelevantEntities; weather and hexa-tiles list configured ids only).
- Per-card cases (U-09/15/19, IT-02/03/05) live in ONE shared file, not seven (plan rewritten to match).
- Selectors already logged nothing: FR-7 is a test only (tests/selectors/house.test.ts).
- FR-9 docs were edited at SPEC; BUILD only added "the decision is taken" to 02.
- Existing tests given one present configured entity (FR-10): stove 1111, tv 721, plugs image-click, i18n U-07; bridge U-04 split (hass unset empty, hass set shows setup banner).

**Artifacts:**
- src/utils/base-card.ts
- src/cards/{vacuum,stove,tv,vehicles,plugs,weather,hexa-tiles}/sci-fi-*.ts
- xliff/fr.xlf, src/locales/locales/fr.js
- tests/utils/base-card.test.ts, tests/cards/config-error-card.test.ts, tests/docs/config-error-card-docs.test.ts, tests/selectors/house.test.ts
- docs/specs/02_domain_selectors.md, docs/specs/03_base_classes.md
- .sc/smoke.yaml (vitest + tsc recipe)

**Intent items touched:** none

**Open/risky:**
- docs/specs/cards/bridge.md row TC-BRIDGE-U-04 says "empty without config"; now true only with hass unset. Not edited (outside lot): decide at VERIFY/HARDEN.
- Xliff placeholder equiv-text is `${this._missingIdsLabel()}`, not `${ids}` (cosmetic).
- Full vitest 1520 pass/1 skipped, both tsc and eslint (0 errors) green.
- test-compaction removed nothing.

**Dead ends:** none

**Next action:** VERIFY: verify.py, fresh sc:code-reviewer and sc:security-reviewer, doc-update; then HARDEN and commit (Closes ha-sci-fi-l3z).

**Tests:** files +2 ~7 −0 · cases +22 −0 · 7 earlier test file(s) edited, none lost a case
