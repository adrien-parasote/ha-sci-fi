# SPEC — tv-orphan-ids (stage summary)

**Decided:**
- 30 orphan tv test ids get rows in tv.md: base ids keep 716..738, variants 718b, 724b-d, 725b-c, 726b become 739..745 (mapping table in FR-2).
- Test titles and their comment lines take TC-TV-U-<n>; no assertion changes.
- A small guard lives at tests/cards/tv/tv-ids-declared.test.ts (not under tests/specs/), five `it` blocks citing TC-TVO-U-01..05; 78y.8 generalises it later.
- New rows go after TC-TV-U-715, English, none marked unplayed; the tv.md note count goes from dix-neuf to quarante-neuf lignes.
- Row-versus-assertion match is a VERIFY code-review item, not a test.

**Artifacts:**
- docs/specs/tv-orphan-ids/spec.md
- docs/adversarial-review/tv-orphan-ids.md
- target edits: docs/specs/cards/tv.md, tests/cards/tv/sci-fi-tv.test.ts, tests/cards/tv/sci-fi-tv-editor.test.ts

**Open/risky:**
- IT-TVO-I-01 needs a diff check: only title and comment lines change in the two tv test files.
- ids-cas-uniques must stay green with the new rows.

**Dead ends:** a guard under tests/specs/ (its citations do not count, one-word: orphan).

**Next action:** write tests/cards/tv/tv-ids-declared.test.ts first and watch it fail, then add the 30 rows to tv.md, rename the titles, update the note count, run vitest.

**Tests:** files +0 ~0 −1 · cases +0 −2
