/**
 * <sf-editor-dropdown> — Filterable dropdown picker for card editors.
 *
 * Extends SfEditorInput. Accepts `items: any[]` via property binding only.
 * Dispatches 'input-update' on item selection (NOT on typing).
 * Typing only filters the visible list — it never dispatches.
 *
 * Spec 10 § sf-editor-dropdown
 */

import { html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SfEditorInput } from './sf-editor-input.js';

@customElement('sf-editor-dropdown')
export class SfEditorDropdown extends SfEditorInput {
  // Use `any[]` to handle both string[] and object[] (HassEntity[], etc.)
  // without TypeScript inheritance conflicts when subclasses override items type.
  @property({ attribute: false }) items: unknown[] = [];
  @property({ attribute: 'disabled-filter', type: Boolean }) disabledFilter = false;

  @state() protected _open = false;
  @state() protected _filterQuery = '';
  protected _filteredItems: unknown[] = [];

  static override styles: CSSResultGroup = [
    SfEditorInput.styles,
    css`
      :host {
        position: relative;
        display: block;
        width: 100%;
      }

      .container {
        cursor: pointer;
      }

      .container::after {
        content: '❯';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%) rotate(90deg);
        font-size: 0.75rem;
        color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
        transition: transform 200ms;
        pointer-events: none;
      }

      .container.open::after {
        transform: translateY(-50%) rotate(270deg);
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: var(--ha-card-background, rgba(15, 20, 35, 0.98));
        border: 1px solid rgba(0, 210, 255, 0.3);
        border-radius: 8px;
        z-index: 100;
        max-height: 240px;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        display: none;
      }

      .dropdown-menu.open {
        display: block;
      }

      .dropdown-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 0.85rem;
        color: var(--primary-text-color, #e0e8ff);
        transition: background 150ms;
      }

      .dropdown-item:hover {
        background: rgba(0, 210, 255, 0.1);
      }

      .dropdown-item .item-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      input {
        padding-right: 24px;
      }
    `,
  ];

  protected _onFocus(): void {
    this._open = true;
    this._filterQuery = '';
    this._updateFilter();
  }

  protected _onBlur(): void {
    // Delay to allow click events inside the dropdown to fire first
    setTimeout(() => {
      this._open = false;
    }, 150);
  }

  protected override _onInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filterQuery = input.value;
    this._updateFilter();
    // CRITICAL: Typing must NOT dispatch input-update — only selection does.
  }

  protected _updateFilter(): void {
    if (this.disabledFilter) {
      this._filteredItems = [...this.items];
      return;
    }
    const q = this._filterQuery.toUpperCase();
    this._filteredItems = this.items.filter(item =>
      this._itemMatchesQuery(item, q)
    );
  }

  protected _itemMatchesQuery(item: unknown, query: string): boolean {
    if (typeof item === 'string') {
      return item.toUpperCase().includes(query);
    }
    return true;
  }

  protected _selectItem(value: string): void {
    this.value = value;
    this._open = false;
    this._filterQuery = '';
    this._dispatch(value);
  }

  protected _renderItem(item: unknown, index: number): TemplateResult {
    const label = typeof item === 'string' ? item : String(item);
    return html`
      <div
        class="dropdown-item"
        data-index="${index}"
        @mousedown="${(e: Event) => { e.preventDefault(); this._selectItem(label); }}"
      >
        <span class="item-name">${label}</span>
      </div>
    `;
  }

  protected _renderDropdown(): TemplateResult | typeof nothing {
    if (!this._open) return nothing;
    this._updateFilter();
    return html`
      <div class="dropdown-menu ${this._open ? 'open' : ''}">
        ${this._filteredItems.map((item, i) => this._renderItem(item, i))}
      </div>
    `;
  }

  override render(): TemplateResult {
    const hasValue = this.value !== '' && this.value !== undefined;
    const displayValue = this._open ? this._filterQuery : this.value;
    return html`
      <div class="container ${this.icon ? 'has-icon' : ''} ${hasValue ? 'has-value' : ''} ${this._open ? 'open' : ''}">
        ${this.renderIcon()}
        <div class="input-group">
          <input
            type="text"
            .value="${displayValue}"
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
    'sf-editor-dropdown': SfEditorDropdown;
  }
}
