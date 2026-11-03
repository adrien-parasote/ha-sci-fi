# SPEC — i18n-hardcoded-fr (stage summary)

**Decided:** spec settled (FR-1..FR-13, TC-I18N-U-01..20, IT-I18N-I-01..04); adversarial + builder check passed; spike-offer = no; build-mode = headless; guard + pre-fix snapshots drive the census; real-tree hits outside census are fixed and listed as census additions.

**Artifacts:** docs/specs/i18n-hardcoded-fr/spec.md, docs/adversarial-review/i18n-hardcoded-fr.md

**Intent items touched:** none new.

**Open/risky:** IT-I18N-I-04 is unticked (played as a command in VERIFY, never cited by a test). Flaky under load: socle-contract, entity.selectors IT-202.

**Dead ends:** none.

**Next action:** BUILD: write a plan, then guard tests first (watched red), then convert the sites.
