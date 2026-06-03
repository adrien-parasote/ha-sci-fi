import { LitElement, css, html, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './sf-icon/sf-icon.js';

export interface DropdownItem {
  id: string;
  text: string;
  icon?: string;
  color?: string;
}

@customElement('sf-dropdown')
export class SciFiDropdown extends LitElement {
  static override styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      position: relative;
      cursor: pointer;
      user-select: none;
    }
    .trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6));
      font-size: var(--sf-text-sm, 12px);
      transition: color 0.2s;
      text-transform: capitalize;
    }
    .trigger:hover {
      color: var(--sf-accent-on, #00ff9d);
    }
    .trigger sf-icon {
      --icon-width: var(--sf-icon-size-sm, 16px);
      --icon-height: var(--sf-icon-size-sm, 16px);
      --icon-color: currentColor;
    }
    .menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      background-color: var(--sf-bg-primary, #0d1117);
      border: var(--sf-border-width, 1px) solid var(--sf-border, rgba(0, 210, 255, 0.3));
      border-radius: var(--sf-border-radius, 8px);
      min-width: 120px;
      display: flex;
      flex-direction: column;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-5px);
      transition: opacity 0.2s, transform 0.2s;
    }
    .menu.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--sf-text-secondary, rgba(224, 232, 255, 0.6));
      font-size: var(--sf-text-sm, 12px);
      text-transform: capitalize;
      border-bottom: var(--sf-border-width, 1px) solid var(--sf-border-light, rgba(0, 210, 255, 0.1));
      transition: background-color 0.2s, color 0.2s;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item:hover {
      background-color: var(--sf-bg-tertiary, rgba(0, 210, 255, 0.1));
      color: var(--sf-text-primary, #e0e8ff);
    }
    .item sf-icon {
      --icon-width: var(--sf-icon-size-sm, 16px);
      --icon-height: var(--sf-icon-size-sm, 16px);
    }
  `;

  @property({ type: String }) text = '';
  @property({ type: String }) icon = '';
  @property({ type: Array }) items: DropdownItem[] = [];

  @state() private _open = false;

  private _toggleOpen(e: Event) {
    e.stopPropagation();
    this._open = !this._open;
  }

  private _closeMenu = () => {
    this._open = false;
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('click', this._closeMenu);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('click', this._closeMenu);
  }

  private _select(e: Event, item: DropdownItem) {
    e.stopPropagation();
    this._open = false;
    this.dispatchEvent(
      new CustomEvent('dropdown-select', {
        bubbles: true,
        composed: true,
        detail: item,
      })
    );
  }

  protected override render(): TemplateResult {
    return html`
      <div class="trigger" @click="${this._toggleOpen}">
        ${this.icon ? html`<sf-icon .icon="${this.icon}"></sf-icon>` : ''}
        <span>${this.text}</span>
      </div>
      <div class="menu ${this._open ? 'open' : ''}">
        ${this.items.map((item) => {
          const color = item.color || 'inherit';
          return html`
            <div class="item" style="color:${color}" @click="${(e: Event) => this._select(e, item)}">
              ${item.icon ? html`<sf-icon .icon="${item.icon}" style="--icon-color:${color}"></sf-icon>` : ''}
              <span>${item.text}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-dropdown': SciFiDropdown;
  }
}
