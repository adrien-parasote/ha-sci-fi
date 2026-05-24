/**
 * <sf-editor-accordion> — Collapsible group panel for card editors.
 *
 * Port fidèle du composant JS legacy sci-fi-accordion-card (issue-13).
 * Visual: border bleu-cyan, header gradient dark + uppercase, chevron ❯ rotatif.
 *
 * Dispatches 'input-update' { type:'remove', id: elementId } when delete button clicked.
 *
 * Spec 10 § sf-editor-accordion
 */

import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { InputUpdateDetail } from './sf-editor-input.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';

@customElement('sf-editor-accordion')
export class SfEditorAccordion extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: String }) icon = '';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: 'element-id', type: String }) elementId = 'ac';
  @property({ type: Boolean }) deletable = false;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      /* Legacy CSS variables (with fallbacks for non-HA environments) */
      --_border-color:       var(--secondary-light-color,  rgb(102, 156, 210));
      --_border-color-alpha: var(--secondary-light-alpha-color, rgba(102, 156, 210, 0.5));
      --_color-primary:      var(--primary-light-color,    rgb(105, 211, 251));
      --_font-small:         var(--font-size-small, 12px);
      --_border-radius:      var(--border-radius, 5px);
      --_border-width:       var(--border-width, 1px);
    }

    /* ── Outer wrapper (delete button sits next to the accordion) ────────── */
    .row {
      display: flex;
      flex-direction: row;
      flex: 1;
      gap: 10px;
    }

    /* ── Accordion box ───────────────────────────────────────────────────── */
    .accordion {
      flex: 1;
      border: var(--_border-width) solid var(--_border-color);
      overflow: hidden;
      border-radius: var(--_border-radius);
      width: 100%;
    }

    /* ── Checkbox (hidden, drives open/close via CSS) ────────────────────── */
    .tab {
      position: relative;
    }

    .tab input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      z-index: -1;
    }

    /* ── Content panel ───────────────────────────────────────────────────── */
    .content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s ease;
    }

    .content > div {
      padding: 10px 10px 30px 10px;
      margin: 0;
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }

    .tab input:checked ~ .content {
      max-height: 9999px; /* large enough; fit-content not animatable */
    }

    /* ── Label (clickable header) ────────────────────────────────────────── */
    .label {
      display: flex;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(0, 0, 0, 0.2) 100%
      );
      background-color: var(--_border-color-alpha);
      cursor: pointer;
      justify-content: space-between;
      padding: 10px;
      text-transform: uppercase;
      font-size: var(--_font-small);
      user-select: none;
    }

    .label > .label-left {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      color: var(--_border-color);
    }

    .label:hover > .label-left {
      color: var(--_color-primary);
    }

    /* Chevron via ::after pseudo-element — rotates when checked */
    .label::after {
      content: '❯';
      width: 1em;
      height: 1em;
      text-align: center;
      align-self: center;
      color: var(--_border-color);
      transform: rotate(90deg);
      transition: transform 0.35s ease;
    }

    .tab input:checked + .label::after {
      transform: rotate(270deg);
    }

    .tab input:not(:checked) + .label:hover::after {
      animation: bounce 0.5s infinite;
    }

    /* Icon sizing inside label */
    .label sf-icon {
      --icon-width:  16px;
      --icon-height: 16px;
      --icon-color:  var(--_border-color);
    }

    .label:hover sf-icon {
      --icon-color: var(--_color-primary);
    }

    /* ── Delete button (sits to the right of the accordion box) ─────────── */
    .delete {
      margin-top: 6px;
      display: flex;
      align-items: flex-start;
    }

    /* Target sf-button from within accordion shadow DOM.
       Custom properties set here override sf-button's own :host defaults. */
    .delete sf-button {
      --btn-icon-color: var(--_border-color);
    }

    .delete sf-button:hover {
      --btn-icon-color: var(--error-color, #ff4444);
    }

    @keyframes bounce {
      25%  { transform: rotate(90deg) translate(0.25rem); }
      75%  { transform: rotate(90deg) translate(-0.25rem); }
    }
  `;

  private _onDelete(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<InputUpdateDetail>('input-update', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.elementId,
          kind: 'accordion',
          value: this.elementId,
          type: 'remove',
        },
      })
    );
  }

  override render(): TemplateResult {
    const checkboxId = `accordion-${this.elementId || 'ac'}`;
    return html`
      <div class="row">
        <section class="accordion">
          <div class="tab">
            <input
              type="checkbox"
              name="accordion-1"
              id="${checkboxId}"
              ?checked="${this.open}"
            />
            <label class="label" for="${checkboxId}">
              <div class="label-left">
                ${this.icon
                  ? html`<sf-icon icon="${this.icon}"></sf-icon>`
                  : nothing}
                <div>${this.title}</div>
              </div>
            </label>
            <div class="content">
              <div><slot></slot></div>
            </div>
          </div>
        </section>

        ${this.deletable
          ? html`
            <div class="delete">
              <sf-button
                icon="mdi:delete-outline"
                style="--btn-icon-size: 22px;"
                @button-click="${this._onDelete}"
              ></sf-button>
            </div>
          `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-accordion': SfEditorAccordion;
  }
}
