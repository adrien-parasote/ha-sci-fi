# Release v1.2.2 💧🪐

Cette version majeure de la branche `1.2.x` introduit le tout nouveau module de **Gestion de l'Eau (`sci-fi-water-management`)** ainsi que de nombreuses optimisations visuelles, de stabilité et une localisation robuste !

Cette note de version consolide l'ensemble des changements apportés par les versions `1.2.0`, `1.2.1` et `1.2.2`.

## 🚀 Nouveautés (Features)

### 💧 Module de Gestion de l'Eau (`sci-fi-water-management`)
Une toute nouvelle carte Lovelace complète pour contrôler et surveiller vos circuits d'eau, d'arrosage, d'hydroponie ou d'humidité du sol :
- **Rendu Hexagonal Dynamique** : Regroupement automatique des capteurs et actionneurs sous forme d'accordéons futuristes mappés à leurs zones.
- **Automations Dédiées** : Section isolée et stylisée pour vos automatisations (`automation.`).
- **Écran de Personnalisation** : Interface visuelle complète pour activer ou masquer individuellement n'importe quelle entité.
- **Filtres Globaux & Exclusions** : Support des jokers (ex: `*temperature*`) pour ignorer automatiquement les entités inutiles.
- **Sélection du premier étage** : Configuration sans YAML pour charger l'étage ou la zone de votre choix par défaut.
- **Support des types complexes** : Déduction intelligente des domaines d'appels HA pour supporter les entités virtuelles et physiques (`input_select`, `select`, etc.).

### 📺 Télécommande TV (`sci-fi-tv`)
- **Sony Bravia Validated** : Documentation mise à jour et validée pour les téléviseurs Sony Bravia via l'intégration officielle, assurant un mapping parfait des touches du D-pad.

### 🌍 Grille Hexagonale
- **Hexa Tiles & Water** : Ajout du support natif du filtre `water` pour regrouper ou lier le tableau de bord hexagonal directement avec vos tuiles d'eau.

---

## 🐛 Corrections de bugs (Fixes)

### 🌍 i18n & Localisation (Critique)
- **Minification & Terser** : Correction d'un bug de build majeur où Terser fusionnait les ternaires symétriques de `msg()` (ex: `isOn ? msg('A') : msg('B')`) en un seul appel dynamique `msg(isOn ? 'A' : 'B')`. Cette optimisation brisait le hachage statique de `lit-localize` et forçait les messages de toast et les statuts des télécommandes ou des prises à s'afficher en anglais (`Turned on`, `STANDBY`, `OFFLINE`). Les appels ont été réécrits à l'aide de tuples statiques robustes (`[msg('OFF'), msg('ON')][isOn ? 1 : 0]`) pour empêcher toute minification destructive.
- **lit-localize extract** : Résolution du comportement silencieux du linter de build qui rejetait les traductions fr sans nœud `<target>` dans le fichier `.xlf`.

### 💧 Gestion de l'Eau & Lumières
- **Race Condition sur le premier rendu** : Résolution du chargement asynchrone de `hass.floors` qui réinitialisait la configuration utilisateur de l'étage par défaut (ex: `Extérieur`) s'il était chargé avant l'établissement complet du WebSocket.
- **Mapping insensible à la casse** : Support total des noms conviviaux d'étages avec accents ou casses mixtes (ex: `Extérieur` ou `REZ-DE-CHAUSSÉE`).
- **Icônes dynamiques** : Utilisation de l'icône d'état native de Home Assistant (`ha-state-icon`) pour hériter dynamiquement des icônes d'appareils (ex: batterie ou humidité) au lieu de forcer une icône statique.
- **UI Toggle Glitch** : Correction d'un double déclenchement d'événement sur `sf-toggle-change` provoquant des sauts d'interrupteurs.

---

## 🛠️ Technique & Dette
- Nettoyage des promesses flottantes dans `sci-fi-water-management-editor.ts`.
- Ajout de la documentation d'architecture au Codemap interne (`docs/CODEMAPS/frontend.md`).
- Centralisation des apprentissages clés dans le registre continu (`.agents/learnings/L075_terser_lit_localize_collapse.md`).
- Couverture de tests unitaires maintenue à **100% de réussite (602 tests au vert)**.
