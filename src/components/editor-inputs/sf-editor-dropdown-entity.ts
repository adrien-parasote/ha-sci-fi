/**
 * <sf-editor-dropdown-entity> — HA entity picker dropdown for card editors.
 *
 * Extends SfEditorDropdown. Items are HassEntity objects.
 * Renders entity icon + friendly_name + entity_id in each dropdown row.
 *
 * Spec 10 § sf-editor-dropdown-entity
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SfEditorDropdown } from './sf-editor-dropdown.js';
import '../sf-icon/sf-icon.js';

/** Minimal HA entity shape required for entity pickers */
export interface EditorHassEntity {
  entity_id: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
  };
}

@customElement('sf-editor-dropdown-entity')
export class SfEditorDropdownEntity extends SfEditorDropdown {
  // items typed as EditorHassEntity[] — stored in parent as unknown[]
  // Use `.items="${entities}"` (property binding) — never attribute binding

  static override styles: import("lit").CSSResultGroup = [
    SfEditorDropdown.styles,
    css`
      .dropdown-item .entity-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }

      .dropdown-item .entity-name {
        font-size: 0.85rem;
        color: var(--primary-text-color, #e0e8ff);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-item .entity-id {
        font-size: 0.7rem;
        color: var(--secondary-text-color, rgba(224, 232, 255, 0.5));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];

  protected override _itemMatchesQuery(item: unknown, query: string): boolean {
    const entity = item as EditorHassEntity;
    const name = (entity.attributes?.friendly_name ?? '').toUpperCase();
    const id = (entity.entity_id ?? '').toUpperCase();
    return name.includes(query) || id.includes(query);
  }

  protected override _selectItem(value: string): void {
    this.value = value;
    this._open = false;
    this._filterQuery = '';
    this._dispatch(value);
  }

  protected override _renderItem(item: unknown, index: number): TemplateResult {
    const entity = item as EditorHassEntity;
    const icon = entity.attributes?.icon ?? 'mdi:information-off-outline';
    const name = entity.attributes?.friendly_name ?? entity.entity_id;
    return html`
      <div
        class="dropdown-item"
        data-index="${index}"
        @mousedown="${(e: Event) => { e.preventDefault(); this._selectItem(entity.entity_id); }}"
      >
        <sf-icon icon="${icon}" style="--icon-width:18px;--icon-height:18px;flex-shrink:0;"></sf-icon>
        <div class="entity-info">
          <span class="entity-name">${name}</span>
          <span class="entity-id">${entity.entity_id}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-dropdown-entity': SfEditorDropdownEntity;
  }
}
