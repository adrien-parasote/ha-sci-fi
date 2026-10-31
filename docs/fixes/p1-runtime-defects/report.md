# Fix lot — p1-runtime-defects

6 observation(s): 6 fixed, 0 escalated, 0 UNREPRODUCED.

Whole suite: `npm test` — green 2026-10-31T14:42:46Z

## O1 — weather (ha-sci-fi-0sm) : choisir « Wind Speed » dans l'éditeur visuel casse la carte. L'éditeur écrit `chart_first_kind_to_render: 'wind'` (sci-fi-weather-editor.ts:31), SENSORS_MAP est clée `wind_speed` (sci-fi-weather.ts:47,54,61) ; `SENSORS_MAP[kind]` vaut undefined à :393 et `config.chartTitle.icon` lève à :402, la limite d'erreur de SciFiBaseCard affiche la carte d'erreur. Attendu : les trois valeurs de l'éditeur rendent leur graphique. Rapporté par le retrocheck j02 du 2026-10-31, vérifié indépendamment.

Bead: ha-sci-fi-xb8.1
Test: `npx vitest run tests/cards/weather/sci-fi-weather.test.ts -t "O1 —"` — green 2026-10-31T14:42:29Z

## O2 — tv (ha-sci-fi-3vg) : le bouton mute envoie `command: undefined` à `remote.send_command` (`volume_mute` absent de D_PAD_KEYS, sci-fi-tv.ts:22-31,294,462) ; une action personnalisée liée à `enter` ne se déclenche jamais (l'éditeur écrit `enter` à sci-fi-tv-editor.ts:23, la carte lit `confirm` à :309) ; `custom_actions.power` est ignoré par `_togglePower` ; `app_entity` manque de getRelevantEntities (:92-98) alors que :160 le lit, donc un changement d'app_entity ne repeint pas. Attendu : la commande envoyée est définie, les clés que l'éditeur écrit sont honorées, le rendu sélectif couvre toutes les entités lues. Rapporté par le retrocheck j02.

Bead: ha-sci-fi-xb8.2
Test: `npx vitest run tests/cards/tv/ -t "O2"` — green 2026-10-31T14:42:30Z

## O3 — bridge (ha-sci-fi-7dl) : 6 appels `callService` sans `.catch()` (sf-bridge-alerts.ts:143, sf-bridge-access.ts:127,132, sf-bridge-automations.ts:124,148, sf-bridge-actions.ts:100), et le toast de succès est émis inconditionnellement AVANT la résolution, donc un appel en échec annonce la réussite ; sf-bridge-actions.ts:100-106 a un `.finally()` sans `.catch()` (unhandled rejection). Les 4 lignes console.warn/console.error de la matrice d'Error Handling de la spec ne sont implémentées nulle part. Attendu : le toast de succès n'est émis que sur résolution, un toast d'erreur sur rejet, aucun rejet non géré. Rapporté par le retrocheck j02.

Bead: ha-sci-fi-xb8.3
Test: `npx vitest run tests/cards/bridge/bridge-call.test.ts tests/cards/bridge/sections/sf-bridge-toast-timing.test.ts` — green 2026-10-31T14:42:32Z

## O4 — climates (ha-sci-fi-9ng) : la config `comfort-1`/`comfort-2` écrite par l'éditeur ne peut jamais être lue par la carte (contrat et config.ts:35,36 en tiret, lookup sf-radiator.ts:18,19 en souligné) ; le repli d'un mode non mappé rend `mdi:information-off-outline` + `--sf-primary` au lieu de l'icône et la couleur `off` exigées par AP#4/TC-005 ; `frost` alias l'icône mais pas la couleur (:327-335) ; l'icône de saison ne se rafraîchit pas car getRelevantEntities (:20-31) ne rend que `climate.*` alors que :153 lit `sensor.season`. Attendu : icône et couleur personnalisées appliquées, repli sur `off`, en-tête repeint au changement de saison. Rapporté par le retrocheck j02.

Bead: ha-sci-fi-xb8.4
Test: `npx vitest run tests/cards/climates/ -t "O4"` — green 2026-10-31T14:42:33Z

## O5 — plugs (ha-sci-fi-dsy) : une prise `unavailable`/`unknown` rend comme une prise éteinte avec ses boutons actifs (plugs.md:929 exige boutons désactivés + état Offline ; aucune occurrence dans src/cards/plugs/) ; le `.cirle-container` gauche est rendu sans classe d'état (sci-fi-plugs.ts:174) donc la bille s'anime prise éteinte, alors que styles.ts:197-200 ne la masque que sous `.off` ; aucun état de chargement ni timeout 2 s pour l'historique (`historyLoading` absent de tout le dépôt) ; `_clearChart` ne vide pas `.chart-container.innerHTML` et `_drawChart` réutilise le canvas de la prise précédente ; `_getYesterday()` rend minuit hier, donc la fenêtre « 24 h » fait 24 à 48 h ; aucun clamp de `_selected_plug_id` quand l'édition raccourcit `devices`. Attendu : état indisponible rendu et verrouillé, animation cohérente avec l'état, fenêtre de 24 h glissantes. Rapporté par le retrocheck j02.

