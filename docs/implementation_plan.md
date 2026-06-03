# Migration de la Documentation Utilisateur vers le Wiki

L'objectif de cette opération est de séparer proprement la documentation "Utilisateur" (comment installer et utiliser les cartes) de la documentation "IA / Développeur" (les spécifications techniques et les blueprints). 

Le Wiki GitHub (`ha-sci-fi-wiki`) deviendra l'unique point d'entrée pour les utilisateurs de Lovelace, tandis que le dépôt principal (`ha-sci-fi`) restera concentré sur le code et l'IA.

## User Review Required

> [!IMPORTANT]
> **Veuillez valider ce plan.** Une fois approuvé, j'exécuterai les actions ci-dessous qui incluent des déplacements de fichiers et la suppression du dossier `docs/cards/` du dépôt principal.

## Proposed Changes

---

### ha-sci-fi-wiki (Nouveau contenu)

Nous allons créer les fichiers Markdown suivants dans le dépôt Wiki. Leur contenu proviendra des fichiers actuels de `docs/cards/`.

#### [NEW] Home.md
Création d'une vraie page d'accueil avec :
- L'introduction du projet (reprise du README actuel) : "A collection of custom Lovelace cards for a minimalist sci-fi dashboard".
- Une explication claire que ce dépôt offre une boîte à outils de cartes indépendantes que chacun peut assembler à sa guise.
- Les instructions d'installation HACS et Manuelle (déplacées depuis le README actuel).

#### [NEW] Bridge.md
#### [NEW] Hexa-Tiles.md
#### [NEW] Lights.md
#### [NEW] Plugs.md
#### [NEW] Climates.md
#### [NEW] Stove.md
#### [NEW] TV.md
#### [NEW] Vacuum.md
#### [NEW] Vehicles.md
#### [NEW] Water.md
#### [NEW] Weather.md

*Action sur ces fichiers :* Copie intégrale du contenu actuel. **Cependant**, les liens relatifs en bas de page (ex: `[Technical spec](../specs/cards/bridge.md)`) seront remplacés par des URLs absolues pointant vers le dépôt principal GitHub, ou supprimés si jugés trop techniques pour l'utilisateur final. Les chemins des images (déjà au format `https://github.com/.../blob/main/screenshot/...`) seront conservés et fonctionneront.

---

### ha-sci-fi (Dépôt Principal)

Nous allons nettoyer le dépôt principal pour qu'il soit "IA-ready" et allégé.

#### [MODIFY] README.md
- **Suppression** des instructions d'installation détaillées (déplacées vers le Wiki).
- **Suppression** des grands tableaux listant les cartes et les icônes.
- **Ajout** d'un grand lien d'appel à l'action : "📖 Consultez le Wiki pour l'installation et l'utilisation".
- **Conservation** des sections "Developer setup" et "i18n" pour les contributeurs.

#### [DELETE] docs/cards/bridge.md
#### [DELETE] docs/cards/hexa-tiles.md
#### [DELETE] docs/cards/lights.md
#### [DELETE] docs/cards/plugs.md
#### [DELETE] docs/cards/climates.md
#### [DELETE] docs/cards/stove.md
#### [DELETE] docs/cards/tv.md
#### [DELETE] docs/cards/vacuum.md
#### [DELETE] docs/cards/vehicles.md
#### [DELETE] docs/cards/water.md
#### [DELETE] docs/cards/weather.md
*Action:* Ce dossier complet sera supprimé du dépôt principal après la migration vers le wiki.

## Verification Plan

### Manual Verification
1. L'utilisateur vérifiera que les pages du Wiki s'affichent correctement sur l'interface GitHub, en particulier que toutes les images chargent bien depuis la branche `main` de `ha-sci-fi`.
2. Vérifier que le `README.md` allégé du projet pointe bien vers l'URL du Wiki.
