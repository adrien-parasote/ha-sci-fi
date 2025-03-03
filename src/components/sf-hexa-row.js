import {LitElement, css, html, nothing} from 'lit';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

class SciFiHexaRow extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          flex-direction: row;
          column-gap: 5px;
          justify-content: center;
          align-items: center;
          margin: 10px 0;
          flex: 1;
          --row-hexa-width: var(--hexa-row-width, var(--default-hexa-width));
          --row-selected-hexa-width: var(
            --hexa-row-selected-width,
            var(--selected-hexa-width)
          );
          --row-icon-width: var(--hexa-row-icon-width, var(--icon-size-title));
          --row-icon-height: var(
            --hexa-row-icon-height,
            var(--icon-size-title)
          );
          --row-icon-selected-width: var(
            --hexa-row-icon-selected-width,
            var(--icon-size-large)
          );
          --row-icon-selected-height: var(
            --hexa-row-icon-selected-height,
            var(--icon-size-large)
          );
          --row-icon-off-color: var(
            --hexa-row-icon-off-color,
            var(--secondary-bg-color)
          );
        }
        sci-fi-hexa-tile {
          --hexa-width: var(--row-hexa-width);
        }
        sci-fi-hexa-tile.selected {
          --hexa-width: var(--row-selected-hexa-width);
        }
        sci-fi-hexa-tile .item-icon sci-fi-icon {
          --icon-width: var(--row-icon-width);
          --icon-height: var(--row-icon-heigh);
        }
        sci-fi-hexa-tile .item-icon.off sci-fi-icon {
          --icon-color: var(--row-icon-off-color);
        }
        sci-fi-hexa-tile.selected .item-icon sci-fi-icon {
          --icon-width: var(--row-icon-selected-width);
          --icon-height: var(--row-icon-selected-height);
        }
      `,
    ];
  }

  static get properties() {
    return {
      cells: {type: Array},
    };
  }

  constructor() {
    super();
    this.cells = this.cells ? this.cells : [];
  }

  render() {
    return this.cells.map((cell) => {
      return html`<sci-fi-hexa-tile
        active-tile
        state="${cell.state}"
        class="${cell.selected ? 'selected' : ''}"
        @click="${(e) => this.__onCellSelect(cell)}"
      >
        <div class="item-icon ${cell.active ? 'on' : 'off'}">
          <sci-fi-icon icon=${cell.icon}></sci-fi-icon>
        </div>
      </sci-fi-hexa-tile>`;
    });
  }

  __onCellSelect(cell) {
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

defineCustomElement('sci-fi-hexa-row', SciFiHexaRow);
