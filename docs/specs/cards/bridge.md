# Spec — sci-fi-bridge (v1.3 Bridge Overview)

> Document Type: Implementation
> Covers: F-BR-01 → F-BR-15 (see Blueprint Coverage below)
> Depends on: [Spec 03 — Base Classes](../03_base_classes.md) · [Spec 04 — Components](../04_components.md) · [Strategic Blueprint](../../strategic/bridge_overview_blueprint.md)
> ADR-005: Zero breaking YAML changes — all config field names frozen at first release.
> ADR-B01: Section components independent. ADR-B02: Container queries. ADR-B03: Crew + Call Kids full-width.

---

## Blueprint Coverage

| Feature ID | Description | Covered in |
|---|---|---|
| F-BR-01 | `BridgeConfig` TypeScript interfaces for all sections | This spec § TypeScript Interfaces |
| F-BR-02 | `config-metadata.ts` YAML validation schema | This spec § config-metadata |
| F-BR-03 | `getRelevantEntities()` — collects all entity_ids from config | This spec § getRelevantEntities |
| F-BR-04 | `sf-bridge-crew` — dynamic person list with zone + avatar | This spec § sf-bridge-crew |
| F-BR-05 | `sf-bridge-alerts` — smoke + toggles + occupancy | This spec § sf-bridge-alerts |
| F-BR-06 | `sf-bridge-stove` — pellets quantity + stock counter + status | This spec § sf-bridge-stove |
| F-BR-07 | `sf-bridge-vehicle` — EV power sensor read-only | This spec § sf-bridge-vehicle |
| F-BR-08 | `sf-bridge-access` — cover + lock controls (extensible list) | This spec § sf-bridge-access |
| F-BR-09 | `sf-bridge-automations` — toggles + slider (extensible list) | This spec § sf-bridge-automations |
| F-BR-10 | `sf-bridge-appliances` — cycles + consumables (extensible list) | This spec § sf-bridge-appliances |
| F-BR-11 | `sf-bridge-call-kids` — input_button action | This spec § sf-bridge-call-kids |
| F-BR-12 | `sci-fi-bridge` card — orchestrator + CSS Grid responsive layout | This spec § sci-fi-bridge Card |
| F-BR-13 | `sci-fi-bridge-editor` — HA config editor | This spec § Editor |
| F-BR-14 | Tests ≥ 80% coverage — domain + composants | This spec § Test Cases |
| F-BR-15 | Workbench mock — entities mockées pour validation visuelle | This spec § Workbench |
| F-BR-16 | README.md + CHANGELOG.md mis à jour | This spec § README & CHANGELOG Updates |

---

## Context

La carte `sci-fi-bridge` est la carte dashboard maison de la release v1.3 (Bridge Overview). Elle affiche le statut global de la maison en temps réel : présence de l'équipage, alertes critiques, points d'accès, automatisations, électroménager, poêle, voiture, et un bouton d'appel enfants.

**Tag custom element :** `sci-fi-bridge`
**Répertoire :** `src/cards/bridge/`
**Extends :** `SciFiBaseCard` ([Spec 03 § SciFiBaseCard](../03_base_classes.md))

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
  icon: "mdi:fire"                  # optionnel — défaut: mdi:fire
  pellet_quantity: sensor.clou_pellet_quantity
  pellet_stock: counter.pellet_stock
  status: binary_sensor.clou_stove_status
  low_threshold: 0.3

# VOITURE — si absent, section masquée.
vehicle:
  icon: "mdi:ev-station"            # optionnel — défaut: mdi:ev-station
  power_sensor: sensor.mureva_evlink_power

# CALL KIDS — si absent, section masquée.
call_kids:
  entity: input_button.call_kids
  name: "Appeler les enfants"
  icon: "mdi:bullhorn"              # optionnel — défaut: mdi:bullhorn
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
| Stove | `binary_sensor.clou_stove_status` | ON/OFF |
| Vehicle | `sensor.mureva_evlink_power` | Puissance W |
| Call Kids | `input_button.call_kids` | Press button |

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

