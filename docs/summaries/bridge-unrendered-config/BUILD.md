# BUILD — bridge-unrendered-config (stage summary)

**Decided:** lock button keeps the state class on the inner sf-icon (existing tests query it); toast texts are exactly 'Door locked/unlocked', 'Sirens on/off'; in-flight guard is a replaced Set in a Lit @state; editor raw strings live in a Map cleared on setConfig of a config the editor did not emit; N/A xliff entry dropped by the project's extract (unused string, pre-existing drift).

**Artifacts:** .sc/task.md ; tests/cards/bridge/bridge-unrendered-config.test.ts ; src/cards/bridge/sections/sf-bridge-alerts.ts ; src/cards/bridge/sections/sf-bridge-access.ts ; src/cards/bridge/sections/sf-bridge-vehicle.ts ; src/cards/bridge/sci-fi-bridge-editor.ts ; src/cards/bridge/labels.ts ; src/cards/bridge/config.ts ; src/cards/bridge/styles.ts ; tests/styles/card-css-baseline.json ; xliff/fr.xlf ; docs/specs/10_card_editors.md (label count 182 to 183) ; docs/specs/bridge-unrendered-config/spec.md (Carriers table first cells reworded: the Blueprint F-row guard matched single-FR rows) ; .sc/smoke.yaml (copied from root repo recipe)

**Intent items touched:** none.

**Open/risky:** docs/specs/cards/bridge.md already carried FR-7 (TC-BUC-U-08 green without edit). Full vitest 1430 pass, tsc clean, eslint 0 errors on src/cards/bridge. Spec edit after spec-gate was re-earned by scr.py run. Array validation of running_states in bridge-validate.ts stays a bead. Steps coding-standards/implement were acked early by mistake before the source was written; the work was done after, tdd lock re-taken with a reason.

**Dead ends:** none.

**Next action:** VERIFY - verification loop, code-review and security-review on the lot's diff since .sc/build-base.

**Tests:** files +1 ~0 −0 · cases +16 −0
