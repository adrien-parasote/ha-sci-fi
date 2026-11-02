# Spec — sci-fi-bridge (v1.3 Bridge Overview)

> Document Type: Implementation
> Covers: F-BR-01 → F-BR-16 (see Blueprint Coverage below)
> Consolidated 2026-11-01 (lot fix `bridge-md-structure`) — l'historique de livraison
> est dans [spec-history.md](../bridge-md-structure/spec-history.md) ; ce document ne
> décrit plus que l'état courant. Les déclarations TypeScript qu'il reproduit sont
> vérifiées champ par champ contre `src/cards/bridge/config.ts` par
> `tests/specs/bridge-spec-structure.test.ts`.
> Depends on: [Spec 03 — Base Classes](../03_base_classes.md#blueprint-coverage) · [Spec 04 — Components](../04_components.md#blueprint-coverage) · [Strategic Blueprint](../../strategic/bridge_overview_blueprint.md#q1--what)
> ADR-005: Zero breaking YAML changes — all config field names frozen at first release.
> ADR-012: Section components independent. ADR-013: Container queries. ADR-014: Crew + ACTIONS always full-width.

---

## Blueprint Coverage

| Feature ID | Description | Covered in | Covers |
|---|---|---|---|
| F-BR-01 | `SciFiBridgeConfig` TypeScript interfaces for all sections | This spec § TypeScript Interfaces | ⬜ aucun id TC — l'alignement de l'interface de cette spec sur `src/cards/bridge/config.ts` est tenu par `tests/specs/bridge-spec-structure.test.ts` |
| F-BR-02 | `config-metadata.ts` YAML validation schema | This spec § config-metadata | ⬜ aucun id TC — `bridgeConfigMetadata` n'a aucun importeur (bead `ha-sci-fi-14z`) |
| F-BR-03 | `getRelevantEntities()` — collects all entity_ids from config | This spec § getRelevantEntities | tests/cards/bridge/sci-fi-bridge.test.ts :: TC-BRIDGE-U-08, TC-BRIDGE-U-09, TC-BRIDGE-U-10 |
| F-BR-04 | `sf-bridge-crew` — dynamic person list with zone + avatar | This spec § sf-bridge-crew | tests/cards/bridge/sci-fi-bridge.test.ts :: TC-BRIDGE-U-05, TC-BRIDGE-U-06 · tests/cards/bridge/sections/sf-bridge-crew.test.ts :: TC-BRIDGE-U-11, TC-BRIDGE-U-12 |
| F-BR-05 | `sf-bridge-alerts` — smoke + toggles + occupancy | This spec § sf-bridge-alerts | tests/cards/bridge/sections/sf-bridge-alerts.test.ts :: TC-BRIDGE-U-13, TC-BRIDGE-U-14, TC-BRIDGE-U-15, TC-BRIDGE-U-16, TC-BRIDGE-U-17 |
| F-BR-06 | `sf-bridge-stove` — pellets quantity + stock counter + status | This spec § sf-bridge-stove | tests/cards/bridge/sections/sf-bridge-stove.test.ts :: TC-BRIDGE-U-19, TC-BRIDGE-U-24 |
| F-BR-07 | `sf-bridge-vehicle` — EV power sensor read-only | This spec § sf-bridge-vehicle | tests/cards/bridge/sections/sf-bridge-vehicle.test.ts :: TC-BRIDGE-U-25, TC-BRIDGE-U-26 |
| F-BR-08 | `sf-bridge-access` — cover + lock controls (extensible list) | This spec § sf-bridge-access | tests/cards/bridge/sections/sf-bridge-access.test.ts :: TC-BRIDGE-U-18, TC-BRIDGE-U-29, TC-BRIDGE-U-31 |
| F-BR-09 | `sf-bridge-automations` — toggles + slider (extensible list) | This spec § sf-bridge-automations | tests/cards/bridge/sci-fi-bridge.test.ts :: TC-BRIDGE-U-07 · tests/cards/bridge/sections/sf-bridge-automations.test.ts :: TC-BRIDGE-U-20 |
| F-BR-10 | `sf-bridge-appliances` — cycles + consumables (extensible list) | This spec § sf-bridge-appliances | tests/cards/bridge/sections/sf-bridge-appliances.test.ts :: TC-BRIDGE-U-21, TC-BRIDGE-U-22, TC-BRIDGE-U-23 |
| F-BR-11 | `sf-bridge-actions` — quick-action buttons panel (scripts, automations, input_buttons) | This spec § sf-bridge-actions | tests/cards/bridge/sections/sf-bridge-actions.test.ts :: TC-BRIDGE-U-27, TC-BRIDGE-U-28 |
| F-BR-12 | `sci-fi-bridge` card — orchestrator + CSS Grid responsive layout | This spec § sci-fi-bridge Card | tests/cards/bridge/sci-fi-bridge.test.ts :: TC-BRIDGE-U-01, TC-BRIDGE-U-02, TC-BRIDGE-U-03, TC-BRIDGE-U-04, TC-BRIDGE-U-30, IT-BRIDGE-I-01, IT-BRIDGE-I-02, IT-BRIDGE-I-03, IT-BRIDGE-I-04, IT-BRIDGE-I-05 |
| F-BR-13 | `sci-fi-bridge-editor` — HA config editor | This spec § Editor | tests/cards/bridge/sci-fi-bridge-editor.test.ts :: IT-BRIDGE-I-08 |
| F-BR-14 | Tests ≥ 80% coverage — domain + composants | This spec § Test Case Specifications | ⬜ aucun id TC — seuil de couverture, pas un comportement : mesuré par `npm run test:coverage`, pas par un cas |
| F-BR-15 | Workbench mock — entities mockées pour validation visuelle | This spec § Workbench | tests/cards/bridge/sci-fi-bridge.test.ts :: IT-BRIDGE-I-06, IT-BRIDGE-I-07 — (scénarios 4 et 5) |
| F-BR-16 | README.md + CHANGELOG.md mis à jour | This spec § README & CHANGELOG Updates | ⬜ aucun id TC — prescription HARDEN honorée le 2026-06-02, texte archivé dans [spec-history.md](../bridge-md-structure/spec-history.md) |

---

## Context

La carte `sci-fi-bridge` est la carte dashboard maison de la release v1.3 (Bridge Overview). Elle affiche le statut global de la maison en temps réel : présence de l'équipage, alertes critiques, points d'accès, automatisations, électroménager, poêle, voiture, et un panneau d'actions rapides configurables.

**Tag custom element :** `sci-fi-bridge`
**Répertoire :** `src/cards/bridge/`
**Extends :** `SciFiBaseCard` ([Spec 03 § SciFiBaseCard](../03_base_classes.md#blueprint-coverage))

---

## YAML Configuration Schema

### Exemple complet

```yaml
# Confirmed 2026-06-01
# RÈGLE : toute section et toute sous-section est optionnelle.
# Supprimer une section = elle n'apparaît pas dans la carte.
# Supprimer une sous-section = elle n'apparaît pas dans la section.
type: custom:sci-fi-bridge

# CREW — si absent, section masquée.
persons:
  - entity: person.adrien
  - entity: person.virginie
  # Extensible : person.charlotte, person.leonard quand disponibles

# ALERTES — si absent, section masquée.
# Chaque sous-section (smoke, toggles, occupancy) est indépendante.
alerts:
  icon: "mdi:shield-alert"          # optionnel — défaut: mdi:shield-alert
  smoke:                             # optionnel — supprimer si aucun détecteur
    - entity: binary_sensor.frient_smoke_detector_salon_smoke
      name: "Salon"
      icon: "mdi:smoke-detector"     # optionnel — défaut: mdi:smoke-detector
    - entity: binary_sensor.frient_smoke_detector_garage_smoke
      name: "Stockage"
  smoke_switch: switch.smoke_detector_switch  # optionnel
  toggles:                           # optionnel — supprimer si aucun toggle
    - entity: automation.alerte_intrusion
      name: "Intrusion"
      icon: "mdi:motion-sensor"      # optionnel
    - entity: input_boolean.holidays
      name: "Vacances"
      icon: "mdi:beach"
  occupancy: binary_sensor.people_at_home  # optionnel

# ACCÈS — si absent, section masquée. Liste extensible.
access:
  icon: "mdi:door-closed"           # optionnel — défaut: mdi:door-closed
  items:
    - entity: cover.nodon_porte_garage
      name: "Porte Garage"
      icon: "mdi:garage"             # optionnel — défaut: mdi:garage
      lock: lock.zbmini_lock_porte_garage
    # Extensible : portail NodOn quand disponible
    # - entity: cover.portail
    #   name: "Portail"
    #   icon: "mdi:gate"

# AUTOMATIONS — si absent, section masquée. Liste extensible.
automations:
  icon: "mdi:robot"                  # optionnel — défaut: mdi:robot
  items:
    - entity: automation.nuit_extinction_lumieres_etage
      name: "Nuit extinction"
      type: toggle
      icon: "mdi:lightbulb-night"    # optionnel
    - entity: automation.gestion_lumieres_etage
      name: "Gestion lumières"
      type: toggle
      icon: "mdi:lightbulb-auto"
    - entity: automation.maison_vide
      name: "Maison vide"
      type: toggle
      icon: "mdi:home-off"
    - entity: input_number.temporisation_lumieres_nuit_etage
      name: "Tempo lumières"
      type: slider
      icon: "mdi:timer-outline"
      min: 0
      max: 60
      step: 5
      unit: "min"
    - entity: switch.ouvreunlivre_guest
      name: "WiFi Invité"
      type: toggle
      icon: "mdi:wifi"

# ÉLECTROMÉNAGER — si absent, section masquée. consumables optionnel.
appliances:
  icon: "mdi:washing-machine"       # optionnel — défaut: mdi:washing-machine
  cycles:
    - entity: binary_sensor.cycle_lave_linge
      name: "Lave-linge"
```

> _(block continued)_

```yaml
      icon: "mdi:washing-machine"
    - entity: binary_sensor.cycle_seche_linge
      name: "Sèche-linge"
      icon: "mdi:tumble-dryer"
    - entity: sensor.electrolux_lave_vaisselle_appliancestate
      name: "Lave-vaisselle"
      icon: "mdi:dishwasher"
      running_states:
        - "Running"
        - "Programme running"
  consumables:                       # optionnel — supprimer si aucun consommable
    - entity: binary_sensor.rinse_aid
      name: "Liquide"
      ok_when: "off"   # off = present, on = missing
    - entity: binary_sensor.salt_missing
      name: "Sel"
      ok_when: "off"

# POÊLE — si absent, section masquée.
stove:
  icon: "mdi:campfire"              # optionnel — défaut: sci:stove
  pellet_quantity: sensor.clou_pellet_quantity
  pellet_stock: counter.pellet_stock
  status: binary_sensor.clou_stove_status
  low_threshold: 0.3

# VOITURE — si absent, section masquée.
vehicle:
  icon: "mdi:ev-station"            # optionnel — défaut: mdi:ev-station
  power_sensor: sensor.mureva_evlink_power

# ACTIONS — si absent, section masquée. Liste d'actions rapides.
actions:
  icon: "mdi:lightning-bolt"         # optionnel — défaut: mdi:lightning-bolt
  items:
    - entity: input_button.call_kids
      name: "Appeler enfants"
      icon: "mdi:bullhorn"
      color: "var(--sf-primary)"
    - entity: input_button.action_wifi_guest
      name: "WiFi Invité"
      icon: "mdi:wifi-plus"
      color: "var(--sf-accent-on)"
```

### Entités incluses (# Confirmed 2026-06-01)

| Section | entity_id | Usage |
|---------|-----------|-------|
| Crew | `person.adrien` | Zone + avatar |
| Crew | `person.virginie` | Zone + avatar |
| Alerts | `binary_sensor.frient_smoke_detector_salon_smoke` | Status fumée |
| Alerts | `binary_sensor.frient_smoke_detector_garage_smoke` | Status fumée |
| Alerts | `switch.smoke_detector_switch` | Toggle sirènes |
| Alerts | `automation.alerte_intrusion` | Toggle intrusion |
| Alerts | `input_boolean.holidays` | Toggle vacances |
| Alerts | `binary_sensor.people_at_home` | Occupancy badge |
| Access | `cover.nodon_porte_garage` | Open/Close |
| Access | `lock.zbmini_lock_porte_garage` | Lock/Unlock |
| Automations | `automation.nuit_extinction_lumieres_etage` | Toggle |
| Automations | `automation.gestion_lumieres_etage` | Toggle |
| Automations | `automation.maison_vide` | Toggle |
| Automations | `input_number.temporisation_lumieres_nuit_etage` | Slider |
| Automations | `switch.ouvreunlivre_guest` | Toggle |
| Appliances | `binary_sensor.cycle_lave_linge` | Cycle status |
| Appliances | `binary_sensor.cycle_seche_linge` | Cycle status |
| Appliances | `sensor.electrolux_lave_vaisselle_appliancestate` | Cycle status |
| Appliances | `binary_sensor.rinse_aid` | Consommable |
| Appliances | `binary_sensor.salt_missing` | Consommable |
| Stove | `sensor.clou_pellet_quantity` | % pellets |
| Stove | `counter.pellet_stock` | Nb sacs |
| Stove | `sensor.clou_detailed_stove_status` (core) · `binary_sensor.clou_stove_status` (HACS) | Statut brut du poêle — **jamais `on`/`off` au sens binaire**, et pas forcément un `binary_sensor` : voir § `sf-bridge-stove` / `isOn` |
| Vehicle | `sensor.mureva_evlink_power` | Puissance W |
| Actions | `input_button.*`, `script.*`, `automation.*` | Raccourcis d'actions configurables |

### Entités exclues (rationale)

| entity_id exclu | Rationale |
|-----------------|-----------|
| `sensor.mureva_evlink_voltage` | Redondant — la puissance suffit |
| `binary_sensor.mureva_evlink_charge` | `power > 0` suffit à détecter la charge |
| `device_tracker.captur_ii_emplacement` | GPS/map → carte Vehicles dédiée |
| `sensor.clou_pellet_quantity` × attributs détaillés | Hors scope — carte Stove déjà existante |
| `valve.giex_eau_avant_*` | Carte Water Management (v1.2) |
| `switch.nodon_radiateur_*` | Carte Climates dédiée |
| `sensor.44_weather_alert` | Carte Weather dédiée |

---

## TypeScript Interfaces

**Fichier :** `src/cards/bridge/config.ts` — la carte porte ses propres interfaces
([ADR-017](../../adr/ADR-017_feature-first-modules.md) : les hubs techniques ne les
accueillent plus ; `src/types/config.ts` ne garde que `SciFiBaseConfig`, dont elles héritent)

```ts
// ── Bridge ─────────────────────────────────────────────────────────────────
// RÈGLE : tous les champs optionnels sauf entity/type/items.
// Sous-section absente = non rendue.

export interface BridgePersonEntry {
  entity: string;  // e.g. "person.adrien"
}

export interface BridgeSmokeEntry {
  entity: string;
  name: string;
  icon?: string;          // override (default: 'mdi:smoke-detector')
}

export interface BridgeToggleEntry {
  entity: string;
  name: string;
  icon?: string;          // override (default: auto par domain)
}

export interface BridgeAlertsConfig {
  icon?: string;          // section icon (default: 'mdi:shield-alert')
  smoke?: BridgeSmokeEntry[];     // OPTIONNEL — absent = sous-section masquée
  smoke_switch?: string;          // OPTIONNEL
  toggles?: BridgeToggleEntry[];  // OPTIONNEL — absent = sous-section masquée
  occupancy?: string;             // OPTIONNEL — absent = badge masqué
}

export interface BridgeAccessEntry {
  entity: string;   // cover.*
  name: string;
  icon?: string;          // override (default: 'mdi:garage')
  lock?: string;    // lock.* — OPTIONNEL
}

// access est wrappé dans un objet pour supporter l'icon section
export interface BridgeAccessConfig {
  icon?: string;          // section icon (default: 'mdi:door-closed')
  items: BridgeAccessEntry[];
}

export type BridgeAutomationType = 'toggle' | 'slider';

export interface BridgeAutomationEntry {
  entity: string;
  name: string;
  type: BridgeAutomationType;
  icon?: string;          // override (default: auto par domain)
  // slider only:
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// automations wrappé pour supporter l'icon section
export interface BridgeAutomationsConfig {
  icon?: string;          // section icon (default: 'mdi:robot')
  items: BridgeAutomationEntry[];
}

export interface BridgeCycleEntry {
  entity: string;
  name: string;
  icon: string;           // REQUIS — icône visible de l'appareil
  running_states?: string[];  // for sensor entities (non-binary)
}

export interface BridgeConsumableEntry {
  entity: string;
  name: string;
  ok_when: 'on' | 'off';
}

export interface BridgeAppliancesConfig {
  icon?: string;          // section icon (default: 'mdi:washing-machine')
  cycles: BridgeCycleEntry[];
  consumables?: BridgeConsumableEntry[];  // OPTIONNEL
}

export interface BridgeStoveConfig {
  icon?: string;          // section icon (default: 'sci:stove')
  pellet_quantity: string;
  pellet_stock: string;
  status: string;
  low_threshold?: number; // default: 0.3
}

export interface BridgeVehicleConfig {
  icon?: string;          // section icon (default: 'mdi:ev-station')
  power_sensor: string;
  name?: string;          // optional display name override (e.g. entity name chip)
}

/** A single action button in the bridge Actions panel */
export interface BridgeActionItem {
  entity: string;         // input_button, script, or automation entity
  name?: string;          // display label
  icon?: string;          // icon override (default: 'mdi:play')
  color?: string;         // accent color override (CSS color or --sf-* token)
}

export interface BridgeActionsConfig {
  icon?: string;          // section icon (default: 'mdi:lightning-bolt')
  items: BridgeActionItem[];
}

export interface SciFiBridgeConfig extends SciFiBaseConfig {
  readonly type: 'custom:sci-fi-bridge';
  title?: string;
  persons?: BridgePersonEntry[];
  alerts?: BridgeAlertsConfig;
  access?: BridgeAccessConfig;           // objet {icon?, items[]}
  automations?: BridgeAutomationsConfig; // objet {icon?, items[]}
  appliances?: BridgeAppliancesConfig;
  stove?: BridgeStoveConfig;
  vehicle?: BridgeVehicleConfig;
  actions?: BridgeActionsConfig;
}
```

> [!IMPORTANT]
> Tous les champs de `SciFiBridgeConfig` sont **optionnels** (sauf `type`). Les sous-sections comme `alerts.smoke`, `alerts.toggles`, `appliances.consumables` sont aussi optionnelles — leur absence masque uniquement la sous-section, pas la section entière. `access` et `automations` sont maintenant des objets config (avec `icon?` + `items[]`) pour supporter l'icône de section.

---

## config-metadata

**Fichier :** `src/cards/bridge/config-metadata.ts`

Structure minimale pour validation et éditeur HA :

```ts
export const bridgeConfigMetadata = {
  persons: { type: 'array', mandatory: false, default: [] },
  alerts: { type: 'object', mandatory: false },
  access: { type: 'object', mandatory: false },
  automations: { type: 'object', mandatory: false },
  appliances: { type: 'object', mandatory: false },
  stove: { type: 'object', mandatory: false },
  vehicle: { type: 'object', mandatory: false },
  actions: { type: 'object', mandatory: false },
} as const;
```

---

## getRelevantEntities

**Dans** `sci-fi-bridge.ts` — override de `SciFiBaseCard`:

```ts
protected override getRelevantEntities(): string[] {
  if (!this.config) return [];
  const ids: string[] = [];

  // Persons
  this.config.persons?.forEach(p => ids.push(p.entity));

  // Alerts (toutes sous-sections optionnelles)
  if (this.config.alerts) {
    this.config.alerts.smoke?.forEach(s => ids.push(s.entity));
    if (this.config.alerts.smoke_switch) ids.push(this.config.alerts.smoke_switch);
    this.config.alerts.toggles?.forEach(t => ids.push(t.entity));
    if (this.config.alerts.occupancy) ids.push(this.config.alerts.occupancy);
  }

  // Access — wrappé dans BridgeAccessConfig {icon?, items[]}
  this.config.access?.items?.forEach(a => {
    ids.push(a.entity);
    if (a.lock) ids.push(a.lock);
  });

  // Automations — wrappé dans BridgeAutomationsConfig {icon?, items[]}
  this.config.automations?.items?.forEach(a => ids.push(a.entity));

  // Appliances (consumables optionnel)
  if (this.config.appliances) {
    this.config.appliances.cycles?.forEach(c => ids.push(c.entity));
    this.config.appliances.consumables?.forEach(c => ids.push(c.entity));
  }

  // Stove
  if (this.config.stove) {
    ids.push(this.config.stove.pellet_quantity);
    ids.push(this.config.stove.pellet_stock);
    ids.push(this.config.stove.status);
  }

  // Vehicle
  if (this.config.vehicle) {
    ids.push(this.config.vehicle.power_sensor);
  }

  // Actions
  this.config.actions?.items?.forEach(a => ids.push(a.entity));

  return [...new Set(ids)];  // dédupliqué
}
```

---

## sci-fi-bridge Card

### File Tree

```
src/cards/bridge/
├── sci-fi-bridge.ts            — card orchestratrice
├── sci-fi-bridge-editor.ts     — éditeur Lovelace
├── config.ts                   — interfaces de la carte (ADR-017)
├── config-metadata.ts          — validation schema
├── labels.ts                   — dictionnaire getLabel() (ADR-017)
├── bridge-call.ts              — wrapper callService + toast
├── bridge-toast.ts             — émission de l'event bridge-toast
├── styles.ts                   — CSS exporté
└── sections/
    ├── sf-bridge-crew.ts
    ├── sf-bridge-alerts.ts
    ├── sf-bridge-access.ts
    ├── sf-bridge-automations.ts
    ├── sf-bridge-appliances.ts
    ├── sf-bridge-stove.ts
    ├── sf-bridge-vehicle.ts
    └── sf-bridge-actions.ts

tests/cards/bridge/
├── sci-fi-bridge.test.ts
├── sci-fi-bridge-editor.test.ts
├── bridge-call.test.ts
├── bridge-toast.test.ts
└── sections/
    └── un fichier par section, plus sf-bridge-toast-timing.test.ts
```

Hors du répertoire de la carte, et seulement consommés :
`src/utils/base-card.ts`, `src/styles/common.ts`, `src/types/config.ts`
(`SciFiBaseConfig` seul), `src/components/sf-icon/`, `src/components/sf-toast.ts`,
`src/locales/`, `dev/workbench.html` (voir § Workbench), `README.md`,
`CHANGELOG.md` et `docs/cards/bridge.md` (voir § README & CHANGELOG Updates).

### Imports de `sci-fi-bridge.ts`

```ts
import { html, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { bridgeStyles } from './styles.js';
import type { SciFiBridgeConfig } from './config.js';

import './sections/sf-bridge-crew.js';
import './sections/sf-bridge-alerts.js';
import './sections/sf-bridge-access.js';
import './sections/sf-bridge-automations.js';
import './sections/sf-bridge-appliances.js';
import './sections/sf-bridge-stove.js';
import './sections/sf-bridge-vehicle.js';
import './sections/sf-bridge-actions.js';
import '../../components/sf-toast.js';
```

### renderCard() — Structure

```html
<!-- renderCard() rend la coquille ha-card, le titre optionnel, la grille, puis le toast -->
<ha-card @bridge-toast="${this._onBridgeToast}">
${config.title ? html`<div class="bridge-card-title">${config.title}</div>` : nothing}
<div class="bridge-grid">
  <!-- CREW — toujours pleine largeur -->
  ${config.persons?.length ? html`
    <sf-bridge-crew
      .persons="${config.persons}"
      .hass="${hass}"
      class="full-width"
    ></sf-bridge-crew>
  ` : nothing}

  <!-- ALERTES — rendu si config.alerts défini (sous-sections gérées en interne) -->
  ${config.alerts ? html`
    <sf-bridge-alerts
      .config="${config.alerts}"
      .hass="${hass}"
    ></sf-bridge-alerts>
  ` : nothing}

  <!-- AUTOMATIONS — rendu si config.automations.items non vide -->
  ${config.automations?.items?.length ? html`
    <sf-bridge-automations
      .config="${config.automations}"
      .hass="${hass}"
    ></sf-bridge-automations>
  ` : nothing}

  <!-- ACCÈS — rendu si config.access.items non vide -->
  ${config.access?.items?.length ? html`
    <sf-bridge-access
      .config="${config.access}"
      .hass="${hass}"
    ></sf-bridge-access>
  ` : nothing}

  <!-- ÉLECTROMÉNAGER -->
  ${config.appliances ? html`
    <sf-bridge-appliances
      .config="${config.appliances}"
      .hass="${hass}"
    ></sf-bridge-appliances>
  ` : nothing}

  <!-- POÊLE & PELLETS -->
  ${config.stove ? html`
    <sf-bridge-stove
      .config="${config.stove}"
      .hass="${hass}"
    ></sf-bridge-stove>
  ` : nothing}

  <!-- VOITURE -->
  ${config.vehicle ? html`
    <sf-bridge-vehicle
      .config="${config.vehicle}"
      .hass="${hass}"
    ></sf-bridge-vehicle>
  ` : nothing}

  <!-- ACTIONS — toujours pleine largeur -->
  ${config.actions?.items?.length ? html`
    <sf-bridge-actions
      .config="${config.actions}"
      .hass="${hass}"
      class="full-width"
    ></sf-bridge-actions>
  ` : nothing}
</div>
<sf-toast></sf-toast>
</ha-card>
```

### Responsive Layout — styles.ts

```ts
export const bridgeStyles = css`
  .bridge-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sf-spacing-sm);
    padding: var(--sf-spacing-md);
  }

  /* ≥ 600px : 2 colonnes Pinterest — COLUMN FLOW ([ADR-016](../../adr/ADR-016_bridge-column-flow.md),
   * qui remplace la clause de layout d'ADR-013). display:block + columns:2 remplit
   * la colonne gauche de haut en bas, puis la droite — pas un row-flow grid. */
  @container sf-card (min-width: 600px) {
    .bridge-grid {
      display: block;
      columns: 2;
      column-gap: var(--sf-spacing-sm, 8px);
      padding: var(--sf-spacing-md, 12px);
      gap: unset;
    }

    .bridge-grid > * {
      break-inside: avoid;
      display: block;
      margin-bottom: var(--sf-spacing-sm, 8px);
      box-sizing: border-box;
    }

    /* Sections pleine largeur : elles couvrent les deux colonnes du flux */
    .full-width {
      column-span: all;
      margin-top: var(--sf-spacing-sm, 8px);
    }
  }

  /* CREW + ACTIONS : toujours pleine largeur ([ADR-014](../../adr/ADR-014_crew-actions-fullwidth.md)) */
  .full-width {
    grid-column: 1 / -1;   /* portrait (mode grid) seulement — en paysage c'est column-span: all, ci-dessus */
  }

  /* Section card style */
  .bridge-section {
    background: var(--sf-bg-secondary);
    border: 1px solid var(--sf-border);
    border-radius: var(--sf-radius);
    padding: var(--sf-spacing-md);
  }

  /* Section title */
  .bridge-section-title {
    font-size: var(--sf-font-size-sm);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sf-primary);
    margin-bottom: var(--sf-spacing-sm);
  }
