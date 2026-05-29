import { LitElement, html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../../types/ha.js';
import { InputUpdateDetail } from './sf-editor-input.js';

@customElement('sf-editor-action')
export class SfEditorAction extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistantExt;
  @property({ type: String }) label = '';
  @property({ type: Object }) value?: any;
  @property({ attribute: 'element-id', type: String }) elementId = '';
  
  @state() private _fallbackError = '';

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      margin-bottom: 12px;
    }

    .container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(0, 210, 255, 0.2);
      border-radius: 8px;
      padding: 12px;
      box-sizing: border-box;
      width: 100%;
    }
    
    .label {
      font-size: 0.875rem;
      color: var(--primary-color, #00d2ff);
      margin-bottom: 8px;
      font-weight: 500;
    }

    /* Fallback UI for workbench */
    textarea {
      width: 100%;
      height: 100px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--primary-text-color, #e0e8ff);
      font-family: monospace;
      padding: 8px;
      box-sizing: border-box;
      border-radius: 4px;
    }
    
    .error {
      color: var(--error-color, #ff4444);
      font-size: 0.75rem;
      margin-top: 4px;
    }

    .fallback-ui {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `;

  private _onSelectorChanged(e: CustomEvent): void {
    e.stopPropagation();
    this._dispatch(e.detail.value);
  }

  private _updateFallbackField(field: string, val: string): void {
    const newVal = { ...(this.value || {}) };
    
    if (field === 'action') {
      newVal.action = val || 'none';
    } else if (field === 'service') {
      newVal.service = val;
    } else if (field === 'navigation_path') {
      newVal.navigation_path = val;
    } else if (field === 'data.entity_id') {
      if (!newVal.data) newVal.data = {};
      newVal.data.entity_id = val;
    }
    
    this._dispatch(newVal);
  }

  private _dispatch(value: any): void {
    const detail: InputUpdateDetail = {
      id: this.elementId,
      kind: 'action',
      value,
    };
    this.dispatchEvent(
      new CustomEvent<InputUpdateDetail>('input-update', {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  override render(): TemplateResult {
    const hasHaSelector = customElements.get('ha-selector');
    
    return html`
      <div class="container">
        <div class="label">${this.label}</div>
        
        ${hasHaSelector
          ? html`
              <ha-selector
                .hass=${this.hass}
                .selector=${{ action: {} }}
                .value=${this.value}
                @value-changed=${this._onSelectorChanged}
              ></ha-selector>
            ` : html`
              <div class="fallback-ui">
                <sf-editor-input
                  label="Type d'action (ex: call-service, navigate, none)"
                  .value=${this.value?.action || ''}
                  @input-update=${(e: CustomEvent) => this._updateFallbackField('action', e.detail.value)}
                ></sf-editor-input>
                
                ${this.value?.action === 'call-service' ? html`
                  <sf-editor-input
                    label="Service (ex: media_player.play_media)"
                    .value=${this.value?.service || ''}
                    @input-update=${(e: CustomEvent) => this._updateFallbackField('service', e.detail.value)}
                  ></sf-editor-input>
                  <sf-editor-input
                    label="Entity ID (data.entity_id)"
                    .value=${this.value?.data?.entity_id || ''}
                    @input-update=${(e: CustomEvent) => this._updateFallbackField('data.entity_id', e.detail.value)}
                  ></sf-editor-input>
                ` : nothing}
                
                ${this.value?.action === 'navigate' ? html`
                  <sf-editor-input
                    label="Chemin de navigation"
                    .value=${this.value?.navigation_path || ''}
                    @input-update=${(e: CustomEvent) => this._updateFallbackField('navigation_path', e.detail.value)}
                  ></sf-editor-input>
                ` : nothing}
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-action': SfEditorAction;
  }
}
