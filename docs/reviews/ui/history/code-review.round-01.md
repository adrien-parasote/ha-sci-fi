AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/components/sf-icon/svg-id-scope.ts | 1-38 | 38 | yes |
| src/components/sf-icon/sf-icon.ts | diff + 107-231 | see wc | no (diff + render path) |
| src/components/sf-icon/data/sf-weather-icons.ts | grep SMIL begin / id= / xlink:href + 11-19 | see wc | no (targeted) |
| src/selectors/climate.ts | diff | see wc | diff only |
| src/cards/climates/sci-fi-climates.ts, sf-radiator.ts | diff | see wc | diff only |
| src/cards/tv/sci-fi-tv.ts, config.ts, sci-fi-tv-editor.ts | diff + grep custom_actions | see wc | diff only |
| src/styles/common.ts | diff | see wc | diff only |
| tests/styles/card-css-baseline.json | diff | see wc | diff only |
| tests/fixes/ui/O3.test.ts | 1-42 | 42 | yes |
| tests/fixes/socle/O4.test.ts (deleted) | 1-26 | 26 | yes |
VERDICT: BLOCK
SPEC: docs/fixes/ui/lot.json; amended docs/specs/02_domain_selectors.md, docs/specs/cards/tv.md
FINDINGS:
- [HIGH] src/components/sf-icon/svg-id-scope.ts:24-37 — animated weather icons (rain, hail, lightning) stop looping after one cycle: ids are renamed (x1 → x1-sfi1) but SMIL syncbase references in begin="0s; x1.end+.33s" / end= name ids without '#', so they are not rewritten and x1.end resolves to nothing; only the 0s start fires. Breaks O3 (local references must keep resolving inside each icon); the O3 test checks href and url() only.
  SITES: src/components/sf-icon/svg-id-scope.ts:24-37; every syncbase in src/components/sf-icon/data/sf-weather-icons.ts (e.g. :11 :12 :15 :16 :19 — 16 lines carry `.end`)
  FALSIFIED BY: tests/fixes/ui/O3.test.ts extended to require every `<id>.(begin|end)` token of begin/end to name an own id (fails today on sf:lightning-day, sf:pouring-day)
  REPRODUCED: unverified (by reading: sf-weather-icons.ts:19 `<animateTransform id="x1" … begin="0s; x1.end+.33s">`; after scopeSvgIds the id is x1-sfi1 and the '#'-less value is skipped at :27)
  ROOT: O3 — local SVG references resolve inside their own icon
  FIX-CLASS: corrects
- [LOW] src/components/sf-icon/svg-id-scope.ts:27 — attributes that reference ids without '#' (aria-labelledby, aria-describedby, begin/end) are never rewritten; latent for aria-* (no aria in the weather data).
- [LOW] src/components/sf-icon/svg-id-scope.ts:18 — `if (id.endsWith(suffix)) continue` leaves a source id already ending in -sfiN un-renamed; unlikely; re-renders are idempotent.
NOTES:
- npx vitest run (reviewer) → exit 0, 145 files, 1633 passed | 1 skipped.
- O3 cost acceptable (two querySelectorAll after update; no-op for MDI paths); no innerHTML, trusted svg`` templates only, setAttributeNS.
- O6: three callers (sci-fi-climates.ts:148,158,203) want "on"; isClimateNotOff gone; deleted socle O4 test pinned the reversed contract, replaced by ui/O6 + selectors/climate tests.
- O5: only the TS type changes; runtime ignores an extra info key.
- O1: baseline adds only .empty-message (7 properties × cards).
- O4: radial guard sci-fi-tv.ts:441-442 with constants :24-25.
CONFORMANCE EVIDENCE:
- O6 → src/selectors/climate.ts:32,43; O4 → sci-fi-tv.ts:441-442; O5 → tv/config.ts:21 removed; O1 → common.ts:138-147; O2 → sf-radiator.ts:235,364,373, sci-fi-tv.ts:491, sci-fi-tv-editor.ts:136.
