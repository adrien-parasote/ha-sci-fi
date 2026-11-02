# BUILD — icon-contract (stage summary)

**Decided:** SfIcon owns iconClass/logPrefix getters, SciIcon is a 33-line subclass; own-key lookup via `ownValue` (hasOwnProperty.call, since lib is ES2021 and has no Object.hasOwn); window.customIcons.sci/sf seeded in place with static paths only, never weather templates; STATIC_ICON_NAMES shared by sf-iconset and the editor dropdown; guards moved to tests/docs/ (tests/specs/ is excluded from the id-citation scan); test-compaction plan declined (it would drop forged-name and 28-names cases), verify green.

**Artifacts:** src/components/sf-icon/icon-names.ts, sf-icon.ts, sci-icon.ts, sf-iconset.ts, icon-cache.ts; src/components/editor-inputs/sf-editor-dropdown-icon.ts; src/components/sf-toast.ts; tests/components/sf-icon/icon-contract.test.ts; tests/docs/icon-contract-guards.test.ts; tests/components/sf-icon/sf-iconset.test.ts; tests/components/sf-icon/sf-icon.test.ts; CHANGELOG.md; .sc/task.md.

**Intent items touched:** none.

**Open/risky:** the spec counts 33 weather icons; sf-weather-icons.ts holds 46. CHANGELOG says 46 and TC-ICC-U-11 derives the count from the data; spec text (FR-2, FR-9, TC-ICC-U-02/11, Assumption 1) still says 33. Spec 04 TC-408 row cites TC-ICC-U-01, not STATIC_ICON_NAMES (TC-ICC-U-10 pins that). The AP#1 of TC-ICC-U-10 is read on the lot spec, not Spec 04. Lot spec Carriers table ids were backticked (the blueprint guard read `| FR-n |` rows) and the guards path was corrected. node_modules in the worktree is an ignored symlink. Weather ids collide in light DOM: bead ha-sci-fi-rq0.

**Dead ends:** none.

**Next action:** VERIFY: /verify-stage, fresh-context code and security review, full vitest/tsc/eslint again.

**Tests:** files +2 ~2 −0 · cases +26 −1 · 1 earlier test file(s) edited, none lost a case
