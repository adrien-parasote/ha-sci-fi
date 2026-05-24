/**
 * <sci-fi-hexa-tiles-editor> — Graphical editor for the sci-fi-hexa-tiles card.
 *
 * Port fidèle du JS original (issue-13 branch):
 *   1. Section plate En-Tête   — header_message (toujours visible)
 *   2. Section plate Météo     — toggle + accordion (ouvert) avec: entity, link,
 *                                alert entity, 4 alert state values
 *   3. Accordéons per-tile     — Entity (standalone/kind), Appearance, Technical, Visibility
 *
 * Spec 10 § sci-fi-hexa-tiles-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiHexaTilesConfig,
  SciFiHexaTileConfig,
  SciFiHexaTilesWeatherConfig,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-multi-entity.js';
import '../../components/editor-inputs/sf-editor-chips.js';
import '../../components/editor-inputs/sf-editor-accordion.js';
import '../../components/sf-toggle-switch/sf-toggle-switch.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';

const ENTITY_KINDS = ['light', 'climate', 'vacuum', 'plug', 'switch'];

/** Alert state colour fields — values are the HA state strings (e.g. "Vert", "Jaune"). */
const ALERT_FIELDS: { field: 'state_green' | 'state_yellow' | 'state_orange' | 'state_red'; labelKey: string }[] = [
  { field: 'state_green',  labelKey: 'input-alert-green'  },
  { field: 'state_yellow', labelKey: 'input-alert-yellow' },
  { field: 'state_orange', labelKey: 'input-alert-orange' },
  { field: 'state_red',    labelKey: 'input-alert-red'    },
];

/** A HA person entity enriched for the visibility editor. */
interface PersonEntry {
  entityId: string;
  friendlyName: string;
  entityPicture: string | null; // URL or null
}

