/**
 * sci-fi-bridge.ts — Bridge Overview card orchestrator
 * Spec: docs/specs/cards/bridge.md
 * Tag: sci-fi-bridge
 * Extends: SciFiBaseCard (src/utils/base-card.ts)
 *
 * All sections are OPTIONAL — absent section = not rendered.
 * Responsive: 1 col portrait / 2 cols landscape via @container query.
 */
import { html, nothing, type TemplateResult } from 'lit';
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
import './sections/sf-bridge-actions.js';
import '../../components/sf-toast.js';

const TAG = 'sci-fi-bridge';

@customElement(TAG)
export class SciFiBridgeCard extends SciFiBaseCard {
  // config is typed as SciFiBaseConfig in base — we narrow it here
  declare protected config: SciFiBridgeConfig;

  static override styles = [sciFiCommonStyles, bridgeStyles];

  // ── Static HA card contract ─────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement('sci-fi-bridge-editor');
  }

  static getStubConfig(): SciFiBridgeConfig {
    return {
      type: 'custom:sci-fi-bridge',
      persons: [{ entity: 'person.CHANGE_ME' }],
    };
  }

  // ── Entity tracking (performance opt — spec §getRelevantEntities) ───────────

  protected override getRelevantEntities(): string[] {
    if (!this.config) return [];
    const ids: string[] = [];

    // Persons
    this.config.persons?.forEach(p => ids.push(p.entity));

    // Alerts (all sub-sections optional)
    if (this.config.alerts) {
      this.config.alerts.smoke?.forEach(s => ids.push(s.entity));
      if (this.config.alerts.smoke_switch) ids.push(this.config.alerts.smoke_switch);
      this.config.alerts.toggles?.forEach(t => ids.push(t.entity));
      if (this.config.alerts.occupancy) ids.push(this.config.alerts.occupancy);
    }

    // Access — wrapped in BridgeAccessConfig { icon?, items[] }
    this.config.access?.items?.forEach(a => {
      ids.push(a.entity);
      if (a.lock) ids.push(a.lock);
    });

    // Automations — wrapped in BridgeAutomationsConfig { icon?, items[] }
    this.config.automations?.items?.forEach(a => ids.push(a.entity));

    // Appliances (consumables optional)
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

    return [...new Set(ids)]; // deduplicated
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  protected override renderCard(): TemplateResult {
    const config = this.config;
    const hass = this.hass;

    return html`
      <ha-card @bridge-toast="${this._onBridgeToast}">
        ${config.title ? html`<div class="bridge-card-title">${config.title}</div>` : nothing}
        <div class="bridge-grid">

          <!-- CREW — full-width (spec: toujours pleine largeur) -->
          ${config.persons?.length ? html`
            <sf-bridge-crew
              .persons="${config.persons}"
              .hass="${hass}"
              class="full-width"
            ></sf-bridge-crew>
          ` : nothing}

          <!-- ALERTES — rendered if config.alerts defined (sub-sections handled internally) -->
          ${config.alerts ? html`
            <sf-bridge-alerts
              .config="${config.alerts}"
              .hass="${hass}"
            ></sf-bridge-alerts>
          ` : nothing}

          <!-- AUTOMATISATIONS — rendered if automations.items non-empty -->
          ${config.automations?.items?.length ? html`
            <sf-bridge-automations
              .config="${config.automations}"
              .hass="${hass}"
            ></sf-bridge-automations>
          ` : nothing}

          <!-- ACCÈS — rendered if access.items non-empty -->
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

          <!-- ACTIONS — full-width, configurable multi-button panel -->
          ${config.actions?.items?.length ? html`
            <sf-bridge-actions
              .config="${config.actions}"
              .hass="${hass}"
              class="full-width"
            ></sf-bridge-actions>
          ` : nothing}

        </div>
        <!-- Shared toast — receives bridge-toast events from all sections -->
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  /** Forward bridge-toast custom events to the embedded sf-toast */
  private _onBridgeToast = (e: CustomEvent): void => {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) {
      toast.addMessage(e.detail.message, e.detail.error ?? false);
    }
  };

  // ── Card size ───────────────────────────────────────────────────────────────

  override getCardSize(): number {
    // Estimate based on active sections
    let size = 1;
    if (this.config?.persons?.length) size += 2;
    if (this.config?.alerts) size += 2;
    if (this.config?.automations?.items?.length) size += Math.ceil(this.config.automations.items.length * 0.7);
    if (this.config?.access?.items?.length) size += 1;
    if (this.config?.appliances) size += 2;
    if (this.config?.stove) size += 1;
    if (this.config?.vehicle) size += 1;
    return Math.min(size, 15);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiBridgeCard;
  }
}
