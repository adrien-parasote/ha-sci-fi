# Fix lot — ui

6 observation(s): 6 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-04T21:01:25Z

## O1 — [ha-sci-fi-33v] `.empty-message` n'a aucune règle CSS : l'état vide de climates et de vehicles rend en texte nu

Bead: ha-sci-fi-rskp.1
Test: `npx vitest run tests/fixes/ui/O1.test.ts` — green 2026-11-04T21:01:08Z

## O2 — [ha-sci-fi-8fb] i18n : litteraux anglais en dur hors msg() (User, Radiator, Unknown, No config x2, Remote command failed, title=preset/mode du sf-radiator)

Bead: ha-sci-fi-rskp.2
Test: `npx vitest run tests/fixes/ui/O2.test.ts` — green 2026-11-04T21:01:09Z

## O3 — [ha-sci-fi-rq0] icônes météo : les identifiants SVG (x1, x2, b) se heurtent dans le DOM léger quand deux icônes cohabitent

Bead: ha-sci-fi-rskp.3
Test: `npx vitest run tests/fixes/ui/O3.test.ts` — green 2026-11-04T21:01:10Z

## O4 — [ha-sci-fi-9zpl] tv : garde radiale de la molette de volume (tap sur le readout = 0 ou 1)

Bead: ha-sci-fi-rskp.4
Test: `npx vitest run tests/cards/tv/sci-fi-tv.test.ts -t test_O4` — green 2026-11-04T21:01:10Z

## O5 — [ha-sci-fi-ecr] tv : custom_actions.info n'a aucun bouton — ajouter le bouton ou retirer la clé du contrat

Bead: ha-sci-fi-rskp.5
Test: `npx vitest run tests/fixes/ui/O5.test.ts` — green 2026-11-04T21:01:11Z

## O6 — [ha-sci-fi-jbun] climates: un thermostat unavailable/unknown ne compte plus comme actif (décision utilisateur 2026-11-04) — isClimateNotOff exclut aussi unavailable et unknown, spec 02 amendée

Bead: ha-sci-fi-rskp.6
Test: `npx vitest run tests/fixes/ui/O6.test.ts` — green 2026-11-04T21:01:12Z