Bead: ha-sci-fi-xb8.5
Test: `npx vitest run tests/cards/plugs/ -t "O5"` — green 2026-10-31T14:42:35Z

## O6 — vehicles (ha-sci-fi-c8l) : un véhicule sans capteur de verrou est peint « déverrouillé » en orange (sf-landspeeder.ts:372-385, aucune garde sur `v.lock_status`, AP#8 l'interdit) ; idem carburant (:387-416) qui imprime `'--'` là où la spec dit `return nothing` ; la température de clim n'est jamais convertie — la molette affiche l'unité de `hass.config.unit_system` mais la charge utile reste `_selected_temp_id + 16` en °C (sci-fi-vehicles.ts:109-113,151) ; les seuils de batterie s'appliquent au brut et non à l'arrondi (:425-426) ; aucune branche « No vehicles configured » (:80,:86) et aucun clamp de `_active_vehicle_id` dans setConfig ; `charge_state` n'a aucune entrée d'éditeur alors qu'il est déclaré, lu et documenté ; un prologue `<?xml …?>` dans un template Lit (landspeeder-svg.ts:15) produit un nœud commentaire bogus à chaque rendu. Attendu : un panneau sans son capteur n'est pas rendu, l'unité affichée et la valeur envoyée concordent, les bornes sont tenues. Rapporté par le retrocheck j02.

Bead: ha-sci-fi-xb8.6
Test: `npx vitest run tests/cards/vehicles/ -t "O6"` — green 2026-10-31T14:42:36Z

---

## What this lot does NOT deliver, and where it went

The count above reads "6 fixed, 0 escalated". That is the register's view, and
for **O5 it is too generous**: the observation named six plugs defects and this
lot delivers four of them. The two it does not are the ones about the power
history chart, and they left for `ha-sci-fi-8ap` after five review rounds.

**O5, delivered:** the `unavailable` / `unknown` state is rendered (an OFFLINE
badge, a dimmed and non-interactive image, the child-lock and select controls
made inert) and `_toggle` refuses it; both cable containers carry the state
class, so nothing animates on a plug that is off or unreachable; the history
window is a true rolling 24 hours instead of midnight yesterday; and
`_selected_plug_id` is clamped when an edit shortens `devices`, which used to
reach the generic error card.

**O5, not delivered:** the loading state, the error state and the 2 s budget
that `plugs.md:930` (F-PLG-AF2) owes the chart section. Three attempts inside
this lot each produced a defect worse than the one it fixed — a request per
power reading, then a load that never fires in two real mount orders, then a
loading flag shared across plugs that drew one plug's data under another's
name. Every one was found by the next review round, none by me. The machinery
is reverted to its delivered shape, which is measurably correct about loading
and silent about failing, and `ha-sci-fi-8ap` carries the spec debt, the five
findings, the per-plug attempt latch, the config invalidation and the ownership
invariant the last reviewer prescribed.

The `_clearChart` / canvas-reuse line of O5 was not a code defect: the spec
asked for `.chart-container.innerHTML = ''` and the code was right to reuse the
canvas after `Chart.destroy()`. `docs/specs/cards/plugs.md` AP-7 was amended
instead, by the golden rule.

**Four more causes left as beads rather than widened into this diff:**
`ha-sci-fi-ecr` (tv `custom_actions.info` has no button — a new capability),
`ha-sci-fi-5em` (the bridge Error Handling Matrix beyond the callService row),
`ha-sci-fi-r9a` (climates `filter_by`, an undocumented switch with no
consumer), `ha-sci-fi-33v` (`.empty-message` has no CSS rule, in two cards),
`ha-sci-fi-rx2` (the absolute `/node_modules/…` imports in `dev/`).

**One environment note, so nobody re-measures it from scratch.** `npm test` is
green here only because `node_modules/home-assistant-js-websocket` was
symlinked into this worktree by hand: the worktree's own `node_modules` holds
nothing but Vite caches, and `dev/modules/mock-hass.js` imports by an ABSOLUTE
`/node_modules/…` path that Vite resolves against its root. The same commit
passes in the main checkout without the link. The link is machine-local, is not
committed, and `ha-sci-fi-rx2` holds the real remedy — a `resolve.alias`, not a
bare specifier, because `dev/workbench.html` loads its modules with no bundler
and the browser needs the absolute path.
