/**
 * <sci-fi-tv-editor> — Graphical editor for the sci-fi-tv card.
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { DOMAIN } from '../../types/domains.js';
import { msg } from '@lit/localize';
import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type { SciFiTVConfig, SciFiTVCustomActions } from './config.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-entity.js';
import '../../components/editor-inputs/sf-editor-source-list.js';
import '../../components/editor-inputs/sf-editor-action.js';
import '../../components/editor-inputs/sf-editor-accordion.js';
import { tvButtonLabel, tvLabels, tvSectionIcons } from './labels.js';

/**
 * Remote buttons the user can bind a custom action to — every one of them a
 * button this card actually renders.
 *
 * `enter` was offered here while the card rendered and read `confirm`, so every
 * action bound through this editor was saved and never fired; the card now
 * reads `confirm` with `enter` as an alias, and the selector names `confirm`.
 * `info` is gone: there is no info button to bind, so the selector could only
 * ever write dead config (ha-sci-fi-ecr).
 */
const TV_CUSTOM_ACTION_IDS = [
  'power', 'home', 'menu', 'back',
  'up', 'down', 'left', 'right', 'confirm', 'volume_mute',
] as const satisfies ReadonlyArray<keyof SciFiTVCustomActions>;

@customElement('sci-fi-tv-editor')
export class SciFiTVEditor extends SciFiBaseEditor {
  protected override get cardLabels(): Record<string, string> {
    return tvLabels();
  }

  protected override get cardSectionIcons(): Record<string, string> {
    return tvSectionIcons();
  }

  @state() private _mediaPlayers: EditorHassEntity[] = [];
  @state() private _remotes: EditorHassEntity[] = [];

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._mediaPlayers.length > 0) return;
    const states = Object.values(hass.states);
    
    this._mediaPlayers = states
      .filter(e => e.entity_id.startsWith(`${DOMAIN.MEDIA_PLAYER}.`))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes?.['friendly_name'],
          icon: (e.attributes?.['icon'] as string | undefined) ?? 'mdi:television',
        },
      }));
    
    this._remotes = states
      .filter(e => e.entity_id.startsWith(`${DOMAIN.REMOTE}.`))
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

    // The confirm selector displays `confirm ?? enter`, and `enter` no longer has
    // a selector of its own — so this handler is the ONLY place that can clear a
    // legacy `enter` binding. Without this line, clearing confirm left `enter` in
    // the config and the selector re-displayed it: an unremovable action that
    // came back after being deleted. Writing confirm migrates off `enter` too.
    if (actionId === 'confirm') {
      delete customActions.enter;
    }

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
      return html`<div>${msg('No config')}</div>`;
    }

    return html`
      <div class="card">
        <div class="container">
          <section>
            <h1>${this.getSectionTitle('section-title-tv')}</h1>

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

            ${this._renderSettingsAccordion(config)}
            ${this._renderSourcesAccordion(config)}
            ${this._renderCustomActionsAccordion(config)}

          </section>
        </div>
      </div>
    `;
  }

  private _renderSettingsAccordion(config: SciFiTVConfig): TemplateResult {
    return html`
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
          .label=${this.getLabel('input-volume-entity') + ' ' + this.getLabel('text-optional')}
          icon="mdi:volume-high"
          .value="${config.volume_entity ?? ''}"
          .items="${this._mediaPlayers}"
          @input-update="${this._handleDropdownUpdate}"
        ></sf-editor-dropdown-entity>

        <sf-editor-dropdown-entity
          element-id="app_entity"
          kind="media-player"
          .label=${this.getLabel('input-app-entity') + ' ' + this.getLabel('text-optional')}
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
    `;
  }

  private _renderSourcesAccordion(config: SciFiTVConfig): TemplateResult {
    return html`
      <sf-editor-accordion
        .title=${this.getLabel('section-title-media-sources')}
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
    `;
  }

  private _renderCustomActionsAccordion(config: SciFiTVConfig): TemplateResult {
    return html`
      <sf-editor-accordion
        .title=${this.getLabel('section-title-custom-actions')}
        element-id="custom_actions"
        icon="mdi:remote-tv"
      >
        ${TV_CUSTOM_ACTION_IDS.map(actionId => html`
          <sf-editor-action
            element-id="${actionId}"
            .label=${tvButtonLabel(actionId)}
            .hass="${this.hass}"
            .value="${actionId === 'confirm'
              ? (config.custom_actions?.confirm ?? config.custom_actions?.enter)
              : config.custom_actions?.[actionId]}"
            @input-update="${this._handleActionUpdate}"
          ></sf-editor-action>
        `)}
      </sf-editor-accordion>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-tv-editor': SciFiTVEditor;
  }
}
