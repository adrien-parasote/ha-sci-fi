import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';
import './buttons/sf-button.js';

export interface WheelItem {
  id: string;
  text: string;
  icon?: string;
}

@customElement('sf-wheel')
export class SciFiWheel extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      :host {
        --item-font-size: var(--item-font-size, var(--sf-text-sm, 12px));
        --item--color: var(--wheel-item-color, var(--sf-text-secondary, #b0bec5));
        --wheel-text-color: var(--text-font-color, var(--sf-text-secondary));
        --wheel-text-size: var(--text-size, var(--sf-text-base, 14px));
        --container-padding: var(--padding, 10px);
        --wheel-border: var(
          --border,
          var(--sf-border-width, 1px) solid var(--sf-border, rgba(224, 232, 255, 0.1))
        );
        --wheel-row-gap: var(--row-gap, 10px);
      }
      .container {
        display: flex;
        flex-direction: column;
        row-gap: var(--wheel-row-gap);
        border: var(--wheel-border);
        border-radius: var(--sf-border-radius, 8px);
        padding: var(--container-padding);
        justify-content: center;
        min-width: 90px;
      }
      .text {
        font-size: var(--wheel-text-size);
        color: var(--wheel-text-color);
        text-align: center;
      }
      .core {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
      .core.inline {
        flex-direction: row;
        justify-content: center;
      }
      .slider {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .slider .slider-item {
        display: flex;
        flex-direction: column;
        font-size: var(--item-font-size);
        color: var(--item--color);
        font-weight: bold;
        align-items: center;
      }
      .slider .slider-item.disabled {
        color: rgba(255, 255, 255, 0.4);
      }
      .slider .slider-item.hide {
        display: none;
      }
      .slider .slider-item sf-icon {
        --icon-color: var(--sf-text-secondary);
        margin-bottom: 5px;
      }
      .slider .slider-item.show sf-icon {
        --icon-color: var(--item--color);
      }
    `,
  ];

  @property({ type: Array })
  items: WheelItem[] = [];

  @property({ type: String, attribute: 'selected-id' })
  selectedId: string | null = null;

  @property({ type: String })
  text: string | null = null;

  @property({ type: Boolean, attribute: 'in-line' })
  inLine = false;

  @property({ type: Boolean })
  disabled = false;

  protected override render(): TemplateResult {
    return html`
      <div class="container">
        <div class="core ${this.inLine ? 'inline' : ''}">
          <sf-button
            class="up"
            icon="mdi:menu-up-outline"
            @button-click=${(e: Event) => this.__click(e, 'up')}
            ?disabled=${this.disabled}
          ></sf-button>
          <div class="slider" @click="${(e: Event) => this.__click(e, null)}">
            ${this.__buildSliderContent()}
          </div>
          <sf-button
            class="down"
            icon="mdi:menu-down-outline"
            @button-click=${(e: Event) => this.__click(e, 'down')}
            ?disabled=${this.disabled}
          ></sf-button>
        </div>
        ${this.__displayText()}
      </div>
    `;
  }

  private __displayText(): TemplateResult | typeof nothing {
    if (!this.text) return nothing;
    return html`<div class="text">${this.text}</div>`;
  }

  private __renderIcon(icon?: string): TemplateResult | typeof nothing {
    if (!icon) return nothing;
    return html`<sf-icon .icon=${icon}></sf-icon>`;
  }

  private __buildSliderContent(): TemplateResult[] {
    return this.items.map(
      (el) => html`
        <div
          class="slider-item ${el.id == this.selectedId
            ? 'show'
            : 'hide'} ${this.disabled ? 'disabled' : ''}"
        >
          ${this.__renderIcon(el.icon)}
          <div>${el.text}</div>
        </div>
      `
    );
  }

  private __findNext(direction: 'up' | 'down' | null): WheelItem | null {
    if (this.items.length === 0) return null;
    let item_idx = this.items.findIndex((e) => e.id == this.selectedId);
    if (direction) {
      if (direction === 'up') {
        item_idx = item_idx + 1 >= this.items.length ? 0 : item_idx + 1;
      } else {
        item_idx = item_idx - 1 < 0 ? this.items.length - 1 : item_idx - 1;
      }
    }
    return this.items[item_idx] || null;
  }

  private __click(e: Event, direction: 'up' | 'down' | null): void {
    e.preventDefault();
    e.stopPropagation();
    const nextItem = this.__findNext(direction);
    if (nextItem) {
      this.dispatchEvent(
        new CustomEvent(direction ? 'wheel-change' : 'wheel-click', {
          bubbles: true,
          composed: true,
          detail: nextItem,
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-wheel': SciFiWheel;
  }
}
