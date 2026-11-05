# VERIFY - water-offline (stage summary)

**Decided:**
- P7 god-file on src/cards/bridge/sci-fi-bridge.ts is base debt (empty diff vs build-base b312e10): ignored in .verifyignore with that reason. The hexa-tiles editor and sci-fi.ts lines were already there.
- D12 row in water_history.md keeps the cite (`:233`), as TC-WSA-U-04 requires. This supersedes the round-1 code-review resolution that removed it.
- Delta review round 2 (subagents): security DEPLOY, code APPROVE. Both recorded.
- Proofs held: verify-passed, coldboot-passed, doc-updated, codereview-passed, security-passed, refactor-clean.

**Artifacts:** docs/specs/cards/water_history.md, docs/specs/cards/water.md, .verifyignore, docs/reviews/water-offline/code-review.md, docs/reviews/water-offline/security-review.md

**Intent items touched:** none (no intent trace for this lot)

**Open/risky:** node_modules is a symlink to the root tree's install (verify warning). P14 advisory: orphan TC-VACUUM-U-1/2 titles, not this lot. P15 reachability is advisory. The `P8:*:*` line in .verifyignore is rejected by verify and comes from the base. Nothing is committed yet.

**Dead ends:** test_reduce.py crashes on 7.96.0, so it was not used.

**Next action:** HARDEN: /harden-stage, learn-eval, then the commit gate.

**Tests:** files +1 ~3 −0 · cases +21 −1 · 2 earlier test file(s) edited, none lost a case
