/**
 * <sci-fi-bridge-editor> — Graphical editor for the sci-fi-bridge card.
 * Spec: docs/specs/cards/bridge.md §Editor
 * Extends: SciFiBaseEditor (src/utils/base-editor.ts)
 *
 * REWRITE: uses only sf-editor-* components (no HA WC dependencies).
 * - sf-editor-accordion    → replaces ha-expansion-panel
 * - sf-editor-dropdown-entity → replaces ha-entity-picker
 * - sf-editor-input        → replaces ha-textfield
 * - sf-editor-dropdown     → replaces ha-select / mwc-select
 * - native <button>        → replaces mwc-button / mwc-icon-button
 */
import { html, css, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiBridgeConfig,
  BridgePersonEntry,
  BridgeSmokeEntry,
  BridgeToggleEntry,
  BridgeAccessEntry,
  BridgeAutomationEntry,
  BridgeCycleEntry,
  BridgeConsumableEntry,
  BridgeActionItem,
} from '../../types/config.js';

import '../../components/editor-inputs/sf-editor-accordion.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-dropdown.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';

const TAG = 'sci-fi-bridge-editor';

@customElement(TAG)
export class SciFiBridgeEditor extends SciFiBaseEditor {
  static override styles = [
    sciFiEditorCommonStyles,
    css`
      /* ── Editor layout ──────────────────────────────────────────────── */
      .editor-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }

      /* Each accordion section */
      sf-editor-accordion {
        width: 100%;
      }

      /* Panel content */
      .panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 0 8px;
      }

      /* Sub-section header */
      .sub-title {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color, rgba(224,232,255,0.55));
        margin: 8px 0 4px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(0,210,255,0.15);
      }

      /* Row with multiple fields + delete button */
      .list-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(0,210,255,0.12);
        position: relative;
      }

      /* Row of inputs inside list-row (label, icon…) */
      .field-row {
        display: flex;
        flex-direction: row;
        gap: 6px;
      }

      .field-row > * {
        flex: 1;
        min-width: 0;
      }

      /* Add / action buttons */
      .btn-add {
        background: none;
        border: 1px dashed rgba(0,210,255,0.4);
        border-radius: 6px;
        color: var(--secondary-text-color, rgba(224,232,255,0.6));
        cursor: pointer;
        padding: 6px 12px;
        font-size: 0.8rem;
        width: 100%;
        text-align: left;
        transition: background 150ms, color 150ms;
        font-family: inherit;
      }

      .btn-add:hover {
        background: rgba(0,210,255,0.06);
        color: var(--primary-text-color, #e0e8ff);
      }

      .btn-action {
        background: none;
        border: 1px solid rgba(0,210,255,0.3);
        border-radius: 6px;
        color: rgba(0,210,255,0.8);
        cursor: pointer;
        padding: 6px 14px;
        font-size: 0.78rem;
        font-family: inherit;
        transition: background 150ms;
      }

      .btn-action:hover {
        background: rgba(0,210,255,0.08);
      }

      .btn-delete {
        align-self: flex-end;
        background: none;
        border: none;
        color: rgba(224,232,255,0.4);
        cursor: pointer;
        font-size: 0.75rem;
        padding: 2px 6px;
        font-family: inherit;
        border-radius: 4px;
        transition: color 150ms;
      }

      .btn-delete:hover {
        color: var(--error-color, #ff4444);
      }

      .btn-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      /* Dropdown inline (type selector) */
      sf-editor-dropdown {
        flex: 1;
      }
    `,
  ];

  // ── Config helpers ──────────────────────────────────────────────────────────

  private get _config(): SciFiBridgeConfig {
    return this.config as SciFiBridgeConfig;
  }

  private _dispatch(updated: SciFiBridgeConfig): void {
    this._dispatchChange(updated);
  }

  private get _hassEntities(): Record<string, { entity_id: string; attributes: { friendly_name?: string; icon?: string } }> {
    if (!this.hass?.states) return {};
    return this.hass.states as any;
  }

