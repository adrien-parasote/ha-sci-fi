/**
 * <sci-fi-lights-editor> — Graphical editor for the sci-fi-lights card.
 *
 * Main view sections:
 *   1. Header — header_message input
 *   2. Appearance — default_icon_on / default_icon_off dropdowns
 *   3. Display selection — first_floor_to_render + first_area_to_render
 *   4. Entities to exclude — multi-entity for ignored_entities
 *   5. Light entities customization — list of custom_entities with edit/delete
 *
 * Edit view: name + icon_on + icon_off for the selected custom_entity.
 *
 * CRITICAL GUARD: Auto-setup of first_floor_to_render dispatches only
 * if value differs from current config, preventing infinite render loops.
 *
 * Spec 10 § sci-fi-lights-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiLightsConfig,
  SciFiEntityOverride,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import {
  getFloors,
  getAreasByFloor,
  getEntitiesByAreaAndDomain,
} from '../../selectors/house.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-multi-entity.js';
import '../../components/buttons/sf-button.js';

@customElement('sci-fi-lights-editor')
export class SciFiLightsEditor extends SciFiBaseEditor {
  @state() private _floorItems: EditorHassEntity[] = [];
  @state() private _areaItems: EditorHassEntity[] = [];
  @state() private _lightEntities: EditorHassEntity[] = [];
  @state() private _edit = false;
  @state() private _editTarget: string | null = null; // entity_id being edited

  // Guard: prevents auto-dispatch loop
  private _autoSetupDone = false;

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass) return;
    const floors = getFloors(hass);
    this._floorItems = floors.map(f => ({
      entity_id: f.floor_id,
      attributes: {
        friendly_name: f.name,
        icon: f.icon ?? 'mdi:home-floor-1',
      },
    }));

    // Build a flat list of all light entities across all areas
    const allLights: EditorHassEntity[] = [];
    for (const floor of floors) {
      const areas = getAreasByFloor(hass, floor.floor_id);
      for (const area of areas) {
        const entries = getEntitiesByAreaAndDomain(hass, area.area_id, 'light');
        for (const entry of entries) {
          const state = hass.states[entry.entity_id];
          allLights.push({
            entity_id: entry.entity_id,
            attributes: {
              friendly_name: state?.attributes?.['friendly_name'] as string | undefined,
              icon: (state?.attributes?.['icon'] as string | undefined) ?? 'mdi:lightbulb',
            },
          });
        }
      }
    }
    this._lightEntities = allLights;

    // Auto-setup: set first_floor_to_render if unset
    this._tryAutoSetup(hass);
    // Update area items for the current floor
    this._updateAreaItems(hass);
  }

  private _tryAutoSetup(hass: NonNullable<typeof this.hass>): void {
    if (this._autoSetupDone || !this.config) return;
    const config = this.config as SciFiLightsConfig;
    if (config.first_floor_to_render) return;

    const floors = getFloors(hass);
    for (const floor of floors) {
      const areas = getAreasByFloor(hass, floor.floor_id);
      const hasLights = areas.some(area =>
        getEntitiesByAreaAndDomain(hass, area.area_id, 'light').length > 0
      );
      if (hasLights) {
        this._autoSetupDone = true;
        // Use async dispatch to avoid rendering during rendering
        void Promise.resolve().then(() => {
          const newConfig = this._getNewConfig<SciFiLightsConfig>();
          (newConfig as unknown as Record<string, unknown>)['first_floor_to_render'] = floor.floor_id;
          this._dispatchChange(newConfig);
        });
        return;
      }
    }
    this._autoSetupDone = true;
  }

  private _updateAreaItems(hass: NonNullable<typeof this.hass>): void {
    const config = this.config as SciFiLightsConfig | undefined;
    const floorId = config?.first_floor_to_render;
    if (!floorId) { this._areaItems = []; return; }

    const areas = getAreasByFloor(hass, floorId).filter(area =>
      getEntitiesByAreaAndDomain(hass, area.area_id, 'light').length > 0
    );
    this._areaItems = areas.map(a => ({
      entity_id: a.area_id,
      attributes: {
        friendly_name: a.name,
        icon: a.icon ?? 'mdi:map-marker',
      },
    }));
  }

  private _update(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const { id, value } = e.detail;

    if (id === 'first_floor_to_render') {
      (newConfig as unknown as Record<string, unknown>)['first_floor_to_render'] = value;
      // Reset area when floor changes
      (newConfig as unknown as Record<string, unknown>)['first_area_to_render'] = null;
    } else {
      (newConfig as unknown as Record<string, unknown>)[id] = value;
    }

    this._dispatchChange(newConfig);
  }

  private _updateIgnored(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const current = [...(newConfig.ignored_entities ?? [])];
    if (e.detail.type === 'add') {
      current.push(e.detail.value);
    } else if (e.detail.type === 'remove') {
      current.splice(parseInt(e.detail.value, 10), 1);
    }
    (newConfig as unknown as Record<string, unknown>)['ignored_entities'] = current;
    this._dispatchChange(newConfig);
  }

  private _addCustomEntity(): void {
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const custom = { ...(newConfig.custom_entities ?? {}) };
    // Find a unique key (light.new, light.new1, …)
    let key = 'light.new';
    let i = 1;
    while (key in custom) { key = `light.new${i++}`; }
    custom[key] = {
      name: '',
      icon_on: 'mdi:lightbulb-on-outline',
      icon_off: 'mdi:lightbulb-outline',
    };
    (newConfig as unknown as Record<string, unknown>)['custom_entities'] = custom;
    this._dispatchChange(newConfig);
    // Open edit view immediately on the newly created entry
    this._editTarget = key;
    this._edit = true;
  }

  private _deleteCustomEntity(entityId: string): void {
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const custom = { ...(newConfig.custom_entities ?? {}) };
    delete custom[entityId];
    (newConfig as unknown as Record<string, unknown>)['custom_entities'] = custom;
    this._dispatchChange(newConfig);
  }

  private _renameCustomEntity(oldId: string, newId: string): void {
    if (!newId || newId === oldId) return;
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const custom = { ...(newConfig.custom_entities ?? {}) };
    const entry = { ...(custom[oldId] ?? {}) };
    delete custom[oldId];
    custom[newId] = entry;
    (newConfig as unknown as Record<string, unknown>)['custom_entities'] = custom;
    // Keep edit target in sync
    if (this._editTarget === oldId) this._editTarget = newId;
    this._dispatchChange(newConfig);
  }

  private _startEditCustom(entityId: string): void {
    this._editTarget = entityId;
    this._edit = true;
  }

  private _endEdit(): void {
    this._edit = false;
    this._editTarget = null;
  }

  private _updateCustomEntity(e: CustomEvent<InputUpdateDetail>): void {
    if (!this._editTarget) return;
    const newConfig = this._getNewConfig<SciFiLightsConfig>();
    const custom = { ...(newConfig.custom_entities ?? {}) };
    custom[this._editTarget] = {
      ...(custom[this._editTarget] ?? {}),
      [e.detail.id]: e.detail.value,
    };
    (newConfig as unknown as Record<string, unknown>)['custom_entities'] = custom;
    this._dispatchChange(newConfig);
  }

  private _renderCustomEntityRow(entityId: string, override: SciFiEntityOverride): TemplateResult {
    return html`
      <div class="entity-row">
        <sf-editor-dropdown-entity
          element-id="${entityId}"
          kind="custom_entities"
          label="${this.getLabel('input-entity-id')} ${this.getLabel('text-required')}"
          .value="${entityId}"
          .items="${this._lightEntities}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._renameCustomEntity(entityId, e.detail.value)}"
        ></sf-editor-dropdown-entity>
        <div class="delete-btn">
          <sf-button
            icon="mdi:delete-outline"
            style="--btn-icon-size: 20px;"
            @button-click="${() => this._deleteCustomEntity(entityId)}"
          ></sf-button>
        </div>
        <button class="edit-btn" @click="${() => this._startEditCustom(entityId)}">✎</button>
      </div>
    `;
  }

  private _renderEditView(): TemplateResult {
    if (!this._editTarget) return html``;
    const config = this.config as SciFiLightsConfig;
    const entry = config.custom_entities?.[this._editTarget] ?? {};
    return html`
      <div class="editor">
        <div class="head">
          <sf-button
            icon="mdi:chevron-left"
            @button-click="${this._endEdit}"
          ></sf-button>
          <span>${this.getLabel('edit-section-title')} — ${this._editTarget}</span>
        </div>
        <sf-editor-input
          element-id="name"
          kind="custom-entity"
          label="${this.getLabel('input-name')}"
          icon="mdi:cursor-text"
          .value="${entry.name ?? ''}"
          @input-update="${this._updateCustomEntity}"
        ></sf-editor-input>
        <sf-editor-dropdown-icon
          element-id="icon_on"
          kind="custom-entity"
          label="${this.getLabel('input-active-icon')}"
          .value="${entry.icon_on ?? ''}"
          @input-update="${this._updateCustomEntity}"
        ></sf-editor-dropdown-icon>
        <sf-editor-dropdown-icon
          element-id="icon_off"
          kind="custom-entity"
          label="${this.getLabel('input-inactive-icon')}"
          .value="${entry.icon_off ?? ''}"
          @input-update="${this._updateCustomEntity}"
        ></sf-editor-dropdown-icon>
      </div>
    `;
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiLightsConfig;
    const customEntries = Object.entries(config.custom_entities ?? {});
    return html`
      <div class="card">
        <div class="container ${this._edit ? 'false' : 'true'}">

          <!-- Header -->
          <section>
            <h1>${this.getSectionTitle('section-title-header')}</h1>
            <sf-editor-input
              element-id="header_message"
              kind="header"
              label="${this.getLabel('input-message-text')}"
              icon="mdi:cursor-text"
              .value="${config.header_message ?? ''}"
              @input-update="${this._update}"
            ></sf-editor-input>
          </section>

          <!-- Appearance -->
          <section>
            <h1>${this.getSectionTitle('section-title-appearance')}</h1>
            <sf-editor-dropdown-icon
              element-id="default_icon_on"
              kind="appearance"
              label="${this.getLabel('input-active-icon')}"
              .value="${config.default_icon_on ?? ''}"
              @input-update="${this._update}"
            ></sf-editor-dropdown-icon>
            <sf-editor-dropdown-icon
              element-id="default_icon_off"
              kind="appearance"
              label="${this.getLabel('input-inactive-icon')}"
              .value="${config.default_icon_off ?? ''}"
              @input-update="${this._update}"
            ></sf-editor-dropdown-icon>
          </section>

          <!-- Display selection -->
          <section>
            <h1>${this.getSectionTitle('section-title-home-selection')}</h1>
            <sf-editor-dropdown-entity
              element-id="first_floor_to_render"
              kind="floor"
              label="${this.getLabel('input-floor-id')}"
              icon="mdi:floor-plan"
              .value="${config.first_floor_to_render ?? ''}"
              .items="${this._floorItems}"
              @input-update="${this._update}"
            ></sf-editor-dropdown-entity>
            <sf-editor-dropdown-entity
              element-id="first_area_to_render"
              kind="area"
              label="${this.getLabel('input-area-id')}"
              icon="mdi:texture-box"
              .value="${config.first_area_to_render ?? ''}"
              .items="${this._areaItems}"
              @input-update="${this._update}"
            ></sf-editor-dropdown-entity>
          </section>

          <!-- Entities to exclude -->
          <section>
            <h1>${this.getSectionTitle('section-title-settings')}</h1>
            <sf-editor-multi-entity
              element-id="ignored_entities"
              kind="exclude"
              label="${this.getLabel('input-entities-to-exclude')}"
              .values="${[...(config.ignored_entities ?? [])]}"
              .items="${this._lightEntities}"
              @input-update="${this._updateIgnored}"
            ></sf-editor-multi-entity>
          </section>

          <!-- Custom entities -->
          <section>
            <h1>${this.getSectionTitle('section-title-entity-light-custom')}</h1>
            ${customEntries.map(([id, override]) => this._renderCustomEntityRow(id, override))}
            <button class="add-btn" @click="${this._addCustomEntity}">
              + ${this.getLabel('action-add-custom-entity')}
            </button>
          </section>

        </div>

        <div class="editor ${this._edit ? 'true' : 'false'}">
          ${this._edit ? this._renderEditView() : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-lights-editor': SciFiLightsEditor;
  }
}
