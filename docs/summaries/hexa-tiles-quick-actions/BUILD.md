# BUILD - hexa-tiles-quick-actions (stage summary)

**Decided:**
- Gestures, pending and the tile view live in a new module; the card renders and hosts it.
- State colour set through the CSSOM (ref + setProperty), not styleMap: styleMap concatenates on its first render (TC-HQA-U-02). FR-3 amended; spec gate re-earned.
- Spec Carriers table: FR ids backticked so the repo blueprint guard skips them.
- Pre-lot snapshot recorded on the unmodified card; FR-2 normalisation also empties sf-icon light-DOM content (registration-dependent); icon compared by .icon.
- --sf-tile-state-color declared on .hexa-tile (default primary) for the token guards; CSS baseline regenerated (additions only).
- Workbench: Relais muet = scenario flag _muted_relay; handler in dev/modules/hass-action.js.

**Artifacts:**
- src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts (new), sci-fi-hexa-tiles.ts, config.ts, styles.ts, sci-fi-hexa-tiles-editor.ts, labels.ts
- xliff/fr.xlf, src/locales/locales/fr.js
- docs/specs/cards/hexa-tiles.md, docs/specs/03_base_classes.md, docs/specs/10_card_editors.md, docs/specs/hexa-tiles-quick-actions/spec.md
- dev/modules/hass-action.js (new), workbench-app.js, mock-data.js, dev/cards/hexa.js
- tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts (new), fixtures/pre-lot-snapshot.json (new), editor/styles tests, tests/dev/workbench.test.ts, tests/styles/card-css-baseline.json
- .sc/task.md (plan, 9 steps)

**Intent items touched:** none new; IA-EX-1..5 proofs sit in the quick-actions test file.

**Open/risky:**
- Suite 159 files green, tsc clean, lint 154 warnings (unchanged). Re-locked twice with reasons.
- Editor fan-out 16 -> 18 (already an accepted god file); stove and bridge god files predate the lot.
- No rollup build run (dist owned by an outside watch); workbench not opened in a browser.
- Phone checks still owed at VERIFY: Assumptions 2, 3, 9.
- Not committed (user rule).

**Dead ends:** styleMap for the state colour - injectable on first render.

**Next action:** /verify-stage.

**Tests:** files +1 ~3 −0 · cases +43 −0 · 3 earlier test file(s) edited, none lost a case
