# Adversarial review — i18n-hardcoded-fr

Spec: `docs/specs/i18n-hardcoded-fr/spec.md` (base `81c9d31`). Lane feature, lenses Security, User, Scope, regime fan-out, each lens on `opus` (author is sonnet: cross-model). Packet `.sc/review/81c9d31-83101326`. All three lenses returned CLAIM_OVERSTATED; none found the census materially wrong (29 accented + 7 unaccented confirmed independently by two lenses). Nothing is fixed at this step: every finding below is UNRESOLVED.

Verdict: 13 findings, 0 CRITICAL, 3 HIGH, 7 MEDIUM, 3 LOW. The weak points are the guard as a verifier (F-01, F-04, F-05, F-11), two spec statements that are false against the tree (F-02, F-03, F-12) and two project rules the spec never cites (F-08, F-09).

## Cross-synthesis

| Signal | Findings | Lenses |
|---|---|---|
| Convergence | F-01 (guard misses `title="${c ? 'x' : 'Tout allumer'}"`, the very census item) | Security, User, Scope |
| Convergence | F-11 / FR-13 (known misses hidden behind an accepted limit) | User, Scope |
| Convergence | F-12 (302 vs 326, raw hit counts off) | Security, Scope |
| Tension | F-10 (user-facing consistency) vs the author's French wording table | User |
| Pattern | spec states facts about the tree without a measuring test: F-02, F-03, F-12 | all |
| Blind spot | project rule AP6 of spec 09 (ternary of two msg) and the IT-901 test body | Scope only |
| Clean | injection through `${label}` (lit text binding, escaped), `updateWhenLocaleChanges` lifecycle (controller removes its listener), `<x id>` placeholder runtime mapping works | Security |

## Stress-test

Hostile critic over the lens signals: the guard is the lot's main deliverable and it is validated only against one-line inline fixtures of its own shapes (F-01, F-05). It would have passed with the census item `'Tout allumer'` reverted, and returns zero on the real tree whether or not it parses anything. FR-13 as written accepts "unknown" misses while two misses are known today (F-01, F-11), so the acceptance is not honest as it stands. The cheapest repair keeps the design: add the attribute-expression and text-expression string sinks, add a positive control on real pre-fix files (`git show 81c9d31:...`), fail on parse diagnostics. The catalogue and placeholder handling are sound once the target form is pinned (F-06). Verdict: the spec is fixable inside SPEC without redesign; the divergence signal does not apply (round 1).

## Findings

[HIGH] — F-01 The guard misses the census item it was built for: `title="${houseActive ? 'Tout éteindre' : 'Tout allumer'}"` (sci-fi-lights.ts:184) is a string literal in an attribute expression, outside every FR-1 sink; neither `tout` nor `allumer` is on the word list, and TC-I18N-U-02 tests `'Tout allumer'` only in the `_showToast` shape. Same blind spot for `${c ? html\`…\` : 'Aucune lumiere'}` text expressions. Fix: add as sink any string literal that is the whole expression or a ternary/`??`/`||` branch of an `html` attribute or text binding, and a TC row with those fixtures. [RESOLVED] TC-I18N-U-14

[HIGH] — F-02 FR-9 and TC-I18N-U-11 require every census source to have a `<target>` different from its `<source>`, but Builder Calls gives `Entity ID (data.entity_id)` → "same text", and the reused `Action` has target `Action` (fr.xlf:1071). The builder either fails the test or invents wording. Fix: give a real French (`ID d'entité (data.entity_id)`) and limit TC-I18N-U-11 to new sources. [RESOLVED] TC-I18N-U-11

[HIGH] — F-03 FR-11 says the default `'fr'` means "no existing test changes", but three existing tests assert French that becomes `msg()`: tests/cards/lights/sci-fi-lights.test.ts:50 (`Aucun étage configuré`), tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts:591 and :601 (`Alerte météo`, TC-HEXA-TILES-U-706/707). The card setter loads the locale fire-and-forget (base-card.ts:40-46) and Lit starts at `en`, so they go red or flaky. Fix: FR-11 lists them and requires `await setLocale('fr')` before mount, with a TC row. [RESOLVED] TC-I18N-U-15

[MEDIUM] — F-04 FR-1.1 uses bare `git ls-files src`, against the repo idiom (`-co --exclude-standard`, blueprint-traceability.test.ts:43-50): a new untracked src file makes TC-I18N-U-03 red in BUILD for an unrelated reason, or tempts the builder to weaken the equality. Fix: `git ls-files -co --exclude-standard src`. [RESOLVED] TC-I18N-U-16

[MEDIUM] — F-05 Silent zero: TC-I18N-U-03 passes on zero findings from a detector that parses nothing or whose attribute regex does not span newlines; `ts.createSourceFile` never throws and the spec requires no `parseDiagnostics` check or visited-literal count. Fix: non-empty parse diagnostics is a failure, the guard reports the visited count, and a positive control runs the detector on `git show 81c9d31:` copies of sci-fi-lights.ts and sf-editor-source-list.ts and requires at least the census count per file. [RESOLVED] TC-I18N-U-17