`;
```

---

## Section Components

### sf-bridge-crew

**Tag :** `sf-bridge-crew`
**Classe CSS :** `full-width` (imposée par le parent)

**Properties :**

| Property | Type | Description |
|----------|------|-------------|
| `persons` | `BridgePersonEntry[]` | Liste des entités person.* |
| `hass` | `HomeAssistant` | Injecté par la carte parente |

**Derived values (par person) :**

| Variable | Source | Notes |
|----------|--------|-------|
| `state` | `hass.states[p.entity]?.state` | Nom de la zone HA (`home`, `work`, `school`, `not_home`, etc.) |
| `avatar` | `hass.states[p.entity]?.attributes?.entity_picture` | URL avatar natif HA, peut être null |
| `name` | `hass.states[p.entity]?.attributes?.friendly_name` | Nom affiché |
| `zonePillColor` | Mapping état → couleur (voir table ci-dessous) | |

**Zone → couleur mapping :**

| State value | Couleur | Token |
|-------------|---------|-------|
| `home` | Vert | `var(--sf-accent-on)` = `#00ff9d` |
| `work` | Jaune | `var(--sf-warning)` = `#ffd60a` |
| `school` | Jaune | `var(--sf-warning)` |
| `not_home` | Gris | `var(--sf-accent-off)` |
| Toute autre zone connue | Cyan | `var(--sf-primary)` = `#00d2ff` |
| `unavailable` / `unknown` | Gris désaturé | `var(--sf-text-disabled)` |

