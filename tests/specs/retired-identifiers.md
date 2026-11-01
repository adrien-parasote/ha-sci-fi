# Identifiants retirés — les noms qu'une spec peut citer sans que le code les porte

Une spec ne nomme un identifiant que si l'arbre le porte.
`tests/specs/delivered-design.test.ts` extrait de chaque spec couverte tout
identifiant entre accents graves — classe CSS (`.foo`), méthode privée
(`_renderFoo`), composant (`sf-foo`), export de feuille (`fooStyles`) — et
exige qu'il existe dans `src/`, commentaires exclus.

Ce fichier est la **seule** exemption. Une note de révision a besoin de nommer
ce qu'elle retire ; sans exemption déclarée, la règle refuserait la note qui
dit la vérité. Mais l'exemption est une décision, pas un effet de bord de la
mise en forme : elle se lit ici, en un endroit, avec sa raison — et non dans un
bloc de citation que la garde apprendrait à ignorer.

Il vit sous `tests/` et non sous `docs/specs/` parce qu'il n'est pas un
document de spécification : c'est la liste que la garde lit, et elle se révise
avec elle.

## Les règles

1. **Une ligne par identifiant, portée à une seule spec.** Un nom retiré d'une
   carte n'est pas retiré des autres.
2. **La raison est obligatoire et dit où le nom a vécu**, pour qu'un lecteur
   puisse vérifier la décision sans rouvrir l'historique.
3. **Un identifiant qui réapparaît dans `src/` doit sortir de cette liste.**
   La garde le refuse : une exemption périmée masquerait un symbole vivant,
   exactement le trou qu'elle est censée fermer.
4. **Cette liste ne dispense de rien d'autre.** Un sélecteur gelé, un lien, une
   ligne `Covers` restent jugés par leurs propres cas.

## docs/specs/cards/stove.md

Les treize noms d'un design en-tête + tuiles-capteurs abandonné. Le CSS mort a
été supprimé le 2026-08-12 (bead `ha-sci-fi-9xf`) ; les sections qui le
décrivaient encore ont été réécrites le 2026-11-01 (lot fix
`specs-design-abandonne`, O3, O4, O5, O6, O10).

| Identifiant | Raison |
|---|---|
| `.sensors-grid` | La grille de tuiles n'a jamais été rendue : la zone contenu est `.content > .info` en trois zones. Nommée par la note de la section styles |
| `.sensor-tile` | Classe gardée en CSS « required by tests — legacy compatibility » pour des tests jamais écrits, supprimée le 2026-08-12 avec les lignes TC-1106 à TC-1109 |
| `.sensor-value` | Enfant de la tuile, parti avec elle |
| `.sensor-label` | Enfant de la tuile, parti avec elle |
| `.bar-fill` | Les jauges sont déléguées à `sf-circle-progress-bar` et `sf-stack-bar`, qui portent leur propre feuille. Aucun rendu de la carte n'a produit cette classe |
| `.bar-bg` | Le fond de barre de la jauge supprimée, parti avec elle |
| `.header-icon` | L'en-tête ne porte que le nom (`_renderHeader`, lignes 143 à 145). L'icône vit dans la ligne de statut |
| `.stove-name` | Même cause : il n'y a pas de sous-structure dans l'en-tête, le nom est son contenu direct |
| `stoveStylesPart2` | La feuille n'a qu'un export, `stoveStyles`. Le second était un découpage du brouillon de conception |
| `_buildSensorTiles` | Méthode du design abandonné. Les capteurs sont lus par `_renderTopZone`, `_renderMiddleZone` et `_renderPowerZone` |
| `_renderSensorTile` | Idem — aucune tuile n'est rendue |
| `_renderPelletBar` | La jauge de granulés est `_renderPelletQuantity`, qui rend `sf-circle-progress-bar` |
| `_renderStorageCounter` | Le stock est `_renderPelletStock`, qui rend `sf-stack-bar` |

## docs/specs/cards/bridge.md

Quatre noms d'une maquette que le module n'a pas suivie, corrigés par le lot fix
`test-spec-divergence` (épique `ha-sci-fi-ajb`) et cités depuis par les notes de
révision qui disent ce qu'ils étaient.

| Identifiant | Raison |
|---|---|
| `.crew-zone-pill` | Le code rend `.crew-zone-badge`. Nommée par la note de révision de la section crew |
| `.crew-name` | Le nom de la personne n'est pas rendu comme élément : il n'apparaît qu'en `alt` d'image. Même note |
| `.pellet-progress` | Les jauges du bridge sont déléguées à `sf-circle-progress-bar` et `sf-stack-bar`. Nommée par la mise en garde de TC-BRIDGE-U-24 |
| `.stove-pellet-bar` | Même cause que `.pellet-progress`, et nommée par la même mise en garde de TC-BRIDGE-U-24 : la barre de stock est `sf-stack-bar` |
