# SPEC — icon-contract (stage summary)

**Decided:** own-key (Object.hasOwn) icon lookup in sf-iconset, static icons only (28-icon picker); sf-icon/sci-icon hardened so foreign window.customIcons objects never render (FR-1.1, renamed from FR-1b for the id grammar); FR-3 shared base for SciIcon/SfIcon (light DOM, AP#3 amended); F-12 risk taken, F-14 release note owed; spike-offer = no; build-mode = headless; log names sanitised (printable ASCII, 64 chars).

**Artifacts:** docs/specs/icon-contract/spec.md; docs/specs/04_components.md (row 197 cites FR-1.1); docs/adversarial-review/icon-contract.md (14 findings, 13 resolved, 1 accepted; builder check done).

**Intent items touched:** none added this stage.

**Open/risky:** test titles may cite only declared ids (repo-wide-ids-guard); every declared id must be cited from the tree unless marked pending. node_modules lives in the main checkout (no copy in the worktree). If CSS moves, regenerate tests/styles/card-css-baseline.json with UPDATE_CSS_BASELINE=1. Never commit dist/sci-fi.min.js churn. .sc/plan-bypass was posted by authorize-feature (not the user).

**Dead ends:** none.

**Next action:** BUILD: read /build-execution and /coding-standards, tests first (watched red then green), then the FR-3 base, FR-1 iconset, FR-1.1 lookup.