**Render layout :**

```
.crew-row (flex, flex-wrap: wrap, gap: 16px)
└── [per person] .crew-badge (flex-col, align-center, gap: 6px, min-width: 56px)
    ├── .crew-avatar-wrap (48px circle) .ring-home|.ring-away|.ring-other|.ring-unknown
    │   │   (halo box-shadow ; les QUATRE règles lisent --ring-color, posé inline
    │   │    depuis ringColor() — voir Zone → couleur mapping)
    │   └── .crew-avatar (img si entity_picture, sinon sf-icon mdi:account)
    └── .crew-zone-badge (coin haut-droit)
        └── sf-icon [icône de zone : mdi:home | mdi:home-off | mdi:briefcase | mdi:school | mdi:map-marker]
```

> [!IMPORTANT]
> **L'état de zone est porté par une ICÔNE, pas par un libellé texte.** Ce layout
> décrivait `.avatar`, `.crew-name` et un `.crew-zone-pill` portant le libellé
> d'état : aucun des trois n'a jamais existé dans `src/`, et le nom de la
> personne n'est pas rendu du tout (il ne sert que d'`alt` sur l'image). La
> couleur du mapping arrive par `--ring-color`, lue par les quatre règles
> `.crew-avatar-wrap.ring-home|ring-away|ring-other|ring-unknown`.
>
> **`unavailable`/`unknown` ont leur propre classe `.ring-unknown`.** Ces états
> ne sont pas « à une zone connue » : ils tombaient dans `.ring-other` et
> peignaient le halo cyan des zones connues sur une personne dont l'entité ne
> répond pas. `.ring-unknown` ne porte qu'un anneau fin désaturé, sans lueur.

> [!NOTE]
> Le `.crew-row` **passe à la ligne** quand la liste dépasse la largeur disponible (ex. 4+ personnes sur mobile portrait) : `flex-wrap: wrap` avec `gap: 16px`. Il n'y a **pas** de scroll horizontal — `overflow-x` n'est pas déclaré sur cette rangée.

