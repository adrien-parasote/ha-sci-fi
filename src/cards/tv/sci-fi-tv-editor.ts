/**
 * <sci-fi-tv-editor> — Graphical editor for the sci-fi-tv card.
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type { SciFiTVConfig } from '../../types/config.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-chips.js';
import '../../components/editor-inputs/sf-editor-accordion.js';

@customElement('sci-fi-tv-editor')
export class SciFiTVEditor extends SciFiBaseEditor {
  @state() private _mediaPlayers: EditorHassEntity[] = [];
  @state() private _remotes: EditorHassEntity[] = [];

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._mediaPlayers.length > 0) return;
    const states = Object.values(hass.states);
    
    this._mediaPlayers = states
      .filter(e => e.entity_id.startsWith('media_player.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes?.['friendly_name'],
          icon: (e.attributes?.['icon'] as string | undefined) ?? 'mdi:television',
        },
      }));
    
    this._remotes = states
      .filter(e => e.entity_id.startsWith('remote.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes?.['friendly_name'],
          icon: (e.attributes?.['icon'] as string | undefined) ?? 'mdi:remote',
        },
      }));
  }

  private _handleDropdownUpdate(e: CustomEvent): void {
    const field = e.detail.id;
    const val = e.detail.value;
    const newConfig = this._getNewConfig<SciFiTVConfig>();
    (newConfig as any)[field] = val || undefined;
    this._dispatchChange(newConfig);
  }

  private _handleInputUpdate(e: CustomEvent): void {
    const field = e.detail.id;
    const val = e.detail.value;
    const newConfig = this._getNewConfig<SciFiTVConfig>();
    (newConfig as any)[field] = val || undefined;
    this._dispatchChange(newConfig);
  }

  private _handleChipsUpdate(e: CustomEvent): void {
    const newConfig = this._getNewConfig<SciFiTVConfig>();
    const sources = [...(newConfig.sources ?? [])];
    
    if (e.detail.type === 'add') {
      const val = e.detail.value.trim();
      if (val && !sources.includes(val)) {
        sources.push(val);
      }
    } else if (e.detail.type === 'remove') {
      const idx = parseInt(e.detail.value, 10);
      if (!isNaN(idx)) {
        sources.splice(idx, 1);
      }
    }
    
    (newConfig as any)['sources'] = sources.length > 0 ? sources : undefined;
    this._dispatchChange(newConfig);
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiTVConfig;
    if (!config) {
      return html`<div>No config</div>`;
    }

    return html`
      <div class="card">
        <div class="container">
          <section>
            <h1>${this.getSectionTitle('section-title-tv') ?? 'Configuration TV'}</h1>
            
            <!-- Entity selection (Required) -->
            <sf-editor-dropdown-entity
              element-id="entity"
              kind="media-player"
              label="Entité Média Player (requis)"
              icon="mdi:television"
              .value="${config.entity ?? ''}"
              .items="${this._mediaPlayers}"
              @input-update="${this._handleDropdownUpdate}"
            ></sf-editor-dropdown-entity>

            <!-- Settings Accordion -->
            <sf-editor-accordion
              title="Paramètres de l'appareil"
              element-id="device_settings"
              icon="mdi:cog"
            >
              <sf-editor-input
                element-id="name"
                kind="spaceship-label"
                label="Nom du Quadrant"
                icon="mdi:cursor-text"
                .value="${config.name ?? ''}"
                @input-update="${this._handleInputUpdate}"
              ></sf-editor-input>

              <sf-editor-dropdown-entity
                element-id="remote_entity"
                kind="remote-device"
                label="Entité Remote (optionnel)"
                icon="mdi:remote"
                .value="${config.remote_entity ?? ''}"
                .items="${this._remotes}"
                @input-update="${this._handleDropdownUpdate}"
              ></sf-editor-dropdown-entity>
            </sf-editor-accordion>

            <!-- Shortcuts Accordion (Sources) -->
            <sf-editor-accordion
              title="Sources de Média"
              element-id="shortcuts"
              icon="mdi:link-variant"
            >
              <sf-editor-chips
                element-id="sources"
                kind="source-list"
                label="Sources Quick-Select (Entrée pour ajouter)"
                .values="${config.sources ?? []}"
                @input-update="${this._handleChipsUpdate}"
              ></sf-editor-chips>
            </sf-editor-accordion>

          </section>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-tv-editor': SciFiTVEditor;
  }
}
