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
import '../../components/editor-inputs/sf-editor-source-list.js';
import '../../components/editor-inputs/sf-editor-action.js';
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

  private _handleSourceListUpdate(e: CustomEvent): void {
    const newConfig = this._getNewConfig<SciFiTVConfig>();
    const sources = e.detail.value; // It receives the whole array from sf-editor-source-list
    (newConfig as any)['sources'] = sources && sources.length > 0 ? sources : undefined;
    this._dispatchChange(newConfig);
  }

  private _handleActionUpdate(e: CustomEvent): void {
    const newConfig = this._getNewConfig<SciFiTVConfig>();
    const actionId = e.detail.id; // 'home', 'menu', etc.
    const actionConfig = e.detail.value;

    const customActions = { ...(newConfig.custom_actions || {}) };
    
    // If the action is empty or undefined, remove it from custom_actions
    if (!actionConfig || Object.keys(actionConfig).length === 0 || actionConfig.action === 'none') {
      delete customActions[actionId as keyof typeof customActions];
    } else {
      customActions[actionId as keyof typeof customActions] = actionConfig;
    }

    if (Object.keys(customActions).length === 0) {
      delete newConfig.custom_actions;
    } else {
      newConfig.custom_actions = customActions;
    }
    
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
              .label=${html`${this.getLabel('input-media-player-entity')} ${this.getLabel('text-required')}`}
              icon="mdi:television"
              .value="${config.entity ?? ''}"
              .items="${this._mediaPlayers}"
              @input-update="${this._handleDropdownUpdate}"
            ></sf-editor-dropdown-entity>

            <!-- Settings Accordion -->
            <sf-editor-accordion
              .title=${this.getLabel('section-title-device-settings')}
              element-id="device_settings"
              icon="mdi:cog"
            >
              <sf-editor-input
                element-id="name"
                kind="spaceship-label"
                .label=${this.getLabel('input-quadrant-name')}
                icon="mdi:cursor-text"
                .value="${config.name ?? ''}"
                @input-update="${this._handleInputUpdate}"
              ></sf-editor-input>

              <sf-editor-dropdown-entity
                element-id="volume_entity"
                kind="media-player"
                label="Entité Volume (Optionnel)"
                icon="mdi:volume-high"
                .value="${config.volume_entity ?? ''}"
                .items="${this._mediaPlayers}"
                @input-update="${this._handleDropdownUpdate}"
              ></sf-editor-dropdown-entity>

              <sf-editor-dropdown-entity
                element-id="app_entity"
                kind="media-player"
                label="Entité Application (Optionnel)"
                icon="mdi:cast"
                .value="${config.app_entity ?? ''}"
                .items="${this._mediaPlayers}"
                @input-update="${this._handleDropdownUpdate}"
              ></sf-editor-dropdown-entity>

              <sf-editor-dropdown-entity
                element-id="remote_entity"
                kind="remote-device"
                .label=${this.getLabel('input-remote-entity') + ' ' + this.getLabel('text-optional')}
                icon="mdi:remote"
                .value="${config.remote_entity ?? ''}"
                .items="${this._remotes}"
                @input-update="${this._handleDropdownUpdate}"
              ></sf-editor-dropdown-entity>
            </sf-editor-accordion>

            <!-- Shortcuts Accordion (Sources) -->
            <sf-editor-accordion
              .title=${this.getSectionTitle('section-title-media-sources') ?? 'Sources'}
              element-id="shortcuts"
              icon="mdi:link-variant"
            >
              <sf-editor-source-list
                element-id="sources"
                .label=${this.getLabel('input-media-sources')}
                .hass="${this.hass}"
                .values="${config.sources ?? []}"
                @input-update="${this._handleSourceListUpdate}"
              ></sf-editor-source-list>
            </sf-editor-accordion>

            <!-- Custom Actions Accordion -->
            <sf-editor-accordion
              title="Actions Personnalisées"
              element-id="custom_actions"
              icon="mdi:remote-tv"
            >
              ${['power', 'home', 'menu', 'back', 'info', 'up', 'down', 'left', 'right', 'enter', 'volume_mute'].map(actionId => html`
                <sf-editor-action
                  element-id="${actionId}"
                  label="Bouton ${actionId}"
                  .hass="${this.hass}"
                  .value="${config.custom_actions?.[actionId as keyof typeof config.custom_actions]}"
                  @input-update="${this._handleActionUpdate}"
                ></sf-editor-action>
              `)}
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