[MEDIUM] — F-06 Placeholders: Builder Calls gives the French with a literal `${label}` / `${actionId}`, but the xliff target must carry `<x id="0" equiv-text="${label}"/>` (fr.xlf:1193-1194); a literal text target renders `${label}` in French and TC-I18N-U-11 (non-empty, differs) passes it. Fix: state the form in Builder Calls and add to TC-I18N-U-11 that each target holds the same `<x id>` set as its source. [RESOLVED] TC-I18N-U-18

[MEDIUM] — F-07 The census omits the second dead fallback the bead names: `this.getSectionTitle('section-title-tv') ?? 'Configuration TV'` (sci-fi-tv-editor.ts:141), French word order, no accent, not on the list. Fix: FR-6 removes it too (dead for the same reason as `'Sources'`) and TC-I18N-U-08 asserts its absence; census 42. [RESOLVED] TC-I18N-U-08

[MEDIUM] — F-08 Seven FR-2 pairs are `isOn ? 'A' : 'B'` and become `cond ? msg('A') : msg('B')`, which spec 09 anti-pattern 6 forbids (Terser collapse breaks the XLIFF; the tuple lookup is used at sci-fi-tv.ts:554 and water:694,703). Vitest runs source, not the bundle, so no test sees it. Fix: add anti-pattern 7 and an AST check that no census file has a conditional whose both branches are `msg()` calls. [RESOLVED] TC-I18N-U-19

[MEDIUM] — F-09 FR-10 rewrites the `IT-901` row to promise translated card strings, but the test carrying that id (tests/dev/workbench.test.ts:185-195) still asserts only `hass.language`; the row promises what its test does not check. Fix: the row's Expected cites IT-I18N-I-01 as proof (or the test asserts the header text); TC-I18N-U-13 checks the pointer. [RESOLVED] TC-I18N-U-13

[MEDIUM] — F-10 New tv keys bake `(optional)` into the source (`Volume entity (optional)`), while the neighbouring remote row composes `getLabel('input-remote-entity') + ' ' + getLabel('text-optional')` (sci-fi-tv-editor.ts:203), and the catalogue writes `(ex: water)` with no space while the spec writes `ex : `: a French user sees two conventions in one editor. Fix: keys `Volume entity` / `Application entity` composed with `text-optional`, and one `ex:` convention recorded in Builder Calls. [RESOLVED] TC-I18N-U-08

[LOW] — F-11 FR-13 `ACCEPTED-LIMIT` is outside its grammar ("author's call, to be confirmed" is not a decision) and hides misses known today: `label="Bouton ${actionId}"` (tv-editor:241) is a static attribute but `bouton` is not on the list; plus F-01. Assumption 7 validates against FR-13 itself (circular). Fix: add `tout`/`bouton` or name the two uncovered census shapes in FR-13, add a TC row for the documented misses, put the deciding person in the tag. [RESOLVED] TC-I18N-U-14

[LOW] — F-12 Numbers false on the base: `xliff/fr.xlf` and `fr.js` hold 326 units, not 302 (302 is the bead's; 24 orphans `localize-extract` would drop, so the "~335" growth and IT-I18N-I-04 expectations mismatch); raw hits are 34 (29 + 5 comments), not 33; "33 distinct new or reused sources" is 33 new plus 7 reused. No `N/A` unit exists in fr.xlf. Fix: correct in place and let TC-I18N-U-11 assert the count against the independent unique `msg()` id count only. [RESOLVED] TC-I18N-U-11

[LOW] — F-13 FR-1 has no sanctioned exemption for an accented literal that is data, not copy (a French HA state value), and anti-pattern 5 forbids an ignore list; the maintainer's only exit is moving the data to `src/locales/`. Also the guard failure message gives no remedy hint. Fix: one rule in FR-1 (data constants live at a named path, or a marker) plus a non-finding fixture, and the remedy hint in the failure text. [RESOLVED] TC-I18N-U-20

## Hostile-Input Checklist

HIC-1 N/A — no range, count, pagination or request body: the guard scans a fixed file set from the repository
HIC-2 N/A — no user string is stored; the only runtime value interpolated is an entity attribute key inside msg(str`…`) rendered as an escaped lit text binding (Security lens verified, no unsafeHTML in src)
HIC-3 N/A — no SQL, shell, URL scheme or redirect sink; the detector reads source text with the TypeScript parser and never evaluates it
HIC-4 N/A — no authentication, no mutating route, nothing to bootstrap
HIC-5 FINDING F-05
HIC-6 N/A — no numeric or enum field in the lot; counts are compared as integers in tests (see F-12 for the stale counts)

## Builder check

Cold builder (opus, spec only): census arithmetic confirmed (37 + 5 = 42; 40 sources, 33 new + 7 reused). Five questions.

### Answered

- Q4 (components via `msg()` or a prop): the user's earlier ruling, now stated in Builder Calls.

### My calls

- Q1 pre-fix controls depend on `git show 81c9d31` (shallow CI): committed snapshots `tests/i18n/fixtures/pre-fix/*.ts.txt`; FR-1.2, TC-I18N-U-17, Builder Calls changed.
- Q2 FR-1 (zero findings) against FR-12 (do not fix out-of-census): a real-tree hit is fixed in the diff and listed as a census addition; Builder Calls.
- Q3 unique-id count and extract additions: compiler-based source count, no lit hash; out-of-census units added by extract get target = source; Builder Calls.
- Q5 which line of hexa-tiles.md may hold the French example: the `**Result:**` line; Builder Calls.

### Theirs

none
