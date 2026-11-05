# VERIFY - stove-power-level (stage summary)

**Decided:**
- Code review APPROVE (2 rounds; round-1 LOW fixed in 5b5b682, closure verified round 2).
- Security review DEPLOY (3 rounds, no findings; re-run after the fix and after the .verifyignore change).
- P7 fan-out on src/cards/stove/sci-fi-stove.ts suppressed in .verifyignore with recorded reason (pre-existing on main; lot adds a type-only import).
- Docs: docs/specs/cards/stove.md (F-STOVE-D09, power-level section), docs/specs/10_card_editors.md; doc-updated minted.
- verify.py PASS (cold boot from .sc/smoke.yaml), intent gate PASS.

**Artifacts:** docs/reviews/stove-power-level/code-review.md, docs/reviews/stove-power-level/security-review.md, docs/reviews/stove-power-level/history/, docs/specs/cards/stove.md, .verifyignore

**Intent items touched:** none new (intent gate PASS on docs/intent-trace/stove-power-level.yaml)

**Open/risky:**
- P8 advisory: FR-5, FR-7, FR-8.1 not mapped to a plan task (covered by tests TC-SPL-*; advisory only).
- Pre-existing `P8:*:*` wildcard in .verifyignore should be narrowed (out of lot).
- translate_xlf.py reached_from_nowhere advisory: bead filed.
- No push done.

**Next action:** HARDEN - run /harden-stage (learn-eval, then the exit commit).

**Tests:** files +1 ~3 −0 · cases +21 −1 · 2 earlier test file(s) edited, none lost a case
