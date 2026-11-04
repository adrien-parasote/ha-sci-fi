AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| git diff main (23 files: src/**, tests/styles/token-scan.ts, token-refs.test.ts, token-declarations.test.ts, spec.md) | every changed hunk | see wc | diff in full |
| tests/styles/palette-lot.test.ts | 1-72 | 72 | yes |
| docs/fixes/palette/lot.json | all | see wc | yes |
| tests/styles/card-css-baseline.json | diff | see wc | diff only |
| src/styles/common.ts, hexa-tiles/tv/bridge/climates/water :host blocks | declarations | see wc | partial (joins) |
VERDICT: APPROVE
SPEC: docs/specs/sf-token-declarations/spec.md (amended for O11: --sf-font-size-* in px)
FINDINGS:
- [LOW] tests/styles/palette-lot.test.ts:30 — O2/O5/O6 tests (tv, climates, water) only check that the name is declared, not its value; a card-local declaration at a value other than its former fallback would change the render with these tests green (only card-css-baseline.json would catch it).
  RESOLUTION: fixed — tests/styles/palette-lot.test.ts test_O2_tv_reads_only_declared_sf_tokens, test_O5_climates_season_tokens_declared, test_O6_water_font_tokens_declared now pin each declared value; mutating --sf-season-blue turns them red
- [LOW] tests/styles/palette-lot.test.ts:46 — O4 (weather) and O7 (stove) tests only check the phantom variables are gone, not the literals that replaced them (#1a2332, rgba(255,255,255,0.1), #7ca8c9).
  RESOLUTION: fixed — tests/styles/palette-lot.test.ts test_O4_weather_reads_no_phantom_ha_variable and test_O7_stove_fallbacks_canonical_and_no_phantom pin the literals; mutating #1a2332 turns test_O4 red
NOTES:
- Suite: npx vitest run → 132 files passed, 1623 passed | 1 skipped (reviewer run; re-run after the resolutions, same result).
- Intended render changes only: --sf-font-size-* 18/21/24/30px (rem under HA 24px root) → 12/14/16/20px (O11, user decision, spec :42 :102); weather/stove no longer read --primary-bg-color/--secondary-bg-color (never declared in repo; O4/O7).
- Recalibrated fallbacks are all for tokens common.ts declares and every card includes sciFiCommonStyles: the fallbacks were never used. O9 --sf-error fallback removal safe (common.ts:21).
- New card-local declarations equal the former fallbacks (checked one by one); tv/style.ts:143 keeps rgba(0,210,255,0.3) as a literal; water/styles.ts:207 stays monospace.
- Baseline diff limited to the font-size tokens and --sf-glow-cyan ×11 cards and the recalibrated fallbacks.
- Guard strengthened: OPEN_CARD_NAMES / OPEN_DRIFT emptied with suite green; token-scan.ts:498 font-size exemption removed, pinned by a fixture.
- O10 escalated to ha-sci-fi-29mt (test: null). Security: CSS and tests only, no surface.
CONFORMANCE EVIDENCE:
- FR-3 / TC-SFT-U-02 → common.ts:46-49 px, token-declarations.test.ts and test_O11.
- Declarations → hexa-tiles/styles.ts:102-110, tv/style.ts:4-10, climates/styles.ts:5-9, water/styles.ts:6-7, bridge/styles.ts:16-19, common.ts:29.
