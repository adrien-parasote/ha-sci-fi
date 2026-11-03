# VERIFY — domain-constants (stage summary)

**Decided:**
- Code review ran 5 rounds (ceiling 2). Round 5 = delta round authorized by the user (fiat, not a bypass), fresh reviewer, `--auditor subagent`: APPROVE, 1 LOW fixed (rules.toml comment).
- Security: DEPLOY on a fresh delta reviewer; security-passed re-minted after the comment-only change.
- Sentrux expected state is now 2 named god files (src/sci-fi.ts, sci-fi-hexa-tiles-editor.ts, P7 exception accepted by the user) plus 2 older cc/fn-lines violations in tests/ not from this lot.
- verify, refactor-clean, doc-updated, coldboot, ui-walk, intent proofs all held or re-earned by `scr.py run`.

**Artifacts:** docs/reviews/domain-constants/code-review.md · docs/reviews/domain-constants/security-review.md · docs/reviews/domain-constants/history/ · .sentrux/rules.toml · .verifyignore

**Open/risky:** dist/ is rebuilt by `scr.py run`: never stage it. Mutation gaps NUMBER, COUNTER, VALVE = bead ha-sci-fi-knps. Entity-id constant = bead 4syw.

**Next action:** HARDEN: learn-eval, flip spec 02 AP#5 to Tenu, full vitest + tsc + eslint, commit (specific paths, -F file, no dist/.sc/.agents).

**Tests:** files +3 ~4 −0 · cases +17 −0 · 4 earlier test file(s) edited, none lost a case