---

### sf-bridge-alerts

**Tag :** `sf-bridge-alerts`

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeAlertsConfig` |
| `hass` | `HomeAssistant` |

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'mdi:shield-alert') + msg('Alertes')
│
├── [SI config.smoke?.length] .alerts-smoke-row (flex, gap: 8px, flex-wrap: wrap)
│   └── [per smoke] .smoke-chip
│       ├── sf-icon (entry.icon ?? 'mdi:smoke-detector')
│       │   color: state='off' → --sf-accent-on vert | state='on' → --sf-error rouge
│       └── .smoke-name + status icon (✓ ou ⚠)
│
├── [SI config.toggles?.length] .alerts-toggles-row (flex-col, gap: 4px)
│   └── [per toggle] .toggle-row (flex-row, align-center)
│       ├── sf-icon (entry.icon ?? icône auto par domain, --sf-text-secondary)
│       ├── .toggle-name (flex: 1)
│       └── ha-switch (checked si state = 'on' | 'enabled')
│
└── [SI config.occupancy] .occupancy-badge (flex-row, full width)
    └── badge: msg('Occupée') vert | msg('Vide') gris
```

> [!NOTE]
> Si `config.smoke` est absent (undefined ou []) → la rangée fumée n'est pas rendue. Idem pour `config.toggles`. La section `sf-bridge-alerts` reste visible si au moins une sous-section est présente. Si toutes les sous-sections sont absentes, la section est quand même rendue (avec le titre seul) — l'utilisateur a déclaré `alerts:` donc il veut la section.

**Toggle interactions :**

| Entité domain | Service appelé |
|---------------|---------------|
| `automation` | `automation.turn_on` / `automation.turn_off` |
| `input_boolean` | `input_boolean.turn_on` / `input_boolean.turn_off` |
| `switch` | `switch.turn_on` / `switch.turn_off` |

**Icône auto par domain (toggle sans icon configurée) :**

| Domain | Icône par défaut |
|--------|------------------|
| `automation` | `mdi:robot` |
| `input_boolean` | `mdi:toggle-switch` |
| `switch` | `mdi:power-plug` |

**State pour smoke :** `binary_sensor` → `off` = OK (vert `--sf-accent-on`), `on` = ALERTE (rouge `--sf-error`).

---

### sf-bridge-access

**Tag :** `sf-bridge-access`

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeAccessConfig` |
| `hass` | `HomeAssistant` |

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'mdi:door-closed') + msg('Accès')
│
└── [per entry in config.items] .access-entry (flex-row, align-center, gap: 8px, border-bottom)
    ├── sf-icon (entry.icon ?? 'mdi:garage')
    ├── .access-name (flex: 1)
    ├── .access-state-label (state text, color selon état)
    ├── [si cover] action buttons (open: mdi:arrow-up / close: mdi:arrow-down)
    └── [si entry.lock] lock icon (mdi:lock = locked --sf-accent-on / mdi:lock-open = --sf-error)
```

**Cover states → label + couleur :**

| state | Label | Couleur |
|-------|-------|---------|
| `closed` | Fermée | `var(--sf-accent-on)` vert |
| `open` | Ouverte | `var(--sf-warning)` jaune |
| `opening` / `closing` | En mouvement… | `var(--sf-primary)` cyan |
| `unavailable` | Indisponible | `var(--sf-text-disabled)` |

**Cover actions :**

```ts
private _openCover(entity: string): void {
  void this.hass.callService('cover', 'open_cover', { entity_id: entity });
}
private _closeCover(entity: string): void {
  void this.hass.callService('cover', 'close_cover', { entity_id: entity });
}
```

**Lock actions :**
Le clic sur l'icône de verrou déclenche l'inversion de l'état du verrou.
```ts
private _toggleLock(entity: string, currentState: string): void {
  const service = currentState === 'locked' ? 'unlock' : 'lock';
  void this.hass.callService('lock', service, { entity_id: entity });
}
```

> [!IMPORTANT]
> Les boutons open/close sont **icon-only** sur mobile (pas de label texte) pour économiser l'espace. Le bouton actif (ex: close quand déjà closed) a `opacity: 0.4` et `pointer-events: none`.

---

### sf-bridge-automations

**Tag :** `sf-bridge-automations`

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeAutomationsConfig` |
| `hass` | `HomeAssistant` |

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'mdi:robot') + msg('Automatisations')
│
└── [per entry in config.items]

    [si entry.type === 'toggle']
    .auto-row (flex-row, align-center, gap: 8px)
    ├── sf-icon (entry.icon ?? icône auto par domain, --sf-text-secondary)
    ├── .auto-name (flex: 1, 0.875rem)
    └── ha-switch (checked si state = 'on' | 'enabled')

    [si entry.type === 'slider']
    .slider-row (flex-col, gap: 4px)
    ├── .slider-header (flex-row, gap: 8px)
    │   ├── sf-icon (entry.icon ?? 'mdi:tune', --sf-text-secondary)
    │   ├── .auto-name (flex: 1)
    │   └── .slider-value (valeur actuelle + unit, 0.75rem, --sf-primary)
    └── input[type=range] (min/max/step depuis config)
```

**Icône auto par domain (entrée sans icon configurée) :**

| Domain | Icône par défaut |
|--------|------------------|
| `automation` | `mdi:robot` |
| `switch` | `mdi:power-plug` |
| `input_boolean` | `mdi:toggle-switch` |
| `input_number` | `mdi:tune` |

**Toggle services (par domain) :**

| Domain | Turn ON | Turn OFF |
|--------|---------|----------|
| `automation` | `automation.turn_on` | `automation.turn_off` |
| `input_boolean` | `input_boolean.turn_on` | `input_boolean.turn_off` |
| `switch` | `switch.turn_on` | `switch.turn_off` |

**Slider service :**

```ts
private _setSliderValue(entity: string, value: number): void {
  const domain = entity.split('.')[0]; // e.g. 'input_number'
  void this.hass.callService(domain, 'set_value', {
    entity_id: entity,
    value,
  });
}
```

> L'event `input` du range slider appelle `_setSliderValue` en debounce 300ms (évite les appels WS trop fréquents).

---

### sf-bridge-appliances

**Tag :** `sf-bridge-appliances`

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeAppliancesConfig` |
| `hass` | `HomeAssistant` |

**Cycle state detection :**

| Entité domain | Running quand |
|---------------|--------------|
| `binary_sensor` | `state === 'on'` |
| `sensor` | `state` est dans `entry.running_states[]` (case-insensitive) |

**Render layout :**

```
.bridge-section
├── .bridge-section-title "ÉLECTROMÉNAGER"
├── .appliances-cycles (flex-row, gap: 12px, justify-content: space-around)
│   └── [per cycle] .cycle-item (flex-col, align-center)
│       ├── sf-icon (icon depuis config, color: running → cyan + pulsing-border animation, idle → --sf-text-disabled)
│       ├── .cycle-name (0.7rem)
│       └── .cycle-status ("En cours" | "Inactif", 0.65rem)
└── [si consumables] .consumables-row (flex-row, gap: 8px, flex-wrap: wrap)
    └── [per consumable] .consumable-chip
        ├── couleur: ok_when matches state → vert, sinon → rouge
        └── text: name + (✓ ou ✗)
```

**Animation cycle actif :**

```css
@keyframes cycle-pulse {
  0%, 100% { box-shadow: 0 0 4px var(--sf-primary); }
  50%       { box-shadow: 0 0 12px var(--sf-primary); }
}
.cycle-running {
  animation: cycle-pulse 1.5s ease-in-out infinite;
}
```

---

### sf-bridge-stove

**Tag :** `sf-bridge-stove`

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeStoveConfig` |
| `hass` | `HomeAssistant` |

**Derived values :**

| Variable | Source | Notes |
|----------|--------|-------|
| `pelletQty` | `parseFloat(hass.states[config.pellet_quantity]?.state)` | 0.0–1.0 (ratio) |
| `pelletStock` | `parseInt(hass.states[config.pellet_stock]?.state)` | nb sacs |
| `isOn` | `raw !== undefined && !STOVE_OFF_STATES.has(raw)`, où `raw = hass.states[config.status]?.state` | boolean — voir la note ci-dessous |
| `isLow` | `pelletQty < (config.low_threshold ?? 0.3)` | boolean |

> [!IMPORTANT]
> **`config.status` ne renvoie jamais `on`** (lot `stove-fumis-core`, O1 — bead `ha-sci-fi-uvl`).
> Aucune génération de l'intégration Fumis ne produit cette chaîne :
> - le `binary_sensor` de l'intégration HACS `maheus/fumis_integration` écrivait le
>   texte brut du statut (`off`, `eco`, `pre_heating`, `combustion`…) malgré son
>   `device_class: running` ;
> - l'intégration core `fumis` (HA 2026.5+) n'expose aucun binary_sensor de marche —
>   `sensor.*_detailed_stove_status` est un enum de 14 valeurs.
>
> L'état de marche se décide donc par APPARTENANCE à l'ensemble des états éteints,
> jamais par égalité à `on` :
>
> ```typescript
> const STOVE_OFF_STATES = new Set([
>   'off', 'cooling', 'cold_start_off', 'wood_burning_off',
>   'unknown', 'unavailable',
> ]);
> ```
>
> `cooling` est volontairement côté éteint : le poêle ne chauffe plus, il refroidit.
> La forme reste compatible avec un vrai `binary_sensor` (`on` absent de l'ensemble
> → vrai ; `off` présent → faux).
>
> ⛔ **`config.status` n'est donc PAS contraint au domaine `binary_sensor`.** Sur
> l'intégration core c'est un `sensor`, et l'éditeur étant la seule voie sanctionnée
> (§ `sci-fi-bridge-editor`, « éditeur visuel **MANDATORY** »), sa liste déroulante du
> champ status DOIT offrir les deux domaines — `_entitiesByDomain('binary_sensor',
> 'sensor')`, la forme que `_renderAppliancesSection` emploie déjà. Une liste
> restreinte aux `binary_sensor` rend ce contrat inatteignable pour qui est passé sur
> core : la liste ne publie que l'item cliqué, la saisie libre ne fait que filtrer.
> Le champ ne se libelle plus « ON/OFF » (`input-status-sensor`).

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'sci:stove') + msg('Poêle')
│
└── .stove-row (flex-row, align-center, gap: 12px)
    ├── sf-icon (config.icon ?? 'sci:stove', color: isOn → --sf-warning, else --sf-text-disabled)
    ├── .stove-pellet-bar (flex-col, flex: 1)
    │   ├── .pellet-progress (width: pelletQty*100%, color: isLow → --sf-error, else --sf-accent-on)
    │   └── .pellet-pct ("${Math.round(pelletQty*100)}%", 0.75rem, --sf-primary)
    ├── .stove-stock ("${pelletStock} sacs", 0.875rem)
    └── .stove-status chip ("ON" --sf-accent-on | "OFF" --sf-text-disabled)
