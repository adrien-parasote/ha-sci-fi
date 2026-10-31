# Fix lot — jq5-editor-status-domain

1 observation(s): 1 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-10-31T16:29:56Z

## O1 — bridge editor : le champ status du poele (section Stove) n'offre que des binary_sensor — _renderStoveSection alimente la liste avec _entitiesByDomain('binary_sensor') seul, et sf-editor-dropdown ne publie que l'item clique, la saisie libre filtre sans valider. Sur l'integration core fumis, qui n'expose aucun binary_sensor de marche mais un sensor enum sensor.*_detailed_stove_status, aucune entite selectionnable ne convient : le correctif O1 du lot stove-fumis-core (STOVE_OFF_STATES) est inerte, la pastille reste figee. Constat HIGH de docs/reviews/stove-fumis-core/code-review.md, bead ha-sci-fi-jq5. Attendu : la liste du champ status propose les sensor en plus des binary_sensor (le precedent est _renderAppliancesSection, meme fichier), et le libelle ne dit plus 'ON/OFF'.

Bead: ha-sci-fi-deq.1
Test: `npx vitest run tests/cards/bridge/sci-fi-bridge-editor.test.ts -t test_O1` — green 2026-10-31T16:29:50Z