**Fichier :** `src/types/config.ts` (MODIFY — ajouter les interfaces Bridge)

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
  icon?: string;          // section icon (default: 'mdi:fire')
  pellet_quantity: string;
  pellet_stock: string;
  status: string;
  low_threshold?: number; // default: 0.3
}

export interface BridgeVehicleConfig {
  icon?: string;          // section icon (default: 'mdi:ev-station')
  power_sensor: string;
}

export interface BridgeCallKidsConfig {
  entity: string;
  name?: string;
  icon?: string;          // override (default: 'mdi:bullhorn')
}

export interface SciFiBridgeConfig {
  type: string;
  persons?: BridgePersonEntry[];
  alerts?: BridgeAlertsConfig;
  access?: BridgeAccessConfig;           // objet {icon?, items[]}
  automations?: BridgeAutomationsConfig; // objet {icon?, items[]}
  appliances?: BridgeAppliancesConfig;
  stove?: BridgeStoveConfig;
  vehicle?: BridgeVehicleConfig;
  call_kids?: BridgeCallKidsConfig;
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
  access: { type: 'array', mandatory: false, default: [] },
  automations: { type: 'array', mandatory: false, default: [] },
  appliances: { type: 'object', mandatory: false },
  stove: { type: 'object', mandatory: false },
  vehicle: { type: 'object', mandatory: false },
  call_kids: { type: 'object', mandatory: false },
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

  // Call Kids
  if (this.config.call_kids) {
    ids.push(this.config.call_kids.entity);
  }

  return [...new Set(ids)];  // dédupliqué
}
```

---

## sci-fi-bridge Card

### File Tree

```
src/cards/bridge/
├── sci-fi-bridge.ts          [NEW] — card orchestratrice
├── styles.ts                 [NEW] — CSS exporté
├── config-metadata.ts        [NEW] — validation schema
└── sections/
    ├── sf-bridge-crew.ts     [NEW]
    ├── sf-bridge-alerts.ts   [NEW]
    ├── sf-bridge-access.ts   [NEW]
    ├── sf-bridge-automations.ts [NEW]
    ├── sf-bridge-appliances.ts  [NEW]
    ├── sf-bridge-stove.ts    [NEW]
    ├── sf-bridge-vehicle.ts  [NEW]
    └── sf-bridge-call-kids.ts [NEW]

tests/cards/bridge/
└── sci-fi-bridge.test.ts     [NEW]

dev/workbench-bridge.html     [NEW] — mock workbench
├── src/cards/bridge/sci-fi-bridge-editor.ts [NEW]
├── README.md [EXTERNAL]
├── CHANGELOG.md [EXTERNAL]
├── docs/cards/bridge.md [EXTERNAL]
├── lit/decorators.js [EXTERNAL]
├── ../../utils/base-card.js [EXTERNAL]
├── ../../styles/common.js [EXTERNAL]
├── ../../types/config.js [EXTERNAL]
├── ./sections/sf-bridge-crew.js [EXTERNAL]
├── ./sections/sf-bridge-alerts.js [EXTERNAL]
├── ./sections/sf-bridge-access.js [EXTERNAL]
├── ./sections/sf-bridge-automations.js [EXTERNAL]
├── ./sections/sf-bridge-appliances.js [EXTERNAL]
├── ./sections/sf-bridge-stove.js [EXTERNAL]
├── ./sections/sf-bridge-vehicle.js [EXTERNAL]
├── ./sections/sf-bridge-call-kids.js [EXTERNAL]
└── /local/avatars/adrien.jpg [EXTERNAL]
```

### Imports sci-fi-bridge.ts

```ts
import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { bridgeStyles } from './styles.js';
import type { SciFiBridgeConfig } from '../../types/config.js';

import './sections/sf-bridge-crew.js';
import './sections/sf-bridge-alerts.js';
import './sections/sf-bridge-access.js';
import './sections/sf-bridge-automations.js';
import './sections/sf-bridge-appliances.js';
import './sections/sf-bridge-stove.js';
import './sections/sf-bridge-vehicle.js';
import './sections/sf-bridge-call-kids.js';
```

### renderCard() — Structure

```html
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

  <!-- CALL KIDS — toujours pleine largeur -->
  ${config.call_kids ? html`
    <sf-bridge-call-kids
      .config="${config.call_kids}"
      .hass="${hass}"
      class="full-width"
    ></sf-bridge-call-kids>
  ` : nothing}
