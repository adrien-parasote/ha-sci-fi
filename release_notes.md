# Release v1.1.0 🪐

Cette version majeure introduit la très attendue **Carte TV Remote (`sci-fi-tv`)** ! 
Elle apporte une interface de contrôle hybride puissante pour vos téléviseurs et boîtiers multimédias (Apple TV, Android TV, etc.), avec une gestion avancée des sources et des actions personnalisées, le tout avec l'esthétique Sci-Fi si caractéristique.

## 🚀 Nouveautés (Features)
- **Nouvelle Carte : TV Remote (`sci-fi-tv`)** : Une carte complète pour contrôler vos lecteurs multimédias.
  - **D-Pad Directionnel** : Navigation intuitive (Haut, Bas, Gauche, Droite, OK).
  - **Boutons d'Actions** : Home, Retour, Play/Pause, Mute.
  - **Actions Personnalisées** : Configuration visuelle sans YAML de boutons additionnels (`power`, `info`, `enter`, `volume_mute`) via un éditeur dédié (`sf-editor-action`).
- **Cadran Volume (Planet Orbit)** : Un contrôle de volume rotatif inédit avec un satellite en orbite 3D qui représente le volume actuel. 
- **Sélecteur de Sources** : Accordéon déroulant pour un accès rapide aux applications (Netflix, YouTube, etc.) ou aux entrées HDMI.
  - Support de sources sous forme de chaînes de caractères (sources natives du `media_player`).
  - Support de sources complexes via objets pour déclencher n'importe quel script ou service Lovelace (ex: ouvrir une app spécifique sur Apple TV).
  - Configurable via l'interface visuelle avec `sf-editor-source-list`.
- **Statut Télémétrique** : Barre de statut dynamique affichant l'état du lecteur (Lecture, Pause, Éteint, Veille, Inactif) avec fallback de nom d'application.
- **Grille Hexagonale Évolutive** : Mise à l'échelle des composants `sf-hexa-tile` repensée pour supporter de plus grandes tailles (ex: 58px) tout en maintenant le ratio parfait de 1.1547.
- **Localisation** : Intégration complète du français via `@lit/localize` pour la carte et son éditeur.

## 🐛 Corrections de bugs (Fixes)
- Correction d'un crash HMR (`lit-localize`) et de la précédence de compilation TypeScript lors du développement sur le workbench.
- Correction d'un bug de rendu `[object Object]` dans les titres d'accordéon en séparant l'évaluation textuelle du rendu de `TemplateResult` (L072).
- Stabilisation de l'icône de D-pad central qui disparaissait lorsqu'elle utilisait le binding réactif au lieu du binding d'attribut natif HTML (L071).
- Nettoyage du registre central (`src/sci-fi.ts`) et mise à jour de la `baseline.json` de Sentrux pour supporter correctement le nouvel arbre d'importation sans déclencher d'alerte `no_god_files`.

## 📚 Documentation
- Ajout de la documentation complète pour la carte TV dans `docs/cards/tv.md`.
- Ajout de nouveaux screenshots d'édition (`tv_edit1.jpeg`, `tv_edit2.jpeg`).
- Mise à jour des cartes d'architecture (`docs/CODEMAPS/frontend.md`).

## 🛠️ Technique & Dette
- Version de dépendances gérée via `package.json` (bump à 1.1.0).
- Tous les éditeurs et cartes sont testés unitairement (intégration Vitest).
- Introduction du nouvel utilitaire UI : `sf-editor-action` permettant aux autres cartes d'offrir une configuration sans YAML pour les boutons Lovelace.
