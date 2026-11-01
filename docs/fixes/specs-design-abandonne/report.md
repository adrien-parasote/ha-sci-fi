# Fix lot — specs-design-abandonne

10 observation(s): 10 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npm test` — green 2026-11-01T15:22:44Z

## O1 — bridge.md : les 8 blocs « Render layout » nomment 13 fois `ha-icon`, un tag que le module ne rend jamais — `grep -rc ha-icon src/cards/bridge/` = 0 sur 16 fichiers, `sf-icon` = 66 occurrences. L'anti-patron 10 (l.1435) l'utilise aussi comme exemple de violation. Attendu : les blocs décrivent le DOM réellement rendu.

Bead: ha-sci-fi-zdw.1
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O1 —'` — green 2026-11-01T15:22:32Z

## O2 — bridge.md : TC-BRIDGE-U-17 et U-18 (l.1461-1462) gèlent les sélecteurs `ha-icon[icon='mdi:fire']` et `ha-icon[icon='mdi:gate']`, inatteignables par construction. Le comportement décrit existe pourtant (`entry.icon ?? …` en sf-bridge-alerts.ts:68 et sf-bridge-access.ts:61) et aucun test ne le couvre (`grep -rn 'U-17\|U-18' tests/` = 0).

Bead: ha-sci-fi-zdw.2
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O2 —'` — green 2026-11-01T15:22:33Z

## O3 — stove.md : F-STOVE-D01 « en-tête structuré (border-top + bottom, icône + nom + état) » et F-STOVE-D02 « coloration d'état conditionnelle dans l'en-tête » décrivent un en-tête jamais construit. `_renderHeader` (sci-fi-stove.ts:143-145) rend `<div class="header">${name}</div>` et rien d'autre ; `.header` (styles.ts:25-33) n'a que `border-bottom` ; la coloration vit sur `.status ${meta.color}`. Attendu : les deux lignes disent ce qui est rendu.

Bead: ha-sci-fi-zdw.3
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O3 —'` — green 2026-11-01T15:22:33Z

## O4 — stove.md : F-STOVE-D05, F-STOVE-D06, quatre sections entières et deux lignes de l'Error Handling Matrix portent sur `_buildSensorTiles()`, `_renderSensorTile()`, `_renderPelletBar()`, `_renderStorageCounter()` et `stoveStylesPart2` — cinq symboles absents de tout `src/` (`grep -rl` = 0 pour chacun, 3 à 5 occurrences chacun dans la spec). Les jauges réelles sont `sf-circle-progress-bar` et `sf-stack-bar`.

Bead: ha-sci-fi-zdw.4
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O4 / O10 —'` — green 2026-11-01T15:22:34Z

## O5 — stove.md : § Test Selectors — Frozen Contract (l.510-531) gèle 12 lignes dont aucune n'existe dans le fichier de test cité. `grep -c` dans tests/cards/stove/sci-fi-stove.test.ts : `bar-fill` 0, `sensor-tile` 0, `1500 W` 0, `2 / 10` 0. Les numéros de ligne gelés (L71-L175) pointent du code sans rapport. Attendu : un contrat gelé ne gèle que ce qu'un test tient.

Bead: ha-sci-fi-zdw.5
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O5 —'` — green 2026-11-01T15:22:35Z

## O6 — stove.md : l'anti-patron 1, l'hypothèse 2 et les deux lignes de Constraints prescrivent de préserver `.sensor-tile`, `.sensor-tile.warn`, `.bar-fill.pellet`, `.bar-fill.storage`. Ces classes ont été supprimées délibérément (styles.ts:300-305 porte le commentaire de suppression, bead ha-sci-fi-9xf) et l'affirmation « 8 test assertions depend on them » est fausse : zéro. Attendu : la spec n'interdit pas une suppression déjà faite et justifiée.

Bead: ha-sci-fi-zdw.6
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O6 / O7 —'` — green 2026-11-01T15:22:35Z

## O7 — stove.md : l'anti-patron 4 interdit les littéraux de couleur (« `color: #00d2ff` directly » → « Use `var(--sf-primary)` ») que ADR-018 § Decision légalise explicitement — point 1 « No theme-chained token replaces a hardcoded colour », point 3 « No substitution is performed », et la ligne de table qui nomme le poêle parmi les illustrations à littéraux. `src/cards/stove/styles.ts` en porte 14 lignes hors fallback. Suivre cet anti-patron régresserait contre l'ADR.

Bead: ha-sci-fi-zdw.7
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O6 / O7 —'` — green 2026-11-01T15:22:36Z

## O8 — stove.md : l'en-tête dit « Spec 11 » et collisionne avec docs/specs/11_guidelines_remediation.md, « Spec 11 — Guidelines Delta Remediation ». Six Deep Links sont par ailleurs d'un niveau de répertoire trop court : `../../src/...` depuis docs/specs/cards/ et `../CODEMAPS/architecture.md` ne résolvent sur rien.

Bead: ha-sci-fi-zdw.8
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O8 —'` — green 2026-11-01T15:22:36Z

## O9 — stove.md : toute la barre inférieure interactive — sélecteur HVAC (`sf-button-card-select`), molette de température (`sf-wheel`), sélecteur Preset, et les appels `climate.set_hvac_mode`, `climate.set_temperature`, `climate.set_preset_mode`, `switch.toggle` (sci-fi-stove.ts:354-486) — n'apparaît dans aucune ligne Blueprint, aucun TC et aucune ligne d'Error Handling. Elle est rendue et testée, mais non spécifiée.

Bead: ha-sci-fi-zdw.9
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O9 —'` — green 2026-11-01T15:22:37Z

## O10 — stove.md : le bloc de code de § styles.ts (l.261-414) nest pas la feuille livree mais un brouillon de conception. Il exporte stoveStyles + stoveStylesPart2 et declare .header-icon, .header-info, .stove-name, .sensors-grid, .sensor-tile, .sensor-value, .sensor-label, .bar-bg, .bar-fill.pellet, .bar-fill.storage. Le vrai src/cards/stove/styles.ts exporte stoveStyles seul et declare .container, .content, .info, .m, .temperatures, .status, .powers, .quantities, .bottom, .display, .circle, les chemins SVG et .stove-status. Attendu : la section decrit la feuille livree.

Bead: ha-sci-fi-zdw.10
Test: `npx vitest run tests/specs/delivered-design.test.ts -t 'O4 / O10 —'` — green 2026-11-01T15:22:38Z
