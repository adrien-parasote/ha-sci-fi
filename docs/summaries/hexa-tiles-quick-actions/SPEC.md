# SPEC - hexa-tiles-quick-actions (stage summary)

**Decided:**
- No confirmation on any tile; tap = immediate hass-action (FR-6).
- No lockout during pending or motion: every gesture emits, a toggle restarts pending (FR-7.1, FR-7.6, user via spike D2.2).
- opening/closing rendered as pending, no timer (FR-7.5); pending per entity, emitting tile's timeout, cap 86400 s (FR-7, FR-7.3).
- Feedback via existing sf-toast: no-change timeout and muted tap on unavailable (FR-7.8); error tile gets a mark + "Unavailable" line (FR-5).
- Click after hold / pointercancel / >10 px move ignored, flag cleared at next pointerdown (FR-8.1).
- Workbench: mock gains switch.mureva_evlink, scenarios Relais muet / Indisponible / Portail en mouvement (FR-16).

**Artifacts:**
- docs/specs/hexa-tiles-quick-actions/spec.md
- docs/specs/hexa-tiles-quick-actions/state-mapping.yaml
- docs/intent-trace/hexa-tiles-quick-actions.yaml
- docs/adversarial-review/hexa-tiles-quick-actions.md
- docs/spikes/hexa-tiles-quick-actions/spike.html, answers.md

**Intent items touched:** IA-EX-1..5 proof -> test_exit_code (tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts); no-effect-on-reject moved to IA-EX-1.

**Open/risky:**
- The spike reversed the lockout and added the toast AFTER the hostile review: not re-reviewed by a lens (round cap 1 left unused).
- Assumption 9 (second open_cover pulse stops the gate) and Assumption 3 are TELL: check on the phone at VERIFY.
- First BUILD gesture: record the pre-lot innerHTML snapshot (TC-HQA-U-09) before touching the card.
- Worktree needs node_modules -> ../../node_modules symlink for the workbench.
- Headless blockers: no foyer declares the worktree (user's setup answer); no Playwright installed for VERIFY.

**Dead ends:** none.

**Next action:** /build-execution, then record the TC-HQA-U-09 snapshot on the unmodified card.
