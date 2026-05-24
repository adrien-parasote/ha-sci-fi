import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';
import './sf-hexa-tile.js';

export interface HexaCell {
  id: string;
  state: string;
  selected: boolean;
  active: string;
  icon: string;
}

@customElement('sf-hexa-row')
export class SciFiHexaRow extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      :host {
        display: flex;
        flex-direction: row;
        column-gap: 5px;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
        flex: 1;
        --row-hexa-width: var(--sf-hexa-row-width, var(--sf-default-hexa-width, 100px));
        --row-selected-hexa-width: var(
          --sf-hexa-row-selected-width,
          var(--sf-selected-hexa-width, 120px)
        );
        --row-icon-width: var(--sf-hexa-row-icon-width, var(--sf-icon-size-md, 24px));
        --row-icon-height: var(
          --sf-hexa-row-icon-height,
          var(--sf-icon-size-md, 24px)
        );
        --row-icon-selected-width: var(
          --sf-hexa-row-icon-selected-width,
          var(--sf-icon-size-lg, 36px)
        );
        --row-icon-selected-height: var(
          --sf-hexa-row-icon-selected-height,
          var(--sf-icon-size-lg, 36px)
        );
        --row-icon-off-color: var(
          --sf-hexa-row-icon-off-color,
          var(--sf-bg-secondary, #1a2235)
        );
      }
      sf-hexa-tile {
        --sf-hexa-width: var(--row-hexa-width);
      }
      sf-hexa-tile.selected {
        --sf-hexa-width: var(--row-selected-hexa-width);
      }
      sf-hexa-tile .item-icon sf-icon {
        --icon-width: var(--row-icon-width);
        --icon-height: var(--row-icon-height);
      }
      sf-hexa-tile .item-icon.off sf-icon {
        --icon-color: var(--row-icon-off-color);
      }
      sf-hexa-tile.selected .item-icon sf-icon {
        --icon-width: var(--row-icon-selected-width);
        --icon-height: var(--row-icon-selected-height);
      }
    `,
  ];

  @property({ type: Array })
  cells: HexaCell[] = [];

  protected override render(): TemplateResult | TemplateResult[] {
    return this.cells.map((cell) => {
      return html`<sf-hexa-tile
        active-tile
        state="${cell.state}"
        class="${cell.selected ? 'selected' : ''}"
        @click="${() => this.__onCellSelect(cell)}"
      >
        <div class="item-icon ${cell.active}">
          <sf-icon .icon=${cell.icon}></sf-icon>
        </div>
      </sf-hexa-tile>`;
    });
  }

  private __onCellSelect(cell: HexaCell): void {
    this.dispatchEvent(
      new CustomEvent('cell-selected', {
        bubbles: true,
        composed: true,
        detail: {
          cell: cell,
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-hexa-row': SciFiHexaRow;
  }
}