  /** Filter hass entities by domain prefix(es) */
  private _entitiesByDomain(...domains: string[]): unknown[] {
    return Object.values(this._hassEntities).filter(e =>
      domains.some(d => e.entity_id.startsWith(`${d}.`))
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  protected override renderEditor(): TemplateResult {
    return html`
      <div class="editor-body">
        ${this._renderCrewSection()}
        ${this._renderAlertsSection()}
        ${this._renderAccessSection()}
        ${this._renderAutomationsSection()}
        ${this._renderAppliancesSection()}
        ${this._renderStoveSection()}
        ${this._renderVehicleSection()}
        ${this._renderCallKidsSection()}
        ${this._renderActionsSection()}
      </div>
    `;
  }

  // ── CREW ────────────────────────────────────────────────────────────────────

  /** Build the person list from hass states (same pattern as hexa visibility). */
  private get _hassPersons(): Array<{ entityId: string; friendlyName: string; entityPicture: string | null }> {
    if (!this.hass?.states) return [];
    return Object.values(this.hass.states)
      .filter(e => e.entity_id.startsWith('person.'))
      .map(e => ({
        entityId: e.entity_id,
        friendlyName: (e.attributes['friendly_name'] as string | undefined) ?? e.entity_id,
        entityPicture: (e.attributes['entity_picture'] as string | undefined) ?? null,
      }));
  }

  private _renderCrewSection(): TemplateResult {
    const selectedIds = (this._config.persons ?? []).map(p => p.entity);
    const enabled = !!this._config.persons;
    const allPersons = this._hassPersons;

    return html`
      <sf-editor-accordion
        title="${this.getLabel('section-title-crew')}"
        icon="mdi:account-group"
        ?open="${enabled}"
      >
        <div class="panel">
          ${enabled ? html`
            <!-- Liste toutes les personnes hass — même pattern que visibilité hexa -->
            <div class="people">
              ${allPersons.map(person => {
                const active = selectedIds.includes(person.entityId);
                const initial = person.friendlyName.charAt(0).toUpperCase();
                return html`
                  <div class="people-row">
                    <div class="avatar">
                      ${person.entityPicture
                        ? html`<img src="${person.entityPicture}" alt="${person.friendlyName}" />`
                        : html`<span class="avatar-initial">${initial}</span>`
                      }
                    </div>
                    <div class="person-name">${person.friendlyName}</div>
                    <sf-button
                      icon="${active ? 'mdi:account-check' : 'mdi:account-off-outline'}"
                      style="--btn-icon-color: ${active ? 'var(--secondary-light-color, rgb(102,156,210))' : 'rgba(224,232,255,0.25)'};"
                      @button-click="${() => this._togglePerson(person.entityId)}"
                    ></sf-button>
                  </div>
                `;
              })}
            </div>
            <div class="btn-row">
              <button class="btn-action" @click="${() => this._disableSection('persons')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('persons', [])}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  /** Toggle a person entity in config.persons (add if absent, remove if present). */
  private _togglePerson(entityId: string): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const current: BridgePersonEntry[] = c.persons ?? [];
    const exists = current.some(p => p.entity === entityId);
    const updated: BridgePersonEntry[] = exists
      ? current.filter(p => p.entity !== entityId)
      : [...current, { entity: entityId }];
    this._dispatch({ ...c, persons: updated.length ? updated : [] });
  }

  // ── ALERTS ──────────────────────────────────────────────────────────────────

  private _renderAlertsSection(): TemplateResult {
    const alerts = this._config.alerts;
    const enabled = !!alerts;
    const binarySensors = this._entitiesByDomain('binary_sensor');
    const switches = this._entitiesByDomain('switch', 'input_boolean', 'automation');

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-alerts')}" icon="mdi:shield-alert" ?open="${enabled}">
        <div class="panel">
          ${enabled && alerts ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${alerts.icon ?? 'mdi:shield-alert'}"
              @input-update="${(e: CustomEvent) => this._updateAlerts({ icon: e.detail.value })}"
            ></sf-editor-dropdown-icon>

            <div class="sub-title">${this.getLabel('input-smoke-sensors')}</div>
            ${(alerts.smoke ?? []).map((s, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-binary-sensor-entity')}"
                  .value="${s.entity}"
                  .items="${binarySensors}"
                  @input-update="${(e: CustomEvent) => this._updateSmoke(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input
                    .label="${this.getLabel('input-name')}"
                    .value="${s.name}"
                    @input-update="${(e: CustomEvent) => this._updateSmoke(i, { name: e.detail.value })}"
                  ></sf-editor-input>
                  <sf-editor-dropdown-icon
                    .label="${this.getLabel('input-icon-optional')}"
                    .value="${s.icon ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateSmoke(i, { icon: e.detail.value || undefined })}"
                  ></sf-editor-dropdown-icon>
                </div>
                <button class="btn-delete" @click="${() => this._removeSmoke(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <button class="btn-add" @click="${this._addSmoke}">+ ${this.getLabel('action-add-smoke')}</button>

            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-siren-switch')}"
              .value="${alerts.smoke_switch ?? ''}"
              .items="${switches}"
              @input-update="${(e: CustomEvent) => this._updateAlerts({ smoke_switch: e.detail.value || undefined })}"
            ></sf-editor-dropdown-entity>

            <div class="sub-title">${this.getLabel('input-alert-toggles')}</div>
            ${(alerts.toggles ?? []).map((t, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-entity-id')}"
                  .value="${t.entity}"
                  .items="${switches}"
                  @input-update="${(e: CustomEvent) => this._updateToggle(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input
                    .label="${this.getLabel('input-name')}"
                    .value="${t.name}"
                    @input-update="${(e: CustomEvent) => this._updateToggle(i, { name: e.detail.value })}"
                  ></sf-editor-input>
                  <sf-editor-dropdown-icon
                    .label="${this.getLabel('input-icon-optional')}"
                    .value="${t.icon ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateToggle(i, { icon: e.detail.value || undefined })}"
                  ></sf-editor-dropdown-icon>
                </div>
                <button class="btn-delete" @click="${() => this._removeToggle(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <button class="btn-add" @click="${this._addToggle}">+ ${this.getLabel('action-add-toggle')}</button>

            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-occupancy-entity')}"
              .value="${alerts.occupancy ?? ''}"
              .items="${binarySensors}"
              @input-update="${(e: CustomEvent) => this._updateAlerts({ occupancy: e.detail.value || undefined })}"
            ></sf-editor-dropdown-entity>

            <div class="btn-row">
              <button class="btn-action" @click="${() => this._disableSection('alerts')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('alerts', {})}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  private _updateAlerts(patch: Partial<NonNullable<SciFiBridgeConfig['alerts']>>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), ...patch } });
  }

  private _addSmoke(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const smoke: BridgeSmokeEntry[] = [...(c.alerts?.smoke ?? []), { entity: '', name: '' }];
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), smoke } });
  }

  private _removeSmoke(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const smoke = (c.alerts?.smoke ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), smoke: smoke.length ? smoke : undefined } });
  }

  private _updateSmoke(i: number, patch: Partial<BridgeSmokeEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const smoke: BridgeSmokeEntry[] = (c.alerts?.smoke ?? []).map((s, idx) =>
      idx === i ? { ...s, ...patch } : s
    );
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), smoke } });
  }

  private _addToggle(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const toggles: BridgeToggleEntry[] = [...(c.alerts?.toggles ?? []), { entity: '', name: '' }];
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), toggles } });
  }

  private _removeToggle(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const toggles = (c.alerts?.toggles ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), toggles: toggles.length ? toggles : undefined } });
  }

  private _updateToggle(i: number, patch: Partial<BridgeToggleEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const toggles: BridgeToggleEntry[] = (c.alerts?.toggles ?? []).map((t, idx) =>
      idx === i ? { ...t, ...patch } : t
    );
    this._dispatch({ ...c, alerts: { ...(c.alerts ?? {}), toggles } });
  }

  // ── ACCESS ──────────────────────────────────────────────────────────────────

  private _renderAccessSection(): TemplateResult {
    const access = this._config.access;
    const enabled = !!access;
    const covers = this._entitiesByDomain('cover');
    const locks = this._entitiesByDomain('lock');

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-access')}" icon="mdi:door-closed" ?open="${enabled}">
        <div class="panel">
          ${enabled && access ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${access.icon ?? 'mdi:door-closed'}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, access: { ...c.access!, icon: e.detail.value } }); }}"
            ></sf-editor-dropdown-icon>

            ${access.items.map((item, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-cover-entity')}"
                  .value="${item.entity}"
                  .items="${covers}"
                  @input-update="${(e: CustomEvent) => this._updateAccessItem(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input
                    .label="${this.getLabel('input-name')}"
                    .value="${item.name}"
                    @input-update="${(e: CustomEvent) => this._updateAccessItem(i, { name: e.detail.value })}"
                  ></sf-editor-input>
                  <sf-editor-dropdown-icon
                    .label="${this.getLabel('input-icon-optional')}"
                    .value="${item.icon ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateAccessItem(i, { icon: e.detail.value || undefined })}"
                  ></sf-editor-dropdown-icon>
                </div>
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-lock-optional')}"
                  .value="${item.lock ?? ''}"
                  .items="${locks}"
                  @input-update="${(e: CustomEvent) => this._updateAccessItem(i, { lock: e.detail.value || undefined })}"
                ></sf-editor-dropdown-entity>
                <button class="btn-delete" @click="${() => this._removeAccessItem(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <div class="btn-row">
              <button class="btn-add" @click="${this._addAccessItem}">+ ${this.getLabel('section-title-access')}</button>
              <button class="btn-action" @click="${() => this._disableSection('access')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('access', { items: [] })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  private _addAccessItem(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeAccessEntry[] = [...(c.access?.items ?? []), { entity: '', name: '' }];
    this._dispatch({ ...c, access: { ...(c.access ?? {}), items } });
  }

  private _removeAccessItem(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items = (c.access?.items ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, access: { ...(c.access ?? {}), items } });
  }

  private _updateAccessItem(i: number, patch: Partial<BridgeAccessEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeAccessEntry[] = (c.access?.items ?? []).map((item, idx) =>
      idx === i ? { ...item, ...patch } : item
    );
    this._dispatch({ ...c, access: { ...(c.access ?? {}), items } });
  }

  // ── AUTOMATIONS ─────────────────────────────────────────────────────────────

  private _renderAutomationsSection(): TemplateResult {
    const automations = this._config.automations;
    const enabled = !!automations;
    const allEntities = this._entitiesByDomain('automation', 'input_number', 'switch', 'input_boolean', 'number');
    const typeItems = ['toggle', 'slider'];

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-automations')}" icon="mdi:robot" ?open="${enabled}">
        <div class="panel">
          ${enabled && automations ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${automations.icon ?? 'mdi:robot'}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, automations: { ...c.automations!, icon: e.detail.value } }); }}"
            ></sf-editor-dropdown-icon>

            ${automations.items.map((item, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-entity-id')}"
                  .value="${item.entity}"
                  .items="${allEntities}"
                  @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input
                    .label="${this.getLabel('input-name')}"
                    .value="${item.name}"
                    @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { name: e.detail.value })}"
                  ></sf-editor-input>
                  <sf-editor-dropdown-icon
                    .label="${this.getLabel('input-icon-optional')}"
                    .value="${item.icon ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { icon: e.detail.value || undefined })}"
                  ></sf-editor-dropdown-icon>
                </div>
                <sf-editor-dropdown
                  .label="${this.getLabel('input-type')}"
                  .value="${item.type}"
                  .items="${typeItems}"
                  disabled-filter
                  @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { type: e.detail.value as 'toggle' | 'slider' })}"
                ></sf-editor-dropdown>
                ${item.type === 'slider' ? html`
                  <div class="field-row">
                    <sf-editor-input type="number" .label="${this.getLabel('input-min')}" .value="${String(item.min ?? 0)}"
                      @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { min: parseFloat(e.detail.value) })}">
                    </sf-editor-input>
                    <sf-editor-input type="number" .label="${this.getLabel('input-max')}" .value="${String(item.max ?? 100)}"
                      @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { max: parseFloat(e.detail.value) })}">
                    </sf-editor-input>
                    <sf-editor-input type="number" .label="${this.getLabel('input-step')}" .value="${String(item.step ?? 1)}"
                      @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { step: parseFloat(e.detail.value) })}">
                    </sf-editor-input>
                    <sf-editor-input .label="${this.getLabel('input-unit')}" .value="${item.unit ?? ''}"
                      @input-update="${(e: CustomEvent) => this._updateAutoItem(i, { unit: e.detail.value || undefined })}">
                    </sf-editor-input>
                  </div>
                ` : nothing}
                <button class="btn-delete" @click="${() => this._removeAutoItem(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <div class="btn-row">
              <button class="btn-add" @click="${this._addAutoItem}">+ ${this.getLabel('section-title-automations')}</button>
              <button class="btn-action" @click="${() => this._disableSection('automations')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('automations', { items: [] })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  private _addAutoItem(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeAutomationEntry[] = [...(c.automations?.items ?? []), { entity: '', name: '', type: 'toggle' }];
    this._dispatch({ ...c, automations: { ...(c.automations ?? {}), items } });
  }

  private _removeAutoItem(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items = (c.automations?.items ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, automations: { ...(c.automations ?? {}), items } });
  }

  private _updateAutoItem(i: number, patch: Partial<BridgeAutomationEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeAutomationEntry[] = (c.automations?.items ?? []).map((item, idx) =>
      idx === i ? { ...item, ...patch } : item
    );
    this._dispatch({ ...c, automations: { ...(c.automations ?? {}), items } });
  }

  // ── APPLIANCES ──────────────────────────────────────────────────────────────

  private _renderAppliancesSection(): TemplateResult {
    const appliances = this._config.appliances;
    const enabled = !!appliances;
    const allSensors = this._entitiesByDomain('binary_sensor', 'sensor');
    const binarySensors = this._entitiesByDomain('binary_sensor');
    const okItems = ['off', 'on'];

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-appliances')}" icon="mdi:washing-machine" ?open="${enabled}">
        <div class="panel">
          ${enabled && appliances ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${appliances.icon ?? 'mdi:washing-machine'}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, appliances: { ...c.appliances!, icon: e.detail.value } }); }}"
            ></sf-editor-dropdown-icon>

            <div class="sub-title">${this.getLabel('input-appliances')}</div>
            ${appliances.cycles.map((cycle, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-entity-id')}"
                  .value="${cycle.entity}"
                  .items="${allSensors}"
                  @input-update="${(e: CustomEvent) => this._updateCycle(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input .label="${this.getLabel('input-name')}" .value="${cycle.name}"
                    @input-update="${(e: CustomEvent) => this._updateCycle(i, { name: e.detail.value })}">
                  </sf-editor-input>
                  <sf-editor-dropdown-icon .label="${this.getLabel('input-icon')}" .value="${cycle.icon}"
                    @input-update="${(e: CustomEvent) => this._updateCycle(i, { icon: e.detail.value })}">
                  </sf-editor-dropdown-icon>
                </div>
                <button class="btn-delete" @click="${() => this._removeCycle(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <button class="btn-add" @click="${this._addCycle}">+ ${this.getLabel('action-add-appliance')}</button>

            <div class="sub-title">${this.getLabel('input-consumables')}</div>
            ${(appliances.consumables ?? []).map((c, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-binary-sensor-entity')}"
                  .value="${c.entity}"
                  .items="${binarySensors}"
                  @input-update="${(e: CustomEvent) => this._updateConsumable(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input .label="${this.getLabel('input-name')}" .value="${c.name}"
                    @input-update="${(e: CustomEvent) => this._updateConsumable(i, { name: e.detail.value })}">
                  </sf-editor-input>
                  <sf-editor-dropdown
                    .label="${this.getLabel('input-ok-when')}"
                    .value="${c.ok_when}"
                    .items="${okItems}"
                    disabled-filter
                    @input-update="${(e: CustomEvent) => this._updateConsumable(i, { ok_when: e.detail.value as 'on' | 'off' })}"
                  ></sf-editor-dropdown>
                </div>
                <button class="btn-delete" @click="${() => this._removeConsumable(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <div class="btn-row">
              <button class="btn-add" @click="${this._addConsumable}">+ ${this.getLabel('action-add-consumable')}</button>
              <button class="btn-action" @click="${() => this._disableSection('appliances')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('appliances', { cycles: [] })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  private _addCycle(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const cycles: BridgeCycleEntry[] = [...(c.appliances?.cycles ?? []), { entity: '', name: '', icon: 'mdi:washing-machine' }];
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), cycles } });
  }

  private _removeCycle(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const cycles = (c.appliances?.cycles ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), cycles } });
  }

  private _updateCycle(i: number, patch: Partial<BridgeCycleEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const cycles: BridgeCycleEntry[] = (c.appliances?.cycles ?? []).map((cycle, idx) =>
      idx === i ? { ...cycle, ...patch } : cycle
    );
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), cycles } });
  }

  private _addConsumable(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const consumables: BridgeConsumableEntry[] = [...(c.appliances?.consumables ?? []), { entity: '', name: '', ok_when: 'off' }];
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), consumables } });
  }

  private _removeConsumable(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const consumables = (c.appliances?.consumables ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), consumables: consumables.length ? consumables : undefined } });
  }

  private _updateConsumable(i: number, patch: Partial<BridgeConsumableEntry>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const consumables: BridgeConsumableEntry[] = (c.appliances?.consumables ?? []).map((item, idx) =>
      idx === i ? { ...item, ...patch } : item
    );
    this._dispatch({ ...c, appliances: { ...(c.appliances ?? { cycles: [] }), consumables } });
  }

  // ── STOVE ───────────────────────────────────────────────────────────────────

  private _renderStoveSection(): TemplateResult {
    const stove = this._config.stove;
    const enabled = !!stove;
    const sensors = this._entitiesByDomain('sensor');
    const counters = this._entitiesByDomain('counter');
    const binarySensors = this._entitiesByDomain('binary_sensor');

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-stove')}" icon="mdi:fire" ?open="${enabled}">
        <div class="panel">
          ${enabled && stove ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${stove.icon ?? 'mdi:fire'}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, stove: { ...c.stove!, icon: e.detail.value } }); }}"
            ></sf-editor-dropdown-icon>
            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-pellet-qty-sensor')}"
              .value="${stove.pellet_quantity ?? ''}"
              .items="${sensors}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, stove: { ...c.stove!, pellet_quantity: e.detail.value } }); }}"
            ></sf-editor-dropdown-entity>
            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-bag-counter')}"
              .value="${stove.pellet_stock ?? ''}"
              .items="${counters}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, stove: { ...c.stove!, pellet_stock: e.detail.value } }); }}"
            ></sf-editor-dropdown-entity>
            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-status-sensor')}"
              .value="${stove.status ?? ''}"
              .items="${binarySensors}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, stove: { ...c.stove!, status: e.detail.value } }); }}"
            ></sf-editor-dropdown-entity>
            <sf-editor-input
              type="number"
              .label="${this.getLabel('input-pellet-low-threshold')}"
              .value="${String(stove.low_threshold ?? 0.3)}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, stove: { ...c.stove!, low_threshold: parseFloat(e.detail.value) } }); }}"
            ></sf-editor-input>
            <div class="btn-row">
              <button class="btn-action" @click="${() => this._disableSection('stove')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('stove', { pellet_quantity: '', pellet_stock: '', status: '' })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  // ── VEHICLE ─────────────────────────────────────────────────────────────────

  private _renderVehicleSection(): TemplateResult {
    const vehicle = this._config.vehicle;
    const enabled = !!vehicle;
    const sensors = this._entitiesByDomain('sensor');

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-vehicle')}" icon="mdi:ev-station" ?open="${enabled}">
        <div class="panel">
          ${enabled && vehicle ? html`
            <sf-editor-dropdown-icon
              .label="${this.getLabel('input-icon-section')}"
              .value="${vehicle.icon ?? 'mdi:ev-station'}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, vehicle: { ...c.vehicle!, icon: e.detail.value } }); }}"
            ></sf-editor-dropdown-icon>
            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-power-sensor')}"
              .value="${vehicle.power_sensor ?? ''}"
              .items="${sensors}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, vehicle: { ...c.vehicle!, power_sensor: e.detail.value } }); }}"
            ></sf-editor-dropdown-entity>
            <div class="btn-row">
              <button class="btn-action" @click="${() => this._disableSection('vehicle')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('vehicle', { power_sensor: '' })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  // ── CALL KIDS ───────────────────────────────────────────────────────────────

  private _renderCallKidsSection(): TemplateResult {
    const callKids = this._config.call_kids;
    const enabled = !!callKids;
    const buttons = this._entitiesByDomain('input_button');

    return html`
      <sf-editor-accordion title="${this.getLabel('action-call-children')}" icon="mdi:bullhorn" ?open="${enabled}">
        <div class="panel">
          ${enabled && callKids ? html`
            <sf-editor-dropdown-entity
              .label="${this.getLabel('input-input-button-entity')}"
              .value="${callKids.entity}"
              .items="${buttons}"
              @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, call_kids: { ...c.call_kids!, entity: e.detail.value } }); }}"
            ></sf-editor-dropdown-entity>
            <div class="field-row">
              <sf-editor-input
                .label="${this.getLabel('input-button-text')}"
                .value="${callKids.name ?? ''}"
                @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, call_kids: { ...c.call_kids!, name: e.detail.value || undefined } }); }}"
              ></sf-editor-input>
              <sf-editor-dropdown-icon
                .label="${this.getLabel('input-icon-optional')}"
                .value="${callKids.icon ?? ''}"
                @input-update="${(e: CustomEvent) => { const c = this._getNewConfig<SciFiBridgeConfig>(); this._dispatch({ ...c, call_kids: { ...c.call_kids!, icon: e.detail.value || undefined } }); }}"
              ></sf-editor-dropdown-icon>
            </div>
            <div class="btn-row">
              <button class="btn-action" @click="${() => this._disableSection('call_kids')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('call_kids', { entity: '' })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  // ── ACTIONS ─────────────────────────────────────────────────────────────────

  private _renderActionsSection(): TemplateResult {
    const actions = this._config.actions;
    const enabled = !!actions;
    const allEntities = this._entitiesByDomain('input_button', 'script', 'automation');

    return html`
      <sf-editor-accordion title="${this.getLabel('section-title-actions')}" icon="mdi:lightning-bolt" ?open="${enabled}">
        <div class="panel">
          ${enabled && actions ? html`
            ${(actions.items ?? []).map((item, i) => html`
              <div class="list-row">
                <sf-editor-dropdown-entity
                  .label="${this.getLabel('input-action-entity')}"
                  .value="${item.entity}"
                  .items="${allEntities}"
                  @input-update="${(e: CustomEvent) => this._updateAction(i, { entity: e.detail.value })}"
                ></sf-editor-dropdown-entity>
                <div class="field-row">
                  <sf-editor-input .label="${this.getLabel('input-name')}" .value="${item.name ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateAction(i, { name: e.detail.value || undefined })}">
                  </sf-editor-input>
                  <sf-editor-dropdown-icon .label="${this.getLabel('input-icon-optional')}" .value="${item.icon ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateAction(i, { icon: e.detail.value || undefined })}">
                  </sf-editor-dropdown-icon>
                  <sf-editor-input .label="${this.getLabel('input-color-optional')}" .value="${item.color ?? ''}"
                    @input-update="${(e: CustomEvent) => this._updateAction(i, { color: e.detail.value || undefined })}">
                  </sf-editor-input>
                </div>
                <button class="btn-delete" @click="${() => this._removeAction(i)}">✕ ${this.getLabel('action-remove')}</button>
              </div>
            `)}
            <div class="btn-row">
              <button class="btn-add" @click="${this._addAction}">+ ${this.getLabel('section-title-action')}</button>
              <button class="btn-action" @click="${() => this._disableSection('actions')}">✕ ${this.getLabel('action-disable')}</button>
            </div>
          ` : html`
            <button class="btn-add" @click="${() => this._enableSection('actions', { items: [] })}">▶ ${this.getLabel('action-enable-section')}</button>
          `}
        </div>
      </sf-editor-accordion>
    `;
  }

  private _addAction(): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeActionItem[] = [...(c.actions?.items ?? []), { entity: '' }];
    this._dispatch({ ...c, actions: { ...(c.actions ?? {}), items } });
  }

  private _removeAction(i: number): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items = (c.actions?.items ?? []).filter((_, idx) => idx !== i);
    this._dispatch({ ...c, actions: { ...(c.actions ?? {}), items: items.length ? items : [] } });
  }

  private _updateAction(i: number, patch: Partial<BridgeActionItem>): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const items: BridgeActionItem[] = (c.actions?.items ?? []).map((item, idx) =>
      idx === i ? { ...item, ...patch } : item
    );
    this._dispatch({ ...c, actions: { ...(c.actions ?? {}), items } });
  }

  // ── Section enable / disable ────────────────────────────────────────────────

  private _disableSection(key: keyof SciFiBridgeConfig): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    const updated = { ...c };
    delete (updated as Record<string, unknown>)[key as string];
    this._dispatch(updated);
  }

  private _enableSection(key: keyof SciFiBridgeConfig, defaultValue: unknown): void {
    const c = this._getNewConfig<SciFiBridgeConfig>();
    this._dispatch({ ...c, [key]: defaultValue });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiBridgeEditor;
  }
}
