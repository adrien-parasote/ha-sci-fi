import { LitElement, html, css, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistantExt } from '../../types/ha.js';
import { InputUpdateDetail } from './sf-editor-input.js';
import '../sf-icon/sf-icon.js';
import './sf-editor-input.js';
import './sf-editor-action.js';

@customElement('sf-editor-source-list')
export class SfEditorSourceList extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistantExt;
  @property({ type: String }) label = '';
  @property({ type: Array }) values: any[] = [];
  @property({ attribute: 'element-id', type: String }) elementId = '';

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
      margin-bottom: 12px;
      font-weight: 500;
    }

    .source-item {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      position: relative;
    }

    .delete-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: var(--error-color, #ff4444);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .delete-btn:hover {
      background: rgba(255, 68, 68, 0.1);
    }

    .add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px;
      background: rgba(0, 210, 255, 0.1);
      border: 1px dashed rgba(0, 210, 255, 0.4);
      color: var(--primary-color, #00d2ff);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .add-btn:hover {
      background: rgba(0, 210, 255, 0.2);
      border-color: rgba(0, 210, 255, 0.8);
    }
  `;

  private _dispatch(): void {
    const detail: InputUpdateDetail = {
      id: this.elementId,
      kind: 'source-list',
      value: this.values as any,
    };
    this.dispatchEvent(
      new CustomEvent<InputUpdateDetail>('input-update', {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  private _addSource(): void {
    this.values = [...(this.values || []), { name: 'New Source', action: 'call-service' }];
    this._dispatch();
  }

  private _removeSource(index: number): void {
    const newValues = [...(this.values || [])];
    newValues.splice(index, 1);
    this.values = newValues;
    this._dispatch();
  }

  private _updateSourceName(index: number, newName: string): void {
    const source = this.values[index];
    const newValues = [...this.values];
    if (typeof source === 'string') {
      newValues[index] = { name: newName, action: 'none' };
    } else {
      newValues[index] = { ...source, name: newName };
    }
    this.values = newValues;
    this._dispatch();
  }

  private _updateSourceAction(index: number, newAction: any): void {
    const source = this.values[index];
    const newValues = [...this.values];
    if (typeof source === 'string') {
      newValues[index] = { name: source, ...newAction };
    } else {
      // Omit 'name' from newAction if it has one (it shouldn't), keep existing name
      newValues[index] = { ...newAction, name: source.name };
    }
    this.values = newValues;
    this._dispatch();
  }

  override render(): TemplateResult {
    return html`
      <div class="container">
        <div class="label">${this.label}</div>
        
        ${(this.values || []).map((src, index) => {
          const name = typeof src === 'string' ? src : (src.name || '');
          const actionConfig = typeof src === 'string' ? null : { ...src };
          // Remove name from action config for the ha-selector
          if (actionConfig) delete actionConfig.name;

          return html`
            <div class="source-item">
              <button class="delete-btn" @click=${() => this._removeSource(index)} title="Remove source">
                <sf-icon icon="mdi:delete" style="--icon-width:18px;--icon-height:18px;"></sf-icon>
              </button>
              
              <sf-editor-input
                label="Nom de la source"
                .value=${name}
                @input-update=${(e: CustomEvent) => {
                  e.stopPropagation();
                  this._updateSourceName(index, e.detail.value);
                }}
              ></sf-editor-input>
              
              <sf-editor-action
                label="Action"
                .hass=${this.hass}
                .value=${actionConfig}
                @input-update=${(e: CustomEvent) => {
                  e.stopPropagation();
                  this._updateSourceAction(index, e.detail.value);
                }}
              ></sf-editor-action>
            </div>
          `;
        })}
        
        <button class="add-btn" @click=${this._addSource}>
          <sf-icon icon="mdi:plus" style="--icon-width:18px;--icon-height:18px;"></sf-icon>
          Ajouter une source
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-source-list': SfEditorSourceList;
  }
}
