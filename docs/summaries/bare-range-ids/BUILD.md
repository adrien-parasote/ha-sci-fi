# BUILD — bare-range-ids (stage summary)

**Decided:**
- Guard lives at tests/utils/bare-range-ids-declared.test.ts (tests/specs/ is excluded from ids-cas-uniques citations, so a guard there needs ⬜ marks that break spec-gate).
- TC-116 row added after TC-115 in spec 11; TC-308 row added before TC-309 in spec 03; both feature cells edited.
- No test file other than the new guard touched; no behaviour change.
- Plan written in .sc/task.md; .sc/smoke.yaml runs npm run build (dist/ not to be committed).

**Artifacts:**
- tests/utils/bare-range-ids-declared.test.ts
- docs/specs/11_guidelines_remediation.md
- docs/specs/03_base_classes.md
- docs/specs/bare-range-ids/spec.md (path update, orchestrator)

**Open/risky:** IT-BRI-I-01..03 are played at VERIFY by command (git diff --stat, tests/specs, full vitest). Full vitest not yet run in BUILD; tests/specs was green (7 files, 95 tests) before the guard moved.

**Next action:** VERIFY: run full vitest to a file, ids-cas-uniques and blueprint-traceability, check git diff has no test file changed.

**Tests:** files +1 ~0 −0 · cases +6 −0
