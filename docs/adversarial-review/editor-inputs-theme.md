# Adversarial review: editor-inputs-theme

Spec: docs/specs/editor-inputs-theme/spec.md. Regime: fan-out (the user's choice). Three lenses ran: Security, User and Scope. They ran on sonnet, a different model from the opus author. Round 1.

The user took these decisions on 2026-11-05, and this review does not reopen them: D1, D2, D3, D4, and the water-card accordion losing HA theme chaining.

Lens verdicts: Security CLAIM_OVERSTATED, User CLAIM_OVERSTATED, Scope CLAIM_OVERSTATED.

## Cross-synthesis

- **Convergence (Security and User).** The byte-equality proofs in FR-7, FR-8, IT-EIT-I-01 and IT-EIT-I-02 rest on a `var()` substitution the spec never defines. The values contain nested parentheses. The harness has no `var()` handling at all: it exports only `flattenStyles`, `foldCss` and `diffFolded`. A naive substitution corrupts the baseline and the port in the same way, and the test passes green.
- **Convergence (all three lenses).** The IT-EIT-I-03 test checks FR-10 by matching a string in files under the `*-editor.ts` glob. The water card is named only as a Residual inside an Assumption cell.
- **Pattern.** Several proofs cannot fail:
  - no negative controls;
  - a self-attested baseline;
  - the FR-3 colour scanner is narrower than the invariant it enforces.
- **Blind spots.** ADR-018 still says the input:44 and slider:35 sites stay raw literals. The Carriers table covers only FR-1 and FR-4.

## Stress-test

The design holds: tokens are declared at the pre-port inline expression, inputs use literal fallbacks, and each component's folded CSS is compared with a baseline. The inventory is accurate: the grep was re-measured at 109 hits, and 11 of 11 editors were checked. The proof does not hold as written. A builder has to invent the substitution procedure. Without negative controls and a baseline tied to the base commit, a green IT-EIT-I-01 or IT-EIT-I-02 shows nothing.

Verdict: 1 HIGH, 7 MEDIUM and 4 LOW findings, all to close in the spec. F-12 is the user's water-card decision. The fix round should write it into the spec as an FR row. None of the other findings needs a new user decision.

## Findings

- [HIGH] — F-01 `var()` substitution for FR-7/FR-8 undefined: nested-paren values (`var(--primary-color, #00d2ff)`, `rgba(...)`), accordion `--_*` inlining procedure unstated, harness has no var() handling; a naive regex mangles baseline and port alike and stays green (FR-7, FR-8, IT-EIT-I-01, IT-EIT-I-02) [RESOLVED] TC-EIT-U-06 — spec § Resolver defines the depth-counting resolver and its three modes
- [MEDIUM] — F-02 No negative control: no fixture proves the scanners and the substitution go red on a bad port (mutated fallback, mutated declared value) (TC-EIT-U-02, IT-EIT-I-01) [RESOLVED] IT-EIT-I-04 — mutation controls; scanner controls in TC-EIT-U-07
- [MEDIUM] — F-03 Baseline self-attested: nothing binds `editor-inputs-css-baseline.json` to the base commit; regenerated from ported sheets, I-01/I-02 stay green (TC preamble) [RESOLVED] IT-EIT-I-05 — baseCommit 5251aa3 recorded and tree-bound
- [MEDIUM] — F-04 FR-3 colour scan narrower than its invariant: `hsl(`, 8-digit hex, named colours, `color(`/`oklch(`, `${}` interpolation in a css block pass unseen; interpolation can hide a direct HA var from FR-2 (FR-2, FR-3, TC-EIT-U-02) [RESOLVED] TC-EIT-U-07 — FR-3 colour-literal set widened, FR-2 forbids `${`
- [MEDIUM] — F-05 IT-EIT-I-03 proves the identifier appears in the source, not that it sits in `static styles`; an unused import or a comment passes (FR-10) [RESOLVED] IT-EIT-I-03 — now reads the `static styles` initializer of comment-blanked source
- [MEDIUM] — F-06 FR-9/TC-EIT-U-05 promise a hint/secondary distinction that exists only on the fallback path; under a theme defining `--secondary-text-color` both resolve alike (pre-port behaviour, wording overstated) [RESOLVED] TC-EIT-U-05 — FR-9 reworded: distinction on the fallback path only, as pre-port
- [MEDIUM] — F-07 ADR-018:67-72 still says input:44 and slider:35 stay raw literals; no FR amends the ADR (spec cites it as source) [CONTRACT] [RESOLVED] TC-EIT-U-08 — FR-13 + ADR-018 addendum 2026-11-05; "rule 4" citation corrected
- [MEDIUM] — F-08 Carriers & Consumers covers only FR-1/FR-4; touched files (test, baseline JSON, spec 03) and read-only harness `css-equivalence.ts` unnamed [RESOLVED] IT-EIT-I-01 — Carriers table now covers FR-1..FR-13, test, baseline, harness, spec 03, ADR
- [LOW] — F-09 FR-10 says "every card editor that renders `<sf-editor-*>`" but IT-EIT-I-03 scans only `src/cards/**/*-editor.ts`; the water card and any future non-glob mount are implicit (widen to every `src/**` mount with an explicit water-card allow entry) [RESOLVED] IT-EIT-I-03 — scans every src/** mount, water card as the single allow entry
- [LOW] — F-10 New generic names (`--editor-radius`, `--editor-border-width`, `--editor-text`) sit beside `--editor-border` with no consumer note; no assertion that no token is declared twice with different values (FR-1, TC-EIT-U-03) [RESOLVED] TC-EIT-U-03 — asserts no duplicate declaration; consumer note above the Token table
- [LOW] — F-11 FR-3 does not say the accordion gradient stops (:91-92) are covered via `--editor-accordion-shade-*` fallbacks [RESOLVED] TC-EIT-U-02 — FR-3 now names the gradient stops and their shade tokens
- [LOW] — F-12 The water-card accordion loses HA theme chaining, and this appears only as a Residual in Assumption 2. No FR row writes the decision. The user already accepted it on 2026-11-05, so the fix round should write it into the spec as an FR row. [ACCEPTED: spec FR-12]

## Hostile-Input Checklist

- HIC-1 unbounded-input: N/A — static CSS constants and a repo-source scanner, no runtime input, count or range
- HIC-2 stored-string: N/A — nothing user-supplied is stored or emitted; tokens are checked-in constants
- HIC-3 injection: FINDING F-04
- HIC-4 bootstrap-authz: N/A — no authentication, no mutating route; a stylesheet port
- HIC-5 malformed-oversized: FINDING F-01
- HIC-6 numeric-edge: N/A — the only numerics are fixed px and alpha literals copied verbatim from pre-port sources

## Builder check

One cold builder (sonnet, foreground, spec only), 2026-11-05: 10 questions.

### Answered
- Q1 accordion `--_*` pre-port values vs Declared column: spec § Build notes 1, § Resolver (one pass suffices).
- Q2 fallback-mode re-scan contradiction: spec § Resolver, paragraph after folding order.
- Q3 whitespace normalisation by `foldCss`: spec § Resolver, folding-order paragraph.
- Q4b / Q9 `--editor-chip-bg` existing value untouched: spec § Build notes 3.
- Q5 water card adds no accordion style: spec § Build notes 6.
- Q8 no hsl/named/8-hex colour at base: spec § Build notes 5.
- Q10 spec 03 anchors: FR-11 already names the heading; locate by heading (no change).

### My calls
- Q3 a site literal differing from its table row is a spec defect, never picked: spec § Build notes 2.
- Q4a non-colour literals of non-accordion inputs stay literal: spec § Build notes 4.
- Q6 baseline committed alone in a WIP commit; ci.yml `fetch-depth: 0`: spec § Build notes 8, Carriers row.
- Q7 I-03 count as measured snapshot, rule-based check: spec § Build notes 7.

### Theirs
none
