import { css, html, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { SciFiButton } from './sf-button.js';

@customElement('sf-button-card')
export class SciFiCardButton extends SciFiButton {
  static override get styles() {
    return [
      super.styles,
      css`
      :host {
        --title-text-color: var(--title-color, var(--sf-text-secondary, #b0bec5));
        --label-text-color: var(--label-color, var(--sf-text-primary, #e0e8ff));
        --btn-icon-color: var(--sf-primary-icon-color, var(--sf-primary));
        --btn-icon-size: var(--icon-size, var(--sf-icon-size-sm, 16px));
        --btn-space: var(--btn-padding, 10px);
        --btn-font-weight: var(--font-weight, bold);
        --btn-font-size: var(--font-size, var(--sf-text-sm, 12px));
        --btn-border: var(
          --border,
          var(--sf-border-width, 1px) solid var(--sf-border, rgba(224, 232, 255, 0.1))
        );
        --btn-min-width: var(--min-width, 90px);
        --btn-label-text-alignment: var(--text-align, start);
        --label-alone: var(--margin-top-label-alone, 5px);
      }
      .btn {
        display: flex;
        flex-direction: row;
        font-weight: var(--btn-font-weight);
        border: var(--btn-border);
        border-radius: var(--sf-border-radius, 8px);
        font-size: var(--btn-font-size);
        padding: var(--btn-space);
        align-items: center;
        text-transform: capitalize;
        min-width: var(--btn-min-width);
        justify-content: left;
        column-gap: 10px;
        cursor: pointer;
      }
      .btn.col {
        flex-direction: column;
      }
      .btn:hover {
        background-color: var(--sf-bg-tertiary);
      }
      .btn .label {
        display: flex;
        flex: 1;
        flex-direction: column;
        row-gap: 5px;
        color: var(--label-text-color);
        text-align: var(--btn-label-text-alignment);
      }
      .btn .label div:first-of-type {
        font-size: var(--sf-text-xs, 10px);
        font-weight: normal;
        color: var(--title-text-color);
      }
      .btn .label-alone {
        margin-top: var(--label-alone);
      }
      .btn sf-icon {
        --icon-color: var(--btn-icon-color);
        --icon-width: var(--btn-icon-size);
        --icon-height: var(--btn-icon-size);
      }
    `,
    ] as CSSResultGroup;
  }

  @property({ type: String })
  title = '';

  @property({ type: String })
  text = '';

  @property({ type: Boolean, attribute: 'no-title' })
  noTitle = false;

  override displayBtn(): TemplateResult {
    return html`
      <div class="btn ${this.noTitle ? 'col' : ''}" @click="${this.clickBtn}">
        <sf-icon .icon=${this.icon}></sf-icon>
        ${this.__displayLabel()}
      </div>
    `;
  }

  private __displayLabel(): TemplateResult {
    if (this.noTitle) {
      return html`<div class="label label-alone">${this.text}</div>`;
    }
    return html`<div class="label">
      <div>${this.title}</div>
      <div>${this.text}</div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-button-card': SciFiCardButton;
  }
}