@customElement('sci-fi-hexa-tiles-editor')
export class SciFiHexaTilesEditor extends SciFiBaseEditor {
  @state() private _weatherEntities: EditorHassEntity[] = [];
  @state() private _people: PersonEntry[] = [];
  @state() private _entitiesByDomain: Record<string, EditorHassEntity[]> = {};

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass) return;

    const allEntities = Object.values(hass.states);

    // Always recompute persons — their picture/name can change at any time.
    const people = allEntities
      .filter(e => e.entity_id.startsWith('person.'))
      .map(e => ({
        entityId: e.entity_id,
        friendlyName: (e.attributes['friendly_name'] as string | undefined) ?? e.entity_id,
        entityPicture: (e.attributes['entity_picture'] as string | undefined) ?? null,
      }));
    // Avoid triggering a re-render if the list hasn't changed.
    if (JSON.stringify(people) !== JSON.stringify(this._people)) {
      this._people = people;
    }

    // Entities by domain — computed once (heavy, rarely changes at runtime).
    if (Object.keys(this._entitiesByDomain).length > 0) return;

    this._weatherEntities = allEntities
      .filter(e => e.entity_id.startsWith('weather.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'] as string | undefined,
          icon: e.attributes['icon'] as string | undefined,
        },
      }));

    const byDomain: Record<string, EditorHassEntity[]> = {};
    for (const kind of ENTITY_KINDS) {
      byDomain[kind] = allEntities
        .filter(e => e.entity_id.startsWith(`${kind}.`))
        .map(e => ({
          entity_id: e.entity_id,
          attributes: {
            friendly_name: e.attributes['friendly_name'] as string | undefined,
            icon: e.attributes['icon'] as string | undefined,
          },
        }));
    }
    this._entitiesByDomain = byDomain;
  }

  // ─── Config mutation helpers ───────────────────────────────────────────────

  private _updateHeaderMessage(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    (newConfig as unknown as Record<string, unknown>)['header_message'] = e.detail.value || undefined;
    this._dispatchChange(newConfig);
  }

  private _toggleWeather(e: CustomEvent<{ checked: boolean }>): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    newConfig.weather = ({
      ...(newConfig.weather ?? { weather_entity: '' }),
      activate: e.detail.checked,
    } as unknown as SciFiHexaTilesWeatherConfig);
    this._dispatchChange(newConfig);
  }

  /** Updates a top-level field inside config.weather (entity, link, alert states…). */
  private _updateWeatherField(field: string, value: string): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    newConfig.weather = ({
      ...(newConfig.weather ?? {}),
      [field]: value || undefined,
    } as unknown as SciFiHexaTilesWeatherConfig);
    this._dispatchChange(newConfig);
  }

  private _updateTileField(index: number, field: string, value: unknown): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    tiles[index] = { ...tiles[index], [field]: value } as unknown as SciFiHexaTileConfig;
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  private _updateTileExclude(index: number, e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    const current = [...(tiles[index]!.entities_to_exclude ?? [])];
    if (e.detail.type === 'add') {
      current.push(e.detail.value);
    } else if (e.detail.type === 'remove') {
      current.splice(parseInt(e.detail.value, 10), 1);
    }
    tiles[index] = { ...tiles[index], entities_to_exclude: current } as unknown as SciFiHexaTileConfig;
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  private _updateTileStateOn(index: number, e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    const current = [...(tiles[index]!.state_on ?? [])];
    if (e.detail.type === 'add') {
      current.push(e.detail.value);
    } else if (e.detail.type === 'remove') {
      current.splice(parseInt(e.detail.value, 10), 1);
    }
    tiles[index] = { ...tiles[index], state_on: current } as unknown as SciFiHexaTileConfig;
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  private _toggleVisibility(index: number, personEntityId: string): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    const tile = tiles[index]!;
    const current = [...(tile.visibility ?? [])];
    const idx = current.indexOf(personEntityId);
    if (idx === -1) {
      current.push(personEntityId);
    } else {
      current.splice(idx, 1);
    }
    tiles[index] = { ...tile, visibility: current } as unknown as SciFiHexaTileConfig;
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  private _addTile(): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    tiles.push({
      entity_kind: 'light',
      entities_to_exclude: [],
      active_icon: 'mdi:lightbulb-on-outline',
      inactive_icon: 'mdi:lightbulb-outline',
      name: 'Lights',
      state_on: ['on'],
      visibility: [],
    } as unknown as SciFiHexaTileConfig);
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  private _removeTile(index: number): void {
    const newConfig = this._getNewConfig<SciFiHexaTilesConfig>();
    const tiles = ([...(newConfig.tiles ?? [])].map(t => ({ ...t })) as unknown as SciFiHexaTileConfig[]);
    tiles.splice(index, 1);
    (newConfig as unknown as Record<string, unknown>)['tiles'] = tiles;
    this._dispatchChange(newConfig);
  }

  // ─── Section renders ───────────────────────────────────────────────────────

  /** En-Tête — always visible, flat section */
  private _renderHeader(config: SciFiHexaTilesConfig): TemplateResult {
    return html`
      <section>
        <h1>${this.getSectionTitle('section-title-header')}</h1>
        <sf-editor-input
          element-id="header_message"
          kind=""
          label="${this.getLabel('input-message-text')} ${this.getLabel('text-optional')}"
          icon="mdi:cursor-text"
          .value="${config.header_message ?? ''}"
          @input-update="${this._updateHeaderMessage}"
        ></sf-editor-input>
      </section>
    `;
  }

  /** Météo — flat section with toggle, then an open accordion when active */
  private _renderWeather(config: SciFiHexaTilesConfig): TemplateResult {
    const weatherActive = config.weather?.activate ?? false;
    return html`
      <section>
        <h1>${this.getSectionTitle('section-title-weather')}</h1>
        <sf-toggle-switch
          .checked="${weatherActive}"
          label="${this.getLabel('text-switch-hexa-add-weather-tile')}"
          @sf-toggle-change="${this._toggleWeather}"
        ></sf-toggle-switch>

        ${weatherActive ? this._renderWeatherEntities(config) : nothing}
      </section>
    `;
  }

  /** Inner accordion (open by default) with all weather fields */
  private _renderWeatherEntities(config: SciFiHexaTilesConfig): TemplateResult {
    return html`
      <sf-editor-accordion
        title="${this.getLabel('section-title-weather')}"
        icon="mdi:weather-partly-snowy-rainy"
        element-id="weather-detail"
        ?open="${true}"
      >
        <sf-editor-dropdown-entity
          element-id="weather_entity"
          kind="weather_entity"
          label="${this.getLabel('input-weather-entity')} ${this.getLabel('text-required')}"
          icon="mdi:weather-sunny"
          .value="${config.weather?.weather_entity ?? ''}"
          .items="${this._weatherEntities}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateWeatherField('weather_entity', e.detail.value)}"
        ></sf-editor-dropdown-entity>

        <sf-editor-input
          element-id="weather_link"
          kind="link"
          label="${this.getLabel('input-link')} ${this.getLabel('text-optional')}"
          icon="mdi:link-edit"
          .value="${config.weather?.link ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateWeatherField('link', e.detail.value)}"
        ></sf-editor-input>

        <sf-editor-input
          element-id="weather_alert_entity"
          kind="weather_alert_entity"
          label="${this.getLabel('input-weather-alert-entity-id')}"
          icon="mdi:weather-sunny-alert"
          .value="${config.weather?.weather_alert_entity ?? ''}"
          @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateWeatherField('weather_alert_entity', e.detail.value)}"
        ></sf-editor-input>

        ${ALERT_FIELDS.map(({ field, labelKey }) => html`
          <sf-editor-input
            element-id="${field}"
            kind="weather_entity"
            label="${this.getLabel(labelKey)}"
            icon="mdi:state-machine"
            .value="${(config.weather as Record<string, string> | undefined)?.[field] ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateWeatherField(field, e.detail.value)}"
          ></sf-editor-input>
        `)}
      </sf-editor-accordion>
    `;
  }

  /** Tuiles — one accordion per tile (first open, others closed) */
  private _renderTiles(tiles: readonly SciFiHexaTileConfig[]): TemplateResult {
    return html`
      ${tiles.map((tile, i) => this._renderTile(tile, i, tiles.length))}
      <button class="add-btn" @click="${this._addTile}">
        + ${this.getLabel('action-add-tile')}
      </button>
    `;
  }

  private _renderTile(tile: SciFiHexaTileConfig, index: number, total: number): TemplateResult {
    const title = tile.name || tile.entity || tile.entity_kind || `${this.getLabel('section-title-tile')} ${index + 1}`;
    const domainItems = tile.entity_kind ? (this._entitiesByDomain[tile.entity_kind] ?? []) : [];

    return html`
      <sf-editor-accordion
        title="${title}"
        element-id="${index}"
        icon="mdi:hexagon-slice-6"
        ?deletable="${total > 1}"
        ?open="${index === 0}"
        @input-update="${(e: CustomEvent<InputUpdateDetail>) => {
          if (e.detail.type === 'remove' && e.detail.kind === 'accordion') this._removeTile(index);
        }}"
      >
        <!-- ── Entity ──────────────────────────────────── -->
        <section>
          <h1>${this.getSectionTitle('section-title-entity')}</h1>
          <sf-toggle-switch
            .checked="${tile.standalone ?? false}"
            label="${this.getLabel('text-switch-hexa-standalone')}"
            @sf-toggle-change="${(e: CustomEvent<{ checked: boolean }>) => this._updateTileField(index, 'standalone', e.detail.checked)}"
          ></sf-toggle-switch>

          ${tile.standalone
            ? html`
              <sf-editor-dropdown-entity
                element-id="entity"
                kind="entity"
                label="${this.getLabel('section-title-entity')} ${this.getLabel('text-required')}"
                .value="${tile.entity ?? ''}"
                .items="${Object.values(this._entitiesByDomain).flat()}"
                @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'entity', e.detail.value)}"
              ></sf-editor-dropdown-entity>
            `
            : html`
              <sf-editor-dropdown
                element-id="entity_kind"
                kind="entity_kind"
                label="${this.getLabel('input-entity-kind')} ${this.getLabel('text-required')}"
                .value="${tile.entity_kind ?? ''}"
                .items="${ENTITY_KINDS}"
                @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'entity_kind', e.detail.value)}"
              ></sf-editor-dropdown>
              <sf-editor-multi-entity
                element-id="entities_to_exclude"
                kind="entities_to_exclude"
                label="${this.getLabel('input-entities-to-exclude')} ${this.getLabel('text-optional')}"
                .values="${[...(tile.entities_to_exclude ?? [])]}"
                .items="${domainItems}"
                @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileExclude(index, e)}"
              ></sf-editor-multi-entity>
            `}
        </section>

        <!-- ── Appearance ─────────────────────────────── -->
        <section>
          <h1>${this.getSectionTitle('section-title-appearance')}</h1>
          <sf-editor-input
            element-id="name"
            kind="name"
            label="${this.getLabel('input-name')} ${this.getLabel('text-optional')}"
            .value="${tile.name ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'name', e.detail.value)}"
          ></sf-editor-input>
          <sf-editor-dropdown-icon
            element-id="active_icon"
            kind="active_icon"
            label="${this.getLabel('input-active-icon')} ${this.getLabel('text-optional')}"
            .value="${tile.active_icon ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'active_icon', e.detail.value)}"
          ></sf-editor-dropdown-icon>
          <sf-editor-dropdown-icon
            element-id="inactive_icon"
            kind="inactive_icon"
            label="${this.getLabel('input-inactive-icon')} ${this.getLabel('text-optional')}"
            .value="${tile.inactive_icon ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'inactive_icon', e.detail.value)}"
          ></sf-editor-dropdown-icon>
        </section>

        <!-- ── Technical ──────────────────────────────── -->
        <section>
          <h1>${this.getSectionTitle('section-title-technical')}</h1>
          <sf-editor-chips
            element-id="state_on"
            kind="state_on"
            label="${this.getLabel('input-states-on')} ${this.getLabel('text-required')}"
            .values="${[...(tile.state_on ?? [])]}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileStateOn(index, e)}"
          ></sf-editor-chips>
          <sf-editor-input
            element-id="state_error"
            kind="state_error"
            label="${this.getLabel('input-state-error')} ${this.getLabel('text-optional')}"
            icon="mdi:alert-circle"
            .value="${tile.state_error ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'state_error', e.detail.value)}"
          ></sf-editor-input>
          <sf-editor-input
            element-id="link"
            kind="link"
            label="${this.getLabel('input-link')} ${this.getLabel('text-optional')}"
            icon="mdi:link-edit"
            .value="${tile.link ?? ''}"
            @input-update="${(e: CustomEvent<InputUpdateDetail>) => this._updateTileField(index, 'link', e.detail.value)}"
          ></sf-editor-input>
        </section>

        <!-- ── Visibility ─────────────────────────────── -->
        ${this._renderVisibility(tile, index)}
      </sf-editor-accordion>
    `;
  }

  private _renderVisibility(tile: SciFiHexaTileConfig, index: number): TemplateResult {
    if (!this._people.length) return html``;
    return html`
      <section class="visibility-section">
        <h1 class="visibility-header">
          <sf-icon icon="mdi:eye-outline" style="--icon-width:16px;--icon-height:16px;"></sf-icon>
          <span>${this.getLabel('section-title-visibility')}</span>
        </h1>
        <div class="people">
          ${this._people.map(person => {
            const active = tile.visibility?.includes(person.entityId) ?? false;
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
                  icon="${active ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}"
                  style="--btn-icon-color: ${active ? 'var(--secondary-light-color, rgb(102,156,210))' : 'rgba(224,232,255,0.3)'};"
                  @button-click="${() => this._toggleVisibility(index, person.entityId)}"
                ></sf-button>
              </div>
            `;
          })}
        </div>
      </section>
    `;
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiHexaTilesConfig;
    const tiles = config.tiles ?? [];

    return html`
      <div class="card">
        <div class="container">
          ${this._renderHeader(config)}
          ${this._renderWeather(config)}
          ${this._renderTiles(tiles)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-hexa-tiles-editor': SciFiHexaTilesEditor;
  }
}
