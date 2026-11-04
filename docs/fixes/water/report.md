# Fix lot — water

10 observation(s): 9 fixed, 1 escalated, 0 UNREPRODUCED.

Whole suite: `npx vitest run` — green 2026-11-04T19:28:28Z

## O1 — [ha-sci-fi-1k7] [bug] water : _fetchHistoryLogs vide _rawLogs avant l'appel, le cache n'est jamais affiche hors-ligne et [ OFFLINE ] n'existe pas (D12)

Bead: ha-sci-fi-d6nc.1
ESCALATED → ha-sci-fi-8fn3 (adds a capability, or past a ceiling)

## O2 — [ha-sci-fi-5aw] water : lignes de logbook sans state ou mal formees non validees, log.state.toUpperCase() leve (F-02)

Bead: ha-sci-fi-d6nc.2
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O2_` — green 2026-11-04T19:28:02Z

## O3 — [ha-sci-fi-9vv] [bug] water : le bouton de synchro ne tourne jamais (D01, styles.ts:60 vise ha-icon, le template rend sf-icon)

Bead: ha-sci-fi-d6nc.3
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O3_` — green 2026-11-04T19:28:03Z

## O4 — [ha-sci-fi-ijw] [bug] water : _historyLogs ecrit (:283) mais jamais lu, tri/retention dupliques dans _renderHistoryLogs (D15)

Bead: ha-sci-fi-d6nc.4
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O4_` — green 2026-11-04T19:28:05Z

## O5 — [ha-sci-fi-ln3] [bug] water : 4 attributs style= inline dans le template, contre AP#5 (D20, :515 :570 :610 :625)

Bead: ha-sci-fi-d6nc.5
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O5_` — green 2026-11-04T19:28:06Z

## O6 — [ha-sci-fi-rd4] [bug] water : branche 'aucun equipement pour cet etage' atteignable seulement par first_floor_to_render sur un etage sans entite eau (D07, floors prefiltres :452)

Bead: ha-sci-fi-d6nc.6
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O6_` — green 2026-11-04T19:28:08Z

## O7 — [ha-sci-fi-xrc] water : le declencheur 'expanded' de updated() contredit water.md (AP Fetch on accordion open) et personne ne le pose (F-01)

Bead: ha-sci-fi-d6nc.7
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O7_` — green 2026-11-04T19:28:09Z

## O8 — [ha-sci-fi-p5a] water : les retours anticipes de _fetchHistoryLogs (entityIds vide, sandbox) n'incrementent pas _fetchId (F-16)

Bead: ha-sci-fi-d6nc.8
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O8_` — green 2026-11-04T19:28:10Z

## O9 — [ha-sci-fi-uvk] water editor : echec de registre avale avec log-and-continue, et cast (hass as any).callWS

Bead: ha-sci-fi-d6nc.9
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O9_` — green 2026-11-04T19:28:12Z

## O10 — [ha-sci-fi-7kb] water.md F-WATER-06 liste cinq domaines sans input_boolean, le code et water_history.md en interrogent six (F-14)

Bead: ha-sci-fi-d6nc.10
Test: `npx vitest run tests/cards/water/fix-water.test.ts -t test_O10_` — green 2026-11-04T19:28:13Z
