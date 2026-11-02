# VERIFY summary — alias-orphan-ids (bead ha-sci-fi-78y.3)

## Done
- Lint, refactor-clean, doc-update, verify.py (all blocking checks pass), coldboot: proofs minted.
- Reviews: code APPROVE, security DEPLOY, re-recorded after verify.py rebuilt dist.
- dist/sci-fi.min.js is not in any review packet hashes; the source files in the packet hash identically (plugs/vehicles specs and tests). Rebuild only moved dist. dist NOT committed.

## Artifacts
- docs/reviews/alias-orphan-ids/code-review.md
- docs/reviews/alias-orphan-ids/security-review.md
- docs/adversarial-review/alias-orphan-ids.md
- docs/specs/alias-orphan-ids/spec.md
- Changed: docs/specs/cards/plugs.md, docs/specs/cards/vehicles.md, tests/cards/plugs/sci-fi-plugs.test.ts, tests/cards/vehicles/sci-fi-vehicles.test.ts, dist/sci-fi.min.js

## Open
- verify.py advisory findings (2) and a dead-code-shape advisory (P-wiring) are non-blocking.
- Nothing committed; HARDEN commits.

**Tests:** files +1 ~2 −0 · cases +12 −4
