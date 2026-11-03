# Adversarial review: sf-token-declarations

Spec: docs/specs/sf-token-declarations/spec.md. Regime: fan-out (user's pick), 3 lenses (Security, User, Scope) on opus, cross-model against the sonnet author, round 1 of 2. Decisions already taken by the user and not relitigated: `--sf-border-light` declared alias of `--sf-bg-tertiary`; `--sf-bg-tile` validated; card-mod limit (inherited `--sf-text-*` override lost) accepted.

Verdicts: Security CLAIM_BROKEN, User CLAIM_OVERSTATED, Scope CLAIM_OVERSTATED.

## Cross-synthesis

- Convergence (3/3 lenses, re-measured independently): the partition of the 36 undeclared names is wrong. 11 become declared (the new `--sf-bg-tile` is not one of the 36), 4 are hooks, 21 are open card names, not 17; FR-2's own breakdown sums to 22 because `--sf-glow-cyan` is listed under tv and bridge.
- Convergence (2/3, Security and User): the drift guard (FR-4/FR-5) decides inclusion per class, but most card sheets are class-less style modules, so they are exempt and `OPEN_DRIFT` would be empty.
- Pattern: several proofs cannot fail (happy-dom computed styles never used in `tests/`, a self-generated `OPEN_DRIFT`, bead ids checked by shape only).
- Blind spot: FR-10 and FR-9's comment line have no TC row; the file list names a file no FR edits.

## Stress-test

The spec's design holds (declare at the current rendered value, ratchet allow-lists, chain-based inclusion). It does not hold as written on its numbers and on two proofs: a builder following FR-2 literally ends with a red TC-SFT-U-03, and the zero-visual-change claim for the component sheets rests on an unproven happy-dom behaviour. Verdict: 4 HIGH, 6 MEDIUM, 3 LOW to close in the spec; none needs a new user decision (the single `--sf-glow-cyan` owner is a builder call).

## Findings

- [HIGH] — F-01 Open-name counts wrong: 12+4+17=33 not 36; the open names are 21 (`--sf-glow-cyan` shared by tv and bridge), 11 names declared plus the new `--sf-bg-tile` (spec.md:33, FR-2, FR-9, TC-SFT-U-03) [RESOLVED] Overview recounted 11 declared + new `--sf-bg-tile`, 4 hooks, 21 open names, `--sf-glow-cyan` keyed once (3z0j, also yj6); pinned in TC-SFT-U-03.
- [HIGH] — F-02 Drift guard fails open: class-less card style modules are exempt, so `OPEN_DRIFT` would be empty and card sheets unpoliced (FR-4, FR-5, Error Handling) [RESOLVED] FR-5 resolves class-less sheets through their importing classes, an unimported sheet is policed; fixture and real-tree case in TC-SFT-U-04, Error Handling row added.
- [HIGH] — F-03 Zero-change proof for the component sheets cannot fail: the card baseline folds only the 11 card tags, and happy-dom `var()` inheritance through `:host` is unproven (IT-SFT-I-02, FR-8, Assumption 2) [RESOLVED] IT-SFT-I-02 now opens with an inheritance canary and runs before/after on every touched component (not only the 11 tags); canary failure has an Error Handling row.
- [HIGH] — F-04 FR-10 has no TC row (no Covers cell cites it) [RESOLVED] IT-SFT-I-05 covers FR-10.
- [MEDIUM] — F-05 Allow-lists check only the shape of a bead id and have no size bound; `OPEN_DRIFT.max` can be raised freely (FR-2, FR-4, TC-SFT-U-03) [RESOLVED] FR-2/FR-4 bound the tables: exact `max`, family bead rule, bead ids limited to the 8, reason length cap; TC-SFT-U-06.
- [MEDIUM] — F-06 One stray `--sf-x:` anywhere in `src/` (inline `style=`, a string, another card's sheet) makes the name "declared" for every file; the limit is unstated and unpinned (FR-1, declared-set stays global) [RESOLVED] FR-1 scopes the declaration scan to css blocks and inline style, states the global limit; TC-SFT-U-07 pins it.
- [MEDIUM] — F-07 `OPEN_DRIFT` is ~70 entries generated at BUILD, with no key restriction (a socle drift could be allow-listed) and no bead-assignment rule (FR-4) [RESOLVED] FR-4 restricts keys to `src/cards/` files and `common.ts` tokens, with the family bead rule; TC-SFT-U-06.
- [MEDIUM] — F-08 The drift guard (FR-4) is extra scope beyond bead 5wj and no decision line authorises it [FALSE] Decision 1 of the Overview already scopes "the hardening of TC-307", and the follow-up bead titles (7ge9 "replis ... qui derivent", yj6 "replis qui derivent") show the drifts are the 5wj family; wording now says FR-4 is that hardening.
- [MEDIUM] — F-09 `src/components/sf-dropdown.ts` is in the expected-diff list but no FR edits it [RESOLVED] removed from the expected-diff list in Builder Calls; FR-3 and TC-SFT-U-04 assert it is left unchanged.
- [MEDIUM] — F-10 The documented card-mod workaround ("set it on the host element") is false for nested `sf-*` components that re-declare the tokens on their own `:host`; HA themes are the same ancestor case (Assumption 4, Error Handling row). The limit itself is the user's accepted decision. [ACCEPTED: spec FR-11] FR-11 carries the user's decision of 2026-11-03 with the corrected wording on nested sf-* components.
- [LOW] — F-11 FR-3 says every touched fallback is character-identical to the declaration, yet the `--sf-border-light` site keeps a literal while the declaration is `var(--sf-bg-tertiary)` (terminal-literal rule of FR-4 applies) [RESOLVED] TC-SFT-U-04 (wording fixed in the requirement: equals the declared value or its terminal literal; the dropdown site is kept by design).
- [LOW] — F-12 `blankComments` treats `//` inside a CSS template literal (`url(//cdn/x.png) var(--sf-ghost, red)`) as a comment and hides the reference; no fixture (TC-SFT-U-01) [RESOLVED] `//` fixture added to TC-SFT-U-01.
- [LOW] — F-13 FR-7 hedges "if the file lists one" for a TC-307 row that exists (`03_base_classes.md:295`); FR-9's "first line of the `OPEN_CARD_NAMES` comment points to the 8 follow-up beads" has no test [RESOLVED] FR-7 names line 295 without hedge (checked in IT-SFT-I-04); the comment line is pinned by TC-SFT-U-08.

## Hostile-Input Checklist

- HIC-1 unbounded-input: FINDING F-05
- HIC-2 stored-string: N/A — nothing user-supplied is stored or emitted, the scanner reads repo sources only
- HIC-3 injection: N/A — no interpreter, shell, filesystem or URL sink; the guard reads checked-in files and the CSS custom properties are declared constants
- HIC-4 bootstrap-authz: N/A — no authentication, no mutating route, a static front-end guard and stylesheet constants
- HIC-5 malformed-oversized: FINDING F-12
- HIC-6 numeric-edge: N/A — the only numerics are fixed px constants and the `max` site count, bounded by F-05

## Builder check

One cold sub-agent read the settled spec only (22 items).

### Answered
Values and names of FR-3, dead-fallback table, bead per family and `also`, class-less sheets (FR-5), baseline command (FR-8), rem out of scope, docs edits (FR-7, FR-11), derived counts, unreadable `extends` row.

### My calls
Test file placement and parameterised scanner; regex parsing without AST; multi-class file exempt only if all classes include; locally redeclared token skipped by FR-4; the 11 settled names as a fixture list with derived counts; bead ids as a constant matched against References; `also` optional string; `OPEN_DRIFT` generated then reviewed against the bounds; re-grep of drifting line numbers; minimal happy-dom wrapper for IT-SFT-I-02. All written into the spec Builder Calls.

### Theirs
Four items raised: (1) repo ids guard missing from the file list: checked, `ids-cas-uniques.test.ts` lists no feature-spec directory, ruled as my call (BUILD adds a file if one needs it); (2) re-measure delta and (3) open name read by a socle file: ruled as my call, BUILD stops and amends the spec; (4) `--sf-bg-tile` naming: already validated by the user. No question for the user.