```

> [!WARNING]
> `pelletQty` est un ratio 0.0–1.0 (d'après le sensor Austroflamm Clou). Si l'entité est absente ou si la valeur n'est pas mesurable (non finie, `Number.isFinite` faux, ou négative, `< 0` ; sensor unavailable), afficher `-- %` (`.stove-pellet-placeholder`) et cacher la barre de progression ; même règle pour `pellet_stock` (`--`, `.stove-stock-placeholder`). Log : `console.warn` une fois par entité (cf. § Error Handling Matrix).

---

### sf-bridge-vehicle

**Tag :** `sf-bridge-vehicle`
**Read-only** — aucun callService.

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeVehicleConfig` |
| `hass` | `HomeAssistant` |

**Derived values :**

| Variable | Source |
|----------|--------|
| `power` | `parseFloat(hass.states[config.power_sensor]?.state)` |
| `unit` | `hass.states[config.power_sensor]?.attributes?.unit_of_measurement ?? 'W'` |
| `isCharging` | `power > 0` |

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'mdi:ev-station') + msg('Voiture')
│
└── .vehicle-row (flex-row, align-center, gap: 12px)
    ├── sf-icon (config.icon ?? 'mdi:ev-station', color: isCharging → --sf-accent-on, else --sf-text-disabled)
    ├── .vehicle-power-value ("${power} ${unit}", 1rem, --sf-primary si isCharging, else --sf-text-secondary)
    └── .vehicle-status-label (msg('En charge') | msg('Non connectée'), 0.75rem)
```

> [!NOTE]
> Capteur absent ou `power` non mesurable (non fini, `Number.isFinite` faux, ou négatif, `< 0`) : `.vehicle-power-value` affiche `-- W` (jamais `0 W`) et `.vehicle-status-label` affiche `msg('Unavailable')` (« Indisponible ») ; la section reste visible. Log : `console.warn` une fois par entité (cf. § Error Handling Matrix).


### sf-bridge-actions

**Tag :** `sf-bridge-actions`
**Pleine largeur** — rendue dans `.full-width`, comme CREW.

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeActionsConfig` |
| `hass` | `HomeAssistant` |

**State interne :**

| State | Type | Rôle |
|-------|------|------|
| `_loading` | `Set<string>` | les `entity_id` dont l'appel de service est en vol : le bouton est `disabled`, son icône passe à `mdi:loading` et porte `.spin` |

**Derived values :**

| Variable | Source |
|----------|--------|
| `sectionIcon` | `config.icon ?? 'mdi:lightning-bolt'` |
| `icon` (par item) | `item.icon ?? 'mdi:play'` |
| `label` (par item) | `item.name ?? item.entity.split('.').pop() ?? '—'` |
| `color` (par item) | `item.color ?? 'var(--sf-primary, #00d2ff)'` |

**Rendu vide :** `hass` absent ou `config.items` vide → la section ne rend rien.

**Domaine d'entité → service** (`resolveActionService`) :

| Domaine de l'entité | Service appelé |
|---|---|
| `input_button` | `input_button.press` |
| `script` | `script.turn_on` |
| `automation` | `automation.trigger` |
| tout autre | `homeassistant.turn_on` |

L'appel passe par `bridgeCall(...)` avec `{ entity_id: item.entity }` et le toast
`📣 ${label}` ; son `after` retire l'entité de `_loading`, succès comme échec. Un
clic sur un bouton déjà en vol est ignoré.

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── sf-icon (config.icon ?? 'mdi:lightning-bolt') + msg('Actions')
│
└── .actions-grid
    └── button.action-btn (un par config.items[], style --action-color: color, aria-label: label)
        ├── sf-icon (loading ? 'mdi:loading' + .spin : item.icon ?? 'mdi:play', style --icon-color: color)
        └── .action-label (label)
