# Tactical Water Management Card - 2.0 (Dynamic Floor-Based)

## Goal
Créer un nouveau composant `sci-fi-water-management` au tableau de bord `ha-sci-fi` qui agit comme un tableau de bord général "Vaisseau Spatial" pour l'eau. Au lieu d'avoir une carte statique (Intérieur/Extérieur), la carte listera dynamiquement les équipements liés à l'eau, regroupés par Étage (Floor), avec une interface optimisée pour mobile.

## Architectural Pivot : Le Modèle Dynamique
Comme pour le composant `sci-fi-lights`, nous abandonnons le partitionnement en dur (Chauffe-eau vs Vannes).
La carte fonctionnera ainsi :
1. **Sélecteur d'Étages** : Une ligne d'hexagones en haut pour sélectionner l'étage (ex: RDC, Étage, Extérieur). Pas de sous-groupement par "Area" pour garder l'interface simple et mobile-first.
2. **Filtrage par Tag (Label)** : La carte scannera le registre des entités de Home Assistant (`hass.entities`) pour trouver toutes les entités possédant le tag/label configuré (par défaut : `water` ou `eau`).
3. **Liste Standardisée** : Pour l'étage sélectionné, la carte affichera une liste verticale standard (Icône, Nom, Statut, Toggle/Bouton) de tous les équipements taggés (vannes, chauffe-eau, capteurs d'humidité, pompes futures).

## Proposed Changes

### 1. New Component: `sci-fi-water-management`
Create `src/cards/water/sci-fi-water-management.ts`:
- **UI Layout :** 
  - Header avec le sélecteur d'étages (Hexagones `sci-fi` comme les lumières).
  - Zone de contenu : Une liste verticale (standard row) d'entités.
- **Logique de rendu des lignes (Row Renderer) :**
  - Si l'entité est un `switch` ou `valve` : Affiche un Toggle pour ouvrir/fermer.
  - Si l'entité est un `sensor` : Affiche la valeur (ex: `%` de batterie, `W` de puissance).
  - Si l'entité est une `automation` : Affiche un Toggle pour activer/désactiver le programme.
- **Récupération Dynamique :** Utilisation des sélecteurs (selectors) pour croiser `getFloors(hass)` avec les entités filtrées par leur attribut `labels` dans HA.

### 2. Editor Component: `sci-fi-water-management-editor`
Create `src/cards/water/sci-fi-water-management-editor.ts`:
- Configuration de l'étiquette (Tag/Label) à utiliser pour filtrer les éléments dans HA (ex: champ texte avec valeur par défaut `water`).
- Possibilité d'ignorer certaines entités via un tableau `ignored_entities`.
- Configuration de l'icône par défaut pour l'en-tête de la carte.

### 3. Modifications Home Assistant (Pré-requis)
Pour que la carte fonctionne, il faudra que tu ailles dans ton interface Home Assistant :
- Aller dans Paramètres > Appareils et Services > Étiquettes (Labels).
- Créer une étiquette (ex: `water`).
- Assigner cette étiquette au chauffe-eau, aux vannes Giex, à leur batterie, et aux automatisations d'arrosage.

## Maquette (UI Mock)
Voici la nouvelle maquette mobile-first "Spaceship Dashboard". On a les hexagones d'étages en haut, et une liste générique très propre en dessous qui s'adaptera à n'importe quel équipement d'eau que tu ajouteras dans le futur :

![Tactical Water Dynamic Mock](/Users/adrien.parasote/.gemini/antigravity/brain/f9383196-e394-401e-8cbb-8cc6292a0965/tactical_water_dynamic_floor_mock_1780078852080.png)

## User Review Required

> [!IMPORTANT]
> **Labels HA :** Est-ce que tu utilises bien la fonctionnalité "Étiquettes" (Labels) native de Home Assistant (introduite en version 2024.4) pour tagger tes éléments, ou souhaites-tu qu'on utilise un attribut personnalisé / une liste d'entités en dur dans l'éditeur de la carte en attendant ?

> [!WARNING]
> **Automatisations :** Les automatisations dans HA n'appartiennent généralement pas à un Étage (Floor) ou une Pièce (Area). Pour qu'elles s'affichent sous "Extérieur" par exemple, il faudra s'assurer qu'elles sont assignées à la pièce/l'étage Extérieur dans HA, ou alors la carte devra les regrouper dans un onglet "Général/Système". Qu'en penses-tu ?

## Verification Plan
1. Lancer `npm run build:dev`.
2. Vérifier que la nouvelle carte s'affiche dans le workbench mocké (`dev/workbench.html`).
3. Créer des entités mockées avec le label `water` et vérifier qu'elles se répartissent correctement selon leur étage.
