# Code review — behavioural-test-gaps (round 1)

AUDITOR: subagent
PACKET: .sc/review/e71743c-5e057511 (dirty e71743c..worktree)

COVERAGE (must_read.txt is empty: no entry point packaged; rows below are the diff's code files):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/tv/sci-fi-tv.ts | 40-300, 375-470 (all of the dial geometry, template, pointer handlers, throttle) | 611 | no (remote-action half unrelated to the diff not read) |
| tests/cards/tv/sci-fi-tv.test.ts | diff hunks (852-1100) | 1229 | no (diff only) |
| tests/cards/tv/style.test.ts | 1-39 | 39 | yes |
| tests/cards/tv/tv-ids-declared.test.ts | diff hunk | 53 | no |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts | diff hunks | 810 | no |
| tests/cards/hexa-tiles/styles.test.ts | 1-44 | 44 | yes |
| tests/cards/vacuum/sci-fi-vacuum.test.ts | diff hunks (515-530, 665-810) | 810 | no |
| tests/cards/vacuum/styles.test.ts | 1-40 | 40 | yes |
| tests/cards/vacuum/vacuum-ids-declared.test.ts | diff hunk | 79 | no |
| tests/cards/climates/sci-fi-climates.test.ts | diff hunk 734-860 | 860 | no |
| tests/cards/climates/sci-fi-climates-editor.test.ts | diff hunk | 248 | no |
| tests/cards/climates/sf-radiator.test.ts | diff hunk | 355 | no |
| tests/cards/climates/styles.test.ts | 1-40 | 40 | yes |
| tests/cards/lights/sci-fi-lights.test.ts | diff hunk 306-514 | 514 | no |
| tests/cards/lights/sci-fi-lights-editor.test.ts | diff hunk | 332 | no |
| tests/cards/lights/styles.test.ts | 1-42 | 42 | yes |
| tests/cards/plugs/sci-fi-plugs.test.ts | diff hunks | 873 | no |
| tests/cards/plugs/styles.test.ts | 1-43 | 43 | yes |
| tests/cards/stove/styles.test.ts | 1-41 | 41 | yes |
| tests/cards/vehicles/sci-fi-vehicles.test.ts | diff hunks | 591 | no |
| tests/cards/vehicles/styles.test.ts | 1-37 | 37 | yes |
| tests/cards/vehicles/vehicles-ids-declared.test.ts | diff hunk | 147 | no |
| tests/cards/weather/sci-fi-weather.test.ts | diff hunk | 413 | no |
| tests/cards/weather/styles.test.ts | 1-61 | 61 | yes |
| tests/cards/weather/weather-ids-declared.test.ts | diff hunk | 111 | no |
| tests/helpers/blank-comments.ts | 1-66 | 66 | yes |
| tests/helpers/blank-comments.test.ts | 1-25 | 25 | yes |
| docs/specs/behavioural-test-gaps/spec.md | 1-179 | 179 | yes |
| docs/specs/cards/{tv,hexa-tiles,vacuum,climates,lights,vehicles}.md | diff hunks + every remaining no-test marker line (grep) | — | no |

Method: full suite run on a scratch copy (git-initialised so the repo guards run): 127 files, 1585 passed, 1 skipped. Then 90+ mutants applied one at a time on the scratch copy, each run against the test file that claims it (`-t <row id>`); the worktree was never written.

VERDICT: WARNING
SPEC: docs/specs/behavioural-test-gaps/spec.md

FINDINGS:
- [HIGH] tests/cards/hexa-tiles/styles.test.ts:41 — anyone who renames a class in the hexa-tiles sheet still gets a green test, so the sheet can stop styling the tiles while the test says it does — the check is a plain substring `toContain('.hexa-row')`, so `.hexa-rowzz` still satisfies it. This breaks FR-6 (each styles test asserts the sheet styles two classes the card renders) and FR-7 (a row whose mutant survives gets a stronger assertion, not a weaker mutant). The other eight styles tests use the boundary regex `\.<cls>(?![\w-])` and kill the same mutant. BUILD.md:22 records the survivor and accepts it ("IT-BTG-I-03 catches it"). FR-7 does not allow that: the row's own mutant has to die in the row's own test.
  SITES: only tests/cards/hexa-tiles/styles.test.ts:41 (the eight sibling styles tests already use the boundary regex)
  FALSIFIED BY: MUTATION below, `.hexa-row` → `.hexa-rowzz` throughout src/cards/hexa-tiles/styles.ts; TC-BTG-U-24 has to go red
  ROOT: FR-7
  FIX-CLASS: corrects
  Reproduced: `re.sub(r'\.hexa-row(?![\w-])', '.hexa-rowzz')` and `.hexa-tile` → `.hexa-tilex` on the scratch sheet; `vitest run tests/cards/hexa-tiles/styles.test.ts` stays green for both.
  RESOLUTION: fixed — tests/cards/hexa-tiles/styles.test.ts now matches `\.<cls>(?![\w-])` on classes read from the card; `.hexa-rowzz` no longer satisfies it (regex checked: false).
- [HIGH] tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts:806 — an HA theme that does not define `--sf-primary` can lose every hexa-tiles border, label and glow colour without any test noticing — the IT-HEXA-TILES-I-703 assertion skips every bare `var(--sf-primary)`, and removing a fallback produces exactly that string. So the assertion can never catch the defect it exists for. The spec's IT-BTG-I-03 row (Expected: "every `--sf-primary` use has a fallback") is not enforced. The test's own mutant note at :749 ("a --sf-primary fallback removed") names a mutant it does not kill, which breaks FR-7 (every added or retitled test names a mutant it kills). The bare use is only legitimate inside `color-mix()` (styles.ts:168).
  SITES: tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts:806 (the skip); tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts:749 (the mutant claimed)
  FALSIFIED BY: MUTATION below, `border: 2px solid var(--sf-primary, #00d2ff)` → `var(--sf-primary)` in src/cards/hexa-tiles/styles.ts:42; IT-BTG-I-03 has to go red, while the `color-mix(in srgb, var(--sf-primary) 8%, …)` use at :168 stays accepted
  ROOT: FR-7
  FIX-CLASS: corrects
  Reproduced: both the styles.ts:42 and the :171 active-stroke fallback removals stay green under `-t IT-BTG-I-03`.
  RESOLUTION: fixed — IT-BTG-I-03 strips the color-mix() declaration then requires a hex fallback on every remaining var(--sf-primary); with the :42 fallback removed the filter returns ['var(--sf-primary)'] (red), unmutated returns [].
- [MEDIUM] tests/helpers/blank-comments.test.ts:22 — the case labelled "a nested template inside ${...}" cannot fail: with the `${` handling of the scanner disabled entirely, TC-BTG-U-35 stays green. The fixture never puts a comment inside `${…}`, so the nesting behaviour that FR-15 (string-aware comment blanker, `${…}` nested) states is unpinned. A comment such as `` `${ a /* css`x` */ }` `` is the discriminating input (correct scanner gives 0, the mutant 1).
  RESOLUTION: fixed — TC-BTG-U-35 gains two fixtures with a block comment and a line comment inside `${…}` (expected 0 css templates), tests/helpers/blank-comments.test.ts.
- [LOW] docs/specs/cards/hexa-tiles.md:237 — the reader of the spec is told seven of twelve rows are untested and that the test file only carries 706/707, which is now false: this lot removed all seven markers but left the header note stale (tv.md, climates.md and lights.md had theirs updated).
  SITES: docs/specs/cards/hexa-tiles.md:237; docs/specs/cards/vehicles.md:644 ("Une ligne sur vingt-six … s'arrête à IT-VEHICLES-I-1202", now zero rows marked)
  RESOLUTION: fixed — hexa-tiles.md:237 note reworded (no row marked). vehicles.md:644 left as is: tests/cards/vehicles/vehicles-ids-declared.test.ts (TC-VEHOI-U-08) pins the "vingt-six" wording and IT-VEHICLES-I-1203 stays unplayed (IT-TV-I-701/702 class, left out of this lot).
- [LOW] tests/cards/tv/style.test.ts:30 — the tv sheet test never checks that the export is a `CSSResult`, which FR-6 requires of all nine styles tests; the other eight assert `instanceOf(CSSResult)`.
  RESOLUTION: fixed — tests/cards/tv/style.test.ts asserts toBeInstanceOf(CSSResult).
- [LOW] tests/cards/vacuum/styles.test.ts:30 — the class names are typed in the test (`querySelector('.container')`, then read back `classList[0]`), so they are not "read from the card's own rendered DOM … never typed from memory" (FR-6). A card that stops rendering `.container` fails this test for an unrelated reason, and the check is circular. tv/plugs/stove/vehicles/weather pick the classes generically.
  SITES: tests/cards/vacuum/styles.test.ts:30-31; tests/cards/climates/styles.test.ts:31-32; tests/cards/lights/styles.test.ts:33-34; tests/cards/hexa-tiles/styles.test.ts:29-30
  RESOLUTION: fixed — the four styles tests now pick two classes generically from the rendered shadow root (same as tv/plugs/stove/vehicles/weather); 466 tests green.
- [LOW] tests/cards/vehicles/styles.test.ts:19 — the vehicles card is rendered with `makeMockHass({})` (empty `states`), which FR-11 (every new test supplies the entities the card reads; `states: {}` is a defect of the test) names as a test defect. It renders today only because the config names no entity, so the classes read come from a degenerate card rather than a populated one.
  RESOLUTION: fixed — tests/cards/vehicles/styles.test.ts supplies a state entity in makeMockHass.

MUTATION: tests/cards/hexa-tiles/styles.test.ts — `.hexa-row` renamed `.hexa-rowzz` throughout src/cards/hexa-tiles/styles.ts — SURVIVED
MUTATION: tests/cards/hexa-tiles/styles.test.ts — `.hexa-tile` renamed `.hexa-tilex` throughout src/cards/hexa-tiles/styles.ts — SURVIVED
MUTATION: tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts — `--sf-primary` fallback removed at src/cards/hexa-tiles/styles.ts:42 — SURVIVED
MUTATION: tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts — `--sf-primary` fallback removed on the active border stroke src/cards/hexa-tiles/styles.ts:171 — SURVIVED
MUTATION: tests/helpers/blank-comments.test.ts — `${` nesting branch of blankComments disabled — SURVIVED
MUTATION: tv `thetaDeg - 135` → `+ 135` (today's code) — KILLED by TC-BTG-U-01, TC-BTG-U-02, TC-BTG-U-21, TC-BTG-U-22
MUTATION: tv clamp `> 315` → `> 290` — KILLED by TC-BTG-U-01
MUTATION: tv clamp removed — KILLED by TC-BTG-U-01
MUTATION: tv drop bbox.left — KILLED by TC-BTG-U-02
MUTATION: tv drop bbox.top — KILLED by TC-BTG-U-02
MUTATION: tv scale 200 → 100 — KILLED by TC-BTG-U-02
MUTATION: tv bbox.left used for y — KILLED by TC-BTG-U-02
MUTATION: tv zero-size guard removed — KILLED by TC-BTG-U-20
MUTATION: tv move-time liveness guard removed — KILLED by TC-BTG-U-21
MUTATION: tv volume entity always `entity` — KILLED by IT-BTG-I-01
MUTATION: tv pointerdown off-guard removed — KILLED by IT-BTG-I-01
MUTATION: tv throttle 80 → 40 — KILLED by IT-BTG-I-02
MUTATION: tv throttle 80 → 0 — KILLED by IT-BTG-I-02
MUTATION: tv throttle 80 → 81 — KILLED by IT-BTG-I-02
MUTATION: tv radial guard r < 60 added — KILLED by TC-BTG-U-22
MUTATION: tv dial title through unsafeHTML — KILLED by TC-BTG-U-33
MUTATION: hexa header from first person.* — KILLED by TC-BTG-U-04
MUTATION: hexa zone icon lookup dropped — KILLED by TC-BTG-U-04
MUTATION: hexa banner rendered on green — KILLED by TC-BTG-U-05
MUTATION: hexa data-active inverted — KILLED by TC-BTG-U-05
MUTATION: hexa yellow/orange swapped — KILLED by TC-BTG-U-03
MUTATION: hexa data-alert-level hard-coded green — KILLED by TC-BTG-U-03
MUTATION: hexa data-alert-level not written — KILLED by TC-BTG-U-03
MUTATION: hexa unmapped state → yellow — KILLED by TC-BTG-U-03
MUTATION: hexa `+ 0.5` → `+ 1` — KILLED by IT-BTG-I-03
MUTATION: hexa row overlap dropped — KILLED by IT-BTG-I-03
MUTATION: hexa active border drop-shadow dropped — KILLED by IT-BTG-I-03
MUTATION: hexa label text-shadow dropped — KILLED by IT-BTG-I-03
MUTATION: hexa yellow stroke uses --sf-orange — KILLED by IT-BTG-I-03
MUTATION: vacuum `< 20` → `<= 20` — KILLED by TC-BTG-U-06
MUTATION: vacuum `< 30` → `<= 30` — KILLED by TC-BTG-U-06
MUTATION: vacuum battery classes swapped — KILLED by TC-BTG-U-06
MUTATION: vacuum class on icon only — KILLED by TC-BTG-U-06
MUTATION: vacuum unit dropped — KILLED by TC-BTG-U-06
MUTATION: vacuum default battery icon changed — KILLED by TC-BTG-U-06
MUTATION: vacuum entity battery icon ignored — KILLED by TC-BTG-U-06
MUTATION: vacuum mop default icon → mdi:battery — KILLED by TC-BTG-U-07
MUTATION: vacuum mop unit appended — KILLED by TC-BTG-U-07
MUTATION: vacuum mop rendered when absent — KILLED by TC-BTG-U-07
MUTATION: vacuum name through unsafeHTML — KILLED by TC-BTG-U-34
MUTATION: inline css` block added to sci-fi-vacuum.ts (plain, and after a '//' string) — KILLED by TC-BTG-U-32
MUTATION: inline css` block added to sci-fi-plugs.ts (plain, and after a '//' string) — KILLED by TC-BTG-U-15
MUTATION: inline css` block added to sci-fi-vehicles.ts (plain, and after a '//' string) — KILLED by TC-BTG-U-31
MUTATION: blankComments string tracking disabled — KILLED by TC-BTG-U-35
MUTATION: blankComments template tracking disabled — KILLED by TC-BTG-U-35
MUTATION: blankComments replaced by a line-regex blanker — KILLED by TC-BTG-U-35
MUTATION: weather normalizeChartKind `in` instead of hasOwnProperty — KILLED by TC-BTG-U-17
MUTATION: weather normalizeChartKind identity — KILLED by TC-BTG-U-17
MUTATION: climates header read unguarded — KILLED by TC-BTG-U-08
MUTATION: climates state icon override ignored — KILLED by TC-BTG-U-09
MUTATION: climates state colour override ignored — KILLED by TC-BTG-U-09
MUTATION: climates heat override applied to every state — KILLED by TC-BTG-U-09
MUTATION: base-card shouldUpdate false on hass change — KILLED by IT-BTG-I-04, IT-LIGHTS-I-002
MUTATION: climates editor exclude-remove event not fired — KILLED by IT-BTG-I-05
MUTATION: climates editor wrong key — KILLED by IT-BTG-I-05
MUTATION: climates editor splice wrong index — KILLED by IT-BTG-I-05
MUTATION: radiator unmapped fallback to placeholder icon — KILLED by sf-radiator "falls back to the off icon and colour for an unmapped preset" (TC-BTG-U-19 audit)
MUTATION: lights empty-state not rendered — KILLED by TC-BTG-U-10
MUTATION: lights ignored_entities not applied — KILLED by TC-BTG-U-12
MUTATION: lights name priority swapped — KILLED by TC-BTG-U-12
MUTATION: lights floor chosen by light count first — KILLED by TC-BTG-U-11
MUTATION: lights getRelevantEntities every domain — KILLED by TC-BTG-U-13
MUTATION: lights getRelevantEntities ignores ignored_entities — KILLED by TC-BTG-U-13
MUTATION: lights floor click ignored — KILLED by IT-BTG-I-06
MUTATION: lights editor icon_on dropped — KILLED by IT-LIGHTS-I-003
MUTATION: `.header` / `.light-btn` renamed and `:host` dropped in the tv, vacuum, climates, lights, plugs, stove, vehicles, weather sheets — KILLED by TC-BTG-U-23, -25, -26, -27, -14, -28, -29, -30

NOTES:
- Equivalent mutants (not recorded as survivors): the vacuum "drop the NaN guard" mutant (TC-BTG-U-06 Mutant column) cannot change behaviour, because `NaN < 20` and `NaN < 30` are both false (BUILD.md:23 says the same). Changing the `#ffd60a` fallback of the yellow stroke is invisible because the common sheet defines `--sf-warning`. The spec's Mutant column for TC-BTG-U-06 still lists the NaN guard; an author may want to strike it.
- lights icon priority (`haIcon` before `custom_entities.icon_on`) survives TC-BTG-U-12 because no fixture light carries an HA `icon` attribute. The spec pins only the NAME priority, so this is not a defect of the row.
- The setConfig path of lights assigns `first_floor_to_render` directly, so the in-render "resolve by id" branch is dead for TC-BTG-U-11's fixture. The spec's mutant (select by light count) is killed.
- The `*-ids-declared` widening (tv, vehicles, weather: the same `lotIds()` reader copied three times; vacuum: a prefix allow-list) is declared by BUILD and keeps the guard meaningful: lot ids must still be row heads of the lot spec.
- The template comment `opening at bottom-center: starts -135deg` (src/cards/tv/sci-fi-tv.ts, dial-track) is pre-existing and math-convention; it is not in the diff.

CONFORMANCE EVIDENCE:
- FR-1 (pointer angle maps to the rendered dial): src/cards/tv/sci-fi-tv.ts:438 `(thetaDeg - 135 + 360) % 360`. Checked against the arc `M 46.97 153.03 A 75 75 0 1 1 153.03 153.03` (sweep clockwise in y-down: bottom-left → left → top → right → bottom-right) and against `computeDialGeometry` (:63-72, satellite at 225° − v·270°): the start gives 0, left 0.17, top 0.5, right 0.83, the end 1; the 60 % point (134.05, 33.17) gives 0.6. The clamp and rounding are unchanged (:441-443).
- FR-12 (no call when the dial box is zero-sized): :427 `if (bbox.width === 0 || bbox.height === 0) return;` comes before any write to `_localVolume` or service call.
- FR-13 (no call from a move after the TV went off): :397-398 apply the same liveness test as `_onPointerDown` (:383-384), return before `_handleDrag`, and leave `_isDragging` set.
- FR-2 (real pointer events): tests dispatch PointerEvent on `.dial-svg` with getBoundingClientRect stubbed (sci-fi-tv.test.ts dial-drag describe); no direct `_handleDrag`/`_throttleVolumeCall` call remains; only square boxes are used.
- FR-10 (each lot id in exactly one title): every TC-BTG/IT-BTG id that adds or retitles a test appears in exactly one title (grep count = 1 for 38 ids; 16, 18 and 19 are cited in comments only, as the exemption allows). The no-test marker is left only on tv IT-TV-I-701/702 among the five card tables. The full suite is green.
- FR-16 (strings render as text): TC-BTG-U-33/34 check a benign marker before the hostile string, and an unsafeHTML mutant kills both.
