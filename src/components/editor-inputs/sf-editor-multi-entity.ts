/**
 * <sf-editor-multi-entity> — Multi-entity chips selector for card editors.
 *
 * Extends SfEditorDropdownEntity. Shows selected entities as chips above input.
 * - 'input-update' with type:'add' on entity select
 * - 'input-update' with type:'remove' on chip X click
 *
 * Spec 10 § sf-editor-multi-entity
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { editorChipsStyles } from '../../styles/editor-inputs-shared.js';
import { SfEditorDropdownEntity, type EditorHassEntity } from './sf-editor-dropdown-entity.js';

@customElement('sf-editor-multi-entity')
export class SfEditorMultiEntity extends SfEditorDropdownEntity {
  /** Currently selected entity IDs — use property binding `.values="${array}"` */
  @property({ attribute: false }) values: string[] = [];

  static override styles: import("lit").CSSResultGroup = [
    SfEditorDropdownEntity.styles,
    editorChipsStyles,
    css`
      .chip {
        padding: 2px 8px 2px 6px;
        max-width: 120px;
      }

      .chip-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chip-delete {
        flex-shrink: 0;
      }
    `,
  ];

  protected override _itemMatchesQuery(item: unknown, query: string): boolean {
    const entity = item as EditorHassEntity;
    if (this.values.includes(entity.entity_id)) return false; // exclude already selected
    return super._itemMatchesQuery(item, query);
  }

  protected override _selectItem(entityId: string): void {
    this._open = false;
    this._filterQuery = '';
    this._dispatch(entityId, 'add');
  }

  private _removeChip(index: number): void {
    this._dispatch(String(index), 'remove');
  }

  private _renderChips(): TemplateResult[] {
    return this.values.map((entityId, i) => html`
      <div class="chip">
        <span class="chip-text">${entityId}</span>
        <button
          class="chip-delete"
          @click="${(e: Event) => { e.stopPropagation(); this._removeChip(i); }}"
        >✕</button>
      </div>
    `);
  }

  override render(): TemplateResult {
    const hasValue = this.values.length > 0;
    return html`
      <div class="container ${this.icon ? 'has-icon' : ''} ${hasValue || this._open ? 'has-value' : ''} ${this._open ? 'open' : ''}">
        ${this.values.length > 0
          ? html`<div class="chips-row">${this._renderChips()}</div>`
          : ''}
        ${this.renderIcon()}
        <div class="input-group">
          <input
            type="text"
            .value="${this._filterQuery}"
            placeholder=" "
            ?disabled="${this.disabled}"
            @focus="${this._onFocus}"
            @blur="${this._onBlur}"
            @input="${this._onInput}"
          />
          <label>${this.label}</label>
        </div>
      </div>
      ${this._renderDropdown()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-multi-entity': SfEditorMultiEntity;
  }
}
