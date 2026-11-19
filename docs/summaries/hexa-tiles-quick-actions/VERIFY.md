# VERIFY — hexa-tiles-quick-actions (stage summary)

**Decided:**
- Reviews (code, security), UI walk, interaction, refactor-clean: proofs on disk, no self round left.
- Cold-boot recipe `.sc/smoke.yaml`: smoke curls follow redirects (`-L`); `serve@14` answers 301 on `/dev/workbench.html`.
- TC-HQA ids cited by the card spec table: declared as a voluntary share in `docs/specs/shared-tc-ids.md` (bullets, never table rows: project guard O1 reads a row opening on an id as a declaration).
- verify.py full run PASS (3 advisories: P7 base-carried, P8 heuristic FPs on backticked labels and plan coverage, P12 tokens in pre-existing workbench line and the spike).
- FR-15 (wiki page `Hexa-Tiles.md`, section Quick actions) not written: lives in the separate wiki repo, outside this tree.
- Course-correct 2026-11-19 (MEDIUM, user at the workbench): pending/moving blinks state colour ↔ light blue `--sf-primary` (FR-10, FR-7.5, TC-HQA-U-13); scenario `Poêle éteint` (FR-16, TC-HQA-U-17). Re-earned: spec-gate, adversarial, doc-updated, verify, coldboot. Named walk FR-7.5/FR-10/FR-16 HELD (`.sc/ui-walk/only/ui-walk-only.md`).

**Artifacts:** docs/specs/shared-tc-ids.md, .sc/smoke.yaml, docs/reviews/hexa-tiles-quick-actions/code-review.md, docs/reviews/hexa-tiles-quick-actions/security-review.md, docs/reviews/hexa-tiles-quick-actions/ui-walk.md, dev/modules/mock-hass.js, dev/modules/workbench-app.js, dev/modules/hass-action.js, tests/dev/workbench.test.ts

**Intent items touched:** IA-FC-OPERATION-SET, IA-EX-1..5 PASS; IA-EX-6 FAIL (manual: live dashboard check).

**Open/risky:**
- Stale after the course-correct: codereview/security (round cap reached, a 5th round is the user's review-round bypass), ui-walked/interaction (a whole walk re-records them).
- intent-gate-passed not minted: IA-EX-6 is the user's (live check, then `.sc/intent-untested-IA-EX-6`, or `bypass intent:`).
- Phone checks owed to the human: spec Assumptions 2, 3, 9.
- Wiki FR-15 owed in ha-sci-fi-wiki.
- node_modules is a link to the main tree install.

**Next action:** user signs IA-EX-6, `scr.py run .` mints intent-gate-passed, then `scr.py next .` into HARDEN.

**Tests:** files +1 ~3 −0 · cases +49 −0 · 3 earlier test file(s) edited, none lost a case
