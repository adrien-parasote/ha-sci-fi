# SPEC — spec-12-renumber (stage summary)

**Decided:** Two files claim `# Spec 12`: vehicles keeps 12, water_history becomes Spec 16 (FR-1).
Uniqueness guard test is rewritten and run first, red before docs change (FR-6).
Water test describe renamed to `(Spec 16)` (FR-3); plugs/vacuum links repointed to vehicles.md (FR-4).
vehicles src/tests and stove.md historical note keep `Spec 12` (FR-5).
Spec 07 collision (tv.md / hexa-tiles.md) is pinned by name, out of scope.
Spike offer: no. Build mode: headless.

**Artifacts:** docs/specs/spec-12-renumber/spec.md; docs/adversarial-review/spec-12-renumber/; .sc/reports/spec-precheck-spec-12-renumber.json

**Intent items touched:** none.

**Open/risky:** Gate demanded edits: FR-6 added to TC-RN-U-01 Covers; IT-RN-I-02 and IT-RN-I-03 added to reach 3 integration cases (both run by command at VERIFY). Adversarial review is past its 1-fix-round cap (warning only, passed).

**Dead ends:** none.

**Next action:** BUILD: edit uniqueness test first, run it red, re-lock renamed titles in tdd (reason: renumber Spec 12 collision, bead ha-sci-fi-b8g), then apply FR-1..FR-4.

**Tests:** files +5 ~7 −1 · cases +93 −51