```

> ⚠ Les huit blocs « Render layout » ci-dessus nomment `<sf-icon>`, le composant
> que le module rend réellement. Ils ont nommé `<ha-icon>` jusqu'au 2026-11-01 :
> une maquette de conception que le code n'a jamais suivie. Corrigé par le lot
> fix specs-design-abandonne (O1, bead `ha-sci-fi-zdw.1`) ; `grep -rc ha-icon
> src/cards/bridge/` rend 0 sur les 16 fichiers du module, `sf-icon` 66.

## Editor

**Tag :** `sci-fi-bridge-editor`
**Extends :** `SciFiBaseEditor`
**Pattern :** Suit [Spec 10 § SciFiBaseEditor](../10_card_editors.md#sci-fi-bridge-editor) — accordion par section.

> [!IMPORTANT]
> L'éditeur visuel est **MANDATORY** (pas de YAML direct). Chaque section de la carte a son propre bloc d'édition dans l'éditeur.

### Sections de l'éditeur

L'éditeur est organisé en accordéons, un par section de la carte :

| Section | Type de champ |
|---------|---------------|
| **Crew** | Liste d'entités `person.*` (bouton + / bouton -) |
| **Alertes** | Icon section (text), liste smoke (entity+name+icon), smoke_switch (entity), liste toggles (entity+name+icon), occupancy (entity) |
| **Accès** | Icon section (text), liste items (entity+name+icon+lock optionnel) |
| **Automatisations** | Icon section (text), liste items (entity+name+type+icon + champs slider si type=slider) |
| **Électroménager** | Icon section (text), liste cycles (entity+name+icon+running_states), liste consumables (entity+name+ok_when) |
| **Poêle** | Icon section (text), 3 entités (pellet_quantity, pellet_stock, status), low_threshold (number) |
| **Voiture** | Icon section (text), power_sensor (entity) |
| **Actions** | liste items (entity + name + icon + color optionnels). ⚠ Pas de champ icône de section ici : `_renderActionsSection()` n'en rend aucun, `actions.icon` est YAML seulement |

### Composants SF utilisés (implémentation réelle — v1.3)

> **Note (2026-06-02):** L'éditeur a été migré des composants HA natifs vers les composants SF internes pour une meilleure intégration au design system.

| Champ | Composant SF |
|-------|-------------|
| Entité | `<sf-editor-dropdown-entity>` |
| Texte (name) | `<sf-editor-input>` |
| Icône (icon) | `<sf-editor-dropdown-icon>` — searchable, MDI + sci-fi icons |
| Nombre (threshold, min, max, step) | `<sf-editor-input type="number">` |
| Sélection (type, ok_when) | `<sf-editor-dropdown>` |
| Section entière optionnelle | `<sf-editor-accordion>` avec bouton « Activer/Désactiver » |
| Action (tap_action, hold_action) | `<sf-editor-action>` avec fallback UI si `ha-selector` absent |

### Règles

- Chaque accordéon peut être **activé/désactivé** — désactivé = supprime la section du config (la carte ne la rend plus)
- Les listes (smoke, toggles, items, cycles, consumables) ont un bouton **+ Ajouter** et un bouton **- Supprimer** par entrée
- La modification déclenche `_dispatchChange(config)` → event `config-changed` (via `SciFiBaseEditor`)
- L'éditeur lit et écrit uniquement via la configuration courante (immutable — spread complet à chaque changement)
- Le workbench passe `scenarioData` à `mountUiEditor()` et `updateCardConfig()` pour que les dropdowns restent peuplés après chaque modification de config

---

## Workbench

**Fichier :** `dev/workbench.html`

Le workbench expose **5 scénarios nommés** sélectionnables via un sélecteur en haut de page. Chaque scénario remplace l'objet `MockHass.states` complet.

### États partagés (toujours présents)

```ts
const BASE_ENTITIES = {
  'person.adrien':   { state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: '/local/avatars/adrien.jpg' } },
  'person.virginie': { state: 'home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
};
```

### Scénario 1 — Normal (tout OK)

> **Objectif :** vérifier le rendu de base, aucune alerte, tout inactif.

```ts
const scenarioNormal = {
  ...BASE_ENTITIES,
  'binary_sensor.frient_smoke_detector_salon_smoke':  { state: 'off' },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'off' },
  'switch.smoke_detector_switch': { state: 'on' },
  'automation.alerte_intrusion':  { state: 'off' },
  'input_boolean.holidays':       { state: 'off' },
  'binary_sensor.people_at_home': { state: 'on' },
  'cover.nodon_porte_garage':            { state: 'closed' },
  'lock.zbmini_lock_porte_garage':       { state: 'locked' },
  'automation.nuit_extinction_lumieres_etage': { state: 'on' },
  'automation.gestion_lumieres_etage':   { state: 'on' },
  'automation.maison_vide':              { state: 'off' },
  'input_number.temporisation_lumieres_nuit_etage': { state: '10', attributes: { min: 0, max: 60, step: 5 } },
  'switch.ouvreunlivre_guest':           { state: 'off' },
  'binary_sensor.cycle_lave_linge':      { state: 'off' },
  'binary_sensor.cycle_seche_linge':     { state: 'off' },
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'Standby' },
  'binary_sensor.rinse_aid':             { state: 'off' },
  'binary_sensor.salt_missing':          { state: 'off' },
  'sensor.clou_pellet_quantity':         { state: '0.65' },
  'counter.pellet_stock':                { state: '18' },
  'binary_sensor.clou_stove_status':     { state: 'off' },
  'sensor.mureva_evlink_power':          { state: '0', attributes: { unit_of_measurement: 'W' } },
};
```

### Scénario 2 — Mode Alerte

> **Objectif :** vérifier les états d'alerte (fumée ON, portail ouvert, voiture en charge, consommables manquants).

```ts
const scenarioAlert = {
  ...scenarioNormal,
  'person.virginie': { state: 'not_home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'on' },  // ALERTE
  'automation.alerte_intrusion': { state: 'on' },
  'cover.nodon_porte_garage':    { state: 'open' },  // portail ouvert
  'binary_sensor.cycle_lave_linge': { state: 'on' },  // cycle actif
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'Running' },
  'binary_sensor.rinse_aid':     { state: 'on' },    // consommable manquant
  'sensor.clou_pellet_quantity': { state: '0.15' },  // pellets bas
  'sensor.clou_detailed_stove_status': { state: 'combustion' },  // core fumis — jamais 'on'
  'sensor.mureva_evlink_power':  { state: '2300', attributes: { unit_of_measurement: 'W' } },
};
```

### Scénario 3 — Maison Vide (Absent)

> **Objectif :** vérifier le rendu quand personne n'est à la maison + automation maison_vide active.

```ts
const scenarioAway = {
  ...scenarioNormal,
  'person.adrien':   { state: 'work',     attributes: { friendly_name: 'Adrien',   entity_picture: '/local/avatars/adrien.jpg' } },
  'person.virginie': { state: 'not_home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.people_at_home': { state: 'off' },
  'automation.maison_vide': { state: 'on' },
  'input_boolean.holidays': { state: 'on' },
};
```

### Scénario 4 — Déconnecté (Entités Unavailable)

> **Objectif :** vérifier les fallbacks — aucune entité ne répond, tout est `unavailable`.

```ts
const scenarioDisconnected = {
  // Toutes les entités en état unavailable
  'person.adrien':   { state: 'unavailable', attributes: { friendly_name: 'Adrien', entity_picture: null } },
  'person.virginie': { state: 'unavailable', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'binary_sensor.frient_smoke_detector_salon_smoke':  { state: 'unavailable' },
  'binary_sensor.frient_smoke_detector_garage_smoke': { state: 'unavailable' },
  'switch.smoke_detector_switch': { state: 'unavailable' },
  'automation.alerte_intrusion':  { state: 'unavailable' },
  'input_boolean.holidays':       { state: 'unavailable' },
  'binary_sensor.people_at_home': { state: 'unavailable' },
  'cover.nodon_porte_garage':     { state: 'unavailable' },
  'lock.zbmini_lock_porte_garage':{ state: 'unavailable' },
  'automation.nuit_extinction_lumieres_etage': { state: 'unavailable' },
  'automation.gestion_lumieres_etage':   { state: 'unavailable' },
  'automation.maison_vide':              { state: 'unavailable' },
  'input_number.temporisation_lumieres_nuit_etage': { state: 'unavailable' },
  'switch.ouvreunlivre_guest':           { state: 'unavailable' },
  'binary_sensor.cycle_lave_linge':      { state: 'unavailable' },
  'binary_sensor.cycle_seche_linge':     { state: 'unavailable' },
  'sensor.electrolux_lave_vaisselle_appliancestate': { state: 'unavailable' },
  'binary_sensor.rinse_aid':             { state: 'unavailable' },
  'binary_sensor.salt_missing':          { state: 'unavailable' },
  'sensor.clou_pellet_quantity':         { state: 'unavailable' },
  'counter.pellet_stock':                { state: 'unavailable' },
  'binary_sensor.clou_stove_status':     { state: 'unavailable' },
  'sensor.mureva_evlink_power':          { state: 'unavailable', attributes: { unit_of_measurement: 'W' } },
};
```

### Scénario 5 — Config Partielle (CREW uniquement)

> **Objectif :** vérifier qu'une config minimale fonctionne sans sections intermédiaires.

```ts
// YAML pour ce scénario :
// type: custom:sci-fi-bridge
// persons:
//   - entity: person.adrien

const scenarioMinimal = {
  ...BASE_ENTITIES,
};
// → La carte doit afficher CREW uniquement, sans section vide visible.
```

---

## i18n

**Framework :** `@lit/localize` — même pattern que toutes les cartes existantes.
**Règle :** Ne jamais modifier `src/locales/locales/fr.js` à la main. Toujours passer par `xliff/fr.xlf` + `npx lit-localize build`.

### Pattern éditeur

L'éditeur bridge utilise **exclusivement** `this.getLabel('key')` via `SciFiBaseEditor` — jamais `msg('string_fr')` directement dans les templates. Les clés sont en anglais, les traductions FR sont dans `base-editor.ts` et `xliff/fr.xlf`.

```ts
// ✅ Correct
title="${this.getLabel('section-title-crew')}"
// ⛔ Interdit dans l'éditeur
title="${msg('Équipage')}"
```

### Clés `getLabel()` bridge (dans `src/cards/bridge/labels.ts`)

> ADR-017 : ces clés ont quitté `sharedEditorLabels()` pour le dictionnaire de
> la carte. Seules les clés effectivement consommées par l'éditeur figurent
> ici — une clé sans consommateur se supprime, elle ne se réserve pas.

| Clé | EN source | FR target |
|-----|-----------|----------|
| `section-title-crew` | `Crew` | `Équipage` |
| `section-title-alerts` | `Alerts` | `Alertes` |
| `section-title-access` | `Access` | `Accès` |
| `section-title-automations` | `Automations` | `Automatisations` |
| `section-title-appliances` | `Appliances` | `Électroménager` |
| `section-title-stove` | `Stove` | `Poêle` |
| `section-title-vehicle` | `Vehicle` | `Véhicule` |
| `section-title-actions` | `Actions` | `Actions` |
| `section-title-action` | `Action` | `Action` |
| `action-enable-section` | `Enable section` | `Activer la section` |
| `action-disable` | `Disable` | `Désactiver` |
| `action-remove` | `Remove` | `Retirer` |
| `action-add-smoke` | `Smoke` | `Fumée` |
| `action-add-toggle` | `Toggle` | `Toggle` |
| `action-add-appliance` | `Appliance` | `Appareil` |
| `action-add-consumable` | `Consumable` | `Consommable` |
| `input-icon-section` | `Section icon` | `Icône section` |
| `input-smoke-sensors` | `Smoke sensors` | `Détecteurs fumée` |
| `input-binary-sensor-entity` | `binary_sensor entity` | `Entité binary_sensor` |
| `input-icon-optional` | `Icon (opt.)` | `Icône (opt.)` |
| `input-siren-switch` | `Siren switch (optional)` | `Switch sirènes (optionnel)` |
| `input-alert-toggles` | `Alert toggles` | `Toggles alertes` |
| `input-occupancy-entity` | `Occupancy entity (opt.)` | `Entité occupancy (opt.)` |
| `input-cover-entity` | `Cover entity` | `Entité cover` |
| `input-lock-optional` | `Lock (optional)` | `Verrou (optionnel)` |
| `input-action-entity` | `Entity (input_button / script / automation)` | `Entité (input_button / script / automation)` |
| `input-color-optional` | `Color (opt.)` | `Couleur (opt.)` |
| `input-type` | `Type` | `Type` |
| `input-min` | `Min` | `Min` |
| `input-max` | `Max` | `Max` |
| `input-step` | `Step` | `Step` |
| `input-unit` | `Unit` | `Unité` |
| `input-appliances` | `Appliances` | `Appareils` |
| `input-consumables` | `Consumables (optional)` | `Consommables (optionnel)` |
| `input-power-sensor` | `Power sensor (W)` | `Capteur puissance (W)` |
| `input-pellet-qty-sensor` | `Pellet quantity sensor` | `Capteur quantité pellets` |
| `input-status-sensor` | `Stove status sensor` | `Capteur de statut du poêle` |
| `input-bag-counter` | `Bag stock counter` | `Compteur stock sacs` |
| `input-pellet-low-threshold` | `Pellet low threshold (0.0–1.0)` | `Seuil bas pellets (0.0–1.0)` |
| `input-ok-when` | `OK when` | `OK quand` |

> [!IMPORTANT]
> Pour les labels de la **carte** (pas de l'éditeur), `msg()` direct reste valide dans les templates Lit : `msg('En cours')`, `msg('Inactif')`, `msg('En charge')`, etc.
> Pour les labels de l'**éditeur**, utiliser exclusivement `this.getLabel('key')`.

### Protocole d'ajout de traduction éditeur

1. Ajouter la clé EN dans `src/utils/base-editor.ts` → `getLabel()` : `'ma-cle': msg('English label')`
2. Exécuter `npx lit-localize extract` → nouvelle `<trans-unit>` dans `xliff/fr.xlf`
3. Ajouter `<target>Traduction FR</target>` dans `xliff/fr.xlf`
4. Exécuter `npx lit-localize build` → régénère `src/locales/locales/fr.js`
5. Ne pas committer `src/locales/locales/fr.js` seul sans `fr.xlf` + `base-editor.ts`

---

## Constraints

| Tier | Examples |
|------|----------|
| **Always do** | Utiliser uniquement les tokens `--sf-*` de `common.ts`; implémenter `getRelevantEntities()`; exporter les styles depuis `styles.ts`; garder chaque composant section < 200 lignes; utiliser `container-type: inline-size` pour le responsive; utiliser `this.getLabel('key')` pour tous les labels de l'éditeur (jamais `msg('string_fr')` dans les templates éditeur); utiliser `msg()` direct pour les labels de la carte |
| **Ask first** | Ajouter une nouvelle dépendance npm; modifier les noms de champs YAML après premier déploiement (ADR-005); changer le breakpoint responsive (600px); ajouter une nouvelle clé `getLabel()` non listée dans § i18n |
| **Never do** | Utiliser `@media` queries (utiliser `@container` à la place); hardcoder une couleur hors palette `--sf-*`; muter `this.config` ou `this.hass`; appeler `callService` sans `.catch()`; afficher une stack trace à l'utilisateur; hardcoder une string FR/EN dans le template sans `msg()` |

---

## Cross-Spec Contracts

### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| `src/cards/bridge/sci-fi-bridge.ts` | Web Component | This spec § sci-fi-bridge Card | Lovelace via `sci-fi.ts` entry point |
| `src/cards/bridge/config.ts` | TS interfaces | This spec § TypeScript Interfaces | `src/cards/bridge/sci-fi-bridge.ts`, `src/cards/bridge/sci-fi-bridge-editor.ts` |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | [Spec 03 § styles](../03_base_classes.md#blueprint-coverage) | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | [Spec 03 § SciFiBaseCard](../03_base_classes.md#blueprint-coverage) | `src/utils/base-card.ts` |
| `SciFiBaseEditor` | Abstract class | [Spec 10 § SciFiBaseEditor](../10_card_editors.md#sci-fi-bridge-editor) | `src/utils/base-editor.ts` |

### Public Interface

| Element | Consumed by | Description |
|---|---|---|
| `<sci-fi-bridge>` | HA Lovelace | Card principale |
| `<sci-fi-bridge-editor>` | HA UI | Éditeur config |

### External Invocations

| Service domain | Action | Params | When |
|---|---|---|---|
| `cover` | `open_cover` / `close_cover` | `{ entity_id }` | Clic bouton accès |
| `automation` | `turn_on` / `turn_off` | `{ entity_id }` | Toggle automation |
| `input_boolean` | `turn_on` / `turn_off` | `{ entity_id }` | Toggle holidays |
| `switch` | `turn_on` / `turn_off` | `{ entity_id }` | Toggle WiFi guest, smoke switch |
| `input_number` | `set_value` | `{ entity_id, value }` | Slider tempo |
| `input_button` | `press` | `{ entity_id }` | Actions — entité `input_button.*` |
| `script` | `turn_on` | `{ entity_id }` | Actions — entité `script.*` |
| `automation` | `trigger` | `{ entity_id }` | Actions — entité `automation.*` |
| `homeassistant` | `turn_on` | `{ entity_id }` | Actions — repli pour tout autre domaine (`resolveActionService`) |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `getRelevantEntities()` | Défini ici — collecte toutes les entity_ids | [Spec 03 § shouldUpdate](../03_base_classes.md#blueprint-coverage), [Blueprint ADR-008](../../strategic/blueprint.md#adr-008) |
| Zone → couleur mapping | Défini ici § sf-bridge-crew | N/A — utilisé uniquement ici |

---

## Anti-Patterns

| # | Anti-Pattern | Violation | Correct Behavior |
|---|---|---|---|
| 1 | **Hardcoder la liste des `person.*`** | `const persons = ['person.adrien', 'person.virginie']` en dur dans le code | Toujours lire depuis `config.persons[]` — extensible sans modifier le code |
| 2 | **Utiliser `@media` queries** | `@media (min-width: 600px) { ... }` | Utiliser `@container sf-card (min-width: 600px)` — réagit à la largeur de la carte, pas du viewport |
| 3 | **Couleurs hardcodées hors palette** | `color: #a855f7` (violet externe) | Utiliser uniquement les tokens `--sf-*` définis dans `common.ts` |
| 4 | **Un seul gros `render()` monolithique** | Tout le rendu dans `sci-fi-bridge.ts::renderCard()` | Chaque section = un `@customElement` distinct — testable et ré-rendable indépendamment |
| 5 | **Oublier `getRelevantEntities()`** | `shouldUpdate` non overridé → re-render à chaque changement HA | `getRelevantEntities()` retourne la liste exacte des entity_ids suivis par la config |
| 6 | **callService sans error handling** | `void this.hass.callService(...)` sans `.catch()` | Toujours `.catch((e) => console.error(...))` sur les callService — ne pas exposer l'erreur à l'utilisateur |
| 7 | **Slider qui appelle callService à chaque tick** | `@input="${() => this._setSlider(...)}"` | Debounce 300ms sur l'event `input` avant callService |
| 8 | **Section entière masquée si une entité est unavailable** | `if (!state) return nothing` pour toute la section | Rendre la section avec état `unavailable` visible — ne cacher que l'indicateur individuel manquant |
| 9 | **Masquer une sous-section parce que 1 entité manque** | `if (!config.alerts.smoke) return nothing` → cache toute la section alerts | Chaque sous-section est conditionnelle indépendamment: `config.alerts.smoke?.length` → smoke row, `config.alerts.toggles?.length` → toggles row |
| 10 | **Icône hardcodée dans le template** | `html\`<sf-icon icon="mdi:garage">\`` | Lire `entry.icon ?? 'mdi:garage'` — permet la personnalisation YAML sans modifier le code |
| 11 | **String label FR/EN sans `msg()`** | `html\`<span>En cours</span>\`` | Toujours `msg('En cours')` — `@lit/localize` traduit au runtime selon la langue HA |
| 12 | **Accéder à `config.automations` comme un array** | `config.automations.forEach(...)` | `config.automations` est `BridgeAutomationsConfig` (objet). Itérer sur `config.automations.items.forEach(...)` |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-BRIDGE-U-01 | Unit | `getConfigElement()` retourne le bon tag éditeur | Static call | `tagName === 'sci-fi-bridge-editor'` |
| TC-BRIDGE-U-02 | Unit | `getStubConfig()` retourne le bon type | Static call | `config.type === 'custom:sci-fi-bridge'` |
| TC-BRIDGE-U-03 | Unit | Render vide sans `hass` | No hass | `shadowRoot.textContent` is empty |
| TC-BRIDGE-U-04 | Unit | Render vide sans `config` | No config | `shadowRoot.textContent` is empty |
| TC-BRIDGE-U-05 | Unit | Section CREW absente si `config.persons` non défini | config sans persons | `querySelector('sf-bridge-crew')` is null |
| TC-BRIDGE-U-06 | Unit | Section CREW présente si `config.persons` défini | config avec persons | `querySelector('sf-bridge-crew')` not null |
| TC-BRIDGE-U-07 | Unit | Section AUTOMATIONS absente si `config.automations` non défini | config sans automations | `querySelector('sf-bridge-automations')` is null |
| TC-BRIDGE-U-08 | Unit | `getRelevantEntities()` itère sur `access.items` (pas tableau direct) | access config objet | entity_ids de access.items présents dans le résultat |
| TC-BRIDGE-U-09 | Unit | `getRelevantEntities()` itère sur `automations.items` | automations config objet | entity_ids de automations.items présents |
| TC-BRIDGE-U-10 | Unit | `getRelevantEntities()` déduplique les doublons | Config avec même entity 2x | Array.length < nb entrées config |
| TC-BRIDGE-U-11 | Unit | Zone `home` → couleur vert (`--sf-accent-on`) | person state = 'home' | `.crew-avatar-wrap.ring-home` porte `--ring-color` = token vert |
| TC-BRIDGE-U-12 | Unit | **Les SIX lignes du Zone → couleur mapping**, une par une | person state = 'home', 'work', 'school', 'not_home', une zone quelconque, 'unavailable', 'unknown' | Chaque état porte sa classe ET son token dans `--ring-color` : home→`.ring-home`/`--sf-accent-on` · work et school→`.ring-other`/`--sf-warning` · not_home→`.ring-away`/`--sf-accent-off` · autre zone connue→`.ring-other`/`--sf-primary` · unavailable et unknown→`.ring-unknown`/`--sf-text-disabled`. **Chaque cas exige aussi l'ABSENCE du token voisin** (work ne doit pas peindre `--sf-primary`, not_home ne doit pas peindre `--sf-text-disabled`) : la classe seule est identique pour work, school et les autres zones, donc l'asserter ne distingue rien. Et une assertion séparée exige que les quatre règles CSS `ring-*` lisent `var(--ring-color)` — sans elle, la propriété inline n'est reliée au halo peint que par le snapshot CSS, et revertir règle + snapshot ensemble remettrait le défaut au vert |
| TC-BRIDGE-U-13 | Unit | alerts.smoke absent → rangée fumée non rendue | alerts sans smoke | `.alerts-smoke-row` absent du shadow DOM |
| TC-BRIDGE-U-14 | Unit | alerts.toggles absent → rangée toggles non rendue | alerts sans toggles | `.alerts-toggles-row` absent du shadow DOM |
| TC-BRIDGE-U-15 | Unit | Fumée `off` → icône verte (OK) | smoke state = 'off' | `.smoke-chip` color = `--sf-accent-on` |
| TC-BRIDGE-U-16 | Unit | Fumée `on` → icône rouge (ALERTE) | smoke state = 'on' | `.smoke-chip` color = `--sf-error` |
| TC-BRIDGE-U-17 | Unit | Icône entrée smoke customisée via config | smoke entry.icon = 'mdi:fire' | `.smoke-chip sf-icon` porte `icon='mdi:fire'` |
| TC-BRIDGE-U-18 | Unit | Icône entrée access customisée via config | access `items[].icon` renseigné | `.access-icon-wrap sf-icon` porte cette valeur — le wrap est le conteneur d'icône de `.access-entry` |
| TC-BRIDGE-U-19 | Unit | Icône section stove customisée via config, et son défaut | stove.icon = 'mdi:campfire', puis stove sans `icon` | `sf-icon[icon='mdi:campfire']` dans `.bridge-section-title` de stove ; sans `icon`, le défaut est **`sci:stove`** (et non `mdi:fire`) — cohérent avec `sci:stove-heat`/`sci:stove-off` que la même section rend pour le corps. L'éditeur propose le même défaut (lot fix stove-config-surface, O7) |
| TC-BRIDGE-U-20 | Unit | Toggle automation ON → callService `turn_on` | clic toggle, state = 'off' | `hass.callService` appelé avec `automation.turn_on` |
| TC-BRIDGE-U-21 | Unit | Cycle lave-linge `on` → status msg('En cours') + animation | cycle state = 'on', **locale `fr` forcée** | `.cycle-running` class présente + `.cycle-status` textContent = 'En cours'. La locale doit être posée explicitement (`await setLocale('fr')`) : le code rend `msg('Running')`, qui ne devient 'En cours' qu'en FR — sans cela le DOM porte 'Running' et l'exigence n'est pas assertable |
| TC-BRIDGE-U-22 | Unit | Consumable `ok_when: 'off'` + state `off` → vert | rinse_aid = 'off' | `.consumable-chip` color = `--sf-accent-on` |
| TC-BRIDGE-U-23 | Unit | Consumable `ok_when: 'off'` + state `on` → rouge | rinse_aid = 'on' | `.consumable-chip` color = `--sf-error` |
| TC-BRIDGE-U-24 | Unit | Pellets sous le seuil → jauges en état warning, et au-dessus → jauges nettes | pellet_quantity = '0.2' puis '0.8', threshold = 0.3 | `sf-circle-progress-bar` rend `.circular-progress.warning` dans son shadow DOM, et `sf-stack-bar` un `.warning` ; au-dessus du seuil, aucun des deux. ⚠ Les jauges sont **déléguées** à ces deux composants partagés : il n'existe ni `.pellet-progress`, ni `.stove-pellet-bar`, ni variable `isLow` dans la carte — la décision warning appartient aux widgets (`val / 100 < threshold`). Asserter les props passées, ou recalculer cette formule dans le test, ne prouve rien du rendu |
| TC-BRIDGE-U-25 | Unit | EV power = 0 → msg('Non connectée') | power = '0', locale `fr` | `.vehicle-status-label` textContent = 'Non connectée', ET `sf-icon[icon='sci:landspeeder-plugged']` absent. ⚠ Asserter `sf-icon[icon='sci:landspeeder']` ne vaut RIEN ici : l'icône du titre de section porte le même nom et se rend inconditionnellement, donc l'assertion passait aussi pour power > 0 |
| TC-BRIDGE-U-26 | Unit | EV power > 0 → msg('En charge') | power = '2300', locale `fr` | `.vehicle-status-label` textContent = 'En charge', ET `sf-icon[icon='sci:landspeeder-plugged']` présent dans la rangée de statut. La cible est `.vehicle-status-label` — `.vehicle-status` n'a jamais existé dans `src/` |
| TC-BRIDGE-U-27 | Unit | ACTIONS bouton → callService press/turn_on/trigger | clic bouton action | `hass.callService` appelé avec le service approprié |
| TC-BRIDGE-U-28 | Unit | ACTIONS couleur customisée | color = '#ff0000' | bouton action hérite de la couleur customisée |
| TC-BRIDGE-U-29 | Unit | Cover state `closed` → bouton open actif, close désactivé | cover = 'closed' | close button porte `.disabled` et open ne le porte PAS (sans ce second point, deux boutons désactivés satisferaient le cas). Ce que `.disabled` fait — `opacity: 0.3` + `pointer-events: none` — est épinglé par `tests/styles/card-css-baseline.json`, gardien canonique des valeurs CSS calculées dans ce dépôt ; le test de section ne le redouble pas. ⚠ **0.3, et non 0.4** : la valeur livrée est 0.3 depuis l'origine (`src/cards/bridge/styles.ts`), elle est gelée dans `tests/styles/card-css-baseline.json`, et rien ne distingue fonctionnellement les deux — c'est la spec qui est alignée sur le livré, pas l'inverse. Asserter la seule classe ne protégeait aucune des deux valeurs |
| TC-BRIDGE-U-30 | Unit | Toutes sections absentes si config vide | `{}` config | Seul `.bridge-grid` présent, zéro `sf-bridge-*` |
| TC-BRIDGE-U-31 | Unit | Libellé d'état du cover, localisé | cover = 'closed' | `.access-state-tag` porte la classe `state-closed` et son `textContent` est `Closed` dans la locale source (`Fermée` sous `fr`, via `xliff/fr.xlf`) |
| IT-BRIDGE-I-01 | Integration | Carte enregistrée dans `customElements` | Load card | `customElements.get('sci-fi-bridge')` returns class |
| IT-BRIDGE-I-02 | Integration | Render complet avec config de référence (Scénario 1) | Full mock hass Scenario 1 | Tous les 8 composants section présents |
| IT-BRIDGE-I-03 | Integration | `styles.ts` importé — zéro CSS inline dans `sci-fi-bridge.ts` | grep | `grep -c "css\`" src/cards/bridge/sci-fi-bridge.ts` returns 0 |
| IT-BRIDGE-I-04 | Integration | Breakpoint responsive : 1 col < 600px | container width 390px | `.bridge-grid` a `grid-template-columns: 1fr` |
| IT-BRIDGE-I-05 | Integration | Breakpoint responsive : flux colonne ≥ 600px ([ADR-016](../../adr/ADR-016_bridge-column-flow.md)) | `@container sf-card (min-width: 600px)` | `.bridge-grid` passe en `display: block; columns: 2`, enfants en `break-inside: avoid` |
| IT-BRIDGE-I-06 | Integration | Scénario 4 (Disconnected) — aucune section ne crash | Scénario unavailable | Carte rendue sans erreur JS, tous les `--` affichés |
| IT-BRIDGE-I-07 | Integration | Scénario 5 (Minimal) — seuls CREW + ACTIONS visibles | config partielle | `querySelector('sf-bridge-alerts')` is null, CREW et ACTIONS présents |
| IT-BRIDGE-I-08 | Integration | L'éditeur émet `config-changed` à chaque mise à jour de champ | update d'un champ de l'éditeur | un event `config-changed` porte la config modifiée (`tests/cards/bridge/sci-fi-bridge-editor.test.ts`) |

---

## Error Handling Matrix

| Error | Detection | User Response | Fallback | Logging |
|---|---|---|---|---|
| `hass` absent | `SciFiBaseCard` guard | — | Carte vide transparente | — |
| Section config absente | `config.section === undefined` | Section non rendue | Sections définies restent visibles | — |
| Entité absente de `hass.states` | `hass.states[id]?.state === undefined` | Indicateur individuel affiche `--` sur un emplacement de valeur (pastille fumée, occupation, cycle, consommable, statut poêle, valeur du slider) ou `Unavailable` sur une étiquette d'état (accès, véhicule) ; ailleurs un état neutre (ni « on/ok » ni « off/idle ») et les contrôles liés sont désactivés. Une `entity` vide n'est jamais journalisée | Section reste visible | `console.warn('[sf-bridge] entity not found:', id)` **une fois par entité** (`Set` de module, vidé par `setConfig()`) |
| Entité `unavailable` / `unknown` | `state === 'unavailable'` ou `'unknown'` | Valeur affichée en gris désaturé ; sur un emplacement numérique (pellet, stock, puissance EV) : `--` | Section reste visible | `—` ; `console.warn('[sf-bridge] non-numeric state:', id)` une fois par entité sur les trois emplacements numériques |
| `callService` echec (toggle/cover/etc.) | `.catch((e) => ...)` | Aucun message visible — log console | État HA inchangé | `console.error('[sf-bridge] callService error:', e)` |
| `pellet_quantity` non numérique | `!Number.isFinite(parseFloat(state))` ou valeur `< 0` | Afficher `-- %`, cacher barre | Stock sacs reste visible | `console.warn('[sf-bridge] non-numeric state:', id)` une fois par entité (`Set` vidé par `setConfig()`) |
| EV power non numérique | `!Number.isFinite(parseFloat(state))` ou valeur `< 0` | Afficher `-- W`, "Indisponible" | Section reste visible | `console.warn('[sf-bridge] non-numeric state:', id)` une fois par entité (`Set` vidé par `setConfig()`) |
| Config invalide (`setConfig`) | Validation dans `setConfig()` | Afficher `sf-error-card` avec message | Carte en erreur visible | `console.error('[sf-bridge] invalid config:', message)` |

> [!IMPORTANT]
> **Behavioral claims — tranchées (2026-11-01, lot fix bridge-md-structure).**
> Aucune des deux ne reste ASSUMED : le livré ne dépend d'aucun des deux sens.
> - `binary_sensor.rinse_aid` — **non load-bearing.** Le sens n'est pas câblé : la
>   carte lit `ok_when` par consommable (`off` ou `on`) et TC-BRIDGE-U-22/23
>   épinglent les deux sens. Si le capteur réel inverse la polarité, c'est une
>   valeur de configuration qui change, pas le code ni cette spec.
> - `sensor.clou_pellet_quantity` — **ratio 0.0–1.0, confirmé par l'usage.** La
>   carte Stove livrée le consomme ainsi avec `pellet_quantity_threshold: 0.3`, et
>   TC-BRIDGE-U-24 l'épingle à travers les deux jauges partagées.

---

## README & CHANGELOG Updates

Honoré le 2026-06-02 (F-BR-16) : `README.md`, `CHANGELOG.md` et
`docs/cards/bridge.md` portent la carte. La prescription elle-même — ce qu'il
fallait écrire dans chacun des trois — est archivée dans
[spec-history.md](../bridge-md-structure/spec-history.md) : une consigne de
HARDEN accomplie n'est plus un contrat à confronter au code.

---

## Deep Links

| Reference | Location |
|---|---|
| Strategic Blueprint Bridge | [bridge_overview_blueprint.md](../../strategic/bridge_overview_blueprint.md#blueprint-coverage) |
| SciFiBaseCard | [03_base_classes.md](../03_base_classes.md#blueprint-coverage) |
| SciFiBaseEditor | [10_card_editors.md](../10_card_editors.md#blueprint-coverage) |
| Common styles tokens | [src/styles/common.ts](../../../src/styles/common.ts#L1) |
| Interfaces de la carte | [src/cards/bridge/config.ts](../../../src/cards/bridge/config.ts#L1) |
| Stove spec (pattern styles) | [stove.md](./stove.md#blueprint-coverage) |
| Vehicle spec (pattern services) | [vehicles.md](./vehicles.md#blueprint-coverage) |
| Water Management spec (pattern structure) | [water.md](./water.md#blueprint-coverage) |
| Mock workbench pattern | [dev/workbench.html](../../../dev/workbench.html#L1) |
| sci-fi.ts entry point (enregistrement carte) | [src/sci-fi.ts](../../../src/sci-fi.ts#L1) |

## Shared Artifact Schema

### `this.config`
| Field | Type | Description |
|---|---|---|
| type | `'custom:sci-fi-bridge'` | Readonly card type discriminator (`SciFiBaseConfig`). |
| title | string | Optional card title. |
| header_message | string | Hérité de `SciFiBaseConfig`, readonly, optionnel. |
| tap_action | object | Hérité de `SciFiBaseConfig` — `ActionConfig`, readonly, optionnel. |
| hold_action | object | Hérité de `SciFiBaseConfig` — `ActionConfig`, readonly, optionnel. |
| double_tap_action | object | Hérité de `SciFiBaseConfig` — `ActionConfig`, readonly, optionnel. |
| alerts | object | Alerts configuration. |
| persons | array | Persons configuration. |
| access | object | Access configuration. |
| automations | object | Automations configuration. |
| appliances | object | Appliances configuration. |
| stove | object | Stove configuration. |
| vehicle | object | Vehicle configuration. |
| actions | object | Actions configuration. |

## Assumptions
| # | Assumption | Risk | Validation |
|---|------------|------|------------|
| 1 | The user has the necessary entities created in Home Assistant. | Low | Validated via HA entity registry — graceful fallback if entity missing |
| 2 | Lovelace custom cards are enabled and correctly registered. | Medium | Verified via `customElements.get` check in `getCardSize()` |
| 3 | The SciFiBaseCard provides all necessary styling variables. | Low | Verified via `grep -r sciFiCommonStyles src/` — imported in all card classes |
