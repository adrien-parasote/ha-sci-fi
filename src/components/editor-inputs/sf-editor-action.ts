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
  `;

  private _onSelectorChanged(e: CustomEvent): void {
    e.stopPropagation();
    this._dispatch(e.detail.value);
  }

  private _onFallbackChanged(e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    try {
      const parsed = textarea.value.trim() ? JSON.parse(textarea.value) : undefined;
      this._fallbackError = '';
      this._dispatch(parsed);
    } catch (err) {
      this._fallbackError = 'Invalid JSON';
    }
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
            `
          : html`
              <textarea
                placeholder="{ &quot;action&quot;: &quot;none&quot; }"
                .value=${this.value ? JSON.stringify(this.value, null, 2) : ''}
                @change=${this._onFallbackChanged}
              ></textarea>
              ${this._fallbackError ? html`<div class="error">${this._fallbackError}</div>` : nothing}
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
