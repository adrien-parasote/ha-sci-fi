# Strategic Blueprint: Workbench Editor & i18n Integration

> **Stream Coding · STRATEGY Stage · May 2026**
> **Feature:** Language switching and Home Assistant-like edit mode in the Sci-Fi Workbench.

---

## The 7 Questions

### Q1 — Quel problème exact résout-on ?

**Problème :**
Dans `dev/workbench.html` actuel, les développeurs n'ont aucun moyen simple de :
1. **Vérifier les traductions** en temps réel (la langue de HASS est figée sur le français, impossible de basculer en anglais pour tester les tags `@lit/localize`).
2. **Tester l'édition de cartes** localement. Ils doivent copier-coller manuellement le YAML de leurs configurations dans une vraie instance de Home Assistant pour valider comment les cartes réagissent aux modifications de configuration, ou pour tester leurs éditeurs de cartes. Cela ralentit considérablement la boucle de feedback.

**Persona :**
Développeur et intégrateur de cartes Lovelace customisées qui souhaite valider instantanément le comportement visuel, la réactivité aux changements de configuration, la validation du format de données (YAML), et le support international (EN/FR) de ses composants de manière 100% autonome et locale.

---

### Q2 — Métriques de succès

| Métrique | Cible | Validation |
|---|---|---|
| **Temps de bascule de langue** | < 50ms | Le clic sur le bouton de langue (EN/FR) traduit instantanément toute l'interface sans rechargement de page. |
| **Temps de mise à jour live (YAML)** | < 100ms | La modification du code YAML valide met à jour la preview en temps réel. |
| **Robustesse aux erreurs YAML** | 100% | La saisie d'un YAML syntaxiquement incorrect affiche un bandeau d'alerte élégant mais ne crashe jamais la carte ou la page (la dernière configuration valide reste affichée). |
| **Simulation Éditeur HA** | 100% | L'édition via l'éditeur graphique (si enregistré) dispatche l'événement standard `'config-changed'` et met à jour l'éditeur YAML en temps réel. |
| **Discipline d'interface** | 100% | En mode édition, les simulateurs d'appareils (tablette/téléphone) sont désactivés et masqués pour laisser place à un espace de travail "ordinateur" side-by-side. |

---

### Q3 — Pourquoi cette architecture va gagner

1. **Synchronisation bidirectionnelle par événements standards** :
   Nous lions l'éditeur graphique (web component), l'éditeur de code (YAML textarea), et la preview de la carte en utilisant l'événement `'config-changed'` natif de Home Assistant. C'est l'exacte reproduction de l'architecture interne de Lovelace, garantissant que si le composant fonctionne dans le workbench, il fonctionnera de manière identique dans Home Assistant.
2. **Graceful Fallback pour l'éditeur UI** :
   Si l'éditeur d'une carte (ex. `<sci-fi-lights-editor>`) n'est pas encore enregistré dans `customElements`, le workbench ne crashe pas. Il affiche à la place un panneau d'information premium expliquant que l'éditeur graphique n'est pas encore disponible et invite à utiliser l'éditeur YAML.
3. **Zéro overhead serveur** :
   Toute la logique de parsing YAML (`js-yaml`) et de synchronisation d'état s'exécute côté client. Le workbench reste un fichier HTML statique ultra-léger et rapide à charger.

---

### Q4 — Décision architecturale centrale

**Choix du parseur et éditeur de YAML :**
Plutôt que d'intégrer un éditeur lourd comme Monaco Editor (qui pèse plusieurs mégaoctets et nécessite un setup complexe), nous optons pour un **textarea customisé et stylisé** (police monospace premium, numérotation de lignes émulée ou zone de saisie propre, coloration et validation d'erreurs en temps réel) couplé à la librairie **`js-yaml` (v4.1.0)** chargée depuis un CDN.

**Raisonnement :**
Le workbench doit rester extrêmement réactif, simple à distribuer et à exécuter localement via un simple serveur de fichiers statiques (ex. `npx serve .`). `js-yaml` est ultra-rapide, léger, et gère parfaitement toutes les structures complexes de Home Assistant (listes imbriquées, dictionnaires, booléens).

---

### Q5 — Rationale de la tech stack