</div>
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

  /* ≥ 600px : 2 colonnes */
  @container sf-card (min-width: 600px) {
    .bridge-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* CREW + CALL KIDS : toujours pleine largeur */
  .full-width {
    grid-column: 1 / -1;
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
.crew-row (flex, overflow-x: auto, gap: 12px)
└── [per person] .crew-badge (flex-col, align-center, min-width: 72px)
    ├── .avatar (32px circle — img si entity_picture, sinon mdi:account)
    ├── .crew-name (text, 0.75rem)
    └── .crew-zone-pill (badge coloré, 0.65rem, uppercase)
        └── [state label — voir Zone → couleur mapping]
```

> [!NOTE]
> Le `.crew-row` a `overflow-x: auto` pour permettre le scroll horizontal quand la liste dépasse la largeur disponible (ex. 4+ personnes sur mobile portrait). Pas de wrapping.

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
│   └── ha-icon (config.icon ?? 'mdi:shield-alert') + msg('Alertes')
│
├── [SI config.smoke?.length] .alerts-smoke-row (flex, gap: 8px, flex-wrap: wrap)
│   └── [per smoke] .smoke-chip
│       ├── ha-icon (entry.icon ?? 'mdi:smoke-detector')
│       │   color: state='off' → --sf-accent-on vert | state='on' → --sf-error rouge
│       └── .smoke-name + status icon (✓ ou ⚠)
│
├── [SI config.toggles?.length] .alerts-toggles-row (flex-col, gap: 4px)
│   └── [per toggle] .toggle-row (flex-row, align-center)
│       ├── ha-icon (entry.icon ?? icône auto par domain, --sf-text-secondary)
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
│   └── ha-icon (config.icon ?? 'mdi:door-closed') + msg('Accès')
│
└── [per entry in config.items] .access-entry (flex-row, align-center, gap: 8px, border-bottom)
    ├── ha-icon (entry.icon ?? 'mdi:garage')
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
│   └── ha-icon (config.icon ?? 'mdi:robot') + msg('Automatisations')
│
└── [per entry in config.items]

    [si entry.type === 'toggle']
    .auto-row (flex-row, align-center, gap: 8px)
    ├── ha-icon (entry.icon ?? icône auto par domain, --sf-text-secondary)
    ├── .auto-name (flex: 1, 0.875rem)
    └── ha-switch (checked si state = 'on' | 'enabled')

    [si entry.type === 'slider']
    .slider-row (flex-col, gap: 4px)
    ├── .slider-header (flex-row, gap: 8px)
    │   ├── ha-icon (entry.icon ?? 'mdi:tune', --sf-text-secondary)
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
│       ├── ha-icon (icon depuis config, color: running → cyan + pulsing-border animation, idle → --sf-text-disabled)
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
| `isOn` | `hass.states[config.status]?.state === 'on'` | boolean |
| `isLow` | `pelletQty < (config.low_threshold ?? 0.3)` | boolean |

**Render layout :**

```
.bridge-section
├── .bridge-section-title
│   └── ha-icon (config.icon ?? 'mdi:fire') + msg('Poêle')
│
└── .stove-row (flex-row, align-center, gap: 12px)
    ├── ha-icon (config.icon ?? 'mdi:fire', color: isOn → --sf-warning, else --sf-text-disabled)
    ├── .stove-pellet-bar (flex-col, flex: 1)
    │   ├── .pellet-progress (width: pelletQty*100%, color: isLow → --sf-error, else --sf-accent-on)
    │   └── .pellet-pct ("${Math.round(pelletQty*100)}%", 0.75rem, --sf-primary)
    ├── .stove-stock ("${pelletStock} sacs", 0.875rem)
    └── .stove-status chip ("ON" --sf-accent-on | "OFF" --sf-text-disabled)
```

> [!WARNING]
> `pelletQty` est un ratio 0.0–1.0 (d'après le sensor Austroflamm Clou). Si `parseFloat` retourne NaN (sensor unavailable), afficher `--` et cacher la barre de progression.

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
│   └── ha-icon (config.icon ?? 'mdi:ev-station') + msg('Voiture')
│
└── .vehicle-row (flex-row, align-center, gap: 12px)
    ├── ha-icon (config.icon ?? 'mdi:ev-station', color: isCharging → --sf-accent-on, else --sf-text-disabled)
    ├── .vehicle-power ("${power} ${unit}", 1rem, --sf-primary si isCharging, else --sf-text-secondary)
    └── .vehicle-status (msg('En charge') | msg('Non connectée'), 0.75rem)
```

---

### sf-bridge-call-kids

**Tag :** `sf-bridge-call-kids`
**Classe CSS :** `full-width` (imposée par le parent)

**Properties :**

| Property | Type |
|----------|------|
| `config` | `BridgeCallKidsConfig` |
| `hass` | `HomeAssistant` |

**Reactive state :**

```ts
@state() private _loading: boolean = false;
```

**Action :**

```ts
private _press(): void {
  this._loading = true;
  void this.hass.callService('input_button', 'press', {
    entity_id: this.config.entity,
  }).finally(() => { this._loading = false; });
}
```

**Render layout :**

```
.call-kids-btn (button, full width, height: 48px)
├── ha-icon (config.icon ?? 'mdi:bullhorn', left)
├── text: config.name ?? msg('Appeler les enfants')
└── [si _loading] mdi:loading (spin animation)
```

**Styles bouton :**

```css
.call-kids-btn {
  width: 100%;
  height: 48px;
  background: transparent;
  border: 1px solid var(--sf-primary);
  border-radius: var(--sf-radius);
  color: var(--sf-primary);
  font-size: var(--sf-font-size-base);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sf-spacing-sm);
  transition: background var(--sf-transition-fast);
}
.call-kids-btn:hover {
  background: var(--sf-primary-dim);
}
.call-kids-btn:active {
  background: color-mix(in srgb, var(--sf-primary) 25%, transparent);
}
.call-kids-btn[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

---

## Editor

**Tag :** `sci-fi-bridge-editor`
**Extends :** `SciFiBaseEditor`

**Tag :** `sci-fi-bridge-editor`
**Extends :** `SciFiBaseEditor`
**Pattern :** Suit [Spec 10 § SciFiBaseEditor](../10_card_editors.md) — accordion par section.

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
| **Call Kids** | entity (input_button), name (text), icon (text) |

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
- L'éditeur lit et écrit uniquement via `this._config` (immutable — spread complet à chaque changement)
- Le workbench passe `scenarioData` à `mountUiEditor()` et `updateCardConfig()` pour que les dropdowns restent peuplés après chaque modification de config

---

## Workbench

**Fichier :** `dev/workbench-bridge.html`

Le workbench expose **5 scénarios nommés** sélectionnables via un sélecteur en haut de page. Chaque scénario remplace l'objet `MockHass.states` complet.

### États partagés (toujours présents)

```ts
const BASE_ENTITIES = {
  'person.adrien':   { state: 'home', attributes: { friendly_name: 'Adrien', entity_picture: '/local/avatars/adrien.jpg' } },
  'person.virginie': { state: 'home', attributes: { friendly_name: 'Virginie', entity_picture: null } },
  'input_button.call_kids': { state: 'unknown' },
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
  'binary_sensor.clou_stove_status': { state: 'on' },
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
  'input_button.call_kids':              { state: 'unavailable' },
};
```

### Scénario 5 — Config Partielle (CREW + CALL KIDS uniquement)

> **Objectif :** vérifier qu'une config minimale fonctionne sans sections intermédiaires.

```ts
// YAML pour ce scénario :
// type: custom:sci-fi-bridge
// persons:
//   - entity: person.adrien
// call_kids:
//   entity: input_button.call_kids

const scenarioMinimal = {
  ...BASE_ENTITIES,
};
// → La carte doit afficher CREW + CALL KIDS uniquement, sans section vide visible.
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

### Clés `getLabel()` bridge (dans `src/utils/base-editor.ts`)

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
| `action-call-children` | `Call children` | `Appeler enfants` |
| `input-icon-section` | `Section icon` | `Icône section` |
| `input-smoke-sensors` | `Smoke sensors` | `Détecteurs fumée` |
| `input-binary-sensor-entity` | `binary_sensor entity` | `Entité binary_sensor` |
| `input-icon-optional` | `Icon (opt.)` | `Icône (opt.)` |
| `input-siren-switch` | `Siren switch (optional)` | `Switch sirènes (optionnel)` |
| `input-alert-toggles` | `Alert toggles` | `Toggles alertes` |
| `input-occupancy-entity` | `Occupancy entity (opt.)` | `Entité occupancy (opt.)` |
| `input-cover-entity` | `Cover entity` | `Entité cover` |
| `input-lock-optional` | `Lock (optional)` | `Verrou (optionnel)` |
| `input-input-button-entity` | `input_button entity` | `Entité input_button` |
| `input-action-entity` | `Entity (input_button / script / automation)` | `Entité (input_button / script / automation)` |
| `input-color-optional` | `Color (opt.)` | `Couleur (opt.)` |
| `input-button-text` | `Button text (opt.)` | `Texte bouton (opt.)` |
| `input-type` | `Type` | `Type` |
| `input-min` | `Min` | `Min` |
| `input-max` | `Max` | `Max` |
| `input-step` | `Step` | `Step` |
| `input-unit` | `Unit` | `Unité` |
| `input-appliances` | `Appliances` | `Appareils` |
| `input-consumables` | `Consumables (optional)` | `Consommables (optionnel)` |
| `input-power-sensor` | `Power sensor (W)` | `Capteur puissance (W)` |
| `input-pellet-qty-sensor` | `Pellet quantity sensor` | `Capteur quantité pellets` |
| `input-status-sensor` | `ON/OFF status sensor` | `Capteur statut ON/OFF` |
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
5. Ne pas committer `fr.js` seul sans `fr.xlf` + `base-editor.ts`

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
| `src/types/config.ts` (additions Bridge) | TS interfaces | This spec § TypeScript Interfaces | `src/cards/bridge/sci-fi-bridge.ts`, `src/cards/bridge/sci-fi-bridge-editor.ts` |

### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `sciFiCommonStyles` | Lit CSS | [Spec 03 § styles](../03_base_classes.md) | `src/styles/common.ts` |
| `SciFiBaseCard` | Abstract class | [Spec 03 § SciFiBaseCard](../03_base_classes.md) | `src/utils/base-card.ts` |
| `SciFiBaseEditor` | Abstract class | [Spec 10 § SciFiBaseEditor](../10_card_editors.md) | `src/utils/base-editor.ts` |

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
| `input_button` | `press` | `{ entity_id }` | Call Kids |

### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| `getRelevantEntities()` | Défini ici — collecte toutes les entity_ids | [Spec 03 § shouldUpdate](../03_base_classes.md), [Blueprint ADR-008](../../strategic/blueprint.md#adr-008) |
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
| 10 | **Icône hardcodée dans le template** | `html\`<ha-icon icon="mdi:garage">\`` | Lire `entry.icon ?? 'mdi:garage'` — permet la personnalisation YAML sans modifier le code |
| 11 | **String label FR/EN sans `msg()`** | `html\`<span>En cours</span>\`` | Toujours `msg('En cours')` — `@lit/localize` traduit au runtime selon la langue HA |
| 12 | **Accéder à `config.automations` comme un array** | `config.automations.forEach(...)` | `config.automations` est `BridgeAutomationsConfig` (objet). Itérer sur `config.automations.items.forEach(...)` |

---

## Test Cases

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
| TC-BRIDGE-U-11 | Unit | Zone `home` → couleur vert (`--sf-accent-on`) | person state = 'home' | `.crew-zone-pill` a `color` = token vert |
| TC-BRIDGE-U-12 | Unit | Zone `work` → couleur jaune (`--sf-warning`) | person state = 'work' | `.crew-zone-pill` a `color` = token jaune |
| TC-BRIDGE-U-13 | Unit | alerts.smoke absent → rangée fumée non rendue | alerts sans smoke | `.alerts-smoke-row` absent du shadow DOM |
| TC-BRIDGE-U-14 | Unit | alerts.toggles absent → rangée toggles non rendue | alerts sans toggles | `.alerts-toggles-row` absent du shadow DOM |
| TC-BRIDGE-U-15 | Unit | Fumée `off` → icône verte (OK) | smoke state = 'off' | `.smoke-chip` color = `--sf-accent-on` |
| TC-BRIDGE-U-16 | Unit | Fumée `on` → icône rouge (ALERTE) | smoke state = 'on' | `.smoke-chip` color = `--sf-error` |
| TC-BRIDGE-U-17 | Unit | Icône entrée smoke customisée via config | smoke entry.icon = 'mdi:fire' | `ha-icon[icon='mdi:fire']` présent dans `.smoke-chip` |
| TC-BRIDGE-U-18 | Unit | Icône entrée access customisée via config | access entry.icon = 'mdi:gate' | `ha-icon[icon='mdi:gate']` présent dans `.access-entry` |
| TC-BRIDGE-U-19 | Unit | Icône section stove customisée via config | stove.icon = 'mdi:campfire' | `ha-icon[icon='mdi:campfire']` dans `.bridge-section-title` de stove |
| TC-BRIDGE-U-20 | Unit | Toggle automation ON → callService `turn_on` | clic toggle, state = 'off' | `hass.callService` appelé avec `automation.turn_on` |
| TC-BRIDGE-U-21 | Unit | Cycle lave-linge `on` → status msg('En cours') + animation | cycle state = 'on' | `.cycle-running` class présente + textContent contient 'En cours' |
| TC-BRIDGE-U-22 | Unit | Consumable `ok_when: 'off'` + state `off` → vert | rinse_aid = 'off' | `.consumable-chip` color = `--sf-accent-on` |
| TC-BRIDGE-U-23 | Unit | Consumable `ok_when: 'off'` + state `on` → rouge | rinse_aid = 'on' | `.consumable-chip` color = `--sf-error` |
| TC-BRIDGE-U-24 | Unit | Pellets low (< threshold) → barre rouge | pellet_quantity = '0.2', threshold = 0.3 | `.pellet-progress` color = `--sf-error` |
| TC-BRIDGE-U-25 | Unit | EV power = 0 → msg('Non connectée') | power = '0' | `.vehicle-status` textContent = 'Non connectée' |
| TC-BRIDGE-U-26 | Unit | EV power > 0 → msg('En charge') | power = '2300' | `.vehicle-status` textContent = 'En charge' |
| TC-BRIDGE-U-27 | Unit | CALL KIDS bouton → callService `input_button.press` | clic bouton | `hass.callService` appelé avec `input_button.press` |
| TC-BRIDGE-U-28 | Unit | CALL KIDS icon customisé | call_kids.icon = 'mdi:phone' | `ha-icon[icon='mdi:phone']` dans `.call-kids-btn` |
| TC-BRIDGE-U-29 | Unit | Cover state `closed` → bouton open actif, close désactivé | cover = 'closed' | close button `opacity: 0.4` et `pointer-events: none` |
| TC-BRIDGE-U-30 | Unit | Toutes sections absentes si config vide | `{}` config | Seul `.bridge-grid` présent, zéro `sf-bridge-*` |
| TC-BRIDGE-U-31 | Unit | Label cover traduit — msg('Fermée') affiché | cover = 'closed' | `.access-state-label` textContent = 'Fermée' |
| IT-BRIDGE-I-01 | Integration | Carte enregistrée dans `customElements` | Load card | `customElements.get('sci-fi-bridge')` returns class |
| IT-BRIDGE-I-02 | Integration | Render complet avec config de référence (Scénario 1) | Full mock hass Scenario 1 | Tous les 8 composants section présents |
| IT-BRIDGE-I-03 | Integration | `styles.ts` importé — zéro CSS inline dans `sci-fi-bridge.ts` | grep | `grep -c "css\`" src/cards/bridge/sci-fi-bridge.ts` returns 0 |
| IT-BRIDGE-I-04 | Integration | Breakpoint responsive : 1 col < 600px | container width 390px | `.bridge-grid` a `grid-template-columns: 1fr` |
| IT-BRIDGE-I-05 | Integration | Breakpoint responsive : 2 col ≥ 600px | container width 700px | `.bridge-grid` a `grid-template-columns: 1fr 1fr` |
| IT-BRIDGE-I-06 | Integration | Scénario 4 (Disconnected) — aucune section ne crash | Scénario unavailable | Carte rendue sans erreur JS, tous les `--` affichés |
| IT-BRIDGE-I-07 | Integration | Scénario 5 (Minimal) — seuls CREW + CALL KIDS visibles | config partielle | `querySelector('sf-bridge-alerts')` is null, CREW et CALL KIDS présents |

---

## Error Handling Matrix

| Error | Detection | User Response | Fallback | Logging |
|---|---|---|---|---|
| `hass` absent | `SciFiBaseCard` guard | — | Carte vide transparente | — |
| Section config absente | `config.section === undefined` | Section non rendue | Sections définies restent visibles | — |
| Entité absente de `hass.states` | `hass.states[id]?.state === undefined` | Indicateur individuel affiche `--` | Section reste visible | `console.warn('[sf-bridge] entity not found:', id)` |
| Entité `unavailable` / `unknown` | `state === 'unavailable'` ou `'unknown'` | Valeur affichée en gris désaturé | Section reste visible | — |
| `callService` echec (toggle/cover/etc.) | `.catch((e) => ...)` | Aucun message visible — log console | État HA inchangé | `console.error('[sf-bridge] callService error:', e)` |
| `pellet_quantity` NaN | `isNaN(parseFloat(state))` | Afficher `-- %`, cacher barre | Stock sacs reste visible | `console.warn` |
| EV power NaN | `isNaN(parseFloat(state))` | Afficher `-- W`, "Indisponible" | Section reste visible | `console.warn` |
| Config invalide (`setConfig`) | Validation dans `setConfig()` | Afficher `sf-error-card` avec message | Carte en erreur visible | `console.error` |

> [!IMPORTANT]
> **Behavioral claim POC gate :**
> - `binary_sensor.rinse_aid` : ASSUMED (Medium) — comportement `on=missing / off=ok` à confirmer dans workbench avec données réelles. Config `ok_when` prévoit les deux sens.
> - `sensor.clou_pellet_quantity` : ASSUMED (Low) — ratio 0.0–1.0 basé sur la carte Stove existante qui l'utilise déjà avec `pellet_quantity_threshold: 0.3`.

---

## README & CHANGELOG Updates

> [!IMPORTANT]
> Ces deux fichiers **DOIVENT** être mis à jour lors du HARDEN. Ils font partie de la définition de "done" (F-BR-16).

### README.md — À modifier

**Fichier :** [`README.md`](../../../README.md)

#### 1. Ajouter la carte dans la table `## 🧩 Available cards`

Après la ligne `| 💧 **Water Management** | ... |`, ajouter :

```markdown
| 🛠️ **Bridge Overview** | Dashboard maison — équipage, alertes, accès, automatisations, électroménager, poêle, voiture | [→ docs](./docs/cards/bridge.md) |
```

#### 2. Badges tests + coverage — ✅ Complété (2026-06-02)

> Badges mis à jour dans `README.md` : `tests-953%20passing` et `coverage-87%25`.

### CHANGELOG.md — À modifier

**Fichier :** [`CHANGELOG.md`](../../../CHANGELOG.md)

Ajouter une section v1.3 en tête du CHANGELOG (après l'en-tête, avant la section v1.2 ou v1.0 existante) :

```markdown
## v1.3 — 2026-06-02 *(Bridge Overview)*

### 🏠 Bridge Overview — nouvelle carte

- **`sci-fi-bridge`** : carte dashboard maison modulaire. 8 sections indépendantes (Crew, Alertes, Accès, Automatisations, Électroménager, Poêle, Voiture, Call Kids).
- **Design responsive** : 1 colonne en portrait, 2 colonnes en paysage via container queries.
- **Sections optionnelles** : toute section absente du YAML est simplement masquée — zéro erreur.
- **Icônes configurables** : chaque section et chaque entrée accepte un champ `icon` via `<sf-editor-dropdown-icon>` (searchable MDI + sci-fi).
- **i18n complète** : 20 nouvelles clés `msg()` en FR/EN.
- **Éditeur visuel** : accordéons par section avec `<sf-editor-dropdown-entity>`, `<sf-editor-input>`, `<sf-editor-dropdown-icon>`, `<sf-editor-dropdown>`, `<sf-editor-accordion>`.
- **Workbench** : 5 scénarios mockés (Normal, Alerte, Absent, Déconnecté, Minimal). Le workbench passe `scenarioData` à l'éditeur pour maintenir les entités après chaque modification de config.
```

### docs/cards/bridge.md — ✅ Créé (2026-06-02)

**Fichier :** `docs/cards/bridge.md` (créé le 2026-06-02)

La page de documentation utilisateur (référencée depuis README). Elle doit contenir :

```markdown
# 🏠 Bridge Overview (`sci-fi-bridge`)

Carte dashboard maison. Affiche le statut global de la maison en temps réel.

## Configuration

### Exemple minimal

```yaml
type: custom:sci-fi-bridge
persons:
  - entity: person.adrien
call_kids:
  entity: input_button.call_kids
```

### Exemple complet

[Voir la spec → § YAML Configuration Schema](../../docs/specs/cards/bridge.md)

## Sections disponibles

| Section | Clé YAML | Optionnelle | Description |
|---------|-----------|-------------|-------------|
| Crew | `persons` | ✔ | Présence de l'équipage avec zones HA |
| Alertes | `alerts` | ✔ | Détecteurs fumée, toggles, occupancy |
| Accès | `access` | ✔ | Portes, portails, verrous |
| Automatisations | `automations` | ✔ | Toggles + slider tempo |
| Électroménager | `appliances` | ✔ | Cycles en cours + consommables |
| Poêle | `stove` | ✔ | Pellets + état poêle |
| Voiture | `vehicle` | ✔ | Puissance de charge EV |
| Call Kids | `call_kids` | ✔ | Bouton d'appel enfants |

## Icônes

Chaque section et chaque entrée accepte un champ `icon` optionnel (string MDI, ex: `mdi:garage`).
Si absent, l'icône par défaut de la section est utilisée.
```

---

## Deep Links

| Reference | Location |
|---|---|
| Strategic Blueprint Bridge | [bridge_overview_blueprint.md](../../strategic/bridge_overview_blueprint.md) |
| SciFiBaseCard | [03_base_classes.md](../03_base_classes.md) |
| SciFiBaseEditor | [10_card_editors.md](../10_card_editors.md) |
| Common styles tokens | [src/styles/common.ts](../../../src/styles/common.ts) |
| config.ts (à modifier) | [src/types/config.ts](../../../src/types/config.ts) |
| Stove spec (pattern styles) | [stove.md](./stove.md) |
| Vehicle spec (pattern services) | [vehicle.md](./vehicle.md) |
| Water Management spec (pattern structure) | [tactical_water_management.md](./tactical_water_management.md) |
| Mock workbench pattern | [dev/workbench.html](../../../dev/workbench.html) |
| sci-fi.ts entry point (enregistrement carte) | [src/sci-fi.ts](../../../src/sci-fi.ts) |

## Shared Artifact Schema

### `this.config`
| Field | Type | Description |
|---|---|---|
| entity | string | The main entity. |
| alerts | object | Alerts configuration. |
| persons | array | Persons configuration. |
| access | object | Access configuration. |
| automations | object | Automations configuration. |
| appliances | object | Appliances configuration. |
| stove | object | Stove configuration. |
| vehicle | object | Vehicle configuration. |
| call_kids | object | Call Kids configuration. |

## Assumptions
| # | Assumption | Risk | Validation |
|---|------------|------|------------|
| 1 | The user has the necessary entities created in Home Assistant. | Low | Configuration validation in editor. |
| 2 | Lovelace custom cards are enabled and correctly registered. | Medium | Manual user testing. |
| 3 | The SciFiBaseCard provides all necessary styling variables. | Low | Core architecture requirement. |

## Test Cases
| ID | Type | Description |
|---|---|---|
| TC-101 | Unit | The bridge card renders correctly with normal scenario. |
| TC-102 | Unit | The bridge card renders alerts correctly when smoke is detected. |
| TC-103 | Unit | The bridge card renders correctly in disconnected scenario. |
| IT-101 | Integration | The bridge card receives updates from Home Assistant entities. |
