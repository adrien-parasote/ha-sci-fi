AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| docs/specs/editor-inputs-theme/spec.md | 1-224 | 224 | yes |
| tests/styles/editor-inputs-theme.test.ts | 1-456 | 456 | yes |
| .github/workflows/ci.yml | all | 38 | yes |
| src/styles/editor-inputs-shared.ts | 1-80 | 80 | yes |
| src/styles/editor-common.ts | diff hunk | — | diff only |
(must_read.txt empty — no entry point packaged.)
Packet: .sc/review/9fe8572-c6d0436d. Test run: `vitest run tests/styles/editor-inputs-theme.test.ts` — 31/31 pass.

VERDICT: BLOCK
SPEC: docs/specs/editor-inputs-theme/spec.md

### Spec limit F-01 — holds
F-01 (var() substitution must be depth-counting, not a regex): tests/styles/editor-inputs-theme.test.ts:134-149 `parseVarAt` counts paren depth and splits on the first depth-1 comma; resolveVars :187-221 implements the three modes, rescan from i only in fallback (:218); U-06 fixtures :343-350 cover nested rgba and nested var. Scope: every call site (I-01, I-02, I-04, U-02, U-03) goes through it.

FINDINGS:
- [HIGH] tests/styles/editor-inputs-theme.test.ts:450 — once this lot is delivered the way every previous lot was (main carries one squashed `feat(...)` commit per feature, then a merge: 5251aa3 <- cd9d843, 01300ca <- 3627bc4; no `wip(` commit exists on main), the commit that "last added" the baseline JSON is the squashed commit whose tree holds the PORTED sources, so IT-EIT-I-05 (baseline bound to its base commit) fails on main and every later PR CI run goes red — or someone deletes the test. Today it is green only because the stage-labelled WIP commit 7899ad2 still exists on the branch. In the diff (IN-DIFF). The spec's binding (§ Build notes 8, IT-EIT-I-05) assumes the WIP commit survives; the code does not hold under the repo's delivery path.
  SITES: tests/styles/editor-inputs-theme.test.ts:450-454
         .github/workflows/ci.yml:15-16 (fetch-depth: 0 gives history but cannot restore a squashed-away commit)
  FALSIFIED BY: squash 7899ad2..HEAD into one commit on a scratch branch (`git reset --soft 5251aa3 && git commit`) and run IT-EIT-I-05 — red on `src/components/editor-inputs` tree mismatch.
  ROOT: IT-EIT-I-05 baseline binding survives delivery
  FIX-CLASS: corrects
  RESOLUTION: fixed — REPRODUCED: scratch worktree at HEAD, `git reset --soft 5251aa3 && git commit` (one squash commit on 5251aa3) leaves no WIP commit for the round-1 binding. SWEPT: `diff-filter=A` had one consumer (I-05); spec row IT-EIT-I-05, Build note 8 and the "baseline regenerated" error row amended. Fix: spec IT-EIT-I-05 amended first (regeneration from `git archive <baseCommit> src`, no dependency on the commit that added the JSON); I-05 now asserts baseCommit ancestor of HEAD then refolds the 11 base components (`locals`) and the accordion (`fallback`) against the JSON. Proof: on the squashed scratch branch above I-05 is green (1 passed); a mutated JSON value (`:host { display }` -> MUTATED) turns it red (`CHANGED :host { display }`). ci.yml fetch-depth: 0 kept — git archive needs the baseCommit objects, absent from a shallow clone.
- [MEDIUM] tests/styles/editor-inputs-theme.test.ts:115-120 — a colour literal or a direct HA variable (e.g. `var(--primary-color, #00d2ff)` instead of `var(--editor-accent, #00d2ff)`) written in the new shared sheet src/styles/editor-inputs-shared.ts passes every test: U-01/U-02/U-03/U-04 scan only files in src/components/editor-inputs/, and I-01 'declared' mode keeps non-editor var() verbatim, so the folded output equals the baseline. FR-2/FR-3/FR-4 (editor-input CSS reads only --editor-* with table fallbacks) are now enforced on 7 of the 9 places that carry editor-input CSS. In the diff. Fix: include src/styles/editor-inputs-shared.ts in `inputSources()` for the CSS scans (U-02/U-03/U-01).
  RESOLUTION: fixed — `inputSources()` now returns src/styles/editor-inputs-shared.ts with the 11 components (spec TC-EIT-U-01 row amended: "editor-input sources" of U-01..U-04); TC-EIT-U-01 asserts the shared sheet is in the list, and U-01..U-04 pass on it (31/31 green).
- [LOW] tests/styles/editor-inputs-theme.test.ts:180 — `takeLocals` strips `--_x:` declarations from the whole sheet, not only from the accordion `:host` rule as § Resolver step 3 says; harmless on the pre-port accordion (locals only on :host) but a narrower-than-stated contract. In the diff.
  RESOLUTION: fixed — `takeLocals` now collects and drops `--_x:` only inside `:host { … }` rules; TC-EIT-U-06 fixture `':host { --_a: 1px; } .x { --_b: 2px; b: var(--_a); }'` in `locals` gives `':host { } .x { --_b: 2px; b: 1px; }'` (the non-host local kept); I-01/I-02/I-05 still green.

NOTES:
- ci.yml fetch-depth: 0 on the `quality` job is the right context for I-05 on PR (merge ref) and push builds; hacs job untouched. I-05 fails rather than skips on a shallow clone (:448) — it would go red on the defect it guards, under the branch topology.
- editor-common :host declares the 30 table tokens with table values (U-03 :314-315 enforces).

CONFORMANCE EVIDENCE:
- FR-1 → src/styles/editor-common.ts :host block; U-03 :310-329
- FR-2/FR-3 → scanCss :269-286; U-07 negative controls :352-364
- FR-7/FR-8 → I-01 :380-383, I-02 :385-387, mutation I-04 :430-443
- FR-10 → I-03 :389-428
