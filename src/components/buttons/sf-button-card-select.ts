import { css, html, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SciFiCardButton } from './sf-button-card.js';

export interface ButtonSelectItem {
  id: string;
  text: string;
  icon: string;
  color?: string;
}

@customElement('sf-button-card-select')
export class SciFiCardSelectButton extends SciFiCardButton {
  static override get styles() {
    return [
      super.styles,
      css`
      :host {
        position: relative;
        --border: 1px solid var(--sf-primary, #00d2ff);
        --sf-border-radius: 6px;
      }
      .items.hide {
        display: none;
      }
      .items {
        position: absolute;
        transform: translateY(-100%);
        display: flex;
        background-color: var(--sf-bg-primary);
        flex-direction: column;
        min-height: fit-content;
        border: var(--sf-border-width, 1px) solid var(--sf-bg-secondary);
        border-bottom: none;
        border-top-left-radius: var(--sf-border-radius, 8px);
        border-top-right-radius: var(--sf-border-radius, 8px);
        color: var(--sf-text-secondary);
        font-size: var(--sf-text-sm, 12px);
        cursor: pointer;
        z-index: 10;
      }
      .items.left {
        bottom: 0;
        transform: translateX(-100%);
        border-radius: var(--sf-border-radius, 8px);
        border-bottom: var(--sf-border-width, 1px) solid var(--sf-bg-secondary);
      }
      .items.left.down {
        top: 0;
      }
      .items .item {
        display: flex;
        flex-direction: row;
        column-gap: 5px;
        padding: 5px;
        border-bottom: var(--sf-border-width, 1px) solid var(--sf-bg-secondary);
        min-width: 90px;
        text-transform: capitalize;
        align-items: center;
      }
      .items .item:hover {
        background-color: var(--sf-bg-tertiary);
      }
      .items .item:last-of-type {
        border-bottom: none;
      }
      .items .item sf-icon {
        --icon-width: var(--sf-icon-size-sm, 16px);
        --icon-height: var(--sf-icon-size-sm, 16px);
      }
    `,
    ] as CSSResultGroup;
  }

  @property({ type: Array })
  items: ButtonSelectItem[] = [];

  @property({ type: String })
  position = 'top';

  protected override render(): TemplateResult {
    return html` ${this.displayBtn()} ${this.__displayItems()} `;
  }

  private __displayItems(): TemplateResult {
    return html`
      <div class="items hide ${this.position}">
        ${this.items.map((item, idx) => {
          const color = item.color || 'var(--sf-text-secondary)';
          return html`<div
            class="item"
            style="color:${color}"
            @click="${(e: Event) => this.__select(e, idx)}"
          >
            <sf-icon
              .icon=${item.icon}
              style="--icon-color:${color}"
            ></sf-icon>
            <div>${item.text}</div>
          </div>`;
        })}
      </div>
    `;
  }

  private __select(e: Event, idx: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.clickBtn(e); // Will toggle hide
    this.dispatchEvent(
      new CustomEvent('button-select', {
        bubbles: true,
        composed: true,
        detail: this.items[idx],
      })
    );
  }

  override clickBtn(e?: Event): void {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const itemsEl = this.shadowRoot?.querySelector('.items');
    if (itemsEl) {
      itemsEl.classList.toggle('hide');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-button-card-select': SciFiCardSelectButton;
  }
}