| Choix | Rationale |
|---|---|
| **js-yaml (v4.1.0)** | Standard de l'industrie pour parser et dumper le YAML en JavaScript dans le navigateur. Extrêmement robuste. |
| **@lit/localize Integration** | Utilise les setters natifs `hass` de nos base classes (`base-card.ts` / `base-editor.ts`) pour déclencher la mise à jour des traductions sans devoir ré-exécuter de logique manuelle. |
| **Glassmorphic Sci-Fi Styles** | Utilisation des variables CSS `--sf-*` et du thème sombre premium existant pour intégrer le nouvel éditeur et les contrôles de langue de manière transparente et wahu. |

---

### Q6 — Features (ordonnées par dépendance d'implémentation)

#### 1. Sélecteur de langue (i18n)
- Ajout d'un sélecteur de langue sleek (boutons **EN** et **FR**) dans la toolbar.
- Mise à jour dynamique de la locale dans l'objet `hass` (`hass.language` et `hass.locale.language`).
- Propagation réactive de la mise à jour vers tous les éléments montés.

#### 2. Sélecteur de mode de travail
- Boutons **👁️ Visualisation** (View) et **✏️ Édition** (Edit) dans la toolbar.
- Le mode visualisation conserve le comportement actuel (simulateurs de taille d'appareil tablette/mobile disponibles).
- Le mode édition force le mode "ordinateur" (pleine largeur de viewport), masque les simulateurs mobiles, et passe sur un layout double colonne.

#### 3. Layout double colonne (Workspace d'édition)
- **Colonne de gauche : L'éditeur** (Tabs: Éditeur graphique | Éditeur YAML).
- **Colonne de droite : Live Preview** (la carte en rendu temps réel).

#### 4. Éditeur YAML
- Textarea avec police monospace (`SF Mono`, `Fira Code`), bordures de focus néon bleues.
- Parsing en temps réel via `js-yaml` sur l'événement `input` (avec anti-dérebond léger).
- Bandeau d'erreur de validation élégant sous la zone de saisie en cas de YAML mal formé.
- Bouton premium "Copier le YAML" pour récupérer la configuration d'un clic.

#### 5. Éditeur graphique (UI Editor)
- Vérification de l'enregistrement de l'éditeur custom (`customElements.get(card.tag + '-editor')`).
- Instanciation dynamique du composant éditeur, configuration via `setConfig` et transmission du `hass`.
- Écoute de l'événement `'config-changed'` pour synchroniser la configuration avec l'éditeur YAML et la preview de la carte.
- Rendu d'une UI de repli (fallback card) sci-fi premium si l'éditeur n'est pas encore enregistré.

---

### Q7 — Ce qu'on ne construit PAS

1. **Sauvegarde directe sur fichier local** : Le workbench est purement client-side et ne peut pas écrire dans les fichiers de configuration du projet. Un bouton "Copier le YAML" permet à l'utilisateur de récupérer sa configuration.
2. **Formatage automatique destructif** : Nous ne formatons pas automatiquement le code YAML pendant la saisie de l'utilisateur afin de ne pas perturber sa position de curseur. Le formatage est validé, et la preview est mise à jour uniquement si le YAML est valide.
3. **Support multi-cartes simultanées en édition** : L'éditeur se concentre sur la carte active sélectionnée via les onglets principaux du workbench.

---

## Assumptions & Risks

### Assumptions I'm making
- `js-yaml` se charge correctement depuis le CDN. *Risque : Faible* (fallback sur un parser JSON basique si js-yaml n'est pas dispo).
- Les cartes et éditeurs implémentés réagissent correctement aux changements de `hass.locale.language` via le setter de base class. *Risque : Faible* (déjà vérifié et validé dans la Spec 03).
- L'événement `'config-changed'` est correctement implémenté sur nos futurs éditeurs. *Risque : Moyen* (enforced via `base-editor.ts`).

---

## Exit Criteria Status

- [x] All 7 questions answered at "Require" level
- [x] Strategic Blueprint document created in `docs/strategic/workbench_editor_i18n_blueprint.md`
- [x] Zero ambiguity about WHAT we are building
- [x] Assumption audit completed
