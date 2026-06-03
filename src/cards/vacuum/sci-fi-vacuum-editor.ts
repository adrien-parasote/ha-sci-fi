/**
 * <sci-fi-vacuum-editor> — Graphical editor for the sci-fi-vacuum card.
 *
 * Most complex editor:
 * - Tab per vacuum in config.vacuums[]
 * - Per-tab: Entity, Actions, Sensors, Shortcuts sub-sections
 * - Shortcut edit mode with name/icon/segments
 *
 * Spec 10 § sci-fi-vacuum-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiVacuumConfig,
  SciFiVacuumEntry,
  SciFiVacuumShortcutDescription,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-accordion.js';
import '../../components/sf-toggle-switch/sf-toggle-switch.js';
import '../../components/buttons/sf-button.js';

type ActionKey = 'start' | 'pause' | 'stop' | 'return_to_base' | 'set_fan_speed';

const ACTION_KEYS: ActionKey[] = ['start', 'pause', 'stop', 'return_to_base', 'set_fan_speed'];
const ACTION_LABELS: Record<ActionKey, string> = {
  start: 'text-switch-action-start',
  pause: 'text-switch-action-pause',
  stop: 'text-switch-action-stop',
  return_to_base: 'text-switch-action-return-to-base',
  set_fan_speed: 'text-switch-action-set-fan-speed',
};

@customElement('sci-fi-vacuum-editor')
export class SciFiVacuumEditor extends SciFiBaseEditor {
  @state() private _vacuumEntities: EditorHassEntity[] = [];
  @state() private _activeVacuum = 0;
  @state() private _edit = false;
  @state() private _shortcutId: number | null = null;

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._vacuumEntities.length > 0) return;
    this._vacuumEntities = Object.values(hass.states)
      .filter(e => e.entity_id.startsWith('vacuum.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'],
          icon: (e.attributes['icon'] as string | undefined) ?? 'mdi:robot-vacuum',
        },
      }));
  }

  private _updateVacuumField(
    vacuumIndex: number,
    field: string,
    value: string | boolean
  ): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    vacuums[vacuumIndex] = { ...vacuums[vacuumIndex], [field]: value } as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _updateSensor(vacuumIndex: number, field: string, value: string): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    vacuums[vacuumIndex] = ({
      ...vacuums[vacuumIndex],
      sensors: { ...(vacuums[vacuumIndex]!.sensors ?? {}), [field]: value },
    } as unknown as SciFiVacuumEntry);
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _updateShortcutField(
    vacuumIndex: number,
    shortcutIndex: number,
    field: string,
    value: string
  ): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])].map(d => ({ ...d }));
    descriptions[shortcutIndex] = { ...descriptions[shortcutIndex], [field]: value } as unknown as (typeof descriptions)[0];
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _updateShortcutsTop(vacuumIndex: number, field: string, value: string): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    vacuum.shortcuts = { ...(vacuum.shortcuts ?? {}), [field]: value };
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _addShortcutSegment(vacuumIndex: number, shortcutIndex: number): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])].map(d => ({ ...d }));
    const sc = { ...descriptions[shortcutIndex] };
    const segs = [...(sc.segments ?? []), 0];
    descriptions[shortcutIndex] = { ...sc, segments: segs } as unknown as (typeof descriptions)[0];
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _removeShortcutSegment(vacuumIndex: number, shortcutIndex: number, segIndex: number): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])].map(d => ({ ...d }));
    const sc = { ...descriptions[shortcutIndex] };
    const segs = [...(sc.segments ?? [])];
    segs.splice(segIndex, 1);
    descriptions[shortcutIndex] = { ...sc, segments: segs } as unknown as (typeof descriptions)[0];
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _updateShortcutSegment(
    vacuumIndex: number,
    shortcutIndex: number,
    segIndex: number,
    value: string
  ): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])].map(d => ({ ...d }));
    const sc = { ...descriptions[shortcutIndex] };
    const segs = [...(sc.segments ?? [])];
    segs[segIndex] = parseInt(value, 10) || 0;
    descriptions[shortcutIndex] = { ...sc, segments: segs } as unknown as (typeof descriptions)[0];
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._dispatchChange(newConfig);
  }

  private _addShortcut(vacuumIndex: number): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])];
    descriptions.push({ name: '', segments: [] });
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._shortcutId = descriptions.length - 1;
    this._edit = true;
    this._dispatchChange(newConfig);
  }

  private _deleteShortcut(vacuumIndex: number, shortcutIndex: number): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    const vacuum = { ...vacuums[vacuumIndex] };
    const shortcuts = { ...(vacuum.shortcuts ?? {}) };
    const descriptions = [...(shortcuts.description ?? [])];
    descriptions.splice(shortcutIndex, 1);
    shortcuts.description = descriptions;
    vacuum.shortcuts = shortcuts;
    vacuums[vacuumIndex] = vacuum as unknown as SciFiVacuumEntry;
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._edit = false;
    this._shortcutId = null;
    this._dispatchChange(newConfig);
  }

  private _addVacuum(): void {
    const newConfig = this._getNewConfig<SciFiVacuumConfig>();
    const vacuums = ([...(newConfig.vacuums ?? [])].map(v => ({ ...v })) as unknown as SciFiVacuumEntry[]);
    vacuums.push({ entity: '' });
    (newConfig as unknown as Record<string, unknown>)['vacuums'] = vacuums;
    this._activeVacuum = vacuums.length - 1;
    this._dispatchChange(newConfig);
  }

  private _renderShortcutEditView(vi: number): TemplateResult {
    if (this._shortcutId === null) return html``;
    const config = this.config as SciFiVacuumConfig;
    const sc = config.vacuums?.[vi]?.shortcuts?.description?.[this._shortcutId];
    if (!sc) return html``;
    return html`
      <div class="editor">
        <div class="head">
          <sf-button
            icon="mdi:chevron-left"
            @button-click="${() => { this._edit = false; this._shortcutId = null; }}"
          ></sf-button>
          <span>${this.getLabel('action-edit-shortcut')} — ${sc.name || this._shortcutId}</span>
        </div>
        <sf-editor-input
          element-id="name"
          kind="shortcut-name"
          label="${this.getLabel('input-name')}"
          .value="${sc.name ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateShortcutField(vi, this._shortcutId!, 'name', e.detail.value)}"
        ></sf-editor-input>
        <sf-editor-dropdown-icon
          element-id="icon"
          kind="shortcut-icon"
          label="${this.getLabel('input-icon')}"
          .value="${sc.icon ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateShortcutField(vi, this._shortcutId!, 'icon', e.detail.value)}"
        ></sf-editor-dropdown-icon>
        <h1 style="font-size:0.8rem;margin:8px 0 4px;color:var(--secondary-text-color)">${this.getLabel('section-title-segments')}</h1>
        ${(sc.segments ?? []).map((seg, si) => html`
          <div class="row">
            <sf-editor-input
              style="flex:1"
              element-id="segment_${si}"
              kind="segment"
              type="number"
              label="${this.getLabel('input-segment')} ${si + 1}"
              .value="${String(seg)}"
              @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateShortcutSegment(vi, this._shortcutId!, si, e.detail.value)}"
            ></sf-editor-input>
            <div class="delete-btn">
              <sf-button
                icon="mdi:delete-outline"
                style="--btn-icon-size: 20px;"
                @button-click="${() => this._removeShortcutSegment(vi, this._shortcutId!, si)}"
              ></sf-button>
            </div>
          </div>
        `)}
        <button class="add-btn" @click="${() => this._addShortcutSegment(vi, this._shortcutId!)}">
          + ${this.getLabel('action-add-segment')}
        </button>
        <div class="delete-btn" style="width:100%;">
          <sf-button
            icon="mdi:delete-outline"
            style="--btn-icon-size: 20px;"
            @button-click="${() => this._deleteShortcut(vi, this._shortcutId!)}"
          ></sf-button>
          <span style="font-size:0.875rem;color:var(--editor-section-color)">${this.getLabel('action-delete-shortcut')}</span>
        </div>
      </div>
    `;
  }

  private _renderVacuumPanel(vacuum: SciFiVacuumEntry, vi: number): TemplateResult {
    const shortcuts = vacuum.shortcuts ?? {};
    const descriptions: SciFiVacuumShortcutDescription[] = [...(shortcuts.description ?? [])];
    return html`
      <div class="container ${this._edit ? 'false' : 'true'}">

        <!-- Entity -->
        <section>
          <h1>${this.getSectionTitle('section-title-entity')}</h1>
          <sf-editor-dropdown-entity
            element-id="entity"
            kind="vacuum-entity"
            label="${this.getLabel('input-vacuum-entity')}"
            .value="${vacuum.entity ?? ''}"
            .items="${this._vacuumEntities}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateVacuumField(vi, 'entity', e.detail.value)}"
          ></sf-editor-dropdown-entity>
        </section>

        <!-- Actions -->
        <sf-editor-accordion title="${this.getLabel('section-title-default-actions')}" icon="mdi:play">
          ${ACTION_KEYS.map(key => html`
            <sf-toggle-switch
              .checked="${(vacuum as unknown as Record<string, unknown>)[key] === true}"
              label="${this.getLabel(ACTION_LABELS[key])}"
              @sf-toggle-change="${(e: CustomEvent<{ checked: boolean }>) => this._updateVacuumField(vi, key, e.detail.checked)}"
            ></sf-toggle-switch>
          `)}
        </sf-editor-accordion>

        <!-- Sensors -->
        <sf-editor-accordion title="${this.getLabel('section-title-sensor')}" icon="mdi:radar">
          ${(['battery', 'map', 'current_clean_area', 'current_clean_duration', 'mop_intensite'] as const).map(f => html`
            <sf-editor-input
              element-id="${f}"
              kind="vacuum-sensor"
              label="${this.getLabel(`input-${f.replace('_', '-')}`)}"
              .value="${vacuum.sensors?.[f] ?? ''}"
              @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateSensor(vi, f, e.detail.value)}"
            ></sf-editor-input>
          `)}
        </sf-editor-accordion>

        <!-- Shortcuts -->
        <sf-editor-accordion title="${this.getLabel('section-title-shortcuts')}" icon="mdi:map-marker-multiple">
          <sf-editor-input
            element-id="service"
            kind="shortcuts-top"
            label="${this.getLabel('input-service')}"
            .value="${shortcuts.service ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateShortcutsTop(vi, 'service', e.detail.value)}"
          ></sf-editor-input>
          <sf-editor-input
            element-id="command"
            kind="shortcuts-top"
            label="${this.getLabel('input-command')}"
            .value="${shortcuts.command ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateShortcutsTop(vi, 'command', e.detail.value)}"
          ></sf-editor-input>
          ${descriptions.map((sc, si) => html`
            <div class="row">
              <span class="row-label">${sc.name || `Shortcut ${si + 1}`}</span>
              <button class="edit-btn" @click="${() => { this._shortcutId = si; this._edit = true; }}">✎</button>
              <div class="delete-btn">
                <sf-button
                  icon="mdi:delete-outline"
                  style="--btn-icon-size: 20px;"
                  @button-click="${() => this._deleteShortcut(vi, si)}"
                ></sf-button>
              </div>
            </div>
          `)}
          <button class="add-btn" @click="${() => this._addShortcut(vi)}">
            + ${this.getLabel('action-add-shortcut')}
          </button>
        </sf-editor-accordion>
      </div>

      <div class="editor ${this._edit ? 'true' : 'false'}">
        ${this._edit ? this._renderShortcutEditView(vi) : nothing}
      </div>
    `;
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiVacuumConfig;
    const vacuums = config.vacuums ?? [];
    return html`
      <div class="card">
        <!-- Tab bar -->
        <div style="width:100%">
          <div class="tabs-header">
            ${vacuums.map((v, i) => html`
              <button
                class="tab-btn ${this._activeVacuum === i ? 'active' : ''}"
                @click="${() => { this._activeVacuum = i; this._edit = false; this._shortcutId = null; }}"
              >
                ${v.entity || `Vacuum ${i + 1}`}
              </button>
            `)}
            <button class="tab-btn" @click="${this._addVacuum}">+</button>
          </div>

          ${vacuums.length > 0
            ? this._renderVacuumPanel(vacuums[this._activeVacuum] ?? { entity: '' }, this._activeVacuum)
            : html`<p style="color:var(--secondary-text-color);padding:12px">${this.getLabel('text-no-vacuum')}</p>`}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-vacuum-editor': SciFiVacuumEditor;
  }
}
